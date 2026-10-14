# Design

## Source of truth
Active, 2026-10-14. Single-page academic website at `/clustersplat/`.
Evidence: `neurips2026/main.tex`, its active revised sections and tables,
shared figure PDFs, and the archived OpenReview author-console PDF (author order).
The manuscript is the content baseline; it is not treated as a camera-ready release.
The initial placeholder contained no research assets or established design system.

## Brand
ClusterSplat, NeurIPS 2026 Spotlight (confirmed by the author). Clear academic presentation with authentic research figures.
A compact, comma-separated author row sits below the title, followed by `School of Computing, KAIST` (confirmed by the author on 2026-10-14) and the centered conference line; Spotlight uses bold type in the existing blue accent. Preserve the confirmed author order and omit unconfirmed contribution markers.
Visual references: [LightGaussian](https://lightgaussian.github.io/), [AsymGS](https://steveli88.github.io/AsymGS/), and [Model-Dowser](https://model-dowser.github.io/) for compact author typography and dark icon-and-label resource pills. These are design references, not sources for author metadata or research claims.
Avoid decorative stock imagery and unsupported performance claims.

## Product goals
Explain cluster-level target selection and let readers inspect methods, results,
available resources. Lead with synchronized four-panel videos, then let readers compare matched examples from manuscript figures and precomputed results and inspect precomputed scene views. Success: correct source-derived content, readable figures, responsive keyboard-accessible controls, and no result mixing while images load.
Non-goals: browser model inference, internal review notes, installation/hosting guidance.

## Personas and jobs
Researchers comparing grounding methods; readers seeking a concise introduction;
users seeking the implementation and citation.

## Information architecture
Title/authors/affiliation/Spotlight/resources → teaser → idea → method → interactive examples → qualitative comparisons →
benchmark tables → limitations. Anchors are the navigation model.

## Design principles
Lead with the visual distinction; keep 2D mask rendering and Top-1 3D selection
accurate; preserve metric units and evaluation scope; show only available resources.

## Visual language
White background, dark ink, restrained blue accent, system sans-serif type.
Maximum figure width 1120px and prose width 820px; 20–24px mobile gutters.
Scientific imagery is rendered from original PDFs, with downloadable figure PDFs.

## Components
Hero, resource buttons, figure/caption, three method steps, benchmark tabs,
and semantic tables. Dark rounded resource pills link to examples; a
non-interactive Code / Coming soon pill announces the forthcoming model release.
Method and Results use secondary text navigation. Citation and its resource
button are withheld until an arXiv entry is available. Ref-LERF figures, tables,
and related claims are excluded from the current public page.

One explorer offers scene, original English description, and representation
selectors for 41 matched examples across seven scenes. There are no separate
results/scenes tabs or a secondary scene gallery. Video is the default:
a silent 2×2 movie shows RGB (top left), Dr.Splat (top right), ReferSplat
(bottom left), and ClusterSplat (bottom right) along the same interpolated
camera path. Orange marks each method’s selected 3D target; RGB shows the
reconstructed scene at each pose. Rendered 2D and 3D selection always display
RGB and the three methods together; missing assets report an incomplete
comparison. Four cards become two columns on tablets and one on phones.
Source PDFs appear only when provided. Movies use layout `methods` and a 5:4
mosaic with Times New Roman labels embedded within each panel, without an
additional caption above the movie. CSS variables in `static/css/site.css`
own tokens.

## Accessibility
Semantic landmarks/headings, skip link, descriptive image alt text, visible focus,
keyboard-accessible controls, scoped table headers, horizontally scrollable tables.
Respect reduced-motion preferences. Figure PDFs provide vector-resolution inspection.

## Responsive behavior
Fluid headings/images. Below 700px, method steps stack and resources wrap.
Explorer controls and image cards stack on small screens. Wide benchmark tables scroll within their own container; the page does not overflow at 390px.
Four-method movies use at most 78% of the viewport height for their 5:4 image,
so all four panels can be viewed together on desktop. Their width stays within
the content area on phones.

## Interaction states
Both benchmark tables are visible without JavaScript. With JavaScript, ScanRefer
and ScanNet v2 dataset tabs show one panel at a time.

Explorer controls stay disabled until the manifest loads. Fetch/image failures show a retry path and retain the full figures as a fallback. Matched images appear together only after decoding; generation counters discard obsolete selections. The no-JavaScript message links to the full figures. Native video controls support manual playback, with muted looping inline playback only for an active visible player when reduced motion is not requested. Hidden/offscreen movies pause; replaced players release their media and observers. Missing, failed, or timed-out video loads offer a still-image fallback. Descriptions retain their original English wording in both dropdown options and the full query below; no translation selector is shown. Dropdowns stay within their responsive column, with the full selected expression available below and in a tooltip.

## Content voice
English, precise and short, with original English expressions for descriptions and English titles, categories, and camera labels. Explain the research rather than the website implementation.
Call quantitative values results reported in the manuscript, not current-code reruns. Distinguish manuscript-derived figures, precomputed matched comparisons through source information. Do not expose checkpoint selection labels.

## Implementation constraints
Plain HTML/CSS/JavaScript, no dependencies or build tooling. Relative asset paths
support project Pages. Check assets, source metrics, keyboard interaction, and mobile layout.
The explorer reads `static/data/explorer.json` and precomputed images/videos using relative URLs. Video paths and posters are provided per comparison. Model inference stays offline. Keep README focused on research content and available interactions.

The expanded collection contains 41 comparisons across seven ScanRefer scenes:
six distinct target objects per scene, with five in scene0200_00. Examples are
selected for 3D target IoU against reproduced Dr.Splat (top 3%) and ReferSplat
(top 1%) outputs. Each 2D comparison uses the same dataset RGB frame and
method mask; the RGB panel displays the captured image without a mask. 3D
panels share scene bounds; method selections use yellow/blue, and the RGB
reference uses native SH DC colors projected from the current reconstruction.
This selection criterion appears in the provenance note. Keep aggregate tables
as manuscript results. Videos render nearby numerically ordered training poses
with linear translation, SLERP rotation and a smooth closed return path. Use
six-second, 24 fps H.264/yuv420p movies with early MP4 metadata. Exact render
and checkpoint evidence stays outside the public site.
Movie panel titles use the actual Times New Roman font rendered into pixels;
font files are not served by the page. Titles occupy a 32px header, with glyph
bounds centered vertically to provide equal visible top and bottom spacing.

## Open questions
- [ ] Final paper download/arXiv link (author; resource availability). Public OpenReview API returns 403.
- [ ] Final author links and contribution markers (author; complete masthead).
- [ ] Camera-ready metric/config alignment (author; replace manuscript results when finalized).
