# React Bits UI Library — Local Reference

This folder contains the **full React Bits repo** cloned locally for reference, plus our
**active effects** that are integrated into the Encore site.

## Folder Structure

```
react-bits/
├── README.md                ← You are here
├── react-bits-repo/         ← Full clone of DavidHDev/react-bits (git-ignored)
│
└── effects/                 ← Active effects we've pulled into our project
    ├── _registry.ts         ← Master registry — every effect's metadata & props config
    │
    ├── backgrounds/          
    │   ├── light-rays/
    │   │   ├── LightRays.tsx
    │   │   ├── LightRays.css
    │   │   └── README.md    ← Source, dependency, and props documentation
    │   ├── aurora/
    │   ├── silk/
    │   └── ...
    │
    ├── animations/
    ├── text-animations/
    └── components/
```

## How to add a new effect

1. Find the component in `react-bits-repo/src/content/<Category>/<Name>/`
2. Copy it into `effects/<category>/<kebab-name>/`
3. Register it in `effects/_registry.ts` with its prop definitions
4. The Admin CMS will automatically render controls for it

## Dependencies

Some effects require extra packages. Check each effect's README or the registry
for its `dependencies` array, then `npm install` them.

### Common dependencies
| Package | Used by |
|---------|---------|
| `ogl`   | LightRays, Silk, and other WebGL backgrounds |
| `gsap` / `@gsap/react` | Many text & animation effects |
| `three` / `@react-three/fiber` | 3D backgrounds |
