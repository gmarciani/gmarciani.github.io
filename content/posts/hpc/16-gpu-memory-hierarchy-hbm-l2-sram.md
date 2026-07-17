---
title: "GPU memory hierarchy for AI workloads: HBM, L2, and SRAM"
description: "The GPU memory hierarchy from the programmer's perspective: HBM bandwidth and capacity, L2 cache behavior, shared memory (SRAM) in CUDA, and roofline model implications for AI kernels — showing how memory awareness directly affects attention, matmul, and all-reduce performance."
date: 2024-08-15
draft: true
---

GPU performance is a memory problem as much as a compute problem. The roofline model tells you whether your kernel is compute-bound or memory-bound — but only if you understand the hierarchy it is rooflined against.
