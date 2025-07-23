// Inicializar MediaPipe Hands
const hands = new self.Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
});

hands.onResults(processHandResults);

// Iniciar câmera
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
        });
        videoElement.srcObject = stream;
        
        // Iniciar detecção
        const camera = new self.Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        camera.start();
    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
    }
}