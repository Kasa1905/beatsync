/**
 * Audio Processor Worklet
 * 
 * Runs in the audio worklet thread for low-latency audio processing
 * Supports real-time audio streaming with minimal latency
 */

class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    this.bufferSize = options.processorOptions?.bufferSize || 4096;
    this.channels = options.processorOptions?.channels || 2;
    this.bufferIndex = 0;
    
    // Initialize buffers for each channel
    this.buffer = new Array(this.channels);
    for (let i = 0; i < this.channels; i++) {
      this.buffer[i] = new Float32Array(this.bufferSize);
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || input.length === 0) {
      return true;
    }

    const frameCount = input[0]?.length || 128;
    const channelCount = Math.min(input.length, this.channels);

    // Process each frame
    for (let frame = 0; frame < frameCount; frame++) {
      // Copy input to buffer for each channel
      for (let channel = 0; channel < channelCount; channel++) {
        if (input[channel]) {
          this.buffer[channel][this.bufferIndex] = input[channel][frame];
        }
        
        // Pass through to output (optional - for monitoring)
        if (output[channel]) {
          output[channel][frame] = input[channel] ? input[channel][frame] : 0;
        }
      }

      this.bufferIndex++;

      // When buffer is full, send to main thread
      if (this.bufferIndex >= this.bufferSize) {
        this.sendAudioData();
        this.bufferIndex = 0;
      }
    }

    return true;
  }

  sendAudioData() {
    // Interleave channels into a single buffer
    const interleavedBuffer = new Float32Array(this.bufferSize * this.channels);
    
    for (let frame = 0; frame < this.bufferSize; frame++) {
      for (let channel = 0; channel < this.channels; channel++) {
        interleavedBuffer[frame * this.channels + channel] = this.buffer[channel][frame];
      }
    }

    // Send to main thread
    this.port.postMessage({
      type: 'audioData',
      audioBuffer: interleavedBuffer.buffer,
      timestamp: currentTime
    });
  }
}

// Register the processor
registerProcessor('audio-processor', AudioProcessor);
