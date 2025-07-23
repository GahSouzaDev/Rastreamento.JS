// Criar objetos padrão (quando não há missão ativa)
function createDefaultObjects() {
    const colors = [0xFF1744, 0x00E676, 0xFFD600, 0x9C27B0, 0x00BCD4];
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
        
        object.userData = { type: 'default' };
        
        // Posicionar dentro do alcance do braço (-20° a 250°)
        const angle = mapAngleToReach(i / 8);
        const radius = 4 + Math.random() * 3;
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
}

// Mapear posição para o alcance do braço (-20° a 250°)
function mapAngleToReach(normalizedPosition) {
    // Converter -20° a 250° para radianos
    const minAngle = THREE.MathUtils.degToRad(-20);
    const maxAngle = THREE.MathUtils.degToRad(250);
    return minAngle + (maxAngle - minAngle) * normalizedPosition;
}

// Função principal para criar objetos baseada na missão ativa
function createObjects() {
    // Remover objetos existentes
    objects.forEach(obj => scene.remove(obj));
    objects = [];
    
    if (!currentMission) {
        createDefaultObjects();
    } else {
        switch(currentMission.id) {
            case 'cleanup':
                createTrashObjects();
                break;
            case 'wordSort':
                createWordObjects();
                break;
            case 'mathChallenge':
                createNumberObjects();
                break;
            default:
                createDefaultObjects();
        }
    }
    
    // Atualizar contador de objetos
    if (objectCountElement) {
        objectCountElement.textContent = objects.length;
    }
}

// Criar objetos de lixo para limpeza da floresta
function createTrashObjects() {
    const trashTypes = [
        { name: 'GARRAFA', color: 0x00E676, shape: 'cylinder' },
        { name: 'LATA', color: 0xFF1744, shape: 'cylinder' },
        { name: 'PAPEL', color: 0xFFFFFF, shape: 'box' },
        { name: 'PLÁSTICO', color: 0x00BCD4, shape: 'box' },
        { name: 'VIDRO', color: 0x76FF03, shape: 'sphere' },
        { name: 'METAL', color: 0x9E9E9E, shape: 'box' },
        { name: 'ORGÂNICO', color: 0xFF9800, shape: 'sphere' },
        { name: 'BATERIA', color: 0x3F51B5, shape: 'box' }
    ];
    
    for (let i = 0; i < 8; i++) {
        const trash = trashTypes[i];
        let geometry;
        
        switch(trash.shape) {
            case 'box':
                geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.4, 12, 8);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12);
                break;
        }
        
        const material = new THREE.MeshLambertMaterial({ color: trash.color });
        const object = new THREE.Mesh(geometry, material);
        
        object.userData = { type: 'trash', name: trash.name };
        
        // Posicionar dentro do alcance do braço
        const angle = mapAngleToReach(i / 8);
        const radius = 4 + Math.random() * 3;
        object.position.set(
            Math.cos(angle) * radius,
            0.5,
            Math.sin(angle) * radius
        );
        
        object.castShadow = true;
        object.receiveShadow = true;
        scene.add(object);
        objects.push(object);
        
        // Adicionar rótulo pequeno
        createSmallTextLabel(object, trash.name);
    }
}

