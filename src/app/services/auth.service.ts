//Imports de las librerias de Angular
import { Injectable } from "@angular/core"
import { Router } from "@angular/router"
import { BehaviorSubject } from "rxjs"

//Imports de los Servicios, componentes e interfaces
import { Users, UserSession, LoginRequest, LoginResponse } from "../interfaces/users.interface"
import { StorageService } from "./storage.service"
import { UsersService } from "./users.service"

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserSession | null>(null)
  public currectUser$ = this.currentUserSubject.asObservable()

  constructor(
    private storage: StorageService,
    private userService: UsersService,
    private router: Router,
  ) {
    const currectUser = this.storage.getCurrentUser()
    this.currentUserSubject.next(currectUser)
  }

  //Funcion para Autenticar el Usuario logeado
  public login(credentials: LoginRequest): LoginResponse {
    const user = this.userService.getUserByEmail(credentials.email)
    
    console.log("Si se estan enviando los datos")
    const usuarios = this.userService.getAllUsers()
    console.log(usuarios)

    if (user && user.password === credentials.password) {
      
      console.log("Si se estan validando los datos")

      const userSession: UserSession = {
        email: user.email,
        isAdmin: user.isAdmin,
        cedula: user.cedula,
        nombre: user.nombres,
        apellido: user.apellidos,
        lastLogin: new Date().toISOString(),
        lastDocumentCheck: user.lastDocumentCheck
      }

      this.storage.setCurrentUser(userSession)
      this.currentUserSubject.next(userSession)

      return {
        success: true,
        message: "Inicio de sesión exitoso.",
        user: userSession
      }

    }

    return {
      success: false,
      message: "Credenciales incorrectas.",
    }
  }
  
  //Funcion para cerrar sesion
  public logout(): void {
    this.storage.removeCurrentUser()
    this.currentUserSubject.next(null)
    this.router.navigate(['/login'])
  }

  // Funcion para obtener el usuario actual
  public getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value
  }

  //Funcion para verificar si el usuario esta autenticado
  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  //funcion para verificar si el usuario es admin
  public isAmin(): boolean {
    const user = this.getCurrentUser()
    return user ? user.isAdmin : false
  }

  //funcion para actualizar el usuario actual
  public updatecurrentUser(updatedData: Partial<UserSession>): void {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      const mergedUser = { ...currentUser, ...updatedData }
      this.storage.setCurrentUser(mergedUser)
      this.currentUserSubject.next(mergedUser)
    }
  }

}
