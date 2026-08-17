"use client";

// Fonts: the heavy display headline + all UI text use Inter (Google Font, here at
// weights 500/600/900). Load it in your project for an exact match; without it the
// headline falls back to Helvetica Neue / Arial Black and the UI to a system sans.
//
// Dependencies: the jellyfish is a real procedural 3D creature (a shaded bell +
// shader-driven tentacles), so this scene uses react-three-fiber + three. Install
// them first:   npm i three @react-three/fiber
// Everything else is inline — all @keyframes live in the one injected <style>
// block, there are no Tailwind classes, and there are no image files to ship.

import type { CSSProperties } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const SANS = "'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif";
const DISPLAY = "'Inter', 'Helvetica Neue', 'Arial Black', sans-serif";
const INK = "#1a1a22";

/* Inline film-grain (feTurbulence) as a data-URI — a faint noise overlay for the
   premium studio-film texture. Self-contained: no asset file. */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* The giant headline is a single RIGID 3D WORLD that the CAMERA ORBITS. The phrases
   are NOT animated individually — instead they are pinned at fixed positions on a
   vertical ring (a "word carousel") standing around the jellyfish, each facing
   OUTWARD. The jellyfish floats at the hub (the ring's centre). One container — the
   stage — rotates slowly and continuously about the vertical axis (jelly-orbit), which
   reads as the viewpoint circling the creature: as the camera comes round, whichever
   word currently faces us swells to full size at centre, sweeps across with true
   turntable perspective (near edge largest, trapezoidal), then swings off to the side
   and turns away while the next word rounds into view. backface-visibility hides the
   half of the ring that faces away, and each word's own opacity bump (jelly-fade,
   phase-locked to the orbit) keeps just one phrase dominant at a time. */
const PHRASES = ["WEB-DEV", "APP-DEV", "AI/ML", "AI/AGENTS"];
const LOOP = 20; // seconds for one full 360° orbit of the camera around the jellyfish
const RING_N = PHRASES.length ; // words evenly spaced around the ring
const RING_STEP = 360 / RING_N; // angular gap between neighbouring words (deg)
const RING_R = 660; // px — radius of the word ring (how far each word stands from the hub)
const PERSP = 2200; // px — camera distance; smaller = stronger perspective foreshortening

/* A quiet design-statement that surfaces on the right during the calm resolve. */
const MANIFESTO =
  "I CRAFT IMMERSIVE DIGITAL EXPERIENCES THAT BLUR THE LINE BETWEEN ART AND TECHNOLOGY.";

/* Small technical labels stacked down each side edge — pure decoration that sells
   the "lab instrument" feel of the reference. */
const TICK_LABELS = ["UX", "3D", "FX", "AI"];

/* ═══════════════════════ The procedural 3D jellyfish ═══════════════════════
   A jellyfish recreated ENTIRELY IN CODE (react-three-fiber + custom GLSL) — no
   footage, no model file, no textures. The bell is a shaded dome with radial ribs,
   a mottled/speckled margin, an iridescent fresnel rim and an inner bioluminescent
   glow; long tentacles and frilly oral arms undulate via a vertex-shader traveling
   wave. Front-facing (gentle bob + pulse + sway); the canvas is transparent so the
   orbiting words show through behind. ───────────────────────────────────────── */

/* One shared time value drives every shader so the whole creature stays in sync. */
function useTime() {
  const t = useMemo(() => ({ value: 0 }), []);
  useFrame((s) => {
    t.value = s.clock.elapsedTime;
  });
  return t;
}

