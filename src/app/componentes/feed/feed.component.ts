import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { UsersService } from '../../services/users.service';
import { DocumentService } from '../../services/document.service';
import { I18nService, Language } from '../../services/i18n.service';

import { Project, ProjectPost } from '../../interfaces/projects.interface';
import { UserSession, Users } from '../../interfaces/users.interface';
import { DocumentsInterface } from '../../interfaces/documents.interface';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {
  currentUser: UserSession | null = null;
  projects: Project[] = [];
  posts: ProjectPost[] = [];
  users: Users[] = [];
  filteredUsers: Users[] = [];
  
  activeTab: 'feed' | 'projects' | 'users' = 'feed';
  showCreateProjectModal = false;
  showCreatePostModal = false;
  isLanguageOpen = false;
  currentLanguage: Language = 'es';
  
  createProjectForm: FormGroup;
  createPostForm: FormGroup;
  commentForm: FormGroup;
  searchTerm = '';
  filteredProjects: Project[] = [];
  
  selectedPostForComment: ProjectPost | null = null;
  showCommentBox: { [postId: string]: boolean } = {};
  
  message = '';
  messageType: 'Success' | 'Error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private projectService: ProjectService,
    private usersService: UsersService,
    private documentService: DocumentService,
    private router: Router,
    public i18n: I18nService
  ) {
    this.createProjectForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      etiquetas: [''],
      visibilidad: ['publico', Validators.required]
    });

    this.createPostForm = this.fb.group({
      projectId: ['', Validators.required],
      contenido: ['', Validators.required]
    });

    this.commentForm = this.fb.group({
      contenido: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
    
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

  private loadData(): void {
    this.projects = this.projectService.getPublicProjects();
    this.filteredProjects = this.projects;
    this.posts = this.projectService.getAllPosts();
    this.users = this.usersService.getAllUsers().filter(u => !u.isAdmin && u.email !== this.currentUser?.email);
    this.filteredUsers = this.users;
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = searchTerm;

    switch (this.activeTab) {
      case 'projects':
        this.filteredProjects = this.projects.filter(project =>
          project.nombre.toLowerCase().includes(searchTerm) ||
          project.descripcion.toLowerCase().includes(searchTerm) ||
          project.etiquetas?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        break;
      case 'users':
        this.filteredUsers = this.users.filter(user =>
          user.nombres.toLowerCase().includes(searchTerm) ||
          user.apellidos.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
        break;
      default:
        // Para el feed, podrías filtrar los posts si lo deseas
        break;
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

  public setActiveTab(tab: 'feed' | 'projects' | 'users'): void {
    this.activeTab = tab;
    this.searchTerm = '';
    switch (tab) {
      case 'projects':
        this.filteredProjects = this.projects;
        break;
      case 'users':
        this.filteredUsers = this.users;
        break;
    }
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
        this.loadData();
      } else {
        this.showMessage(result.message, 'Error');
      }
    }
  }

  public openCreatePostModal(): void {
    this.showCreatePostModal = true;
  }

  public closeCreatePostModal(): void {
    this.showCreatePostModal = false;
    this.createPostForm.reset();
  }

  public onCreatePost(): void {
    if (this.createPostForm.valid && this.currentUser) {
      const formData = this.createPostForm.value;
      
      const result = this.projectService.createPost(
        formData.projectId,
        this.currentUser.email,
        `${this.currentUser.nombre} ${this.currentUser.apellido}`,
        formData.contenido
      );

      if (result.success) {
        this.showMessage('Publicación creada exitosamente', 'Success');
        this.closeCreatePostModal();
        this.loadData();
      } else {
        this.showMessage(result.message, 'Error');
      }
    }
  }

  public toggleLike(post: ProjectPost): void {
    if (this.currentUser) {
      this.projectService.toggleLike(post.id, this.currentUser.email);
      this.loadData();
    }
  }

  public hasLiked(post: ProjectPost): boolean {
    return this.currentUser ? post.likes.includes(this.currentUser.email) : false;
  }

  public getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.nombre : 'Proyecto desconocido';
  }

  public getTimeSince(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
    return date.toLocaleDateString();
  }

  public viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  public toggleCommentBox(postId: string): void {
    this.showCommentBox[postId] = !this.showCommentBox[postId];
    if (!this.showCommentBox[postId]) {
      this.commentForm.reset();
    }
  }

  public addComment(post: ProjectPost): void {
    if (this.commentForm.valid && this.currentUser) {
      const contenido = this.commentForm.value.contenido;
      
      this.projectService.addComment(
        post.id,
        this.currentUser.email,
        `${this.currentUser.nombre} ${this.currentUser.apellido}`,
        contenido
      );
      
      this.commentForm.reset();
      this.showCommentBox[post.id] = false;
      this.loadData();
    }
  }

  public getDocument(documentId: string): DocumentsInterface | undefined {
    return this.documentService.getDocumentbyId(documentId);
  }

  public downloadDocument(documentId: string): void {
    const doc = this.getDocument(documentId);
    if (doc) {
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
