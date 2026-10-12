# Design

## Source of truth
Active, 2026-10-12. Single-page academic website at `/clustersplat/`.
Evidence: `neurips2026/main_0506_revision.tex`, its active revised sections and tables,
shared figure PDFs, and the archived OpenReview author-console PDF (author order).
The manuscript is the content baseline; it is not treated as a camera-ready release.
The initial placeholder contained no research assets or established design system.

## Brand
ClusterSplat, NeurIPS 2026. Clear academic presentation with authentic research figures.
Avoid decorative stock imagery and unsupported performance claims.

## Product goals
Explain cluster-level target selection and let readers inspect methods, results,
code, and citation. Success: correct source-derived content and readable figures.
Non-goals: browser model inference, internal review notes, installation/hosting guidance.

## Personas and jobs
Researchers comparing grounding methods; readers seeking a concise introduction;
users seeking the implementation and citation.

## Information architecture
Title/authors/resources → teaser → idea → method → qualitative comparisons →
benchmark tables → limitations → citation. Anchors are the navigation model.

## Design principles
Lead with the visual distinction; keep 2D mask rendering and Top-1 3D selection
accurate; preserve metric units and evaluation scope; show only available resources.

## Visual language
White background, dark ink, restrained blue accent, system sans-serif type.
Maximum figure width 1120px and prose width 820px; 20–24px mobile gutters.
Scientific imagery is rendered from original PDFs, with downloadable figure PDFs.

## Components
Hero, resource buttons, figure/caption, three method steps, benchmark tabs,
semantic tables, citation block. CSS variables in `static/css/site.css` own tokens.

## Accessibility
Semantic landmarks/headings, skip link, descriptive image alt text, visible focus,
keyboard tabs, scoped table headers, horizontally scrollable tables, polite copy status.
Respect reduced-motion preferences. Figure PDFs provide vector-resolution inspection.

## Responsive behavior
Fluid headings/images. Below 700px, method steps stack and resources wrap.
Wide benchmark tables scroll within their own container; the page does not overflow.

## Interaction states
All benchmark tables are visible without JavaScript. With JavaScript, dataset tabs
show one panel. Citation copy is shown only when a secure clipboard API is available;
permission failure provides selectable-text guidance.

## Content voice
English, precise and short. Explain the research rather than the website implementation.
Call quantitative values results reported in the manuscript, not current-code reruns.

## Implementation constraints
Plain HTML/CSS/JavaScript, no dependencies or build tooling. Relative asset paths
support project Pages. Check assets, source metrics, keyboard interaction, and mobile layout.
Cleanup: remove README development, localhost preview, and deployment instructions.

## Open questions
- [ ] Final paper download/arXiv link (author; resource availability). Public OpenReview API returns 403.
- [ ] Affiliations and final author metadata (author; complete masthead).
- [ ] Video and poster assets (author; add only when prepared).
- [ ] Camera-ready metric/config alignment (author; replace manuscript results when finalized).
