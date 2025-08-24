/**
 * Copy styles from parent doc to child doc.
 * 
 * @param source Document to get styles source.
 * @param target Document target to apply copied styles.
 */
export const copyStyles = (source: Document, target: Document): void => {
  let frag = target.createDocumentFragment();

  Array.from(source.styleSheets).forEach(styleSheet => {
    try {
      if (styleSheet.cssRules) {
        let style = target.createElement("style");
        Array.from(styleSheet.cssRules).forEach(rule => {
          style.appendChild(target.createTextNode(rule.cssText));
        });
        frag.appendChild(style);
      }
    } catch {
      if (styleSheet.href) {
        let link = target.createElement("link");
        link.rel = "stylesheet";
        link.href = styleSheet.href;
        frag.appendChild(link);
      }
    }
  });

  target.head.appendChild(frag);
}
