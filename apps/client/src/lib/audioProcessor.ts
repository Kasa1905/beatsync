/**
 * Lightweight audio processor for better performance on low-end devices
 * and slow connections
 */

export interface AudioProcessorConfig {
  sampleRate: number;
  bufferSize: number;
  enableCompression: boolean;
  quality: 'low' | 'medium' | 'high';
}

export class LightweightAudioProcessor {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private config: AudioProcessorConfig;

  constructor(config: AudioProcessorConfig) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      // Use lower sample rates for better performance
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
        latencyHint: this.config.quality === 'low' ? 'playback' : 'interactive'
      });

      return true;
    } catch (error) {
      console.error('Audio processor initialization failed:', error);
      return false;
    }
  }

  // Compress audio data for transmission
  compressAudioData(audioData: Float32Array): Uint8Array {
    if (!this.config.enableCompression) {
      return new Uint8Array(audioData.buffer);
    }

    // Simple compression: reduce bit depth for lower quality
    const compressionLevel = this.config.quality === 'low' ? 8 : 
                           this.config.quality === 'medium' ? 12 : 16;
    
    const scale = Math.pow(2, compressionLevel - 1) - 1;
    const compressed = new Uint8Array(audioData.length);
    
    for (let i = 0; i < audioData.length; i++) {
      // Clamp to [-1, 1] and convert to integer
      const clamped = Math.max(-1, Math.min(1, audioData[i]));
      compressed[i] = Math.round((clamped + 1) * scale / 2);
    }
    
    return compressed;
  }

  // Decompress audio data
  decompressAudioData(compressedData: Uint8Array, originalLength: number): Float32Array {
    if (!this.config.enableCompression) {
      return new Float32Array(compressedData.buffer);
    }

    const compressionLevel = this.config.quality === 'low' ? 8 : 
                           this.config.quality === 'medium' ? 12 : 16;
    
    const scale = Math.pow(2, compressionLevel - 1) - 1;
    const decompressed = new Float32Array(originalLength);
    
    for (let i = 0; i < compressedData.length && i < originalLength; i++) {
      decompressed[i] = (compressedData[i] * 2 / scale) - 1;
    }
    
    return decompressed;
  }

  // Create optimized analyser for visualizations
  createOptimizedAnalyser(fftSize?: number): AnalyserNode | null {
    if (!this.audioContext) return null;

    const analyser = this.audioContext.createAnalyser();
    
    // Use smaller FFT sizes for better performance on slow devices
    const optimizedFFTSize = this.config.quality === 'low' ? 256 :
                           this.config.quality === 'medium' ? 512 : 
                           (fftSize || 1024);
    
    analyser.fftSize = optimizedFFTSize;
    analyser.smoothingTimeConstant = this.config.quality === 'low' ? 0.9 : 0.8;
    
    return analyser;
  }

  // Adaptive quality adjustment based on performance
  adaptQuality(frameRate: number, cpuUsage: number): void {
    if (frameRate < 30 || cpuUsage > 80) {
      // Reduce quality for better performance
      if (this.config.quality === 'high') {
        this.config.quality = 'medium';
      } else if (this.config.quality === 'medium') {
        this.config.quality = 'low';
      }
      
      // Reduce sample rate
      this.config.sampleRate = Math.max(22050, this.config.sampleRate * 0.8);
    } else if (frameRate > 55 && cpuUsage < 50) {
      // Increase quality if performance allows
      if (this.config.quality === 'low') {
        this.config.quality = 'medium';
      } else if (this.config.quality === 'medium' && frameRate > 58) {
        this.config.quality = 'high';
      }
    }
  }

  // Clean up resources
  destroy(): void {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  get context(): AudioContext | null {
    return this.audioContext;
  }

  get isInitialized(): boolean {
    return this.audioContext !== null;
  }
}

// Factory function to create optimized processor based on device capabilities
export function createOptimizedAudioProcessor(slowConnection: boolean = false): LightweightAudioProcessor {
  const config: AudioProcessorConfig = {
    sampleRate: slowConnection ? 22050 : 44100,
    bufferSize: slowConnection ? 1024 : 2048,
    enableCompression: slowConnection,
    quality: slowConnection ? 'low' : 'medium'
  };

  return new LightweightAudioProcessor(config);
}
