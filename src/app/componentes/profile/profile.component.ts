import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { DocumentService } from '../../services/document.service';
import { UsersService } from '../../services/users.service';
import { I18nService, Language } from '../../services/i18n.service';

import { Project } from '../../interfaces/projects.interface';
import { UserSession, Users } from '../../interfaces/users.interface';
import { DocumentsInterface } from '../../interfaces/documents.interface';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUser: UserSession | null = null;
  userProjects: Project[] = [];
  selectedProject: Project | null = null;
  projectDocuments: DocumentsInterface[] = [];
  
  activeTab: 'projects' | 'documents' = 'projects';
  showCreateProjectModal = false;
  showAddCollaboratorModal = false;
  showUploadDocumentModal = false;
  isLanguageOpen = false;
  currentLanguage: Language = 'es';
  
  createProjectForm: FormGroup;
  addCollaboratorForm: FormGroup;
  uploadDocumentForm: FormGroup;
  
  allUsers: Users[] = [];
  autocompleteUsers: Users[] = [];
  showAutocomplete = false;
  
  message = '';
  messageType: 'Success' | 'Error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private projectService: ProjectService,
    private documentService: DocumentService,
    private usersService: UsersService,
    private router: Router,
    public i18n: I18nService
  ) {
    this.createProjectForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      etiquetas: [''],
      visibilidad: ['publico', Validators.required]
    });

    this.addCollaboratorForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.uploadDocumentForm = this.fb.group({
      numero: ['', Validators.required],
      tipo: ['', Validators.required],
      asunto: ['', Validators.required],
      file: [null, Validators.required],
      etiquetas: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProjects();
    this.allUsers = this.usersService.getAllUsers().filter(u => !u.isAdmin && u.email !== this.currentUser?.email);
    
    // Suscribirse al cambio de idioma
    this.i18n.language$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const languageSelector = document.querySelector('.language-selector');
    // Solo cerrar si el click fue fuera del selector Y no es en un botón dentro del selector
    if (languageSelector && !languageSelector.contains(target) && !target.closest('.language-selector')) {
      this.isLanguageOpen = false;
    }
  }

  private loadUserProjects(): void {
    if (this.currentUser) {
      this.userProjects = this.projectService.getUserProjects(this.currentUser.email);
    }
  }

  private loadProjectDocuments(): void {
    if (this.selectedProject) {
      this.projectDocuments = this.selectedProject.documentos
        .map(docId => this.documentService.getDocumentbyId(docId))
        .filter(doc => doc !== undefined) as DocumentsInterface[];
    }
  }

  private showMessage(message: string, type: 'Success' | 'Error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  public selectProject(project: Project): void {
    this.selectedProject = project;
    this.activeTab = 'documents';
    this.loadProjectDocuments();
  }

  public backToProjects(): void {
    this.selectedProject = null;
    this.activeTab = 'projects';
  }

  public openCreateProjectModal(): void {
    this.showCreateProjectModal = true;
  }

  public closeCreateProjectModal(): void {
    this.showCreateProjectModal = false;
    this.createProjectForm.reset({ visibilidad: 'publico' });
  }

  public onCreateProject(): void {
    if (this.createProjectForm.valid && this.currentUser) {
      const formData = this.createProjectForm.value;
      const etiquetas = formData.etiquetas ? formData.etiquetas.split(',').map((t: string) => t.trim()) : [];
      
      const result = this.projectService.createProject(
        formData.nombre,
        formData.descripcion,
        this.currentUser.email,
        `${this.currentUser.nombre} ${this.currentUser.apellido}`,
        etiquetas,
        formData.visibilidad
      );

      if (result.success) {
        this.showMessage('Proyecto creado exitosamente', 'Success');
        this.closeCreateProjectModal();
        this.loadUserProjects();
      } else {
        this.showMessage(result.message, 'Error');
      }
    }
  }

  public openAddCollaboratorModal(): void {
    this.showAddCollaboratorModal = true;
  }

  public closeAddCollaboratorModal(): void {
    this.showAddCollaboratorModal = false;
    this.addCollaboratorForm.reset();
    this.showAutocomplete = false;
  }

  public onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();
    
    if (searchTerm.length > 0) {
      this.autocompleteUsers = this.allUsers.filter(user =>
        user.email.toLowerCase().includes(searchTerm) ||
        user.nombres.toLowerCase().includes(searchTerm) ||
        user.apellidos.toLowerCase().includes(searchTerm)
      );
      this.showAutocomplete = this.autocompleteUsers.length > 0;
    } else {
      this.showAutocomplete = false;
    }
  }

  public selectUser(user: Users): void {
    this.addCollaboratorForm.patchValue({ email: user.email });
    this.showAutocomplete = false;
  }

  public onAddCollaborator(): void {
    if (this.addCollaboratorForm.valid && this.selectedProject) {
      const email = this.addCollaboratorForm.value.email;
      const user = this.usersService.getUserByEmail(email);

      if (!user) {
        this.showMessage('Usuario no encontrado', 'Error');
        return;
      }

      const result = this.projectService.addCollaborator(
        this.selectedProject.id,
        user.email,
        user.nombres,
        user.apellidos,
        'editor'
      );

      if (result.success) {
        this.showMessage('Colaborador agregado exitosamente', 'Success');
        this.closeAddCollaboratorModal();
        this.loadUserProjects();
        if (this.selectedProject) {
          this.selectedProject = this.projectService.getProjectById(this.selectedProject.id) || null;
        }
      } else {
        this.showMessage(result.message, 'Error');
      }
    }
  }

  public removeCollaborator(collaboratorEmail: string): void {
    if (this.selectedProject && confirm('¿Estás seguro de eliminar este colaborador?')) {
      const result = this.projectService.removeCollaborator(this.selectedProject.id, collaboratorEmail);
      
      if (result.success) {
        this.showMessage('Colaborador eliminado', 'Success');
        this.loadUserProjects();
        if (this.selectedProject) {
          this.selectedProject = this.projectService.getProjectById(this.selectedProject.id) || null;
        }
      } else {
        this.showMessage(result.message, 'Error');
      }
    }
  }

  public openUploadDocumentModal(): void {
    this.showUploadDocumentModal = true;
  }

  public closeUploadDocumentModal(): void {
    this.showUploadDocumentModal = false;
    this.uploadDocumentForm.reset();
  }

  public onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.uploadDocumentForm.patchValue({ file: target.files[0] });
    }
  }

  public onUploadDocument(): void {
    if (this.uploadDocumentForm.valid && this.currentUser && this.selectedProject) {
      const formData = this.uploadDocumentForm.value;

      const documentData = {
        numero: formData.numero,
        tipo: formData.tipo,
        asunto: formData.asunto,
        quienSube: `${this.currentUser.nombre} ${this.currentUser.apellido} (${this.currentUser.email})`,
        quienSubeEmail: this.currentUser.email,
        paraQuienEs: this.selectedProject.nombre,
        paraQuienEsEmail: this.selectedProject.id,
        fileName: formData.file.name,
        fileType: formData.file.type || 'unknown',
        etiquetas: formData.etiquetas,
      };

      const result = this.documentService.addDocument(documentData);

      if (result.success && result.document) {
        this.projectService.addDocumentToProject(this.selectedProject.id, result.document.id);
        this.showMessage('Documento agregado exitosamente', 'Success');
        this.closeUploadDocumentModal();
        this.loadProjectDocuments();
      } else {
        this.showMessage(result.message, 'Error');
      }
    }
  }

  public getFileIcon(fileType: string): string {
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('word') || fileType.includes('text')) return 'description';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
    if (fileType.includes('powerpoint')) return 'slideshow';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'archive';
    return 'insert_drive_file';
  }

  public downloadDocument(doc: DocumentsInterface): void {
    const blob = new Blob([`Contenido simulado del archivo ${doc.fileName}`], { type: doc.fileType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public isProjectOwner(): boolean {
    return this.selectedProject?.creadorEmail === this.currentUser?.email;
  }

  public goToFeed(): void {
    this.router.navigate(['/feed']);
  }

  public logout(): void {
    this.authService.logout();
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
