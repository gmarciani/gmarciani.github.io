---
title: "Fine-tuning SLURM for maximum performance and efficiency"
description: "Beyond SLURM defaults: partition and QOS design, priority and fairshare configuration, topology-aware scheduling, backfill behavior, cgroup enforcement for GPU and memory isolation, prolog and epilog scripts, and profiling the scheduler under high job submission rates."
date: 2024-07-15
draft: true
---

A default SLURM installation will schedule jobs. A well-tuned SLURM installation will maximize cluster utilization, enforce resource fairness, and protect node integrity under adversarial workloads. The gap between the two is significant — I have seen it cost teams millions in wasted GPU-hours.

## Partition design

The default single-partition configuration works for small clusters with homogeneous hardware. It does not work for production clusters with mixed instance types, different GPU generations, or workloads with different priority levels.

Design partitions around hardware boundaries and use-case boundaries. A GPU cluster might have a `train` partition with large multi-node GPU instances for distributed training, an `inference` partition with smaller GPU instances for model serving, and a `preprocess` partition with CPU instances for data preparation. Each partition gets its own default time limit, maximum job size, and access controls.

Overlapping partitions — where the same nodes appear in multiple partitions — are useful but require careful priority configuration. If the `train` and `debug` partitions share nodes, debug jobs should preempt training jobs only if the debug partition has higher priority and preemption is explicitly configured.

Set `DefMemPerCPU` and `MaxMemPerCPU` on every partition. Without memory limits, a single job can allocate all memory on a node and cause out-of-memory kills for co-located jobs. This is the most common source of mysterious job failures on shared clusters — one of the first things I check when debugging a new deployment.

## Priority and fairshare

SLURM's multifactor priority plugin (`PriorityType=priority/multifactor`) calculates job priority as a weighted sum of several factors: age (how long the job has been waiting), fairshare (how much the user has consumed relative to their allocation), job size, partition priority, and QOS priority.

Fairshare is the most important factor for multi-tenant clusters. It ensures that users who have consumed more than their share of resources see their job priorities decrease, while users who have consumed less see their priorities increase. The decay rate (`PriorityDecayHalfLife`) controls how quickly past usage is forgotten — a 7-day half-life means that usage from two weeks ago has only 25% of the weight of usage from today.

Configure fairshare accounts hierarchically. A research group gets an account with a share allocation, and individual users within that group get sub-accounts. This allows both inter-group and intra-group fairness. Use `sacctmgr` to define the account tree and share allocations.

The `PriorityWeightFairshare` parameter controls how much fairshare affects the total priority score relative to other factors. For clusters where fairness is critical, set this weight high. For clusters where throughput matters more than fairness, reduce it and increase the weight of job size (which favors large jobs that improve utilization through backfill).

## Backfill scheduling

SLURM's default FIFO scheduling is simple but wasteful. A large job at the front of the queue blocks all smaller jobs behind it, even if those smaller jobs could run on currently idle resources without delaying the large job.

Backfill scheduling (`SchedulerType=sched/backfill`) solves this. It looks ahead in the queue and starts lower-priority jobs if they will complete before the highest-priority job's resources become available. This dramatically improves cluster utilization without violating priority ordering. The resources are idle anyway, and the large job is not delayed. There is no downside — only free utilization.

The key parameter is `bf_max_job_test` — how many jobs the backfill scheduler evaluates per cycle. The default (100) is too low for clusters with thousands of pending jobs. Increase it to 500 or 1000, but monitor the scheduler's cycle time — evaluating too many jobs per cycle can slow the scheduler itself.

`bf_interval` controls how often the backfill scheduler runs. The default (30 seconds) is reasonable for most clusters. Reduce it for clusters with high job submission rates where utilization gaps are costly.

## Topology-aware scheduling

For tightly coupled jobs that use MPI or NCCL, the physical placement of nodes matters. Nodes closer in the network topology — connected to the same leaf switch or within the same network spine — have lower communication latency and higher bandwidth. The difference is not subtle. I have measured 20-30% throughput improvements from topology-aware placement alone on distributed training jobs.

