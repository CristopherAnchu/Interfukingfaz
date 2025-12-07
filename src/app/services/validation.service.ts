import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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

  // Validadores personalizados para formularios

  /**
   * Validador de cédula ecuatoriana
   */
  public cedulaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isValid = this.validateCedula(control.value);
      return isValid ? null : { invalidCedula: true };
    };
  }

  /**
   * Validador de email ULEAM
   */
  public emailUleamValidator(cedulaControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !cedulaControl.value) {
        return null;
      }
      const isValid = this.validateEmailUleam(control.value, cedulaControl.value);
      return isValid ? null : { invalidEmailUleam: true };
    };
  }

  /**
   * Validador de contraseña fuerte
   */
  public strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const value = control.value;
      
      // Mínimo 8 caracteres
      if (value.length < 8) {
        return { weakPassword: { message: 'Mínimo 8 caracteres' } };
      }
      
      // Al menos una mayúscula
      if (!/[A-Z]/.test(value)) {
        return { weakPassword: { message: 'Debe incluir al menos una mayúscula' } };
      }
      
      // Al menos una minúscula
      if (!/[a-z]/.test(value)) {
        return { weakPassword: { message: 'Debe incluir al menos una minúscula' } };
      }
      
      // Al menos un número
      if (!/[0-9]/.test(value)) {
        return { weakPassword: { message: 'Debe incluir al menos un número' } };
      }
      
      return null;
    };
  }

  /**
   * Validador de edad mínima
   */
  public minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const age = this.CalculateAge(control.value);
      return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
    };
  }

  /**
   * Validador de tipos de archivo permitidos
   */
  public fileTypeValidator(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const file = control.value as File;
      const fileType = file.type || '';
      const fileName = file.name || '';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      const isValidType = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.substring(1);
        }
        return fileType.includes(type);
      });
      
      return isValidType ? null : { invalidFileType: { allowed: allowedTypes } };
    };
  }

  /**
   * Validador de tamaño máximo de archivo
   */
  public maxFileSizeValidator(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const file = control.value as File;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      return file.size <= maxSizeInBytes 
        ? null 
        : { maxFileSize: { max: maxSizeInMB, actual: (file.size / 1024 / 1024).toFixed(2) } };
    };
  }

  /**
   * Validador de caracteres especiales no permitidos
   */
  public noSpecialCharsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const hasSpecialChars = /[<>\/\\{}[\]~`]/.test(control.value);
      return hasSpecialChars ? { specialChars: true } : null;
    };
  }

  /**
   * Validador de solo letras (para nombres)
   */
  public lettersOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(control.value);
      return isValid ? null : { lettersOnly: true };
    };
  }

  /**
   * Validador de rango de fechas
   */
  public dateRangeValidator(minDate?: Date, maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const date = new Date(control.value);
      
      if (minDate && date < minDate) {
        return { dateRange: { message: `Fecha mínima: ${minDate.toLocaleDateString()}` } };
      }
      
      if (maxDate && date > maxDate) {
        return { dateRange: { message: `Fecha máxima: ${maxDate.toLocaleDateString()}` } };
      }
      
      return null;
    };
  }

  /**
   * Sanitiza una cadena para prevenir XSS
   */
  public sanitizeString(value: string): string {
    if (!value) return '';
    
    return value
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Valida un número de documento
   */
  public validateDocumentNumber(docNumber: string): boolean {
    // Formato: XXX-XXXX-XXXX o similar
    return /^[\w\-\/]+$/.test(docNumber) && docNumber.length >= 3 && docNumber.length <= 50;
  }
}
