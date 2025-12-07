import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-privacy',
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent {
  constructor(public i18n: I18nService) {}
}
