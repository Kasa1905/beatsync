/**
 * Universal System Audio Streaming Manager
 * Supports screen capture audio across multiple platforms and browsers:
 * - Desktop: Chrome, Firefox, Edge, Safari, Brave (screen capture with audio)
 * - Screen audio capture (primary method for desktop browsers)
 * 
 * Features:
 * - WebAudio API with AudioWorklet support
 * - Real-time audio processing and streaming
 * - Cross-platform device detection
 * - TypeScript strict mode compliance
 *
 * Note: Chat communication is available for coordination instead of microphone.
 */

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'unknown';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Brave' | 'unknown';
  supportsScreenCapture: boolean;
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
    let userAgent = '';
    let platform = '';
    
    // Ultra-safe navigator access using object destructuring and optional chaining
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      if (nav) {
        userAgent = String(nav.userAgent || '');
        platform = String(nav.platform || '');
      }
    } catch (e) {
      console.warn('Could not access navigator properties:', e);
      // Fallback to window properties if navigator fails
      try {
        userAgent = String((window as any)?.navigator?.userAgent || '');
        platform = String((window as any)?.navigator?.platform || '');
      } catch (e2) {
        console.warn('Could not access window.navigator:', e2);
      }
    }
    
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
    
    // Detect browser - completely safe approach
    let browser: DeviceInfo['browser'] = 'unknown';
    try {
      if (userAgent.includes('Edg')) browser = 'Edge';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
      
      // Check for Brave separately
      if (typeof (window as any)?.chrome?.runtime?.onConnect !== 'undefined') {
        try {
          if ((navigator as any)?.brave && typeof (navigator as any).brave.isBrave === 'function') {
            browser = 'Brave';
          }
        } catch (e) {
          // Ignore Brave detection errors
        }
      }
    } catch (e) {
      console.warn('Could not detect browser:', e);
    }
    
    // Detect device type
    const isMobile = /Mobi|Android/i.test(userAgent);
    const isTablet = /iPad|Android.*(?!.*Mobile)/i.test(userAgent);
    
    let deviceType: DeviceInfo['deviceType'] = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    
    // Feature detection with ultra-safe access
    let supportsScreenCapture = false;
    let supportsAudioWorklet = false;
    let mediaDevices = false;
    
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      if (nav && nav.mediaDevices && typeof nav.mediaDevices.getDisplayMedia === 'function') {
        supportsScreenCapture = true;
      }
    } catch (e) {
      console.warn('Could not detect screen capture support:', e);
      try {
        const winNav = (window as any)?.navigator;
        if (winNav?.mediaDevices?.getDisplayMedia) {
          supportsScreenCapture = true;
        }
      } catch (e2) {
        console.warn('Fallback screen capture detection failed:', e2);
      }
    }
    
    try {
      if (typeof window !== 'undefined' && window.AudioContext && AudioContext.prototype.audioWorklet) {
        supportsAudioWorklet = true;
      }
    } catch (e) {
      console.warn('Could not detect AudioWorklet support:', e);
    }
    
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      if (nav && nav.mediaDevices) {
        mediaDevices = true;
      }
    } catch (e) {
      console.warn('Could not detect media devices support:', e);
      try {
        const winNav = (window as any)?.navigator;
        if (winNav?.mediaDevices) {
          mediaDevices = true;
        }
      } catch (e2) {
        console.warn('Fallback media devices detection failed:', e2);
      }
    }
    
    return {
      deviceType,
      os,
      browser,
      supportsScreenCapture,
      supportsAudioWorklet,
      mediaDevices
    };
  }

  /**
   * Start system audio streaming with screen capture only
   */
  async startSystemAudioStream(): Promise<boolean> {
    try {
      console.log('🎵 Starting Universal System Audio Stream...', this.deviceInfo);

      // Check if screen capture is supported
      if (!this.deviceInfo.supportsScreenCapture) {
        throw new Error('Screen audio capture not supported on this device. Please use a desktop browser with screen sharing capabilities.');
      }

      if (this.deviceInfo.deviceType === 'mobile') {
        throw new Error('Screen audio capture not available on mobile devices. Please use a desktop browser.');
      }

      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as { webkitAudioContext?: AudioContext }).webkitAudioContext!)({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });

      // Get screen audio stream
      const stream = await this.getScreenAudioStream();
      console.log('✅ Using screen audio capture');

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
      this.stopSystemAudioStream();
      throw error;
    }
  }

  /**
   * Get screen audio stream (Chromium browsers)
   */
  private async getScreenAudioStream(): Promise<MediaStream> {
    // Safe access to navigator.mediaDevices.getDisplayMedia
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    if (!nav?.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture not supported - navigator.mediaDevices.getDisplayMedia not available');
    }

    const stream = await nav.mediaDevices.getDisplayMedia({
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
    audioWorklet: boolean;
    webAudio: boolean;
  }> {
    const support = {
      screenCapture: false,
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

    // Check screen capture with safe access
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      support.screenCapture = !!(nav?.mediaDevices?.getDisplayMedia);
    } catch (e) {
      console.warn('Could not check screen capture support:', e);
      support.screenCapture = false;
    }

    return support;
  }
}
