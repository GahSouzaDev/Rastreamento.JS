// Função de animação principal
function animate() {
    requestAnimationFrame(animate);
    
    // Atualizar controles de câmera com verificação
    if (controls && controls.update) {
        controls.update();
    }
    
    // Animar objetos (apenas os que não estão sendo segurados) com verificações
    if (objects && objects.length > 0) {
        objects.forEach((obj, index) => {
            if (obj && obj !== heldObject && obj.parent === scene) {
                // Rotação suave
                obj.rotation.y += 0.01;
                obj.rotation.x += 0.005;
                
                // Movimento flutuante apenas para objetos livres
                const baseY = 0.5;
                const floatAmplitude = 0.2;
                const floatSpeed = 0.001;
                obj.position.y = baseY + Math.sin(Date.now() * floatSpeed + index) * floatAmplitude;
            }
        });
    }
    
    // Renderizar cena com verificação
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Alternar inversão horizontal
function toggleHorizontalInversion() {
    if (typeof invertHorizontal === 'undefined') {
        console.error('invertHorizontal não está definido');
        return;
    }
    
    invertHorizontal = !invertHorizontal;
    
    const invertStatusText = document.getElementById('invertStatusText');
    const invertIndicator = document.getElementById('invertIndicator');
    
    if (invertHorizontal) {
        if (invertBtn) {
            invertBtn.classList.add('active');
            invertBtn.textContent = 'Inverter Horizontal (Ativo)';
        }
        if (invertStatusText) invertStatusText.textContent = 'Inversão Ativada';
        if (invertIndicator) invertIndicator.classList.add('invert-active');
    } else {
        if (invertBtn) {
            invertBtn.classList.remove('active');
            invertBtn.textContent = 'Inverter Horizontal';
        }
        if (invertStatusText) invertStatusText.textContent = 'Inversão Desativada';
        if (invertIndicator) invertIndicator.classList.remove('invert-active');
    }
    
    console.log('Inversão horizontal:', invertHorizontal ? 'Ativada' : 'Desativada');
}

// Resetar posição do braço
function resetArmPosition() {
    if (typeof armAngles === 'undefined') {
        console.error('armAngles não está definido');
        return;
    }
    
    armAngles = {
        base: 90,
        shoulder: 190,
        elbow: 90,
        gripper: 180
    };
    
    // Atualizar interface com verificações
    if (baseValue) baseValue.textContent = "0°";
    if (shoulderValue) shoulderValue.textContent = "90°";
    if (elbowValue) elbowValue.textContent = "90°";
    if (gripperValue) gripperValue.textContent = "Aberta";
    if (gripperStatusText) gripperStatusText.textContent = "Aberta";
    if (gripperIndicator) gripperIndicator.className = "gripper-indicator gripper-open";
    
    // Soltar objeto se estiver segurando
    if (heldObject && typeof releaseObject === 'function') {
        releaseObject();
    }
    
    // Atualizar braço robótico
    if (typeof updateRobotArm === 'function') {
        updateRobotArm();
    }
    
    console.log('Braço resetado para posição inicial');
}

// Configurar câmera para vista frontal
function setFrontCamera() {
    if (!camera || !controls) {
        console.error('Camera ou controls não disponíveis');
        return;
    }
    
    const distance = cameraDistance || 15;
    camera.position.set(0, 5, distance);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
    console.log('Vista frontal ativada');
}

// Configurar câmera para vista superior
function setTopCamera() {
    if (!camera || !controls) {
        console.error('Camera ou controls não disponíveis');
        return;
    }
    
    const distance = cameraDistance || 15;
    camera.position.set(0, distance, 0);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
    console.log('Vista superior ativada');
}

// Configurar câmera para vista lateral
function setSideCamera() {
    if (!camera || !controls) {
        console.error('Camera ou controls não disponíveis');
        return;
    }
    
    const distance = cameraDistance || 15;
    camera.position.set(distance, 5, 0);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
    console.log('Vista lateral ativada');
}

// Resetar câmera para posição inicial
function resetCamera() {
    if (!camera || !controls) {
        console.error('Camera ou controls não disponíveis');
        return;
    }
    
    const distance = cameraDistance || 15;
    camera.position.set(0, 14, distance); // Usar altura inicial do projeto
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    
    // Tentar usar reset se disponível, senão fazer reset manual
    if (controls.reset && typeof controls.reset === 'function') {
        controls.reset();
    } else {
        controls.update();
    }
    
    console.log('Câmera resetada para posição inicial');
}

// Atualizar distância da câmera
function updateCameraDistance() {
    if (!cameraDistanceSlider) {
        console.error('cameraDistanceSlider não encontrado');
        return;
    }
    
    cameraDistance = parseInt(cameraDistanceSlider.value);
    
    // Manter direção atual da câmera, mas ajustar distância
    if (camera && controls) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.multiplyScalar(-cameraDistance);
        camera.position.copy(controls.target).add(direction);
        controls.update();
    }
    
    console.log('Distância da câmera atualizada:', cameraDistance);
}

