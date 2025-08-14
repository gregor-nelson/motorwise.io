import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Main component
const PremiumBackground3D = () => {
  const containerRef = useRef();

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Style the canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Create spinning cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      wireframe: true 
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Physics properties
    const cubePhysics = {
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      position: new THREE.Vector3(0, 0, 0),
      damping: 0.95,
      angularDamping: 0.98
    };
    
    // Mouse tracking
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let isMouseDown = false;
    let isDragging = false;
    let dragStart = new THREE.Vector2();
    let lastMousePosition = new THREE.Vector2();
    
    const handleMouseMove = (event) => {
      // Store previous mouse position
      lastMousePosition.copy(mouse);
      
      // Convert mouse coordinates to normalized device coordinates (-1 to +1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Calculate mouse velocity
      if (isMouseDown) {
        const mouseDelta = new THREE.Vector2().subVectors(mouse, lastMousePosition);
        
        // Apply force based on mouse movement
        const forceMultiplier = 0.1;
        cubePhysics.angularVelocity.x += mouseDelta.y * forceMultiplier;
        cubePhysics.angularVelocity.y += mouseDelta.x * forceMultiplier;
        
        // Apply position force for "throwing" effect
        cubePhysics.velocity.x += mouseDelta.x * forceMultiplier * 0.5;
        cubePhysics.velocity.y += mouseDelta.y * forceMultiplier * 0.5;
      }
    };
    
    const handleMouseDown = (event) => {
      // Check if mouse is over the cube
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);
      
      if (intersects.length > 0) {
        isMouseDown = true;
        isDragging = true;
        dragStart.copy(mouse);
        
        // Change cube color to indicate interaction
        cube.material.color.setHex(0xff0000);
      }
    };
    
    const handleMouseUp = (event) => {
      if (isDragging) {
        // Apply final impulse based on drag distance
        const dragDistance = new THREE.Vector2().subVectors(mouse, dragStart);
        const impulseMultiplier = 0.2;
        
        cubePhysics.angularVelocity.x += dragDistance.y * impulseMultiplier;
        cubePhysics.angularVelocity.y += dragDistance.x * impulseMultiplier;
        cubePhysics.velocity.x += dragDistance.x * impulseMultiplier;
        cubePhysics.velocity.y += dragDistance.y * impulseMultiplier;
        
        // Reset cube color
        cube.material.color.setHex(0x00ff00);
      }
      
      isMouseDown = false;
      isDragging = false;
    };
    
    // Enable pointer events for interaction
    renderer.domElement.style.pointerEvents = 'auto';
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Animation loop
    const clock = new THREE.Clock();
    let animationId;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      // Apply physics
      cubePhysics.position.add(cubePhysics.velocity.clone().multiplyScalar(delta));
      cube.rotation.x += cubePhysics.angularVelocity.x * delta;
      cube.rotation.y += cubePhysics.angularVelocity.y * delta;
      cube.rotation.z += cubePhysics.angularVelocity.z * delta;
      
      // Apply position
      cube.position.copy(cubePhysics.position);
      
      // Apply damping
      cubePhysics.velocity.multiplyScalar(cubePhysics.damping);
      cubePhysics.angularVelocity.multiplyScalar(cubePhysics.angularDamping);
      
      // Boundary constraints (keep cube in view)
      const boundary = 3;
      if (Math.abs(cubePhysics.position.x) > boundary) {
        cubePhysics.position.x = Math.sign(cubePhysics.position.x) * boundary;
        cubePhysics.velocity.x *= -0.8; // Bounce with energy loss
      }
      if (Math.abs(cubePhysics.position.y) > boundary) {
        cubePhysics.position.y = Math.sign(cubePhysics.position.y) * boundary;
        cubePhysics.velocity.y *= -0.8;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Dispose geometries and materials
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

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
        pointerEvents: 'auto'
      }}
    />
  );
};

export default PremiumBackground3D;