//Importaciones de librerias de Angular
import { Component, HostListener } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'

//Importaciones de los servicios
import { AuthService } from '../../services/auth.service'
import { UsersService } from '../../services/users.service'
import { ValidationService } from '../../services/validation.service'
import { I18nService, Language } from '../../services/i18n.service'

//Importaciones de las interfaces
import { UserSession } from '../../interfaces/users.interface';
import { Users } from '../../interfaces/users.interface'


@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  currentUser: UserSession | null = null
  addUserForm: FormGroup
  editUserForm: FormGroup
  users: Users[] = []
  filteredUsers: Users[] = []
  searchTerm = ""
  message = ""
  isLanguageOpen = false
  currentLanguage: Language = 'es'
  messageType: "Success" | "Error" | "" = ""
  isEditModalOpen = false
  userToEdit: Users | null = null

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UsersService,
    private validationService: ValidationService,
    public i18n: I18nService
  ) { this.addUserForm = this.fb.group({
      nombres: ["", [Validators.required]],
      apellidos: ["", [Validators.required]],
      cedula: ["", [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fechaNacimiento: ["", [Validators.required]], //Aqui se hizo un cambio
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]]
    });

    this.editUserForm = this.fb.group({
      nombres: ["", [Validators.required]],
      apellidos: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      fechaNacimiento: ["", [Validators.required]],
      password: [""]
    });
    
    // Suscribirse al cambio de idioma
    this.i18n.language$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  //Funciones auxiliares privadas
  private showMessage(message: string, type: "Success" | "Error"): void {
    this.message = message
    this.messageType = type
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const languageSelector = document.querySelector('.language-selector-admin');
    // Solo cerrar si el click fue fuera del selector Y no es en un botón dentro del selector
    if (languageSelector && !languageSelector.contains(target) && !target.closest('.language-selector-admin')) {
      this.isLanguageOpen = false;
    }
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
    this.userToEdit = user
    this.editUserForm.patchValue({
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      fechaNacimiento: user.fechaNacimiento,
      password: ""
    })
    this.isEditModalOpen = true
  }

  public closeEditModal(): void {
    this.isEditModalOpen = false
    this.userToEdit = null
    this.editUserForm.reset()
  }

  public onSubmitEditUser(): void {
    if (!this.userToEdit) return

    if (this.editUserForm.valid) {
      const formData = this.editUserForm.value
      const result = this.userService.updateUser(
        this.userToEdit.cedula,
        formData.nombres,
        formData.apellidos,
        formData.email,
        formData.fechaNacimiento,
        formData.password || undefined
      )

      if (result.success) {
        this.showMessage(result.message, "Success")
        this.closeEditModal()
        this.loadUsers()
      } else {
        this.showMessage(result.message, "Error")
      }
    } else {
      this.showMessage("Todos los campos son obligatorios.", "Error")
    }
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

  // Métodos para cambio de idioma
  toggleLanguage(): void {
    this.isLanguageOpen = !this.isLanguageOpen;
  }

  changeLanguage(language: Language): void {
    this.i18n.setLanguage(language);
    this.isLanguageOpen = false;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage === 'es' ? 'ES' : 'EN';
  }
}
