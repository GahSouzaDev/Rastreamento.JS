function createRobotArm() {
    // Grupo principal do robô
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);
    
    // Base (rotação)
    const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.8, 32);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF5E00, // Amarelo
        shininess: 100
    });
    robotBase = new THREE.Mesh(baseGeometry, baseMaterial);
    robotBase.position.y = 0;
    robotBase.castShadow = true;
    robotGroup.add(robotBase);
    
    // Detalhes pretos na base
    const baseDetailGeometry = new THREE.CylinderGeometry(1.7, 1.7, 0.1, 32);
    const baseDetailMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        shininess: 100
    });
    const baseDetailTop = new THREE.Mesh(baseDetailGeometry, baseDetailMaterial);
    baseDetailTop.position.y = 0.4;
    robotBase.add(baseDetailTop);
    
    const baseDetailBottom = new THREE.Mesh(baseDetailGeometry, baseDetailMaterial);
    baseDetailBottom.position.y = -0.4;
    robotBase.add(baseDetailBottom);
    
    // Coluna
    const columnGeometry = new THREE.CylinderGeometry(0.8, 0.8, 6, 16);
    const columnMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000, // Preto
        shininess: 80
    });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.y = 1.4;
    column.castShadow = true;
    robotBase.add(column);
    
    // Ombro
    const shoulderGeometry = new THREE.BoxGeometry(1.2, 0.6, 1.2);
    const shoulderMaterial = new THREE.MeshPhongMaterial({ 
        color: 0XFF5E00, // Amarelo
        shininess: 90
    });
    robotShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    robotShoulder.position.y = 2.5;
    robotShoulder.rotation.y = Math.PI / 2;
    robotShoulder.castShadow = true;
    column.add(robotShoulder);
    
    // Detalhe preto no ombro
    const shoulderDetail = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.1, 1.25),
        new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    shoulderDetail.position.y = 0;
    robotShoulder.add(shoulderDetail);
    
    // Braço superior
    const upperArmGeometry = new THREE.BoxGeometry(0.8, 4, 0.8);
    const upperArmMaterial = new THREE.MeshPhongMaterial({ 
        color: 0XFF5E00, // Amarelo
        shininess: 80
    });
    const upperArm = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
    upperArm.position.y = -1.5;
    upperArm.castShadow = true;
    robotShoulder.add(upperArm);
    
    // Faixas pretas no braço superior
    for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.1, 0.85),
            new THREE.MeshPhongMaterial({ color: 0x000000 })
        );
        stripe.position.y = -1.0 + i * 1.0;
        upperArm.add(stripe);
    }
    
    // Cotovelo
    const elbowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const elbowMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000, // Preto
        shininess: 90
    });
    robotElbow = new THREE.Mesh(elbowGeometry, elbowMaterial);
    robotElbow.position.y = -2;
    robotElbow.castShadow = true;
    upperArm.add(robotElbow);
    
    // Braço inferior
    const lowerArmGeometry = new THREE.BoxGeometry(0.7, 3.5, 0.7);
    const lowerArmMaterial = new THREE.MeshPhongMaterial({ 
        color: 0XFF5E00, // Amarelo
        shininess: 80
    });
    const lowerArm = new THREE.Mesh(lowerArmGeometry, lowerArmMaterial);
    lowerArm.position.y = -1.7;
    lowerArm.castShadow = true;
    robotElbow.add(lowerArm);
    
    // Faixas pretas no braço inferior
    for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.1, 0.75),
            new THREE.MeshPhongMaterial({ color: 0x000000 })
        );
        stripe.position.y = -1.0 + i * 1.0;
        lowerArm.add(stripe);
    }
    
    // Pulso
    const wristGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const wristMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000, // Preto
        shininess: 90
    });
    robotWrist = new THREE.Mesh(wristGeometry, wristMaterial);
    robotWrist.position.y = -2;
    robotWrist.castShadow = true;
    lowerArm.add(robotWrist);
    
    // Garra
    const gripperGroup = new THREE.Group();
    gripperGroup.position.y = -0.7;
    robotWrist.add(gripperGroup);
    robotGripper = gripperGroup;
    
    // Base da garra
    const gripperBaseGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
    const gripperBaseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0XFF5E00, // Amarelo
        shininess: 100
    });
    const gripperBase = new THREE.Mesh(gripperBaseGeometry, gripperBaseMaterial);
    gripperBase.castShadow = true;    
    gripperGroup.add(gripperBase);
    
    // Detalhes pretos na base da garra
    const gripperBaseDetail = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.1, 0.85),
        new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    gripperBaseDetail.position.y = 0.18;
    gripperBase.add(gripperBaseDetail);
    
    // Dedos da garra
    const gripperFingerGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.4);
    const gripperFingerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0XFF5E00, // Amarelo
        shininess: 60
    });
    
    gripperLeft = new THREE.Mesh(gripperFingerGeometry, gripperFingerMaterial);
    gripperLeft.position.x = 0.3;
    gripperLeft.position.y = -0.35;
    gripperLeft.castShadow = true;
    gripperGroup.add(gripperLeft);
    
    gripperRight = new THREE.Mesh(gripperFingerGeometry, gripperFingerMaterial);
    gripperRight.position.x = -0.3;
    gripperRight.position.y = -0.35;
    gripperRight.castShadow = true;
    gripperGroup.add(gripperRight);
    
    // Pontas dos dedos (pretas)
    const gripperTipGeometry = new THREE.BoxGeometry(0.22, 0.1, 0.42);
    const gripperTipMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const tipLeft = new THREE.Mesh(gripperTipGeometry, gripperTipMaterial);
    tipLeft.position.y = -0.35;
    gripperLeft.add(tipLeft);
    
    const tipRight = new THREE.Mesh(gripperTipGeometry, gripperTipMaterial);
    tipRight.position.y = -0.35;
    gripperRight.add(tipRight);
}

function updateRobotArm() {
    // Converter ângulos para radianos
    const baseRad = THREE.MathUtils.degToRad(armAngles.base);
    const shoulderRad = THREE.MathUtils.degToRad(armAngles.shoulder - 90);
    const elbowRad = THREE.MathUtils.degToRad(armAngles.elbow - 90);
    
    // Atualizar rotação da base
    robotBase.rotation.y = baseRad;
    
    // Atualizar rotação do ombro
    robotShoulder.rotation.z = shoulderRad;
    
    // Atualizar rotação do cotovelo
    robotElbow.rotation.z = elbowRad;
    
    // Atualizar abertura da garra
    const gripperOpenness = THREE.MathUtils.mapLinear(armAngles.gripper, 110, 180, 0, 0.6);
    gripperLeft.position.x = 0.3 + gripperOpenness;
    gripperRight.position.x = -0.3 - gripperOpenness;
    
    // Verificar colisões com objetos quando a garra estiver fechada
    if (armAngles.gripper < 150) {
        checkObjectGrab();
    } else if (heldObject) {
        releaseObject();
    }
}