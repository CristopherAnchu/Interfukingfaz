import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  //funcion para validar el cedula
  public validateCedula(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)){
      return false
    }
    
    const provincia = Number.parseInt(cedula.substring(0, 2), 10)
    if (provincia < 1 || provincia > 24){
      return false
    }

    const digitoVerificador = Number.parseInt(cedula.charAt(9), 10)
    let sum = 0

    for (let i = 0; i < 9; i++) {
      let digit = Number.parseInt(cedula.charAt(i), 10)
      if (i % 2 === 0) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }

      }
      sum += digit
    }

  const expectedDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10)
  return expectedDigit === digitoVerificador
  }

  //Funcion para validar el email
  public validateEmailUleam(email:string, cedula:string): boolean {
    const regex = new RegExp(`^e${cedula}\\@live\\.uleam\\.edu\\.ec$`)
    return regex.test(email)
  }

  //Calcular la Edad mediante la fecha de nacimiento
  public CalculateAge(datestring: string): number {
    const birthday = new Date(datestring);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  }
}
