import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AccessibilitySettings {
  visualAlerts: boolean;
  voiceReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private settingsSubject = new BehaviorSubject<AccessibilitySettings>({
    visualAlerts: true,
    voiceReader: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true
  });

  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
    this.applySettings();
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.settingsSubject.next(settings);
      } catch (error) {
        console.error('Error loading accessibility settings', error);
      }
    }
  }

  public getSettings(): AccessibilitySettings {
    return this.settingsSubject.value;
  }

  public updateSettings(settings: Partial<AccessibilitySettings>): void {
    const current = this.settingsSubject.value;
    const updated = { ...current, ...settings };
    this.settingsSubject.next(updated);
    localStorage.setItem('accessibility-settings', JSON.stringify(updated));
    this.applySettings();
  }

  public toggleVisualAlerts(): void {
    const current = this.getSettings();
    this.updateSettings({ visualAlerts: !current.visualAlerts });
  }

  public toggleVoiceReader(): void {
    const current = this.getSettings();
    this.updateSettings({ voiceReader: !current.voiceReader });
    
    if (!current.voiceReader) {
      this.speak('Lectura por voz activada');
    }
  }

  public toggleHighContrast(): void {
    const current = this.getSettings();
    this.updateSettings({ highContrast: !current.highContrast });
  }

  public toggleLargeText(): void {
    const current = this.getSettings();
    this.updateSettings({ largeText: !current.largeText });
  }

  public speak(text: string): void {
    const settings = this.getSettings();
    if (!settings.voiceReader || !('speechSynthesis' in window)) {
      return;
    }

    try {
      // Cancelar cualquier lectura en curso
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES'; // Puede cambiar según el idioma de la app
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with speech synthesis', error);
    }
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private applySettings(): void {
    const settings = this.getSettings();
    const root = document.documentElement;

    // Aplicar alto contraste
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Aplicar texto ampliado
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  }
}
