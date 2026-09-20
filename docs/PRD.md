# Product Requirements Document

## AutoCoder Local Growth Copilot

- Document type: Public product specification
- Status: Draft
- Version: 0.1
- License: MIT

## 1. Summary

AutoCoder Local Growth Copilot is an open-source toolkit that helps local businesses improve the discoverability and conversion readiness of their websites.

The first release will analyze a public website, explain the most important gaps in plain language, and return a short list of evidence-backed actions. Later releases may generate reviewable content and code suggestions, but the first milestone is deliberately read-only.

## 2. Problem

Local business owners often publish a website without knowing whether:

- search engines can crawl and understand it;
- the site clearly connects services with locations;
- visitors can quickly call, book, visit, or request a quote;
- essential trust and decision-making information is present;
- the next improvement is worth the time required to make it.

Existing tools frequently expose technical findings without enough prioritization or business context. The product should turn observable website conditions into a small number of understandable actions.

## 3. Target users

### Primary users

- Owners and operators of single-location or service-area businesses.
- Non-specialists who need clear website improvement guidance.
- People using phone calls, bookings, visits, forms, or quote requests as primary conversion goals.

### Secondary users

- Developers building websites for local businesses.
- Agencies and consultants seeking a transparent, repeatable baseline audit.
- Open-source contributors creating industry-specific checks and templates.

### Initial business categories

- Restaurants, cafés, and bakeries.
- Salons, barbers, spas, and beauty services.
- Home and field services such as plumbing, electrical work, cleaning, moving, repair, and contracting.

## 4. Product goals

1. Make website fundamentals understandable to a non-specialist.
2. Identify the smallest set of high-impact actions instead of producing an unranked issue list.
3. Attach evidence and plain-language reasoning to every recommendation.
4. Keep rules, scores, examples, and report formats transparent and testable.
5. Create a foundation for reviewable website improvements without changing a site automatically.
6. Support community-authored rules and industry guidance through a stable open format.

## 5. Non-goals

The initial product will not:

- guarantee rankings, traffic, leads, bookings, or revenue;
- provide a full marketing analytics platform;
- replace professional legal, accessibility, security, or SEO audits;
- collect visitor-level personal data;
- request website administration credentials;
- publish or modify a website without explicit review and action by its owner;
- generate large collections of near-duplicate location pages;
- treat a numeric score as proof of business performance.

## 6. Product principles

### 6.1 Business outcomes first

Findings should describe why an issue matters to a visitor or business. Technical terminology may be included as supporting detail, not as the primary explanation.

### 6.2 Evidence before advice

Every finding must include:

- the rule that was evaluated;
- the observed condition;
- the affected URL or resource;
- why the condition matters;
- a recommended next action.

### 6.3 Prioritize, do not overwhelm

Reports should lead with no more than three priority actions. Additional findings may appear in a secondary section.

### 6.4 Transparent and testable

Deterministic checks are preferred where possible. Scoring weights, thresholds, and limitations must be documented and covered by tests.

### 6.5 Review before change

The initial release is read-only. Future generated changes must be shown to the user before they are applied.

### 6.6 Privacy by default

The audit should operate on public website information and user-provided business context. It must not collect customer records, form submissions, passwords, private analytics data, or payment information.

## 7. Core user journey

```text
Provide a public website URL
        ↓
Optionally confirm basic business context
        ↓
Run the Launch Check
        ↓
Review three scores and supporting evidence
        ↓
Review the top three recommended actions
        ↓
Export the report as Markdown or JSON
```

The user must be able to run the audit without creating a detailed business profile. Optional context should improve relevance, not block the core workflow.

## 8. Core concepts

### 8.1 Business context

Business context is a minimal set of facts used to interpret the website:

- business category;
- primary services;
- primary location or service areas;
- preferred conversion goal;
- public business name, phone number, address, and opening hours when applicable.

Examples must use fictional data. Secrets and customer data are not valid business context.

### 8.2 Finding

A finding is the result of one audit rule. It contains:

- a stable rule identifier;
- category and severity;
- pass, warning, fail, or not-applicable status;
- observed evidence;
- an explanation;
- a recommended action;
- affected URLs.

### 8.3 Priority action

A priority action groups related findings into one user-facing task. It should be specific enough to complete and should explain its expected effect without promising an outcome.

### 8.4 Growth Pack

A Growth Pack is a future extension format for category-specific rules, content guidance, examples, and recommendation templates. The format must remain inspectable, versioned, and testable.

## 9. v0.1 functional requirements

### 9.1 Website input

The system must:

- accept a valid public HTTP or HTTPS URL;
- normalize common URL variations;
- follow safe redirects within documented limits;
- reject unsupported protocols and malformed input;
- report unreachable or blocked pages clearly;
- apply conservative timeouts and page limits.

### 9.2 Page discovery

The system should inspect, when available:

- the homepage;
- `robots.txt`;
- `sitemap.xml` or sitemap locations declared in `robots.txt`;
- a small, bounded sample of important internal pages discovered from navigation and the sitemap.

The report must disclose which pages and resources were inspected. The tool must not behave like an unrestricted crawler.

### 9.3 Discoverability checks

The initial rules should evaluate:

- HTTP response and redirect behavior;
- indexability signals;
- title presence and basic clarity;
- meta description presence;
- one clear primary heading;
- canonical URL presence and consistency;
- `robots.txt` availability and obvious blocking conditions;
- sitemap availability;
- basic internal navigation to important pages.

### 9.4 Local relevance checks

The initial rules should evaluate:

