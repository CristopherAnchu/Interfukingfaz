import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AccessibilityService, AccessibilitySettings } from '../../services/accessibility.service';

@Component({
  selector: 'app-accessibility-menu',
  imports: [CommonModule, MatIconModule],
  templateUrl: './accessibility-menu.component.html',
  styleUrl: './accessibility-menu.component.css'
})
export class AccessibilityMenuComponent implements OnInit, OnDestroy {
  isOpen = false;
  settings: AccessibilitySettings = {
    visualAlerts: true,
    voiceReader: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true
  };

  private closeModalListener: ((event: Event) => void) | null = null;

  constructor(private accessibilityService: AccessibilityService) {}

  ngOnInit(): void {
    this.accessibilityService.settings$.subscribe(
      settings => this.settings = settings
    );

    // Listener para cerrar con Escape
    this.closeModalListener = (event: Event) => {
      if (this.isOpen) {
        this.isOpen = false;
      }
    };
    document.addEventListener('closeModals', this.closeModalListener);
  }

  ngOnDestroy(): void {
    if (this.closeModalListener) {
      document.removeEventListener('closeModals', this.closeModalListener);
    }
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.accessibilityService.speak('Menú de accesibilidad abierto');
    }
  }

  toggleVisualAlerts(): void {
    this.accessibilityService.toggleVisualAlerts();
    const status = this.settings.visualAlerts ? 'activadas' : 'desactivadas';
    this.accessibilityService.speak(`Alertas visuales ${status}`);
  }

  toggleVoiceReader(): void {
    this.accessibilityService.toggleVoiceReader();
  }

  toggleHighContrast(): void {
    this.accessibilityService.toggleHighContrast();
    const status = !this.settings.highContrast ? 'activado' : 'desactivado';
    this.accessibilityService.speak(`Modo alto contraste ${status}`);
  }

  toggleLargeText(): void {
    this.accessibilityService.toggleLargeText();
    const status = !this.settings.largeText ? 'activado' : 'desactivado';
    this.accessibilityService.speak(`Texto ampliado ${status}`);
  }

  toggleKeyboardNavigation(): void {
    this.accessibilityService.toggleKeyboardNavigation();
  }
}
