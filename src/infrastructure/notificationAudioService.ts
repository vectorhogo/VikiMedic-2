/**
 * VikiMedic v2 - Notification Audio Service (Web Audio API Synthesizer)
 * Clean Architecture Layer: Infrastructure
 */

import { NotificationSettings } from '../domain/notifications';

class NotificationAudioService {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Check if current time falls within Quiet Hours (e.g., 22:00 to 07:00)
   */
  public isQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Crosses midnight (e.g. 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Play a clean, soft medical chime audio tone based on priority
   */
  public playChime(priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL', settings: NotificationSettings) {
    if (settings.muted || !settings.soundEnabled) return;
    if (this.isQuietHours(settings)) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const gainNode = this.audioCtx.createGain();
      const vol = (settings.volume / 100) * 0.15; // Soft gain
      gainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gainNode.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (priority === 'CRITICAL') {
        // Double pulse alert chime (High pitch C6 to G6)
        this.playTone(880, now, 0.12, gainNode);
        this.playTone(1046.5, now + 0.15, 0.25, gainNode);
      } else if (priority === 'HIGH') {
        // High tone
        this.playTone(783.99, now, 0.15, gainNode);
        this.playTone(987.77, now + 0.12, 0.2, gainNode);
      } else {
        // Normal/Low soft chime
        this.playTone(523.25, now, 0.12, gainNode);
        this.playTone(659.25, now + 0.1, 0.18, gainNode);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  private playTone(freq: number, startTime: number, duration: number, destination: GainNode) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const toneGain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    toneGain.gain.setValueAtTime(0, startTime);
    toneGain.gain.linearRampToValueAtTime(1, startTime + 0.02);
    toneGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(toneGain);
    toneGain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const notificationAudio = new NotificationAudioService();
