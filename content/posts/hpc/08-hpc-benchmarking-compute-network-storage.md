---
title: "HPC benchmarking: measuring compute, network, and storage performance"
description: "A provider-agnostic guide to the most important HPC benchmarking suites: HPL, HPCG, STREAM, and NAS for compute; OSU micro-benchmarks, iperf3, and NCCL-tests for networking; IOR, mdtest, and fio for storage. Includes a decision flowchart and red-flag diagnostic guide."
date: 2027-02-21
draft: true
---

Before you run a production workload on a cluster, you should know what that cluster is capable of. Benchmarking is not optional — it is how you detect misconfigured hardware, validate network fabric, and establish the baseline you will need when something goes wrong in production. Something will go wrong in production.

## The purpose of benchmarking

Benchmarking serves three distinct purposes, and confusing them leads to wasted effort.

The first purpose is validation. When you provision a new cluster or add new nodes, benchmarks confirm that the hardware is performing as expected. A GPU that delivers 60% of its theoretical FLOPS on day one has a problem — a driver issue, a thermal throttle, a misconfigured memory clock. Catching this before production saves days of debugging later. I have learned this the hard way: the time you skip validation is the time you spend a week chasing a "software bug" that turns out to be a hardware defect.

The second purpose is baselining. Once validated, benchmark results become the reference point for all future performance analysis. When a training job suddenly takes 30% longer, you need to know whether the cluster changed or the code changed. A baseline lets you answer that question in minutes.

The third purpose is comparison. When evaluating instance types, network configurations, or storage options, benchmarks provide objective data. Vendor specifications are theoretical maximums. Benchmarks tell you what you get. The gap between the two is often humbling.

## Compute benchmarks

### HPL (High Performance Linpack)

HPL solves a dense system of linear equations and reports the sustained floating-point throughput in FLOPS. It is the benchmark used to rank systems on the TOP500 list. HPL stresses the compute units and memory bandwidth simultaneously, making it a good indicator of peak achievable performance for dense linear algebra workloads.

Run HPL on every node individually first to identify outliers, then run it across the cluster to validate multi-node performance. A node that delivers significantly fewer FLOPS than its peers has a hardware or configuration problem.

### HPCG (High Performance Conjugate Gradients)

HPCG solves a sparse linear system using a multigrid-preconditioned conjugate gradient method. Unlike HPL, which is compute-bound, HPCG is memory-bound. It stresses the memory subsystem — cache hierarchy, memory bandwidth, and memory latency — in patterns that are more representative of real applications than HPL's dense matrix operations.

HPCG results are typically 2-5% of HPL results on the same hardware. This gap reflects the difference between peak compute throughput and what the memory system can sustain. It is a sobering number — and a more honest measure of what most real applications will see.

### STREAM

STREAM measures sustainable memory bandwidth through four simple operations: copy, scale, add, and triad. It is the simplest and most portable memory bandwidth benchmark. Run it to verify that the memory subsystem is performing at specification. On a CPU node, STREAM should report bandwidth close to the theoretical DDR bandwidth. On a GPU, use a CUDA-adapted version to measure HBM bandwidth.

### NAS Parallel Benchmarks

The NAS Parallel Benchmarks (NPB) are a set of programs derived from computational fluid dynamics applications. They test a range of parallel patterns: embarrassingly parallel (EP), multigrid (MG), conjugate gradient (CG), and Fourier transform (FT). NPB is useful for evaluating how well a cluster handles different communication patterns, not just raw compute.

## Network benchmarks

### OSU Micro-Benchmarks

The OSU suite is the standard for measuring MPI-level network performance. The two most important tests are `osu_latency` (point-to-point latency for varying message sizes) and `osu_bw` (point-to-point bandwidth).

For small messages (less than 4 KB), latency should be in the single-digit microseconds on a high-performance fabric. For large messages (1 MB and above), bandwidth should approach the theoretical link rate. If small-message latency is above 20 microseconds, the fabric is likely misconfigured or the job has fallen back to TCP. This is one of the most common problems on new clusters — everything looks fine until you check the latency numbers and realize RDMA is not engaged.

Run `osu_allreduce` and `osu_allgather` to measure collective performance — this is what matters for distributed training. Compare results across different process counts to understand scaling behavior.

### NCCL-tests

For GPU clusters, nccl-tests measures the performance of NCCL collective operations directly. Run `all_reduce_perf` with the same GPU count and message sizes your training job will use. The bus bandwidth metric accounts for the algorithm's communication pattern and is the right number to compare against theoretical fabric bandwidth. This is the benchmark that matters most for distributed training — if nccl-tests looks good, the network is doing its job.

### iperf3

iperf3 measures raw TCP and UDP throughput between two endpoints. It is useful for validating that the network infrastructure is healthy at the transport layer, independent of MPI or NCCL. If iperf3 shows full bandwidth but OSU benchmarks show poor performance, the problem is in the software stack, not the network.

## Storage benchmarks

### IOR

IOR (Interleaved or Random) is the standard benchmark for parallel filesystem throughput. It measures sequential and random read/write performance across multiple clients writing to a shared filesystem.

Run IOR with parameters that match your workload: the transfer size (how much data each I/O operation moves), the block size (total data per process), and the number of processes. For training data reads, use large sequential transfers. For checkpoint writes, use the checkpoint size as the transfer size.

The most important IOR result is aggregate throughput across all clients. If adding more clients does not increase aggregate throughput, the filesystem is saturated — either the storage servers or the network to the storage servers is the bottleneck. This distinction matters: the fix for a saturated storage server is more servers, the fix for a saturated network is a different network topology.

### mdtest

mdtest measures metadata performance: file creation, stat, and deletion rates. This is critical for workloads with many small files. A parallel filesystem might deliver excellent throughput for large files but terrible performance for creating millions of small files.

Run mdtest with the directory structure and file count that matches your workload. If your training dataset consists of millions of individual image files, mdtest will tell you whether the filesystem can handle the metadata load.

### fio

fio (Flexible I/O Tester) is the Swiss Army knife of storage benchmarking. It supports every I/O pattern, every I/O engine, and every configuration option imaginable. Use it for local NVMe benchmarking, for testing specific I/O patterns that IOR does not cover, and for validating that instance-attached storage meets specifications.

## Red flags

Certain benchmark results indicate specific problems:

- HPL FLOPS significantly below spec on one node: check GPU clocks, thermal throttling, driver version.
- OSU latency above 20 microseconds: likely TCP fallback instead of RDMA/EFA.
- NCCL bus bandwidth below 50% of theoretical: check topology detection, NVLink status, network interface selection.
- IOR throughput flat as clients increase: storage servers saturated, need more OSTs or storage nodes.
- mdtest creation rate below 1,000 ops/sec: metadata server bottleneck, consider distributed metadata or file consolidation.

## When to benchmark

Benchmark when you provision new infrastructure, when you change configuration, when performance degrades unexpectedly, and on a regular schedule as part of cluster health monitoring. The cost of running benchmarks is trivial compared to the cost of running production workloads on a misconfigured cluster. A few hours of benchmarking can save weeks of debugging. That is a trade I take every time.
