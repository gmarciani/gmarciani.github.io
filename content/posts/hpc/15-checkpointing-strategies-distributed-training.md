---
title: "Checkpointing strategies for long-running distributed training"
description: "The full checkpointing design space: frequency trade-offs, synchronous vs. asynchronous strategies, full vs. incremental snapshots, and storage target selection — with working PyTorch DDP and FSDP examples against FSx for Lustre and measured overhead at different intervals."
date: 2024-08-01
draft: true
---

A training job that runs for days without checkpointing is not a training job — it is a gamble. I have seen that gamble lose. When a node fails at hour 47 of a 48-hour run, the question is not whether you wish you had checkpointed — it is whether you designed your checkpointing strategy to make the overhead worthwhile.

## What a checkpoint contains

A training checkpoint captures everything needed to resume training from the exact point where it was saved. For a typical PyTorch distributed training job, that includes:

The model state dict — all learnable parameters. For a 70B parameter model in FP16, this is approximately 140 GB. The optimizer state — for Adam, this includes first and second moment estimates for every parameter, roughly 2x the model size, so another 280 GB. The learning rate scheduler state. The current epoch and step count. The random number generator states for every GPU, which ensure that data augmentation and dropout are reproducible. And optionally, the data loader state — which samples have been seen in the current epoch.

The total checkpoint size for a large model easily exceeds 500 GB. Writing that to storage takes time, and that time is time the GPUs are not training.

## The frequency trade-off

Checkpointing more frequently reduces the amount of work lost when a failure occurs. Checkpointing less frequently reduces the overhead of writing checkpoints. The optimal frequency depends on two numbers: the cost of lost training time and the cost of checkpoint I/O.

Consider a 1,000-GPU training run at $40,000 per hour of GPU time. If the mean time between failures is 8 hours, and each failure loses half the interval since the last checkpoint on average, then:

- Checkpointing every 2 hours: average loss per failure = 1 hour = $40,000
- Checkpointing every 30 minutes: average loss per failure = 15 minutes = $10,000
- Checkpointing every 10 minutes: average loss per failure = 5 minutes = $3,333

The savings from more frequent checkpointing are substantial. But each checkpoint has a cost too — if writing a checkpoint takes 5 minutes and blocks training, checkpointing every 10 minutes means spending 33% of your time on I/O. That is unacceptable. You are paying for GPUs to write to disk.

The solution is to make checkpointing faster, or to make it non-blocking. Ideally, both.

## Synchronous checkpointing

The simplest approach: all ranks pause training, write their portion of the checkpoint to shared storage, and resume when all writes are complete.

```python
if step % checkpoint_interval == 0:
    torch.save({
        'model': model.state_dict(),
        'optimizer': optimizer.state_dict(),
        'step': step,
        'rng_state': torch.cuda.get_rng_state(),
    }, f'/fsx/checkpoints/step_{step}/rank_{rank}.pt')
    dist.barrier()
```

The overhead is the time to serialize the tensors and write them to storage. On a parallel filesystem like FSx for Lustre provisioned for high throughput, writing 500 GB from 125 nodes takes roughly 30-60 seconds if the filesystem has sufficient aggregate bandwidth. On slower storage, it can take minutes.

The advantage of synchronous checkpointing is simplicity. The training loop is paused, so there is no risk of writing inconsistent state. The disadvantage is that every GPU is idle during the write.

## Asynchronous checkpointing

Asynchronous checkpointing copies the model and optimizer state to CPU memory (or a staging buffer), then writes to storage in a background thread while training continues on the GPU.

```python
import threading

def async_save(state_dict, path):
    torch.save(state_dict, path)

if step % checkpoint_interval == 0:
    # Copy to CPU (fast, but requires pinned memory)
    cpu_state = {k: v.cpu() for k, v in model.state_dict().items()}
    thread = threading.Thread(target=async_save, args=(cpu_state, path))
    thread.start()
```

The GPU-to-CPU copy is fast (a few seconds for large models with pinned memory). The storage write happens in the background without blocking training. The overhead on the training loop is reduced to just the copy time.

The complexity is managing the background writes. You must ensure that the previous checkpoint write has completed before starting a new one. You must handle the case where a failure occurs during a background write — the partially written checkpoint is corrupt and must be discarded. You must ensure that CPU memory is sufficient to hold the checkpoint state alongside the data loading pipeline. These are not hypothetical concerns — I have seen each of them cause data loss in production.

PyTorch's `torch.distributed.checkpoint` module (DCP) provides built-in support for asynchronous checkpointing with these concerns handled correctly.

## Full vs. incremental checkpoints

A full checkpoint writes the entire model and optimizer state every time. An incremental checkpoint writes only the parameters that have changed since the last checkpoint.

For most training workloads, every parameter changes at every step (because the optimizer updates every parameter). Incremental checkpointing is therefore not useful for the model state. However, it can be useful for the optimizer state in specific scenarios — for example, when using sparse optimizers where only a subset of moment estimates change per step.

In practice, full checkpoints are the standard approach. The complexity of tracking and applying incremental changes rarely justifies the savings. This may change as models grow larger and checkpoint sizes push into the multi-terabyte range — but for now, full checkpoints win on simplicity.

## Sharded checkpointing

When using Fully Sharded Data Parallel (FSDP) or ZeRO-3, each rank holds only a shard of the model and optimizer state. Each rank can write its shard independently, without gathering the full state on any single rank.

```python
from torch.distributed.checkpoint import save
save(model.state_dict(), checkpoint_id=f'/fsx/checkpoints/step_{step}')
```

Sharded checkpointing has two advantages. First, no single rank needs enough memory to hold the full model state — each rank writes only its shard. Second, the writes are distributed across all ranks and all storage servers, maximizing aggregate I/O throughput.

The disadvantage is that loading a sharded checkpoint requires the same number of ranks and the same sharding configuration. If you want to load the checkpoint with a different parallelism degree (for example, for inference on fewer GPUs), you need a resharding step.

## Storage target selection

The choice of storage target directly determines checkpoint write speed.

A parallel filesystem (FSx for Lustre, GPFS) is the standard choice for checkpointing. It provides shared access from all nodes, high aggregate throughput, and POSIX semantics. Provision the filesystem with enough throughput to handle the burst write pattern — all nodes writing simultaneously during a checkpoint.

Local NVMe is the fastest option for the initial write. Each rank writes to its local disk, and a background process copies the checkpoint to durable shared storage. This two-stage approach minimizes the training pause but adds complexity and a window of vulnerability — if a node fails before the copy completes, the checkpoint is lost.

Object storage (S3) is suitable for archival copies of checkpoints but not for the primary checkpoint target. The latency of individual PUT operations and the lack of POSIX semantics make it too slow for the synchronous write path.

## Checkpoint management

A training run that checkpoints every 30 minutes for 14 days produces 672 checkpoints. At 500 GB each, that is 336 TB of storage. You cannot keep them all. You should not want to.

Implement a retention policy: keep the last N checkpoints on the fast filesystem, and archive milestone checkpoints (every few hours or at specific loss thresholds) to object storage. Delete intermediate checkpoints automatically. The retention policy should be part of the training script, not an afterthought — because it always becomes an afterthought if you let it.

## The discipline

Checkpointing is not a feature — it is a discipline. Design the strategy before the training run starts. Measure the overhead. Validate that checkpoints can be loaded and that training resumes correctly. Test the failure recovery path end to end — not once, but regularly. The cost of getting checkpointing wrong is measured in lost GPU-days and missed deadlines. I have never regretted over-investing in checkpoint validation. I have regretted the opposite.
