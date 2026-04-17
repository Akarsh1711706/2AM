// Agora.io voice SDK wrapper
// Replace AGORA_APP_ID in .env with your actual Agora App ID
// This is a placeholder implementation - integrate with react-native-agora in production

import { Platform } from 'react-native';

const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || '';

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string;
  uid: number;
}

export type AudioEventCallback = () => void;

export interface AgoraService {
  join: (config: AgoraConfig) => Promise<void>;
  leave: () => Promise<void>;
  muteLocalAudio: (mute: boolean) => Promise<void>;
  onUserJoined: (cb: AudioEventCallback) => void;
  onUserLeft: (cb: AudioEventCallback) => void;
  onVolumeIndicator: (cb: (volumes: VolumeInfo[]) => void) => void;
}

export interface VolumeInfo {
  uid: number;
  volume: number;
}

// Placeholder Agora service - replace with actual react-native-agora integration
class AgoraServiceImpl implements AgoraService {
  private channel: string | null = null;
  private userJoinedCb: AudioEventCallback | null = null;
  private userLeftCb: AudioEventCallback | null = null;
  private volumeCb: ((volumes: VolumeInfo[]) => void) | null = null;
  private volumeInterval: ReturnType<typeof setInterval> | null = null;
  private isMuted = false;

  async join(config: AgoraConfig): Promise<void> {
    if (!config.appId) {
      console.warn('[Agora] No App ID configured. Running in mock mode.');
    }
    this.channel = config.channel;
    console.log(`[Agora] Joining channel: ${config.channel} on ${Platform.OS}`);

    // Simulate volume updates for waveform visualization
    this.volumeInterval = setInterval(() => {
      if (!this.isMuted && this.volumeCb) {
        this.volumeCb([
          { uid: config.uid, volume: Math.floor(Math.random() * 100) },
        ]);
      }
    }, 200);
  }

  async leave(): Promise<void> {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }
    this.channel = null;
    console.log('[Agora] Left channel');
  }

  async muteLocalAudio(mute: boolean): Promise<void> {
    this.isMuted = mute;
    console.log(`[Agora] Local audio ${mute ? 'muted' : 'unmuted'}`);
  }

  onUserJoined(cb: AudioEventCallback): void {
    this.userJoinedCb = cb;
  }

  onUserLeft(cb: AudioEventCallback): void {
    this.userLeftCb = cb;
  }

  onVolumeIndicator(cb: (volumes: VolumeInfo[]) => void): void {
    this.volumeCb = cb;
  }
}

export const agoraService: AgoraService = new AgoraServiceImpl();
