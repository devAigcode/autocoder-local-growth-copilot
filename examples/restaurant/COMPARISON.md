# Juniper Brick optimization comparison

This document tracks the fictional restaurant example before and after its growth improvements.

| Category | Before | After | Change |
|---|---:|---:|---:|
| Discoverability | 50 | 50 | 0 |
| Local relevance | 75 | 100 | +25 |
| Conversion readiness | 65 | 100 | +35 |

## Before

- Live URL: https://juniperbrick.autocoder.store/
- Report: [`reports/before.md`](reports/before.md)
- Structured summary: [`reports/before-summary.json`](reports/before-summary.json)
- Evidence coverage: 100% in all categories

## After

- Live URL: https://juniperbrick.autocoder.store/
- Report: [`reports/after.md`](reports/after.md)
- Structured summary: [`reports/after-summary.json`](reports/after-summary.json)
- Evidence coverage: 100% in all categories

The project was optimized in place, so the live URL now represents the after state. The original before state remains reproducible through the stored report, normalized fixture, and Golden Test.

Local relevance and conversion readiness reached 100. Discoverability remained at 50 because production metadata and crawler resource routes were not successfully deployed. Use [`AUTOCODER_DISCOVERABILITY_FOLLOWUP.md`](AUTOCODER_DISCOVERABILITY_FOLLOWUP.md) for the remaining work.
