// Sistema de Missões e Gamificação
let currentMission = null;
let gameState = {
    score: 0,
    stars: 0,
    timeLeft: 0,
    missionActive: false,
    completedMissions: [],
    streak: 0,
    level: 1
};

let missions = {
    cleanup: {
        id: 'cleanup',
        name: 'Limpeza da Floresta 🌲',
        description: 'Colete todos os objetos de lixo e coloque no cesto marrom',
        timeLimit: 150, // 5 minutos (era 90s)
        targetCount: 8,
        currentCount: 0,
        stars: 3,
        icon: '🌲',
        basketColor: 0x8B4513 // Marrom
    },
    wordSort: {
        id: 'wordSort',
        name: 'Classificação de Palavras 📝',
        description: 'Separe as palavras nos cestos corretos: Oxítonas, Paroxítonas e Proparoxítonas',
        timeLimit: 250, // 5 minutos (era 120s)
        targetCount: 9,
        currentCount: 0,
        stars: 3,
        icon: '📝',
        baskets: [
            { type: 'oxitona', color: 0x808080, name: 'Oxítonas' },
            { type: 'paroxitona', color: 0x808080, name: 'Paroxítonas' },
            { type: 'proparoxitona', color: 0x808080, name: 'Proparoxítonas' }
        ]
    },
    mathChallenge: {
        id: 'mathChallenge',
        name: 'Desafio Matemático 🔢',
        description: 'Colete números que somem exatamente o valor alvo',
        timeLimit: 100, // 4 minutos (era 80s)
        targetSum: 20,
        currentSum: 0,
        collectedNumbers: [],
        stars: 3,
        icon: '🔢',
        basketColor: 0x9C27B0, // Roxo vibrante
        levels: [
            { target: 10, numbers: [1, 2, 3, 4, 5, 6, 7, 8] },
            { target: 15, numbers: [2, 3, 4, 5, 6, 7, 8, 9] },
            { target: 20, numbers: [3, 4, 5, 6, 7, 8, 9, 10] },
            { target: 25, numbers: [4, 5, 6, 7, 8, 9, 10, 11, 12] },
            { target: 30, numbers: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
        ]
    }
};

let baskets = [];
let missionTimer = null;
let missionUI = null;

// Mapear ângulo para o alcance do braço (-20° a 250°)
function mapBasketAngleToReach(normalizedPosition) {
    // Converter -20° a 250° para radianos, mas usar uma faixa menor para cestos
    const minAngle = THREE.MathUtils.degToRad(160); // Começar em 160°
    const maxAngle = THREE.MathUtils.degToRad(240); // Terminar em 240°
    return minAngle + (maxAngle - minAngle) * normalizedPosition;
}

// Criar cesto único (posição dentro do alcance do braço)
function createBasket(color = 0x8B4513, position = null) {
    if (!position) {
        // Posição padrão dentro do alcance do braço
        const angle = THREE.MathUtils.degToRad(200); // 200° está no alcance
        position = {
            x: Math.cos(angle) * 6,
            y: -1,
            z: Math.sin(angle) * 6
        };
    }
    
    const basketGroup = new THREE.Group();
    
    // Base do cesto
    const basketGeometry = new THREE.CylinderGeometry(1.5, 1.2, 1.5, 16, 1, true);
    const basketMaterial = new THREE.MeshLambertMaterial({ 
        color: color,
        side: THREE.DoubleSide
    });
    const basketMesh = new THREE.Mesh(basketGeometry, basketMaterial);
    basketMesh.position.y = 0;
    basketMesh.castShadow = true;
    basketMesh.receiveShadow = true;
    basketGroup.add(basketMesh);
    
    // Fundo do cesto
    const bottomGeometry = new THREE.CircleGeometry(1.2, 16);
    const bottomMaterial = new THREE.MeshLambertMaterial({ color: color });
    const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -0.75;
    bottom.receiveShadow = true;
    basketGroup.add(bottom);
    
    // Borda do cesto
    const rimGeometry = new THREE.TorusGeometry(1.5, 0.08, 8, 16);
    const rimMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0.75;
    rim.castShadow = true;
    basketGroup.add(rim);
    
    // Posicionar o cesto
    basketGroup.position.set(position.x, position.y, position.z);
    scene.add(basketGroup);
    
    return basketGroup;
}

// Criar múltiplos cestos para missão de palavras
function createMultipleBaskets() {
    // Limpar cestos existentes
    baskets.forEach(basket => scene.remove(basket));
    baskets = [];
    
    // Posições bem separadas dentro do alcance do braço (-20° a 250°)
    const positions = [];
    for (let i = 0; i < 3; i++) {
        const angle = mapBasketAngleToReach(i / 2); // Distribui entre 0 e 1
        positions.push({
            x: Math.cos(angle) * 7, // Raio 7 para ficar bem acessível
            y: -1,
            z: Math.sin(angle) * 7
        });
    }
    
    currentMission.baskets.forEach((basketInfo, index) => {
        const basket = createBasket(basketInfo.color, positions[index]);
        basket.userData = { type: basketInfo.type, name: basketInfo.name };
        baskets.push(basket);
        
        // Adicionar texto indicativo pequeno
        createSmallBasketLabel(basket, basketInfo.name);
    });
}

// Criar rótulo pequeno para cesto (texto preto)
function createSmallBasketLabel(basket, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    // Fundo semi-transparente
    context.fillStyle = 'rgba(255, 255, 255, 0.4)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borda sutil
    context.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    context.lineWidth = 3;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Texto preto, menor e em negrito
    context.fillStyle = '#000000'; // Preto (era vermelho)
    context.font = 'bold 40px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Ajustar fonte para textos longos
    if (text.length > 8) {
        context.font = 'bold 35px Arial';
    }
    
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshLambertMaterial({ 
        map: texture,
        transparent: true,
        alphaTest: 0.1
    });
    
    // Plano menor
    const geometry = new THREE.PlaneGeometry(4, 1);
    const label = new THREE.Mesh(geometry, material);
    
    // Posicionar mais baixo
    label.position.set(0, 2, 0);
    basket.add(label);
    
    // Armazenar referência para atualizar rotação
    basket.userData.label = label;
}

// Criar rótulo pequeno para objeto (texto preto)
function createSmallObjectLabel(object, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    
    // Fundo semi-transparente
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borda sutil
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 2;
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    // Texto preto, pequeno e em negrito
    context.fillStyle = '#000000'; // Preto (era vermelho)
    context.font = 'bold 30px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Ajustar tamanho da fonte se o texto for muito longo
    if (text.length > 6) {
        context.font = 'bold 16px Arial';
    }
    if (text.length > 8) {
        context.font = 'bold 14px Arial';
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

// [Resto do código missions.js permanece igual, apenas mudando as duas funções acima]

// Verificar coleta no cesto (distância aumentada para facilitar)
function checkBasketCollection(obj) {
    if (!baskets.length || !currentMission) return false;
    
    for (const basket of baskets) {
        const basketPos = basket.position;
        const objPos = obj.position;
        const distance = basketPos.distanceTo(objPos);
        
        // Aumentar área de coleta para 4 unidades
        if (distance < 4) {
            return processMissionObject(obj, basket);
        }
    }
    
    return false;
}

// Criar objetos de lixo para limpeza (usando posicionamento do braço)
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
        
        // Usar função de mapeamento para posicionar dentro do alcance
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
        createSmallObjectLabel(object, trash.name);
    }
}

// Criar objetos com palavras (usando posicionamento do braço)
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
        
        // Usar função de mapeamento para posicionar dentro do alcance
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
        createSmallObjectLabel(object, wordObj.word);
    }
}

