---
title: "Checkpointing strategies for long-running distributed training"
description: "The full checkpointing design space: frequency trade-offs, synchronous vs. asynchronous strategies, full vs. incremental snapshots, and storage target selection — with working PyTorch DDP and FSDP examples against FSx for Lustre and measured overhead at different intervals."
date: 2024-08-01
draft: true
---

A training job that runs for days without checkpointing is not a training job — it is a gamble. When a node fails at hour 47 of a 48-hour run, the question is not whether you wish you had checkpointed, but whether you designed your checkpointing strategy to make the overhead worthwhile.
