---
title: "GPU memory hierarchy for AI workloads: HBM, L2, and SRAM"
description: "The GPU memory hierarchy from the programmer's perspective: HBM bandwidth and capacity, L2 cache behavior, shared memory (SRAM) in CUDA, and roofline model implications for AI kernels — showing how memory awareness directly affects attention, matmul, and all-reduce performance."
date: 2024-08-15
draft: true
---

GPU performance is a memory problem as much as a compute problem. The roofline model tells you whether your kernel is compute-bound or memory-bound, but only if you understand the hierarchy it is rooflined against. This is one of the most underappreciated topics in AI infrastructure — teams buy the fastest GPUs and then write kernels that starve them of data.

## The hierarchy at a glance

A modern data center GPU has four levels of memory, each with dramatically different capacity, bandwidth, and latency characteristics.

At the top sits the register file — the fastest storage on the chip. Each streaming multiprocessor (SM) has a large register file (256 KB on modern architectures), and register access is essentially free in terms of latency. But registers are private to each thread and cannot be shared.

Below registers sits shared memory, also called SRAM. This is an on-chip scratchpad that is shared among all threads in a thread block. On current GPUs, each SM has up to 228 KB of configurable shared memory. Access latency is roughly 20-30 cycles — much faster than off-chip memory but not free. Shared memory is the programmer's primary tool for data reuse within a thread block.

The L2 cache sits between the SMs and HBM. It is shared across all SMs on the chip, with a capacity of 50-60 MB on current architectures. The L2 is hardware-managed — the programmer does not explicitly control what is cached, though access patterns strongly influence hit rates. L2 bandwidth is several terabytes per second, significantly higher than HBM.

At the bottom sits High Bandwidth Memory (HBM). This is the GPU's main memory — 80 GB on current data center GPUs, with bandwidth of 2-3.35 TB/s depending on the generation. HBM is where model parameters, activations, and optimizer states live. Every byte that the compute units process must ultimately come from HBM unless it is reused from a higher level of the hierarchy.

## The bandwidth gap

The numbers tell the story. A modern GPU delivers roughly 1,000 TFLOPS of FP16 compute throughput. To keep those compute units fed, you need to deliver operands at a rate that matches. For a matrix multiplication where each element is used multiple times, the arithmetic intensity (FLOPs per byte) is high enough that HBM bandwidth is sufficient. But for element-wise operations — activation functions, layer normalization, dropout — each byte is read once, used for one or two operations, and written back. The arithmetic intensity is close to 1, and HBM bandwidth becomes the bottleneck.

This is why the roofline model matters. It plots kernel performance against arithmetic intensity, with two ceilings: the compute ceiling (peak TFLOPS) and the memory ceiling (peak bandwidth × arithmetic intensity). Kernels to the left of the ridge point are memory-bound. Kernels to the right are compute-bound. Most AI kernels — especially in the forward pass of a transformer — are memory-bound. This is the single most important fact in GPU performance engineering for AI. It surprises people who assume that more TFLOPS automatically means faster training.

## HBM: the capacity constraint

HBM capacity determines what fits on a single GPU. A 70B parameter model in FP16 requires 140 GB just for the parameters. Add optimizer states (280 GB for Adam), gradients (140 GB), and activations (variable, but often tens of GB), and the total exceeds 500 GB. This is why model parallelism exists — the model physically does not fit on one GPU.

HBM bandwidth determines how fast data can move to the compute units. At 3.35 TB/s (H100 SXM), reading the entire 140 GB of model parameters takes about 42 milliseconds. For a training iteration that takes 1-3 seconds, this seems fast. But the parameters are read multiple times during the forward and backward passes, and they compete with activation reads and writes for the same bandwidth. The effective bandwidth available to any single operation is a fraction of the peak.

## L2 cache: the invisible accelerator

The L2 cache is hardware-managed, which means the programmer cannot explicitly load data into it. But access patterns determine hit rates, and hit rates determine effective bandwidth.

For operations that access the same data repeatedly — such as reading the same weight matrix across multiple tokens in a batch — the L2 can provide significant bandwidth amplification. If a 50 MB weight matrix fits in the L2, subsequent accesses hit the cache instead of going to HBM, effectively multiplying the available bandwidth.

