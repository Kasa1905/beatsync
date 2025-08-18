import BrowserAudioTest from '@/components/debug/BrowserAudioTest';
import UploadTester from '@/components/debug/UploadTester';
import AudioStreamDiagnostic from '@/components/debug/AudioStreamDiagnostic';

export default function DebugPage() {
  return (
    <div className="space-y-8">
      <AudioStreamDiagnostic />
      <UploadTester />
      <BrowserAudioTest />
    </div>
  );
}
