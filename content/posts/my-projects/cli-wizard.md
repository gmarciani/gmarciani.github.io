---
title: "Personal Project: CLI Wizard"
description: "Generate modern Python CLIs from OpenAPI specifications. Why I built CLI Wizard, how it works, and how to use it."
date: 2026-09-06
draft: true
---

Every team that builds an API eventually needs a CLI for it. Not a curl wrapper, not a Postman collection — a real CLI that operators and developers can use in scripts, pipelines, and terminals without thinking twice. The problem is that writing a good CLI is tedious. You end up hand-coding argument parsers, help strings, HTTP calls, error handling, and output formatting for every single endpoint. When the API changes, the CLI drifts. The spec says one thing, the CLI does another, and nobody notices until something breaks.

I built [CLI Wizard](https://github.com/gmarciani/cli-wizard) to eliminate that drift. You point it at an OpenAPI spec, give it a configuration file, and it generates a complete, pip-installable Python CLI project. The generated code is clean, idiomatic, and ready to extend. I wanted a tool that I would trust to generate code I would be comfortable shipping — and that is what I built.

## The problem

Consider an API with 40 endpoints across 8 resource groups. Writing a CLI for it means:

- Defining a Click command for each endpoint
- Grouping commands by resource type
- Parsing request and response bodies
- Handling authentication, retries, and timeouts
- Formatting output as JSON, YAML, or tables
- Writing help text for every command and option

That is weeks of mechanical work. The moment someone adds a new endpoint or changes a parameter, you are back to editing boilerplate by hand. I have done this enough times to know that the answer is not discipline — it is automation.

The OpenAPI specification already contains everything you need: endpoints, parameters, request bodies, response schemas, and descriptions. CLI Wizard reads that specification and generates the entire CLI from it.

## How it works

CLI Wizard operates in two modes.

The `generate` command takes an OpenAPI v3 specification and a YAML configuration file, and produces a complete Python CLI project. The generated project uses Click for command parsing, includes a built-in API client with retry logic and SSL support, and comes with a `pyproject.toml` so you can install it with `pip install -e .` immediately.

The `bootstrap` command is for when you do not have an OpenAPI spec yet. It walks you through a step-by-step procedure to scaffold a basic CLI with an extensible configuration file. You can evolve it later by adding an OpenAPI spec.

## Installation

```shell
pip install cli-wizard
```

## Quick start

Prepare an OpenAPI v3 specification file. Then create a minimal configuration:

```yaml
PackageName: "my-cli"
DefaultBaseUrl: "https://api.example.com"
```

Generate the CLI:

```shell
cli-wizard generate --openapi openapi.yaml --config cli-wizard.yaml --output my-cli
```

Install and use it:

```shell
pip install -e my-cli
my-cli --help
```

That is it. Every endpoint in your spec is now a CLI command, grouped by OpenAPI tags.

## Configuration

The configuration file controls every aspect of the generated CLI. A few highlights:

```yaml
# Project identity
ProjectName: "My CLI"
CommandName: "my-cli"
PackageName: "my_cli"
Description: "A CLI for My API"

# API settings
DefaultBaseUrl: "https://api.example.com"
Timeout: 30
RetryMaxAttempts: 3

# Filter which tags to include or exclude
IncludeTags:
  - Users
  - Products
ExcludeTags:
  - Internal

# Rename tags and commands
TagMapping:
  Users: "user"
CommandMapping:
  listUsers: "ls"

# Output formatting
OutputFormat: "json"    # json, table, or yaml
TableStyle: "rounded"   # ascii, rounded, minimal, markdown

# Splash screen
SplashFile: "splash.txt"
SplashColor: "#00FFFF"

# Logging
LogLevel: "INFO"
LogFile: null
LogRotationType: "days"
LogRotationDays: 30
```

You can reference other parameters with `#[ParamName]` syntax and environment variables with `${VAR}` syntax. For example, the default main directory is `${HOME}/.#[CommandName]`.

## What gets generated

The output is a self-contained Python project with:

- A Click-based CLI with command groups matching your OpenAPI tags
- An API client with configurable base URL, timeout, retries, and SSL/TLS support
- Profile management for storing credentials and settings
- Colored terminal output with `--debug` flag for verbose logging
- A `pyproject.toml`, `README.md`, and `VERSION` file — ready for `pip install`
- Bundled resources like CA certificates and splash files

The generated code is meant to be a starting point. You own it, you can modify it, you can extend it with custom commands that go beyond what the OpenAPI spec describes. This was a deliberate design choice — I did not want a framework that hides the generated code behind abstractions. The output is yours.

## Why Click

Click is the most mature and well-designed CLI framework in the Python ecosystem. I evaluated several alternatives and kept coming back to Click. It handles argument parsing, help generation, shell completion, and nested command groups with minimal boilerplate. The generated code uses Click idiomatically, so anyone familiar with the framework can jump in and extend it.

## Links

- [GitHub](https://github.com/gmarciani/cli-wizard)
- [PyPI](https://pypi.org/project/cli-wizard)
- [Documentation](https://gmarciani.github.io/cli-wizard)