The problem is that the L2 is shared across all SMs. In a large training job, dozens of kernels are competing for L2 space. Thrashing — where data is evicted before it can be reused — is common. The L2 hit rate for a given kernel depends not just on that kernel's access pattern but on what every other kernel on the chip is doing. This makes L2 behavior hard to reason about in isolation — and easy to get wrong.

Monitoring L2 hit rates with Nsight Compute is essential for understanding whether your kernels are benefiting from the cache. A kernel with a 90% L2 hit rate is effectively operating at much higher bandwidth than one with a 20% hit rate, even though both are running on the same hardware.

## Shared memory: the programmer's lever

Shared memory is the one level of the hierarchy that the programmer controls directly. In CUDA, you allocate shared memory per thread block and explicitly load data into it, operate on it, and write results back to global memory.

The classic use case is tiled matrix multiplication. Instead of each thread reading its operands directly from HBM, a tile of the input matrices is cooperatively loaded into shared memory by all threads in the block. Each thread then reads from shared memory — which is 10-20x faster than HBM — for the actual computation. The tile is reused many times before the next tile is loaded.

This pattern — load a tile into shared memory, compute on it, load the next tile — is the foundation of high-performance GPU kernels. cuBLAS, cuDNN, and FlashAttention all use it extensively.

The trade-off is that shared memory is limited. At 228 KB per SM, the tile size is constrained. Larger tiles mean more data reuse but fewer thread blocks can run concurrently on each SM (because they compete for shared memory). This tension between tile size and occupancy is one of the central optimization challenges in GPU kernel design.

## Implications for AI kernels

### Matrix multiplication (GEMM)

GEMM is the most important operation in deep learning, and it is where the memory hierarchy matters most. A well-optimized GEMM achieves high arithmetic intensity by tiling the computation and reusing data from shared memory. cuBLAS achieves 70-80% of peak TFLOPS for large matrices because the tiling strategy is carefully tuned to the memory hierarchy.

For small matrices — which appear in the attention mechanism and in the MLP layers for small batch sizes — the arithmetic intensity drops and the kernel becomes memory-bound. This is why batching matters: larger batch sizes increase the matrix dimensions, which increases arithmetic intensity, which moves the kernel from memory-bound to compute-bound.

### Attention

Self-attention is notoriously memory-hungry. The standard implementation materializes the full attention matrix (sequence length × sequence length), which requires O(n²) memory and O(n²) HBM reads and writes. For long sequences, this dominates both memory consumption and runtime.

FlashAttention solves this by restructuring the computation to work in tiles that fit in shared memory. Instead of materializing the full attention matrix in HBM, it computes attention one tile at a time, keeping intermediate results in SRAM. The result is the same, but the HBM traffic is reduced from O(n²) to O(n), which translates to a 2-4x speedup for typical sequence lengths.

This is the memory hierarchy in action: the same mathematical operation, restructured to use fast memory instead of slow memory, runs dramatically faster. FlashAttention is one of the most important practical contributions to AI systems engineering in recent years — not because the math is novel, but because it takes the hardware seriously.

### All-reduce

Collective communication operations like all-reduce are pure data movement — there is minimal computation. The performance is entirely determined by the bandwidth of the communication path: NVLink between GPUs on the same node, and the network fabric between nodes.

Within a node, NCCL uses GPU shared memory and NVLink to implement all-reduce with minimal HBM traffic. The data flows directly between GPUs through NVLink without being staged in HBM. Between nodes, the data must traverse HBM to reach the network interface, making HBM bandwidth a factor in inter-node communication performance.

## The roofline in practice

Profile your kernels with Nsight Compute and plot them on the roofline. Kernels below the memory ceiling have room for improvement through better memory access patterns — coalescing, alignment, and cache-friendly access order. Kernels below the compute ceiling have room for improvement through higher occupancy or better instruction-level parallelism.

Most AI training kernels cluster near the memory ceiling. Memory hierarchy optimization — FlashAttention, operator fusion, mixed precision — delivers larger speedups than compute optimization for typical training workloads. Understanding the hierarchy is not academic. It is the foundation of practical GPU performance engineering. The GPU is not a black box — it is a memory system with a compute engine attached.
