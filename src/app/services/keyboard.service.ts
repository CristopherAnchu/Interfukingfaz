import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AccessibilityService } from './accessibility.service';

export interface KeyboardShortcut {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private shortcutTriggered = new Subject<string>();
  public shortcutTriggered$ = this.shortcutTriggered.asObservable();
  private listenerAttached = false;
  private boundHandleKeyPress: ((event: KeyboardEvent) => void) | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private accessibilityService: AccessibilityService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeGlobalListener();
      this.registerDefaultShortcuts();
    }
  }

  private initializeGlobalListener(): void {
    if (this.listenerAttached) {
      return;
    }

    this.boundHandleKeyPress = (event: KeyboardEvent) => this.handleKeyPress(event);
    document.addEventListener('keydown', this.boundHandleKeyPress, true);
    this.listenerAttached = true;
  }

  private handleKeyPress(event: KeyboardEvent): void {
    // Verificar si la navegación por teclado está habilitada
    const settings = this.accessibilityService.getSettings();
    if (!settings.keyboardNavigation) {
      return;
    }

    // Ignorar si está escribiendo en campos editables
    const target = event.target as HTMLElement;
    const isEditable = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable ||
                      target.getAttribute('contenteditable') === 'true';
    
    if (isEditable) {
      return;
    }

    const key = this.generateKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      try {
        shortcut.action();
        this.shortcutTriggered.next(shortcut.description);
        this.accessibilityService.speak(shortcut.description);
      } catch (error) {
        console.error('Error executing shortcut:', error);
      }
    }
  }

  private generateKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    
    // Normalizar la tecla
    const key = event.key.toLowerCase();
    parts.push(key);
    
    return parts.join('+');
  }

  public registerShortcut(shortcut: KeyboardShortcut): void {
    if (!shortcut || !shortcut.key || !shortcut.action) {
      console.error('Invalid shortcut configuration');
      return;
    }
    const key = this.generateShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  private generateShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.altKey) parts.push('alt');
    if (shortcut.shiftKey) parts.push('shift');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  public unregisterShortcut(shortcut: KeyboardShortcut): void {
    const key = this.generateShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  public getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  public destroy(): void {
    if (this.boundHandleKeyPress && this.listenerAttached) {
      document.removeEventListener('keydown', this.boundHandleKeyPress, true);
      this.listenerAttached = false;
    }
    this.shortcuts.clear();
  }

  public isEnabled(): boolean {
    return this.accessibilityService.getSettings().keyboardNavigation;
  }

  private registerDefaultShortcuts(): void {
    // Alt + F - Ir a Feed (página principal)
    this.registerShortcut({
      key: 'f',
      altKey: true,
      action: () => {
        this.router.navigate(['/feed']);
      },
      description: 'Ir a Feed'
    });

    // Alt + P - Ir a Perfil
    this.registerShortcut({
      key: 'p',
      altKey: true,
      action: () => {
        this.router.navigate(['/profile']);
      },
      description: 'Ir a Perfil'
    });

    // Escape - Cerrar modales/menús
    this.registerShortcut({
      key: 'escape',
      action: () => {
        const event = new CustomEvent('closeModals');
        document.dispatchEvent(event);
        
        // Cerrar menú de accesibilidad si está abierto
        const accessibilityPanel = document.querySelector('.accessibility-panel');
        if (accessibilityPanel) {
          const closeBtn = accessibilityPanel.querySelector('.close-btn') as HTMLButtonElement;
          if (closeBtn) {
            closeBtn.click();
          }
        }
      },
      description: 'Cerrar menús'
    });

    // Ctrl + / - Mostrar ayuda de atajos
    this.registerShortcut({
      key: '/',
      ctrlKey: true,
      action: () => {
        const accessibilityBtn = document.querySelector('.accessibility-trigger') as HTMLButtonElement;
        if (accessibilityBtn) {
          accessibilityBtn.click();
          setTimeout(() => {
            const shortcutsSection = document.querySelector('.keyboard-shortcuts');
            if (shortcutsSection) {
              shortcutsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      },
      description: 'Mostrar ayuda de atajos'
    });
  }
}
