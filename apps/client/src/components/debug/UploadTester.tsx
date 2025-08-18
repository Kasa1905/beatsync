"use client";

import { useState } from "react";
import { useGlobalStore } from "@/store/global";
import { AudioUploaderMinimal } from "../AudioUploaderMinimal";

export default function UploadTester() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const audioSources = useGlobalStore((state) => state.audioSources);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLocalFileUpload = () => {
    addLog("Testing local file upload simulation...");
    
    // Create a mock blob URL to simulate a local file
    const testBlob = new Blob(['mock audio data'], { type: 'audio/mp3' });
    const testUrl = URL.createObjectURL(testBlob);
    
    const currentSources = useGlobalStore.getState().audioSources.map(as => as.source);
    const newSource = { url: testUrl };
    
    addLog(`Current sources count: ${currentSources.length}`);
    addLog(`Adding test source: ${testUrl}`);
    
    // Use the store's handler to properly add the new source
    useGlobalStore.getState().handleSetAudioSources({
      type: "SET_AUDIO_SOURCES",
      sources: [...currentSources, newSource],
      currentAudioSource: undefined
    });
    
    const updatedSources = useGlobalStore.getState().audioSources;
    addLog(`Updated sources count: ${updatedSources.length}`);
  };

  const clearSources = () => {
    useGlobalStore.getState().handleSetAudioSources({
      type: "SET_AUDIO_SOURCES",
      sources: [],
      currentAudioSource: undefined
    });
    addLog("Cleared all audio sources");
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold">Upload Tester</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upload Component</h2>
          <AudioUploaderMinimal />
          
          <div className="space-y-2">
            <button 
              onClick={testLocalFileUpload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Test Local File Upload
            </button>
            <button 
              onClick={clearSources}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white ml-2"
            >
              Clear Sources
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Current Audio Sources</h2>
          <div className="bg-gray-800 p-4 rounded">
            <p>Count: {audioSources.length}</p>
            {audioSources.map((source, idx) => (
              <div key={idx} className="mt-2 p-2 bg-gray-700 rounded text-sm">
                <p><strong>URL:</strong> {source.source.url.substring(0, 50)}...</p>
                <p><strong>Status:</strong> {source.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Log</h2>
        <div className="bg-gray-800 p-4 rounded max-h-60 overflow-y-auto">
          {testResults.map((result, idx) => (
            <div key={idx} className="text-sm font-mono">{result}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
