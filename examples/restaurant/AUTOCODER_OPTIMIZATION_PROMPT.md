# AutoCoder optimization prompt

Copy the prompt below into a duplicated Juniper Brick project. Keep the original deployment unchanged as the public “before” version.

---

Improve the existing fictional Juniper Brick restaurant website while preserving its visual identity, responsive layout, menu content, fictional business details, and editorial tone.

This is the optimized “after” version of an open-source website audit example. Do not replace any fictional information with real customer or business data.

## Preserve

- Business name: Juniper Brick
- Category: Farm-to-table restaurant
- Location: Buffalo, New York
- Address: 100 Example Street, Buffalo, NY 14202
- Phone: +1 (716) 555-0142
- Email: hello@juniperbrick.example
- Existing visual design, menu, sourcing story, hours, and fictional reviews
- Exactly one visible H1: “Seasonal plates, warm nights.”
- Indexable public website

## Required discoverability improvements

1. Set the document title to:
   `Farm-to-Table Restaurant in Buffalo | Juniper Brick`

2. Add this meta description:
   `Discover seasonal, wood-fired dining at Juniper Brick, a farm-to-table restaurant in Buffalo. Explore dinner and weekend brunch, then book your table.`

3. Add a self-referencing canonical link using the final public URL of the optimized deployment. Do not use a preview, editor, localhost, or temporary URL.

4. Keep exactly one H1 and preserve the existing visible service and Buffalo references.

5. Add valid JSON-LD using the `Restaurant` type. It must match the visible page and include only these fictional public facts:
   - name: Juniper Brick
   - URL: final public URL of the optimized deployment
   - telephone: +1-716-555-0142
   - email: hello@juniperbrick.example
   - address: 100 Example Street, Buffalo, NY 14202, US
   - servesCuisine: Seasonal American, Wood-Fired
   - priceRange: $$
   - opening hours matching the visible Visit section

6. Serve a real `/robots.txt` file with `text/plain` content. It must allow public crawling and reference the final sitemap URL. Do not route this path to the HTML application shell.

7. Serve a real `/sitemap.xml` file containing the optimized homepage URL. It must return XML containing a `urlset` element and must not route to the HTML application shell.

8. If the platform supports static generation, server rendering, or prerendering, include the page title, meta description, canonical URL, JSON-LD, H1, restaurant description, Buffalo location, phone number, and opening hours in the initial HTML response. Keep the client-rendered experience visually identical.

## Required conversion improvements

1. Add a prominent hero button labeled exactly `Book a Table`.

2. Add the same booking action to the desktop and mobile header without crowding the navigation.

3. Link booking actions to a new `#booking` section on the same page.

4. Add a fictional booking form with:
   - date;
   - time;
   - party size;
   - guest name;
   - email;
   - phone;
   - an accessible submit button labeled `Request a Table`.

5. The demo form must not transmit data to a real service. On submission, validate the fields locally and show a clear message that this is a fictional demonstration and no reservation was created.

6. Label the existing review section `Guest Reviews` so visitors can understand the type of trust evidence being shown.

## Quality requirements

- Preserve keyboard navigation, visible focus styles, semantic landmarks, responsive behavior, and accessible contrast.
- Do not add analytics, tracking, authentication, payments, third-party reservation services, credentials, API keys, or real customer data.
- Do not create doorway pages, duplicate location pages, hidden text, or keyword stuffing.
- Do not promise rankings, traffic, bookings, or revenue.
- Verify the optimized production deployment, not only the editor preview.

Before finishing, confirm that the production versions of `/robots.txt` and `/sitemap.xml` return the intended plain text and XML files rather than the website HTML.
