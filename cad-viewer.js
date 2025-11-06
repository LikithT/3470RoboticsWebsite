// Advanced CAD Viewer JavaScript
class CADViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.loadedModels = [];
        this.currentModel = null;
        this.lights = {};
        this.isWireframe = false;
        this.shadowsEnabled = true;
        
        // Loaders
        this.loaders = {
            gltf: new THREE.GLTFLoader(),
            fbx: new THREE.FBXLoader(),
            obj: new THREE.OBJLoader(),
            stl: new THREE.STLLoader(),
            ply: new THREE.PLYLoader(),
            dae: new THREE.ColladaLoader(),
            '3mf': new THREE.ThreeMFLoader(),
            mtl: new THREE.MTLLoader()
        };
        
        // Exporters
        this.exporters = {
            stl: new THREE.STLExporter(),
            obj: new THREE.OBJExporter(),
            gltf: new THREE.GLTFExporter()
        };
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        const container = document.getElementById('cadViewer');
        
        try {
            // Scene setup
            this.scene = new THREE.Scene();
            this.setBackground('light');
            
            // Camera setup
            this.camera = new THREE.PerspectiveCamera(
                75, 
                container.offsetWidth / container.offsetHeight, 
                0.1, 
                1000
            );
            this.camera.position.set(5, 5, 5);
            
            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                preserveDrawingBuffer: true // For screenshots
            });
            this.renderer.setSize(container.offsetWidth, container.offsetHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Handle legacy Three.js properties
            if (this.renderer.outputEncoding !== undefined) {
                this.renderer.outputEncoding = THREE.sRGBEncoding;
            } else if (this.renderer.outputColorSpace !== undefined) {
                this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            }
            
            if (this.renderer.toneMapping !== undefined) {
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.renderer.toneMappingExposure = 1;
            }
            
            // Controls setup
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.minDistance = 0.1;
            this.controls.maxDistance = 100;
            
            // Lighting setup
            this.setupLighting();
            
            // Add renderer to container
            container.appendChild(this.renderer.domElement);
            
            // Start animation loop
            this.animate();
            
            // Show instructions initially
            this.showInstructions();
            
            console.log('CAD Viewer initialized successfully');
        } catch (error) {
            console.error('Error initializing CAD Viewer:', error);
            this.showMessage('Failed to initialize 3D viewer', 'error');
        }
    }
    
    setupLighting() {
        // Ambient light
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.lights.ambient);
        
        // Main directional light
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 1);
        this.lights.directional.position.set(10, 10, 5);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = 2048;
        this.lights.directional.shadow.mapSize.height = 2048;
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 50;
        this.lights.directional.shadow.camera.left = -10;
        this.lights.directional.shadow.camera.right = 10;
        this.lights.directional.shadow.camera.top = 10;
        this.lights.directional.shadow.camera.bottom = -10;
        this.scene.add(this.lights.directional);
        
        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight1.position.set(-5, 5, -5);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
        fillLight2.position.set(5, -5, 5);
        this.scene.add(fillLight2);
        
        // Point light for better illumination
        this.lights.point = new THREE.PointLight(0xffffff, 0.5);
        this.lights.point.position.set(0, 5, 0);
        this.scene.add(this.lights.point);
    }
    
    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        const container = document.getElementById('cadViewer');
        container.addEventListener('dragover', (e) => this.handleDragOver(e));
        container.addEventListener('drop', (e) => this.handleDrop(e));
        container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        
        // Control buttons
        document.getElementById('resetView').addEventListener('click', () => this.resetView());
        document.getElementById('fitToScreen').addEventListener('click', () => this.fitToScreen());
        document.getElementById('toggleWireframe').addEventListener('click', () => this.toggleWireframe());
        document.getElementById('loadExample').addEventListener('click', () => this.loadExampleModel());
        
        // Display options
        document.getElementById('backgroundSelect').addEventListener('change', (e) => this.setBackground(e.target.value));
        document.getElementById('shadingSelect').addEventListener('change', (e) => this.setShadingMode(e.target.value));
        
        // Lighting controls
        document.getElementById('ambientLight').addEventListener('input', (e) => this.updateAmbientLight(e.target.value));
        document.getElementById('directionalLight').addEventListener('input', (e) => this.updateDirectionalLight(e.target.value));
        document.getElementById('toggleShadows').addEventListener('click', () => this.toggleShadows());
        
        // Material controls
        document.getElementById('materialColor').addEventListener('input', (e) => this.updateMaterialColor(e.target.value));
        document.getElementById('metalness').addEventListener('input', (e) => this.updateMetalness(e.target.value));
        document.getElementById('roughness').addEventListener('input', (e) => this.updateRoughness(e.target.value));
        document.getElementById('opacity').addEventListener('input', (e) => this.updateOpacity(e.target.value));
        
        // Export buttons
        document.getElementById('exportSTL').addEventListener('click', () => this.exportModel('stl'));
        document.getElementById('exportOBJ').addEventListener('click', () => this.exportModel('obj'));
        document.getElementById('exportGLTF').addEventListener('click', () => this.exportModel('gltf'));
        document.getElementById('screenshot').addEventListener('click', () => this.takeScreenshot());
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    }
    
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.loadFiles(files);
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        document.getElementById('cadViewer').classList.add('drag-over');
    }
    
    handleDragLeave(event) {
        event.preventDefault();
        document.getElementById('cadViewer').classList.remove('drag-over');
    }
    
    handleDrop(event) {
        event.preventDefault();
        document.getElementById('cadViewer').classList.remove('drag-over');
        
        const files = Array.from(event.dataTransfer.files);
        this.loadFiles(files);
    }
    
    async loadFiles(files) {
        if (files.length === 0) return;
        
        this.showLoading();
        this.hideInstructions();
        
        for (const file of files) {
            try {
                await this.loadFile(file);
                this.showMessage(`Successfully loaded: ${file.name}`, 'success');
            } catch (error) {
                console.error('Error loading file:', error);
                this.showMessage(`Error loading: ${file.name}`, 'error');
            }
        }
        
        this.hideLoading();
        this.fitToScreen();
    }
    
    loadFile(file) {
        return new Promise((resolve, reject) => {
            const extension = file.name.split('.').pop().toLowerCase();
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    this.parseFile(event.target.result, extension, file.name, resolve, reject);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            if (extension === 'gltf' || extension === 'glb') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }
    
    parseFile(data, extension, filename, resolve, reject) {
        const loader = this.getLoader(extension);
        
        if (!loader) {
            reject(new Error(`Unsupported file format: ${extension}`));
            return;
        }
        
        try {
            if (extension === 'gltf' || extension === 'glb') {
                loader.parse(data, '', (gltf) => {
                    this.processLoadedModel(gltf.scene, filename);
                    resolve();
                }, reject);
            } else if (extension === 'fbx') {
                const model = loader.parse(data, '');
                this.processLoadedModel(model, filename);
                resolve();
            } else if (extension === 'obj') {
                const text = new TextDecoder().decode(data);
                const model = loader.parse(text);
                this.processLoadedModel(model, filename);
                resolve();
            } else if (extension === 'stl') {
                const geometry = loader.parse(data);
                const material = new THREE.MeshPhongMaterial({ color: 0x2563eb });
                const mesh = new THREE.Mesh(geometry, material);
                this.processLoadedModel(mesh, filename);
                resolve();
            } else if (extension === 'ply') {
                const geometry = loader.parse(data);
                const material = new THREE.MeshPhongMaterial({ color: 0x2563eb });
                const mesh = new THREE.Mesh(geometry, material);
                this.processLoadedModel(mesh, filename);
                resolve();
            } else if (extension === 'dae') {
                const text = new TextDecoder().decode(data);
                loader.parse(text, '', (collada) => {
                    this.processLoadedModel(collada.scene, filename);
                    resolve();
                }, reject);
            } else {
                reject(new Error(`Parser not implemented for: ${extension}`));
            }
        } catch (error) {
            reject(error);
        }
    }
    
    getLoader(extension) {
        const loaderMap = {
            'gltf': this.loaders.gltf,
            'glb': this.loaders.gltf,
            'fbx': this.loaders.fbx,
            'obj': this.loaders.obj,
            'stl': this.loaders.stl,
            'ply': this.loaders.ply,
            'dae': this.loaders.dae,
            '3mf': this.loaders['3mf']
        };
        
        return loaderMap[extension];
    }
    
    processLoadedModel(model, filename) {
        // Remove previous model if exists
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        
        // Setup materials and shadows
        model.traverse((child) => {
            if (child.isMesh) {
                // Ensure proper materials
                if (!child.material || child.material.length === 0) {
                    child.material = new THREE.MeshPhongMaterial({ 
                        color: 0x2563eb,
                        shininess: 30
                    });
                }
                
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Compute vertex normals if needed
                if (child.geometry && !child.geometry.attributes.normal) {
                    child.geometry.computeVertexNormals();
                }
            }
        });
        
        // Scale and center the model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        if (maxDim > 0) {
            const scale = 5 / maxDim;
            model.scale.setScalar(scale);
        }
        
        // Center the model
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(model.scale.x));
        
        // Add to scene
        this.scene.add(model);
        this.currentModel = model;
        
        // Store in loaded models array
        this.loadedModels.push({
            model: model,
            filename: filename,
            timestamp: Date.now()
        });
        
        // Update model info
        this.updateModelInfo(model);
        
        console.log(`Successfully loaded: ${filename}`);
    }
    
    updateModelInfo(model) {
        let vertexCount = 0;
        let faceCount = 0;
        let objectCount = 0;
        let materialCount = 0;
        const materials = new Set();
        
        model.traverse((child) => {
            if (child.isMesh) {
                objectCount++;
                if (child.geometry) {
                    if (child.geometry.attributes.position) {
                        vertexCount += child.geometry.attributes.position.count;
                    }
                    if (child.geometry.index) {
                        faceCount += child.geometry.index.count / 3;
                    } else if (child.geometry.attributes.position) {
                        faceCount += child.geometry.attributes.position.count / 3;
                    }
                }
                
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => materials.add(mat.uuid));
                    } else {
                        materials.add(child.material.uuid);
                    }
                }
            }
        });
        
        materialCount = materials.size;
        
        document.getElementById('vertexCount').textContent = vertexCount.toLocaleString();
        document.getElementById('faceCount').textContent = Math.floor(faceCount).toLocaleString();
        document.getElementById('objectCount').textContent = objectCount;
        document.getElementById('materialCount').textContent = materialCount;
    }
    
    async loadExampleModel() {
        try {
            this.showLoading();
            this.hideInstructions();
            
            // Try to load from online sources first (demonstrating internet model loading)
            const onlineModels = [
                {
                    url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/DamagedHelmet.gltf',
                    name: 'Damaged Helmet (GLTF)',
                    type: 'gltf'
                },
                {
                    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/obj/male02/male02.obj',
                    name: 'Character Model (OBJ)',
                    type: 'obj'
                }
            ];
            
            let modelLoaded = false;
            
            // Try loading online models
            for (const modelInfo of onlineModels) {
                try {
                    console.log(`Attempting to load: ${modelInfo.name}`);
                    const response = await fetch(modelInfo.url);
                    
                    if (response.ok) {
                        if (modelInfo.type === 'gltf') {
                            const arrayBuffer = await response.arrayBuffer();
                            this.loaders.gltf.parse(arrayBuffer, '', (gltf) => {
                                this.processLoadedModel(gltf.scene, modelInfo.name);
                                this.showMessage(`Successfully loaded online model: ${modelInfo.name}`, 'success');
                            });
                        } else if (modelInfo.type === 'obj') {
                            const text = await response.text();
                            const model = this.loaders.obj.parse(text);
                            this.processLoadedModel(model, modelInfo.name);
                            this.showMessage(`Successfully loaded online model: ${modelInfo.name}`, 'success');
                        }
                        modelLoaded = true;
                        break;
                    }
                } catch (onlineError) {
                    console.log(`Failed to load ${modelInfo.name}:`, onlineError);
                    continue;
                }
            }
            
            // If online models fail, try local models
            if (!modelLoaded) {
                try {
                    const response = await fetch('./Single+Fuel+Cell+Car.fbx');
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const model = this.loaders.fbx.parse(arrayBuffer, '');
                        this.processLoadedModel(model, 'Single Fuel Cell Car.fbx');
                        this.showMessage('Local FBX model loaded successfully!', 'success');
                        modelLoaded = true;
                    }
                } catch (fbxError) {
                    console.log('Local FBX failed:', fbxError);
                }
            }
            
            // Try local OBJ as second fallback
            if (!modelLoaded) {
                try {
                    const objResponse = await fetch('./fuelcellCarCAD_optimized.obj');
                    if (objResponse.ok) {
                        const text = await objResponse.text();
                        const model = this.loaders.obj.parse(text);
                        this.processLoadedModel(model, 'Fuel Cell Car.obj');
                        this.showMessage('Local OBJ model loaded successfully!', 'success');
                        modelLoaded = true;
                    }
                } catch (objError) {
                    console.log('Local OBJ failed:', objError);
                }
            }
            
            // Final fallback to procedural model
            if (!modelLoaded) {
                this.createExampleModel();
                this.showMessage('Created procedural robot model', 'info');
            }
            
            this.hideLoading();
            this.fitToScreen();
        } catch (error) {
            console.error('Error in loadExampleModel:', error);
            this.createExampleModel();
            this.hideLoading();
            this.fitToScreen();
            this.showMessage('Created fallback robot model', 'info');
        }
    }
    
    createExampleModel() {
        // Create a detailed robot example similar to the original script
        const robotGroup = new THREE.Group();
        
        // Main chassis
        const bodyGeometry = new THREE.BoxGeometry(2.5, 1.2, 1.8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2563eb,
            shininess: 50
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        body.receiveShadow = true;
        robotGroup.add(body);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x1f2937 });
        
        const wheelPositions = [
            { x: -1.0, y: 0.4, z: 0.8 },
            { x: 1.0, y: 0.4, z: 0.8 },
            { x: -1.0, y: 0.4, z: -0.8 },
            { x: 1.0, y: 0.4, z: -0.8 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            robotGroup.add(wheel);
        });
        
        // Additional robot components...
        const slideBaseGeometry = new THREE.BoxGeometry(0.4, 2.5, 0.3);
        const slideMaterial = new THREE.MeshPhongMaterial({ color: 0x6b7280 });
        const slideBase = new THREE.Mesh(slideBaseGeometry, slideMaterial);
        slideBase.position.set(0, 2.5, -0.7);
        slideBase.castShadow = true;
        robotGroup.add(slideBase);
        
        this.processLoadedModel(robotGroup, 'Example Robot');
    }
    
    // Control methods
    resetView() {
        this.camera.position.set(5, 5, 5);
        this.controls.reset();
    }
    
    fitToScreen() {
        if (!this.currentModel) return;
        
        const box = new THREE.Box3().setFromObject(this.currentModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        cameraZ *= 1.5; // Add some padding
        
        this.camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
        this.camera.lookAt(center);
        this.controls.target.copy(center);
        this.controls.update();
    }
    
    toggleWireframe() {
        if (!this.currentModel) return;
        
        this.isWireframe = !this.isWireframe;
        
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = this.isWireframe);
                } else {
                    child.material.wireframe = this.isWireframe;
                }
            }
        });
        
        const btn = document.getElementById('toggleWireframe');
        btn.textContent = this.isWireframe ? 'Solid' : 'Wireframe';
        btn.classList.toggle('active', this.isWireframe);
    }
    
    setBackground(type) {
        const backgrounds = {
            light: new THREE.Color(0xf5f5f5),
            dark: new THREE.Color(0x2d2d2d),
            white: new THREE.Color(0xffffff),
            black: new THREE.Color(0x000000),
            gradient: null
        };
        
        if (type === 'gradient') {
            // Create gradient background
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createLinearGradient(0, 0, 0, 512);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#f0f9ff');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
            
            const texture = new THREE.CanvasTexture(canvas);
            this.scene.background = texture;
        } else {
            this.scene.background = backgrounds[type];
        }
    }
    
    setShadingMode(mode) {
        if (!this.currentModel) return;
        
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                materials.forEach(material => {
                    switch (mode) {
                        case 'flat':
                            material.flatShading = true;
                            break;
                        case 'smooth':
                            material.flatShading = false;
                            break;
                        case 'phong':
                            // Already using Phong materials
                            break;
                        case 'lambert':
                            // Would need to replace materials
                            break;
                    }
                    material.needsUpdate = true;
                });
            }
        });
    }
    
    updateAmbientLight(value) {
        this.lights.ambient.intensity = parseFloat(value);
    }
    
    updateDirectionalLight(value) {
        this.lights.directional.intensity = parseFloat(value);
    }
    
    toggleShadows() {
        this.shadowsEnabled = !this.shadowsEnabled;
        this.renderer.shadowMap.enabled = this.shadowsEnabled;
        
        const btn = document.getElementById('toggleShadows');
        btn.textContent = this.shadowsEnabled ? 'Disable Shadows' : 'Enable Shadows';
        btn.classList.toggle('active', this.shadowsEnabled);
    }
    
    updateMaterialColor(color) {
        if (!this.currentModel) return;
        
        const colorObj = new THREE.Color(color);
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => {
                    material.color.copy(colorObj);
                });
            }
        });
    }
    
    updateMetalness(value) {
        if (!this.currentModel) return;
        
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => {
                    if (material.metalness !== undefined) {
                        material.metalness = parseFloat(value);
                    }
                });
            }
        });
    }
    
    updateRoughness(value) {
        if (!this.currentModel) return;
        
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => {
                    if (material.roughness !== undefined) {
                        material.roughness = parseFloat(value);
                    }
                });
            }
        });
    }
    
    updateOpacity(value) {
        if (!this.currentModel) return;
        
        const opacity = parseFloat(value);
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => {
                    material.opacity = opacity;
                    material.transparent = opacity < 1;
                });
            }
        });
    }
    
    // Export methods
    exportModel(format) {
        if (!this.currentModel) {
            this.showMessage('No model to export', 'error');
            return;
        }
        
        try {
            let result;
            let filename;
            let mimeType;
            
            switch (format) {
                case 'stl':
                    result = this.exporters.stl.parse(this.currentModel);
                    filename = 'model.stl';
                    mimeType = 'application/sla';
                    break;
                case 'obj':
                    result = this.exporters.obj.parse(this.currentModel);
                    filename = 'model.obj';
                    mimeType = 'text/plain';
                    break;
                case 'gltf':
                    this.exporters.gltf.parse(this.currentModel, (gltf) => {
                        const result = JSON.stringify(gltf);
                        this.downloadFile(result, 'model.gltf', 'application/json');
                    });
                    return;
            }
            
            this.downloadFile(result, filename, mimeType);
            this.showMessage(`Exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage(`Export failed: ${error.message}`, 'error');
        }
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        const canvas = this.renderer.domElement;
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'cad-model-screenshot.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
        this.showMessage('Screenshot saved!', 'success');
    }
    
    // UI methods
    showLoading() {
        document.getElementById('loadingScreen').classList.add('active');
        document.getElementById('viewerInfo').textContent = 'Loading model...';
    }
    
    hideLoading() {
        document.getElementById('loadingScreen').classList.remove('active');
        document.getElementById('viewerInfo').textContent = 'Model loaded successfully';
    }
    
    showInstructions() {
        document.getElementById('instructions').style.display = 'block';
    }
    
    hideInstructions() {
        document.getElementById('instructions').style.display = 'none';
    }
    
    showMessage(text, type = 'info') {
        // Create message element
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // Show message
        setTimeout(() => message.classList.add('show'), 100);
        
        // Hide and remove message
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => document.body.removeChild(message), 300);
        }, 3000);
    }
    
    closeModal() {
        document.getElementById('fileListModal').classList.remove('active');
    }
    
    handleResize() {
        const container = document.getElementById('cadViewer');
        this.camera.aspect = container.offsetWidth / container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        // Subtle model rotation for visual appeal
        if (this.currentModel) {
            this.currentModel.rotation.y += 0.002;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the CAD viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cadViewer = new CADViewer();
});
