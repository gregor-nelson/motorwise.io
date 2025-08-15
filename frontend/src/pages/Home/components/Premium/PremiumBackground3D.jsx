import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

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
    // Isometric gaming style camera for better depth perception
    const cameraOffset = new THREE.Vector3(0, 15, 25); // Lower height, further back
    const cameraTarget = new THREE.Vector3(0, 0, 5);   // Look slightly forward for isometric angle
    camera.position.set(0, 15, 25); // Isometric position
    camera.lookAt(0, 0, 5); // Creates ~30-45 degree viewing angle

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Completely transparent background
    renderer.shadowMap.enabled = false; // Disable shadows for subtlety
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    });
    containerRef.current.appendChild(renderer.domElement);

    // Subtle ambient lighting only
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // --- Physics World Setup -------------------------------------------------
    const world = new CANNON.World();
    world.gravity.set(0, 0, -9.82);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.allowSleep = true;

    // --- Ground Plane ---------------------------------------------------------
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);

    // --- Subtle Grid System ----------------------------------------------------------
    const createSubtleGrid = () => {
      const gridGroup = new THREE.Group();
      
      // Create a larger subtle grid to accommodate vehicle movement
      const gridSize = 50; // Fixed size that works well with static camera
      const gridDivisions = 50;
      const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x888888);
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.1; // Very subtle
      gridGroup.add(gridHelper);
      
      // Optional: Add a few reference lines that are slightly more visible
      const centerLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-gridSize/2, 0, 0),
        new THREE.Vector3(gridSize/2, 0, 0)
      ]);
      const centerLineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x666666, 
        transparent: true, 
        opacity: 0.15 
      });
      const centerLineX = new THREE.Line(centerLineGeometry, centerLineMaterial);
      gridGroup.add(centerLineX);
      
      const centerLineZ = centerLineX.clone();
      centerLineZ.rotation.y = Math.PI / 2;
      gridGroup.add(centerLineZ);
      
      scene.add(gridGroup);
      
      return { gridGroup };
    };

    // User Controls System
    const controls = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    // Vehicle Physics State
    const vehiclePhysics = {
      position: new THREE.Vector3(0, 0.5, 0), // Start at center
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: 0, // Y-axis rotation
      speed: 0,
      maxSpeed: 0.4, // Slightly faster for better movement
      acceleration: 0.015,
      deceleration: 0.008,
      turnSpeed: 0.08,
      friction: 0.92
    };

    // Keyboard Event Listeners
    const onKeyDown = (event) => {
      switch(event.code) {
        case 'KeyW':
        case 'ArrowUp':
          controls.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          controls.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          controls.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          controls.right = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch(event.code) {
        case 'KeyW':
        case 'ArrowUp':
          controls.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          controls.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          controls.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          controls.right = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // --- Fixed Vehicle Boundaries ----------------------------------------
    // Vehicle movement area: -20 to +20 horizontal, -15 to +15 vertical


    // --- GLTF Vehicle Loading -------------------------------------------------
    const loadVehicle = async () => {
      const loader = new GLTFLoader();
      
      try {
        const gltf = await loader.loadAsync('/scene.gltf');
        const vehicleModel = gltf.scene;
        
        // Scale the model bigger - make it more prominent
        // GLTF model is ~142 units wide, scaling to make it larger and more visible
        vehicleModel.scale.setScalar(0.025);
        
        // Fix orientation - rotate to align with ground plane and forward direction
        vehicleModel.rotation.x = 0;           // Keep model upright (no X rotation)
        vehicleModel.rotation.y = 0;           // Face forward (no Y rotation)
        vehicleModel.rotation.z = 0;           // No Z rotation needed
        
        // Calculate model's bounding box to find center of geometry (CG)
        const box = new THREE.Box3().setFromObject(vehicleModel);
        const center = box.getCenter(new THREE.Vector3());
        
        // Offset the model so its center is at the origin (0,0,0)
        // This makes the model rotate around its center instead of its original origin
        vehicleModel.position.set(-center.x, -center.y, -center.z);
        
        // Preserve original model colors but add transparency for aesthetic consistency
        vehicleModel.traverse((child) => {
          if (child.isMesh && child.material) {
            // Keep original material but add transparency
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = true;
                mat.opacity = 0.8; // Slightly less transparent to show colors better
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = 0.8; // Slightly less transparent to show colors better
            }
          }
        });
        
        // Create a wrapper group for dynamic rotations (banking, steering)
        const vehicle = new THREE.Group();
        vehicle.add(vehicleModel);
        
        return { vehicle, wheels: [] }; // No wheel animation for now
      } catch (error) {
        console.error('Error loading GLTF model:', error);
        // Fallback to simple box if model fails to load
        return createFallbackVehicle();
      }
    };

    const createFallbackVehicle = () => {
      const vehicle = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(2.0, 0.6, 1.0);
      const bodyMat = new THREE.MeshBasicMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.6
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.3;
      vehicle.add(body);
      return { vehicle, wheels: [] };
    };

    // Initialize grid and load vehicle
    const { gridGroup } = createSubtleGrid();

    // --- Physics Objects System -----------------------------------------------
    const createPhysicsBox = (position, size, mass = 50) => {
      // Visual mesh
      const geometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
      const material = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.6
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Physics body
      const shape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
      const body = new CANNON.Body({ mass });
      body.addShape(shape);
      body.position.set(position.x, position.y, position.z + size.z);
      world.addBody(body);

      return { mesh, body };
    };

    // Create some test physics objects
    const physicsObjects = [];
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(8, 5, 0), new THREE.Vector3(1, 1, 1)));
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(-6, 8, 0), new THREE.Vector3(0.8, 0.8, 0.8)));
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(12, -4, 0), new THREE.Vector3(1.2, 0.6, 0.8)));
    
    // Vehicle will be loaded asynchronously
    let vehicle = null;
    let wheels = [];
    
    // Load the GLTF vehicle model
    loadVehicle().then(({ vehicle: loadedVehicle, wheels: loadedWheels }) => {
      vehicle = loadedVehicle;
      wheels = loadedWheels;
      
      // Set initial vehicle position
      vehicle.position.copy(vehiclePhysics.position);
      scene.add(vehicle);
    });
    
    // Vehicle will be loaded and ready shortly

    // --- Vehicle Physics & Animation -----------------------------------------

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // --- User-Controlled Animation Loop -------------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      const raf = requestAnimationFrame(animate);
      animate._raf = raf;

      const deltaTime = clock.getDelta();
      
      // Update physics world (capped at 30fps for stability)
      world.step(Math.min(deltaTime, 1/30));
      
      // Handle user input and update vehicle physics
      if (controls.forward) {
        vehiclePhysics.speed = Math.min(vehiclePhysics.speed + vehiclePhysics.acceleration, vehiclePhysics.maxSpeed);
      } else if (controls.backward) {
        vehiclePhysics.speed = Math.max(vehiclePhysics.speed - vehiclePhysics.acceleration, -vehiclePhysics.maxSpeed * 0.5);
      } else {
        // Apply friction when no input
        vehiclePhysics.speed *= vehiclePhysics.friction;
        if (Math.abs(vehiclePhysics.speed) < 0.001) vehiclePhysics.speed = 0;
      }

      // Handle steering (only when moving) - slower, more realistic turning
      if (Math.abs(vehiclePhysics.speed) > 0.01) {
        if (controls.left) {
          vehiclePhysics.rotation += vehiclePhysics.turnSpeed * 1.2; // Slower turning
        }
        if (controls.right) {
          vehiclePhysics.rotation -= vehiclePhysics.turnSpeed * 1.2; // Slower turning
        }
      }

      // Update velocity based on speed and rotation - adjusted for vehicle orientation
      vehiclePhysics.velocity.x = Math.cos(vehiclePhysics.rotation) * vehiclePhysics.speed;
      vehiclePhysics.velocity.z = -Math.sin(vehiclePhysics.rotation) * vehiclePhysics.speed;

      // Update position
      vehiclePhysics.position.add(vehiclePhysics.velocity);

      // Simple boundaries - only stop at screen edges, no speed reduction
      const vehicleSize = 1;
      
      // Keep vehicle within reasonable bounds without speed penalties
      if (vehiclePhysics.position.x < -20) {
        vehiclePhysics.position.x = -20;
        vehiclePhysics.velocity.x = 0;
      } else if (vehiclePhysics.position.x > 20) {
        vehiclePhysics.position.x = 20;
        vehiclePhysics.velocity.x = 0;
      }
      
      if (vehiclePhysics.position.z < -15) {
        vehiclePhysics.position.z = -15;
        vehiclePhysics.velocity.z = 0;
      } else if (vehiclePhysics.position.z > 15) {
        vehiclePhysics.position.z = 15;
        vehiclePhysics.velocity.z = 0;
      }

      // Update vehicle visual position and rotation (only if loaded)
      if (vehicle) {
        vehicle.position.copy(vehiclePhysics.position);
        vehicle.rotation.y = vehiclePhysics.rotation;

        // Banking effect for turns
        const bankAmount = 0.2;
        if (controls.left && Math.abs(vehiclePhysics.speed) > 0.01) {
          vehicle.rotation.z = THREE.MathUtils.lerp(vehicle.rotation.z, bankAmount, 0.1);
        } else if (controls.right && Math.abs(vehiclePhysics.speed) > 0.01) {
          vehicle.rotation.z = THREE.MathUtils.lerp(vehicle.rotation.z, -bankAmount, 0.1);
        } else {
          vehicle.rotation.z = THREE.MathUtils.lerp(vehicle.rotation.z, 0, 0.1);
        }
      }

      // Sync physics objects with their visual representations
      physicsObjects.forEach(obj => {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
      });

      // Enhanced static camera with dynamic effects for better depth perception
      if (vehicle) {
        const vehiclePos = vehiclePhysics.position;
        const speed = Math.abs(vehiclePhysics.speed);
        
        // Keep camera in fixed isometric position but add subtle dynamic effects
        const baseHeight = 15;  // Lower height for isometric view
        const baseDistance = 25; // Further back to maintain area coverage
        
        // Add subtle camera shake/movement for speed sensation without following
        const speedShake = speed * 0.5; // Very subtle shake when moving fast
        const shakeX = (Math.random() - 0.5) * speedShake;
        const shakeY = (Math.random() - 0.5) * speedShake * 0.3;
        
        // Add slight banking to camera during turns for cinematic effect
        let bankingOffset = 0;
        if (controls.left && speed > 0.01) {
          bankingOffset = -speed * 1.5; // Camera banks slightly during left turns
        } else if (controls.right && speed > 0.01) {
          bankingOffset = speed * 1.5;  // Camera banks slightly during right turns
        }
        
        // Calculate camera position with subtle effects
        const targetCameraPos = new THREE.Vector3(
          shakeX + bankingOffset,
          baseHeight + shakeY,
          baseDistance
        );
        
        // Very gentle interpolation for smooth effects
        const lerpFactor = 0.1;
        camera.position.lerp(targetCameraPos, lerpFactor);
        
        // Camera looks at isometric target point with slight vehicle-based offset for depth
        const lookAtX = vehiclePos.x * 0.1; // Very subtle influence from vehicle position
        const lookAtZ = 5 + vehiclePos.z * 0.1; // Look forward for isometric angle + slight vehicle influence
        const targetLookAt = new THREE.Vector3(lookAtX, 0, lookAtZ);
        
        // Smooth camera target interpolation
        cameraTarget.lerp(targetLookAt, lerpFactor * 0.5);
        camera.lookAt(cameraTarget);
      }

      renderer.render(scene, camera);
    };
    
    animate();

    // --- Cleanup ---------------------------------------------------------
    return () => {
      // Stop animation
      if (animate._raf) cancelAnimationFrame(animate._raf);
      
      // Remove event listeners
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);

      // Dispose geometries and materials
      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });

      // Dispose renderer
      renderer.dispose();

      // Remove canvas from DOM
      if (containerRef.current && renderer.domElement.parentElement === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // run once

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    />
  );
};

export default PremiumBackground3D;