// Criar objetos com números (usando posicionamento do braço)
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
        
        // Usar função de mapeamento para posicionar dentro do alcance
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
        
        // Adicionar rótulo pequeno com o número
        createSmallObjectLabel(object, number.toString());
    }
}

// Criar rótulo pequeno para objeto (texto vermelho)
function createSmallObjectLabel(object, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    
    // Fundo semi-transparente
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borda sutil
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 2;
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    // Texto vermelho, pequeno e em negrito
    context.fillStyle = '#FF0000'; // Vermelho
    context.font = 'bold 20px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Ajustar tamanho da fonte se o texto for muito longo
    if (text.length > 6) {
        context.font = 'bold 16px Arial';
    }
    if (text.length > 8) {
        context.font = 'bold 14px Arial';
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

// Função para mapear ângulo dos objetos (importada do objects.js)
function mapAngleToReach(normalizedPosition) {
    const minAngle = THREE.MathUtils.degToRad(-20);
    const maxAngle = THREE.MathUtils.degToRad(250);
    return minAngle + (maxAngle - minAngle) * normalizedPosition;
}

// Iniciar missão
function startMission(missionId) {
    if (gameState.missionActive) {
        endMission(false);
    }
    
    currentMission = { ...missions[missionId] };
    gameState.missionActive = true;
    gameState.timeLeft = currentMission.timeLimit;
    
    // Reset mission-specific counters
    if (currentMission.id === 'cleanup') {
        currentMission.currentCount = 0;
    } else if (currentMission.id === 'wordSort') {
        currentMission.currentCount = 0;
    } else if (currentMission.id === 'mathChallenge') {
        const level = currentMission.levels[gameState.level - 1] || currentMission.levels[0];
        currentMission.targetSum = level.target;
        currentMission.currentSum = 0;
        currentMission.collectedNumbers = [];
    }
    
    // Criar cestos baseado na missão
    if (currentMission.id === 'wordSort') {
        createMultipleBaskets();
    } else {
        // Limpar cestos existentes
        baskets.forEach(basket => scene.remove(basket));
        baskets = [];
        
        // Criar cesto único
        const basket = createBasket(currentMission.basketColor || 0x8B4513);
        baskets.push(basket);
        
        // Adicionar rótulo pequeno para cesto único
        if (currentMission.id === 'mathChallenge') {
            const level = currentMission.levels[gameState.level - 1] || currentMission.levels[0];
            createSmallBasketLabel(basket, `SOME ATÉ ${level.target}`);
        } else {
            createSmallBasketLabel(basket, 'LIXO');
        }
    }
    
    // Criar objetos da missão
    createObjects();
    
    // Iniciar timer
    startMissionTimer();
    
    // Criar UI da missão
    createMissionUI();
    
    console.log(`Missão iniciada: ${currentMission.name}`);
}

// Formatar tempo em minutos e segundos
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Timer da missão
function startMissionTimer() {
    if (missionTimer) {
        clearInterval(missionTimer);
    }
    
    missionTimer = setInterval(() => {
        gameState.timeLeft--;
        updateMissionUI();
        
        if (gameState.timeLeft <= 0) {
            endMission(false);
        }
    }, 1000);
}

// Finalizar missão
function endMission(success) {
    gameState.missionActive = false;
    
    if (missionTimer) {
        clearInterval(missionTimer);
        missionTimer = null;
    }
    
    if (success) {
        const timeBonus = gameState.timeLeft / currentMission.timeLimit;
        let stars = 1;
        if (timeBonus > 0.5) stars = 2;
        if (timeBonus > 0.8) stars = 3;
        
        gameState.stars += stars;
        gameState.score += stars * 100 + gameState.timeLeft * 10;
        gameState.streak++;
        
        if (!gameState.completedMissions.includes(currentMission.id)) {
            gameState.completedMissions.push(currentMission.id);
        }
        
        if (currentMission.id === 'mathChallenge' && gameState.level < currentMission.levels.length) {
            gameState.level++;
        }
        
        showMissionResult(true, stars);
    } else {
        gameState.streak = 0;
        showMissionResult(false, 0);
    }
    
    currentMission = null;
    updateMissionUI();
}

// Processar objeto da missão (atualizar com sons)
function processMissionObject(obj, basket) {
    const userData = obj.userData;
    
    switch(currentMission.id) {
        case 'cleanup':
            if (userData.type === 'trash') {
                currentMission.currentCount++;
                animateObjectToBasket(obj, basket);
                
                // Som de acerto
                audioManager.playSuccess();
                
                if (currentMission.currentCount >= currentMission.targetCount) {
                    setTimeout(() => {
                        audioManager.playComplete();
                        endMission(true);
                    }, 1000);
                }
                return true;
            }
            break;
            
        case 'wordSort':
            if (userData.type === 'word') {
                const correctBasket = basket.userData.type === userData.classification;
                
                if (correctBasket) {
                    currentMission.currentCount++;
                    animateObjectToBasket(obj, basket);
                    showFeedback(`Correto! ${userData.word} é ${userData.classification}`, 'success');
                    
                    // Som de acerto
                    audioManager.playSuccess();
                    
                    if (currentMission.currentCount >= currentMission.targetCount) {
                        setTimeout(() => {
                            audioManager.playComplete();
                            endMission(true);
                        }, 1000);
                    }
                    return true;
                } else {
                    showFeedback(`Ops! ${userData.word} não vai neste cesto`, 'error');
                    
                    // Som de erro
                    audioManager.playError();
                    return false;
                }
            }
            break;
            
        case 'mathChallenge':
            if (userData.type === 'number') {
                const newSum = currentMission.currentSum + userData.value;
                
                if (newSum <= currentMission.targetSum) {
                    currentMission.currentSum = newSum;
                    currentMission.collectedNumbers.push(userData.value);
                    animateObjectToBasket(obj, basket);
                    
                    // Som de acerto
                    audioManager.playSuccess();
                    
                    if (currentMission.currentSum === currentMission.targetSum) {
                        setTimeout(() => {
                            audioManager.playComplete();
                            endMission(true);
                        }, 1000);
                    } else {
                        showFeedback(`Soma atual: ${currentMission.currentSum}/${currentMission.targetSum}`, 'info');
                    }
                    return true;
                } else {
                    showFeedback(`${userData.value} é muito! Soma seria ${newSum}`, 'error');
                    
                    // Som de erro
                    audioManager.playError();
                    return false;
                }
            }
            break;
    }
    
    return false;
}

// Iniciar missão (atualizar com música de fundo)
function startMission(missionId) {
    if (gameState.missionActive) {
        endMission(false);
    }
    
    currentMission = { ...missions[missionId] };
    gameState.missionActive = true;
    gameState.timeLeft = currentMission.timeLimit;
    
    // Iniciar música de fundo
    audioManager.startBackgroundMusic();
    
    // [resto da função permanece igual...]
    
    // Reset mission-specific counters
    if (currentMission.id === 'cleanup') {
        currentMission.currentCount = 0;
    } else if (currentMission.id === 'wordSort') {
        currentMission.currentCount = 0;
    } else if (currentMission.id === 'mathChallenge') {
        const level = currentMission.levels[gameState.level - 1] || currentMission.levels[0];
        currentMission.targetSum = level.target;
        currentMission.currentSum = 0;
        currentMission.collectedNumbers = [];
    }
    
    // Criar cestos baseado na missão
    if (currentMission.id === 'wordSort') {
        createMultipleBaskets();
    } else {
        // Limpar cestos existentes
        baskets.forEach(basket => scene.remove(basket));
        baskets = [];
        
        // Criar cesto único
        const basket = createBasket(currentMission.basketColor || 0x8B4513);
        baskets.push(basket);
        
        // Adicionar rótulo pequeno para cesto único
        if (currentMission.id === 'mathChallenge') {
            const level = currentMission.levels[gameState.level - 1] || currentMission.levels[0];
            createSmallBasketLabel(basket, `SOME ATÉ ${level.target}`);
        } else {
            createSmallBasketLabel(basket, 'LIXO');
        }
    }
    
    // Criar objetos da missão
    createObjects();
    
    // Iniciar timer
    startMissionTimer();
    
    // Criar UI da missão
    createMissionUI();
    
    console.log(`Missão iniciada: ${currentMission.name}`);
}

// Finalizar missão (parar música quando necessário)
function endMission(success) {
    gameState.missionActive = false;
    
    if (missionTimer) {
        clearInterval(missionTimer);
        missionTimer = null;
    }
    
    // Parar música de fundo
    audioManager.stopBackgroundMusic();
    
    if (success) {
        const timeBonus = gameState.timeLeft / currentMission.timeLimit;
        let stars = 1;
        if (timeBonus > 0.5) stars = 2;
        if (timeBonus > 0.8) stars = 3;
        
        gameState.stars += stars;
        gameState.score += stars * 100 + gameState.timeLeft * 10;
        gameState.streak++;
        
        if (!gameState.completedMissions.includes(currentMission.id)) {
            gameState.completedMissions.push(currentMission.id);
        }
        
        if (currentMission.id === 'mathChallenge' && gameState.level < currentMission.levels.length) {
            gameState.level++;
        }
        
        showMissionResult(true, stars);
    } else {
        gameState.streak = 0;
        showMissionResult(false, 0);
    }
    
    currentMission = null;
    updateMissionUI();
}

// Animar objeto indo para o cesto
function animateObjectToBasket(obj, basket) {
    const startPos = obj.position.clone();
    const endPos = basket.position.clone();
    endPos.y += 0.5;
    
    let progress = 0;
    const animateStep = () => {
        progress += 0.05;
        
        if (progress <= 1) {
            obj.position.lerpVectors(startPos, endPos, progress);
            obj.rotation.y += 0.2;
            obj.rotation.x += 0.1;
            
            requestAnimationFrame(animateStep);
        } else {
            scene.remove(obj);
            const index = objects.indexOf(obj);
            if (index > -1) {
                objects.splice(index, 1);
            }
            if (objectCountElement) {
                objectCountElement.textContent = objects.length;
            }
            updateMissionUI();
        }
    };
    
    animateStep();
}

// Criar UI da missão
function createMissionUI() {
    if (missionUI) {
        document.body.removeChild(missionUI);
    }
    
    missionUI = document.createElement('div');
    missionUI.className = 'mission-ui';
    missionUI.innerHTML = `
        <div class="mission-header">
            <h3>${currentMission.icon} ${currentMission.name}</h3>
            <p>${currentMission.description}</p>
        </div>
        <div class="mission-stats">
            <div class="stat">
                <span class="stat-label">Tempo:</span>
                <span class="stat-value" id="missionTime">${formatTime(gameState.timeLeft)}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Progresso:</span>
                <span class="stat-value" id="missionProgress">0/${currentMission.targetCount || currentMission.targetSum}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Pontos:</span>
                <span class="stat-value" id="missionScore">${gameState.score}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Estrelas:</span>
                <span class="stat-value" id="missionStars">${gameState.stars} ⭐</span>
            </div>
        </div>
        <div class="mission-controls">
            <button onclick="endMission(false)" class="btn-abort">Abandonar Missão</button>
        </div>
    `;
    
    document.body.appendChild(missionUI);
}

// Atualizar UI da missão
function updateMissionUI() {
    if (!missionUI || !currentMission) return;
    
    const timeElement = document.getElementById('missionTime');
    const progressElement = document.getElementById('missionProgress');
    const scoreElement = document.getElementById('missionScore');
    const starsElement = document.getElementById('missionStars');
    
    if (timeElement) timeElement.textContent = formatTime(gameState.timeLeft);
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (starsElement) starsElement.textContent = `${gameState.stars} ⭐`;
    
    if (progressElement) {
        let current = 0;
        let target = 0;
        
        switch(currentMission.id) {
            case 'cleanup':
                current = currentMission.currentCount;
                target = currentMission.targetCount;
                break;
            case 'wordSort':
                current = currentMission.currentCount;
                target = currentMission.targetCount;
                break;
            case 'mathChallenge':
                current = currentMission.currentSum;
                target = currentMission.targetSum;
                break;
        }
        
        progressElement.textContent = `${current}/${target}`;
    }
}

// Mostrar resultado da missão
function showMissionResult(success, stars) {
    const modal = document.createElement('div');
    modal.className = 'mission-result-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${success ? '🎉 Missão Completa!' : '❌ Missão Falhada'}</h2>
            ${success ? `
                <p>Parabéns! Você conquistou ${stars} estrela${stars > 1 ? 's' : ''}!</p>
                <p>Pontos ganhos: ${stars * 100 + gameState.timeLeft * 10}</p>
                <p>Tempo restante: ${formatTime(gameState.timeLeft)}</p>
            ` : `
                <p>Não desista! Tente novamente.</p>
            `}
            <button onclick="closeModal()" class="btn-close">Fechar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        if (modal.parentNode) {
            document.body.removeChild(modal);
        }
    }, 5000);
}

// Mostrar feedback
function showFeedback(message, type = 'info') {
    const feedback = document.createElement('div');
    feedback.className = `feedback feedback-${type}`;
    feedback.textContent = message;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            document.body.removeChild(feedback);
        }
    }, 3000);
}

// Fechar modal
function closeModal() {
    const modal = document.querySelector('.mission-result-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Exportar funções para uso global
window.startMission = startMission;
window.endMission = endMission;
window.gameState = gameState;
window.missions = missions;
window.closeModal = closeModal;