/* ── The bell ───────────────────────────────────────────────────────────────── */
const BELL_VERT = /* glsl */ `
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
  void main(){
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const BELL_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
  }

  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N,V),0.0), 2.4);

    float h = clamp((vPos.y + 0.40)/1.40, 0.0, 1.0);  // 1 apex → 0 margin
    float ang = atan(vPos.z, vPos.x);                 // -pi..pi

    // vertical colour gradient: magenta apex → pink → lilac margin
    vec3 top  = vec3(0.72, 0.26, 0.60);
    vec3 mid  = vec3(0.85, 0.42, 0.78);
    vec3 edge = vec3(0.74, 0.60, 0.93);
    vec3 col = mix(edge, mid, smoothstep(0.0,0.5,h));
    col = mix(col, top, smoothstep(0.45,1.0,h));

    // radial ribs (meridians) — fade out at apex and margin
    float ribs = abs(fract(ang/(2.0*3.14159265)*18.0) - 0.5) * 2.0;
    float ribLine = smoothstep(0.80, 0.99, ribs);
    float ribMask = smoothstep(0.98,0.55,h) * smoothstep(-0.02,0.22,h);
    col *= 1.0 - ribLine * 0.55 * ribMask;

    // The inward-facing back wall is also drawn (DoubleSide). Left alone its dark
    // margin mottling punches a hard, wobbling shadow band through the translucent
    // dome — so on back faces we drop the mottling and fade the wall right down, and
    // it reads as a faint translucent hint instead of an unstable shadow.
    float backw = gl_FrontFacing ? 1.0 : 0.0;

    // mottled / speckled dark band around the margin
    float band = smoothstep(0.34, 0.02, h);
    float spots = noise(vec2(ang*7.0, h*12.0));
    float wart = smoothstep(0.58, 0.86, spots) * band;
    col = mix(col, vec3(0.30,0.10,0.18), wart*0.85*backw);

    // iridescent rim + inner glow
    col += fres * vec3(0.26, 0.18, 0.48);
    col += (1.0 - fres) * vec3(0.20,0.05,0.15) * (0.5 + 0.5*h);

    float alpha = 0.50 + fres*0.45 + ribLine*ribMask*0.22 + wart*0.35*backw;
    alpha *= mix(0.30, 1.0, backw);
    alpha = clamp(alpha, 0.0, 0.96);
    gl_FragColor = vec4(col, alpha);
  }
`;

function Bell({ time }: { time: { value: number } }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BELL_VERT,
        fragmentShader: BELL_FRAG,
        uniforms: { uTime: time },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [time]
  );
  return (
    <mesh material={mat} scale={[1, 0.84, 1]}>
      <sphereGeometry args={[1, 160, 160, 0, Math.PI * 2, 0, 1.98]} />
    </mesh>
  );
}

