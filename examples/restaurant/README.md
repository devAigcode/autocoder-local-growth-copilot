# Juniper Brick restaurant example

Juniper Brick is a fictional farm-to-table restaurant website generated to exercise Launch Check behavior on a modern client-rendered application.

- Live demonstration: https://juniperbrick.autocoder.store
- Business context: [`juniper-brick-profile.json`](juniper-brick-profile.json)
- Before report: [`reports/before.md`](reports/before.md)
- Before/after comparison: [`COMPARISON.md`](COMPARISON.md)
- AutoCoder optimization prompt: [`AUTOCODER_OPTIMIZATION_PROMPT.md`](AUTOCODER_OPTIMIZATION_PROMPT.md)
- Primary conversion goal: booking
- Location: Buffalo, New York

The live site is useful for manual demonstrations, but automated tests do not depend on its availability. A minimal, deterministic representation of its client-rendered HTML shell is stored in `test/fixtures/juniper-brick-shell.html`.

## Static audit

```bash
node ./bin/autocoder-growth.js https://juniperbrick.autocoder.store \
  --profile examples/restaurant/juniper-brick-profile.json
```

The static audit should detect that the initial HTML is an application shell. Rules that require rendered body content should return `not-applicable`, and categories with less than 50% evidence coverage should return an `N/A` score.

## Browser-rendered audit

Install the optional browser dependency once:

```bash
npm install playwright
npx playwright install chromium
```

Then run:

```bash
node ./bin/autocoder-growth.js https://juniperbrick.autocoder.store \
  --profile examples/restaurant/juniper-brick-profile.json \
  --render
```

Browser rendering is opt-in because it is slower and loads executable page code. URL validation is applied to the main document, redirects, and browser network requests.
