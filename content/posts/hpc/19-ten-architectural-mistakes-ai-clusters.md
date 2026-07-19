---
title: "10 architectural mistakes I've seen in AI clusters — and how to fix them"
description: "Opinionated post drawn from real production experience covering the most common and costly architectural errors in AI cluster design: undersized storage bandwidth, wrong filesystem, NUMA blindness, misconfigured NCCL, over-provisioned head nodes, missing health checks, and poor checkpoint discipline."
date: 2027-11-14
draft: true
---

After years of building and operating HPC clusters for AI workloads, the same mistakes appear with remarkable consistency. They are not exotic. They are not the result of carelessness. They are the predictable consequence of applying general-purpose cloud thinking to a domain with very different constraints.

## 1. Undersized storage bandwidth

The most common mistake — and the one I have seen cost the most money. Teams provision storage based on capacity — "we need 10 TB for the dataset" — and ignore throughput. A 10 TB filesystem provisioned at the minimum throughput tier delivers a few hundred MB/s. A thousand GPUs need tens of GB/s of aggregate read throughput to stay fed. The GPUs are starving, and nobody checks the storage metrics to notice.

The fix: size storage by throughput first, capacity second. Calculate the data ingestion rate your training job requires (samples per second × sample size × number of GPUs) and provision a filesystem that can sustain it. For parallel filesystems, this means provisioning enough storage servers or OSTs. The capacity will often be far more than you need for the data itself — you are paying for bandwidth, not bytes.

## 2. Choosing the wrong filesystem

NFS for a 256-GPU training job. S3 as the primary data source without a caching layer. A parallel filesystem for a workload that consists of millions of tiny files. I have seen each of these in production. Each is a mismatch between the filesystem's strengths and the workload's access pattern.

The fix: match the filesystem to the I/O pattern. Sequential large reads at high throughput: parallel filesystem. Many small random reads: local NVMe with prefetching. Long-term storage and archival: object storage. Metadata-heavy workloads: a filesystem with distributed metadata. There is no universal filesystem — only the right one for your workload.

## 3. NUMA blindness

Modern multi-socket servers and GPU nodes have Non-Uniform Memory Access (NUMA) topology. Each GPU is physically closer to certain CPU cores and memory banks than others. A process that runs on CPU cores in NUMA node 0 but accesses a GPU attached to NUMA node 1 pays a latency penalty on every data transfer.

The fix: bind processes to the correct NUMA node. Use `numactl`, SLURM's `--cpu-bind` and `--gpu-bind` flags, or CUDA's `CUDA_VISIBLE_DEVICES` in combination with CPU affinity to ensure that each process runs on the CPU cores closest to its assigned GPU. Verify the topology with `nvidia-smi topo -m` and `numactl --hardware`.

## 4. Misconfigured NCCL

NCCL works out of the box, which is both its strength and its trap. The default configuration will use whatever network interface it finds first — which might be the management network instead of the high-speed fabric. It will detect the GPU topology, but if `CUDA_VISIBLE_DEVICES` is set incorrectly, the detected topology will be wrong. It will select algorithms and channel counts, but they may not be optimal for your specific hardware.

The fix: always set `NCCL_DEBUG=INFO` during initial validation and read the output. Verify that the correct network interface is being used (`NCCL_SOCKET_IFNAME`). Verify that the topology detection matches the physical hardware. Run nccl-tests and compare the bus bandwidth against the theoretical maximum. Do not assume that "it works" means "it works well."

## 5. Over-provisioned head nodes

The head node runs the SLURM controller, serves the shared filesystem mount, and handles user logins. Teams often provision it as a large, expensive instance "just in case." In practice, the SLURM controller is lightweight, and the head node does not need GPUs, large amounts of memory, or high-bandwidth networking.

The fix: provision the head node for its actual workload. A modest CPU instance with enough memory for the SLURM controller database and enough network bandwidth for NFS or filesystem metadata traffic is sufficient. Spend the savings on more compute nodes.

## 6. No GPU health checks

GPUs fail. Memory errors, thermal throttling, NVLink degradation, and driver crashes all happen in production. They happen more often than vendor reliability numbers suggest — at least, that has been my experience. Without health checks, a failed GPU is discovered only when a training job crashes hours into a run — wasting all the GPU time consumed before the failure.

The fix: implement pre-job health checks in the SLURM prolog. Run `nvidia-smi` to verify that all GPUs are visible and reporting normal temperatures. Run a short NCCL test to verify GPU-to-GPU communication. If any check fails, drain the node automatically before the job starts. This adds 30 seconds to job startup and saves hours of wasted compute.

## 7. No network health monitoring

A degraded network link does not cause a job to fail — it causes it to run slowly. This is worse. A failure is visible. A slowdown is silent. A single node with a flaky EFA interface can reduce the all-reduce performance for the entire job by 30% or more, because every collective operation waits for the slowest participant.

The fix: monitor network health continuously. Track NCCL collective performance over time. Run periodic OSU micro-benchmarks between node pairs. Alert on latency or bandwidth anomalies. When a node shows degraded network performance, drain it and investigate before it silently degrades your next training run.

## 8. Poor checkpoint discipline

Checkpointing every 4 hours on a cluster with a mean time between failures of 8 hours means losing an average of 2 hours of training per failure. On a 1,000-GPU cluster at $40,000/hour, that is $80,000 per failure event.

The fix: checkpoint frequently enough that the expected recomputation cost per failure is acceptable. Use asynchronous checkpointing to minimize the overhead. Validate that checkpoints can be loaded and that training resumes correctly — a corrupt checkpoint is worse than no checkpoint. Implement a retention policy to manage storage costs.

## 9. Cross-availability-zone placement

Placing training nodes in different availability zones provides higher availability but introduces cross-AZ network latency and data transfer costs. For tightly coupled training workloads that perform all-reduce every iteration, the latency penalty is devastating and the data transfer costs are enormous.

The fix: place all nodes for a tightly coupled training job in the same availability zone, ideally in the same placement group. Accept the reduced availability — a training job that runs 30% slower due to cross-AZ latency is more expensive than one that occasionally needs restarting due to an AZ-level event. The math is unambiguous. Run the numbers for your workload and you will reach the same conclusion.

## 10. Ignoring data pipeline throughput

The data pipeline — loading samples from storage, preprocessing them, and transferring them to GPU memory — is often the forgotten bottleneck. Teams optimize the model, tune NCCL, and profile GPU kernels, but never measure whether the data pipeline can keep up. This is baffling, because it is the easiest bottleneck to diagnose and one of the cheapest to fix.

The fix: profile the data pipeline independently. Measure the throughput of the data loader with the GPU training loop disabled. If the data loader cannot produce batches faster than the GPU consumes them, the GPUs will stall. Common fixes include more data loader workers, prefetching, moving the dataset to faster storage, or preprocessing the data into a more efficient format (WebDataset, TFRecord, or memory-mapped arrays).

## The pattern

These ten mistakes share a common root cause: treating an AI training cluster like a general-purpose cloud deployment. General-purpose thinking optimizes for flexibility, cost per GB, and operational simplicity. HPC thinking optimizes for throughput, latency, and end-to-end system performance. The mistakes disappear when you adopt the HPC mindset — measure everything, size for throughput, treat the cluster as a single system rather than a collection of independent instances. That shift in thinking is harder than any individual fix on this list.
