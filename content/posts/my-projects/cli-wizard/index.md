---
title: "Generating CLI with cli-wizard"
description: "A Python CLI from an OpenAPI spec, plus what plain generators skip: a releasable project, configuration and authentication profiles, TLS, logging, tests."
date: 2026-09-29
draft: true
---

{{< epigraph >}}
I want to generate a fully fledged CLI out of my API spec, but the usual generators are not enough.
I guess I'll use cli-wizard!
{{< /epigraph >}}

An [OpenAPI](https://www.openapis.org/) specification already describes a CLI.
Every endpoint, parameter, request body, and help string is in there.
[cli-wizard](https://github.com/gmarciani/cli-wizard) reads that specification and a small YAML configuration and generates a complete Python CLI project: one command group per tag, one command per operation, and around them the client, configuration and authentication profiles, logging, tests, and packaging that turn a command tree into a tool an operator can install and trust.
When the API changes, you regenerate.

## What it does

Take a specification with one tag and three operations:

{{< post-code src="openapi.yaml" >}}

Write a configuration.
`ProjectName` is the only required field; the command name and package name derive from it, and everything else has a default:

{{< post-code src="cli-wizard.yaml" >}}

Generate, install, run:

{{< post-code src="generate.sh" >}}

The mapping is mechanical, which is the point.
The tag `Users` became the group `users`.
Each `operationId` became a kebab-case command.
The path parameter `userId` became `--user-id`, URL-encoded into the request.
The body properties became options too: `name` is required because the schema says so, and `admin`, a boolean, is an `--admin/--no-admin` pair sent only when one of the two is given, so a `PATCH` can leave a flag untouched.
Summaries became help text.
The response body is printed as JSON, and an error is printed with the body the API returned, because a `400` without the rejected field names is useless.

The output is a project:

{{< filetree >}}
%1{generated from the spec}  %2{runtime shared by every CLI}  %3{project scaffolding}

my-cli/
├── %3{pyproject.toml}  %3{README.md}  %3{CHANGELOG.md}  %3{tox.ini}  %3{.github/}
├── src/my_cli/
│   ├── %2{cli.py}                 root group: --profile, --debug, --base-url, --ca-file
│   ├── %2{client.py}              requests session, TLS, error formatting
│   ├── %2{profile.py}             named profiles and the settings chain
│   ├── %2{logging.py}             colored console, rotating file
│   ├── %2{redaction.py}           credentials masked in the logs
│   └── commands/
│       ├── %2{config.py}          init, list-profiles, show, get, set, unset
│       └── %1{users.py}           one module per OpenAPI tag
└── tests/
    └── %1{commands_test.py}       one test per generated command
{{< /filetree >}}

## Why I built it

I hit this on the backend of a personal project.
The server exported its specification, the API sat behind a private certificate authority, and I had written this exact CLI before, for other APIs: a Click group per resource, a function per endpoint that builds a URL, sends a request, prints the JSON.
The parts that take real care, such as configuration and authentication profiles, TLS, and logging, were the same across projects too.
Nothing in that code was specific to the project except the specification.
When the only input that varies is a document you already have, the code is a function of the document, and a function should be computed, not transcribed by hand.

Deriving commands from a specification is not new, though.
Any generator that reads an OpenAPI document, [OpenAPI Generator](https://openapi-generator.tech/) being the best known, can walk the paths, name a command after each `operationId`, and turn parameters into options.
That gives you a command tree over an HTTP client, and it is where a standard generator stops.
What it does not give you is the CLI: the thing an operator installs, configures once, and trusts with production credentials.
cli-wizard generates that part too, and four things separate its output from a command tree.

**A releasable project, not a module.**
A Python package with `pyproject.toml`, README, changelog, development guide, `tox`, pre-commit hooks, and, when asked, the GitHub workflows to test, scan, release, and document it.
It is meant to live in its own repository from the first commit.

**An operator's runtime.**
Configuration and authentication profiles, with settings resolved through four layers, highest first: the command-line flag, an environment variable such as `MY_CLI_BASE_URL`, the selected profile, and the built-in default.
TLS with a pinned CA bundle, where a configured bundle that does not exist is a hard error rather than a silent fallback to the system trust store, and `--no-verify-ssl` warns on every invocation.
Logging to the terminal and to a rotating file, which masks passwords, tokens, and the `Authorization` header, using the `format: password` and `writeOnly` signals in the specification plus a name heuristic.
A profile file created `0600` in a `0700` directory.
Every default in the generator is a default in every CLI it will ever produce, so these matter more here than in any single hand-written tool.

**A test suite for the code it wrote.**
One test per generated command, asserting the method, URL, query, and body sent, and a coverage threshold the generated CI enforces.
A generator that emits untested code has handed you the debugging along with the code.

**Code you own.**
The generator emits source rather than interpreting the specification at run time, so the CLI has no dependency on the specification once built, is pinned to the API version it came from, and can be read, stepped through, and extended: command modules carry a "do not edit" header and are regenerated, and a hand-written module that goes beyond the specification sits next to them.
The output is formatted with Ruff before it is written, so regenerating against an unchanged specification produces an empty diff, and regenerating against a changed one produces a diff that shows what changed in the API.
Click is the framework underneath, because generated Click code looks like code a person would write.

A command tree is the part of an API CLI that is cheapest to write by hand.
The other three are where the drift, the incidents, and the weekends go.

## Shaping the CLI

The configuration controls which operations become commands, what they are called, where the CLI keeps its state, which CA bundle it trusts, and what the project ships with:

{{< post-code src="cli-wizard-advanced.yaml" >}}

Parameters reference each other with `#[Name]` and environment variables with `${VAR}`; references are resolved before generation, and a circular one is a configuration error, not an infinite loop.
The CA bundle and the splash file are bundled into the package, so the installed CLI carries them wherever it goes.
The full list is in the [configuration reference](https://gmarciani.github.io/cli-wizard/configuration.html).

The generated CLI reflects every one of those decisions:

{{< post-code src="usage.sh" >}}

The group is `user` and the commands are `ls` and `get`, as the mappings say, and there is no `create-user` command, because the configuration excluded that operation.
`config init` creates the default profile; `config set` stores a setting in it, and `--profile` selects another.
The environment variable outranks the profile for one invocation, and a `--base-url` flag would outrank both.
The last command logs the request and response with every credential replaced by `***`, to the terminal and to the rotating log file under `~/.my-cli/`.
None of that was in the specification, and none of it was written by hand.

If you have no specification yet, `cli-wizard bootstrap my-cli` asks for the project name, author, and repository, writes this configuration file, and generates a CLI with the profile and config commands but no API commands.
You add the specification later and regenerate.

## Links

- [PyPI](https://pypi.org/project/cli-wizard)
- [Documentation](https://gmarciani.github.io/cli-wizard)
- [GitHub](https://github.com/gmarciani/cli-wizard)
