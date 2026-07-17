---
title: "Throttling in Spring"
description: "Adding rate limiting to Spring applications — per-client limits, token-bucket strategies, and distributed throttling that survives more than one instance."
date: 2024-01-16
draft: true
---

Every endpoint you expose is a resource someone can exhaust — deliberately or by accident. Rate limiting is how you protect a service from its own callers without degrading the experience for the well-behaved majority. Here is how to add throttling to a Spring application, from simple per-client limits to distributed rate limiting that survives more than one instance.
