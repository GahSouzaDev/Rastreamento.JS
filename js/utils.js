// Função para mapear valores com clamping
function mapValue(value, inMin, inMax, outMin, outMax) {
    const clampedValue = Math.max(inMin, Math.min(value, inMax));
    return outMin + (outMax - outMin) * (clampedValue - inMin) / (inMax - inMin);
}