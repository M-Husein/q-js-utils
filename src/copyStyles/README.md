# copyStyles
Copy styles from parent doc to child doc.

## Usage
```ts
import { copyStyles } from 'q-js-utils/copyStyles';


```

# Original / Current Code
```ts
export const copyStyles = (source: Document, target: Document): void => {
  const frag = target.createDocumentFragment();

  Array.from(source.styleSheets).forEach(styleSheet => {
    try {
      if (styleSheet.cssRules) {
        const style = target.createElement("style");
        Array.from(styleSheet.cssRules).forEach(rule => {
          style.appendChild(target.createTextNode(rule.cssText));
        });
        frag.appendChild(style);
      }
    } catch {
      if (styleSheet.href) {
        const link = target.createElement("link");
        link.rel = "stylesheet";
        link.href = styleSheet.href;
        frag.appendChild(link);
      }
    }
  });

  target.head.appendChild(frag);
}
```
