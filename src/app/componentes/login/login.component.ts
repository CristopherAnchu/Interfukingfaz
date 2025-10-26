// Import de librerias de Angular
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, type FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

// Imports de los servicios
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  message = "";
  messageType: "Success" | "Error" | "" = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
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
      const result = this.authService.login(credentials)

      if (result.success && result.user) {
        this.showmessage(result.message, "Success")
        setTimeout(() => {
          if (result.user!.isAdmin){
            this.router.navigate(['/admin'])
          }else{
            this.router.navigate(['/home'])
          }
        }, 500)
      } else {
        this.showmessage(result.message, "Error")
      }
    } else {
      this.showmessage("Por favor, rellene todos los campos", "Error")
    }
  }

}
