import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Project, ProjectCollaborator, ProjectPost, ProjectComment } from '../interfaces/projects.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private storage: StorageService) {
    this.initDefaultProjects();
  }

  private initDefaultProjects(): void {
    // No crear proyectos por defecto - los usuarios crearán los suyos
  }

  public createProject(
    nombre: string,
    descripcion: string,
    creadorEmail: string,
    creadorNombre: string,
    etiquetas: string[],
    visibilidad: 'publico' | 'privado'
  ): { success: boolean; message: string; project?: Project } {
    
    if (!nombre || !descripcion || !creadorEmail) {
      return { success: false, message: "Todos los campos son obligatorios" };
    }

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 15),
      nombre,
      descripcion,
      creadorEmail,
      creadorNombre,
      fechaCreacion: new Date().toISOString(),
      colaboradores: [{
        email: creadorEmail,
        nombre: creadorNombre.split(' ')[0],
        apellido: creadorNombre.split(' ')[1] || '',
        rol: 'owner',
        fechaUnion: new Date().toISOString()
      }],
      documentos: [],
      etiquetas,
      estado: 'activo',
      visibilidad
    };

    const projects = this.storage.getProjects();
    projects.push(newProject);
    this.storage.setProjects(projects);

    return { success: true, message: "Proyecto creado exitosamente", project: newProject };
  }

  public getAllProjects(): Project[] {
    return this.storage.getProjects();
  }

  public getPublicProjects(): Project[] {
    return this.storage.getProjects().filter(p => p.visibilidad === 'publico' && p.estado === 'activo');
  }

  public getUserProjects(userEmail: string): Project[] {
    return this.storage.getProjects().filter((p: Project) => 
      p.creadorEmail === userEmail || 
      p.colaboradores.some((c: ProjectCollaborator) => c.email === userEmail)
    );
  }

  public getProjectById(projectId: string): Project | undefined {
    return this.storage.getProjects().find(p => p.id === projectId);
  }

  public addCollaborator(
    projectId: string,
    collaboratorEmail: string,
    collaboratorNombre: string,
    collaboratorApellido: string,
    rol: 'admin' | 'editor' | 'viewer'
  ): { success: boolean; message: string } {
    const projects = this.storage.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return { success: false, message: "Proyecto no encontrado" };
    }

    const project = projects[projectIndex];

    if (project.colaboradores.some((c: ProjectCollaborator) => c.email === collaboratorEmail)) {
      return { success: false, message: "El usuario ya es colaborador" };
    }

    const newCollaborator: ProjectCollaborator = {
      email: collaboratorEmail,
      nombre: collaboratorNombre,
      apellido: collaboratorApellido,
      rol,
      fechaUnion: new Date().toISOString()
    };

    project.colaboradores.push(newCollaborator);
    this.storage.setProjects(projects);

    return { success: true, message: "Colaborador agregado exitosamente" };
  }

  public removeCollaborator(projectId: string, collaboratorEmail: string): { success: boolean; message: string } {
    const projects = this.storage.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return { success: false, message: "Proyecto no encontrado" };
    }

    const project = projects[projectIndex];
    project.colaboradores = project.colaboradores.filter((c: ProjectCollaborator) => c.email !== collaboratorEmail);
    
    this.storage.setProjects(projects);
    return { success: true, message: "Colaborador eliminado exitosamente" };
  }

  public addDocumentToProject(projectId: string, documentId: string): { success: boolean; message: string } {
    const projects = this.storage.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return { success: false, message: "Proyecto no encontrado" };
    }

    if (!projects[projectIndex].documentos.includes(documentId)) {
      projects[projectIndex].documentos.push(documentId);
      this.storage.setProjects(projects);
    }

    return { success: true, message: "Documento agregado al proyecto" };
  }

  public updateProject(projectId: string, updates: Partial<Project>): { success: boolean; message: string } {
    const projects = this.storage.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return { success: false, message: "Proyecto no encontrado" };
    }

    projects[projectIndex] = { ...projects[projectIndex], ...updates };
    this.storage.setProjects(projects);

    return { success: true, message: "Proyecto actualizado exitosamente" };
  }

  public deleteProject(projectId: string): { success: boolean; message: string } {
    let projects = this.storage.getProjects();
    const initialLength = projects.length;
    projects = projects.filter(p => p.id !== projectId);

    if (projects.length < initialLength) {
      this.storage.setProjects(projects);
      return { success: true, message: "Proyecto eliminado exitosamente" };
    }

    return { success: false, message: "No se pudo eliminar el proyecto" };
  }

  // Posts del feed
  public createPost(
    projectId: string,
    autorEmail: string,
    autorNombre: string,
    contenido: string,
    documentId?: string
  ): { success: boolean; message: string } {
    const newPost: ProjectPost = {
      id: Math.random().toString(36).substring(2, 15),
      projectId,
      autorEmail,
      autorNombre,
      contenido,
      fechaPublicacion: new Date().toISOString(),
      likes: [],
      comentarios: [],
      documentId
    };

    const posts = this.storage.getPosts();
    posts.push(newPost);
    this.storage.setPosts(posts);

    return { success: true, message: "Publicación creada exitosamente" };
  }

  public getAllPosts(): ProjectPost[] {
    return this.storage.getPosts().sort((a, b) => 
      new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
    );
  }

  public toggleLike(postId: string, userEmail: string): void {
    const posts = this.storage.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
      const post = posts[postIndex];
      const likeIndex = post.likes.indexOf(userEmail);

      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push(userEmail);
      }

      this.storage.setPosts(posts);
    }
  }

  public addComment(postId: string, autorEmail: string, autorNombre: string, contenido: string): void {
    const posts = this.storage.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
      const newComment: ProjectComment = {
        id: Math.random().toString(36).substring(2, 15),
        autorEmail,
        autorNombre,
        contenido,
        fechaPublicacion: new Date().toISOString()
      };

      posts[postIndex].comentarios.push(newComment);
      this.storage.setPosts(posts);
    }
  }
}
