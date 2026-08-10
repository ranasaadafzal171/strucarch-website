# Struc-Arch Pakistan Website

Live site: **https://strucarch.com** (Cloudflare Pages)

## Build Settings
- **Framework preset:** None (pure static HTML/CSS)
- **Build command:** (empty — no build step)
- **Build output directory:** `/` (this folder)
- **Root directory:** `/`

## Deployment
This folder is synced from the canonical source:
`D:\site data 10.08.2026\strucarch-website-main\strucarch-website-main`
(Seo planning docs under `seo/` and `AGENTS.md` are intentionally excluded from deployment.)

1. Cloudflare Dashboard > Pages > your project
2. Upload assets (drag-and-drop) or connect the Git repo
3. Build settings as above; no environment variables needed

## Project Structure
```
strucarch-site/
├── index.html              # Homepage (H1: Structural Engineering, Construction & PM Consultancy in Pakistan)
├── about.html              # About the principal + 3 Google reviews (star ratings)
├── products.html           # Services overview
├── knowledge.html          # Knowledge hub (6 topic pages + glossary + 6 Ask cards)
├── ask-*.html              # 6 direct-answer pages (Article + FAQ schema)
├── knowledge-*.html        # 6 knowledge guides incl. 60-term glossary
├── resources.html          # 13 resource templates + checklists
├── blog.html / case-studies*.html / projects.html / gallery.html / tools.html
├── 18 service pages (structural-engineering.html, boq-estimation.html, ...)
├── local-gujranwala.html, contact.html, 404.html
├── assets/                 # CSS, JS, images
├── photos-best/            # Gallery photos
├── _headers                # Cloudflare security + caching headers
├── robots.txt
├── sitemap.xml             # 47 URLs, homepage as / (no index.html)
└── README.md
```

## Notes
- All pages use relative links for navigation
- Schema.org JSON-LD (Organization, Person, ProfessionalService, WebSite, Article, CreativeWork, FAQPage, BreadcrumbList) on all relevant pages; homepage canonical is `https://strucarch.com/`
- Fully responsive; nav collapses to hamburger at ≤1150px
- Principal credentials: Engr. Saad Afzal, MSc Structural Engineering (UET Taxila), PEC `#Civil/32786`; firm `#Consult/2452`
- Hard-refresh (Ctrl+F5) to bypass cached assets after updates
