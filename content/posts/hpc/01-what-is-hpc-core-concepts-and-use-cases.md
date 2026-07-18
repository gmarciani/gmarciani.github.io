---
title: "What is HPC? Core concepts and use cases"
description: "A practical introduction to high-performance computing: what makes a system high-performance, how the HPC stack is organized from hardware to application, and the wide landscape of use cases from climate modeling to LLM training."
date: 2024-01-01
draft: true
---

High-performance computing is not a single technology — it is a discipline. It is the practice of designing, building, and operating systems where the gap between what is computationally possible and what is computationally needed is so large that every layer of the stack must be co-designed to close it.

## Defining "high performance"

The term gets thrown around loosely. A system qualifies as HPC when it is designed to solve problems that cannot be solved in a useful timeframe on commodity hardware. The key word is "useful." A weather forecast that takes three days to compute is worthless. A protein folding simulation that runs for a year on a single core is academically interesting but practically useless. HPC exists to compress time.

This compression comes from parallelism. Instead of making one processor faster, you make many processors work together. The engineering required to make it work efficiently is where the entire discipline lives. I have spent years in this space, and the pattern is always the same: the hard part is never the math — it is making the hardware cooperate.

## The HPC stack

An HPC system is organized in layers, and understanding those layers is the first step toward understanding the field.

At the bottom sits the hardware: processors (CPUs, GPUs, or increasingly specialized accelerators), memory (both local and high-bandwidth), storage (parallel filesystems, NVMe, object stores), and the network fabric that connects everything. The fabric is often the most critical and most underestimated component. A cluster with fast GPUs and a slow network is a collection of expensive space heaters.

Above the hardware sits the system software layer. This includes the operating system (almost always Linux), device drivers, fabric libraries like libfabric or UCX, and communication libraries like MPI and NCCL. These libraries abstract the hardware and provide the programming model that application developers use to express parallelism. Get this layer wrong and nothing above it can compensate.

The middleware layer comes next: job schedulers like SLURM, resource managers, container runtimes, monitoring stacks, and cluster management tools. This layer determines how work gets assigned to hardware, how resources are shared among users, and how failures are detected and handled.

Finally, the application layer is where the actual science or engineering happens. This includes simulation codes, training frameworks like PyTorch and JAX, data processing pipelines, and the domain-specific libraries that sit on top of them.

Every layer depends on the layers below it, and a bottleneck at any layer propagates upward. This is why HPC engineering is fundamentally a systems discipline — you cannot optimize one layer in isolation.

## Core concepts

Three concepts form the foundation of HPC thinking.

The first is parallelism. Two main flavors: data parallelism, where the same operation is applied to different chunks of data simultaneously, and task parallelism, where different operations run concurrently. Most real workloads use a combination of both. The degree to which a problem can be parallelized is governed by Amdahl's Law — the speedup from parallelism is limited by the fraction of the workload that must remain serial. A program that is 95% parallelizable will never achieve more than a 20x speedup, no matter how many processors you throw at it.

The second is locality. Moving data is expensive — far more expensive than computing on it. The memory hierarchy (registers, L1 cache, L2 cache, HBM, main memory, network) spans several orders of magnitude in both latency and bandwidth. HPC code is written to keep data as close to the compute units as possible, for as long as possible. GPU programming is fundamentally a memory management exercise. Not a compute exercise. A memory exercise.

The third is communication. In a distributed system, processors must exchange data. The cost of that exchange — measured in latency and bandwidth — determines whether adding more processors helps or hurts. Collective operations like all-reduce, all-gather, and reduce-scatter are the vocabulary of distributed computing, and their efficiency separates a well-designed cluster from a poorly designed one.

## The use case landscape

HPC originated in government and academic research, but its footprint has expanded dramatically.

Climate and weather modeling remains one of the largest consumers of HPC cycles globally. These simulations discretize the atmosphere and ocean into millions of grid cells and solve coupled differential equations at each timestep. The resolution of the grid directly determines forecast accuracy, and higher resolution demands more compute.

Computational fluid dynamics (CFD) is essential in aerospace, automotive, and energy engineering. Simulating airflow over a wing or combustion in a turbine requires solving the Navier-Stokes equations at fine spatial and temporal resolution. A single simulation can consume millions of core-hours.

Molecular dynamics and drug discovery use HPC to simulate atomic interactions. Understanding how a protein folds or how a drug molecule binds to a receptor requires tracking the positions and forces of millions of atoms over nanosecond timescales.

Genomics and bioinformatics process massive sequencing datasets. Aligning billions of short reads against a reference genome, calling variants, and running population-scale analyses all demand parallel I/O and compute.

Financial modeling uses HPC for risk analysis, option pricing, and portfolio optimization. Monte Carlo simulations that price complex derivatives require billions of independent trials, making them embarrassingly parallel and well-suited to GPU acceleration.

And then there is AI. Training large language models is, at its core, an HPC workload. Thousands of GPUs communicating over high-bandwidth fabric, reading training data from parallel filesystems, checkpointing model state to durable storage. The infrastructure that trains a frontier model is indistinguishable from a traditional HPC cluster — because it is one. I have built both, and the skills transfer completely.

## Why this matters now

The convergence of AI and HPC is not a trend — it is a structural shift. The techniques, tools, and architectural patterns that the HPC community developed over decades are directly applicable to the largest and most expensive workloads in the technology industry. Understanding HPC is no longer optional for engineers building AI infrastructure. It is foundational. I believe it is the single most undervalued skill set in the AI industry today.

This series takes you through that foundation, one layer at a time.
