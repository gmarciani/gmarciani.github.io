---
title: "Fine-tuning LLMs on a budget: LoRA + FSx"
description: "End-to-end walkthrough of fine-tuning a large language model on a constrained budget using LoRA to reduce trainable parameters, FSx for Lustre for fast dataset access, and carefully selected instance types — with a reproducible cost breakdown and guidance on when fine-tuning beats prompting."
date: 2024-09-15
draft: true
---

Fine-tuning a large language model does not require a thousand GPUs or a six-figure cloud bill. With the right combination of parameter-efficient techniques and storage architecture, meaningful fine-tuning is within reach for teams of any size.
