---
title: "Cost anatomy of a 1,000-GPU training run on AWS"
description: "A bottom-up breakdown of every cost component in a large-scale training job: instance hours, storage I/O, data transfer, and idle time from failures and restarts. Includes an adaptable cost model and identifies the three levers with the highest impact on total spend."
date: 2024-06-15
draft: true
---

Running a thousand GPUs for days is expensive in ways that are not always obvious from the pricing page. Instance hours are only the beginning. This article builds a complete cost model from first principles and shows where the real money goes — and where to find it again.
