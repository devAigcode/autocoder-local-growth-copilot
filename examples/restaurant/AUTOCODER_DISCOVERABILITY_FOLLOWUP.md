# AutoCoder production discoverability follow-up

Use this prompt in the optimized Juniper Brick project after confirming the project is connected to the public URL `https://juniperbrick.autocoder.store/`.

---

The booking, Restaurant JSON-LD, and Guest Reviews improvements are visible in the rendered production page. However, an external production audit confirms that the remaining discoverability changes are not present in the published responses.

Fix only the production discoverability output. Preserve the current design, content, booking flow, Restaurant JSON-LD, and conversion behavior.

## Verified production failures

At `https://juniperbrick.autocoder.store/`:

- the document title is still `Juniper Brick`;
- no meta description is present;
- no canonical link is present;
- `/robots.txt` returns the HTML application shell with `Content-Type: text/html`;
- `/sitemap.xml` returns the HTML application shell with `Content-Type: text/html`.

Do not report these items as complete until they are verified on the published URL.

## Required fixes

1. Update the production HTML document head so the final page contains:

```html
<title>Farm-to-Table Restaurant in Buffalo | Juniper Brick</title>
<meta name="description" content="Discover seasonal, wood-fired dining at Juniper Brick, a farm-to-table restaurant in Buffalo. Explore dinner and weekend brunch, then book your table.">
<link rel="canonical" href="https://juniperbrick.autocoder.store/">
```

These elements must exist in the production DOM after page load. Prefer including them in the initial HTML response when the platform allows it.

2. Serve an actual file or non-SPA route at `/robots.txt` with `Content-Type: text/plain`. Its body must be:

```text
User-agent: *
Allow: /
Sitemap: https://juniperbrick.autocoder.store/sitemap.xml
```

3. Serve an actual file or non-SPA route at `/sitemap.xml` with an XML content type. It must contain:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://juniperbrick.autocoder.store/</loc>
  </url>
</urlset>
```

4. Ensure the hosting configuration does not rewrite `/robots.txt` or `/sitemap.xml` to the SPA `index.html` fallback.

## Mandatory production verification

After publishing, verify all five conditions against `https://juniperbrick.autocoder.store/`, not the editor preview:

- browser title equals `Farm-to-Table Restaurant in Buffalo | Juniper Brick`;
- meta description exists with the requested content;
- canonical equals `https://juniperbrick.autocoder.store/`;
- `/robots.txt` returns crawler directives rather than HTML;
- `/sitemap.xml` returns a `urlset` XML document rather than HTML.

If the AutoCoder hosting layer cannot serve root-level text and XML files, state that limitation clearly instead of claiming the routes are complete.
