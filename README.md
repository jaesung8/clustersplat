# ClusterSplat — Project Website

**ClusterSplat: Semantic Cluster Selection for 3D Visual Grounding in Gaussian Splatting**
NeurIPS 2026 · **Spotlight**

- [Project page](https://jaesung8.github.io/clustersplat/)
- Model code will be released soon.

The page presents the research motivation, method overview, ScanRefer visual
comparisons, and manuscript-reported results on ScanRefer and ScanNet v2.

One explorer provides scene, description, and representation controls. It opens
with synchronized four-panel videos: RGB
and Dr.Splat above ReferSplat and ClusterSplat. Orange highlights each method’s
3D target selection along the same interpolated camera path. RGB shows the
reconstructed scene at each interpolated pose. Choose Rendered 2D or 3D
selection to compare matched results from manuscript figures and precomputed
outputs. Still comparisons always display RGB, Dr.Splat, ReferSplat,
and ClusterSplat together.
Rendered 2D uses the original captured RGB image. The 3D RGB reference uses
native scene colors in the same top-view projection as the selection panels.
Videos have native playback controls and respect reduced
motion preferences; still images remain available if a video cannot load. Descriptions use the original English expressions.
All examples use precomputed results.

The explorer includes 41 selected ScanRefer comparisons across seven scenes,
with five or six distinct objects per scene. These examples are selected for
3D target IoU against reproduced Dr.Splat and ReferSplat results; aggregate
scores appear in the benchmark tables. Silent six-second videos interpolate
nearby training-camera poses and show RGB alongside the three methods’ 3D target selections.
Embedded panel titles use Times New Roman, centered with equal top and bottom
spacing. The page and descriptions are English throughout.

Figures and benchmark results follow `neurips2026/main.tex` and its source tables.
Manuscript comparisons link to their full-resolution source figures; precomputed
comparisons show their source information when provided.
