/**
 * ─── UI Effects Registry ─────────────────────────────────────────────────────
 *
 * Master config for every React Bits effect pulled into the project.
 * The Admin CMS reads this to dynamically generate controls.
 *
 * To add a new effect:
 *   1. Copy the source files into effects/<category>/<kebab-name>/
 *   2. Add an entry here with its propConfig
 *   3. The AdminUIEffects panel will auto-render controls for it
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Prop Types ──────────────────────────────────────────────────────────────

export type PropControlType = 'slider' | 'color' | 'select' | 'switch' | 'text';

export interface PropConfig {
  /** Display label in the admin panel */
  label: string;
  /** Form control type */
  control: PropControlType;
  /** Default value */
  defaultValue: string | number | boolean;
  /** Description shown as helper text */
  description: string;
  /** For sliders: min value */
  min?: number;
  /** For sliders: max value */
  max?: number;
  /** For sliders: step increment */
  step?: number;
  /** For selects: list of options */
  options?: { value: string; label: string }[];
  /** TypeScript type string (for docs) */
  type: string;
}

export interface EffectEntry {
  /** Unique kebab-case identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Category grouping */
  category: 'backgrounds' | 'animations' | 'text-animations' | 'components';
  /** Short description */
  description: string;
  /** NPM dependencies required (beyond react) */
  dependencies: string[];
  /** Source attribution */
  source: string;
  /** Import path relative to src/ */
  importPath: string;
  /** Prop definitions driving the admin controls */
  propConfig: Record<string, PropConfig>;
}

// ─── Registry ────────────────────────────────────────────────────────────────

