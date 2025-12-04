export class AudioManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
    
    this.ambientOsc = null;
    this.ambientGain = null;
    this.blackHoleOsc = null;
    this.blackHoleGain = null;
    
    this.isMuted = false;
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startAmbient() {
    this.resume();
    if (this.ambientOsc) return;

    // Deep Space Drone
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 50; // Low rumble
    
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.1;
    
    // LFO for modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Slow wave
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 20; // Modulate freq by +/- 20Hz
    
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOsc.frequency);
    
    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);
    
    this.ambientOsc.start();
    lfo.start();
  }

  playHover() {
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playClick() {
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  startBlackHole() {
    this.resume();
    if (this.blackHoleOsc) return;

    // Intense low rumble
    this.blackHoleOsc = this.ctx.createOscillator();
    this.blackHoleOsc.type = 'sawtooth';
    this.blackHoleOsc.frequency.value = 40;
    
    this.blackHoleGain = this.ctx.createGain();
    this.blackHoleGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.blackHoleGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 1.0);
    
    // Lowpass filter to muffle it
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    
    this.blackHoleOsc.connect(filter);
    filter.connect(this.blackHoleGain);
    this.blackHoleGain.connect(this.masterGain);
    
    this.blackHoleOsc.start();
  }

  stopBlackHole() {
    if (this.blackHoleOsc) {
      this.blackHoleGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
      this.blackHoleOsc.stop(this.ctx.currentTime + 0.2);
      this.blackHoleOsc = null;
    }
  }

  playBurst() {
    this.resume();
    // White noise burst
    const bufferSize = this.ctx.sampleRate * 1.0; // 1 second
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
    
    // Filter sweep
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(5000, this.ctx.currentTime + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  playLevelUp() {
    this.resume();
    // Arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    const now = this.ctx.currentTime;
    
    notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.1, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.5);
    });
  }
  
  playSlap() {
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
  }
}
