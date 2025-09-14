/**
 * 3D Avatar Viewer using Three.js
 * Handles interactive 3D visualization of dance avatars
 */

class ThreeDViewer {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.avatar = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.currentAction = null;
        
        this.init();
    }

    init() {
        if (!this.canvas) {
            console.error('Canvas element not found:', this.canvasId);
            return;
        }

        // Initialize Three.js scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setupEnvironment();
        
        // Start render loop
        this.animate();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('3D Viewer initialized');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
    }

    setupCamera() {
        const rect = this.canvas.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            rect.width / rect.height, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        const rect = this.canvas.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 30;
        this.controls.target.set(0, 2, 0);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (main light)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4040ff, 0.3);
        fillLight.position.set(-10, 5, -5);
        this.scene.add(fillLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xff4040, 0.2);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
    }

    setupEnvironment() {
        // Create a simple floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x666666, 0x444444);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Setup 3D controls
        const resetCameraBtn = document.getElementById('resetCamera');
        const toggleWireframeBtn = document.getElementById('toggleWireframe');
        const toggleAvatarBtn = document.getElementById('toggleAvatar');
        const avatarOpacitySlider = document.getElementById('avatarOpacity');

        if (resetCameraBtn) {
            resetCameraBtn.addEventListener('click', () => this.resetCamera());
        }

        if (toggleWireframeBtn) {
            toggleWireframeBtn.addEventListener('click', () => this.toggleWireframe());
        }

        if (toggleAvatarBtn) {
            toggleAvatarBtn.addEventListener('click', () => this.toggleAvatar());
        }

        if (avatarOpacitySlider) {
            avatarOpacitySlider.addEventListener('input', (e) => {
                this.setAvatarOpacity(parseFloat(e.target.value));
            });
        }
    }

    onWindowResize() {
        if (!this.canvas || !this.camera || !this.renderer) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
    }

    loadAvatar(fbxPath) {
        return new Promise((resolve, reject) => {
            if (!window.THREE || !window.THREE.FBXLoader) {
                reject(new Error('FBXLoader not available'));
                return;
            }

            const loader = new THREE.FBXLoader();
            
            loader.load(
                fbxPath,
                (fbx) => {
                    // Remove existing avatar
                    if (this.avatar) {
                        this.scene.remove(this.avatar);
                    }

                    this.avatar = fbx;
                    this.avatar.scale.setScalar(0.01); // Scale down if needed
                    this.avatar.position.set(0, 0, 0);
                    
                    // Enable shadows
                    this.avatar.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // Improve material
                            if (child.material) {
                                child.material.needsUpdate = true;
                            }
                        }
                    });

                    // Setup animation mixer
                    this.mixer = new THREE.AnimationMixer(this.avatar);
                    
                    // If the FBX has animations, play the first one
                    if (fbx.animations && fbx.animations.length > 0) {
                        this.currentAction = this.mixer.clipAction(fbx.animations[0]);
                        this.currentAction.play();
                    }

                    this.scene.add(this.avatar);
                    
                    console.log('Avatar loaded successfully');
                    resolve(this.avatar);
                },
                (progress) => {
                    console.log('Loading progress:', progress);
                },
                (error) => {
                    console.error('Error loading avatar:', error);
                    reject(error);
                }
            );
        });
    }

    loadDefaultAvatar() {
        // Create a simple geometric avatar as fallback
        const group = new THREE.Group();
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x00d9ff });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 6;
        head.castShadow = true;
        group.add(head);

        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.8, 2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0088cc });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 4;
        body.castShadow = true;
        group.add(body);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 6);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x00aaee });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1, 4.5, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1, 4.5, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        group.add(rightArm);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.2, 2, 6);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x0066aa });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.4, 1.5, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.4, 1.5, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        this.avatar = group;
        this.scene.add(this.avatar);
        
        // Add simple animation
        this.addSimpleAnimation();
    }

    addSimpleAnimation() {
        if (!this.avatar) return;
        
        // Simple bouncing animation
        const animate = () => {
            if (this.isPlaying && this.avatar) {
                const time = Date.now() * 0.001;
                this.avatar.position.y = Math.sin(time * 2) * 0.2;
                this.avatar.rotation.y += 0.01;
            }
        };
        
        // Add to render loop
        this.simpleAnimation = animate;
    }

    play() {
        this.isPlaying = true;
        if (this.currentAction) {
            this.currentAction.play();
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.currentAction) {
            this.currentAction.paused = true;
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.currentAction) {
            this.currentAction.stop();
        }
    }

    setTime(time) {
        if (this.currentAction) {
            this.currentAction.time = time;
        }
    }

    resetCamera() {
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 2, 0);
        this.controls.target.set(0, 2, 0);
        this.controls.update();
    }

    toggleWireframe() {
        if (!this.avatar) return;
        
        this.avatar.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.wireframe = !child.material.wireframe;
            }
        });
    }

    toggleAvatar() {
        if (this.avatar) {
            this.avatar.visible = !this.avatar.visible;
        }
    }

    setAvatarOpacity(opacity) {
        if (!this.avatar) return;
        
        this.avatar.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                child.material.opacity = opacity;
            }
        });
    }

    show() {
        if (this.canvas) {
            this.canvas.style.display = 'block';
        }
        
        const controls = document.getElementById('viewer-controls');
        if (controls) {
            controls.style.display = 'block';
        }
        
        // Resize to ensure proper display
        setTimeout(() => this.onWindowResize(), 100);
    }

    hide() {
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
        
        const controls = document.getElementById('viewer-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update animation mixer
        if (this.mixer && this.isPlaying) {
            this.mixer.update(this.clock.getDelta());
        }
        
        // Update simple animation
        if (this.simpleAnimation) {
            this.simpleAnimation();
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        // Clean up scene
        if (this.scene) {
            this.scene.clear();
        }
    }
}

// Make ThreeDViewer available globally
window.ThreeDViewer = ThreeDViewer;