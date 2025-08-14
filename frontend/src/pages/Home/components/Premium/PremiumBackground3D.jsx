import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const OBSTACLE_SELECTORS = [
  '.premium-section-header',
  '.premium-experience-badge',
  '.premium-data-grid',
  '.premium-feature-item',
  '.premium-section-description',
  'h1'
];

const PremiumBackground3D = () => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene / Camera / Renderer ---------------------------------------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 4.0, 8.5); // brought forward so mid-ground is clearer
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    });
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 7, 3);
    scene.add(dir);

    // --- Helpers ----------------------------------------------------------
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // Convert DOM rects to NDC rectangles
    const getObstaclesNDC = (paddingPx = 18) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rects = [];

      const seen = new Set();
      OBSTACLE_SELECTORS.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (!el || !(el instanceof HTMLElement)) return;
          if (!el.offsetParent) return; // skip detached/hidden
          if (seen.has(el)) return;
          seen.add(el);

          const r = el.getBoundingClientRect();
          if (r.width < 40 || r.height < 20) return; // ignore tiny bits

          const pad = paddingPx;
          const left = clamp((r.left - pad) / vw, 0, 1);
          const right = clamp((r.right + pad) / vw, 0, 1);
          const top = clamp((r.top - pad) / vh, 0, 1);
          const bottom = clamp((r.bottom + pad) / vh, 0, 1);

          // to NDC: x in [-1,1], y in [-1,1] with y up
          const x0 = left * 2 - 1;
          const x1 = right * 2 - 1;
          const y1 = -(top * 2 - 1);
          const y0 = -(bottom * 2 - 1);

          rects.push({ x0, x1, y0, y1 }); // axis-aligned NDC rect
        });
      });

      return rects;
    };

    // Distance & gradient from point to AABB (NDC rect)
    function rectRepulsion(p, rect, influence = 0.22, strength = 0.015) {
      const { x0, x1, y0, y1 } = rect;
      // nearest point on rect to p
      const nx = clamp(p.x, x0, x1);
      const ny = clamp(p.y, y0, y1);
      let dx = p.x - nx;
      let dy = p.y - ny;

      // if inside, push toward nearest edge
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) {
        const dl = Math.abs(p.x - x0);
        const dr = Math.abs(x1 - p.x);
        const db = Math.abs(p.y - y0);
        const dt = Math.abs(y1 - p.y);
        const m = Math.min(dl, dr, db, dt);
        if (m === dl) { dx = -1; dy = 0; }
        else if (m === dr) { dx = 1; dy = 0; }
        else if (m === db) { dx = 0; dy = -1; }
        else { dx = 0; dy = 1; }
      }

      const dist = Math.hypot(dx, dy);
      if (dist === 0) return new THREE.Vector2((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01);

      if (dist > influence) return new THREE.Vector2(0, 0);

      const falloff = 1 - dist / influence;
      const s = strength * falloff * falloff; // smooth near edge
      return new THREE.Vector2(dx / dist * s, dy / dist * s);
    }

    // Soft boundary (keep inside viewport margins in NDC)
    const viewportRepulsion = (p) => {
      const margin = 0.92; // keep within [-margin, margin]
      const infl = 0.12;
      const k = 0.01;
      const f = new THREE.Vector2(0, 0);
      if (p.x > margin) f.x -= k * (1 - clamp((p.x - margin) / infl, 0, 1));
      if (p.x < -margin) f.x += k * (1 - clamp((-margin - p.x) / infl, 0, 1));
      if (p.y > margin) f.y -= k * (1 - clamp((p.y - margin) / infl, 0, 1));
      if (p.y < -margin) f.y += k * (1 - clamp((-margin - p.y) / infl, 0, 1));
      return f;
    };

    // Mild curl-ish field for organic weave (deterministic)
    const curl = (x, y) => {
      const a = Math.sin(1.7 * x) * Math.cos(1.3 * y);
      const b = -Math.cos(1.1 * x) * Math.sin(1.9 * y);
      return new THREE.Vector2(b, a).multiplyScalar(0.007);
    };

    // NDC -> world (raycast to plane y = planeY) then clamp distance to camera
    const ndcToWorld = (x, y, planeY = 0, minDistance = 3.2, maxDistance = 11.0) => {
      // unproject a point at z=0.5 in NDC to world space (gives a ray)
      const ndc = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const origin = camera.position.clone();
      const dir = ndc.sub(camera.position).normalize();

      const denom = dir.y;
      const t = denom === 0 ? 0 : (planeY - origin.y) / denom;
      let worldPoint = origin.clone().add(dir.multiplyScalar(t));

      // clamp along camera->point distance so vehicles can't go too far away
      const v = worldPoint.clone().sub(camera.position);
      const dist = v.length();
      const clamped = clamp(dist, minDistance, maxDistance);
      if (dist === 0) return worldPoint;
      if (clamped !== dist) {
        worldPoint = camera.position.clone().add(v.normalize().multiplyScalar(clamped));
      }
      return worldPoint;
    };

    // Generate closed loop in NDC avoiding rects, then map to world
    const generateLoop = (rects) => {
      const N = 120; // control points (reduced for perf while still smooth)
      const pts = [];
      const R = 0.78; // base radius in NDC
      for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2;
        const rJitter = 0.06 * Math.sin(3 * t) + 0.04 * Math.cos(5 * t);
        pts.push(new THREE.Vector2(
          (R + rJitter) * Math.cos(t),
          (R + rJitter) * Math.sin(t)
        ));
      }

      // Relax points with obstacle repulsion + smoothing + curl
      const iters = 12;
      for (let it = 0; it < iters; it++) {
        for (let i = 0; i < N; i++) {
          const p = pts[i].clone();
          const f = new THREE.Vector2(0, 0);

          // Obstacle forces
          for (const r of rects) {
            f.add(rectRepulsion(p, r, 0.24, 0.020));
          }

          // Keep inside viewport & add little organic flow
          f.add(viewportRepulsion(p));
          f.add(curl(p.x, p.y));

          pts[i].add(f);
        }
        // Curve smoothing (keep loop closed)
        for (let i = 0; i < N; i++) {
          const prev = pts[(i - 1 + N) % N];
          const next = pts[(i + 1) % N];
          // small Laplacian smooth
          pts[i].lerp(prev.clone().add(next).multiplyScalar(0.5), 0.12);
        }
      }

      // Map to world plane y=0 and build curve
      const minDist = 3.5; // ensures minimum distance from camera
      const maxDist = 10.0; // ensures it doesn't vanish
      const worldPts = pts.map(v => ndcToWorld(v.x, v.y, 0, minDist, maxDist));
      const curve = new THREE.CatmullRomCurve3(worldPts, true, 'catmullrom', 0.5);
      return { curve, worldPts };
    };

    // --- Track & Vehicle -------------------------------------------------
    const trackMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.18 });
    let track = null;
    let curve = null;
    let curveLen = 1;

    const vehicle = new THREE.Group();

    // Car body & cabin
    const bodyGeo = new THREE.BoxGeometry(1.0, 0.42, 0.62);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1463ff, metalness: 0.12, roughness: 0.35 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    vehicle.add(body);

    const cabinGeo = new THREE.BoxGeometry(0.62, 0.32, 0.5);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0b3ea8, metalness: 0.06, roughness: 0.35 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.y = 0.36;
    vehicle.add(cabin);

    // Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.10, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.7 });
    const wp = [
      [-0.42, -0.20, 0.30], [0.42, -0.20, 0.30],
      [-0.42, -0.20, -0.30], [0.42, -0.20, -0.30]
    ];
    for (const [x, y, z] of wp) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      wheels.push(w);
      vehicle.add(w);
    }

    // subtle blob shadow under vehicle
    const shadowGeo = new THREE.PlaneGeometry(1.6, 0.9);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.22;
    vehicle.add(shadow);

    scene.add(vehicle);

    // --- Build path from DOM ---------------------------------------------
    const buildPath = () => {
      const rects = getObstaclesNDC(22);
      const result = generateLoop(rects);
      curve = result.curve;
      curveLen = curve.getLength();

      const samples = curve.getPoints(360);
      const geo = new THREE.BufferGeometry().setFromPoints(samples);
      if (track) {
        // swap geometry
        track.geometry.dispose();
        track.geometry = geo;
      } else {
        track = new THREE.Line(geo, trackMat);
        scene.add(track);
      }
    };

    buildPath();

    // Mutation observer with debounce to rebuild on content/layout changes
    let rebuildTimer = null;
    const scheduleRebuild = () => {
      if (rebuildTimer) clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(() => {
        try { buildPath(); } catch (e) { /* fail silently */ }
        rebuildTimer = null;
      }, 140); // debounce
    };

    const observer = new MutationObserver(scheduleRebuild);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });

    // Also rebuild on window resize (debounced)
    let resizeTimer = null;
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildPath();
        resizeTimer = null;
      }, 180);
    };
    window.addEventListener('resize', onResize);

    // --- Animation -------------------------------------------------------
    const clock = new THREE.Clock();
    let u = 0; // normalized progress [0..1]
    const speedHz = 0.0095; // slightly faster than before but still subtle (~105s per loop)
    const wheelRadius = 0.15;
    const bankFactor = 0.85; // how much the car leans into curves

    const tmpT1 = new THREE.Vector3();
    const tmpT2 = new THREE.Vector3();

    const animate = () => {
      const raf = requestAnimationFrame(animate);
      animate._raf = raf;

      const dt = clock.getDelta();
      if (!curve) {
        renderer.render(scene, camera);
        return;
      }

      u = (u + dt * speedHz) % 1;

      // Position & orientation on curve
      const pos = curve.getPointAt(u);
      const tangent = curve.getTangentAt(u).normalize();
      const ahead = curve.getTangentAt((u + 0.002) % 1).normalize();

      // Keep vehicle close to mid-ground by slightly nudging Z toward camera when too far
      // (But curve points already limited at generation; this softens any remaining extremes)
      const toCam = pos.clone().sub(camera.position);
      const dist = toCam.length();
      const minDist = 3.5;
      const maxDist = 10.0;
      if (dist > maxDist) {
        pos.copy(camera.position.clone().add(toCam.normalize().multiplyScalar(maxDist)));
      } else if (dist < minDist) {
        pos.copy(camera.position.clone().add(toCam.normalize().multiplyScalar(minDist)));
      }

      vehicle.position.copy(pos);

      // Face direction of motion (x-axis forward in our model)
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
      vehicle.quaternion.slerp(quat, 0.2);

      // Bank into curves (estimate signed curvature)
      tmpT1.copy(tangent);
      tmpT2.copy(ahead);
      const crossY = tmpT1.x * tmpT2.z - tmpT1.z * tmpT2.x; // y of cross product
      const dot = clamp(tmpT1.dot(tmpT2), -1, 1);
      const deltaAngle = Math.acos(dot);
      const targetBank = clamp(crossY, -1, 1) * deltaAngle * bankFactor;
      vehicle.rotation.z = THREE.MathUtils.damp(vehicle.rotation.z, targetBank, 3, dt);

      // Wheel rotation (approx)
      const metersPerSec = curveLen * speedHz;
      const wRot = (metersPerSec / wheelRadius) * dt;
      for (const w of wheels) w.rotation.x += wRot;

      // Gentle vertical bob and subtle lean offset
      vehicle.position.y += 0.02 * Math.sin(u * Math.PI * 2 * 1.2);

      // Very soft camera micro-parallax but keep camera near original to avoid vehicle shrinking
      const camOffset = 0.06;
      camera.position.x = camOffset * Math.sin(u * Math.PI * 2);
      camera.position.z = 8.5 + camOffset * Math.cos(u * Math.PI * 2);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---------------------------------------------------------
    return () => {
      // stop observers and rafs
      observer.disconnect();
      if (rebuildTimer) clearTimeout(rebuildTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      if (animate._raf) cancelAnimationFrame(animate._raf);

      // dispose track
      if (track) {
        try { track.geometry.dispose(); } catch (e) {}
        try { track.material.dispose(); } catch (e) {}
        scene.remove(track);
        track = null;
      }

      // dispose wheel / body geometry & materials
      try { wheelGeo.dispose(); } catch (e) {}
      try { wheelMat.dispose(); } catch (e) {}
      try { bodyGeo.dispose(); } catch (e) {}
      try { bodyMat.dispose(); } catch (e) {}
      try { cabinGeo.dispose(); } catch (e) {}
      try { cabinMat.dispose(); } catch (e) {}
      try { shadowGeo.dispose(); } catch (e) {}
      try { shadowMat.dispose(); } catch (e) {}

      // renderer
      try { renderer.dispose(); } catch (e) {}

      // remove DOM canvas
      if (containerRef.current && renderer.domElement.parentElement === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // run once

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    />
  );
};

export default PremiumBackground3D;
