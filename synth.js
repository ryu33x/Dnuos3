const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let isRecording = false;
let songInterval = null;
let recorder = null;
let audioNodes = { oscillator: null, lfo: null, gainNode: null, lfoGain: null };

// Elementos del DOM
const elements = {
    oscFreqSlider: document.getElementById('oscFreq'),
    oscFreqValue: document.getElementById('oscFreqValue'),
    lfoFreqSlider: document.getElementById('lfoFreq'),
    lfoFreqValue: document.getElementById('lfoFreqValue'),
    lfoGainSlider: document.getElementById('lfoGain'),
    lfoGainValue: document.getElementById('lfoGainValue'),
    waveTypeSelect: document.getElementById('waveType'),
    sequenceInput: document.getElementById('sequence'),
    minDurationInput: document.getElementById('minDuration'),
    status: document.getElementById('status'),
    progress: document.getElementById('progress'),
    playBtn: document.getElementById('play'),
    stopBtn: document.getElementById('stop'),
    playSongBtn: document.getElementById('playSong'),
    generatePatternBtn: document.getElementById('generatePattern'),
    recordDownloadBtn: document.getElementById('recordDownload'),
    canvas: document.getElementById('particles')
};

// Partículas
const ctx = elements.canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    elements.canvas.width = window.innerWidth;
    elements.canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * elements.canvas.width;
        this.y = Math.random() * elements.canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(255, 0, 0, ${Math.random() * 0.5 + 0.5})`; /* Rojo con opacidad variable */
    }

    update(frequency) {
        const speedFactor = frequency ? frequency / 1000 : 0.1;
        this.x += this.speedX * speedFactor;
        this.y += this.speedY * speedFactor;
        if (this.x < 0 || this.x > elements.canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > elements.canvas.height) this.speedY *= -1;
        this.size = Math.max(1, this.size * (1 - 0.01) + speedFactor * 2);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = Array.from({ length: 50 }, () => new Particle());
}

function animateParticles(frequency = 0) {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    particles.forEach(particle => {
        particle.update(frequency);
        particle.draw();
    });
    requestAnimationFrame(() => animateParticles(audioNodes.oscillator?.frequency.value || 0));
}

initParticles();
animateParticles();

// Actualizar valores en pantalla
function updateValues() {
    elements.oscFreqValue.textContent = elements.oscFreqSlider.value;
    elements.lfoFreqValue.textContent = elements.lfoFreqSlider.value;
    elements.lfoGainValue.textContent = elements.lfoGainSlider.value;
}

// Actualizar estado en pantalla
function updateStatus(text, className = '') {
    elements.status.textContent = `Estado: ${text}`;
    elements.status.className = `status ${className}`;
    elements.playBtn.disabled = isPlaying || isRecording;
    elements.playSongBtn.disabled = isPlaying || isRecording;
    elements.recordDownloadBtn.disabled = isPlaying || isRecording;
}

// Actualizar progreso de grabación
function updateProgress(current, total) {
    elements.progress.textContent = `Progreso: ${current.toFixed(1)} / ${total.toFixed(1)} segundos`;
}

// Crear nodos de audio
function createAudioNodes(frequency, connectToDestination = true) {
    if (audioNodes.oscillator) return audioNodes.gainNode;

    audioNodes.oscillator = audioCtx.createOscillator();
    audioNodes.oscillator.type = elements.waveTypeSelect.value;
    audioNodes.oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    audioNodes.gainNode = audioCtx.createGain();
    audioNodes.gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

    audioNodes.lfo = audioCtx.createOscillator();
    audioNodes.lfo.type = 'sine';
    audioNodes.lfo.frequency.setValueAtTime(elements.lfoFreqSlider.value, audioCtx.currentTime);

    audioNodes.lfoGain = audioCtx.createGain();
    audioNodes.lfoGain.gain.setValueAtTime(elements.lfoGainSlider.value, audioCtx.currentTime);

    audioNodes.lfo.connect(audioNodes.lfoGain);
    audioNodes.lfoGain.connect(audioNodes.gainNode.gain);
    audioNodes.oscillator.connect(audioNodes.gainNode);
    if (connectToDestination) audioNodes.gainNode.connect(audioCtx.destination);

    audioNodes.oscillator.start();
    audioNodes.lfo.start();
    return audioNodes.gainNode;
}

// Detener y limpiar nodos de audio
function stopAudio() {
    if (audioNodes.oscillator && audioNodes.lfo) {
        audioNodes.oscillator.stop();
        audioNodes.lfo.stop();
        audioNodes.oscillator.disconnect();
        audioNodes.lfo.disconnect();
        audioNodes.gainNode.disconnect();
        audioNodes.lfoGain.disconnect();
        audioNodes = { oscillator: null, lfo: null, gainNode: null, lfoGain: null };
    }
    isPlaying = false;
    if (!isRecording) updateStatus('Inactivo');
}

// Generar patrón automático
function generatePattern() {
    const scale = [220, 261.63, 293.66, 349.23, 415.30];
    const durations = [0.25, 0.5, 0.75];
    const patternLength = 8;

    const pattern = Array.from({ length: patternLength }, () => {
        const freq = Math.random() < 0.2 ? 0 : scale[Math.floor(Math.random() * scale.length)];
        const duration = durations[Math.floor(Math.random() * durations.length)];
        return `${freq.toFixed(2)},${duration}`;
    });

    elements.sequenceInput.value = pattern.join('\n');
}

// Parsear y validar secuencia
function parseSequence() {
    const sequenceText = elements.sequenceInput.value.trim().split('\n');
    const sequence = sequenceText.map(line => {
        const [freq, duration] = line.split(',').map(Number);
        if (isNaN(freq) || isNaN(duration) || duration <= 0) {
            throw new Error('Secuencia inválida: cada línea debe ser "frecuencia,duración" con valores válidos.');
        }
        return { freq, duration };
    });
    if (sequence.length === 0) throw new Error('La secuencia está vacía.');
    return sequence;
}

// Tocar nota individual
elements.playBtn.addEventListener('click', () => {
    if (!isPlaying && !isRecording) {
        createAudioNodes(elements.oscFreqSlider.value);
        isPlaying = true;
        updateStatus('Reproduciendo', 'playing');
    }
});

elements.stopBtn.addEventListener('click', () => {
    stopAudio();
    if (songInterval) {
        clearTimeout(songInterval);
        songInterval = null;
    }
    if (recorder && isRecording) {
        recorder.stop();
        isRecording = false;
    }
    elements.progress.textContent = '';
});

// Tocar canción
elements.playSongBtn.addEventListener('click', () => {
    if (isPlaying || isRecording) return;

    try {
        const sequence = parseSequence();
        let index = 0;

        createAudioNodes(sequence[0].freq > 0 ? sequence[0].freq : 0);
        function playNextNote() {
            const { freq, duration } = sequence[index];
            audioNodes.oscillator.frequency.setValueAtTime(freq > 0 ? freq : 0.01, audioCtx.currentTime);
            audioNodes.gainNode.gain.setValueAtTime(freq > 0 ? 0.5 : 0, audioCtx.currentTime);
            index = (index + 1) % sequence.length;
            songInterval = setTimeout(playNextNote, duration * 1000);
        }

        playNextNote();
        isPlaying = true;
        updateStatus('Reproduciendo Canción', 'playing');
    } catch (error) {
        alert(error.message);
    }
});

// Generar patrón
elements.generatePatternBtn.addEventListener('click', () => {
    generatePattern();
});

// Grabar y descargar con bucle
elements.recordDownloadBtn.addEventListener('click', () => {
    if (isPlaying || isRecording) return;

    try {
        const sequence = parseSequence();
        const baseDuration = sequence.reduce((sum, note) => sum + note.duration, 0);
        const minDuration = parseFloat(elements.minDurationInput.value);
        if (isNaN(minDuration) || minDuration < 5 || minDuration > 300) {
            throw new Error('Duración mínima debe estar entre 5 y 300 segundos.');
        }
        const loops = Math.ceil(minDuration / baseDuration);
        const totalDuration = baseDuration * loops * 1000;

        const dest = audioCtx.createMediaStreamDestination();
        let chunks = [];
        recorder = new MediaRecorder(dest.stream);

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'secuencia.wav';
            a.click();
            URL.revokeObjectURL(url);
            isRecording = false;
            updateStatus('Inactivo');
            elements.progress.textContent = '';
        };

        recorder.start();
        isRecording = true;
        updateStatus('Grabando', 'recording');

        let index = 0;
        let elapsedTime = 0;

        const gainNode = createAudioNodes(sequence[0].freq > 0 ? sequence[0].freq : 0, false);
        gainNode.connect(dest);

        function playNextNoteForRecording() {
            const { freq, duration } = sequence[index];
            audioNodes.oscillator.frequency.setValueAtTime(freq > 0 ? freq : 0.01, audioCtx.currentTime);
            audioNodes.gainNode.gain.setValueAtTime(freq > 0 ? 0.5 : 0, audioCtx.currentTime);
            elapsedTime += duration;
            updateProgress(elapsedTime, minDuration);
            index++;
            if (index >= sequence.length) index = 0;
            if (elapsedTime < minDuration) {
                setTimeout(playNextNoteForRecording, duration * 1000);
            } else {
                setTimeout(() => {
                    stopAudio();
                    recorder.stop();
                }, duration * 1000);
            }
        }

        playNextNoteForRecording();
    } catch (error) {
        alert(error.message);
    }
});

// Controles en tiempo real
elements.oscFreqSlider.addEventListener('input', () => {
    updateValues();
    if (audioNodes.oscillator && !isRecording) {
        audioNodes.oscillator.frequency.setValueAtTime(elements.oscFreqSlider.value, audioCtx.currentTime);
    }
});

elements.lfoFreqSlider.addEventListener('input', () => {
    updateValues();
    if (audioNodes.lfo) {
        audioNodes.lfo.frequency.setValueAtTime(elements.lfoFreqSlider.value, audioCtx.currentTime);
    }
});

elements.lfoGainSlider.addEventListener('input', () => {
    updateValues();
    if (audioNodes.lfoGain) {
        audioNodes.lfoGain.gain.setValueAtTime(elements.lfoGainSlider.value, audioCtx.currentTime);
    }
});

elements.waveTypeSelect.addEventListener('change', () => {
    if (audioNodes.oscillator) {
        audioNodes.oscillator.type = elements.waveTypeSelect.value;
    }
});

// Inicializar valores
updateValues();