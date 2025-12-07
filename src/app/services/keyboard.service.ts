import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeGlobalListener();
      this.registerDefaultShortcuts();
    }
  }

  private initializeGlobalListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyPress(event);
    });
  }

  private handleKeyPress(event: KeyboardEvent): void {
    // Ignorar si está escribiendo en un input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = this.generateKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
      this.shortcutTriggered.next(shortcut.description);
    }
  }

  private generateKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  public registerShortcut(shortcut: KeyboardShortcut): void {
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

  private registerDefaultShortcuts(): void {
    // Alt + H - Ir a Home
    this.registerShortcut({
      key: 'h',
      altKey: true,
      action: () => this.router.navigate(['/home']),
      description: 'Ir a Inicio'
    });

    // Alt + F - Ir a Feed
    this.registerShortcut({
      key: 'f',
      altKey: true,
      action: () => this.router.navigate(['/feed']),
      description: 'Ir a Feed'
    });

    // Alt + P - Ir a Perfil
    this.registerShortcut({
      key: 'p',
      altKey: true,
      action: () => this.router.navigate(['/profile']),
      description: 'Ir a Perfil'
    });

    // Alt + A - Toggle menú de accesibilidad
    this.registerShortcut({
      key: 'a',
      altKey: true,
      action: () => {
        const accessibilityBtn = document.querySelector('.accessibility-trigger') as HTMLButtonElement;
        if (accessibilityBtn) accessibilityBtn.click();
      },
      description: 'Abrir Accesibilidad'
    });

    // Alt + L - Toggle selector de idioma
    this.registerShortcut({
      key: 'l',
      altKey: true,
      action: () => {
        const langBtn = document.querySelector('.language-trigger') as HTMLButtonElement;
        if (langBtn) langBtn.click();
      },
      description: 'Cambiar Idioma'
    });

    // Escape - Cerrar modales/menús
    this.registerShortcut({
      key: 'escape',
      action: () => {
        // Emitir evento para cerrar modales
        const event = new CustomEvent('closeModals');
        document.dispatchEvent(event);
      },
      description: 'Cerrar Modal'
    });

    // Ctrl + K - Búsqueda rápida
    this.registerShortcut({
      key: 'k',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      },
      description: 'Búsqueda Rápida'
    });
  }
}
