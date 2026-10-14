(() => {
  'use strict';
  const root = document.getElementById('explore');
  if (!root) return;
  const get = id => document.getElementById(id);
  const methods = { rgb: 'RGB', langsplat: 'LangSplat', opengaussian: 'OpenGaussian', drsplat: 'Dr.Splat', refersplat: 'ReferSplat', clustersplat: 'ClusterSplat' };
  let data;
  let comparisonVersion = 0;
  let demoVersion = 0;
  let viewIndex = 0;
  const videoPlayers = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const english = value => value.en;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  function activateTab(tab) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      get(item.getAttribute('aria-controls')).hidden = !active;
    });
    videoPlayers.forEach(player => player.sync());
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = tabs[1 - index];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) { event.preventDefault(); activateTab(next); next.focus(); }
    });
  });
  function options(select, entries, previous = select.value) {
    select.replaceChildren(...entries.map(([value, label]) => new Option(label, value)));
    if (entries.some(([value]) => value === previous)) select.value = previous;
  }
  function loadImage(path, alt) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.alt = alt;
      image.decoding = 'async';
      const timeout = setTimeout(() => finish(new Error('Image timed out')), 20000);
      function finish(error) {
        clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
        if (error) reject(error); else resolve(image);
      }
      image.onload = () => image.decode().then(() => finish(), finish);
      image.onerror = () => finish(new Error('Image unavailable'));
      image.src = path;
    });
  }
  function card(image, title, ours = false) {
    const figure = document.createElement('figure');
    figure.className = `explorer-card${ours ? ' ours' : ''}`;
    const caption = document.createElement('figcaption');
    caption.textContent = title;
    const link = document.createElement('a');
    link.href = image.src;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', `Open ${title} image at full size (new tab)`);
    link.append(image);
    figure.append(caption, link);
    return figure;
  }
  function disposeVideo(container) {
    videoPlayers.get(container)?.dispose();
    videoPlayers.delete(container);
  }
  function videoLabel(media, title) {
    return media?.layout === 'methods'
      ? `Synchronized RGB and 3D target selections. Top left: RGB reconstruction; top right: Dr.Splat; bottom left: ReferSplat; bottom right: ClusterSplat. ${title}`
      : `RGB scene and ClusterSplat target: ${title}`;
  }
  const methodVideoIntro = 'Compare Dr.Splat, ReferSplat, and ClusterSplat selections along the same interpolated camera path. The RGB panel shows the reconstructed scene at each pose; orange marks the selected target.';
  function showVideo(container, media, status, fallback, title) {
    const figure = document.createElement('figure');
    const methodLayout = media?.layout === 'methods';
    figure.className = `explorer-video${methodLayout ? ' methods-video' : ''}`;
    if (!methodLayout) {
      const caption = document.createElement('figcaption');
      for (const text of ['RGB scene', 'ClusterSplat target']) {
        const label = document.createElement('span');
        label.textContent = text;
        caption.append(label);
      }
      figure.append(caption);
    }
    const video = document.createElement('video');
    video.controls = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', videoLabel(media, title));
    if (media?.poster) video.poster = media.poster;
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'explorer-retry';
    action.textContent = 'View still images';
    action.hidden = true;
    action.addEventListener('click', fallback);
    figure.append(video, action);
    container.append(figure);
    container.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading video…';
    let disposed = false;
    let failed = false;
    let visible = false;
    let wasActive = false;
    let started = false;
    let timer;
    function fail() {
      if (disposed || failed) return;
      failed = true;
      clearTimeout(timer);
      video.pause();
      video.hidden = true;
      status.textContent = 'This video could not be loaded. You can inspect the still images instead.';
      container.setAttribute('aria-busy', 'false');
      action.hidden = false;
    }
    function ready() {
      if (disposed || failed) return;
      clearTimeout(timer);
      status.textContent = '';
      container.setAttribute('aria-busy', 'false');
    }
    function sync() {
      if (disposed || failed) return;
      const active = visible && !container.closest('[hidden]') && !document.hidden;
      if (active && !started) {
        started = true;
        timer = setTimeout(fail, 20000);
        video.src = media.src;
        video.load();
      }
      if (!active || reducedMotion.matches) video.pause();
      else if (!wasActive) video.play().catch(() => {});
      wasActive = active;
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.15 });
    video.addEventListener('loadedmetadata', ready);
    video.addEventListener('error', fail);
    video.addEventListener('waiting', () => {
      if (disposed || failed) return;
      clearTimeout(timer);
      timer = setTimeout(fail, 20000);
    });
    video.addEventListener('playing', ready);
    video.addEventListener('pause', () => { if (video.readyState >= 1) clearTimeout(timer); });
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    videoPlayers.set(container, { sync, dispose() {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      video.pause();
      video.removeAttribute('src');
      video.load();
    } });
    if (media?.src) observer.observe(video);
    else fail();
  }
  function comparisonChoices() {
    options(get('comparison-description'), data.comparisons.filter(item => item.sceneId === get('comparison-scene').value).map(item => [item.id, english(item.query)]));
  }
  async function renderComparison() {
    const version = ++comparisonVersion;
    const sample = data.comparisons.find(item => item.id === get('comparison-description').value);
    const grid = get('comparison-images');
    disposeVideo(grid);
    grid.replaceChildren();
    get('comparison-note').hidden = true;
    if (!sample) { get('comparison-status').textContent = 'No comparisons available for this scene.'; return; }
    const query = english(sample.query);
    get('comparison-description').title = query;
    get('comparison-query').textContent = query;
    get('comparison-query').lang = 'en';
    get('comparison-category').textContent = english(sample.category);
    get('comparison-category').lang = 'en';
    const representation = get('comparison-representation').value;
    const isVideo = representation === 'video';
    grid.classList.toggle('video-mode', isVideo);
    const methodVideo = sample.video?.layout === 'methods';
    get('comparison-heading').textContent = isVideo ? (methodVideo ? 'Methods in motion' : 'ClusterSplat in motion') : 'Matched comparisons';
    get('comparison-intro').textContent = isVideo ? (methodVideo ? `${methodVideoIntro} Choose Rendered 2D or 3D selection to inspect still comparisons.` : 'Watch the scene and selected target along the camera path. Choose Rendered 2D or 3D selection to compare methods.') : 'Matched views from manuscript figures and precomputed results. Compare RGB, Dr.Splat, ReferSplat, and ClusterSplat together.';
    if (isVideo) {
      showVideo(grid, sample.video, get('comparison-status'), () => {
        get('comparison-representation').value = 'rendered';
        renderComparison();
        get('comparison-representation').focus();
      }, query);
      return;
    }
    const available = sample.images?.[representation] || {};
    if (representation === 'top') get('comparison-intro').textContent = 'Compare RGB, Dr.Splat, ReferSplat, and ClusterSplat in the same top view. RGB is a color projection of the reconstructed scene; yellow marks each method’s selected target.';
    const selected = ['rgb', 'drsplat', 'refersplat', 'clustersplat'];
    grid.classList.add('four-methods');
    const missing = selected.filter(method => !available[method]);
    if (missing.length) {
      grid.setAttribute('aria-busy', 'false');
      get('comparison-status').textContent = `The complete four-panel comparison is unavailable: ${missing.map(method => methods[method]).join(', ')} missing. Choose another representation or example.`;
      return;
    }
    get('comparison-status').textContent = 'Loading matched views…';
    grid.setAttribute('aria-busy', 'true');
    try {
      const images = await Promise.all(selected.map(method => loadImage(sample.images[representation][method], `${methods[method]} — ${representation === 'top' ? '3D selection' : 'rendered 2D'}: ${query}`)));
      if (version !== comparisonVersion) return;
      grid.replaceChildren(...images.map((image, index) => card(image, methods[selected[index]], selected[index] === 'clustersplat')));
      const source = get('comparison-source');
      const provenance = sample.provenance;
      const sourceUrl = sample.sourcePdf || provenance?.url;
      source.hidden = !sourceUrl;
      if (sourceUrl) source.href = sourceUrl;
      else source.removeAttribute('href');
      source.textContent = sample.sourcePdf ? 'Open source figure PDF ↗' : 'Open result source ↗';
      get('comparison-provenance').textContent = provenance?.label ? english(provenance.label) : sample.sourceKind === 'precomputed' ? 'Precomputed matched results.' : '';
      get('comparison-note').hidden = false;
      get('comparison-status').textContent = '';
    } catch {
      if (version === comparisonVersion) get('comparison-status').textContent = 'These images could not be loaded. Choose another example or retry loading below.';
      if (version === comparisonVersion) get('explorer-retry').hidden = false;
    } finally { if (version === comparisonVersion) grid.setAttribute('aria-busy', 'false'); }
  }
  function currentDemo() { return data.demos.find(item => item.id === get('demo-scene').value); }
  function demoChoices() {
    options(get('demo-query'), currentDemo().queries.map(item => [item.id, english(item.text)]));
    viewIndex = 0;
  }
  function updateWipe() {
    const value = get('demo-wipe').value;
    const image = root.querySelector('.highlight-image');
    if (image) image.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    const divider = root.querySelector('.demo-wipe-divider');
    if (divider) divider.style.left = `${value}%`;
    get('demo-wipe').setAttribute('aria-valuetext', `${value} percent target highlight`);
  }
  async function renderDemo() {
    const version = ++demoVersion;
    const query = currentDemo().queries.find(item => item.id === get('demo-query').value);
    const container = get('demo-images');
    disposeVideo(container);
    container.replaceChildren();
    get('demo-wipe-control').hidden = true;
    const isVideo = get('demo-display').value === 'video';
    const views = get('demo-views');
    views.hidden = isVideo;
    const methodVideo = query?.video?.layout === 'methods';
    get('demo-intro').textContent = isVideo && methodVideo ? methodVideoIntro : 'Watch the scene and selected target along the camera path. Choose Image slider or Side by side to inspect individual captured views.';
    get('demo-note').textContent = isVideo ? (methodVideo ? 'All four panels share the same camera path. RGB shows the reconstructed scene at each interpolated pose.' : 'Orange marks the selected target. Video shows the scene and target along the camera path.') : 'Orange marks the selected target. Use the camera buttons to move between captured views.';
    views.replaceChildren();
    if (!query || !query.views.length) { get('demo-status').textContent = 'No captured views available for this description.'; return; }
    viewIndex = Math.min(viewIndex, query.views.length - 1);
    const view = query.views[viewIndex];
    const text = english(query.text);
    get('demo-query').title = text;
    get('demo-query-text').textContent = text;
    get('demo-query-text').lang = 'en';
    if (isVideo) {
      showVideo(container, query.video, get('demo-status'), () => {
        get('demo-display').value = 'wipe';
        renderDemo();
        get('demo-display').focus();
      }, text);
      return;
    }
    function viewButton(label, index, active = false) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.disabled = index < 0 || index >= query.views.length;
      if (active) button.setAttribute('aria-pressed', 'true');
      button.addEventListener('click', () => {
        viewIndex = index;
        renderDemo();
        // Rendering replaces view buttons; retain keyboard focus on the selected view.
        views.querySelector('[aria-pressed="true"]').focus();
      });
      return button;
    }
    views.append(viewButton('← Previous', viewIndex - 1));
    query.views.forEach((item, index) => {
      const button = viewButton(english(item.label), index, index === viewIndex);
      button.setAttribute('aria-pressed', String(index === viewIndex));
      button.lang = 'en';
      views.append(button);
    });
    views.append(viewButton('Next →', viewIndex + 1));
    get('demo-status').textContent = 'Loading captured view…';
    container.setAttribute('aria-busy', 'true');
    try {
      const [rgb, highlight] = await Promise.all([loadImage(view.rgb, `RGB scene, ${english(view.label)}`), loadImage(view.highlight, `Orange target highlight: ${text}, ${english(view.label)}`)]);
      if (version !== demoVersion) return;
      if (get('demo-display').value === 'side') {
        const side = document.createElement('div');
        side.className = 'demo-side';
        side.append(card(rgb, 'RGB scene'), card(highlight, 'ClusterSplat target', true));
        container.append(side);
      } else {
        const wipe = document.createElement('div');
        wipe.className = 'demo-wipe';
        highlight.className = 'highlight-image';
        const divider = document.createElement('span');
        divider.className = 'demo-wipe-divider';
        divider.setAttribute('aria-hidden', 'true');
        wipe.append(rgb, highlight, divider);
        const labels = document.createElement('div');
        labels.className = 'demo-wipe-labels';
        for (const label of ['Target highlight', 'RGB scene']) { const span = document.createElement('span'); span.textContent = label; labels.append(span); }
        container.append(wipe, labels);
        get('demo-wipe-control').hidden = false;
        updateWipe();
      }
      get('demo-status').textContent = '';
    } catch {
      if (version === demoVersion) {
        get('demo-status').textContent = 'This captured view could not be loaded. Select another view or retry loading examples.';
        get('explorer-retry').hidden = false;
      }
    } finally { if (version === demoVersion) container.setAttribute('aria-busy', 'false'); }
  }
  function populate() {
    options(get('comparison-scene'), [...new Set(data.comparisons.map(item => item.sceneId))].map(id => [id, id]));
    comparisonChoices();
    options(get('demo-scene'), data.demos.map(item => [item.id, `${english(item.title)} · ${item.sceneId}`]));
    if (data.demos.length) demoChoices();
    for (const id of ['comparison-description', 'demo-scene', 'demo-query']) get(id).lang = 'en';
    renderComparison();
    if (data.demos.length) renderDemo();
    else get('demo-status').textContent = 'Scene demonstrations are not available yet. Explore the matched comparisons in the other tab.';
  }
  async function loadData() {
    get('explorer-status').textContent = 'Loading examples…';
    get('explorer-retry').hidden = true;
    get('comparison-controls').disabled = true;
    get('demo-controls').disabled = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('./static/data/explorer.json?v=20261014-rgb-times', { signal: controller.signal });
      if (!response.ok) throw new Error('Manifest unavailable');
      const manifest = await response.json();
      if (manifest.version !== 1 || !Array.isArray(manifest.comparisons) || !Array.isArray(manifest.demos)) throw new Error('Unsupported manifest');
      data = manifest;
      populate();
      get('comparison-controls').disabled = !data.comparisons.length;
      get('demo-controls').disabled = !data.demos.length;
      const sceneCount = new Set(data.comparisons.map(item => item.sceneId)).size;
      get('explorer-status').textContent = `${data.comparisons.length} examples across ${sceneCount} scenes · ${data.demos.length} scene galleries`;
    } catch {
      get('explorer-status').textContent = 'Examples could not be loaded. Retry or view the full comparison figures below.';
      get('explorer-retry').hidden = false;
    } finally { clearTimeout(timeout); }
  }
  get('comparison-scene').addEventListener('change', () => { comparisonChoices(); renderComparison(); });
  for (const id of ['comparison-description', 'comparison-representation']) get(id).addEventListener('change', renderComparison);
  get('demo-scene').addEventListener('change', () => { demoChoices(); renderDemo(); });
  get('demo-query').addEventListener('change', () => { viewIndex = 0; renderDemo(); });
  get('demo-display').addEventListener('change', renderDemo);
  get('demo-wipe').addEventListener('input', updateWipe);
  get('explorer-retry').addEventListener('click', loadData);
  loadData();
})();
