import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { I18nService, Language } from '../../services/i18n.service';

@Component({
  selector: 'app-language-selector',
  imports: [CommonModule, MatIconModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css'
})
export class LanguageSelectorComponent {
  isOpen = false;
  currentLanguage: Language = 'es';

  languages = [
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
  ];

  constructor(private i18n: I18nService) {
    this.i18n.language$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(lang: Language): void {
    this.i18n.setLanguage(lang);
    this.isOpen = false;
  }

  getCurrentLanguageName(): string {
    return this.languages.find(l => l.code === this.currentLanguage)?.name || 'Español';
  }

  getCurrentLanguageFlag(): string {
    return this.languages.find(l => l.code === this.currentLanguage)?.flag || '🇪🇸';
  }
}
