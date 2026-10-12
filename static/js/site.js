"use strict";

const tablist = document.querySelector(".benchmark-tabs");
const tabs = [...tablist.querySelectorAll("a")];
const panels = tabs.map(tab => document.querySelector(tab.getAttribute("href")));
tablist.setAttribute("role", "tablist");
tabs.forEach((tab, index) => {
  tab.id = `benchmark-tab-${index}`;
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-controls", panels[index].id);
  panels[index].setAttribute("role", "tabpanel");
  panels[index].setAttribute("aria-labelledby", tab.id);
  panels[index].tabIndex = 0;
});
function selectBenchmark(index, focus = false) {
  tabs.forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
  });
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", event => {
    event.preventDefault();
    selectBenchmark(index);
  });
  tab.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectBenchmark(next, true);
    }
  });
});
const linkedPanel = panels.findIndex(panel => `#${panel.id}` === window.location.hash);
selectBenchmark(linkedPanel < 0 ? 0 : linkedPanel);

const copyButton = document.querySelector(".copy-button");
const copyStatus = document.querySelector("#copy-status");
if (navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.querySelector("#bibtex").textContent);
      copyStatus.textContent = "Citation copied.";
    } catch {
      copyStatus.textContent = "Copy was unavailable. Select the BibTeX text to copy it.";
    }
  });
}
