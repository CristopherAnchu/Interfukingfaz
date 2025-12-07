import { Injectable } from '@angular/core';

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

export interface AccountLock {
  email: string;
  lockedUntil: number;
  attempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos
  private readonly STORAGE_KEY = 'login-attempts';
  private readonly LOCKS_KEY = 'account-locks';

  constructor() {
    this.cleanExpiredLocks();
  }

  /**
   * Registra un intento de inicio de sesión
   */
  public recordLoginAttempt(email: string, success: boolean): void {
    const attempts = this.getLoginAttempts();
    const attempt: LoginAttempt = {
      email: email.toLowerCase(),
      timestamp: Date.now(),
      success
    };

    attempts.push(attempt);

    // Mantener solo los últimos 100 intentos
    const recentAttempts = attempts.slice(-100);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentAttempts));

    if (!success) {
      this.checkAndLockAccount(email);
    } else {
      // Limpiar bloqueo si existe y el login fue exitoso
      this.unlockAccount(email);
    }
  }

  /**
   * Verifica si una cuenta está bloqueada
   */
  public isAccountLocked(email: string): boolean {
    const locks = this.getAccountLocks();
    const lock = locks.find(l => l.email.toLowerCase() === email.toLowerCase());

    if (!lock) {
      return false;
    }

    // Verificar si el bloqueo ya expiró
    if (Date.now() >= lock.lockedUntil) {
      this.unlockAccount(email);
      return false;
    }

    return true;
  }

  /**
   * Obtiene el tiempo restante de bloqueo en minutos
   */
  public getRemainingLockTime(email: string): number {
    const locks = this.getAccountLocks();
    const lock = locks.find(l => l.email.toLowerCase() === email.toLowerCase());

    if (!lock) {
      return 0;
    }

    const remaining = lock.lockedUntil - Date.now();
    return Math.ceil(remaining / 60000); // Convertir a minutos
  }

  /**
   * Obtiene el número de intentos fallidos recientes
   */
  public getRecentFailedAttempts(email: string): number {
    const attempts = this.getLoginAttempts();
    const cutoffTime = Date.now() - this.LOCK_DURATION_MS;

    const recentFailed = attempts.filter(
      attempt =>
        attempt.email.toLowerCase() === email.toLowerCase() &&
        !attempt.success &&
        attempt.timestamp > cutoffTime
    );

    return recentFailed.length;
  }

  /**
   * Desbloquea una cuenta manualmente
   */
  public unlockAccount(email: string): void {
    const locks = this.getAccountLocks();
    const filtered = locks.filter(l => l.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(this.LOCKS_KEY, JSON.stringify(filtered));
  }

  /**
   * Limpia bloqueos expirados
   */
  private cleanExpiredLocks(): void {
    const locks = this.getAccountLocks();
    const now = Date.now();
    const active = locks.filter(lock => lock.lockedUntil > now);
    localStorage.setItem(this.LOCKS_KEY, JSON.stringify(active));
  }

  /**
   * Verifica y bloquea una cuenta si excede intentos
   */
  private checkAndLockAccount(email: string): void {
    const failedAttempts = this.getRecentFailedAttempts(email);

    if (failedAttempts >= this.MAX_ATTEMPTS) {
      const locks = this.getAccountLocks();
      const existingLock = locks.find(l => l.email.toLowerCase() === email.toLowerCase());

      const lock: AccountLock = {
        email: email.toLowerCase(),
        lockedUntil: Date.now() + this.LOCK_DURATION_MS,
        attempts: failedAttempts
      };

      if (existingLock) {
        // Actualizar bloqueo existente
        const index = locks.indexOf(existingLock);
        locks[index] = lock;
      } else {
        // Crear nuevo bloqueo
        locks.push(lock);
      }

      localStorage.setItem(this.LOCKS_KEY, JSON.stringify(locks));
    }
  }

  /**
   * Obtiene todos los intentos de login
   */
  private getLoginAttempts(): LoginAttempt[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene todos los bloqueos de cuentas
   */
  private getAccountLocks(): AccountLock[] {
    try {
      const data = localStorage.getItem(this.LOCKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Genera un token de recuperación de contraseña
   */
  public generateRecoveryToken(email: string): string {
    const token = this.generateRandomToken();
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hora

    const recovery = {
      email: email.toLowerCase(),
      token,
      expiry
    };

    localStorage.setItem(`recovery-${email.toLowerCase()}`, JSON.stringify(recovery));
    return token;
  }

  /**
   * Valida un token de recuperación
   */
  public validateRecoveryToken(email: string, token: string): boolean {
    try {
      const data = localStorage.getItem(`recovery-${email.toLowerCase()}`);
      if (!data) return false;

      const recovery = JSON.parse(data);
      return (
        recovery.token === token &&
        recovery.expiry > Date.now()
      );
    } catch {
      return false;
    }
  }

  /**
   * Genera un token aleatorio
   */
  private generateRandomToken(): string {
    return Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');
  }
}
