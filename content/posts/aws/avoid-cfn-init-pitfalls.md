---
title: "Avoid cfn-init pitfalls"
description: "The cfn-init pitfalls that cause silent EC2 bootstrap failures — signal handling, resource ordering, and error propagation — and how to avoid each one."
date: 2024-01-02
draft: true
---

`cfn-init` is one of the oldest ways to bootstrap an EC2 instance from CloudFormation, and it is still quietly running in production everywhere. It is also full of sharp edges: silent failures, confusing signal handling, and ordering assumptions that only break under load. Here are the cfn-init pitfalls I keep running into, and how to avoid each one before it costs you a 3 a.m. rollback.
