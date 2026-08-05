# Lenis Settings

Perfect-feeling smooth scroll setup from this project.

```js
import Lenis from "lenis";
import "lenis/dist/lenis.css";

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const lenis = new Lenis({
    autoRaf: true,
    anchors: true,
    lerp: 0.08,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2,
  });

  window.lenis = lenis;
}
```

Install:

```sh
npm install lenis
```

Notes:

- `autoRaf: true`: Lenis runs its own animation frame loop.
- `anchors: true`: smooth scroll works for hash links.
- `lerp: 0.08`: smooth, slightly heavy easing.
- `wheelMultiplier: 0.9`: mouse wheel feels controlled.
- `touchMultiplier: 1.2`: touch scroll keeps enough speed.
- Reduced motion gate keeps accessibility sane.
