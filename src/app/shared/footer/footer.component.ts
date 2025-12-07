import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(public i18n: I18nService) {}
}