export const UI_EFFECTS_REGISTRY: EffectEntry[] = [
  {
    id: 'light-rays',
    name: 'Light Rays',
    category: 'backgrounds',
    description: 'WebGL-powered light rays streaming from a configurable origin point. Uses OGL for rendering.',
    dependencies: ['ogl'],
    source: 'https://reactbits.dev/backgrounds/light-rays',
    importPath: 'ui-library/react-bits/effects/backgrounds/light-rays/LightRays',
    propConfig: {
      raysOrigin: {
        label: 'Rays Origin',
        control: 'select',
        defaultValue: 'top-center',
        description: "Origin position of the light rays.",
        type: 'RaysOrigin',
        options: [
          { value: 'top-center', label: 'Top Center' },
          { value: 'top-left', label: 'Top Left' },
          { value: 'top-right', label: 'Top Right' },
          { value: 'right', label: 'Right' },
          { value: 'left', label: 'Left' },
          { value: 'bottom-center', label: 'Bottom Center' },
          { value: 'bottom-right', label: 'Bottom Right' },
          { value: 'bottom-left', label: 'Bottom Left' },
        ],
      },
      raysColor: {
        label: 'Rays Color',
        control: 'color',
        defaultValue: '#ffffff',
        description: 'Color of the light rays in hex format.',
        type: 'string',
      },
      raysSpeed: {
        label: 'Rays Speed',
        control: 'slider',
        defaultValue: 1,
        description: 'Animation speed of the rays.',
        type: 'number',
        min: 0.1,
        max: 3,
        step: 0.1,
      },
      lightSpread: {
        label: 'Light Spread',
        control: 'slider',
        defaultValue: 0.5,
        description: 'How wide the light rays spread. Lower = tighter, higher = wider.',
        type: 'number',
        min: 0.1,
        max: 2,
        step: 0.1,
      },
      rayLength: {
        label: 'Ray Length',
        control: 'slider',
        defaultValue: 3.0,
        description: 'Maximum length/reach of the rays.',
        type: 'number',
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      pulsating: {
        label: 'Pulsating',
        control: 'switch',
        defaultValue: false,
        description: 'Enable pulsing animation effect.',
        type: 'boolean',
      },
      fadeDistance: {
        label: 'Fade Distance',
        control: 'slider',
        defaultValue: 1.0,
        description: 'How far rays fade out from origin.',
        type: 'number',
        min: 0.5,
        max: 2,
        step: 0.1,
      },
      saturation: {
        label: 'Saturation',
        control: 'slider',
        defaultValue: 1.0,
        description: 'Color saturation level (0–1).',
        type: 'number',
        min: 0,
        max: 2,
        step: 0.1,
      },
      followMouse: {
        label: 'Follow Mouse',
        control: 'switch',
        defaultValue: true,
        description: 'Make rays rotate towards the mouse cursor.',
        type: 'boolean',
      },
      mouseInfluence: {
        label: 'Mouse Influence',
        control: 'slider',
        defaultValue: 0.1,
        description: 'How much the mouse affects rays (0–1).',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      },
      noiseAmount: {
        label: 'Noise Amount',
        control: 'slider',
        defaultValue: 0.0,
        description: 'Add noise/grain to rays (0–1).',
        type: 'number',
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      distortion: {
        label: 'Distortion',
        control: 'slider',
        defaultValue: 0.0,
        description: 'Apply wave distortion to rays.',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      },
      className: {
        label: 'CSS Class',
        control: 'text',
        defaultValue: '',
        description: 'Additional CSS classes to apply to the container.',
        type: 'string',
      },
    },
  },
  {
    id: 'hyperspeed',
    name: 'Hyperspeed',
    category: 'backgrounds',
    description: 'Three.js highway animation with car lights, road geometry, bloom post-processing, and 6 built-in presets. Each preset has a unique distortion pattern and color scheme.',
    dependencies: ['three', 'postprocessing'],
    source: 'https://reactbits.dev/backgrounds/hyperspeed',
    importPath: 'ui-library/react-bits/effects/backgrounds/hyperspeed/Hyperspeed',
    propConfig: {
      preset: {
        label: 'Preset',
        control: 'select',
        defaultValue: 'one',
        description: 'Built-in visual preset. Each has a unique distortion and color palette.',
        type: 'string',
        options: [
          { value: 'one', label: 'Highway (Turbulent)' },
          { value: 'two', label: 'Mountain (Red/White)' },
          { value: 'three', label: 'XY Swerve (Red/Gold)' },
          { value: 'four', label: 'Long Race (Pink/Teal)' },
          { value: 'five', label: 'Turbulent (Orange/Blue)' },
          { value: 'six', label: 'Deep (Red/Cream)' },
        ],
      },
      length: {
        label: 'Road Length',
        control: 'slider',
        defaultValue: 400,
        description: 'Length of the road in the scene.',
        type: 'number',
        min: 100,
        max: 1000,
        step: 50,
      },
      roadWidth: {
        label: 'Road Width',
        control: 'slider',
        defaultValue: 10,
        description: 'Width of each roadway.',
        type: 'number',
        min: 5,
        max: 25,
        step: 1,
      },
      lanesPerRoad: {
        label: 'Lanes Per Road',
        control: 'slider',
        defaultValue: 3,
        description: 'Number of lanes on each side.',
        type: 'number',
        min: 1,
        max: 6,
        step: 1,
      },
      fov: {
        label: 'Field of View',
        control: 'slider',
        defaultValue: 90,
        description: 'Camera field of view in degrees.',
        type: 'number',
        min: 45,
        max: 150,
        step: 5,
      },
      speedUp: {
        label: 'Speed Multiplier',
        control: 'slider',
        defaultValue: 2,
        description: 'Speed boost multiplier when clicking/holding.',
        type: 'number',
        min: 1,
        max: 5,
        step: 0.5,
      },
      lightPairsPerRoadWay: {
        label: 'Car Light Pairs',
        control: 'slider',
        defaultValue: 40,
        description: 'Number of car light pairs per roadway.',
        type: 'number',
        min: 10,
        max: 100,
        step: 5,
      },
      totalSideLightSticks: {
        label: 'Side Light Sticks',
        control: 'slider',
        defaultValue: 20,
        description: 'Number of roadside light sticks.',
        type: 'number',
        min: 5,
        max: 100,
        step: 5,
      },
    },
  },
  {
    id: 'talent-carousel',
    name: 'Talent Carousel',
    category: 'components',
    description: 'Auto-scrolling WebGL carousel for talent headshots. Pauses on hover, resumes on leave. Based on CircularGallery.',
    dependencies: ['ogl'],
    source: 'https://reactbits.dev/components/circular-gallery',
    importPath: 'ui-library/react-bits/effects/components/talent-carousel/TalentCarousel',
    propConfig: {
      autoScrollSpeed: {
        label: 'Auto-Scroll Speed',
        control: 'slider',
        defaultValue: 0.8,
        description: 'Speed of the continuous auto-rotation.',
        type: 'number',
        min: 0.1,
        max: 3,
        step: 0.1,
      },
      bend: {
        label: 'Bend / Curvature',
        control: 'slider',
        defaultValue: 3,
        description: 'Curvature of the carousel arc. Negative bends upward, positive bends downward.',
        type: 'number',
        min: -10,
        max: 10,
        step: 1,
      },
      borderRadius: {
        label: 'Card Border Radius',
        control: 'slider',
        defaultValue: 0.05,
        description: 'Rounded corners on talent cards (0 = square, 0.5 = pill).',
        type: 'number',
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      containerHeight: {
        label: 'Container Height (px)',
        control: 'slider',
        defaultValue: 625,
        description: 'Height of the carousel container in pixels.',
        type: 'number',
        min: 300,
        max: 800,
        step: 10,
      },
      pauseOnHover: {
        label: 'Pause on Hover',
        control: 'switch',
        defaultValue: true,
        description: 'Stop rotation when mouse hovers over the carousel.',
        type: 'boolean',
      },
      bgPreset: {
        label: 'Background Preset',
        control: 'select',
        defaultValue: 'one',
        description: 'Hyperspeed background preset for the carousel.',
        type: 'string',
        options: [
          { value: 'one', label: 'Highway (Turbulent)' },
          { value: 'two', label: 'Mountain (Red/White)' },
          { value: 'three', label: 'XY Swerve (Red/Gold)' },
          { value: 'four', label: 'Long Race (Pink/Teal)' },
          { value: 'five', label: 'Turbulent (Orange/Blue)' },
          { value: 'six', label: 'Deep (Red/Cream)' },
        ],
      },
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get all effects in a specific category */
export const getEffectsByCategory = (category: EffectEntry['category']) =>
  UI_EFFECTS_REGISTRY.filter(e => e.category === category);

/** Get a single effect by ID */
export const getEffectById = (id: string) =>
  UI_EFFECTS_REGISTRY.find(e => e.id === id);

/** All unique categories that have at least one registered effect */
export const getActiveCategories = () =>
  [...new Set(UI_EFFECTS_REGISTRY.map(e => e.category))];

/** Build a defaults object from an effect's propConfig */
export const getDefaultProps = (effectId: string): Record<string, any> => {
  const effect = getEffectById(effectId);
  if (!effect) return {};
  return Object.fromEntries(
    Object.entries(effect.propConfig).map(([key, cfg]) => [key, cfg.defaultValue])
  );
};
