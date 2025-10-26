//Importaciones de librerías de angular
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

//Importaciones de los servicios
import { UsersService } from '../../services/users.service';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

//Importaciones de interfaces
import { DocumentsInterface } from '../../interfaces/documents.interface';
import { UserSession, Users } from '../../interfaces/users.interface';
import { ViewType } from '../../interfaces/ui-state.interface';

//Importaciones de los shareds
import { DocumentModelComponent } from '../../shared/document-model/document-model.component';
import { ContextMenuComponent, ContextMenuAction } from '../../shared/context-menu/context-menu.component';

@Component({
  selector: 'app-home.component',
  imports: [CommonModule, ReactiveFormsModule, DocumentModelComponent, ContextMenuComponent, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentuser: UserSession | null = null
  currentView: ViewType = "myFiles"
  documents: DocumentsInterface[] = []
  filteredDocuments: DocumentsInterface[] = []
  searchTerm: string = ""
  selectedTags: string[] = []
  allTags: string[] = []

  //Estados de las UI
  showUploadForm = false
  showTagsFilter = false
  showDocumentModal = false
  showContextMenu = false

  //Modelos y menu de contexto
  selectedDocument: DocumentsInterface | null = null
  contextMenuPosition = { x: 0, y: 0 }
  contextMenuActions: ContextMenuAction[] = [
    {label: "Propiedades", action: "properties", icon: "info"},
    {label: "Editar", action: "edit", icon: "edit"},
    {label: "Eliminar", action: "delete", icon: "delete"},
    {label: "Descargar", action: "download", icon: "download"},
  ]

  //Formularios
  uploadForm: FormGroup

  //mensajes
  message = ""
  messageType: "Success" | "Error" | "" = ""

  //Autocompletado
  showAutocomplete = false
  autocompleteUsers: Users[] = []

  //notificaciones
  newdocumentsCount = 0

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private documentService: DocumentService,
    private usersService: UsersService,
  ){
    this.uploadForm = this.fb.group({
      numero: ["", Validators.required],
      tipo: ["", Validators.required],
      asunto: ["", Validators.required],
      paraQuienEsEmail: ["", Validators.required],
      file: [null, Validators.required],
      etiquetas: ["", Validators.required],
    })
  }

  private showMessage(message: string, type: "Success" | "Error"): void {
    this.message = message
    this.messageType = type
    setTimeout(() => {
      this.message = ""
      this.messageType = ""
    }, 5000)
  }

  public ngOnInit(): void {
    this.currentuser = this.authService.getCurrentUser()
    this.loadDocuments()
    this.loadtags()
    this.updateNotifications()
  }

  @HostListener("document:click", ["$event"])
  public onDocumentClick(event: MouseEvent): void {
    this.showContextMenu = false
    this.showAutocomplete = false
  }

  //Metodo de navegacion
  public setView(view: ViewType): void {
    this.currentView = view
    this.showUploadForm = view === "uploadForm"
    this.searchTerm = ""
    this.selectedTags = []
    this.loadDocuments()
  }

  //Metodos de carga de documentos
  public loadDocuments(): void {
    if (!this.currentuser) return

    switch (this.currentView) {
      case "myFiles":
        this.documents = this.documentService.getMydocuments(this.currentuser.email)
        break
      case "receivedFiles":
        this.documents = this.documentService.getReceivedDocuments(this.currentuser.email)
        break
      case "myDrive":
        this.documents = this.documentService.getDocumentsForUser(this.currentuser.email)
        break
      default:
        this.documents = []
    }

    this.applyFilters()
  }

  //Aplicacion de filtros
  public applyFilters(): void {
    let filtered = [...this.documents]

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (doc) => 
          doc.fileName.toLowerCase().includes(term) ||
          doc.numero.toLowerCase().includes(term) ||
          doc.asunto.toLowerCase().includes(term) ||
          (doc.etiquetas && doc.etiquetas.toLowerCase().includes(term))
      )
    }

    if (this.selectedTags.length > 0) {
      filtered = filtered.filter((doc) =>{
        if (!doc.etiquetas) return false
        const doctags = doc.etiquetas
          .toLowerCase()
          .split(",")
          .map((tag) => tag.trim())
        return this.selectedTags.every((selectedTag) => doctags.includes(selectedTag.toLowerCase()))
      }) 
    }

    this.filteredDocuments = filtered
  }

  public onSearch(event: Event): void {
    const target = event.target as HTMLInputElement
    this.searchTerm = target.value
    this.applyFilters()
  }

  //Metodos para el formulario de subida
  public onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      this.uploadForm.patchValue({ file: target.files[0] })
    }
  }

  public onUploadSubmit(): void {
    if (this.uploadForm.valid && this.currentuser){
      const formData = this.uploadForm.value

      let TargetUserInfo
      if (formData.paraQuienEsEmail === "all") {
        TargetUserInfo = {
          paraquienesesDisplay: "Todos",
          paraquienesesEmailActual: "all",
        }
      } else {
        const targetUser = this.usersService.getUserByEmail(formData.paraQuienEsEmail)
        if (!targetUser) {
          this.showMessage("El correo electrónico no corresponde a un usuario registrado.", "Error")
          return
        }
        TargetUserInfo = {
          paraQuienEsDisplay: `${targetUser.nombres} ${targetUser.apellidos} (${targetUser.email})`,
          paraQuienEsEmailActual: targetUser.email,
        }
      }

      const documentData = {
        numero: formData.numero,
        tipo: formData.tipo,
        asunto: formData.asunto,
        quienSube: `${this.currentuser.nombre} ${this.currentuser.apellido} (${this.currentuser.email})`,
        quienSubeEmail: this.currentuser.email,
        paraQuienEs: TargetUserInfo.paraQuienEsDisplay,
        paraQuienEsEmail: TargetUserInfo.paraQuienEsEmailActual,
        fileName: formData.file.name,
        fileType: formData.file.type || "unknown",
        etiquetas: formData.etiquetas,
      }

      const result = this.documentService.addDocument(documentData)

      if (result.success) {
        this.showMessage("Documento agregado exitosamente.", "Success")
        this.uploadForm.reset()
        this.loadDocuments()
        this.loadtags()
      } else {
        this.showMessage(result.message, "Error")
      }
    }
  }

  //Funcion de autocompletado
  public onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement
    const searchTerm = target.value.toLowerCase()
    
    if (searchTerm.length > 0) {
      const allusers = this.usersService.getAllUsers()
      this.autocompleteUsers = allusers.filter(
        (user) =>
          !user.isAdmin &&
          user.email !== this.currentuser?.email &&
          (user.email.toLowerCase().includes(searchTerm) ||
            user.nombres.toLowerCase().includes(searchTerm) ||
            user.apellidos.toLowerCase().includes(searchTerm))
      )
      this.showAutocomplete = this.autocompleteUsers.length > 0
    } else {
      this.showAutocomplete = false
    }
  }

  public selectUser(user: Users | null): void {
    if (user) {
      this.uploadForm.patchValue({ paraQuienEsEmail: user.email })
    } else {
      this.uploadForm.patchValue({ paraQuienEsEmail: "all"})
    }
    this.showAutocomplete = false
  }

  //Acciones del documento
  public openDocument(document: DocumentsInterface): void {
    this.selectedDocument = document
    this.showDocumentModal = true
  }

  public onDocumentRightClick(event: MouseEvent, document: DocumentsInterface): void {
    event.preventDefault()
    this.selectedDocument = document
    this.contextMenuPosition = { x: event.clientX, y: event.clientY }
    this.showContextMenu = true
  }

  public onContextMenuAction(action: string): void {
    this.showContextMenu = false
    
    if (!this.selectedDocument) return

    switch (action) {
      case "properties":
        this.showDocumentModal = true
        break
      case "edit":
        alert(`Editar documento ${this.selectedDocument.id}`)
        break
      case "delete":
        this.deleteDocument(this.selectedDocument)
        break
      case "download":
        this.downloadDocument(this.selectedDocument)
        break
    }
  }

  public deleteDocument(document: DocumentsInterface): void {
    if (confirm("¿Estás seguro de que quieres eliminar este documento?")) {
      const result = this.documentService.markDocumentAsHiddenForUser(document.id, this.currentuser!.email)

      if (result.success) {
        this.showMessage(result.message, "Success")
        this.loadDocuments()
      } else {
        this.showMessage(result.message, "Error")
      }
    }
  }

  public   downloadDocument(doc: DocumentsInterface): void {
    const blob = new Blob([`Contenido simulado del archivo ${doc.fileName}`], { type: doc.fileType })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = doc.fileName

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert(`Descargando: ${doc.fileName}`)
  }

  //Metodos de filtrado
  public toggleTagsFilter(): void {
    this.showTagsFilter = !this.showTagsFilter
  }

  public loadtags(): void {
    this.allTags = this.documentService.getAllTags()
  }

  public toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag)

    if (index > -1) {
      this.selectedTags.splice(index, 1)
    } else {
      this.selectedTags.push(tag)
    }
    this.applyFilters()
  }

  public clearFilters(): void {
    this.selectedTags = []
    this.applyFilters()
  }

  //Metodos de Utilidad
  public getFileIcon(fileType: string): string {
    if (fileType.includes("image")) return "image"
    if (fileType.includes("pdf")) return "picture_as_pdf"
    if (fileType.includes("word") || fileType.includes("text")) return "description"
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "table_chart"
    if (fileType.includes("powerpoint")) return "slideshow"
    if (fileType.includes("zip") || fileType.includes("rar")) return "archive"
    return "insert_drive_file"
  }

  public getViewTitle(): string {
    switch (this.currentView) {
      case "myFiles":
        return "Mis Documentos"
      case "receivedFiles":
        return "Documentos Recibidos"
      case "myDrive":
        return "Mi Unidad"
      case "uploadForm":
        return ""
      default:
        return ""
    }
  }

  public updateNotifications(): void {
    if (!this.currentuser) return

    const receivedDocs = this.documentService.getReceivedDocuments(this.currentuser.email)
    const lastCheckTime = this.currentuser.lastDocumentCheck?.['general'] || 0

    this.newdocumentsCount = receivedDocs.filter((doc) => new Date(doc.fechaSubida).getTime() > lastCheckTime).length
  }

  public markDocumentsAsRead(): void {
    if (this.currentuser) {
      this.usersService.updateLastDocumentCheck(this.currentuser.email, "general")
      this.updateNotifications()
    }
  }

  public logout(): void {
    this.authService.logout()
  }

}
