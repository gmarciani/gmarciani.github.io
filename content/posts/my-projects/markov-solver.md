---
title: "Markov Solver"
description: "Markov Solver computes steady-state probabilities for discrete-time Markov chains from a YAML definition — symbolic or constant rates, with Graphviz visualization."
date: 2024-01-11
draft: true
---

Markov chains are simple to describe and tedious to solve by hand — and genuinely painful once the transition rates are symbolic rather than fixed. I built Markov Solver to close that gap: define a chain in YAML, with constant or symbolic rates, and get back steady-state probabilities to twelve decimal places, a Graphviz diagram, and CSV output. Here is what it does and how I use it.
