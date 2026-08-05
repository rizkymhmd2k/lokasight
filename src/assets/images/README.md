Put source PNG files here.

Astro only optimizes images that are imported from `src`. Use `Picture` when you
want WebP output:

```astro
---
import { Picture } from "astro:assets";
import image from "../../assets/images/example.png";
---

<Picture
  src={image}
  formats={["webp"]}
  alt="Describe the image"
  loading="lazy"
/>
```

Keep images in `public` only when they must be served as-is.
