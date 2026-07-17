---
title: "Exposing Outputs in SSM Automations"
description: "How outputs flow through AWS SSM Automation documents — passing values between steps and surfacing them to callers cleanly, without the usual guesswork."
date: 2024-01-03
draft: true
---

SSM Automation documents are excellent at orchestrating multi-step operational tasks — right up until you need to get a value back out of one. Passing outputs between steps, and surfacing them to whatever called the automation, is less obvious than it should be and trips up almost everyone the first time. Here is how outputs actually flow through an SSM Automation, and how to expose the ones you care about cleanly.
