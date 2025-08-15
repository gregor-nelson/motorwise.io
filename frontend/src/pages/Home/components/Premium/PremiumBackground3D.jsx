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
    const cameraOffset = new THREE.Vector3(0, 15, 25);
    const cameraTarget = new THREE.Vector3(0, 0, 5);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    });
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // --- Physics World Setup -------------------------------------------------
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.allowSleep = true;
    
    const defaultMaterial = new CANNON.Material('default');
    const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
      friction: 0.4,
      restitution: 0.3,
    });
    world.addContactMaterial(contactMaterial);
    world.defaultContactMaterial = contactMaterial;

    // --- Ground Plane ---------------------------------------------------------
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, material: defaultMaterial });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.position.set(0, 0, 0);
    world.addBody(groundBody);

    // --- Grid System ----------------------------------------------------------
    const createSubtleGrid = () => {
      const gridGroup = new THREE.Group();
      
      const gridSize = 50;
      const gridDivisions = 50;
      const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x888888);
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.1;
      gridGroup.add(gridHelper);
      
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
      right: false,
      brake: false // Added explicit brake control
    };

    // --- Enhanced Vehicle Physics State (built on original) -----------------
    const vehiclePhysics = {
      position: new THREE.Vector3(0, 0.5, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: 0, // Y-axis rotation
      speed: 0,
      maxSpeed: 0.4, // Back to original working speed
      acceleration: 0.015, // Original working acceleration
      deceleration: 0.008,
      turnSpeed: 0.08, // Original working turn speed
      friction: 0.92, // Original working friction
      
      // Enhanced properties for effects
      angularVelocity: 0, // Track turning for banking effects
      slipAngle: 0, // Angle between velocity direction and car orientation
      driftState: false, // Whether car is sliding/drifting
      
      body: null // Physics body for collisions
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
        case 'Space':
          controls.brake = true;
          event.preventDefault();
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
        case 'Space':
          controls.brake = false;
          event.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // --- Enhanced Vehicle Physics Functions (simplified) --------------------

    // Simple sliding detection based on turn rate vs speed
    const detectSliding = (turnRate, speed) => {
      const maxSafeTurnRate = 0.06;
      return Math.abs(turnRate) > maxSafeTurnRate && Math.abs(speed) > 0.2;
    };

    // --- GLTF Vehicle Loading -------------------------------------------------
    const loadVehicle = async () => {
      const loader = new GLTFLoader();
      
      try {
        const gltf = await loader.loadAsync('/scene.gltf');
        const vehicleModel = gltf.scene;
        
        vehicleModel.scale.setScalar(0.025);
        vehicleModel.rotation.set(0, 0, 0);
        
        const box = new THREE.Box3().setFromObject(vehicleModel);
        const center = box.getCenter(new THREE.Vector3());
        vehicleModel.position.set(-center.x, -center.y, -center.z);
        
        vehicleModel.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = true;
                mat.opacity = 0.8;
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = 0.8;
            }
          }
        });
        
        const vehicle = new THREE.Group();
        vehicle.add(vehicleModel);
        
        return { vehicle, wheels: [] };
      } catch (error) {
        console.error('Error loading GLTF model:', error);
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

    const { gridGroup } = createSubtleGrid();

    // --- Physics Objects System with Material Types -------------------------
    const createPhysicsBox = (position, size, mass = 50, materialType = "normal") => {
      // Material properties for Easy Win #4
      const materials = {
        soft: { color: 0x88ff88, hardness: 0.5, opacity: 0.5 },    // Light green, soft
        normal: { color: 0x888888, hardness: 1.0, opacity: 0.6 },  // Gray, normal  
        heavy: { color: 0xff8888, hardness: 2.0, opacity: 0.8 }    // Light red, hard
      };
      
      const material = materials[materialType] || materials.normal;
      
      // Visual mesh with material-based appearance
      const geometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
      const meshMaterial = new THREE.MeshBasicMaterial({
        color: material.color,
        transparent: true,
        opacity: material.opacity
      });
      const mesh = new THREE.Mesh(geometry, meshMaterial);
      scene.add(mesh);

      // Physics body with material hardness
      const shape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
      const physicsMaterial = new CANNON.Material('boxMaterial');
      physicsMaterial.hardness = material.hardness; // Store hardness for collision detection
      
      const body = new CANNON.Body({ mass: mass * material.hardness, material: physicsMaterial });
      body.addShape(shape);
      body.position.set(position.x, position.y + size.y, position.z);
      world.addBody(body);
      
      // Enhanced collision feedback with intensity-based effects
      body.addEventListener('collide', (e) => {
        const relativeVel = new CANNON.Vec3();
        if (e.target === vehicleBody || e.target.target === vehicleBody) {
          // Calculate intensity for visual feedback
          const speed = e.contact ? 1.0 : 0.5; // Simplified for now
          const intensity = Math.min(1.0, speed / 2.0);
          
          // Flash intensity based on collision severity
          const flashColors = [
            0xffff88, // Light flash for weak impacts
            0xff8844, // Orange for medium impacts  
            0xff4444  // Red for strong impacts
          ];
          
          const colorIndex = Math.floor(intensity * 2.99); // 0-2 index
          meshMaterial.color.setHex(flashColors[colorIndex]);
          
          // Flash duration based on intensity
          const flashDuration = 100 + intensity * 200; // 100-300ms
          
          setTimeout(() => {
            meshMaterial.color.setHex(material.color); // Back to original
          }, flashDuration);
        }
      });

      return { mesh, body, originalColor: material.color, materialType };
    };

    // Create test physics objects with different material types
    const physicsObjects = [];
    // Mix of different materials for testing Easy Win #4
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(8, 3, 5), new THREE.Vector3(1, 1, 1), 50, "normal"));
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(-6, 4, 8), new THREE.Vector3(0.8, 0.8, 0.8), 30, "soft")); // Soft/light cube
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(12, 2, -4), new THREE.Vector3(1.2, 0.6, 0.8), 80, "heavy")); // Heavy cube
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(-8, 3, -6), new THREE.Vector3(0.9, 0.9, 0.9), 45, "normal"));
    physicsObjects.push(createPhysicsBox(new THREE.Vector3(4, 2, -8), new THREE.Vector3(0.7, 1.2, 0.7), 25, "soft")); // Another soft one
    
    const createWall = (position, size) => {
      const shape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
      const body = new CANNON.Body({ mass: 0, material: defaultMaterial });
      body.addShape(shape);
      body.position.set(position.x, position.y, position.z);
      world.addBody(body);
      return body;
    };

    const wallHeight = 5;
    const wallThickness = 1;
    const playAreaSize = 25;
    
    createWall(new THREE.Vector3(-playAreaSize, wallHeight, 0), new THREE.Vector3(wallThickness, wallHeight, playAreaSize));
    createWall(new THREE.Vector3(playAreaSize, wallHeight, 0), new THREE.Vector3(wallThickness, wallHeight, playAreaSize));
    createWall(new THREE.Vector3(0, wallHeight, -playAreaSize), new THREE.Vector3(playAreaSize, wallHeight, wallThickness));
    createWall(new THREE.Vector3(0, wallHeight, playAreaSize), new THREE.Vector3(playAreaSize, wallHeight, wallThickness));
    
    // --- Vehicle Physics Body Creation ----------------------------------------
    const createVehiclePhysicsBody = () => {
      const vehicleSize = new CANNON.Vec3(1, 0.3, 2);
      const vehicleShape = new CANNON.Box(vehicleSize);
      const vehicleBody = new CANNON.Body({ 
        mass: 100, // Back to original working mass
        material: defaultMaterial 
      });
      vehicleBody.addShape(vehicleShape);
      vehicleBody.position.set(0, 0.8, 0);
      
      vehicleBody.fixedRotation = false;
      vehicleBody.updateMassProperties();
      
      world.addBody(vehicleBody);
      vehiclePhysics.body = vehicleBody;
      
      return vehicleBody;
    };
    
    const vehicleBody = createVehiclePhysicsBody();
    
    // Enhanced collision detection with easy wins
    const collisionSounds = {
      lastCollisionTime: 0,
      lastHitObject: null, // Smart cooldown - track specific object
      minInterval: 100
    };
    
    vehicleBody.addEventListener('collide', (e) => {
      const now = Date.now();
      const contact = e.contact;
      const other = e.target === vehicleBody ? e.contact.bi === vehicleBody ? e.contact.bj : e.contact.bi : e.contact.bj;
      
      // Easy Win #5: Smart Collision Cooldown - prevent spam with same object
      if (collisionSounds.lastHitObject === other && now - collisionSounds.lastCollisionTime < collisionSounds.minInterval) {
        return;
      }
      
      const relativeVelocity = new CANNON.Vec3();
      vehicleBody.velocity.vsub(other.velocity, relativeVelocity);
      const collisionSpeed = relativeVelocity.length();
      
      if (collisionSpeed > 0.2) { // Lowered threshold to catch lighter impacts
        collisionSounds.lastCollisionTime = now;
        collisionSounds.lastHitObject = other;
        
        // Easy Win #2: Collision Intensity Scaling (0-100%)
        let intensity = Math.min(1.0, collisionSpeed / 2.0); // Scale 0-2 speed to 0-100%
        if (intensity < 0.1) intensity = 0.1; // Minimum 10% for any collision
        
        // Easy Win #1: Impact Angle Detection
        const vehicleForward = new THREE.Vector3(
          Math.sin(vehiclePhysics.rotation), 
          0, 
          -Math.cos(vehiclePhysics.rotation)
        );
        
        const collisionNormal = new THREE.Vector3(
          contact.ni.x,
          contact.ni.y, 
          contact.ni.z
        );
        
        // Calculate angle between vehicle direction and collision normal
        const impactAngle = Math.abs(vehicleForward.dot(collisionNormal));
        const isHeadOn = impactAngle > 0.7;  // >~45 degrees = head-on
        const isGlancing = impactAngle < 0.3; // <~17 degrees = glancing
        
        // Easy Win #3: Simple Vehicle Part Detection
        const contactPoint = contact.bi === vehicleBody ? contact.ri : contact.rj;
        const relativeContact = new THREE.Vector3(contactPoint.x, contactPoint.y, contactPoint.z);
        
        // Transform contact point to vehicle local coordinates
        const vehicleMatrix = new THREE.Matrix4().makeRotationY(vehiclePhysics.rotation);
        relativeContact.applyMatrix4(vehicleMatrix.invert());
        
        let impactLocation = "center";
        if (relativeContact.z > 0.8) impactLocation = "front";
        else if (relativeContact.z < -0.8) impactLocation = "rear"; 
        else if (relativeContact.x > 0.5) impactLocation = "right";
        else if (relativeContact.x < -0.5) impactLocation = "left";
        
        // Easy Win #4: Material-Based Cube Types (simple hardness)
        const cubeHardness = other.material?.hardness || 1.0; // Default normal hardness
        
        // Scale effects based on all factors
        let forceMultiplier = intensity;
        if (isHeadOn) forceMultiplier *= 1.5;      // Head-on hits harder
        if (isGlancing) forceMultiplier *= 0.6;    // Glancing blows softer
        if (impactLocation === "front") forceMultiplier *= 1.3; // Front impacts more dramatic
        if (impactLocation === "rear") forceMultiplier *= 0.7;  // Rear impacts gentler
        
        if (other.mass > 0) {
          const pushForce = relativeVelocity.clone();
          pushForce.normalize();
          pushForce.scale(collisionSpeed * 100 * forceMultiplier / cubeHardness); // Harder materials move less
          other.applyImpulse(pushForce, other.position);
          
          // Add spin based on impact location and type
          let spinIntensity = intensity * 15;
          if (impactLocation === "front" && !isHeadOn) spinIntensity *= 1.5; // Front corner hits spin more
          if (isGlancing) spinIntensity *= 2.0; // Glancing blows create more spin
          
          const torque = new CANNON.Vec3(
            (Math.random() - 0.5) * spinIntensity,
            (Math.random() - 0.5) * spinIntensity,
            (Math.random() - 0.5) * spinIntensity
          );
          other.applyTorque(torque);
        }
        
        // Enhanced vehicle collision response
        const recoilForce = relativeVelocity.clone();
        recoilForce.normalize();
        recoilForce.scale(-collisionSpeed * other.mass * forceMultiplier * 0.1);
        vehicleBody.applyImpulse(recoilForce, vehicleBody.position);
        
        // Vehicle speed reduction based on impact type
        let speedReduction = 0.7;
        if (isHeadOn) speedReduction = 0.4;        // Head-on crashes stop you more
        if (isGlancing) speedReduction = 0.85;     // Glancing blows slow you less
        if (impactLocation === "rear") speedReduction = 0.8; // Rear hits less dramatic
        speedReduction = speedReduction + (1.0 - speedReduction) * (1.0 - intensity); // Scale by intensity
        
        vehiclePhysics.speed *= speedReduction;
        
        // Enhanced console feedback
        const impactType = isHeadOn ? "HEAD-ON" : isGlancing ? "GLANCING" : "SIDE";
        console.log(`${impactType} collision at ${impactLocation}! Speed: ${collisionSpeed.toFixed(2)}, Intensity: ${(intensity*100).toFixed(0)}%, Hardness: ${cubeHardness}x`);
      }
    });
    
    let vehicle = null;
    let wheels = [];
    
    loadVehicle().then(({ vehicle: loadedVehicle, wheels: loadedWheels }) => {
      vehicle = loadedVehicle;
      wheels = loadedWheels;
      vehicle.position.copy(vehiclePhysics.position);
      scene.add(vehicle);
    });

    // --- Enhanced Vehicle Physics (built on original working system) --------
    const updateVehiclePhysics = (deltaTime) => {
      const vp = vehiclePhysics;
      
      // === ORIGINAL WORKING MOVEMENT SYSTEM (RESTORED) ===
      // Handle user input and update vehicle physics (original system)
      if (controls.forward) {
        // Enhanced acceleration curve - starts slow, builds up
        const accelMultiplier = 1.0 + (1.0 - vp.speed / vp.maxSpeed) * 0.5; // More torque at low speeds
        vp.speed = Math.min(vp.speed + vp.acceleration * accelMultiplier, vp.maxSpeed);
      } else if (controls.backward) {
        vp.speed = Math.max(vp.speed - vp.acceleration, -vp.maxSpeed * 0.5);
      } else {
        // Enhanced friction - engine braking effect
        const frictionAmount = controls.brake ? 0.85 : vp.friction; // More aggressive deceleration when braking
        vp.speed *= frictionAmount;
        if (Math.abs(vp.speed) < 0.001) vp.speed = 0;
      }

      // Enhanced steering with speed dependency
      if (Math.abs(vp.speed) > 0.01) {
        const speedFactor = Math.max(0.4, 1.0 - Math.abs(vp.speed) * 1.5); // Harder to turn at speed
        const turnRate = vp.turnSpeed * 1.2 * speedFactor;
        
        if (controls.left) {
          vp.rotation += turnRate;
          vp.angularVelocity = turnRate; // Track angular velocity for effects
        }
        if (controls.right) {
          vp.rotation -= turnRate;
          vp.angularVelocity = -turnRate; // Track angular velocity for effects
        }
        
        // Sliding mechanics - if turning too fast for current speed
        const maxTurnSpeed = 0.06; // Maximum safe turn speed
        if (Math.abs(vp.angularVelocity) > maxTurnSpeed && Math.abs(vp.speed) > 0.2) {
          vp.driftState = true;
          // Reduce effective turn rate when sliding
          const slideFactor = 0.7;
          vp.rotation -= vp.angularVelocity * (1 - slideFactor);
          
          // Add lateral slide to velocity
          const slideAmount = (Math.abs(vp.angularVelocity) - maxTurnSpeed) * Math.abs(vp.speed) * 0.3;
          const lateralDir = Math.cos(vp.rotation);
          const lateralDirZ = Math.sin(vp.rotation);
          
          // Add slide momentum
          vp.velocity.x += lateralDir * slideAmount * Math.sign(vp.angularVelocity);
          vp.velocity.z += lateralDirZ * slideAmount * Math.sign(vp.angularVelocity);
        } else {
          vp.driftState = false;
        }
      } else {
        vp.angularVelocity = 0;
        vp.driftState = false;
      }

      // === ORIGINAL VELOCITY CALCULATION (RESTORED) ===
      // Update velocity based on speed and rotation - adjusted for vehicle orientation
      vp.velocity.x = Math.cos(vp.rotation) * vp.speed;
      vp.velocity.z = -Math.sin(vp.rotation) * vp.speed;

      // Enhanced momentum effects - preserve slide momentum
      if (vp.driftState) {
        // Gradual momentum decay during slides
        vp.velocity.multiplyScalar(0.98);
      } else {
        // Normal momentum decay
        vp.velocity.multiplyScalar(0.995);
      }

      // === ORIGINAL POSITION UPDATE (RESTORED) ===
      // Update position
      vp.position.add(vp.velocity);

      // === ENHANCED BOUNDARY HANDLING ===
      // Simple boundaries with enhanced collision response
      if (vp.position.x < -20) {
        vp.position.x = -20;
        vp.velocity.x = 0;
        vp.speed *= 0.7; // Lose speed in collision
      } else if (vp.position.x > 20) {
        vp.position.x = 20;
        vp.velocity.x = 0;
        vp.speed *= 0.7;
      }
      
      if (vp.position.z < -15) {
        vp.position.z = -15;
        vp.velocity.z = 0;
        vp.speed *= 0.7;
      } else if (vp.position.z > 15) {
        vp.position.z = 15;
        vp.velocity.z = 0;
        vp.speed *= 0.7;
      }
      
      // === PHYSICS TRACKING FOR EFFECTS ===
      // Calculate slip angle for visual effects
      if (Math.abs(vp.speed) > 0.05) {
        const velocityAngle = Math.atan2(vp.velocity.x, -vp.velocity.z);
        vp.slipAngle = ((velocityAngle - vp.rotation) * 180) / Math.PI;
        
        // Normalize slip angle to [-180, 180]
        while (vp.slipAngle > 180) vp.slipAngle -= 360;
        while (vp.slipAngle < -180) vp.slipAngle += 360;
      } else {
        vp.slipAngle = 0;
      }
    };

    // --- Resize handler -------------------------------------------------------
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // --- Enhanced Animation Loop ----------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      const raf = requestAnimationFrame(animate);
      animate._raf = raf;

      const deltaTime = clock.getDelta();
      
      // Update physics world
      world.step(Math.min(deltaTime, 1/30));
      
      // Enhanced vehicle physics update (built on original working system)
      updateVehiclePhysics();
      
      // Sync physics body with enhanced movement (restored original scaling)
      if (vehiclePhysics.body) {
        vehiclePhysics.body.position.set(
          vehiclePhysics.position.x,
          vehiclePhysics.position.y,
          vehiclePhysics.position.z
        );
        vehiclePhysics.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), vehiclePhysics.rotation);
        
        // Set velocity for realistic collision responses (restored original scaling)
        vehiclePhysics.body.velocity.set(
          vehiclePhysics.velocity.x * 10, // Back to original scaling
          0,
          vehiclePhysics.velocity.z * 10
        );
      }

      // Enhanced vehicle visual updates with collision feedback
      if (vehicle) {
        vehicle.position.copy(vehiclePhysics.position);
        vehicle.rotation.y = vehiclePhysics.rotation;

        // Enhanced banking and weight transfer effects
        const currentSpeed = vehiclePhysics.speed;
        const angularVel = vehiclePhysics.angularVelocity;
        
        // Banking based on angular velocity and speed (enhanced)
        const bankingAmount = Math.min(0.4, angularVel * currentSpeed * 5);
        vehicle.rotation.z = THREE.MathUtils.lerp(vehicle.rotation.z, -bankingAmount, 0.15);
        
        // Pitch effects from acceleration/braking (enhanced)
        const forwardAccel = (controls.forward ? 1 : 0) - (controls.backward ? 1 : 0);
        let pitchAmount = forwardAccel * currentSpeed * 0.1;
        
        // Enhanced braking pitch when using space bar
        if (controls.brake) {
          pitchAmount = currentSpeed * 0.15; // Nose dive effect
        }
        
        vehicle.rotation.x = THREE.MathUtils.lerp(vehicle.rotation.x, pitchAmount, 0.1);
        
        // Enhanced drift/slide indicators
        if (vehiclePhysics.driftState) {
          console.log(`DRIFTING! Slip angle: ${vehiclePhysics.slipAngle.toFixed(1)}°`);
        }
      }

      // Sync physics objects
      physicsObjects.forEach(obj => {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
        
        if (obj.body.position.y < -10) {
          obj.body.position.set(
            (Math.random() - 0.5) * 20,
            5,
            (Math.random() - 0.5) * 20
          );
          obj.body.velocity.set(0, 0, 0);
          obj.body.angularVelocity.set(0, 0, 0);
        }
      });

      // Enhanced camera effects
      if (vehicle) {
        const vehiclePos = vehiclePhysics.position;
        const speed = vehiclePhysics.speed;
        const isSliding = vehiclePhysics.driftState;
        
        const baseHeight = 15;
        const baseDistance = 25;
        
        // Enhanced camera shake based on driving dynamics
        const speedShake = speed * 0.8;
        const slideShake = isSliding ? 1.5 : 0;
        const totalShake = speedShake + slideShake;
        
        const shakeX = (Math.random() - 0.5) * totalShake;
        const shakeY = (Math.random() - 0.5) * totalShake * 0.3;
        
        // Enhanced banking during turns
        let bankingOffset = 0;
        if ((controls.left || controls.right) && speed > 0.01) {
          bankingOffset = vehiclePhysics.angularVelocity * speed * 3;
          if (controls.left) bankingOffset = -Math.abs(bankingOffset);
          if (controls.right) bankingOffset = Math.abs(bankingOffset);
        }
        
        const targetCameraPos = new THREE.Vector3(
          shakeX + bankingOffset,
          baseHeight + shakeY,
          baseDistance
        );
        
        const lerpFactor = 0.1;
        camera.position.lerp(targetCameraPos, lerpFactor);
        
        const lookAtX = vehiclePos.x * 0.1;
        const lookAtZ = 5 + vehiclePos.z * 0.1;
        const targetLookAt = new THREE.Vector3(lookAtX, 0, lookAtZ);
        
        cameraTarget.lerp(targetLookAt, lerpFactor * 0.5);
        camera.lookAt(cameraTarget);
      }

      renderer.render(scene, camera);
    };
    
    animate();

    // --- Cleanup -------------------------------------------------------------
    return () => {
      if (animate._raf) cancelAnimationFrame(animate._raf);
      
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);

      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });

      renderer.dispose();

      if (containerRef.current && renderer.domElement.parentElement === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

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