// Import de librerias de Angular
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, type FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';

// Imports de los servicios
import { AuthService } from '../../services/auth.service';
import { SecurityService } from '../../services/security.service';
import { I18nService } from '../../services/i18n.service';
import { NotificationService } from '../../services/notification.service';

// Imports de componentes compartidos
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LanguageSelectorComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent {
  loginForm: FormGroup;
  message = "";
  messageType: "Success" | "Error" | "" = "";
  isAccountLocked = false;
  remainingLockTime = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private securityService: SecurityService,
    public i18n: I18nService,
    private notificationService: NotificationService
  ){
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]]
    })
  }

  //Funcion para mostrar mensajes de error y exito
  private showmessage(message: string, type: "Success" | "Error"): void {
    this.message = message
    this.messageType = type
  }

  //Funcion para enviar datos del login al servidor
  public onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value
      const email = credentials.email

      // Verificar si la cuenta está bloqueada
      if (this.securityService.isAccountLocked(email)) {
        this.remainingLockTime = this.securityService.getRemainingLockTime(email)
        const lockMessage = `${this.i18n.translate('login.accountLocked')} ${this.remainingLockTime} ${this.i18n.translate('login.minutes')}`
        this.showmessage(lockMessage, "Error")
        this.notificationService.error(lockMessage)
        this.isAccountLocked = true
        return
      }

      const result = this.authService.login(credentials)

      // Registrar el intento de login
      this.securityService.recordLoginAttempt(email, result.success)

      if (result.success && result.user) {
        this.showmessage(result.message, "Success")
        this.notificationService.success(this.i18n.translate('login.success'))
        setTimeout(() => {
          if (result.user!.isAdmin){
            this.router.navigate(['/admin'])
          }else{
            this.router.navigate(['/feed'])
          }
        }, 500)
      } else {
        const failedAttempts = this.securityService.getRecentFailedAttempts(email)
        let errorMsg = this.i18n.translate('login.error')
        
        if (failedAttempts > 0 && failedAttempts < 3) {
          errorMsg += ` (${3 - failedAttempts} intentos restantes)`
        }
        
        this.showmessage(errorMsg, "Error")
        this.notificationService.error(errorMsg)

        // Verificar si se bloqueó después de este intento
        if (this.securityService.isAccountLocked(email)) {
          this.remainingLockTime = this.securityService.getRemainingLockTime(email)
          const lockMessage = `${this.i18n.translate('login.accountLocked')} ${this.remainingLockTime} ${this.i18n.translate('login.minutes')}`
          this.showmessage(lockMessage, "Error")
          this.notificationService.warning(lockMessage, 8000)
          this.isAccountLocked = true
        }
      }
    } else {
      const fillFieldsMsg = this.i18n.translate('login.fillFields')
      this.showmessage(fillFieldsMsg, "Error")
      this.notificationService.warning(fillFieldsMsg)
    }
  }

  public goToRecovery(): void {
    this.router.navigate(['/password-recovery'])
  }

}
