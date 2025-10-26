// Import de librerias de Angular
import { Injectable } from '@angular/core';

// Imports de los servicios e interfaces
import { ValidationService } from './validation.service';
import { StorageService } from './storage.service';
import { Users } from '../interfaces/users.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  //contructor de la clase y llamada a la funcion para crear usuarios por defecto
  constructor(
    private validationService: ValidationService,
    private storage: StorageService,
  ) { 
    this.initdefaultUsers()
  }

  // Funcion para crear Usuarios por defecto
  private initdefaultUsers() {
    const users = this.storage.getUsers()
    if (users.length === 0) {
      console.log("Creando Usuarios por defecto")
      this.addUser("admin@uleam.edu.ec", "adminpass", "Admin", "General", "1316591443", "1980-01-01", true)
      this.addUser(
        "e1300000000@live.uleam.edu.ec",
        "userpass",
        "Usuario",
        "Prueba",
        "1300000000",
        "1990-01-01",
        false,
      )
      this.addUser(
        "e1300000001@live.uleam.edu.ec",
        "userpass2",
        "Segundo",
        "Usuario",
        "1300000001",
        "1992-02-02",
        false,
      )
    }
  }

  //Funcion para Añadir Usuario
  public addUser(
    email: string,
    password: string,
    nombres: string,
    apellidos: string,
    cedula: string,
    fechaNacimiento: string,
    isAdmin = false,
  ): { success: boolean; message: string } {

    //Verificar que los campos no esten vacios
    if (!email || !password || !nombres || !apellidos || !cedula || !fechaNacimiento) {
      console.log("Todos los campos obligatorios deben completarse.")
      return { success: false, message: "Todos los campos obligatorios deben completarse." }
    }

    //Verficar que el email sea valido
    if (!isAdmin && !this.validationService.validateEmailUleam(email, cedula)) {
      console.log("Formato de correo electrónico inválido o no coincide con la cédula esperada.")
      return { success: false, message: "Formato de correo electrónico inválido o no coincide con la cédula esperada." }
    }

    //Validar que la cedula sea valida
    if (!this.validationService.validateCedula(cedula)) {
      console.log("Número de cédula inválido (debe tener 10 dígitos numéricos).")
      return { success: false, message: "Número de cédula inválido (debe tener 10 dígitos numéricos)." }
    }

    const users = this.storage.getUsers()

    // Verficar que el usuario no exista mediante el correo
    if (users.some((user) => user.email === cedula)) {
      console.log("Ya existe un usuario con este correo electrónico.")
      return { success: false, message: "Ya existe un usuario con este correo electrónico." }
    }

    // Verificar que el usuario no exista mediante la cedula
    if (users.some((user) => user.cedula === cedula)) {
      console.log("Ya existe un usuario con este cédula.")
      return { success: false, message: "Ya existe un usuario con este cédula." }
    }

    // Crear un Nuevo Usuario
    const newUser: Users = {
      id: Math.random().toString(36).substring(2, 15),
      email: email,
      password: password,
      nombres: nombres,
      apellidos: apellidos,
      cedula: cedula,
      fechaNacimiento: fechaNacimiento,
      isAdmin: isAdmin,
      lastDocumentCheck: {}
    }

    // Guardar el Usuario en el LocalStorage
    users.push(newUser)
    this.storage.setUsers(users)
    console.log("Usuario agregado exitosamente.")
    return { success: true, message: "Usuario agregado exitosamente." }
  }

  // Funciones para Encontrar Usuario por cedula o email
  public getUserByEmail(email: string): Users | undefined {
    const users = this.storage.getUsers()
    return users.find((user) => user.email === email)
  }

  public getUserByCedula(cedula: string): Users | undefined {
    const users = this.storage.getUsers()
    return users.find((user) => user.cedula === cedula)
  }

  public getAllUsers(): Users[] {
    return this.storage.getUsers()
  }

  //Eliminar Usuario mediante la cedula
  public DeleteUser(cedula: string): {success: boolean, message: string} {
    let users = this.storage.getUsers()
    const initialUsers = users.length
    users = users.filter((user) => user.cedula !== cedula)

    if (users.length < initialUsers){
      this.storage.setUsers(users)
      return {success: true, message: "Usuario eliminado exitosamente."}
    }

    return {success: false, message: "No se pudo eliminar el usuario."}
  }

  //Funcion para actualizar el Ultimo documento Verificado
  updateLastDocumentCheck(userEmail: string, senderKey = "general"): void {
    const users = this.storage.getUsers()
    const userIndex = users.findIndex((user) => user.email === userEmail)

    if (userIndex !== -1) {
      const now = Date.now()
      if (!users[userIndex].lastDocumentCheck) {
        users[userIndex].lastDocumentCheck = {}
      }
      users[userIndex].lastDocumentCheck[senderKey] = now
      this.storage.setUsers(users)
    }
  }

}