SLURM's topology plugin (`TopologyPlugin=topology/tree`) allows you to define the network topology and instruct the scheduler to place jobs on topologically close nodes. You define the topology in a `topology.conf` file that maps switches to nodes:

```
SwitchName=leaf1 Nodes=gpu-[001-016]
SwitchName=leaf2 Nodes=gpu-[017-032]
SwitchName=spine1 Switches=leaf1,leaf2
```

With topology-aware scheduling enabled, SLURM will prefer to allocate nodes within the same leaf switch for a multi-node job. This can measurably improve collective operation performance for distributed training.

## Cgroup enforcement

Without cgroup enforcement, SLURM's resource limits are advisory. A job that requests 4 GPUs can access all 8 GPUs on the node. A job that requests 64 GB of memory can allocate 256 GB. This is not a theoretical concern — it happens regularly on shared clusters.

Enable cgroup enforcement with `TaskPlugin=task/cgroup` and configure `cgroup.conf`:

```
CgroupAutomount=yes
ConstrainCores=yes
ConstrainRAMSpace=yes
ConstrainDevices=yes
```

`ConstrainCores` pins each job to its allocated CPU cores. `ConstrainRAMSpace` enforces memory limits — jobs that exceed their allocation are killed rather than allowed to impact other jobs. `ConstrainDevices` restricts GPU visibility so that a job sees only its allocated GPUs via `CUDA_VISIBLE_DEVICES`.

This is non-negotiable for multi-tenant GPU clusters. Without device constraints, two jobs scheduled on the same node can both attempt to use the same GPU, causing memory errors and job failures. I have debugged this exact issue more than once — it presents as random CUDA out-of-memory errors that vanish when you run the job on an empty node. The root cause is not the job. It is the missing isolation.

## Prolog and epilog scripts

Prolog scripts run before a job starts on each allocated node. Epilog scripts run after the job completes. They are the right place for node preparation and cleanup tasks.

Common prolog tasks: verify GPU health with `nvidia-smi`, check that the shared filesystem is mounted, clear `/tmp` from previous jobs, and load environment modules. A prolog that detects a failed GPU can drain the node before the job starts, preventing a wasted allocation.

```bash
#!/bin/bash
# Prolog: check GPU health
gpu_count=$(nvidia-smi --query-gpu=count --format=csv,noheader | head -1)
if [ "$gpu_count" -lt 8 ]; then
    echo "Node has fewer than 8 healthy GPUs, draining"
    scontrol update NodeName=$(hostname) State=DRAIN Reason="GPU failure detected in prolog"
    exit 1
fi
```

Common epilog tasks: kill orphan processes, clear GPU memory, unmount temporary filesystems, and report job statistics to a monitoring system.

## Profiling the scheduler

Under high load, the SLURM controller itself can become a bottleneck. If the scheduling cycle takes longer than the `bf_interval`, jobs pile up and cluster utilization drops.

Monitor the scheduler with `sdiag`, which reports scheduling cycle times, backfill cycle times, and job submission rates. If the mean scheduling cycle exceeds a few seconds, investigate the cause — usually too many pending jobs, too many partitions, or an overly complex fairshare calculation.

For very large clusters (thousands of nodes, tens of thousands of pending jobs), consider tuning `SchedulerParameters` to limit the work per cycle: `defer`, `bf_max_job_test`, `bf_max_time`, and `max_sched_time` all control how much work the scheduler does before yielding.

## The payoff

A well-tuned SLURM installation is invisible. Jobs start quickly, resources are used efficiently, users get fair access, and node failures are handled gracefully. The tuning effort is a one-time investment that pays dividends for the lifetime of the cluster. Every percentage point of improved utilization on a large GPU cluster translates directly to money saved and research accelerated. I find this work deeply satisfying — it is infrastructure that makes other people's work possible.
