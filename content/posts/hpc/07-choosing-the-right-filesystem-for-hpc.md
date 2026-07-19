---
title: "Choosing the right filesystem for HPC: a workload-driven comparison"
description: "A practical comparison of HPC filesystem options — parallel filesystems, shared network filesystems, object storage tiers, and local NVMe — evaluated across throughput, metadata performance, latency, cost, and operational complexity, with a decision framework by workload type."
date: 2026-12-27
draft: true
---

Picking the wrong filesystem for an HPC workload is one of the most common and most expensive mistakes in cluster design. I have seen teams spend weeks debugging "slow training" only to discover that their GPUs were starving for data. The choice directly determines whether your jobs are compute-bound or I/O-bound — and the wrong answer costs real money every hour it goes undetected.

## Why the filesystem matters

A GPU that is waiting for data is a GPU burning money. In a distributed training job, the data pipeline must deliver training samples to every GPU at a rate that keeps the compute units saturated. If the filesystem cannot sustain that throughput, the GPUs stall. The GPU does not care why it has no data — it sits idle at $30+ per hour.

In a traditional HPC simulation, checkpoint writes must complete fast enough that they do not dominate the job's wall-clock time. If the filesystem is slow, checkpointing becomes a tax that discourages engineers from checkpointing frequently enough — and then a node failure wipes out hours of work. I have watched this exact sequence play out more times than I care to count.

The filesystem is not just storage. It is a performance-critical component of the compute pipeline.

## The four categories

HPC filesystems fall into four broad categories, each with distinct characteristics.

### Parallel filesystems

Parallel filesystems — Lustre, GPFS (Spectrum Scale), and BeeGFS — are purpose-built for HPC. They stripe data across multiple storage servers, allowing aggregate throughput to scale linearly with the number of servers. A well-configured Lustre deployment can deliver hundreds of gigabytes per second of sequential read throughput.

The key advantage is concurrent access. Hundreds or thousands of compute nodes can read from and write to the same filesystem simultaneously without contention, because the data is distributed across many servers and many disks. This is exactly what large-scale training and simulation workloads need.

The trade-off is operational complexity. Parallel filesystems require dedicated storage servers, careful capacity planning, and ongoing tuning. Metadata performance — the speed of operations like file creation, directory listing, and stat calls — is often the bottleneck for workloads with many small files. Lustre addresses this with dedicated metadata servers, but sizing them correctly requires understanding the workload's metadata patterns. Get it wrong, and your 100 GB/s filesystem crawls at kilobytes per second during a directory listing.

### Shared network filesystems

NFS and its managed variants (like Amazon EFS) provide a familiar POSIX interface with minimal operational overhead. They are easy to set up and work with any application that reads and writes files.

The limitation is performance. NFS is a single-server protocol at its core. Even managed implementations that distribute data across multiple servers cannot match the aggregate throughput of a parallel filesystem. For small-scale workloads or for serving configuration files and scripts, NFS is perfectly adequate. For feeding data to hundreds of GPUs, it is not — and no amount of tuning will change that fundamental constraint.

### Object storage

Object storage (like Amazon S3) offers virtually unlimited capacity at low cost. It is the natural home for training datasets, model artifacts, and long-term archives. The access pattern is simple: put objects, get objects.

The limitation is latency and access pattern. Object storage does not support POSIX semantics — no random reads, no appends, no directory listings in the traditional sense. Accessing individual objects has higher latency than a local or parallel filesystem. For training data, this is often acceptable if the data loader prefetches aggressively. For checkpoint writes that need low-latency POSIX semantics, object storage is not suitable as a primary target. Checkpointing needs to be fast and synchronous — you cannot afford to wait for an eventual-consistency model when 1,000 GPUs are idle.

### Local NVMe

Instance-attached NVMe SSDs provide the lowest latency and highest IOPS of any storage option. They are ideal for scratch space, temporary datasets, and workloads that need fast random I/O.

The limitation is capacity and persistence. Local NVMe is ephemeral — the data is lost when the instance terminates. It is also not shared — each node sees only its own local disks. For workloads that need shared access to a common dataset, local NVMe must be combined with another filesystem that serves as the source of truth. Think of it as a cache, not a filesystem.

## Decision framework by workload type

### Large-scale distributed training

The primary I/O pattern is sequential reads of training data and periodic checkpoint writes. The data pipeline must sustain enough throughput to keep all GPUs fed.

The recommended architecture is a parallel filesystem (Lustre or equivalent) for the training dataset and checkpoint storage, with object storage as the durable backing store. The parallel filesystem provides the throughput. Object storage provides the durability and cost efficiency for long-term retention.

Local NVMe can serve as a cache layer. Copying the dataset to local NVMe at job start eliminates filesystem contention during training, but requires enough local capacity and adds a staging step to the job.

### Traditional HPC simulation

Simulations often produce large output files and require periodic checkpoint writes. The I/O pattern is bursty — long periods of computation followed by short bursts of intense I/O.

A parallel filesystem is the standard choice. The key sizing decision is the number of Object Storage Targets (OSTs) in Lustre, which determines aggregate write bandwidth. Under-provisioning OSTs is the most common mistake — the simulation runs fine until checkpoint time, when every node writes simultaneously and the filesystem saturates. I have seen this pattern so often it is practically a rite of passage for new HPC teams.

### Data preprocessing and ETL

Preprocessing pipelines often involve many small files, complex directory structures, and metadata-heavy operations. This is where parallel filesystems struggle — metadata operations are their weakness.

For metadata-heavy workloads, consider a filesystem with distributed metadata (like GPFS or BeeGFS with multiple metadata servers). Alternatively, restructure the pipeline to work with fewer, larger files — converting millions of small images into a few large TFRecord or WebDataset shards dramatically reduces metadata pressure. This is one of those cases where changing the workload is easier than changing the infrastructure.

### Model serving and inference

Inference workloads need to load model weights at startup and then serve requests with low latency. The I/O pattern is a large sequential read at startup followed by minimal filesystem activity.

Local NVMe is ideal for model weights — copy the model from object storage to local disk at startup, and serve from there. The startup time is a one-time cost, and the serving latency is unaffected by filesystem performance.

## The cost dimension

Filesystem cost is not just the per-GB price. It includes provisioned throughput (many managed parallel filesystems charge for throughput separately from capacity), operational overhead (managing storage servers, monitoring capacity, handling failures), and the indirect cost of GPU idle time caused by I/O bottlenecks.

A parallel filesystem that costs three times more per GB than object storage but keeps your GPUs at 95% utilization instead of 70% is almost certainly cheaper in total. The GPU hours saved dwarf the storage premium. I have never seen a team regret investing in faster storage. I have seen many regret cheaping out on it.

## Getting it right

The right filesystem is the one that matches your workload's I/O pattern, throughput requirements, and operational constraints. There is no universal answer. But there is a universal mistake: choosing a filesystem based on familiarity or cost per GB without measuring the I/O requirements of the workload.

Measure first. Then choose. Then measure again to confirm you chose correctly.
