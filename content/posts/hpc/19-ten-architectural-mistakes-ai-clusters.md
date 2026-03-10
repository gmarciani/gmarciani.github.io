---
title: "10 architectural mistakes I've seen in AI clusters — and how to fix them"
description: "Opinionated post drawn from real production experience covering the most common and costly architectural errors in AI cluster design: undersized storage bandwidth, wrong filesystem, NUMA blindness, misconfigured NCCL, over-provisioned head nodes, missing health checks, and poor checkpoint discipline."
date: 2024-10-01
draft: true
---

After years of building and operating HPC clusters for AI workloads, the same mistakes appear with remarkable consistency. They are not exotic. They are not the result of carelessness. They are the predictable consequence of applying general-purpose cloud thinking to a domain with very different constraints.
