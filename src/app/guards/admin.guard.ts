//Importaciones de librerias de Angular
import { CanActivateFn, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

//Importaciones de los servicios
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  if (authService.isAmin()) {
    return true;
  }
  
  console.log("Acceso denegado. Debes ser un administrador para ver esta página.")
  router.navigate(["/login"])
  return false;
};
