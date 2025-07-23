function createObjects() {
    // Remover objetos existentes
    objects.forEach(obj => scene.remove(obj));
    objects = [];
    
    // Criar objetos
    const colors = [0xff6b6b, 0x4ecdc4, 0xffd166, 0x6a0572, 0x1a936f];
    const shapes = ['box', 'sphere', 'cylinder', 'cone', 'torus'];
    
    for (let i = 0; i < 8; i++) {
        const color = colors[i % colors.length];
        const shapeType = shapes[i % shapes.length];
        let geometry;
        
        switch(shapeType) {
            case 'box':
                geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.4, 16, 16);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(0.5, 1.0, 16);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.5, 0.15, 16, 32);
                break;
        }
        
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 90
        });
        const object = new THREE.Mesh(geometry, material);
        
        // Posicionar objetos em um círculo
        const angle = (i / 8) * Math.PI * 2;
        const radius = 5 + Math.random() * 3;
        object.position.set(
            Math.cos(angle) * radius,
            0.5,
            Math.sin(angle) * radius
        );
        
        object.castShadow = true;
        object.receiveShadow = true;
        scene.add(object);
        objects.push(object);
    }
    
    // Atualizar contador de objetos
    objectCountElement.textContent = objects.length;
}

function checkObjectGrab() {
    if (heldObject) return;
    
    // Posição da garra no mundo
    const gripperWorldPosition = new THREE.Vector3();
    robotGripper.getWorldPosition(gripperWorldPosition);
    
    // Verificar colisão com objetos
    for (const obj of objects) {
        const distance = gripperWorldPosition.distanceTo(obj.position);
        
        if (distance < 1.2) {
            heldObject = obj;
            // Vincular o objeto à garra
            robotGripper.add(obj);
            obj.position.set(0, -0.8, 0);
            break;
        }
    }
}

function releaseObject() {
    if (heldObject) {
        // Obter posição global antes de remover
        const worldPosition = new THREE.Vector3();
        heldObject.getWorldPosition(worldPosition);
        
        // Remover da garra e adicionar à cena
        robotGripper.remove(heldObject);
        scene.add(heldObject);
        heldObject.position.copy(worldPosition);
        
        heldObject = null;
    }
}