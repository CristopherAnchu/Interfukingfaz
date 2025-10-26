//Importaciones de librerias de Angular
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'

//Importaciones de los servicios
import { AuthService } from '../../services/auth.service'
import { UsersService } from '../../services/users.service'
import { ValidationService } from '../../services/validation.service'

//Importaciones de las interfaces
import { UserSession } from '../../interfaces/users.interface';
import { Users } from '../../interfaces/users.interface'


@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  currentUser: UserSession | null = null
  addUserForm: FormGroup
  users: Users[] = []
  filteredUsers: Users[] = []
  searchTerm = ""
  message = ""
  messageType: "Success" | "Error" | "" = ""

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UsersService,
    private validationService: ValidationService,
  ) { this.addUserForm = this.fb.group({
      nombres: ["", [Validators.required]],
      apellidos: ["", [Validators.required]],
      cedula: ["", [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fechaNacimiento: ["", [Validators.required]], //Aqui se hizo un cambio
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]]
    })
  }

  //Funciones auxiliares privadas
  private showMessage(message: string, type: "Success" | "Error"): void {
    this.message = message
    this.messageType = type
  }

  //Filtrar los Usuarios
  private filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users]
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.nombres.toLowerCase().includes(this.searchTerm) ||
          user.apellidos.toLowerCase().includes(this.searchTerm) ||
          user.cedula.includes(this.searchTerm),
      )
    }
  }

  //Funcion para cargar los usuarios
  private loadUsers(): void {
    this.users = this.userService.getAllUsers().filter((user) => !user.isAdmin)
    this.filterUsers()
  }

  //Funcion para cargar el Usuario 
  public ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
    this.loadUsers()
  }

  //Funcion para enviar enviar los datos del formulario de agregar usuario
  public onSubmit(): void {
    if (this.addUserForm.valid) {
      const formData = this.addUserForm.value
      const result = this.userService.addUser(
        formData.email,
        formData.password,
        formData.nombres,
        formData.apellidos,
        formData.cedula,
        formData.fechaNacimiento,
        false,
      )

      if (result.success) {
        this.showMessage(result.message, "Success")
        this.addUserForm.reset()
        this.loadUsers()
      } else {
        this.showMessage(result.message, "Error")
      }
    } else {
      this.showMessage("Todos los campos son obligatorios.", "Error")
    }
  }

  //Funcion para buscar usuarios
  public onsearch(event: Event): void {
    const target = event.target as HTMLInputElement
    this.searchTerm = target.value.toLowerCase()
    this.filterUsers()
  }
  
  public EditUser(user: Users): void {
    alert(`Editar usuario: ${user.nombres} ${user.apellidos}`)
  }

  public DeleteUser(user: Users): void {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${user.nombres} ${user.apellidos}?`)) {
      const result = this.userService.DeleteUser(user.cedula)
      if (result.success) {
        this.showMessage(result.message, "Success")
        this.loadUsers()
      } else {
        this.showMessage(result.message, "Error")
      }
    }
  }

  public CalculateAge(datestring: string): number {
    return this.validationService.CalculateAge(datestring)
  }

  public logout(): void {
    this.authService.logout()
  }

}
