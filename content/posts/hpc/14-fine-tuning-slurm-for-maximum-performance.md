---
title: "Fine-tuning SLURM for maximum performance and efficiency"
description: "Beyond SLURM defaults: partition and QOS design, priority and fairshare configuration, topology-aware scheduling, backfill behavior, cgroup enforcement for GPU and memory isolation, prolog and epilog scripts, and profiling the scheduler under high job submission rates."
date: 2024-07-15
draft: true
---

A default SLURM installation will schedule jobs. A well-tuned SLURM installation will maximize cluster utilization, enforce resource fairness, and protect node integrity under adversarial workloads. The gap between the two is significant.
