---
title: "CLI Wizard"
description: "CLI Wizard generates a modern, pip-installable Python command-line client from any OpenAPI v3 spec — command grouping, help, and credential handling included."
date: 2024-01-11
draft: true
---

Every REST API deserves a good command-line client, and almost none of them get one — because writing a CLI by hand is repetitive work that goes stale the moment the API changes. I built CLI Wizard to remove that work: point it at an OpenAPI v3 specification and it generates a modern, pip-installable Python CLI, complete with command grouping, help text, and credential handling. Here is how it works, and why I built it.
