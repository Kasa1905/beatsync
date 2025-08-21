/**
 * Universal System Audio Streaming Manager
 * 
 * Supports:
 * - Desktop: Chrome, Edge, Firefox, Safari (screen capture with audio)
 * - Mobile: iOS Safari, Chrome Mobile, Android Chrome (microphone fallback)
 * - OS: Windows, macOS, Linux, iOS, Android
 * 
 * Features:
 * - Screen audio capture (Chromium browsers)
 * - Microphone capture (fallback for all browsers)
 * - Audio worklet processing for low latency
 * - Real-time streaming via WebSocket
 * - Adaptive quality based on network conditions
 */

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'unknown';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Brave' | 'unknown';
  supportsScreenCapture: boolean;
  supportsMicrophone: boolean;
  supportsAudioWorklet: boolean;
  mediaDevices: boolean;
}

export interface SystemAudioConfig {
  sampleRate: number;
  channels: number;
  quality: 'low' | 'medium' | 'high';
  autoStart: boolean;
  enableFallback: boolean;
  bufferSize: number;
  enableEchoCancellation: boolean;
  enableNoiseSuppression: boolean;
}

export interface AudioStreamData {
  audioData: number[];
  sampleRate: number;
  channelCount: number;
  timestamp: number;
  volume: number;
}

export class UniversalSystemAudioManager {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isStreaming = false;
  private config: SystemAudioConfig;
  private onAudioData?: (data: AudioStreamData) => void;
  private deviceInfo: DeviceInfo;

  constructor(config: Partial<SystemAudioConfig> = {}) {
    this.config = {
      sampleRate: 44100,
      channels: 2,
      bufferSize: 4096,
      quality: 'medium',
      autoStart: false,
      enableFallback: true,
      enableEchoCancellation: true,
      enableNoiseSuppression: true,
      ...config
    };

    this.deviceInfo = this.detectDevice();
  }

  /**
   * Detect device capabilities and type
   */
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect OS
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMac = platform.includes('Mac');
    const isWindows = platform.includes('Win');
    const isLinux = platform.includes('Linux');
    
    let os: DeviceInfo['os'] = 'unknown';
    if (isIOS) os = 'iOS';
    else if (isAndroid) os = 'Android';
    else if (isMac) os = 'macOS';
    else if (isWindows) os = 'Windows';
    else if (isLinux) os = 'Linux';
    
    // Detect browser
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    const isBrave = /Brave/.test(userAgent) || !!(navigator as { brave?: unknown }).brave;
    
    let browser: DeviceInfo['browser'] = 'unknown';
    if (isBrave) browser = 'Brave';
    else if (isChrome) browser = 'Chrome';
    else if (isSafari) browser = 'Safari';
    else if (isFirefox) browser = 'Firefox';
    else if (isEdge) browser = 'Edge';
    
    // Detect device type
    const isMobile = /Mobi|Android/i.test(userAgent);
    const isTablet = /iPad|Android.*(?!.*Mobile)/i.test(userAgent);
    
    let deviceType: DeviceInfo['deviceType'] = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    
    // Feature detection
    const supportsScreenCapture = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
    const supportsMicrophone = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const supportsAudioWorklet = !!(window.AudioContext && AudioContext.prototype.audioWorklet);
    const mediaDevices = !!navigator.mediaDevices;
    
