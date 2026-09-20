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

## What it will do

The first release will provide a **Launch Check** for local business websites. It will inspect a public URL and generate:

- a discoverability score;
- a local relevance score;
- a conversion readiness score;
- evidence for every finding;
- the three highest-priority actions;
- human-readable Markdown and machine-readable JSON reports.

Initial checks will cover:

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

This repository is in early development. The product specification is available in [`docs/PRD.md`](docs/PRD.md), and the first implementation milestone is a read-only Launch Check.

There is no production-ready package or command-line interface yet. Command examples will be added only after the interface is implemented and tested.

## Roadmap

### v0.1 — Read-only Launch Check

- Fetch and inspect a public website.
- Run transparent, testable audit rules.
- Produce prioritized Markdown and JSON reports.
- Include example profiles for restaurant, salon, and home-service businesses.
- Add automated tests and documentation for every rule.

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

The planned structure is:

```text
.
├── README.md
├── SKILL.md
├── docs/
│   ├── PRD.md
│   └── growth-pack-spec.md
├── src/
│   ├── audit/
│   ├── rules/
│   └── report/
├── examples/
│   ├── restaurant/
│   ├── salon/
│   └── home-services/
├── tests/
└── .github/
```

Only implemented components will be added to the repository. This layout may evolve as the first release is built.

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
