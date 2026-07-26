---
title: "Personal Project: Markov Solver"
description: "Solve discrete-time Markov chains with symbolic transition rates, graph visualization, and multiple input formats. Why I built Markov Solver and how to use it."
date: 2026-08-23
draft: true
---

During my studies in performance modeling, I spent a lot of time solving Markov chains by hand — setting up balance equations, solving linear systems, checking that probabilities summed to one. The math is straightforward but the bookkeeping is brutal, especially when chains grow beyond a handful of states or when transition rates are symbolic expressions depending on parameters like arrival rates and service rates. I kept making sign errors. I kept losing track of which equations I had already substituted. The frustration was productive — it made me build a tool.

I built [Markov Solver](https://github.com/gmarciani/markov-solver) to automate that process. You define a Markov chain in a YAML file (or DOT, CSV, or JSON), and it computes the steady-state probabilities, renders the chain as a graph, and exports the results. It works as a CLI and as a Python library.

## The problem

Discrete-time Markov chains show up everywhere in performance modeling: queueing systems, reliability analysis, network protocols, inventory management. The steady-state solution tells you the long-run probability of being in each state, which is the foundation for computing metrics like throughput, utilization, and mean response time.

Solving a chain means finding the probability vector π such that πP = π and the probabilities sum to one. For small chains this is textbook linear algebra. For chains with symbolic rates — where transitions depend on parameters like λ (arrival rate) and μ (service rate) — you need symbolic computation. For chains with more than a few states, you want automation, not a whiteboard. The computer does not make sign errors. I do.

## How it works

You define the chain as a list of transitions. Each transition specifies a source state, a destination state, and a transition rate (which can be a number or a symbolic expression).

Here is a simple weather chain:

```yaml
chain:
  - from: "Sunny"
    to: "Sunny"
    value: "0.9"

  - from: "Sunny"
    to: "Rainy"
    value: "0.1"

  - from: "Rainy"
    to: "Rainy"
    value: "0.5"

  - from: "Rainy"
    to: "Sunny"
    value: "0.5"
```

Running the solver:

```shell
markov-solver solve --definition weather.yaml
```

Produces:

```
===============================================================
                     MARKOV CHAIN SOLUTION
===============================================================

                      states probability
Rainy.........................................0.166666666666667
Sunny.........................................0.833333333333333
```

## Symbolic transition rates

This is where it gets interesting. You can define transition rates as symbolic expressions and assign values to the symbols separately:

```yaml
symbols:
  lambda: 1.5
  mu: 2.0

chain:
  - from: "0"
    to: "1"
    value: "lambda"

  - from: "1"
    to: "2"
    value: "lambda"

  - from: "2"
    to: "3"
    value: "lambda"

  - from: "3"
    to: "2"
    value: "3*mu"

  - from: "2"
    to: "1"
    value: "2*mu"

  - from: "1"
    to: "0"
    value: "mu"
```

This models a birth-death process where arrivals happen at rate λ and service happens at rate μ, with state-dependent service rates. The solver substitutes the symbol values, builds the transition matrix, and computes the steady-state probabilities:

```
===============================================================
                     MARKOV CHAIN SOLUTION
===============================================================

                      states probability
0.............................................0.475836431226766
1.............................................0.356877323420074
2.............................................0.133828996282528
3............................................0.0334572490706320
```

## Installation

```shell
pip install markov-solver
```

## Multiple input formats

Version 2.0 added support for defining chains in several formats beyond YAML:

- DOT/Graphviz format (`.dot`, `.gv`) — useful if you already have a graph description
- CSV adjacency matrix format (`.csv`) — convenient for importing from spreadsheets
- Transition matrix in YAML or JSON — for when you prefer to specify the matrix directly

The solver auto-detects the format based on the file extension.

## Graph visualization

Markov Solver renders the chain as a directed graph using Graphviz, producing SVG and PNG files. This is useful for verifying that the chain is defined correctly and for including diagrams in reports or papers.

## Using it as a library

Beyond the CLI, you can use Markov Solver directly in your Python code:

```python
from markov_solver.parser.markov_chain_parser import create_chain_from_file
from markov_solver.results.report import SimpleReport as Report

markov_chain = create_chain_from_file("definition.yaml")
states_probabilities = markov_chain.solve()

report = Report("MARKOV CHAIN SOLUTION")
for state in sorted(states_probabilities):
    report.add("states probability", state, states_probabilities[state])

print(report)
```

This makes it easy to integrate into larger analysis pipelines — sweep over parameter values, compare different chain topologies, or feed the results into downstream computations. This is where the tool earns its keep: not solving one chain, but solving hundreds of variations while you explore the parameter space.

## References

The mathematical foundations come from two excellent textbooks that shaped how I think about stochastic modeling:

- *Discrete-Event Simulation* by L.M. Leemis and S.K. Park
- *Performance Modeling and Design of Computer Systems* by M. Harchol-Balter

## Links

- [GitHub](https://github.com/gmarciani/markov-solver)
- [PyPI](https://pypi.org/project/markov-solver)
- [Documentation](https://gmarciani.github.io/markov-solver)
