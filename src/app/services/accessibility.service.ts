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

  public toggleKeyboardNavigation(): void {
    const current = this.getSettings();
    const newValue = !current.keyboardNavigation;
    this.updateSettings({ keyboardNavigation: newValue });
    
    if (newValue) {
      this.speak('Navegación por teclado activada');
    } else {
      this.speak('Navegación por teclado desactivada');
    }
  }

  public speak(text: string): void {
    if (!text || text.trim() === '') {
      return;
    }

    const settings = this.getSettings();
    if (!settings.voiceReader) {
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    try {
      // Cancelar cualquier lectura en curso
      window.speechSynthesis.cancel();

      // Pequeño delay para asegurar que la cancelación se complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
        };

        window.speechSynthesis.speak(utterance);
      }, 50);
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
    if (typeof document === 'undefined') {
      return;
    }

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

    // Aplicar indicador de navegación por teclado
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation-enabled');
      root.setAttribute('data-keyboard-nav', 'true');
    } else {
      root.classList.remove('keyboard-navigation-enabled');
      root.setAttribute('data-keyboard-nav', 'false');
    }
  }
}
