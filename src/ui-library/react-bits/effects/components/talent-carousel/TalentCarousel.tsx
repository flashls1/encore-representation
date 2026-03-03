/**
 * TalentCarousel — Forked from React Bits CircularGallery
 *
 * Modifications from original:
 *   1. Continuous auto-scroll (configurable speed)
 *   2. Pause on hover, resume on leave
 *   3. No text labels below cards (images only)
 *   4. onClick callback per item for navigation
 *   5. Scoped event listeners to container (not window)
 *
 * Dependency: ogl
 */

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef, useCallback } from 'react';

import './TalentCarousel.css';

type GL = Renderer['gl'];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: number;
    return function (this: any, ...args: Parameters<T>) {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
}

function lerp(p1: number, p2: number, t: number): number {
    return p1 + (p2 - p1) * t;
}

// ─── Media Item (single card in the carousel) ──────────────────────────────

interface ScreenSize { width: number; height: number; }
interface Viewport { width: number; height: number; }

interface MediaProps {
    geometry: Plane;
    gl: GL;
    image: string;
    index: number;
    length: number;
    renderer: Renderer;
    scene: Transform;
    screen: ScreenSize;
    viewport: Viewport;
    bend: number;
    borderRadius?: number;
}

class Media {
    extra: number = 0;
    geometry: Plane;
    gl: GL;
    image: string;
    index: number;
    length: number;
    renderer: Renderer;
    scene: Transform;
    screen: ScreenSize;
    viewport: Viewport;
    bend: number;
    borderRadius: number;
    program!: Program;
    plane!: Mesh;
    scale!: number;
    padding!: number;
    width!: number;
    widthTotal!: number;
    x!: number;
    speed: number = 0;
    isBefore: boolean = false;
    isAfter: boolean = false;

    constructor({
        geometry, gl, image, index, length, renderer, scene,
        screen, viewport, bend, borderRadius = 0,
    }: MediaProps) {
        this.geometry = geometry;
        this.gl = gl;
        this.image = image;
        this.index = index;
        this.length = length;
        this.renderer = renderer;
        this.scene = scene;
        this.screen = screen;
        this.viewport = viewport;
        this.bend = bend;
        this.borderRadius = borderRadius;
        this.createShader();
        this.createMesh();
        this.onResize();
    }

    createShader() {
        const texture = new Texture(this.gl, {
            generateMipmaps: true,
            minFilter: this.gl.LINEAR_MIPMAP_LINEAR,
            magFilter: this.gl.LINEAR,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
        });

        // Enable anisotropic filtering for crisp textures at angles
        const ext = this.gl.getExtension('EXT_texture_filter_anisotropic') ||
            this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        if (ext) {
            const maxAniso = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(maxAniso, 8));
        }

