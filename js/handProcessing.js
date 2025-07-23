function processHandResults(results) {
    // Limpar canvas de saída
    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    outputCtx.save();
    outputCtx.scale(-1, 1);
    outputCtx.translate(-outputCanvas.width, 0);
    
    // Desenhar vídeo
    outputCtx.drawImage(
        results.image, 0, 0, outputCanvas.width, outputCanvas.height);
    
    // Desenhar landmarks se mão detectada
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            self.drawConnectors(
                outputCtx, landmarks, self.HAND_CONNECTIONS,
                {color: '#00FF00', lineWidth: 2});
            self.drawLandmarks(outputCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 4
            });
        }
        
        // Processar a primeira mão detectada
        processHandData(results.multiHandLandmarks[0]);
    } else {
        // Nenhuma mão detectada
        gripperStatusText.textContent = "Aguardando mão";
    }
    
    outputCtx.restore();
}

function processHandData(landmarks) {
    // Calcular centro da mão
    let xSum = 0, ySum = 0, count = 0;
    for (const landmark of landmarks) {
        xSum += landmark.x;
        ySum += landmark.y;
        count++;
    }
    
    const xCenter = xSum / count;
    const yCenter = ySum / count;
    
    // Calcular área da mão
    let xMin = 1, xMax = 0, yMin = 1, yMax = 0;
    for (const landmark of landmarks) {
        xMin = Math.min(xMin, landmark.x);
        xMax = Math.max(xMax, landmark.x);
        yMin = Math.min(yMin, landmark.y);
        yMax = Math.max(yMax, landmark.y);
    }
    
    const handArea = (xMax - xMin) * (yMax - yMin);
    
    // Calcular valores dos servos
    
    // Controle horizontal (rotação da base)
    let servoBase;
    if (invertHorizontal) {
        servoBase = mapValue(xCenter, 0.2, 0.8, 30, 330);
    } else {
        servoBase = mapValue(xCenter, 0.2, 0.8, 330, 30);
    }
    
    // Controle de profundidade (cotovelo)
    const servoElbow = mapValue(yCenter, 0.2, 0.8, 100, -10);
    
    // Controle vertical (ombro)
    const servoShoulder = mapValue(handArea, 0.05, 0.15, 270, 180);
    
    // Detectar gesto de pinça (polegar e indicador)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 4) + 
        Math.pow(thumbTip.y - indexTip.y, 4)
    );
    
    const servoGripper = distance < 0.05 ? 110 : 180;
    
    // Atualizar valores na UI
    baseValue.textContent = `${Math.round(servoBase)}°`;
    shoulderValue.textContent = `${Math.round(servoShoulder)}°`;
    elbowValue.textContent = `${Math.round(servoElbow)}°`;
    
    if (servoGripper === 110) {
        gripperValue.textContent = "Fechada";
        gripperStatusText.textContent = "Fechada";
        gripperIndicator.className = "gripper-indicator gripper-closed";
    } else {
        gripperValue.textContent = "Aberta";
        gripperStatusText.textContent = "Aberta";
        gripperIndicator.className = "gripper-indicator gripper-open";
    }
    
    // Atualizar ângulos do braço
    armAngles = {
        base: servoBase,
        shoulder: servoShoulder,
        elbow: servoElbow,
        gripper: servoGripper
    };
    
    // Atualizar o braço robótico 3D
    updateRobotArm();
}