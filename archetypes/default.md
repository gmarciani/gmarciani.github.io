---
title: "{{ replace .Name "-" " " | title }}"
# Used for meta description, Open Graph, Twitter cards, JSON-LD and llms.txt.
# Keep it under ~160 characters and make it compelling — it's the search/share snippet.
description: ""
date: {{ .Date }}
# Categories drive the article section (schema.org) and breadcrumbs.
categories: []
# Tags become article:tag / JSON-LD keywords.
tags: []
# Optional: override the auto-generated social share image with a custom one
# (absolute path or URL, ideally 1200x630 PNG). Leave unset to auto-generate.
# image: ""
draft: true
---
