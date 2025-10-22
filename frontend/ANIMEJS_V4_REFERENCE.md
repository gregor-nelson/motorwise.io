# Anime.js v4 Reference Guide

This guide documents the correct syntax for using anime.js v4.2.2 with Vite in this project.

## Installation

```bash
npm install animejs
```

Current version in this project: `4.2.2`

## Import Syntax

### Correct Import (v4)
```javascript
import { animate, stagger } from 'animejs';
```

### Common Imports
- `animate` - Main animation function
- `stagger` - For staggered delays on multiple elements
- `createTimeline` - For timeline-based animations
- `createTimer` - For timer-based animations

### ❌ DO NOT USE (v3 syntax)
```javascript
import anime from 'animejs';  // ❌ No default export
import anime from 'animejs/lib/anime.js';  // ❌ Deep imports don't work with Vite
import * as anime from 'animejs';  // ❌ Doesn't provide the right API
```

## Basic Animation Syntax

### v4 Syntax (CORRECT)
```javascript
animate(target, {
  translateY: [-2, 2],
  duration: 3000,
  ease: 'inOutSine',
  alternate: true,
  loop: true
});
```

### v3 Syntax (OUTDATED - Don't use)
```javascript
anime({
  targets: element,
  translateY: [-2, 2],
  duration: 3000,
  easing: 'easeInOutSine',
  direction: 'alternate',
  loop: true
});
```

## Key API Changes from v3 to v4

| Feature | v3 Syntax | v4 Syntax |
|---------|-----------|-----------|
| **Function call** | `anime({ targets: el, ... })` | `animate(el, { ... })` |
| **Easing** | `easing: 'easeInOutSine'` | `ease: 'inOutSine'` |
| **Alternate direction** | `direction: 'alternate'` | `alternate: true` |
| **Targets** | Inside parameters object | First parameter |

## Easing Names

In v4, easing names drop the "ease" prefix:

| v3 | v4 |
|----|-----|
| `easeInOutSine` | `inOutSine` |
| `easeInOutQuad` | `inOutQuad` |
| `easeInOutCubic` | `inOutCubic` |
| `easeOutQuad` | `outQuad` |
| `easeInQuad` | `inQuad` |
| `linear` | `linear` |
| `easeInOutQuint` | `inOutQuint` |

## Common Animation Properties

### Transform Properties
```javascript
animate(element, {
  translateX: 250,          // Move horizontally
  translateY: [-2, 2],      // Move vertically (from/to array)
  rotate: [0, 360],         // Rotation in degrees
  rotateY: [-2, 2],         // 3D rotation on Y axis
  scale: [1, 1.05],         // Scale transform
});
```

### CSS Properties
```javascript
animate(element, {
  opacity: [0.3, 1],
  backgroundColor: '#FFF',
  width: '100px',
});
```

### SVG Properties
```javascript
animate(svgElement, {
  strokeDashoffset: [0, 100],
  points: '64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100',
});
```

## Animation Options

```javascript
animate(element, {
  // Animation properties
  translateX: 250,

  // Timing
  duration: 3000,           // Animation duration in ms
  delay: 1000,              // Delay before animation starts

  // Easing
  ease: 'inOutQuad',        // Easing function

  // Looping
  loop: true,               // Loop infinitely
  alternate: true,          // Reverse on each loop
  loopDelay: 2000,          // Delay between loops
});
```

## Animating Multiple Elements

### Multiple targets (array)
```javascript
animate([element1, element2], {
  scale: [1, 1.05],
  duration: 2000,
  ease: 'inOutQuad',
});
```

### Using Stagger for Sequential Animations
```javascript
import { animate, stagger } from 'animejs';

animate(elements, {
  opacity: [0.4, 0.7],
  duration: 1500,
  delay: stagger(200),  // 200ms delay between each element
});
```

### Stagger with Options
```javascript
animate(elements, {
  opacity: [0.3, 0.6],
  delay: stagger(150, {
    start: 300  // Start the stagger after 300ms
  }),
});
```

## React Integration

### Using with useEffect and useRef

```javascript
import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const MyComponent = () => {
  const elementRef = useRef(null);
  const multipleRefs = useRef(null);

  useEffect(() => {
    // Single element animation
    animate(elementRef.current, {
      translateY: [-2, 2],
      duration: 3000,
      ease: 'inOutSine',
      alternate: true,
      loop: true
    });

    // Multiple elements (children)
    animate(multipleRefs.current?.children, {
      opacity: [0.4, 0.7],
      duration: 1500,
      ease: 'inOutSine',
      alternate: true,
      loop: true,
      delay: stagger(200)
    });
  }, []);

  return (
    <div>
      <div ref={elementRef}>Animated element</div>
      <div ref={multipleRefs}>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </div>
    </div>
  );
};
```

## Common Patterns from This Project

### Floating/Hovering Animation
```javascript
animate(element, {
  translateY: [-2, 2],
  duration: 3000,
  ease: 'inOutSine',
  alternate: true,
  loop: true
});
```

### Pulsing/Breathing Animation
```javascript
animate(element, {
  scale: [1, 1.05],
  duration: 2000,
  ease: 'inOutQuad',
  alternate: true,
  loop: true
});
```

### Continuous Rotation
```javascript
animate(element, {
  rotate: 360,
  duration: 20000,
  ease: 'linear',
  loop: true
});
```

### Sequential Item Animation
```javascript
animate(items, {
  opacity: [0.3, 0.6],
  duration: 2000,
  ease: 'inOutQuad',
  alternate: true,
  loop: true,
  delay: stagger(150)
});
```

## Troubleshooting

### Error: "The requested module does not provide an export named 'default'"
**Solution:** Use named imports instead:
```javascript
import { animate, stagger } from 'animejs';
```

### Error: "anime is not a function"
**Solution:** Make sure you're calling `animate()` not `anime()`:
```javascript
animate(element, { ... });  // ✅ Correct
anime(element, { ... });    // ❌ Wrong
```

### Error: "Cannot read properties of undefined (reading 'keyframes')"
**Solution:** Make sure you're using the v4 syntax with targets as first parameter:
```javascript
animate(element, { ... });              // ✅ Correct
animate({ targets: element, ... });     // ❌ v3 syntax
```

## Additional Resources

- Official Documentation: https://animejs.com/documentation/
- GitHub Repository: https://github.com/juliangarnier/anime
- NPM Package: https://www.npmjs.com/package/animejs

## Version History

- **v4.2.2** (Current) - Latest version with ES modules support
- **v4.0.0** - Major rewrite with breaking API changes
- **v3.x** - Previous version (deprecated syntax)

---

**Last Updated:** 2025-10-21
**Project:** motorwise.io frontend
**File Location:** `frontend/ANIMEJS_V4_REFERENCE.md`
