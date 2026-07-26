---
title: "Profiling multi-node training jobs with NVIDIA Nsight"
description: "A step-by-step guide to profiling distributed training jobs using NVIDIA Nsight Systems and Nsight Compute: timeline analysis, kernel occupancy, communication-computation overlap, identifying stragglers across nodes, and translating profiling output into concrete optimization actions."
date: 2027-03-07
draft: true
---

You cannot optimize what you cannot measure. For multi-node GPU training jobs, the gap between assumed and actual performance is almost always larger than expected — and the root cause is almost never where you think it is. I have spent enough hours staring at Nsight timelines to know: intuition about GPU performance is unreliable. Data is not.

## Two tools, two purposes

NVIDIA provides two profiling tools, and they serve different purposes.

Nsight Systems is a system-wide profiler. It captures a timeline of everything happening on the system: CUDA kernel launches, memory transfers, NCCL communication, CPU activity, and the interactions between them. It answers the question "where is time being spent?" and, more importantly, "where is time being wasted?" In my experience, the answer to the second question is always surprising.

Nsight Compute is a kernel-level profiler. It captures detailed performance counters for individual CUDA kernels: occupancy, memory throughput, instruction mix, warp stall reasons. It answers the question "why is this specific kernel slow?"

The workflow is always the same: use Nsight Systems first to identify which parts of the training iteration are taking too long, then use Nsight Compute to understand why specific kernels underperform.

## Capturing a Nsight Systems profile

For a distributed training job, you typically profile a small number of iterations — enough to capture the steady-state behavior without generating an unmanageably large trace file.

```bash
nsys profile \
  --trace=cuda,nvtx,osrt,cudnn,cublas \
  --duration=60 \
  --output=profile_rank_%q{SLURM_PROCID} \
  python train.py --epochs 1 --steps 20
```

The `--trace` flag selects which APIs to instrument. Including CUDA, NVTX (for user-defined annotations), and the cuDNN/cuBLAS libraries gives you visibility into both the framework-level operations and the underlying GPU kernels.

For multi-node jobs, launch the profiler on every rank but consider collecting detailed traces from only a few representative ranks to keep file sizes manageable. A full trace from 8 GPUs over 60 seconds can easily exceed 10 GB.

## Reading the timeline

The Nsight Systems GUI displays a horizontal timeline with rows for each CPU thread, each CUDA stream, and each GPU. The most important things to look for:

### Gaps between kernels

Gaps in the CUDA kernel timeline mean the GPU is idle. The GPU has finished one kernel and is waiting for the next one to be launched. This is where money evaporates. Common causes include CPU-side data preprocessing that blocks the training loop, Python GIL contention, or insufficient operator fusion in the model.

### Communication blocking computation

In a well-optimized training job, NCCL communication (gradient all-reduce) overlaps with the backward pass computation. On the timeline, you should see NCCL kernels running on one CUDA stream while backward-pass kernels run on another. If the NCCL operations appear as a serial block after the backward pass, the overlap is not working — either the framework is not bucketing gradients correctly, or the CUDA streams are serialized.

### Straggler ranks

In a multi-node job, all ranks must synchronize at every collective operation. If one rank is consistently slower than the others, every rank waits for it. One slow node drags down the entire cluster. Compare timelines across ranks to identify stragglers. Common causes include thermal throttling on one node, an imbalanced data loader, or a network path with higher latency.

### Data loading stalls

If the GPU timeline shows periodic gaps that correlate with data loading activity on the CPU timeline, the data pipeline is the bottleneck. The GPU finishes processing a batch and then waits for the next batch to be loaded and transferred. The fix is usually more data loader workers, prefetching, or faster storage.

## Using NVTX annotations

NVTX (NVIDIA Tools Extension) allows you to add custom markers and ranges to the profile. This is invaluable for understanding framework-level behavior.

```python
import torch.cuda.nvtx as nvtx

nvtx.range_push("forward_pass")
output = model(input)
nvtx.range_pop()

nvtx.range_push("backward_pass")
loss.backward()
nvtx.range_pop()
```

These annotations appear as colored ranges on the Nsight Systems timeline, making it immediately clear which phase of the training iteration each kernel belongs to. Without annotations, you are staring at thousands of anonymous kernel launches trying to guess which ones correspond to the forward pass, backward pass, and optimizer step. I cannot overstate how much time good annotations save — they turn a wall of noise into a readable story.

## Kernel-level profiling with Nsight Compute

Once Nsight Systems identifies a slow kernel, Nsight Compute tells you why. It captures hardware performance counters that reveal the kernel's bottleneck.

```bash
ncu --target-processes all \
    --kernel-name "volta_sgemm" \
    --launch-count 5 \
    python train.py --steps 5
```

The key metrics to examine:

Occupancy measures how many warps are active relative to the maximum the GPU supports. Low occupancy means the kernel is not using the GPU's parallelism effectively. Common causes are excessive register usage or shared memory allocation per thread block.

Memory throughput shows how much of the available memory bandwidth the kernel is using. A kernel that achieves only 30% of HBM bandwidth is likely suffering from uncoalesced memory accesses or poor cache utilization.

Compute throughput shows how much of the available compute capacity is being used. If both memory and compute throughput are low, the kernel is likely latency-bound — stalling on dependencies or synchronization.

The roofline model, which Nsight Compute can generate automatically, plots the kernel's arithmetic intensity against the hardware's compute and memory ceilings. This immediately tells you whether the kernel is compute-bound or memory-bound, and how far it is from the theoretical maximum. The roofline does not lie — it shows you where the ceiling is and how much headroom remains.

## Common findings and fixes

Profiling distributed training jobs reveals a consistent set of patterns.

The most common finding is insufficient communication-computation overlap. The fix is to ensure that the training framework uses gradient bucketing and asynchronous all-reduce. In PyTorch DDP, this is enabled by default, but custom training loops may not implement it correctly. DDP's default behavior is optimized for the common case — the moment you deviate from the standard pattern, the overlap breaks silently.

The second most common finding is data loading bottlenecks. The fix is to increase the number of data loader workers, enable prefetching, or move the dataset to faster storage (local NVMe or a parallel filesystem).

The third most common finding is kernel launch overhead. When the model consists of many small operations, the CPU spends more time launching kernels than the GPU spends executing them. The fix is operator fusion — combining multiple small operations into fewer large kernels. PyTorch's `torch.compile` and CUDA Graphs both address this.

The fourth finding is memory-bound kernels in the attention mechanism. Self-attention involves multiple memory-intensive operations (softmax, dropout, matrix multiplications with non-square shapes) that underutilize compute. FlashAttention and similar fused attention implementations address this by restructuring the computation to minimize HBM reads and writes. The performance difference is not incremental — it is often 2-3x for the attention portion of the forward pass.

## Making profiling a habit

Profiling should not be a one-time activity. Profile when you change the model architecture, when you change the parallelism strategy, when you scale to more nodes, and when performance degrades unexpectedly. The cost of profiling — a few minutes of cluster time and an hour of analysis — is negligible compared to the cost of running an unoptimized training job for days. Make it a habit. Make it part of the workflow. The engineers who profile regularly are the ones who ship on time.
