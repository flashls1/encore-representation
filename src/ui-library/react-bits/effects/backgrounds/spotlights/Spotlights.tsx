/**
 * Spotlights — Premium Dual Volumetric Spotlight Effect
 *
 * WebGL shader rendering two dramatic spotlight cones from the top corners,
 * angling inward toward the center. Features:
 *   - Volumetric light cones with proper falloff
 *   - Animated floating dust particles caught in the beams
 *   - Atmospheric haze with layered noise
 *   - Gentle sway animation for living feel
 *   - Golden-warm color temperature with soft bloom
 *
 * Uses OGL (same as LightRays) for minimal overhead.
 */

import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './Spotlights.css';

/* ─── Props ──────────────────────────────────────────────────────────────────── */

export interface SpotlightsProps {
    /** Primary light color (hex) */
    color?: string;
    /** Secondary/accent light color (hex) */
    accentColor?: string;
    /** Beam spread angle — higher = wider cones */
    beamWidth?: number;
    /** Overall brightness multiplier */
    intensity?: number;
    /** Speed of the gentle sway animation */
    swaySpeed?: number;
    /** Amount of sway (0 = static, 1 = dramatic) */
    swayAmount?: number;
    /** Dust particle density (0 = none, 1 = heavy) */
    particleDensity?: number;
    /** Atmospheric haze amount */
    haze?: number;
    /** Enable subtle pulsing glow */
    pulsing?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

const hexToVec3 = (hex: string): [number, number, number] => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
        : [1, 0.84, 0.22]; // fallback gold
};

/* ─── GLSL Shader ────────────────────────────────────────────────────────────── */

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec3  uColor;
uniform vec3  uAccentColor;
uniform float uBeamWidth;
uniform float uIntensity;
uniform float uSwaySpeed;
uniform float uSwayAmount;
uniform float uParticleDensity;
uniform float uHaze;
uniform float uPulsing;

varying vec2 vUv;

// ─── Noise functions ────────────────────────────────────────────────────────

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

// ─── Volumetric spotlight cone ──────────────────────────────────────────────

float spotlight(vec2 uv, vec2 origin, vec2 dir, float spread, float time) {
  vec2 toPixel = uv - origin;
  float dist = length(toPixel);
  if (dist < 0.001) return 0.0;

  vec2 toPixelNorm = toPixel / dist;

  // Angle between beam direction and pixel direction
  float cosAngle = dot(toPixelNorm, normalize(dir));

  // Cone falloff — sharper at edges
  float coneAttenuation = smoothstep(cos(spread * 1.5), cos(spread * 0.15), cosAngle);

  // Distance falloff — soft inverse square with ramp
  float distFalloff = 1.0 / (1.0 + dist * dist * 2.5);
  float reachFalloff = smoothstep(1.8, 0.0, dist);

  // Volumetric fog scattering within the cone
  float scatter = fbm(uv * 6.0 + time * 0.15) * 0.6 + 0.4;

  // Edge softness
  float edgeSoft = smoothstep(0.0, 0.15, cosAngle - cos(spread * 1.2));

  return coneAttenuation * distFalloff * reachFalloff * scatter * edgeSoft;
}

// ─── Dust particles ─────────────────────────────────────────────────────────

float dustParticles(vec2 uv, float time, float density) {
  float particles = 0.0;

  // Layer 1 — larger, slower motes
  for (float i = 0.0; i < 20.0; i++) {
    vec2 seed = vec2(i * 13.73, i * 7.91);
    vec2 pos = vec2(
      hash(seed) * 1.6 - 0.3,
      hash(seed + 1.0) * 1.4 - 0.2
    );
    float speed = hash(seed + 2.0) * 0.3 + 0.05;
    float phase = hash(seed + 3.0) * 6.28;
    pos.x += sin(time * speed * 0.7 + phase) * 0.08;
    pos.y += cos(time * speed * 0.5 + phase) * 0.04;
    pos.y = mod(pos.y - time * speed * 0.15, 1.4) - 0.2;

    float d = length(uv - pos);
    float size = (hash(seed + 4.0) * 0.003 + 0.001) * density;
    float brightness = smoothstep(size * 2.0, 0.0, d);
    float twinkle = 0.7 + 0.3 * sin(time * (hash(seed + 5.0) * 3.0 + 1.0) + phase);
    particles += brightness * twinkle;
  }

  // Layer 2 — smaller, faster sparkles
  for (float i = 0.0; i < 30.0; i++) {
    vec2 seed = vec2(i * 23.17 + 100.0, i * 11.31 + 50.0);
    vec2 pos = vec2(
      hash(seed) * 1.6 - 0.3,
      hash(seed + 1.0) * 1.4 - 0.2
    );
    float speed = hash(seed + 2.0) * 0.5 + 0.1;
    float phase = hash(seed + 3.0) * 6.28;
    pos.x += sin(time * speed + phase) * 0.05;
    pos.y += cos(time * speed * 0.6 + phase) * 0.03;
    pos.y = mod(pos.y - time * speed * 0.1, 1.4) - 0.2;

    float d = length(uv - pos);
    float size = (hash(seed + 4.0) * 0.0015 + 0.0005) * density;
    float brightness = smoothstep(size * 2.5, 0.0, d) * 0.6;
    float twinkle = 0.5 + 0.5 * sin(time * (hash(seed + 5.0) * 5.0 + 2.0) + phase);
    particles += brightness * twinkle;
  }

  return particles;
}