    return {
      deviceType,
      os,
      browser,
      supportsScreenCapture,
      supportsMicrophone,
      supportsAudioWorklet,
      mediaDevices
    };
  }

  /**
   * Start system audio streaming with the best available method
   */
  async startSystemAudioStream(): Promise<boolean> {
    try {
      console.log('🎵 Starting Universal System Audio Stream...', this.deviceInfo);

      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as { webkitAudioContext?: AudioContext }).webkitAudioContext!)({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });

      let stream: MediaStream;

      // Try screen capture with audio first (best quality)
      if (this.deviceInfo.supportsScreenCapture && this.deviceInfo.deviceType !== 'mobile') {
        stream = await this.getScreenAudioStream();
        console.log('✅ Using screen audio capture');
      } else {
        // Fallback to microphone
        stream = await this.getMicrophoneStream();
        console.log('✅ Using microphone fallback');
      }

      this.mediaStream = stream;
      this.source = this.audioContext.createMediaStreamSource(stream);

      // Use AudioWorklet if supported, otherwise ScriptProcessor
      if (this.deviceInfo.supportsAudioWorklet) {
        await this.initializeAudioWorklet();
      } else {
        this.initializeScriptProcessor();
      }

      this.isStreaming = true;
      return true;

    } catch (error) {
      console.error('❌ Failed to start system audio stream:', error);
      
      // Try alternative methods
      return await this.tryFallbackMethods();
    }
  }

  /**
   * Get screen audio stream (Chromium browsers)
   */
  private async getScreenAudioStream(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        echoCancellation: this.config.enableEchoCancellation,
        noiseSuppression: this.config.enableNoiseSuppression,
        sampleRate: this.config.sampleRate,
        channelCount: this.config.channels
      } satisfies MediaTrackConstraints,
      video: false // We only want audio
    });

    // Check if audio track exists
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('No audio track in screen capture');
    }

    return stream;
  }

  /**
   * Get microphone stream (fallback for all browsers)
   */
  private async getMicrophoneStream(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: this.config.enableEchoCancellation,
        noiseSuppression: this.config.enableNoiseSuppression,
        sampleRate: this.config.sampleRate,
        channelCount: this.config.channels
      },
      video: false
    });

    return stream;
  }

  /**
   * Initialize AudioWorklet for modern browsers
   */
  private async initializeAudioWorklet(): Promise<void> {
    if (!this.audioContext || !this.source) throw new Error('Audio context not initialized');

    // Add the audio worklet module
    await this.audioContext.audioWorklet.addModule('/audio-processor-worklet.js');
    
    this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor', {
      processorOptions: {
        bufferSize: this.config.bufferSize,
        channels: this.config.channels
      }
    });

    // Handle processed audio data
    this.workletNode.port.onmessage = (event) => {
      if (event.data.type === 'audioData' && this.onAudioData) {
        const audioData: AudioStreamData = {
          audioData: Array.from(new Float32Array(event.data.audioBuffer)),
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          timestamp: performance.now(),
          volume: event.data.volume || 0
        };
        this.onAudioData(audioData);
      }
    };

    // Connect the audio graph
    this.source.connect(this.workletNode);
    this.workletNode.connect(this.audioContext.destination);
  }

  /**
   * Initialize ScriptProcessor for older browsers
   */
  private initializeScriptProcessor(): void {
    if (!this.audioContext || !this.source) throw new Error('Audio context not initialized');

    this.processor = this.audioContext.createScriptProcessor(
      this.config.bufferSize,
      this.config.channels,
      this.config.channels
    );

    this.processor.onaudioprocess = (event) => {
      if (!this.onAudioData) return;

      const inputBuffer = event.inputBuffer;
      const channels = inputBuffer.numberOfChannels;
      const length = inputBuffer.length;
      
      // Interleave channels if stereo
      const audioData = new Float32Array(length * channels);
      
      if (channels === 1) {
        audioData.set(inputBuffer.getChannelData(0));
      } else {
        for (let i = 0; i < length; i++) {
          for (let channel = 0; channel < channels; channel++) {
            audioData[i * channels + channel] = inputBuffer.getChannelData(channel)[i];
          }
        }
      }

      const streamData: AudioStreamData = {
        audioData: Array.from(audioData),
        sampleRate: this.config.sampleRate,
        channelCount: channels,
        timestamp: performance.now(),
        volume: 0
      };

      this.onAudioData(streamData);
    };

    // Connect the audio graph
    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  /**
   * Try fallback methods for problematic browsers/devices
   */
  private async tryFallbackMethods(): Promise<boolean> {
    console.log('🔄 Trying fallback methods...');

    try {
      // Method 1: Basic microphone with minimal constraints
      const basicStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      this.mediaStream = basicStream;
      
      if (this.audioContext) {
        this.source = this.audioContext.createMediaStreamSource(basicStream);
        this.initializeScriptProcessor();
        this.isStreaming = true;
        console.log('✅ Fallback method successful');
        return true;
      }
    } catch (error) {
      console.error('❌ All fallback methods failed:', error);
    }

    return false;
  }

  /**
   * Stop the audio stream
   */
  stopSystemAudioStream(): void {
    console.log('🛑 Stopping system audio stream...');

    this.isStreaming = false;

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Set callback for audio data
   */
  setOnAudioData(callback: (data: AudioStreamData) => void): void {
    this.onAudioData = callback;
  }

  /**
   * Get current streaming status
   */
  getStreamingStatus(): {
    isStreaming: boolean;
    deviceInfo: DeviceInfo;
    config: SystemAudioConfig;
  } {
    return {
      isStreaming: this.isStreaming,
      deviceInfo: this.deviceInfo,
      config: this.config
    };
  }

  /**
   * Check if system audio capture is supported
   */
  static async checkSupport(): Promise<{
    screenCapture: boolean;
    microphone: boolean;
    audioWorklet: boolean;
    webAudio: boolean;
  }> {
    const support = {
      screenCapture: false,
      microphone: false,
      audioWorklet: false,
      webAudio: false
    };

    // Check Web Audio API
    support.webAudio = !!(window.AudioContext || (window as { webkitAudioContext?: AudioContext }).webkitAudioContext);

    // Check AudioWorklet
    if (support.webAudio) {
      const context = new (window.AudioContext || (window as { webkitAudioContext?: AudioContext }).webkitAudioContext!)();
      support.audioWorklet = !!(context.audioWorklet);
      await context.close();
    }

    // Check screen capture
    support.screenCapture = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

    // Check microphone
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      support.microphone = devices.some(device => device.kind === 'audioinput');
    } catch {
      support.microphone = false;
    }

    return support;
  }
}
