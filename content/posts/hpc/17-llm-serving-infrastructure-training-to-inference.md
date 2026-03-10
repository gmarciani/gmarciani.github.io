---
title: "LLM serving infrastructure: from training cluster to inference fleet"
description: "The architectural shift from training to serving: batching strategies, KV cache management, tensor parallelism for inference, and the latency-throughput trade-off. Compares serving frameworks, maps infrastructure requirements to business SLAs, and includes a cost-per-token analysis."
date: 2024-09-01
draft: true
---

Training a large language model and serving it are fundamentally different infrastructure problems. The cluster that minimizes training time is rarely the fleet that minimizes inference cost. This article maps the transition and the decisions that shape it.
