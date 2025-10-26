//Importaciones de librerias de Angular
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

//Importaciones de los servicios
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  if (authService.isAuthenticated()) {
    return true;
  }

  console.log("Acceso denegado. Debes iniciar sesión para ver esta página.")
  router.navigate(["/login"])
  return false;
};
