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
  private clickListenerAttached = false;
  private boundClickHandler: any = null;

  constructor() {
    this.loadSettings();
    this.applySettings();
    // Si la lectura por voz estaba activa, habilitar lector por clic
    if (this.getSettings().voiceReader) {
      this.startClickRead();
    }
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
      this.startClickRead();
    } else {
      this.stopClickRead();
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

  // Lee todo el contenido visible de la interfaz (o de un selector específico)
  public readEntireInterface(rootSelector?: string): void {
    const settings = this.getSettings();
    if (!settings.voiceReader) {
      return;
    }

    const rootEl = rootSelector
      ? document.querySelector(rootSelector)
      : document.querySelector('main') || document.body;

    if (!rootEl) return;

    // Recopilar texto visible evitando menús de accesibilidad y scripts
    const clone = rootEl.cloneNode(true) as HTMLElement;
    // Eliminar elementos no relevantes
    clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    clone.querySelectorAll('.accessibility-widget, .accessibility-panel').forEach(el => el.remove());

    const text = (clone.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) return;

    // Dividir en fragmentos para evitar límites de síntesis
    const chunks: string[] = [];
    const maxLen = 800; // caracteres por fragmento
    for (let i = 0; i < text.length; i += maxLen) {
      chunks.push(text.slice(i, i + maxLen));
    }

    // Cancelar cualquier lectura previa y encadenar lectura por fragmentos
    this.stopSpeaking();
    let index = 0;
    const speakNext = () => {
      if (index >= chunks.length) return;
      const utter = new SpeechSynthesisUtterance(chunks[index]);
      utter.lang = 'es-ES';
      utter.rate = 1.0;
      utter.onend = () => { index++; speakNext(); };
      utter.onerror = () => { index++; speakNext(); };
      window.speechSynthesis.speak(utter);
    };
    speakNext();
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

  // ---------- Lectura por clic ----------
  private extractTextFromElement(target: HTMLElement): string {
    if (!target) return '';

    // Evitar leer el propio widget de accesibilidad
    if (target.closest('.accessibility-widget')) return '';

    const tag = target.tagName.toLowerCase();

    // Si clickeaste un ícono (mat-icon, svg, img dentro de botón/enlace), buscar el botón/enlace padre
    if (tag === 'mat-icon' || tag === 'svg' || tag === 'path' || tag === 'img' || target.classList.contains('mat-icon')) {
      const parent = target.closest('button, a, [role="button"]') as HTMLElement | null;
      if (parent) {
        const parentText = this.getVisibleText(parent);
        if (parentText) return parentText;
      }
    }

    // Botones y enlaces: leer el texto visible directamente
    if (tag === 'button' || tag === 'a' || target.getAttribute('role') === 'button') {
      const text = this.getVisibleText(target);
      if (text) return text;
    }

    // Inputs, textareas, selects: leer el label o placeholder
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      const id = target.getAttribute('id');
      let labelText = '';
      
      // Buscar label asociado por "for"
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`) as HTMLElement | null;
        if (label) labelText = this.getVisibleText(label);
      }
      
      // Si no hay label, buscar label padre
      if (!labelText) {
        const labelParent = target.closest('label') as HTMLElement | null;
        if (labelParent) labelText = this.getVisibleText(labelParent);
      }

      // Para inputs, incluir placeholder si existe
      const inputEl = target as HTMLInputElement;
      const placeholder = inputEl.placeholder || '';
      const value = inputEl.value || '';
      
      if (tag === 'select') {
        const selectEl = target as HTMLSelectElement;
        const selectedText = selectEl.options[selectEl.selectedIndex]?.text || '';
        return [labelText, selectedText || 'Lista desplegable'].filter(Boolean).join('. ');
      }
      
      const parts = [labelText];
      if (value) parts.push(`Valor: ${value}`);
      else if (placeholder) parts.push(placeholder);
      
      return parts.filter(Boolean).join('. ') || 'Campo de texto';
    }

    // Div, span u otros: buscar el botón/enlace más cercano o leer texto directo
    const closestClickable = target.closest('button, a, [role="button"], label') as HTMLElement | null;
    if (closestClickable) {
      const text = this.getVisibleText(closestClickable);
      if (text) return text;
    }

    // Último recurso: texto visible del elemento actual
    const directText = this.getVisibleText(target);
    if (directText) return directText;

    return '';
  }

  // Extraer solo el texto visible, limpiando iconos y espacios extra
  private getVisibleText(element: HTMLElement): string {
    if (!element) return '';
    
    // Clonar para no modificar el DOM real
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Remover iconos de Material (mat-icon) y SVGs
    clone.querySelectorAll('mat-icon, svg, .mat-icon').forEach(icon => icon.remove());
    
    // Obtener texto y limpiar
    const text = (clone.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  }

  private handleDocumentClick = (event: MouseEvent) => {
    const settings = this.getSettings();
    if (!settings.voiceReader) return;
    const target = event.target as HTMLElement;
    if (!target) return;
    const text = this.extractTextFromElement(target);
    if (text) {
      // Cancelar y leer el elemento clicado
      this.stopSpeaking();
      this.speak(text);
    }
  };

  public startClickRead(): void {
    if (this.clickListenerAttached) return;
    this.boundClickHandler = this.handleDocumentClick.bind(this);
    document.addEventListener('click', this.boundClickHandler, true);
    this.clickListenerAttached = true;
  }

  public stopClickRead(): void {
    if (!this.clickListenerAttached) return;
    if (this.boundClickHandler) {
      document.removeEventListener('click', this.boundClickHandler, true);
    }
    this.clickListenerAttached = false;
  }
}
