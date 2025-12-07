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

  public onSubmit(): void {
    if (this.recoveryForm.valid) {
      const email = this.recoveryForm.value.email;
      const user = this.usersService.getUserByEmail(email);

      if (user) {
        // Generar token de recuperación
        const token = this.securityService.generateRecoveryToken(email);
        
        // En un entorno real, aquí se enviaría un email
        console.log(`Recovery token for ${email}: ${token}`);
        console.log(`Recovery link: /reset-password?email=${email}&token=${token}`);
        
        this.emailSent = true;
        this.showMessage(this.i18n.translate('recovery.success'), 'Success');
      } else {
        this.showMessage(this.i18n.translate('recovery.error'), 'Error');
      }
    }
  }

  public backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
