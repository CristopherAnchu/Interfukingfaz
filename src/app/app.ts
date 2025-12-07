import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationToastComponent } from './shared/notification-toast/notification-toast.component';
import { AccessibilityMenuComponent } from './shared/accessibility-menu/accessibility-menu.component';
import { KeyboardService } from './services/keyboard.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NotificationToastComponent, AccessibilityMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'Sistema de Gestión Documental';

  constructor(private keyboardService: KeyboardService) {}

  ngOnInit(): void {
    // El servicio de teclado se inicializa automáticamente
  }
}
