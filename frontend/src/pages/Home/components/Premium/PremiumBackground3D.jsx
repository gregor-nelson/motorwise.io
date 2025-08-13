import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Suppress performance warnings during development
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Violation')) {
      return; // Suppress violation warnings
    }
    originalWarn.apply(console, args);
  };
}

// Vehicle class for orbital movement
class Vehicle {
  constructor(radius = 8, speed = 0.005, layer = 0) {
    this.radius = radius;
    this.speed = speed;
    this.layer = layer;
    this.time = 0;
    
    // Create vehicle geometry
    this.group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(2, 0.5, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 1.0,
      wireframe: true
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.group.add(this.mesh);
  }

  update(delta) {
    this.time += delta * this.speed;
    
    const angle = this.time;
    const x = Math.cos(angle) * this.radius;
    const z = Math.sin(angle) * this.radius;
    const y = Math.sin(this.time * 2) * 0.1 + this.layer * 0.5;
    
    this.group.position.set(x, y, z);
    
    // Vehicle faces direction of travel
    const lookAhead = 0.1;
    const nextX = Math.cos(angle + lookAhead) * this.radius;
    const nextZ = Math.sin(angle + lookAhead) * this.radius;
    this.group.lookAt(nextX, y, nextZ);
  }
}

// Orbital ring class
class OrbitalRing {
  constructor(radius, opacity = 0.15, color = 0x3b82f6, segments = 128) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity
    });
    
    this.line = new THREE.Line(geometry, material);
  }

  setOpacity(opacity) {
    this.line.material.opacity = opacity;
  }
}

// Data particles class
class DataParticles {
  constructor(count = 20, radius, speed = 0.01, color = 0xffffff) {
    this.count = count;
    this.radius = radius;
    this.speed = speed;
    this.particles = [];
    
    // Initialize particle data
    for (let i = 0; i < count; i++) {
      this.particles.push({
        angle: (i / count) * Math.PI * 2,
        radius: radius,
        speed: speed
      });
    }
    
    // Create geometry and material
    const positions = new Float32Array(count * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    this.points = new THREE.Points(geometry, material);
    this.positions = positions;
  }

  update(delta) {
    let needsUpdate = false;
    
    this.particles.forEach((particle, i) => {
      particle.angle += particle.speed * delta;
      
      const x = Math.cos(particle.angle) * particle.radius;
      const z = Math.sin(particle.angle) * particle.radius;
      const y = 0;
      
      const index = i * 3;
      this.positions[index] = x;
      this.positions[index + 1] = y;
      this.positions[index + 2] = z;
      needsUpdate = true;
    });
    
    if (needsUpdate) {
      this.points.geometry.attributes.position.needsUpdate = true;
    }
  }
}

// Timeline helix class
class TimelineHelix {
  constructor(radius = 3, height = 4, turns = 2) {
    const points = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x525252,
      transparent: true,
      opacity: 0.1
    });
    
    this.line = new THREE.Line(geometry, material);
  }
}

// Main 3D scene class
class Scene3D {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: false, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    // Initialize clock before setting up animation
    this.clock = new THREE.Clock();
    
    // State
    this.isVisible = false;
    this.performanceMode = 'medium';
    this.activeSection = 'protection';
    this.mousePosition = { x: 0, y: 0 };
    this.scrollPosition = 0;
    
