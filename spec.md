# RSA Total Solution

## Current State
The project has a blank scaffolding with no custom backend or frontend code. There are no existing pages, components, or data models.

## Requested Changes (Diff)

### Add
- Full business website for RSA Total Solution, an interior design and woodwork company
- Backend: contact form inquiry storage (name, email, phone, message, timestamp)
- Backend: project/portfolio item storage (title, description, category, image URL)
- Frontend: Single-page website with the following sections:
  1. **Hero** - Full-screen section with company name, tagline, and CTA button
  2. **About** - Company overview and values
  3. **Services** - Grid of services offered (interior design, custom woodwork, renovations, furniture, etc.)
  4. **Portfolio/Gallery** - Showcase of past projects with category filter
  5. **Testimonials** - Client reviews carousel or grid
  6. **Contact** - Contact form wired to backend + company contact details
  7. **Footer** - Links, copyright, social media
- Navigation: sticky top nav with smooth scroll to sections

### Modify
- Nothing (fresh build)

### Remove
- Nothing

## Implementation Plan
1. Generate backend with Motoko: contact inquiry storage, portfolio item storage, query/submit APIs
2. Build frontend with all 7 sections, sticky nav, smooth scroll, and wired contact form
3. Generate hero background image and service/portfolio placeholder images
4. Wire contact form to backend submit function
5. Display portfolio items from backend seed data
