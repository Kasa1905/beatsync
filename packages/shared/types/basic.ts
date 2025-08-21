import { z } from "zod";

export const GRID = {
  SIZE: 100,
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  CLIENT_RADIUS: 25,
} as const;

export const PositionSchema = z.object({
  x: z.number().min(0).max(GRID.SIZE),
  y: z.number().min(0).max(GRID.SIZE),
});
export type PositionType = z.infer<typeof PositionSchema>;

export const AudioSourceSchema = z.object({
  url: z.string(),
});
export type AudioSourceType = z.infer<typeof AudioSourceSchema>;

// Additional types for the app
export type DeviceId = string;
export type UserId = string;
export type RoomId = string;
export type AudioTrackId = string;

export interface AudioTrack {
  id: AudioTrackId;
  url: string;
  title: string;
  duration: number;
}

export interface QueueItem extends AudioTrack {
  addedBy: DeviceId;
}

export interface BaseUser {
  deviceId: DeviceId;
  playbackTime?: number;
  playbackRate?: number;
  rtcId?: string;
  isConnected?: boolean;
  nickname?: string;
  position?: UserPosition;
}

export interface UserPosition {
  x: number;
  y: number;
}

export interface ChatMessage {
  id: string;
  deviceId: DeviceId;
  nickname: string;
  content: string;
  timestamp: number;
}

export type ChatMessageType = "chat" | "system";