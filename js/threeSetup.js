function initThreeScene() {
    // Configurar cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0xADD8E6, 20, 50);
    
    // Configurar câmera
    const container = document.querySelector('.three-container');
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 14, cameraDistance);
    camera.lookAt(0, 0, 0);
    
    // Configurar renderizador
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('three-canvas'),
        antialias: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.6);
    scene.add(hemisphereLight);
    
    // Criar chão com textura de grama
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: grassTexture,
        roughness: 0.9,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Criar árvores maiores
    function createTree(x, z) {
        // Aumentar o tamanho do tronco
        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.4, 4, 12); // Altura 4, diâmetro 0.8
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 0, z); // Ajustar posição para o chão
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);
        
        // Aumentar o tamanho da folhagem
        const foliageGeometry = new THREE.SphereGeometry(2, 16, 16); // Raio 2
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 3, z); // Ajustar para o topo do tronco
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        scene.add(foliage);
    }
    
    // Adicionar árvores em posições aleatórias, evitando o centro (5x5 units)
    for (let i = 0; i < 6; i++) {
        let x, z;
        do {
            x = (Math.random() - 0.5) * 25;
            z = (Math.random() - 0.5) * 25;
        } while (Math.abs(x) < 10 && Math.abs(z) < 10); // Evitar área central
        createTree(x, z);
    }
    
    // Construir o braço robótico
    createRobotArm();
    
    // Criar objetos para interação
    createObjects();
    
    // Atualizar contador de objetos
    objectCountElement.textContent = objects.length;
    
    // Adicionar controles de câmera
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Iniciar animação
    animate();
}