    this.setupRenderer();
    this.setupCamera();
    this.createObjects();
    this.setupAnimation();
  }

  setupRenderer() {
    console.log('Setting up renderer, container size:', this.container.clientWidth, this.container.clientHeight);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    
    // Add debug background to canvas
    this.renderer.domElement.style.background = 'rgba(255,0,0,0.2)';
    
    this.container.appendChild(this.renderer.domElement);
    console.log('Canvas appended to container');
  }

  setupCamera() {
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, 0);
  }

  createObjects() {
    console.log('Creating objects...');
    
    // Create main group for scaling and rotation
    this.sceneGroup = new THREE.Group();
    this.scene.add(this.sceneGroup);
    
    // Add a simple test cube first
    const testGeometry = new THREE.BoxGeometry(2, 2, 2);
    const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.testCube = new THREE.Mesh(testGeometry, testMaterial);
    this.testCube.position.set(0, 0, 0);
    this.sceneGroup.add(this.testCube);
    console.log('Test cube added');
    
    // Create vehicle
    this.vehicle = new Vehicle(6, 0.003, 0);
    this.sceneGroup.add(this.vehicle.group);
    console.log('Vehicle added');
    
    // Create orbital rings
    this.rings = {
      dvla: new OrbitalRing(4, 0.15, 0x3b82f6),
      mot: new OrbitalRing(6, 0.15, 0x60a5fa),
      autodata: new OrbitalRing(8, 0.15, 0x93c5fd)
    };
    
    Object.values(this.rings).forEach(ring => {
      this.sceneGroup.add(ring.line);
    });
    console.log('Rings added');
    
    // Create particle systems
    this.particleSystems = {
      dvla: new DataParticles(15, 4, 0.008, 0x3b82f6),
      mot: new DataParticles(12, 6, 0.006, 0x60a5fa),
      autodata: new DataParticles(18, 8, 0.004, 0x93c5fd)
    };
    
    Object.values(this.particleSystems).forEach(particles => {
      this.sceneGroup.add(particles.points);
    });
    console.log('Particles added');
    
    // Create timeline helix
    this.timeline = new TimelineHelix(2.5, 6, 2);
    this.sceneGroup.add(this.timeline.line);
    console.log('Timeline added');
    
    console.log('Scene children count:', this.scene.children.length);
  }

  setupAnimation() {
    const animate = () => {
      if (!this.isAnimating) return;
      
      const delta = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();
      
      if (this.isVisible) {
        // Update vehicle
        this.vehicle.update(delta);
        
        // Update particle systems
        Object.values(this.particleSystems).forEach(particles => {
          particles.update(delta);
        });
        
        // Update scene rotation
        const baseRotation = Math.sin(elapsedTime * 0.1) * 0.05;
        const mouseInfluence = this.mousePosition.x * 0.02;
        const scrollInfluence = (this.scrollPosition * 0.0001) % (Math.PI * 2);
        
        this.sceneGroup.rotation.y = baseRotation + mouseInfluence + scrollInfluence;
        
        // Mouse proximity scaling
        const mouseDistance = Math.sqrt(this.mousePosition.x ** 2 + this.mousePosition.y ** 2);
        const proximityFactor = Math.max(0, 1 - mouseDistance);
        const scale = 1 + proximityFactor * 0.05;
        this.sceneGroup.scale.setScalar(scale);
        
        // Update ring opacities based on active section
        this.updateRingOpacities();
      }
      
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    };
    
    this.isAnimating = true;
    animate();
  }

  updateRingOpacities() {
    const sectionConfig = {
      protection: { opacity: 0.2 },
      analysis: { opacity: 0.2 },
      empowerment: { opacity: 0.2 }
    };
    
    const currentConfig = sectionConfig[this.activeSection] || sectionConfig.protection;
    
    this.rings.dvla.setOpacity(this.activeSection === 'protection' ? currentConfig.opacity : 0.1);
    this.rings.mot.setOpacity(this.activeSection === 'analysis' ? currentConfig.opacity : 0.1);
    this.rings.autodata.setOpacity(this.activeSection === 'empowerment' ? currentConfig.opacity : 0.1);
  }

  setVisible(visible) {
    this.isVisible = visible;
  }

  setActiveSection(section) {
    this.activeSection = section;
  }

  setMousePosition(x, y) {
    this.mousePosition.x = x;
    this.mousePosition.y = y;
  }

  setScrollPosition(position) {
    this.scrollPosition = position;
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    this.isAnimating = false;
    
    // Dispose geometries and materials
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

// Content synchronization hook
const useContentSync = () => {
  const [activeSection, setActiveSection] = useState('protection');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrollPosition(scrollY);
      
      // Determine active section based on scroll position
      const sections = document.querySelectorAll('.premium-feature-group');
      let currentSection = 'protection';
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          const sectionNames = ['protection', 'analysis', 'empowerment'];
          currentSection = sectionNames[index] || 'protection';
        }
      });
      
      setActiveSection(currentSection);
    };

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { activeSection, mousePosition, scrollPosition };
};

