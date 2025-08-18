'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Volume2, 
  VolumeX, 
  Mic,
  Settings,
  Upload,
  Monitor,
  Play,
  Square
} from 'lucide-react'
import { useParams } from 'next/navigation'

interface User {
  id: string
  username: string
  position: { x: number; y: number }
  isPlaying: boolean
  isMuted: boolean
  volume: number
}

const RoomPage: React.FC = () => {
  const params = useParams()
  const roomId = params?.roomId as string
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'easygoing-orangutan', position: { x: 20, y: 80 }, isPlaying: true, isMuted: false, volume: 80 },
    { id: '2', username: 'You', position: { x: 50, y: 50 }, isPlaying: false, isMuted: false, volume: 100 }
  ])
  
  const [currentUser, setCurrentUser] = useState<User>(users[1])
  const [audioSource, setAudioSource] = useState<'mic' | 'system' | 'file'>('mic')
  const [isStreaming, setIsStreaming] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [spatialAudio, setSpatialAudio] = useState(true)
  const [rotationEnabled, setRotationEnabled] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const startMicrophoneCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setIsStreaming(true)
      setUsers(prev => prev.map(user => 
        user.username === 'You' ? { ...user, isPlaying: true } : user
      ))
      console.log('Microphone streaming started')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Error accessing microphone. Please check permissions.')
    }
  }

  const startSystemAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100
        }
      })
      
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop())
        alert('No audio track found. Please select "Share audio" in the browser dialog.')
        return
      }

      mediaStreamRef.current = stream
      setIsStreaming(true)
      setUsers(prev => prev.map(user => 
        user.username === 'You' ? { ...user, isPlaying: true } : user
      ))
      console.log('System audio streaming started')
    } catch (error) {
      console.error('Error capturing system audio:', error)
      alert('Error capturing system audio. Please ensure you select "Share audio" in the browser dialog.')
    }
  }

  const startFilePlayback = () => {
    if (audioRef.current && uploadedFile) {
      audioRef.current.play()
      setIsStreaming(true)
      setUsers(prev => prev.map(user => 
        user.username === 'You' ? { ...user, isPlaying: true } : user
      ))
    }
  }

  const stopStreaming = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsStreaming(false)
    setUsers(prev => prev.map(user => 
      user.username === 'You' ? { ...user, isPlaying: false } : user
    ))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file)
      setAudioSource('file')
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file)
      }
    }
  }

  const handleUserDrag = (userId: string, newPosition: { x: number; y: number }) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, position: newPosition } : user
    ))
  }

  const toggleMute = () => {
    setCurrentUser(prev => ({ ...prev, isMuted: !prev.isMuted }))
    setUsers(prev => prev.map(user => 
      user.username === 'You' ? { ...user, isMuted: !user.isMuted } : user
    ))
  }

  const startAudioCapture = () => {
    if (audioSource === 'mic') {
      startMicrophoneCapture()
    } else if (audioSource === 'system') {
      startSystemAudioCapture()
    } else if (audioSource === 'file') {
      startFilePlayback()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h1 className="text-lg font-medium">Beatsync</h1>
          <span className="text-gray-400">{users.length}/40</span>
          <span className="text-gray-400">#{roomId}</span>
          <span className="text-gray-400">914860</span>
          <span className="text-gray-400">{users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Offset: 50.46ms RTT: 328.59ms</span>
          <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Room Title */}
          <div className="absolute top-4 left-4 z-10">
            <h2 className="text-xl font-semibold">Room {roomId}</h2>
          </div>

          {/* Spatial Audio Environment */}
          <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }}
              />
            </div>

            {/* Users in Spatial Environment */}
            {users.map((user) => (
              <motion.div
                key={user.id}
                drag
                dragMomentum={false}
                onDrag={(_, info: any) => {
                  const container = document.querySelector('[data-spatial-container]') as HTMLElement
                  if (container) {
                    const rect = container.getBoundingClientRect()
                    const x = ((info.point.x - rect.left) / rect.width) * 100
                    const y = ((info.point.y - rect.top) / rect.height) * 100
                    handleUserDrag(user.id, { 
                      x: Math.max(0, Math.min(100, x)), 
                      y: Math.max(0, Math.min(100, y)) 
                    })
                  }
                }}
                className="absolute cursor-move"
                style={{
                  left: `${user.position.x}%`,
                  top: `${user.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileDrag={{ scale: 1.2 }}
              >
                <div className={`flex flex-col items-center ${user.username === 'You' ? 'text-green-400' : 'text-blue-400'}`}>
                  {/* User Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    user.username === 'You' ? 'bg-green-500' : 'bg-orange-500'
                  } ${user.isPlaying ? 'ring-4 ring-white/30 animate-pulse' : ''}`}>
                    <span className="text-white text-sm font-bold">
                      {user.username === 'You' ? 'Y' : user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Username */}
                  <span className="text-xs font-medium px-2 py-1 bg-black/50 rounded-lg backdrop-blur">
                    {user.username}
                  </span>
                  
                  {/* Audio Indicator */}
                  {user.isPlaying && (
                    <div className="mt-1 text-xs text-gray-300">
                      {user.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </div>
                  )}
                </div>

                {/* Spatial Audio Range Indicator */}
                {spatialAudio && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-32 h-32 border border-white/10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <div className="w-48 h-48 border border-white/5 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Center Instructions */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No tracks yet</p>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg pointer-events-auto">
                  Load default tracks
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-800">
              {/* Audio Source Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAudioSource('mic')}
                  className={`p-2 rounded-lg transition-colors ${
                    audioSource === 'mic' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="Microphone"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAudioSource('system')}
                  className={`p-2 rounded-lg transition-colors ${
                    audioSource === 'system' ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="System Audio"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg transition-colors ${
                    audioSource === 'file' ? 'bg-purple-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="Upload File"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* Main Controls */}
              <div className="w-px h-8 bg-gray-600" />
              
              <button
                onClick={isStreaming ? stopStreaming : startAudioCapture}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isStreaming 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isStreaming ? 'Stop' : 'Start'}
              </button>

              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-colors ${
                  currentUser.isMuted ? 'bg-orange-500' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={currentUser.isMuted ? 'Unmute' : 'Mute'}
              >
                {currentUser.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Settings */}
              <div className="w-px h-8 bg-gray-600" />
              
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 space-y-4">
          {/* Spatial Audio Toggle */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Spatial Audio</h3>
              <button
                onClick={() => setSpatialAudio(!spatialAudio)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  spatialAudio ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  spatialAudio ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              This grid simulates a spatial audio environment. Drag the listening source around and hear how the volume changes on each device.
            </p>
            <div className="text-sm text-gray-500">100%</div>
          </div>

          {/* Audio Effects */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="font-medium mb-3">Audio Effects</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">🔄 Rotation</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setRotationEnabled(true)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      rotationEnabled ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    Start
                  </button>
                  <button 
                    onClick={() => setRotationEnabled(false)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      !rotationEnabled ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    Stop
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">⚠️ More coming soon...</p>
            </div>
          </div>

          {/* Connected Users */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">👥 CONNECTED USERS</span>
              <span className="text-sm text-gray-400">{users.length}</span>
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${
                    user.username === 'You' ? 'bg-green-500' : 'bg-orange-500'
                  } flex items-center justify-center`}>
                    <span className="text-xs text-white">
                      {user.username === 'You' ? 'Y' : user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm flex-1">{user.username}</span>
                  {user.username === 'You' && (
                    <span className="text-xs bg-green-600 px-2 py-1 rounded">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="font-medium mb-2">Tips</h3>
            <p className="text-xs text-gray-400 mb-3">• Play on speaker directly. Don't use Bluetooth.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                <span>Upload audio</span>
              </div>
              <p className="text-xs text-gray-400 ml-6">Add music to queue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={() => setIsStreaming(false)} />
    </div>
  )
}

export default RoomPage
