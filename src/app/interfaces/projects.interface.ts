export interface Project {
    id: string;
    nombre: string;
    descripcion: string;
    creadorEmail: string;
    creadorNombre: string;
    fechaCreacion: string;
    colaboradores: ProjectCollaborator[];
    documentos: string[]; // IDs de documentos asociados
    etiquetas: string[];
    estado: 'activo' | 'archivado' | 'completado';
    visibilidad: 'publico' | 'privado';
}

export interface ProjectCollaborator {
    email: string;
    nombre: string;
    apellido: string;
    rol: 'owner' | 'admin' | 'editor' | 'viewer';
    fechaUnion: string;
}

export interface ProjectPost {
    id: string;
    projectId: string;
    autorEmail: string;
    autorNombre: string;
    contenido: string;
    fechaPublicacion: string;
    likes: string[]; // emails de usuarios que dieron like
    comentarios: ProjectComment[];
    documentId?: string; // ID del documento adjunto (opcional)
}

export interface ProjectComment {
    id: string;
    autorEmail: string;
    autorNombre: string;
    contenido: string;
    fechaPublicacion: string;
}

export interface UserProfile {
    email: string;
    nombres: string;
    apellidos: string;
    bio?: string;
    avatar?: string;
    habilidades: string[];
    proyectosCreados: number;
    proyectosColaborando: number;
}
