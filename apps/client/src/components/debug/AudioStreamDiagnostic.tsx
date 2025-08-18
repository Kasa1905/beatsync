"use client";

import { useState, useEffect } from "react";

interface BrowserCapabilities {
  hasGetDisplayMedia: boolean;
  hasGetUserMedia: boolean;
  hasWebAudio: boolean;
  hasMediaRecorder: boolean;
  systemAudioSupport: 'full' | 'limited' | 'none';
  recommendedMethod: 'system' | 'microphone' | 'file';
  browserName: string;
  isMobile: boolean;
}

export default function AudioStreamDiagnostic() {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const getBrowserCapabilities = (): BrowserCapabilities => {
    const userAgent = navigator.userAgent.toLowerCase();
    const capabilities: BrowserCapabilities = {
      hasGetDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      hasWebAudio: !!(window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext),
      hasMediaRecorder: !!window.MediaRecorder,
      systemAudioSupport: 'none',
      recommendedMethod: 'file',
      browserName: 'unknown',
      isMobile: /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    };

    // Browser detection with capabilities
    if (userAgent.includes('chrome') && !userAgent.includes('edg') && !userAgent.includes('opr')) {
      capabilities.browserName = 'Chrome';
      const chromeMatch = userAgent.match(/chrome\/(\d+)/);
      if (chromeMatch && parseInt(chromeMatch[1]) >= 72) {
        capabilities.systemAudioSupport = 'full';
        capabilities.recommendedMethod = 'system';
      }
    } else if (userAgent.includes('edg')) {
      capabilities.browserName = 'Edge';
      capabilities.systemAudioSupport = 'full';
      capabilities.recommendedMethod = 'system';
    } else if (userAgent.includes('firefox')) {
      capabilities.browserName = 'Firefox';
      capabilities.systemAudioSupport = 'limited';
      capabilities.recommendedMethod = 'microphone';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      capabilities.browserName = 'Safari';
      capabilities.recommendedMethod = 'file';
    }

    // Mobile optimization
    if (capabilities.isMobile) {
      capabilities.recommendedMethod = 'file';
    }

    return capabilities;
  };

  const testSystemAudio = async () => {
    addLog("Testing system audio capture...");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: false
      });
      addLog("✅ System audio capture: SUPPORTED");
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      addLog(`❌ System audio capture: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testMicrophone = async () => {
    addLog("Testing microphone access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      addLog("✅ Microphone access: SUPPORTED");
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      addLog(`❌ Microphone access: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testAudioContext = () => {
    addLog("Testing Web Audio API...");
    try {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        addLog("✅ Web Audio API: SUPPORTED");
        context.close();
      } else {
        addLog("❌ Web Audio API: NOT SUPPORTED");
      }
    } catch (error) {
      addLog(`❌ Web Audio API: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addLog("Starting audio streaming diagnostics...");
    
    const caps = getBrowserCapabilities();
    setCapabilities(caps);
    addLog(`Browser: ${caps.browserName} (Mobile: ${caps.isMobile})`);
    addLog(`System Audio Support: ${caps.systemAudioSupport}`);
    addLog(`Recommended Method: ${caps.recommendedMethod}`);
    
    testAudioContext();
    await testMicrophone();
    await testSystemAudio();
    
    addLog("Diagnostics complete!");
  };

  useEffect(() => {
    setCapabilities(getBrowserCapabilities());
  }, []);

  return (
    <div className="p-6 space-y-6 text-white bg-neutral-950 min-h-screen">
      <h1 className="text-2xl font-bold">Audio Stream Diagnostic</h1>
      
      {capabilities && (
        <div className="bg-neutral-800 rounded-lg p-4 space-y-2">
          <h2 className="text-lg font-semibold">Browser Capabilities</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Browser:</strong> {capabilities.browserName}
            </div>
            <div>
              <strong>Mobile:</strong> {capabilities.isMobile ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>getDisplayMedia:</strong> {capabilities.hasGetDisplayMedia ? '✅' : '❌'}
            </div>
            <div>
              <strong>getUserMedia:</strong> {capabilities.hasGetUserMedia ? '✅' : '❌'}
            </div>
            <div>
              <strong>Web Audio:</strong> {capabilities.hasWebAudio ? '✅' : '❌'}
            </div>
            <div>
              <strong>MediaRecorder:</strong> {capabilities.hasMediaRecorder ? '✅' : '❌'}
            </div>
            <div className="col-span-2">
              <strong>System Audio Support:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                capabilities.systemAudioSupport === 'full' ? 'bg-green-600' :
                capabilities.systemAudioSupport === 'limited' ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
                {capabilities.systemAudioSupport.toUpperCase()}
              </span>
            </div>
            <div className="col-span-2">
              <strong>Recommended Method:</strong> 
              <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-600">
                {capabilities.recommendedMethod.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button 
          onClick={runAllTests}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          Run Audio Tests
        </button>
        
        <div className="bg-neutral-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Test Results</h2>
          <div className="bg-black p-3 rounded font-mono text-sm max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-400">Click &quot;Run Audio Tests&quot; to start diagnostics...</p>
            ) : (
              testResults.map((result, idx) => (
                <div key={idx} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-300 mb-2">Common Issues & Solutions</h3>
        <ul className="text-sm text-yellow-200 space-y-1">
          <li>• <strong>System Audio &quot;Not supported&quot;:</strong> Try using Chrome/Edge, or use Microphone/File upload instead</li>
          <li>• <strong>Permission denied:</strong> Allow microphone/screen sharing when prompted</li>
          <li>• <strong>&quot;Disconnected&quot; status:</strong> This shows until you start streaming - it&apos;s normal</li>
          <li>• <strong>Safari limitations:</strong> System audio not supported, use File upload method</li>
          <li>• <strong>Mobile devices:</strong> File upload is recommended for best compatibility</li>
        </ul>
      </div>
    </div>
  );
}
