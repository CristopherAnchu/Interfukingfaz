import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SecurityService } from '../../services/security.service';
import { UsersService } from '../../services/users.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-password-recovery',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.css'
})
export class PasswordRecoveryComponent {
  recoveryForm: FormGroup;
  message = '';
  messageType: 'Success' | 'Error' | '' = '';
  emailSent = false;
  newPassword = '';
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private securityService: SecurityService,
    private usersService: UsersService,
    public i18n: I18nService
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private showMessage(message: string, type: 'Success' | 'Error'): void {
    this.message = message;
    this.messageType = type;
  }

  private generateSimplePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  public onSubmit(): void {
    if (this.recoveryForm.valid) {
      const email = this.recoveryForm.value.email;
      const user = this.usersService.getUserByEmail(email);

      if (user) {
        // Generar nueva contraseña temporal
        this.newPassword = this.generateSimplePassword();
        this.userEmail = email;
        
        // Actualizar la contraseña del usuario
        this.usersService.updateUserPassword(email, this.newPassword);
        
        this.emailSent = true;
        this.showMessage('Tu contraseña ha sido restablecida exitosamente', 'Success');
      } else {
        this.showMessage('No se encontró ninguna cuenta con ese correo electrónico', 'Error');
      }
    }
  }

  public copyPassword(): void {
    if (navigator.clipboard && this.newPassword) {
      navigator.clipboard.writeText(this.newPassword).then(() => {
        this.showMessage('Contraseña copiada al portapapeles', 'Success');
        setTimeout(() => {
          this.message = 'Tu contraseña ha sido restablecida exitosamente';
        }, 2000);
      });
    }
  }

  public backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
