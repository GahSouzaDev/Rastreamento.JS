// Sistema de Áudio
class AudioManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.musicVolume = 0.3; // Volume baixo para música de fundo
        this.sfxVolume = 0.7; // Volume normal para efeitos sonoros
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        this.loadSounds();
    }
    
    loadSounds() {
        // Carregar música de fundo
        this.backgroundMusic = new Audio('sounds/fundo.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.musicVolume;
        
        // Carregar efeitos sonoros
        this.sounds.acerto = new Audio('sounds/acerto.mp3');
        this.sounds.acerto.volume = this.sfxVolume;
        
        this.sounds.erro = new Audio('sounds/erro.mp3');
        this.sounds.erro.volume = this.sfxVolume;
        
        this.sounds.final = new Audio('sounds/final.mp3');
        this.sounds.final.volume = this.sfxVolume;
        
        // Adicionar event listeners para debug
        Object.keys(this.sounds).forEach(key => {
            this.sounds[key].addEventListener('canplaythrough', () => {
                console.log(`Som ${key} carregado com sucesso`);
            });
            
            this.sounds[key].addEventListener('error', (e) => {
                console.warn(`Erro ao carregar som ${key}:`, e);
            });
        });
        
        this.backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('Música de fundo carregada com sucesso');
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.warn('Erro ao carregar música de fundo:', e);
        });
    }
    
    // Iniciar música de fundo
    startBackgroundMusic() {
        if (this.musicEnabled && this.backgroundMusic) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(e => {
                console.warn('Não foi possível reproduzir música de fundo:', e);
                // Tentar novamente após interação do usuário
                document.addEventListener('click', () => {
                    this.backgroundMusic.play().catch(console.warn);
                }, { once: true });
            });
        }
    }
    
    // Parar música de fundo
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    // Tocar som de acerto
    playSuccess() {
        this.playSound('acerto');
    }
    
    // Tocar som de erro
    playError() {
        this.playSound('erro');
    }
    
    // Tocar som de finalização
    playComplete() {
        this.playSound('final');
    }
    
    // Tocar som específico
    playSound(soundName) {
        if (this.sfxEnabled && this.sounds[soundName]) {
            // Resetar o som para o início
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => {
                console.warn(`Erro ao reproduzir som ${soundName}:`, e);
            });
        }
    }
    
    // Ajustar volume da música
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }
    
    // Ajustar volume dos efeitos sonoros
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.sfxVolume;
        });
    }
    
    // Ativar/desativar música
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        return this.musicEnabled;
    }
    
    // Ativar/desativar efeitos sonoros
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
    
    // Pausar todos os sons
    pauseAll() {
        this.stopBackgroundMusic();
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
        });
    }
    
    // Retomar música de fundo
    resumeMusic() {
        if (this.musicEnabled) {
            this.startBackgroundMusic();
        }
    }
}

// Instância global do gerenciador de áudio
const audioManager = new AudioManager();

// Exportar para uso global
window.audioManager = audioManager;