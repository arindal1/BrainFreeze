"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * CRYO FIELD - a frozen fluid.
 *
 * Flow-warped fbm drives a slow-moving supercooled medium; a voronoi cell
 * structure crystallises ice facets across it; a single hot subsurface bloom
 * tracks the pointer and melts the lattice locally. Cold periwinkle field,
 * one vermillion heat source. No gradient blobs.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uHeat;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  const vec3 VOID_C  = vec3(0.024, 0.027, 0.039);
  const vec3 CRYO_C  = vec3(0.663, 0.769, 1.000);
  const vec3 DEEP_C  = vec3(0.086, 0.129, 0.243);
  const vec3 FLARE_C = vec3(1.000, 0.290, 0.110);

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = dot(hash2(i) * 2.0 - 1.0, f);
    float b = dot(hash2(i + vec2(1.0, 0.0)) * 2.0 - 1.0, f - vec2(1.0, 0.0));
    float c = dot(hash2(i + vec2(0.0, 1.0)) * 2.0 - 1.0, f - vec2(0.0, 1.0));
    float d = dot(hash2(i + vec2(1.0, 1.0)) * 2.0 - 1.0, f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p *= 2.03;
      amp *= 0.52;
    }
    return v;
  }

  // Supercooled flow: the field is advected by its own gradient.
  float flow(vec2 p, float t) {
    vec2 q = vec2(fbm(p + vec2(1.7, 9.2)), fbm(p + vec2(8.3, 2.8)));
    vec2 r = vec2(fbm(p + 3.2 * q + t * 0.06), fbm(p + 3.2 * q - t * 0.045));
    return fbm(p + 2.6 * r);
  }

  // Voronoi crystal structure. x = cell interior distance, y = facet seam.
  vec2 crystal(vec2 p, float t) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float d1 = 8.0;
    float d2 = 8.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 o = hash2(ip + g);
        o = 0.5 + 0.42 * sin(t * 0.25 + 6.2831 * o);
        float d = length(g + o - fp);
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
      }
    }
    return vec2(d1, d2 - d1);
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;
    vec2 m = (uMouse - 0.5) * aspect;

    // The frozen medium
    float medium = flow(p * 2.6 + m * 0.25, uTime);
    float body = smoothstep(-0.45, 0.55, medium);

    // Ice facets, displaced by the medium so seams follow the flow
    vec2 cell = crystal(p * 4.4 + medium * 1.4 + m * 0.12, uTime);
    float seam = smoothstep(0.075, 0.0, cell.y);
    float core = smoothstep(0.55, 0.02, cell.x);

    // Heat source tracking the pointer - melts the lattice locally.
    // Kept deliberately tight: the field is cold, the heat is an accent.
    float heatDist = length(p - m * 0.85);
    float heat = exp(-heatDist * 4.2) * uHeat;

    vec3 color = VOID_C;
    color = mix(color, DEEP_C, body);
    color += CRYO_C * body * body * 0.26;
    color += CRYO_C * seam * (0.30 + 0.50 * body);
    color += CRYO_C * core * 0.06;

    // Melt: seams glow hot and the medium reddens near the pointer
    color = mix(color, FLARE_C, clamp(heat * (0.20 + seam * 0.9), 0.0, 0.55));
    color += FLARE_C * heat * 0.06;

    // Depth: cold vignette adds falloff without flattening the field
    float vig = smoothstep(1.25, 0.2, length(uv - 0.5));
    color *= mix(0.55, 1.0, vig);

    // Dither - kills banding in the large dark field
    float dither = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
    color += (dither - 0.5) * 0.016;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function Field({ heat }: { heat: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const smoothed = useRef(new THREE.Vector2(0.5, 0.5));
  const target = useRef(new THREE.Vector2(0.5, 0.5));
  const { size, viewport } = useThree();

  // The canvas sits behind page content, so it never receives pointer events
  // itself - read the pointer from the window instead.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeat: { value: heat },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [heat],
  );

  useFrame((_, delta) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value += Math.min(delta, 0.05);
    smoothed.current.lerp(target.current, 1 - Math.pow(0.0015, Math.min(delta, 0.05)));
    m.uniforms.uMouse.value.copy(smoothed.current);
    m.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

/** Static, still-complete stand-in used for reduced motion and WebGL failure. */
export function CryoFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(120% 90% at 30% 20%, #1b2440 0%, #0d1220 45%, #06070a 100%)",
      }}
    />
  );
}

export default function CryoField({ heat = 1 }: { heat?: number }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return <CryoFallback />;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.75]}
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        fallback={<CryoFallback />}
      >
        <Field heat={heat} />
      </Canvas>
    </div>
  );
}