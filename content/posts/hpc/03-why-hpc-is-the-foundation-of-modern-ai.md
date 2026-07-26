---
title: "Why HPC is the foundation of modern AI"
description: "Why can't you just train a large model on a regular cloud instance? This article builds the answer across three layers — compute density, memory bandwidth, and interconnect latency — and maps each constraint to its HPC solution."
date: 2026-11-15
draft: true
---

Every large language model you have ever used was trained on a high-performance computing cluster. Not a cloud VM. Not a beefy workstation. An HPC cluster. That is not a coincidence — it is a physical necessity. This article explains why, from first principles.

## The scale of the problem

Training a frontier language model involves multiplying enormous matrices billions of times. A model with 70 billion parameters, trained on 2 trillion tokens with a context length of 4096, requires on the order of 10²⁴ floating-point operations. That is one septillion FLOPs.

A single modern GPU delivers roughly 1 petaFLOP/s of FP16 throughput. At that rate, training would take approximately 11.5 days of continuous, perfectly efficient computation. But perfect efficiency does not exist. Real-world GPU utilization during training — called Model FLOP Utilization (MFU) — typically ranges from 30% to 55%. At 40% MFU, that single GPU would need 29 days.

And that is for one GPU. The reason thousands are used is not ambition — it is arithmetic.

## Constraint 1: compute density

A general-purpose cloud instance might have 8 CPU cores and no GPU. Training a 70B parameter model on CPUs is not slow — it is infeasible. The throughput gap between a CPU and a data center GPU for matrix operations is roughly 100x to 500x, depending on precision and operation type.

This is why HPC clusters for AI training are built around GPUs (or TPUs, or custom accelerators). The compute density per node is the first constraint, and it is non-negotiable. You need hardware that can deliver petaFLOPs, not gigaFLOPs.

But compute density alone is not enough. A GPU that cannot be fed data fast enough stalls, and a stalled GPU is wasted money.

## Constraint 2: memory bandwidth

The second constraint is memory bandwidth — the rate at which data can move between memory and the compute units. This is where the GPU memory hierarchy becomes critical.

High Bandwidth Memory (HBM) on modern GPUs delivers 2-3 TB/s of bandwidth. Compare that to DDR5 on a CPU, which delivers roughly 50-100 GB/s. That 30x gap is not a minor advantage — it is why GPUs dominate AI training. The arithmetic intensity of matrix multiplication maps perfectly to the wide memory bus of HBM.

But HBM capacity is limited. A single GPU might have 80 GB of HBM. A 70B parameter model in FP16 requires 140 GB just for the parameters — before accounting for optimizer states, gradients, and activations. The optimizer state alone (for Adam) requires another 280 GB. The total memory footprint for training easily exceeds 500 GB.

This is why model parallelism exists. The model must be split across multiple GPUs — not because you want to, but because it physically does not fit on one. Tensor parallelism splits individual layers across GPUs. Pipeline parallelism splits the model into stages. Both require GPUs to exchange data at every forward and backward pass.

Which brings us to the third constraint.

## Constraint 3: interconnect

When a model is split across GPUs, those GPUs must communicate. The volume and frequency of that communication is staggering. In data-parallel training, every GPU must synchronize its gradients after every backward pass via an all-reduce operation. For a 70B model, that means moving 140 GB of gradient data across the network — every iteration.

On a standard 25 Gbps Ethernet link, transferring 140 GB takes approximately 45 seconds. A single training iteration on a well-configured cluster takes 1-3 seconds. The network would be the bottleneck by a factor of 15x or more.

This is why HPC networking exists. InfiniBand delivers 400 Gbps per port with sub-microsecond latency. EFA on AWS provides similar bandwidth with RDMA-like semantics. NVLink connects GPUs within a node at 900 GB/s. These are not incremental improvements over Ethernet — they are fundamentally different technologies designed for a fundamentally different communication pattern.

The interconnect is often the single most important architectural decision in an AI training cluster. I have seen this firsthand: get it wrong, and your GPUs spend more time waiting for data than computing on it.

## How these constraints interact

The three constraints are not independent — they form a system. Increasing compute density (more GPUs) increases communication volume. Increasing model size increases the memory requirement, which forces more parallelism, which increases communication. Increasing batch size improves compute efficiency but requires more memory and changes the communication pattern. Every knob you turn moves another knob.

The constraints are coupled because the physics is coupled. Data must move from where it is stored to where it is computed, and the results must move back. More compute means more data in motion. More parallelism means more coordination. There is no escaping this — only managing it well.

This is why AI training infrastructure looks like an HPC cluster: it is one. The same architectural patterns that the HPC community developed for climate simulation, molecular dynamics, and computational fluid dynamics apply directly.

Topology-aware job placement ensures that GPUs that communicate frequently are physically close. High-radix fat-tree or dragonfly network topologies minimize hop count and bisection bandwidth bottlenecks. Parallel filesystems like Lustre deliver the sequential read throughput needed to feed training data to thousands of GPUs without I/O stalls. Job schedulers like SLURM manage resource allocation across multi-tenant clusters.

## The convergence

Five years ago, AI infrastructure and HPC infrastructure were treated as separate domains. AI teams used cloud instances with standard networking. HPC teams used on-premises clusters with InfiniBand. The two communities rarely overlapped.

That separation no longer holds. The largest AI training runs today use the same hardware, the same networking, the same schedulers, and the same storage architectures as traditional HPC. The engineers building these systems need the same skills: understanding memory hierarchies, communication patterns, parallel I/O, and system-level performance analysis. The skills are the same because the physics is the same.

The difference is scale — and the margin for error that comes with it. Traditional HPC workloads might use hundreds of nodes. Frontier AI training uses thousands. The margin for architectural error shrinks as scale increases. Inefficiencies tolerable at 64 GPUs become catastrophic at 4,096.

## What this means for you

If you are building AI infrastructure, you are building HPC infrastructure — whether you call it that or not. The sooner you internalize the constraints and patterns of HPC, the better your systems will perform and the less money you will waste. I have watched teams learn this the hard way. The tuition is measured in GPU-hours.

The rest of this series will give you the tools to avoid that tuition. Networking, storage, scheduling, profiling, and cost optimization — all through the lens of real workloads running on real clusters.
