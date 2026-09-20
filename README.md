# AutoCoder Local Growth Copilot

> Open-source growth guidance for local business websites.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Project status: Early development](https://img.shields.io/badge/status-early%20development-orange.svg)](#project-status)

AutoCoder Local Growth Copilot is an open-source toolkit for finding and fixing the highest-impact discoverability and conversion gaps on local business websites.

It is designed for business owners and builders who want clear, practical actions—not a dashboard full of SEO jargon.

## Why this project exists

Publishing a website is only the beginning. A local business still needs to answer three questions:

1. Can search engines understand and index the site?
2. Is the business clearly relevant to its services and locations?
3. Can a visitor quickly call, book, or request a quote?

Most SEO tools identify hundreds of issues without explaining what matters first. Growth Copilot focuses on a short, prioritized path from finding a problem to shipping an improvement.

## What it does

The first usable release provides a read-only **Launch Check** for local business websites. It inspects a public URL and generates:

- a discoverability score;
- a local relevance score;
- a conversion readiness score;
- evidence for every finding;
- the three highest-priority actions;
- human-readable Markdown and machine-readable JSON reports.

The current rules cover:

- page titles, meta descriptions, headings, canonical URLs, and indexability;
- `robots.txt` and `sitemap.xml` availability;
- local business structured data;
- business name, services, locations, phone number, and opening hours;
- clear call, booking, contact, or quote actions;
- essential service, location, FAQ, review, and contact content;
- mobile viewport and above-the-fold clarity.

## Example output

```text
Launch Check: Buffalo Family Plumbing

Discoverability       78 / 100
Local relevance       61 / 100
Conversion readiness  54 / 100

Top actions
1. Add the primary service and city to the homepage title and H1.
2. Add a visible “Request a Quote” action to the mobile hero.
3. Complete the LocalBusiness structured data with service area and hours.
```

The exact scoring model is still being developed. Every score will be traceable to documented, testable rules.

## Quick start

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/devAigcode/autocoder-local-growth-copilot.git
cd autocoder-local-growth-copilot
npm test
```

Run a Launch Check directly from the repository:

```bash
node ./bin/autocoder-growth.js https://example.com \
  --business "North Star Plumbing" \
  --service "plumbing" \
  --location "Buffalo" \
  --goal quote
```

Use the included fictional profile:

```bash
node ./bin/autocoder-growth.js https://example.com \
  --profile examples/buffalo-plumber-profile.json
```

Generate a machine-readable report:

```bash
node ./bin/autocoder-growth.js https://example.com \
  --format json \
  --output launch-check.json
```

Run `node ./bin/autocoder-growth.js --help` for all options.

## Current checks

Launch Check currently runs 16 transparent rules across three categories:

- **Discoverability:** title, meta description, primary heading, indexability, canonical URL, crawler access, and XML sitemap.
- **Local relevance:** local business structured data, service and location visibility, public phone number, and opening hours.
- **Conversion readiness:** primary action, reachable conversion path, mobile viewport, opening value proposition, and trust information.

Rules return `pass`, `warning`, `fail`, or `not-applicable`. Context-dependent checks do not affect the score when the relevant context was not provided.

## Safety and scope

The current implementation:

- accepts only HTTP and HTTPS URLs;
- rejects URLs containing credentials;
- blocks local, private, link-local, reserved, and non-public IP destinations;
- revalidates redirect destinations;
- applies request timeouts, redirect limits, and response-size limits;
- identifies itself with a documented user agent;
- reads public pages without submitting forms or activating controls;
- inspects only the homepage, `robots.txt`, and one sitemap candidate.

Treat every report as diagnostic guidance. A passing score does not guarantee search visibility or business performance, and a failed heuristic should be reviewed in its page context.

## Product principles

- **Business outcomes first.** Explain findings in terms of calls, bookings, visits, and inquiries.
- **Evidence before advice.** Every recommendation should point to the page and condition that triggered it.
- **Prioritize, do not overwhelm.** Lead with the smallest set of actions likely to make the largest difference.
- **Preview before change.** Suggested content or code changes should be reviewable before they are applied.
- **Deterministic where possible.** Audits and scores should rely on transparent rules that contributors can test.
- **Privacy by default.** Analyze public website content without collecting visitor-level personal data.
- **No ranking promises.** The project helps improve website fundamentals; it does not guarantee traffic or revenue.

## Who it is for

The initial focus is on single-location and service-area businesses, including:

- restaurants, cafés, and bakeries;
- salons, barbers, spas, and beauty services;
- plumbers, electricians, cleaners, movers, repair services, and contractors.

The project is also intended for developers, agencies, and contributors building better local business websites.

## Planned workflow

```text
Public website URL
        ↓
Website and business context analysis
        ↓
Discoverability, local relevance, and conversion checks
        ↓
Evidence-backed prioritized actions
        ↓
Markdown / JSON report
        ↓
Reviewable website improvements
```

## Project status

This repository is in early development. A usable, read-only Launch Check is available now, with no runtime dependencies. The public product specification is available in [`docs/PRD.md`](docs/PRD.md).

The command-line interface is an early release and may change before the first stable package release. It has been tested with Node.js 20 and newer.

## Roadmap

### v0.1 — Read-only Launch Check (current)

- [x] Fetch and inspect a public website safely.
- [x] Run transparent, testable audit rules.
- [x] Produce prioritized Markdown and JSON reports.
- [x] Include an initial fictional home-service profile.
- [x] Add automated tests for the audit, rules, parser, reports, and URL safety.
- [ ] Add fictional restaurant and salon fixtures.
- [ ] Publish detailed documentation for every rule and scoring weight.

### v0.2 — Reviewable recommendations

- Generate suggested titles, descriptions, calls to action, FAQs, and structured data.
- Show the reasoning and affected page for each suggestion.
- Export changes in formats that can be reviewed before use.

### Future exploration

- Reusable industry Growth Packs.
- Site-wide content opportunity analysis.
- Progress history and repeated audits.
- Community-authored checks and templates.

Roadmap items describe direction, not release commitments.

## Repository layout

The current structure is:

```text
.
├── README.md
├── bin/
│   └── autocoder-growth.js
├── docs/
│   └── PRD.md
├── src/
│   ├── audit.js
│   ├── cli.js
│   ├── fetch.js
│   ├── html.js
│   ├── report.js
│   └── rules.js
├── examples/
│   └── buffalo-plumber-profile.json
├── test/
├── package.json
└── .github/
```

This layout may evolve as additional audit surfaces and Growth Packs are implemented.

## Contributing

The project welcomes practical contributions from developers, SEO practitioners, local business owners, and content designers.

Useful early contributions include:

- proposing an audit rule with a clear rationale and test cases;
- sharing an anonymized local business website pattern;
- improving plain-language recommendation copy;
- identifying false positives in an existing rule;
- creating realistic, fictional examples for supported industries.

Contribution guidelines and issue templates will be added with the first implementation milestone. Please do not submit real customer data, credentials, analytics exports, or private business information.

## License

This project is available under the [MIT License](LICENSE).

## About AutoCoder

AutoCoder helps people turn ideas into published websites. Learn more at [AutoCoder.cc](https://autocoder.cc).
