---
title: "Storing UUID in Spring"
description: "Storing UUIDs efficiently in Spring and JPA — binary vs. character columns, index cost, and why the obvious VARCHAR mapping quietly taxes performance."
date: 2024-01-15
draft: true
---

A UUID is sixteen bytes, but store it carelessly and it costs you far more — in index size, in query latency, in storage wasted across millions of rows. How you map a UUID between Java, JPA, and the database column decides whether it is a clean primary key or a silent performance tax. Here is how to store UUIDs in Spring the efficient way, and why the obvious approach is rarely the right one.
