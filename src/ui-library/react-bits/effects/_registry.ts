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
        defaultValue: '#D4AF37',
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
    id: 'spotlights',
    name: 'Spotlights',
    category: 'backgrounds',
    description: 'Premium dual spotlight effect — two volumetric light cones from the top corners with animated dust particles, atmospheric haze, lens flares, and gentle sway. Red carpet premiere aesthetic.',
    dependencies: ['ogl'],
    source: 'custom',
    importPath: 'ui-library/react-bits/effects/backgrounds/spotlights/Spotlights',
    propConfig: {
      color: {
        label: 'Primary Color',
        control: 'color',
        defaultValue: '#D4AF37',
        description: 'Main spotlight beam color.',
        type: 'string',
      },
      accentColor: {
        label: 'Accent Color',
        control: 'color',
        defaultValue: '#FFFACD',
        description: 'Secondary spotlight beam color (right side).',
        type: 'string',
      },
      beamWidth: {
        label: 'Beam Width',
        control: 'slider',
        defaultValue: 1.0,
        description: 'Width of the spotlight cones. Lower = tighter beam.',
        type: 'number',
        min: 0.3,
        max: 2.0,
        step: 0.1,
      },
      intensity: {
        label: 'Intensity',
        control: 'slider',
        defaultValue: 1.2,
        description: 'Overall brightness multiplier.',
        type: 'number',
        min: 0.3,
        max: 3.0,
        step: 0.1,
      },
      swaySpeed: {
        label: 'Sway Speed',
        control: 'slider',
        defaultValue: 1.0,
        description: 'Speed of the gentle beam oscillation.',
        type: 'number',
        min: 0.1,
        max: 3.0,
        step: 0.1,
      },
      swayAmount: {
        label: 'Sway Amount',
        control: 'slider',
        defaultValue: 0.5,
        description: 'How much the beams sway (0 = static).',
        type: 'number',
        min: 0,
        max: 2.0,
        step: 0.1,
      },
      particleDensity: {
        label: 'Particle Density',
        control: 'slider',
        defaultValue: 0.8,
        description: 'Density of floating dust particles in the beams.',
        type: 'number',
        min: 0,
        max: 2.0,
        step: 0.1,
      },
      haze: {
        label: 'Atmospheric Haze',
        control: 'slider',
        defaultValue: 0.6,
        description: 'Amount of atmospheric fog/haze in the light.',
        type: 'number',
        min: 0,
        max: 2.0,
        step: 0.1,
      },
      pulsing: {
        label: 'Pulsing Glow',
        control: 'switch',
        defaultValue: true,
        description: 'Enable subtle pulsing glow animation.',
        type: 'boolean',
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
    description: 'Vertical auto-scrolling carousel for talent banners. 3 items visible — center crisp, top/bottom blurred. Switchable background effect.',
    dependencies: [],
    source: 'custom',
    importPath: 'ui-library/react-bits/effects/components/talent-carousel/TalentCarousel',
    propConfig: {
      background: {
        label: 'Background Effect',
        control: 'select',
        defaultValue: 'spotlights',
        description: 'Which background effect to render behind the carousel. Only one can be active at a time.',
        type: 'string',
        options: [
          { value: 'spotlights', label: 'Spotlights (Red Carpet)' },
          { value: 'light-rays', label: 'Light Rays' },
          { value: 'hyperspeed', label: 'Hyperspeed' },
          { value: 'silk', label: 'Silk' },
          { value: 'none', label: 'None (solid dark)' },
        ],
      },
      desktopSpeed: {
        label: '🖥️ Desktop Scroll Speed',
        control: 'slider',
        defaultValue: 1.5,
        description: 'Auto-scroll speed on desktop (≥768px). Higher = faster.',
        type: 'number',
        min: 0.2,
        max: 10,
        step: 0.1,
      },
      mobileSpeed: {
        label: '📱 Mobile Scroll Speed',
        control: 'slider',
        defaultValue: 1.0,
        description: 'Auto-scroll speed on mobile (<768px). Higher = faster.',
        type: 'number',
        min: 0.2,
        max: 10,
        step: 0.1,
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
    },
  },
  {
    id: 'events-carousel',
    name: 'Events Carousel',
    category: 'components',
    description: 'Horizontal auto-scrolling carousel for event images. Scrolls left-to-right with touch/drag support.',
    dependencies: [],
    source: 'custom',
    importPath: 'components/EventsCarousel',
    propConfig: {
      desktopSpeed: {
        label: '🖥️ Desktop Scroll Speed',
        control: 'slider',
        defaultValue: 1.0,
        description: 'Auto-scroll speed on desktop (≥768px). Higher = faster.',
        type: 'number',
        min: 0.2,
        max: 10,
        step: 0.1,
      },
      mobileSpeed: {
        label: '📱 Mobile Scroll Speed',
        control: 'slider',
        defaultValue: 0.6,
        description: 'Auto-scroll speed on mobile (<768px). Higher = faster.',
        type: 'number',
        min: 0.2,
        max: 10,
        step: 0.1,
      },
    },
  },
  {
    id: 'blur-text',
    name: 'Blur Text',
    category: 'text-animations',
    description: 'Text that animates in with a blur-to-clear + slide effect, word-by-word or letter-by-letter. Triggered when scrolled into view.',
    dependencies: ['framer-motion'],
    source: 'https://reactbits.dev/text-animations/blur-text',
    importPath: 'ui-library/react-bits/effects/text-animations/blur-text/BlurText',
    propConfig: {
      delay: {
        label: 'Stagger Delay (ms)',
        control: 'slider',
        defaultValue: 200,
        description: 'Delay in milliseconds between each word/letter animation start.',
        type: 'number',
        min: 50,
        max: 500,
        step: 10,
      },
      animateBy: {
        label: 'Animate By',
        control: 'select',
        defaultValue: 'words',
        description: 'Split text into words or individual letters for animation.',
        type: 'string',
        options: [
          { value: 'words', label: 'Words' },
          { value: 'letters', label: 'Letters' },
        ],
      },
      direction: {
        label: 'Direction',
        control: 'select',
        defaultValue: 'top',
        description: 'Direction the text slides in from.',
        type: 'string',
        options: [
          { value: 'top', label: 'Top (drops down)' },
          { value: 'bottom', label: 'Bottom (rises up)' },
        ],
      },
      stepDuration: {
        label: 'Step Duration (s)',
        control: 'slider',
        defaultValue: 0.35,
        description: 'Duration of each animation step in seconds.',
        type: 'number',
        min: 0.1,
        max: 1,
        step: 0.05,
      },
      threshold: {
        label: 'Visibility Threshold',
        control: 'slider',
        defaultValue: 0.1,
        description: 'How much of the element must be visible to trigger (0–1).',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
  },
  {
    id: 'shiny-text',
    name: 'Shiny Text',
    category: 'text-animations',
    description: 'A sweeping gradient shine that continuously moves across the text. Uses framer-motion useAnimationFrame for smooth, frame-synced animation.',
    dependencies: ['framer-motion'],
    source: 'https://reactbits.dev/text-animations/shiny-text',
    importPath: 'ui-library/react-bits/effects/text-animations/shiny-text/ShinyText',
    propConfig: {
      speed: {
        label: 'Shine Speed (s)',
        control: 'slider',
        defaultValue: 2,
        description: 'Duration of one full shine sweep in seconds.',
        type: 'number',
        min: 0.5,
        max: 8,
        step: 0.5,
      },
      color: {
        label: 'Base Color',
        control: 'color',
        defaultValue: '#D4AF37',
        description: 'The base text color (the non-shining areas).',
        type: 'string',
      },
      shineColor: {
        label: 'Shine Color',
        control: 'color',
        defaultValue: '#FFF8DC',
        description: 'The color of the shine highlight.',
        type: 'string',
      },
      spread: {
        label: 'Gradient Spread (deg)',
        control: 'slider',
        defaultValue: 120,
        description: 'Angle of the shine gradient in degrees.',
        type: 'number',
        min: 0,
        max: 360,
        step: 10,
      },
      direction: {
        label: 'Direction',
        control: 'select',
        defaultValue: 'left',
        description: 'Direction the shine sweeps.',
        type: 'string',
        options: [
          { value: 'left', label: 'Left to Right' },
          { value: 'right', label: 'Right to Left' },
        ],
      },
      yoyo: {
        label: 'Yoyo (bounce back)',
        control: 'switch',
        defaultValue: false,
        description: 'Shine bounces back instead of looping from one side.',
        type: 'boolean',
      },
      disabled: {
        label: 'Disabled',
        control: 'switch',
        defaultValue: false,
        description: 'Completely disable the shine animation.',
        type: 'boolean',
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