// Criar objetos com palavras
function createWordObjects() {
    const wordObjects = [
        // Oxítonas (última sílaba tônica)
        { word: 'CAFÉ', syllables: 'ca-FÉ', type: 'oxitona', color: 0xFF1744 },
        { word: 'AMOR', syllables: 'a-MOR', type: 'oxitona', color: 0xFF1744 },
        { word: 'PARABÉNS', syllables: 'pa-ra-BÉNS', type: 'oxitona', color: 0xFF1744 },
        
        // Paroxítonas (penúltima sílaba tônica)
        { word: 'CASA', syllables: 'CA-sa', type: 'paroxitona', color: 0x00BCD4 },
        { word: 'LIVRO', syllables: 'LI-vro', type: 'paroxitona', color: 0x00BCD4 },
        { word: 'ÁRVORE', syllables: 'ÁR-vo-re', type: 'paroxitona', color: 0x00BCD4 },
        
        // Proparoxítonas (antepenúltima sílaba tônica)
        { word: 'MÉDICO', syllables: 'MÉ-di-co', type: 'proparoxitona', color: 0xFFD600 },
        { word: 'MÚSICA', syllables: 'MÚ-si-ca', type: 'proparoxitona', color: 0xFFD600 },
        { word: 'MÁQUINA', syllables: 'MÁ-qui-na', type: 'proparoxitona', color: 0xFFD600 }
    ];
    
    for (let i = 0; i < wordObjects.length; i++) {
        const wordObj = wordObjects[i];
        
        // Criar geometria baseada no tipo
        let geometry;
        switch(wordObj.type) {
            case 'oxitona':
                geometry = new THREE.ConeGeometry(0.5, 1.0, 12);
                break;
            case 'paroxitona':
                geometry = new THREE.BoxGeometry(0.8, 0.6, 0.4);
                break;
            case 'proparoxitona':
                geometry = new THREE.SphereGeometry(0.5, 12, 8);
                break;
        }
        
        const material = new THREE.MeshLambertMaterial({ color: wordObj.color });
        const object = new THREE.Mesh(geometry, material);
        
        object.userData = { 
            type: 'word', 
            word: wordObj.word, 
            syllables: wordObj.syllables,
            classification: wordObj.type 
        };
        
        // Posicionar dentro do alcance do braço
        const angle = mapAngleToReach(i / wordObjects.length);
        const radius = 4 + Math.random() * 3;
        object.position.set(
            Math.cos(angle) * radius,
            0.5,
            Math.sin(angle) * radius
        );
        
        object.castShadow = true;
        object.receiveShadow = true;
        scene.add(object);
        objects.push(object);
        
        // Adicionar rótulo pequeno
        createSmallTextLabel(object, wordObj.word);
    }
}

// Criar objetos com números
function createNumberObjects() {
    const level = currentMission.levels[gameState.level - 1] || currentMission.levels[0];
    const numbers = level.numbers;
    const colors = [0xFF1744, 0x00BCD4, 0xFFD600, 0x9C27B0, 0x00E676, 0xFF9800];
    
    for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];
        const color = colors[i % colors.length];
        
        // Criar geometria baseada no número
        let geometry;
        if (number <= 3) {
            geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        } else if (number <= 6) {
            geometry = new THREE.SphereGeometry(0.4, 12, 8);
        } else if (number <= 9) {
            geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12);
        } else {
            geometry = new THREE.ConeGeometry(0.4, 0.8, 12);
        }
        
        const material = new THREE.MeshLambertMaterial({ color: color });
        const object = new THREE.Mesh(geometry, material);
        
        object.userData = { type: 'number', value: number };
        
        // Posicionar dentro do alcance do braço
        const angle = mapAngleToReach(i / numbers.length);
        const radius = 4 + Math.random() * 3;
        object.position.set(
            Math.cos(angle) * radius,
            0.5,
            Math.sin(angle) * radius
        );
        
        object.castShadow = true;
        object.receiveShadow = true;
        scene.add(object);
        objects.push(object);
        
        // Adicionar rótulo pequeno
        createSmallTextLabel(object, number.toString());
    }
}

// Criar rótulo pequeno e discreto
function createSmallTextLabel(object, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 228;
    canvas.height = 64;
    
    // Fundo semi-transparente
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borda sutil
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 2;
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    // Texto pequeno e em negrito
    context.fillStyle = '#000000';
    context.font = 'bold 50px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Ajustar tamanho da fonte se o texto for muito longo
    if (text.length > 6) {
        context.font = 'bold 40px Arial';
    }
    if (text.length > 8) {
        context.font = 'bold 30px Arial';
    }
    
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshLambertMaterial({ 
        map: texture,
        transparent: true,
        alphaTest: 0.1
    });
    
    // Plano pequeno
    const geometry = new THREE.PlaneGeometry(1.5, 0.75);
    const label = new THREE.Mesh(geometry, material);
    
    // Posicionar discretamente acima do objeto
    label.position.set(0, 0.9, 0);
    object.add(label);
    
    // Armazenar referência para atualizar rotação
    object.userData.label = label;
}

// Atualizar rótulos para sempre olharem para a câmera
function updateLabels() {
    objects.forEach(obj => {
        if (obj.userData.label && camera) {
            obj.userData.label.lookAt(camera.position);
        }
    });
    
    // Atualizar rótulos dos cestos também
    if (typeof baskets !== 'undefined' && baskets.length > 0) {
        baskets.forEach(basket => {
            if (basket.userData.label && camera) {
                basket.userData.label.lookAt(camera.position);
            }
        });
    }
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
        
        // Verificar se foi solto no cesto (se há missão ativa)
        if (currentMission && gameState.missionActive) {
            if (checkBasketCollection(heldObject)) {
                // Objeto foi coletado com sucesso
                heldObject = null;
                return;
            }
        }
        
        heldObject = null;
    }
}