/* Inner bioluminescent core — additive glow that reads through the translucent bell. */
function Glow() {
  return (
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial
        color={"#ff6fbf"}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ── Undulating strands (tentacles + oral arms) ─────────────────────────────── */
const STRAND_VERT = /* glsl */ `
  uniform float uTime; uniform float uLen; uniform float uPhase; uniform float uAmp; uniform float uFreq;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    vec3 p = position;
    float k = clamp(-p.y / uLen, 0.0, 1.0);   // 0 at top, 1 at drifting tip
    float amp = k*k*uAmp;
    p.x += sin(uTime*1.5 + k*uFreq + uPhase) * amp;
    p.z += cos(uTime*1.2 + k*uFreq*0.9 + uPhase*1.3) * amp;
    vK = k;
    vWorldY = (modelMatrix * vec4(p,1.0)).y;     // height in the scene, for the dissolve
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const STRAND_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uTop; uniform vec3 uTip; uniform float uOpacity; uniform vec2 uFade; uniform vec2 uFadeTop;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)),0.0), 1.6);
    // Dissolve to nothing as the strand drops below the frame, so it trails off into
    // wispy tips instead of being clipped flat at the bottom edge. (uFade.x = lower /
    // fully gone, uFade.y = upper / still solid.)
    // A matching dissolve at the TOP hides each strand's attachment up inside the
    // bell, so they appear to emerge from within it rather than join at a hard, flat
    // ring under the dome. (uFadeTop.x = lower / fully solid, .y = upper / gone.)
    float vis = smoothstep(uFade.x, uFade.y, vWorldY)
              * smoothstep(uFadeTop.y, uFadeTop.x, vWorldY);
    vec3 col = mix(uTop, uTip, vK) + fres*0.25;
    float alpha = ((1.0 - vK*0.92) * uOpacity + fres*0.12) * vis;
    gl_FragColor = vec4(col, clamp(alpha,0.0,1.0));
  }
`;

function strandGeometry(length: number, thickness: number, curl: number) {
  const seg = 40;
  const radial = 6;
  const spine: THREE.Vector3[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    spine.push(new THREE.Vector3(Math.sin(t * 3) * curl * t, -t * length, Math.cos(t * 2) * curl * t));
  }
  const curve = new THREE.CatmullRomCurve3(spine);
  const frames = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const p = curve.getPointAt(t);
    const r = thickness * (1 - Math.pow(t, 0.75));
    const Nf = frames.normals[i];
    const Bf = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      pos.push(
        p.x + (c * Nf.x + s * Bf.x) * r,
        p.y + (c * Nf.y + s * Bf.y) * r,
        p.z + (c * Nf.z + s * Bf.z) * r
      );
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Strand({
  time,
  angle,
  radius,
  yOffset,
  length,
  thickness,
  curl,
  amp,
  freq,
  phase,
  top,
  tip,
  opacity,
}: {
  time: { value: number };
  angle: number;
  radius: number;
  yOffset: number;
  length: number;
  thickness: number;
  curl: number;
  amp: number;
  freq: number;
  phase: number;
  top: string;
  tip: string;
  opacity: number;
}) {
  const geometry = useMemo(() => strandGeometry(length, thickness, curl), [length, thickness, curl]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STRAND_VERT,
        fragmentShader: STRAND_FRAG,
        uniforms: {
          uTime: time,
          uLen: { value: length },
          uPhase: { value: phase },
          uAmp: { value: amp },
          uFreq: { value: freq },
          uTop: { value: new THREE.Color(top) },
          uTip: { value: new THREE.Color(tip) },
          uOpacity: { value: opacity },
          // Dissolve window (world Y): solid above .y, fully gone below .x.
          uFade: { value: new THREE.Vector2(-1.85, -0.7) },
          // Top dissolve (world Y): solid at/below .x, fully hidden at/above .y — so
          // the attachment is tucked up under the bell rim (~ -0.34).
          uFadeTop: { value: new THREE.Vector2(-0.62, -0.22) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [time, length, phase, amp, freq, top, tip, opacity]
  );
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return <mesh geometry={geometry} material={mat} position={[x, yOffset, z]} />;
}

/* The whole creature. It stays put in the centre; the only big motion is a steady
   turn locked to the word-ring's LOOP, which reads as the CAMERA orbiting the whole
   scene (the words form as we come round, and we see every side of the bell too). A
   faint pulse + bob keep it alive in place. */
function Jelly({ loop }: { loop: number }) {
  const time = useTime();
  const grp = useRef<THREE.Group>(null!);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    // One revolution per LOOP, same direction as the CSS word orbit (rotateY 0 → -360).
    grp.current.rotation.y = -(t / loop) * Math.PI * 2;
    grp.current.position.y = Math.sin(t * 0.6) * 0.08;
    const k = Math.sin(t * 1.7);
    grp.current.scale.set(1 + k * 0.05, 1 - k * 0.06, 1 + k * 0.05);
  });

  const tentacles = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({ angle: (i / 28) * Math.PI * 2, phase: i * 0.5 })),
    []
  );
  const arms = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({ angle: (i / 8) * Math.PI * 2, phase: i * 1.0 + 0.4 })),
    []
  );

  return (
    <group ref={grp}>
      <Bell time={time} />
      <Glow />
      {/* Long, thin marginal tentacles */}
      {tentacles.map((s, i) => (
        <Strand
          key={`t${i}`}
          time={time}
          angle={s.angle}
          radius={0.82}
          yOffset={-0.25}
          length={4.2}
          thickness={0.016}
          curl={0.05}
          amp={0.5}
          freq={7.0}
          phase={s.phase}
          top={"#e9b6e6"}
          tip={"#f3d9f0"}
          opacity={0.55}
        />
      ))}
      {/* Frilly, fuller oral arms clustered under the centre */}
      {arms.map((s, i) => (
        <Strand
          key={`a${i}`}
          time={time}
          angle={s.angle}
          radius={0.22}
          yOffset={-0.1}
          length={2.0}
          thickness={0.07}
          curl={0.14}
          amp={0.32}
          freq={10.0}
          phase={s.phase}
          top={"#f7d6ef"}
          tip={"#e79fd8"}
          opacity={0.72}
        />
      ))}
    </group>
  );
}

/* The transparent 3D canvas holding the jellyfish. Exported so it can be dropped in
   on its own too; the hero below renders it at the hub of the word-ring. */
export function Jellyfish3D({ loop = 20 }: { loop?: number }) {
  return (
    <Canvas
      flat
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6], fov: 34 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={1} />
      <Jelly loop={loop} />
    </Canvas>
  );
}