// Função para inicializar event listeners de forma segura
function initializeEventListeners() {
    // Event listeners para botões principais
    if (invertBtn) {
        invertBtn.addEventListener('click', toggleHorizontalInversion);
        console.log('Event listener do invertBtn adicionado');
    } else {
        console.warn('invertBtn não encontrado');
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetArmPosition);
        console.log('Event listener do resetBtn adicionado');
    } else {
        console.warn('resetBtn não encontrado');
    }
    
    // Event listeners para botões de câmera
    if (cameraFrontBtn) {
        cameraFrontBtn.addEventListener('click', setFrontCamera);
        console.log('Event listener do cameraFrontBtn adicionado');
    } else {
        console.warn('cameraFrontBtn não encontrado');
    }
    
    if (cameraTopBtn) {
        cameraTopBtn.addEventListener('click', setTopCamera);
        console.log('Event listener do cameraTopBtn adicionado');
    } else {
        console.warn('cameraTopBtn não encontrado');
    }
    
    if (cameraSideBtn) {
        cameraSideBtn.addEventListener('click', setSideCamera);
        console.log('Event listener do cameraSideBtn adicionado');
    } else {
        console.warn('cameraSideBtn não encontrado');
    }
    
    if (cameraResetBtn) {
        cameraResetBtn.addEventListener('click', resetCamera);
        console.log('Event listener do cameraResetBtn adicionado');
    } else {
        console.warn('cameraResetBtn não encontrado');
    }
    
    if (cameraDistanceSlider) {
        cameraDistanceSlider.addEventListener('input', updateCameraDistance);
        console.log('Event listener do cameraDistanceSlider adicionado');
    } else {
        console.warn('cameraDistanceSlider não encontrado');
    }
}

// Aguardar DOM estar pronto antes de adicionar event listeners
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    // DOM já está pronto
    setTimeout(initializeEventListeners, 100);
}

// Teclas para resetar o braço e gerar novos objetos
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        resetArmPosition();
    }
    if (e.key === 'g' || e.key === 'G') {
        if (typeof createObjects === 'function') {
            createObjects();
        } else {
            console.warn('createObjects function não encontrada');
        }
    }
    if (e.key === 'b' || e.key === 'B') {
        if (typeof createBucket === 'function') {
            createBucket();
        } else {
            console.warn('createBucket function não encontrada');
        }
    }
    // Atalhos de teclado para câmera
    if (e.key === '1') setFrontCamera();
    if (e.key === '2') setTopCamera();
    if (e.key === '3') setSideCamera();
    if (e.key === '4') resetCamera();
});

// Redimensionar o canvas quando a janela mudar de tamanho
window.addEventListener('resize', () => {
    if (renderer && camera) {
        const container = document.querySelector('.three-container');
        if (container) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            console.log('Canvas redimensionado');
        }
    }
});

// Função de debug para verificar status
function checkSystemStatus() {
    console.log('=== STATUS DO SISTEMA ===');
    console.log('Camera:', camera ? '✅' : '❌');
    console.log('Controls:', controls ? '✅' : '❌');
    console.log('Renderer:', renderer ? '✅' : '❌');
    console.log('Scene:', scene ? '✅' : '❌');
    console.log('Objects array:', objects ? `✅ (${objects.length} objetos)` : '❌');
    console.log('Held object:', heldObject ? '✅' : '❌');
    console.log('InvertBtn:', invertBtn ? '✅' : '❌');
    console.log('CameraFrontBtn:', cameraFrontBtn ? '✅' : '❌');
    console.log('Camera Distance:', cameraDistance);
    console.log('========================');
}

// Verificar status após inicialização
setTimeout(checkSystemStatus, 2000);