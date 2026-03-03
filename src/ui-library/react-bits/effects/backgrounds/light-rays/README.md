# Light Rays Background

**Source:** [React Bits — Light Rays](https://reactbits.dev/backgrounds/light-rays)
**Dependency:** `ogl` (WebGL renderer)

WebGL-powered volumetric light rays streaming from a configurable origin point.
Uses OGL for lightweight GPU-accelerated rendering with GLSL fragment shaders.

## Files
- `LightRays.tsx` — Main component (TypeScript, CSS variant)
- `LightRays.css` — Container styles

## Usage

```tsx
import LightRays from '@/ui-library/react-bits/effects/backgrounds/light-rays/LightRays';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#00ffff"
    raysSpeed={1.5}
    lightSpread={0.8}
    rayLength={1.2}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0.1}
    distortion={0.05}
  />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `raysOrigin` | `RaysOrigin` | `"top-center"` | Origin position of the light rays |
| `raysColor` | `string` | `"#ffffff"` | Color of the light rays (hex) |
| `raysSpeed` | `number` | `1` | Animation speed (0.1–3) |
| `lightSpread` | `number` | `0.5` | How wide the rays spread (0.1–2) |
| `rayLength` | `number` | `3.0` | Maximum length of the rays (0.5–5) |
| `pulsating` | `boolean` | `false` | Enable pulsing animation |
| `fadeDistance` | `number` | `1.0` | How far rays fade from origin (0.5–2) |
| `saturation` | `number` | `1.0` | Color saturation (0–2) |
| `followMouse` | `boolean` | `true` | Rays follow mouse cursor |
| `mouseInfluence` | `number` | `0.1` | Mouse influence strength (0–1) |
| `noiseAmount` | `number` | `0.0` | Noise/grain overlay (0–0.5) |
| `distortion` | `number` | `0.0` | Wave distortion (0–1) |
| `className` | `string` | `""` | Additional CSS class |

### RaysOrigin Options
`top-center` | `top-left` | `top-right` | `right` | `left` | `bottom-center` | `bottom-right` | `bottom-left`