function SideRuler({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        [side]: "1.4vh",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.1vh",
        height: "56vh",
        justifyContent: "center",
        pointerEvents: "none",
      } as CSSProperties}
    >
      {Array.from({ length: 13 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i % 4 === 0 ? "1.4vh" : "0.7vh",
            height: 1,
            background: "rgba(30,30,40,0.45)",
          }}
        />
      ))}
      <span
        style={{
          position: "absolute",
          [side]: "-2.4vh",
          writingMode: "vertical-rl",
          transform: side === "left" ? "rotate(180deg)" : "none",
          fontFamily: SANS,
          fontSize: "0.95vh",
          fontWeight: 600,
          letterSpacing: "0.35em",
          color: "rgba(30,30,40,0.5)",
          textTransform: "uppercase",
        } as CSSProperties}
      >
        {TICK_LABELS.join(" · ")}
      </span>
    </div>
  );
}

export default function JellyfishDrift() {
  return (
    <section
      className="jelly-loop"
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        // Pale, faintly cool lavender wash — the canvas the creature floats on.
        background:
          "radial-gradient(125% 120% at 50% 28%, #f1f1f7 0%, #e7e6f0 46%, #ddd9ea 74%, #d2cde2 100%)",
        fontFamily: SANS,
      }}
    >
      <style>{JELLY_CSS}</style>

      {/* ── Top nav ───────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "2.4vh 2.6vw",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4vw" }}>
          <span style={{ fontWeight: 900, fontSize: "1.9vh", letterSpacing: "-0.02em" }}>
            infinite
          </span>
          <span style={{ fontStyle: "italic", fontWeight: 500, fontSize: "1.7vh", opacity: 0.85 }}>
            loop
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "1.8vw",
            fontSize: "1.05vh",
            fontWeight: 600,
            letterSpacing: "0.18em",
            opacity: 0.75,
          }}
        >
          {/* <span>[ CREATIVE STUDIO ]</span> */}
          {/* <span>[ GET IN TOUCH ]</span> */}
        </div>
      </header>

      {/* ── Giant headline — a RIGID WORD-RING the CAMERA ORBITS. `perspective` on this
            container is the camera; the inner `.jelly-stage` is the world, spinning
            continuously about the vertical axis (jelly-orbit) so it reads as the
            viewpoint circling the jellyfish. Each phrase is pinned at a fixed angle on
            the ring (rotateY → translateZ) facing OUTWARD, so as the world turns the
            word currently facing us swells to full size and sweeps past with true
            turntable perspective, then turns away (backface-visibility hides it) while
            the next rounds into view. Sits BEHIND the jellyfish (zIndex) so the word
            crossing centre passes behind the creature, which crops it. ──────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          perspective: `${PERSP}px`,
          perspectiveOrigin: "50% 46%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          className="jelly-stage"
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            animation: `jelly-orbit ${LOOP}s linear infinite`,
            willChange: "transform",
          }}
        >
          {PHRASES.map((p, i) => (
            <span
              key={p}
              className="jelly-phrase"
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: "28vh",
                lineHeight: 1,
                letterSpacing: "-0.05em",
                whiteSpace: "nowrap",
                color: INK,
                opacity: 0,
                // Pin the word at its fixed seat on the ring, facing INWARD (rotateY 180deg).
                // It rounds the far side behind the jellyfish, sweeping from LEFT to RIGHT.
                transform: `rotateY(${(i * RING_STEP).toFixed(2)}deg) translateZ(${RING_R}px) rotateY(180deg)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                // Phase-locked delay: each word reaches dead-centre in exact sequence (0 -> 1 -> 2 -> 3)
                animation: `jelly-fade ${LOOP}s linear ${(-LOOP / 2 - (LOOP * i) / RING_N).toFixed(3)}s infinite`,
                willChange: "opacity, filter",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: `jelly-glide ${LOOP}s linear ${(-LOOP / 2 - (LOOP * i) / RING_N).toFixed(3)}s infinite`,
                  willChange: "transform",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: "scaleX(0.82)",
                    transformOrigin: "center",
                  }}
                >
                  {p}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Floating bubbles (subtle ambience) ─────────────────────────────── */}
      {[
        { left: "22%", size: "0.9vh", delay: "0s", dur: "13s" },
        { left: "71%", size: "1.4vh", delay: "4s", dur: "16s" },
        { left: "58%", size: "0.7vh", delay: "8s", dur: "11s" },
        { left: "38%", size: "1.1vh", delay: "6s", dur: "15s" },
      ].map((b, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-4vh",
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: "rgba(120,110,160,0.28)",
            boxShadow: "0 0 6px rgba(150,140,190,0.4)",
            zIndex: 15,
            animation: `jelly-bubble ${b.dur} linear ${b.delay} infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* ── The jellyfish — recreated ENTIRELY IN CODE (react-three-fiber + custom GLSL:
            ribbed translucent bell, mottled margin, iridescent rim, inner glow, and
            undulating tentacles/oral arms). Front-facing; the orbiting words pass
            behind it (lower zIndex) and show through its translucent body. ─────────── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%)",
          width: "min(58vh, 70vw)",
          height: "78vh",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <Jellyfish3D loop={LOOP} />
      </div>

      {/* ── Manifesto — the calm resolve. Surfaces on the RIGHT once the big type
            has cleared the frame at the loop seam, then recedes again just as the
            sequence restarts. Nearly static (a whisper of slide) so it reads as a
            quiet editorial statement against the kinetic headline. ───────────── */}
      <div
        style={{
          position: "absolute",
          right: "4vw",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 38,
          width: "min(22vw, 30vh)",
          textAlign: "right",
          pointerEvents: "none",
          animation: `jelly-manifesto ${LOOP}s ease-in-out 0s infinite`,
          willChange: "opacity, transform",
        }}
      >
        <p
          style={{
            margin: "1.2vh 0 0",
            fontFamily: SANS,
            fontSize: "1.35vh",
            fontWeight: 600,
            letterSpacing: "0.1em",
            lineHeight: 1.7,
            color: "rgba(30,30,40,0.82)",
            textTransform: "uppercase",
          }}
        >
          {MANIFESTO}
        </p>
      </div>

      {/* ── Side rulers ────────────────────────────────────────────────────── */}
      <SideRuler side="left" />
      <SideRuler side="right" />

      {/* ── Rotating bottom caption ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "3.4vh",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
          width: "60vw",
          textAlign: "center",
          height: "3.4vh",
        }}
      >
        {[
          "WHERE IMAGINATION MEETS TECHNOLOGY — EXPERIENCES BUILT TO MOVE YOU",
          "FLUID DESIGN. LIVING MOTION. WORLDS YOU CAN FEEL.",
          "WE DON'T JUST BUILD — WE BRING THINGS TO LIFE.",
        ].map((c, i) => (
          <p
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              margin: 0,
              fontSize: "1.15vh",
              fontWeight: 700,
              letterSpacing: "0.16em",
              lineHeight: 1.5,
              color: "rgba(30,30,40,0.78)",
              opacity: 0,
              animation: `jelly-caption 18s ease-in-out ${i * 6}s infinite`,
              willChange: "opacity",
            }}
          >
            {c}
          </p>
        ))}
      </div>

      {/* ── Corner control accents ─────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "3vh",
          left: "2.6vw",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "0.6vw",
          padding: "0.7vh 1vh",
          borderRadius: "999px",
          background: "rgba(20,20,28,0.9)",
          color: "#fff",
          fontSize: "0.9vh",
          fontWeight: 700,
          letterSpacing: "0.15em",
        }}
      >
        <span style={{ width: "1vh", height: "1vh", borderRadius: "50%", background: "#bdb3e6" }} />
        AUDIO OFF
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "3vh",
          right: "2.6vw",
          zIndex: 40,
          display: "grid",
          placeItems: "center",
          width: "3.4vh",
          height: "3.4vh",
          borderRadius: "50%",
          background: "rgba(20,20,28,0.9)",
          color: "#fff",
          fontSize: "1.1vh",
        }}
      >
        &#9654;
      </div>

      {/* ── Micro-graphics: tiny black squares drifting with parallax ───────── */}
      {[
        { left: "12%", top: "30%", size: 6, dur: "17s", delay: "0s" },
        { left: "86%", top: "62%", size: 5, dur: "21s", delay: "-6s" },
        { left: "78%", top: "26%", size: 4, dur: "14s", delay: "-3s" },
      ].map((s, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: "rgba(20,20,28,0.7)",
            zIndex: 35,
            animation: `jelly-mark ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}

      {/* Tiny corner micro-text — design-system marks */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "6.5vh",
          left: "2.6vw",
          zIndex: 35,
          fontSize: "0.85vh",
          fontWeight: 600,
          letterSpacing: "0.22em",
          color: "rgba(30,30,40,0.42)",
          textTransform: "uppercase",
        }}
      >
        Concept / 01 — Living Motion
      </div>

      {/* ── Film grain overlay (above everything, never interactive) ────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 60,
          pointerEvents: "none",
          backgroundImage: `url("${GRAIN}")`,
          backgroundSize: "140px 140px",
          opacity: 0.06,
          mixBlendMode: "multiply",
        }}
      />
    </section>
  );
}

/* All keyframes live here so the component is fully self-contained. */
const JELLY_CSS = `
/* The CAMERA ORBIT. The stage (the rigid world that holds the word-ring) spins a full
   360° about the vertical axis at a constant rate, so the viewpoint reads as circling
   the jellyfish. LINEAR + infinite = a seamless, hypnotic turntable; the words, pinned
   at fixed seats on the ring, get their motion entirely for free from this one spin. */
@keyframes jelly-orbit{
  from{transform:rotateY(0deg)}
  to{transform:rotateY(-360deg)}
}

/* Each word's brightness, phase-locked to the orbit via a negative delay: full while
   the word faces the camera (it crosses dead-centre at local 0%/100%), fading off as
   it swings toward the side and dropping to 0 across the back half so only the
   front-facing phrase reads. backface-visibility already hides the far side; this
   simply narrows it to one dominant word and gives a soft emerge/recede at the edges. */
@keyframes jelly-fade{
  0%{opacity:1; filter:blur(0px)}
  12%{opacity:1; filter:blur(0px)}
  28%{opacity:0; filter:blur(4px)}
  72%{opacity:0; filter:blur(4px)}
  88%{opacity:1; filter:blur(0px)}
  100%{opacity:1; filter:blur(0px)}
}

/* Gentle left-to-right horizontal glide */
@keyframes jelly-glide{
  0%{transform:translateX(0)}
  12%{transform:translateX(3.5vw)}
  28%{transform:translateX(9vw)}
  72%{transform:translateX(-9vw)}
  88%{transform:translateX(-3.5vw)}
  100%{transform:translateX(0)}
}

/* The manifesto rises during the calm seam (after the last phrase clears) and
   recedes as the sequence restarts — a near-static editorial whisper. */
@keyframes jelly-manifesto{
  0%,74%{opacity:0;transform:translateY(-50%) translateX(2vw)}
  81%{opacity:1;transform:translateY(-50%) translateX(0)}
  92%{opacity:1;transform:translateY(-50%) translateX(0)}
  98%,100%{opacity:0;transform:translateY(-50%) translateX(2vw)}
}

/* Tiny squares drift slowly with a faint parallax wobble */
@keyframes jelly-mark{
  0%,100%{transform:translate(0,0)}
  50%{transform:translate(-1.4vw,2vh)}
}

/* Bubbles drift up and fade as they near the top */
@keyframes jelly-bubble{
  0%{transform:translateY(0) translateX(0);opacity:0}
  12%{opacity:.7}
  80%{opacity:.5}
  100%{transform:translateY(-108vh) translateX(2vh);opacity:0}
}

/* Three captions crossfade in sequence on an 18s cycle (6s each) */
@keyframes jelly-caption{
  0%{opacity:0}
  4%,28%{opacity:1}
  33%,100%{opacity:0}
}

/* Accessibility: hold a calm, near-static frame for reduced-motion users. Freeze the
   orbit at its start so the FIRST phrase rests dead-centre facing the camera, and hide
   the rest of the ring, leaving a single readable composition with the jellyfish. */
@media (prefers-reduced-motion: reduce){
  .jelly-loop *{
    animation-duration:.001ms !important;
    animation-iteration-count:1 !important;
  }
  .jelly-loop .jelly-stage{
    animation:none !important;
    transform:rotateY(0deg) !important;
  }
  .jelly-loop .jelly-phrase{
    animation:none !important;
    opacity:0 !important;
  }
  .jelly-loop .jelly-phrase:first-of-type{
    opacity:1 !important;
  }
}
`;