// ─── Lens flare at spotlight origin ─────────────────────────────────────────

float lensFlare(vec2 uv, vec2 origin, float time) {
  float d = length(uv - origin);
  float flare = 0.0;

  // Core bright point
  flare += 0.015 / (d * d + 0.005);

  // Inner glow ring
  flare += 0.004 / (abs(d - 0.02) + 0.003);

  // Subtle anamorphic streak (horizontal)
  float streakD = abs(uv.y - origin.y);
  float streakW = abs(uv.x - origin.x);
  flare += 0.001 / (streakD + 0.01) * smoothstep(0.4, 0.0, streakW);

  // Pulsing
  float pulse = 0.85 + 0.15 * sin(time * 1.5);
  return flare * pulse;
}

// ─── Main ───────────────────────────────────────────────────────────────────

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  // Correct aspect ratio
  float aspect = iResolution.x / iResolution.y;
  vec2 uvAspect = vec2(uv.x * aspect, uv.y);
  vec2 uvFlipped = vec2(uv.x, 1.0 - uv.y);

  float time = iTime;

  // Sway animation — gentle oscillation of beam directions
  float swayL = sin(time * uSwaySpeed * 0.7) * uSwayAmount * 0.12;
  float swayR = sin(time * uSwaySpeed * 0.9 + 1.5) * uSwayAmount * 0.12;

  // Spotlight origins — top-left and top-right corners
  vec2 originL = vec2(-0.05, 1.08);
  vec2 originR = vec2(1.05, 1.08);

  // Beam directions — angling inward and downward
  vec2 dirL = normalize(vec2(0.55 + swayL, -0.85));
  vec2 dirR = normalize(vec2(-0.55 + swayR, -0.85));

  // Compute both spotlight cones
  float spread = uBeamWidth * 0.45;
  float spotL = spotlight(uvFlipped, originL, dirL, spread, time);
  float spotR = spotlight(uvFlipped, originR, dirR, spread, time);

  // Combine with slight color difference between left and right
  vec3 lightL = uColor * spotL;
  vec3 lightR = uAccentColor * spotR;

  // Pulsing glow
  float pulse = uPulsing > 0.5
    ? 0.88 + 0.12 * sin(time * 1.2) * sin(time * 0.7 + 0.5)
    : 1.0;

  vec3 col = (lightL + lightR) * uIntensity * pulse;

  // Atmospheric haze — layered fog
  float hazeNoise = fbm(uvFlipped * 3.0 + time * 0.08);
  float hazeGlow = (spotL + spotR) * hazeNoise * uHaze * 0.5;
  col += uColor * hazeGlow * 0.3;

  // Dust particles — only visible where light exists
  float lightMask = clamp((spotL + spotR) * 3.0, 0.0, 1.0);
  float dust = dustParticles(uvFlipped, time, uParticleDensity) * lightMask;
  col += vec3(1.0, 0.95, 0.85) * dust * 0.8;

  // Lens flare at origins
  vec2 flareOriginL = vec2(originL.x, 1.0 - originL.y);
  vec2 flareOriginR = vec2(originR.x, 1.0 - originR.y);
  float flareL = lensFlare(uv, flareOriginL, time);
  float flareR = lensFlare(uv, flareOriginR, time);
  col += uColor * flareL * 0.15;
  col += uAccentColor * flareR * 0.15;

  // Subtle vignette  — darkens edges for dramatic focus
  float vignette = 1.0 - smoothstep(0.4, 1.1, length(uv - 0.5) * 1.3);
  col *= mix(0.7, 1.0, vignette);

  // Ground reflection — faint glow at the bottom
  float groundGlow = smoothstep(0.3, -0.05, uvFlipped.y) * (spotL + spotR) * 0.15;
  col += uColor * groundGlow * 0.4;

  // Tone mapping — prevent harsh clipping
  col = col / (1.0 + col * 0.5);

  // Final alpha — transparent black where no light
  float alpha = clamp(length(col) * 2.5, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}`;

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type Vec2 = [number, number];
type Vec3 = [number, number, number];

interface Uniforms {
    iTime: { value: number };
    iResolution: { value: Vec2 };
    uColor: { value: Vec3 };
    uAccentColor: { value: Vec3 };
    uBeamWidth: { value: number };
    uIntensity: { value: number };
    uSwaySpeed: { value: number };
    uSwayAmount: { value: number };
    uParticleDensity: { value: number };
    uHaze: { value: number };
    uPulsing: { value: number };
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

const Spotlights: React.FC<SpotlightsProps> = ({
    color = '#D4AF37',
    accentColor = '#FFFACD',
    beamWidth = 1.0,
    intensity = 1.2,
    swaySpeed = 1.0,
    swayAmount = 0.5,
    particleDensity = 0.8,
    haze = 0.6,
    pulsing = true,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniformsRef = useRef<Uniforms | null>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const animationIdRef = useRef<number | null>(null);
    const meshRef = useRef<Mesh | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // ── Visibility observer — only render when on screen ─────────────────────
    useEffect(() => {
        if (!containerRef.current) return;
        observerRef.current = new IntersectionObserver(
            entries => setIsVisible(entries[0].isIntersecting),
            { threshold: 0.1 }
        );
        observerRef.current.observe(containerRef.current);
        return () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
        };
    }, []);

    // ── WebGL initialization ────────────────────────────────────────────────────
    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }

        const init = async () => {
            if (!containerRef.current) return;

            // Small delay to ensure DOM is ready
            await new Promise(r => setTimeout(r, 10));
            if (!containerRef.current) return;

            const renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                alpha: true,
            });
            rendererRef.current = renderer;

            const gl = renderer.gl;
            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';

            // Clear previous canvas
            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
            containerRef.current.appendChild(gl.canvas);

            const uniforms: Uniforms = {
                iTime: { value: 0 },
                iResolution: { value: [1, 1] },
                uColor: { value: hexToVec3(color) },
                uAccentColor: { value: hexToVec3(accentColor) },
                uBeamWidth: { value: beamWidth },
                uIntensity: { value: intensity },
                uSwaySpeed: { value: swaySpeed },
                uSwayAmount: { value: swayAmount },
                uParticleDensity: { value: particleDensity },
                uHaze: { value: haze },
                uPulsing: { value: pulsing ? 1.0 : 0.0 },
            };
            uniformsRef.current = uniforms;

            const geometry = new Triangle(gl);
            const program = new Program(gl, {
                vertex: VERTEX,
                fragment: FRAGMENT,
                uniforms,
                transparent: true,
            });
            const mesh = new Mesh(gl, { geometry, program });
            meshRef.current = mesh;

            const updateSize = () => {
                if (!containerRef.current || !renderer) return;
                renderer.dpr = Math.min(window.devicePixelRatio, 2);
                const { clientWidth, clientHeight } = containerRef.current;
                renderer.setSize(clientWidth, clientHeight);
                uniforms.iResolution.value = [
                    clientWidth * renderer.dpr,
                    clientHeight * renderer.dpr,
                ];
            };

            const loop = (t: number) => {
                if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
                uniforms.iTime.value = t * 0.001;
                try {
                    renderer.render({ scene: mesh });
                    animationIdRef.current = requestAnimationFrame(loop);
                } catch (err) {
                    console.warn('[Spotlights] WebGL render error:', err);
                }
            };

            window.addEventListener('resize', updateSize);
            updateSize();
            animationIdRef.current = requestAnimationFrame(loop);

            cleanupRef.current = () => {
                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                    animationIdRef.current = null;
                }
                window.removeEventListener('resize', updateSize);
                if (renderer) {
                    try {
                        const ext = renderer.gl.getExtension('WEBGL_lose_context');
                        if (ext) ext.loseContext();
                        const canvas = renderer.gl.canvas;
                        if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
                    } catch { /* noop */ }
                }
                rendererRef.current = null;
                uniformsRef.current = null;
                meshRef.current = null;
            };
        };

        init();

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [isVisible, color, accentColor, beamWidth, intensity, swaySpeed, swayAmount, particleDensity, haze, pulsing]);

    // ── Live uniform updates (no re-init) ────────────────────────────────────
    useEffect(() => {
        if (!uniformsRef.current) return;
        const u = uniformsRef.current;
        u.uColor.value = hexToVec3(color);
        u.uAccentColor.value = hexToVec3(accentColor);
        u.uBeamWidth.value = beamWidth;
        u.uIntensity.value = intensity;
        u.uSwaySpeed.value = swaySpeed;
        u.uSwayAmount.value = swayAmount;
        u.uParticleDensity.value = particleDensity;
        u.uHaze.value = haze;
        u.uPulsing.value = pulsing ? 1.0 : 0.0;
    }, [color, accentColor, beamWidth, intensity, swaySpeed, swayAmount, particleDensity, haze, pulsing]);

    return <div ref={containerRef} className={`spotlights-container ${className}`.trim()} />;
};

export default Spotlights;