        this.program = new Program(this.gl, {
            depthTest: false,
            depthWrite: false,
            vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        uniform vec3 uBorderColor;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          // Image UV (cover fit)
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 imgColor = texture2D(tMap, uv);

          // Outer rounded rect (full card boundary)
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float outerAlpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          // Inner rounded rect (image area, inset by border width)
          float borderWidth = 0.025;
          float innerR = max(uBorderRadius - borderWidth, 0.0);
          float d2 = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius - borderWidth + innerR), innerR);
          float innerAlpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d2);

          // Compose: gold border in the ring, image inside
          vec3 finalColor = mix(uBorderColor, imgColor.rgb, innerAlpha);
          gl_FragColor = vec4(finalColor, outerAlpha);
        }
      `,
            uniforms: {
                tMap: { value: texture },
                uPlaneSizes: { value: [0, 0] },
                uImageSizes: { value: [0, 0] },
                uBorderRadius: { value: this.borderRadius },
                uBorderColor: { value: [212 / 255, 175 / 255, 55 / 255] }, // #D4AF37
            },
            transparent: true,
        });
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this.image;
        img.onload = () => {
            texture.image = img;
            this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
        };
    }

    createMesh() {
        this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
        this.plane.setParent(this.scene);
    }

    update(scroll: { current: number; last: number }, direction: 'right' | 'left', time: number) {
        this.plane.position.x = this.x - scroll.current - this.extra;

        const x = this.plane.position.x;
        const H = this.viewport.width / 2;

        if (this.bend === 0) {
            this.plane.position.y = 0;
            this.plane.rotation.z = 0;
        } else {
            const B_abs = Math.abs(this.bend);
            const R = (H * H + B_abs * B_abs) / (2 * B_abs);
            const effectiveX = Math.min(Math.abs(x), H);
            const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
            if (this.bend > 0) {
                this.plane.position.y = -arc;
                this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
            } else {
                this.plane.position.y = arc;
                this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
            }
        }

        // Subtle whole-mesh tilt — gentle floating feel without distorting the texture
        this.speed = scroll.current - scroll.last;
        const tiltX = Math.sin(time * 0.8 + this.index * 0.5) * 0.02;
        const tiltY = Math.cos(time * 0.6 + this.index * 0.7) * 0.015;
        this.plane.rotation.x = tiltX;
        this.plane.rotation.y = tiltY + this.speed * 0.3;

        const planeOffset = this.plane.scale.x / 2;
        const viewportOffset = this.viewport.width / 2;
        this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
        this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
        if (direction === 'right' && this.isBefore) {
            this.extra -= this.widthTotal;
            this.isBefore = this.isAfter = false;
        }
        if (direction === 'left' && this.isAfter) {
            this.extra += this.widthTotal;
            this.isBefore = this.isAfter = false;
        }
    }

    onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
        if (screen) this.screen = screen;
        if (viewport) {
            this.viewport = viewport;
            if (this.plane.program.uniforms.uViewportSizes) {
                this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
            }
        }
        // Card size is proportional to the container — works with any image size.
        // The fragment shader handles cover-fit via uImageSizes/uPlaneSizes ratio,
        // so any admin-uploaded image (portrait, landscape, square) fills the card.
        this.plane.scale.y = this.viewport.height * 0.6;
        this.plane.scale.x = this.viewport.width * 0.16;
        this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
        this.padding = 2;
        this.width = this.plane.scale.x + this.padding;
        this.widthTotal = this.width * this.length;
        this.x = this.width * this.index;
    }
}

// ─── Carousel Engine ───────────────────────────────────────────────────────

interface CarouselItem {
    image: string;
    id: string;
}

interface CarouselConfig {
    items: CarouselItem[];
    bend?: number;
    borderRadius?: number;
    autoScrollSpeed?: number;
    pauseOnHover?: boolean;
}

class CarouselApp {
    container: HTMLElement;
    scroll: { ease: number; current: number; target: number; last: number; position?: number; };
    onCheckDebounce: (...args: any[]) => void;
    renderer!: Renderer;
    gl!: GL;
    camera!: Camera;
    scene!: Transform;
    planeGeometry!: Plane;
    medias: Media[] = [];
    mediasImages: CarouselItem[] = [];
    screen!: ScreenSize;
    viewport!: Viewport;
    raf: number = 0;

    boundOnResize!: () => void;
    boundOnWheel!: (e: Event) => void;
    boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
    boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
    boundOnTouchUp!: () => void;
    boundOnMouseEnter!: () => void;
    boundOnMouseLeave!: () => void;

    isDown: boolean = false;
    start: number = 0;
    isPaused: boolean = false;
    autoScrollSpeed: number;
    pauseOnHover: boolean;
    onItemClick?: (id: string) => void;
    dragVelocity: number = 0;
    lastDragX: number = 0;
    resumeTimer: number = 0;
    dragDistance: number = 0;
    didDrag: boolean = false;

    constructor(
        container: HTMLElement,
        {
            items,
            bend = 3,
            borderRadius = 0.05,
            autoScrollSpeed = 0.8,
            pauseOnHover = true,
        }: CarouselConfig
    ) {
        this.container = container;
        this.autoScrollSpeed = autoScrollSpeed;
        this.pauseOnHover = pauseOnHover;
        this.scroll = { ease: 0.05, current: 0, target: 0, last: 0 };
        this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
        this.createRenderer();
        this.createCamera();
        this.createScene();
        this.onResize();
        this.createGeometry();
        this.createMedias(items, bend, borderRadius);

        // Position the scroll so 5 cards fill the viewport from left edge on first frame.
        // Card at index i is at position: (cardWidth * i) - scroll.
        // To place the leftmost card at the left viewport edge (-viewport.width/2),
        // we want: cardWidth * 0 - scroll = -viewport.width/2 → scroll = viewport.width/2
        // But we shift by half a card width so the first card's center aligns with the left edge.
        if (this.medias.length > 0) {
            const cardW = this.medias[0].width;
            const offset = (this.viewport.width / 2) - (cardW / 2);
            this.scroll.current = offset;
            this.scroll.target = offset;
            this.scroll.last = offset;
        }

        this.update();
        this.addEventListeners();
    }

    createRenderer() {
        this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
        this.gl = this.renderer.gl;
        this.gl.clearColor(0, 0, 0, 0);
        this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }

    createCamera() {
        this.camera = new Camera(this.gl);
        this.camera.fov = 45;
        this.camera.position.z = 20;
    }

    createScene() {
        this.scene = new Transform();
    }

    createGeometry() {
        // Flat geometry — no subdivision = no internal seams/zigzag artifacts
        this.planeGeometry = new Plane(this.gl);
    }

    createMedias(items: CarouselItem[], bend: number, borderRadius: number) {
        // Duplicate for seamless wrap
        this.mediasImages = items.concat(items);
        this.medias = this.mediasImages.map((data, index) => {
            return new Media({
                geometry: this.planeGeometry,
                gl: this.gl,
                image: data.image,
                index,
                length: this.mediasImages.length,
                renderer: this.renderer,
                scene: this.scene,
                screen: this.screen,
                viewport: this.viewport,
                bend,
                borderRadius,
            });
        });
    }

    onTouchDown(e: MouseEvent | TouchEvent) {
        this.isDown = true;
        this.dragVelocity = 0;
        this.dragDistance = 0;
        this.didDrag = false;
        window.clearTimeout(this.resumeTimer);
        this.scroll.position = this.scroll.current;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        this.start = clientX;
        this.lastDragX = clientX;
    }

    onTouchMove(e: MouseEvent | TouchEvent) {
        if (!this.isDown) return;
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        // Track total drag distance to distinguish clicks from drags
        this.dragDistance += Math.abs(x - this.lastDragX);
        // Natural 1:1 drag mapped to viewport
        const distance = (this.start - x) * (this.scroll.ease * 6);
        this.scroll.target = (this.scroll.position ?? 0) + distance;
        // Track velocity for momentum after release
        this.dragVelocity = (this.lastDragX - x) * 0.002;
        this.lastDragX = x;
    }

    onTouchUp() {
        if (!this.isDown) return;
        this.isDown = false;
        // Mark as drag if moved more than 5px — click handler will check this
        this.didDrag = this.dragDistance > 5;
        // Apply momentum — wheel keeps spinning in the direction you threw it
        this.scroll.target += this.dragVelocity * 40;
        // Delay auto-scroll resume so momentum isn't immediately overridden
        this.resumeTimer = window.setTimeout(() => {
            this.dragVelocity = 0;
        }, 800);
    }

    onWheel(e: Event) {
        const wheelEvent = e as WheelEvent;
        const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
        this.scroll.target += (delta > 0 ? 1 : -1) * 0.2;
        this.onCheckDebounce();
    }

    onCheck() {
        // no snapping — free continuous scroll
    }

    onMouseEnter() {
        if (this.pauseOnHover) this.isPaused = true;
    }

    onMouseLeave() {
        if (this.pauseOnHover) this.isPaused = false;
    }

    onResize() {
        this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
        this.renderer.setSize(this.screen.width, this.screen.height);
        this.camera.perspective({ aspect: this.screen.width / this.screen.height });
        const fov = (this.camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
        const width = height * this.camera.aspect;
        this.viewport = { width, height };
        if (this.medias) {
            this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
        }
    }

    update() {
        // Auto-scroll when not paused, not dragging, and momentum has settled
        if (!this.isPaused && !this.isDown && this.dragVelocity === 0) {
            this.scroll.target += this.autoScrollSpeed * 0.01;
        }

        this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
        const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
        const time = performance.now() * 0.001;
        if (this.medias) {
            this.medias.forEach(media => media.update(this.scroll, direction, time));
        }
        this.renderer.render({ scene: this.scene, camera: this.camera });
        this.scroll.last = this.scroll.current;
        this.raf = window.requestAnimationFrame(this.update.bind(this));
    }

    addEventListeners() {
        this.boundOnResize = this.onResize.bind(this);
        this.boundOnWheel = this.onWheel.bind(this);
        this.boundOnTouchDown = this.onTouchDown.bind(this);
        this.boundOnTouchMove = this.onTouchMove.bind(this);
        this.boundOnTouchUp = this.onTouchUp.bind(this);
        this.boundOnMouseEnter = this.onMouseEnter.bind(this);
        this.boundOnMouseLeave = this.onMouseLeave.bind(this);

        window.addEventListener('resize', this.boundOnResize);
        // Scoped to container
        this.container.addEventListener('wheel', this.boundOnWheel, { passive: true });
        this.container.addEventListener('mousedown', this.boundOnTouchDown);
        this.container.addEventListener('mousemove', this.boundOnTouchMove);
        // mouseup/touchend on WINDOW so release always fires even if mouse leaves container
        window.addEventListener('mouseup', this.boundOnTouchUp);
        this.container.addEventListener('touchstart', this.boundOnTouchDown);
        this.container.addEventListener('touchmove', this.boundOnTouchMove);
        window.addEventListener('touchend', this.boundOnTouchUp);
        this.container.addEventListener('mouseenter', this.boundOnMouseEnter);
        this.container.addEventListener('mouseleave', this.boundOnMouseLeave);
    }

    destroy() {
        window.cancelAnimationFrame(this.raf);
        window.removeEventListener('resize', this.boundOnResize);
        this.container.removeEventListener('wheel', this.boundOnWheel);
        this.container.removeEventListener('mousedown', this.boundOnTouchDown);
        this.container.removeEventListener('mousemove', this.boundOnTouchMove);
        window.removeEventListener('mouseup', this.boundOnTouchUp);
        this.container.removeEventListener('touchstart', this.boundOnTouchDown);
        this.container.removeEventListener('touchmove', this.boundOnTouchMove);
        window.removeEventListener('touchend', this.boundOnTouchUp);
        this.container.removeEventListener('mouseenter', this.boundOnMouseEnter);
        this.container.removeEventListener('mouseleave', this.boundOnMouseLeave);
        if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
            this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
        }
    }
}

// ─── React Component ───────────────────────────────────────────────────────

export interface TalentCarouselProps {
    items: CarouselItem[];
    bend?: number;
    borderRadius?: number;
    autoScrollSpeed?: number;
    pauseOnHover?: boolean;
    onItemClick?: (id: string) => void;
    className?: string;
}

export default function TalentCarousel({
    items,
    bend = 3,
    borderRadius = 0.05,
    autoScrollSpeed = 0.8,
    pauseOnHover = true,
    onItemClick,
    className = '',
}: TalentCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<CarouselApp | null>(null);

    // Handle click — only navigate if the user didn't drag
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!onItemClick || !appRef.current) return;
        const app = appRef.current;
        // Suppress click if user was dragging (moved > 5px)
        if (app.didDrag || app.isDown) return;

        const medias = app.medias;
        if (!medias.length) return;

        let closest: { dist: number; idx: number } = { dist: Infinity, idx: 0 };
        medias.forEach((media, i) => {
            const dist = Math.abs(media.plane.position.x);
            if (dist < closest.dist) {
                closest = { dist, idx: i };
            }
        });

        const originalIdx = closest.idx % items.length;
        onItemClick(items[originalIdx].id);
    }, [onItemClick, items]);

    // Mount WebGL immediately — no preload gate
    useEffect(() => {
        if (!containerRef.current || !items.length) return;

        const app = new CarouselApp(containerRef.current, {
            items,
            bend,
            borderRadius,
            autoScrollSpeed,
            pauseOnHover,
        });
        appRef.current = app;

        return () => {
            app.destroy();
            appRef.current = null;
        };
    }, [items, bend, borderRadius, autoScrollSpeed, pauseOnHover]);

    return (
        <div
            ref={containerRef}
            className={`talent-carousel ${className}`.trim()}
            onClick={handleClick}
        />
    );
}
