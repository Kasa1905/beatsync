"use client";

import { useState } from 'react';

export default function BrowserAudioTest() {
  const [testResults, setTestResults] = useState<{
    userAgent: string;
    hasGetDisplayMedia: boolean;
    hasGetUserMedia: boolean;
    audioContext: { state?: string; sampleRate?: number; supported: boolean; error?: string } | null;
    getDisplayMediaTest: { success: boolean; audioTracks: number; trackDetails: unknown[] } | { success: false; error: string; errorName: string } | null;
    constraints: unknown;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results = {
      userAgent: navigator.userAgent,
      hasGetDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      audioContext: null as { state?: string; sampleRate?: number; supported: boolean; error?: string } | null,
      getDisplayMediaTest: null as { success: boolean; audioTracks: number; trackDetails: unknown[] } | { success: false; error: string; errorName: string } | null,
      constraints: null as unknown
    };

    // Test AudioContext
    try {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        results.audioContext = { 
          state: audioContext.state, 
          sampleRate: audioContext.sampleRate, 
          supported: true 
        };
        audioContext.close();
      } else {
        results.audioContext = { error: 'AudioContext not supported', supported: false };
      }
    } catch (error) {
      results.audioContext = { error: error instanceof Error ? error.message : 'Unknown error', supported: false };
    }

    // Test getDisplayMedia with audio
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: false
      });
      
      results.getDisplayMediaTest = {
        success: true,
        audioTracks: stream.getAudioTracks().length,
        trackDetails: stream.getAudioTracks().map(track => ({
          kind: track.kind,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        }))
      };
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      results.getDisplayMediaTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'UnknownError'
      };
    }

    // Test supported constraints
    try {
      const constraints = await navigator.mediaDevices.getSupportedConstraints();
      results.constraints = constraints;
    } catch (error) {
      results.constraints = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Browser Audio Capabilities Test</h1>
      
      <button
        onClick={runTests}
        disabled={testing}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Run Audio Tests'}
      </button>

      {testResults && (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">User Agent</h2>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">
              {testResults.userAgent}
            </pre>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">API Availability</h2>
            <ul className="space-y-1 text-sm">
              <li>getDisplayMedia: {testResults.hasGetDisplayMedia ? '✅' : '❌'}</li>
              <li>getUserMedia: {testResults.hasGetUserMedia ? '✅' : '❌'}</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">AudioContext Test</h2>
            <pre className="text-xs text-gray-300">
              {JSON.stringify(testResults.audioContext, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">getDisplayMedia Test</h2>
            <pre className="text-xs text-gray-300">
              {JSON.stringify(testResults.getDisplayMediaTest, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Supported Constraints</h2>
            <pre className="text-xs text-gray-300">
              {JSON.stringify(testResults.constraints, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
