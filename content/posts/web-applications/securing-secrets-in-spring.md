---
title: "Securing Secrets in Spring"
description: "Keeping credentials out of source and out of logs in Spring — externalized configuration, a real secrets backend, and the leaks that happen by default."
date: 2024-01-12
draft: true
---

Secrets in a Spring application have a way of ending up exactly where they should not: in `application.properties`, in environment variables dumped at startup, in a Git history nobody wants to rewrite. Keeping credentials out of source and out of reach takes deliberate design, not good intentions. Here is how to manage secrets in Spring with a real secrets backend instead of hope.
