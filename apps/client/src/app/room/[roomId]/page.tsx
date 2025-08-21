import { NewSyncer } from "@/components/NewSyncer";
import { ErrorState } from "@/components/ui/states";
import { validateFullRoomId } from "@/lib/room";

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  if (!validateFullRoomId(roomId)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState
          title="Invalid Room Code"
          description={`"${roomId}" is not a valid room code. Please enter a 6-digit numeric code to join a room.`}
          onRetry={() => window.location.href = "/"}
          retryText="Go Home"
        />
      </div>
    );
  }

  return <NewSyncer roomId={roomId} />;
}
