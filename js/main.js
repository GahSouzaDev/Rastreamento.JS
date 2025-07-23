// Elementos da página
const videoElement = document.getElementById('camera');
const outputCanvas = document.getElementById('outputCanvas');
const outputCtx = outputCanvas.getContext('2d');
const invertBtn = document.getElementById('invertBtn');
const resetBtn = document.getElementById('resetBtn');
const baseValue = document.getElementById('baseValue');
const shoulderValue = document.getElementById('shoulderValue');
const elbowValue = document.getElementById('elbowValue');
const gripperValue = document.getElementById('gripperValue');
const gripperIndicator = document.getElementById('gripperIndicator');
const gripperStatusText = document.getElementById('gripperStatusText');
const cameraFrontBtn = document.getElementById('cameraFront');
const cameraTopBtn = document.getElementById('cameraTop');
const cameraSideBtn = document.getElementById('cameraSide');
const cameraResetBtn = document.getElementById('cameraReset');
const cameraDistanceSlider = document.getElementById('cameraDistance');
const objectCountElement = document.getElementById('objectCount');

// Configurações
let invertHorizontal = false;
let cameraDistance = 15;
let controls;
let scene, camera, renderer;
let robotBase, robotShoulder, robotElbow, robotWrist, robotGripper;
let gripperLeft, gripperRight;
let heldObject = null;
let objects = [];

// Ângulos iniciais do braço
let armAngles = {
    base: 90,
    shoulder: 180,
    elbow: 90,
    gripper: 180
};

// Inicializar
initCamera();
initThreeScene();