// Main component
const PremiumBackground3D = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceMode, setPerformanceMode] = useState('medium');
  const containerRef = useRef();
  const sceneRef = useRef();
  const { activeSection, mousePosition, scrollPosition } = useContentSync();

  // Intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (sceneRef.current) {
          sceneRef.current.setVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Performance detection
  useEffect(() => {
    const detectPerformance = () => {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (hasReducedMotion) {
        setPerformanceMode('static');
      } else if (isMobile) {
        setPerformanceMode('low');
      } else if (navigator.hardwareConcurrency >= 8) {
        setPerformanceMode('high');
      } else {
        setPerformanceMode('medium');
      }
    };

    detectPerformance();
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', detectPerformance);
    
    return () => mediaQuery.removeEventListener('change', detectPerformance);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || performanceMode === 'static') return;

    // Check if already has a canvas child (prevent double render)
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      console.log('Canvas already exists, skipping initialization');
      return;
    }

    // Ensure container has proper dimensions
    const parentElement = containerRef.current.parentElement;
    const width = parentElement ? parentElement.clientWidth : window.innerWidth;
    const height = parentElement ? parentElement.clientHeight : window.innerHeight;
    
    // Fallback to viewport if parent has no height
    const finalWidth = width > 0 ? width : window.innerWidth;
    const finalHeight = height > 0 ? height : window.innerHeight;
    
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      finalWidth / finalHeight,
      0.1,
      100
    );
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(finalWidth, finalHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // PROPER BACKGROUND POSITIONING - CLEAN VERSION
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    containerRef.current.appendChild(renderer.domElement);
    
    console.log('Canvas dimensions:', finalWidth, finalHeight);
    console.log('Canvas element:', renderer.domElement);
    console.log('Container:', containerRef.current);
    
    // Create test objects - EXACT copy of working version
    const testGeometry = new THREE.BoxGeometry(2, 2, 2);
    const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 0, 0);
    scene.add(testCube);
    
    // Add one Vehicle object incrementally - smaller radius to stay in view
    const vehicle = new Vehicle(4, 0.5, 0);
    scene.add(vehicle.group);
    
    // Add one orbital ring incrementally - matching vehicle radius
    const ring = new OrbitalRing(4, 0.15, 0x60a5fa);
    scene.add(ring.line);
    
    // Add one data particle system incrementally - matching vehicle radius
    const particles = new DataParticles(12, 4, 0.5, 0x60a5fa);
    scene.add(particles.points);
    
    console.log('Test cube, vehicle, ring and particles added to scene');
    console.log('Scene children:', scene.children.length);
    
    // Add simple lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Animation loop
    const clock = new THREE.Clock();
    let animationId;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      testCube.rotation.x += delta;
      testCube.rotation.y += delta;
      
      // Update vehicle
      vehicle.update(delta);
      
      // Debug vehicle position
      if (Math.floor(clock.getElapsedTime()) % 2 === 0) {
        console.log('Vehicle position:', vehicle.group.position.x.toFixed(2), vehicle.group.position.z.toFixed(2));
      }
      
      // Update particles
      particles.update(delta);
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      const parentElement = containerRef.current.parentElement;
      const width = parentElement ? parentElement.clientWidth : window.innerWidth;
      const height = parentElement ? parentElement.clientHeight : window.innerHeight;
      
      const finalWidth = width > 0 ? width : window.innerWidth;
      const finalHeight = height > 0 ? height : window.innerHeight;
      
      camera.aspect = finalWidth / finalHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(finalWidth, finalHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up Three.js scene...');
      
      animationId = null; // Stop animation loop
      
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // No need to reset flags since we're using DOM-based detection
    };
  }, [performanceMode]);

  // Update scene state
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setActiveSection(activeSection);
      sceneRef.current.setMousePosition(mousePosition.x, mousePosition.y);
      sceneRef.current.setScrollPosition(scrollPosition);
    }
  }, [activeSection, mousePosition, scrollPosition]);

  // Don't render if reduced motion is preferred
  if (performanceMode === 'static') {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: 'none'
      }}
    />
  );
};

export default PremiumBackground3D;