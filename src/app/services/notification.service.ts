import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  timestamp: Date;
  sound?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();
  
  private soundEnabled = true;
  private visualAlertsEnabled = true;

  constructor() {
    // Cargar preferencias desde localStorage
    const soundPref = localStorage.getItem('notifications-sound');
    const visualPref = localStorage.getItem('notifications-visual');
    
    if (soundPref !== null) {
      this.soundEnabled = soundPref === 'true';
    }
    if (visualPref !== null) {
      this.visualAlertsEnabled = visualPref === 'true';
    }
  }

  public show(message: string, type: NotificationType = 'info', duration: number = 5000): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      duration,
      timestamp: new Date(),
      sound: this.soundEnabled
    };

    if (this.visualAlertsEnabled) {
      this.notificationSubject.next(notification);
    }

    if (this.soundEnabled) {
      this.playNotificationSound(type);
    }
  }

  public success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  public error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  public warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  public info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('notifications-sound', enabled.toString());
  }

  public setVisualAlertsEnabled(enabled: boolean): void {
    this.visualAlertsEnabled = enabled;
    localStorage.setItem('notifications-visual', enabled.toString());
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getVisualAlertsEnabled(): boolean {
    return this.visualAlertsEnabled;
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private playNotificationSound(type: NotificationType): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Diferentes frecuencias según el tipo
      switch (type) {
        case 'success':
          oscillator.frequency.value = 800;
          break;
        case 'error':
          oscillator.frequency.value = 400;
          break;
        case 'warning':
          oscillator.frequency.value = 600;
          break;
        default:
          oscillator.frequency.value = 500;
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación', error);
    }
  }
}
