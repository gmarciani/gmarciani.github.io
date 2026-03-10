---
title: "Profiling multi-node training jobs with NVIDIA Nsight"
description: "A step-by-step guide to profiling distributed training jobs using NVIDIA Nsight Systems and Nsight Compute: timeline analysis, kernel occupancy, communication-computation overlap, identifying stragglers across nodes, and translating profiling output into concrete optimization actions."
date: 2024-05-01
draft: true
---

You cannot optimize what you cannot measure. For multi-node GPU training jobs, the gap between assumed and actual performance is almost always larger than expected — and the root cause is almost never where you think it is. NVIDIA Nsight is the tool that closes that gap.