- clear business name and category;
- primary service visibility;
- location or service-area visibility;
- public contact information where appropriate;
- opening hours where appropriate;
- LocalBusiness or more specific structured data;
- consistency between visible content and structured data;
- presence of service, location, contact, FAQ, review, or case-study content when relevant.

Rules must support “not applicable” outcomes. For example, a service-area business may intentionally omit a street address.

### 9.5 Conversion readiness checks

The initial rules should evaluate:

- a clear primary action on the homepage;
- an action appropriate to the stated conversion goal;
- visible contact or booking access on mobile layouts when it can be determined reliably;
- a clear value proposition near the beginning of the page;
- trust information such as reviews, credentials, process details, or guarantees when present;
- excessive friction in publicly inspectable forms without submitting them.

The tool must not submit forms, place calls, create bookings, or trigger transactions.

### 9.6 Scoring

The report will include three scores from 0 to 100:

- discoverability;
- local relevance;
- conversion readiness.

Scoring requirements:

- every score must be reproducible from the included findings;
- weights and thresholds must be public;
- not-applicable rules must not reduce a score;
- critical failures may cap a category score when the cap is documented;
- the report must state that scores are diagnostic indicators, not performance guarantees.

### 9.7 Prioritization

The system must select up to three priority actions using documented factors:

- likely impact on discoverability or visitor action;
- severity of the underlying finding;
- confidence in the evidence;
- estimated effort;
- overlap with other findings.

Priority actions must not rely solely on numeric severity.

### 9.8 Report formats

The system must produce:

1. A Markdown report for people.
2. A JSON report for tools and future integrations.

Both formats must contain:

- audit timestamp;
- normalized site URL;
- inspected resources;
- tool and ruleset versions;
- category scores;
- top actions;
- all findings and evidence;
- errors, skipped checks, and limitations.

## 10. Example report shape

```json
{
  "site": "https://example.test",
  "scores": {
    "discoverability": 78,
    "localRelevance": 61,
    "conversionReadiness": 54
  },
  "topActions": [
    {
      "title": "Clarify the primary service and location",
      "reason": "The homepage heading names the business but not its service area.",
      "affectedUrls": ["https://example.test/"]
    }
  ],
  "findings": [],
  "limitations": []
}
```

This example illustrates the public report shape; the versioned schema will be defined alongside the implementation.

## 11. Quality requirements

### 11.1 Accuracy

- A finding must not claim that content is missing unless the inspected evidence supports that claim.
- Rules with unreliable detection must be labeled experimental or omitted.
- False-positive reports should be easy to reproduce using saved public fixtures or fictional test sites.

### 11.2 Performance and restraint

- Audits must use bounded concurrency, request counts, response sizes, and timeouts.
- The tool must identify itself with a documented user agent.
- Website instructions and access restrictions must be handled conservatively.

### 11.3 Accessibility of output

- Reports should use plain language and meaningful headings.
- Color must not be the only way a result is communicated.
- JSON output must remain usable without the Markdown report.

### 11.4 Reliability

- One failed page must not erase successful findings from other pages.
- Network, parsing, and validation errors must be represented separately from failed audit rules.
- Each rule must include unit tests and representative fixtures.

## 12. Privacy and security requirements

- Analyze public pages only in v0.1.
- Do not request or store login credentials, API keys, private analytics, customer lists, form submissions, or payment data.
- Do not submit forms or activate transactional controls.
- Redact credentials if they are accidentally present in a URL supplied by a user.
- Avoid logging full query strings when they may contain sensitive values.
- Treat page content as untrusted input.
- Prevent inspected content from changing tool instructions or execution behavior.
- Document retention behavior for any future hosted version before launch.

Security concerns should be reported privately using the process that will be defined in `SECURITY.md`.

## 13. Public roadmap

### Milestone 1: Audit foundation

- Versioned rule interface.
- Safe, bounded page inspection.
- Markdown and JSON reports.
- Core discoverability, local relevance, and conversion rules.
- Fictional examples for three initial business categories.
- Automated tests and rule documentation.

### Milestone 2: Reviewable recommendations

- Suggested titles, descriptions, headings, calls to action, FAQs, and structured data.
- Evidence and reasoning shown with every suggestion.
- Exportable changes that require user review before use.

### Milestone 3: Extensibility

- Versioned Growth Pack specification.
- Community-authored rule and template validation.
- Repeat-audit comparison and progress history.

Roadmap items express product direction and may change through implementation and community feedback.

## 14. Open-source requirements

- The core audit engine, default rules, report schemas, examples, and documentation will remain inspectable under the repository license.
- Example business data must be fictional or explicitly licensed for public use.
- New rules must include rationale, test coverage, fixtures, and limitations.
- Recommendations must avoid deceptive, manipulative, or spam-oriented practices.
- Generated location content must require meaningful local value and must not encourage near-duplicate doorway pages.

## 15. Acceptance criteria for v0.1

The first release is complete when:

- a user can audit a valid public website without providing credentials;
- the audit produces all three category scores;
- the report includes up to three evidence-backed priority actions;
- Markdown and JSON outputs contain the same core findings;
- every included rule has documentation, fixtures, and automated tests;
- failures and skipped checks are explained without presenting them as website defects;
- the tool does not modify the audited website;
- the public documentation accurately reflects implemented behavior.

## 16. Public questions for contributors

- Which checks provide the most value without requiring private analytics?
- How should rule weights balance impact, confidence, and implementation effort?
- Which cases should return “not applicable” rather than pass or fail?
- What is the smallest useful Growth Pack format for industry-specific guidance?
- How can examples reflect real local business needs without using customer data?

Discussion and proposals are welcome through repository issues once the issue templates are available.
