import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage = new BehaviorSubject<Language>('es');
  public language$ = this.currentLanguage.asObservable();

  private translations: Translations = {
    // Login
    'login.title': { es: 'Inicio de sesión', en: 'Login' },
    'login.email': { es: 'Correo electrónico', en: 'Email' },
    'login.password': { es: 'Contraseña', en: 'Password' },
    'login.submit': { es: 'Iniciar sesión', en: 'Sign in' },
    'login.forgotPassword': { es: '¿Olvidaste tu contraseña?', en: 'Forgot your password?' },
    'login.success': { es: 'Inicio de sesión exitoso', en: 'Login successful' },
    'login.error': { es: 'Credenciales incorrectas', en: 'Incorrect credentials' },
    'login.fillFields': { es: 'Por favor, rellene todos los campos', en: 'Please fill all fields' },
    'login.accountLocked': { es: 'Cuenta bloqueada temporalmente. Intente nuevamente en', en: 'Account temporarily locked. Try again in' },
    'login.minutes': { es: 'minutos', en: 'minutes' },
    
    // Home
    'home.myFiles': { es: 'Mis archivos', en: 'My files' },
    'home.receivedFiles': { es: 'Archivos recibidos', en: 'Received files' },
    'home.myDrive': { es: 'Mi unidad', en: 'My drive' },
    'home.uploadFile': { es: 'Subir archivo', en: 'Upload file' },
    'home.logout': { es: 'Cerrar Sesión', en: 'Logout' },
    'home.backToFeed': { es: 'Volver al Feed', en: 'Back to Feed' },
    'home.search': { es: 'Buscar documentos...', en: 'Search documents...' },
    'home.filter': { es: 'Filtro', en: 'Filter' },
    'home.new': { es: 'Nuevos', en: 'New' },
    'home.noDocuments': { es: 'No se encontraron documentos con los filtros aplicados', en: 'No documents found with applied filters' },
    
    // Upload Form
    'upload.title': { es: 'Subir Nuevo Documento', en: 'Upload New Document' },
    'upload.number': { es: 'Número de Documento:', en: 'Document Number:' },
    'upload.type': { es: 'Tipo de Documento:', en: 'Document Type:' },
    'upload.subject': { es: 'Asunto:', en: 'Subject:' },
    'upload.recipient': { es: 'Para Quién Es (Email ULEAM):', en: 'Recipient (ULEAM Email):' },
    'upload.file': { es: 'Seleccionar Archivo:', en: 'Select File:' },
    'upload.tags': { es: 'Etiquetas (separadas por comas):', en: 'Tags (comma separated):' },
    'upload.tagsPlaceholder': { es: 'Ej: informe, tesis, acta', en: 'E.g: report, thesis, minutes' },
    'upload.submit': { es: 'Subir Documento', en: 'Upload Document' },
    
    // Context Menu
    'context.properties': { es: 'Propiedades', en: 'Properties' },
    'context.edit': { es: 'Editar', en: 'Edit' },
    'context.delete': { es: 'Eliminar', en: 'Delete' },
    'context.download': { es: 'Descargar', en: 'Download' },
    'context.share': { es: 'Compartir', en: 'Share' },
    'context.rename': { es: 'Renombrar', en: 'Rename' },
    
    // Filter
    'filter.title': { es: 'Filtrar por Etiquetas', en: 'Filter by Tags' },
    'filter.apply': { es: 'Aplicar Filtro', en: 'Apply Filter' },
    'filter.clear': { es: 'Limpiar Filtro', en: 'Clear Filter' },
    
    // Password Recovery
    'recovery.title': { es: 'Recuperar Contraseña', en: 'Password Recovery' },
    'recovery.email': { es: 'Ingresa tu correo electrónico:', en: 'Enter your email:' },
    'recovery.submit': { es: 'Enviar enlace de recuperación', en: 'Send recovery link' },
    'recovery.back': { es: 'Volver al inicio de sesión', en: 'Back to login' },
    'recovery.success': { es: 'Se ha enviado un enlace de recuperación a tu correo', en: 'A recovery link has been sent to your email' },
    'recovery.error': { es: 'Email no encontrado', en: 'Email not found' },
    
    // Terms and Privacy
    'terms.title': { es: 'Términos y Condiciones de Uso', en: 'Terms and Conditions of Use' },
    'privacy.title': { es: 'Política de Privacidad', en: 'Privacy Policy' },
    'footer.terms': { es: 'Términos de Uso', en: 'Terms of Use' },
    'footer.privacy': { es: 'Política de Privacidad', en: 'Privacy Policy' },
    'footer.contact': { es: 'Soporte y Contacto', en: 'Support & Contact' },
    'footer.institutional': { es: 'Información Institucional', en: 'Institutional Information' },
    
    // Accessibility
    'accessibility.title': { es: 'Accesibilidad', en: 'Accessibility' },
    'accessibility.visualAlerts': { es: 'Alertas visuales', en: 'Visual alerts' },
    'accessibility.voiceReader': { es: 'Lectura por voz', en: 'Voice reader' },
    'accessibility.highContrast': { es: 'Modo alto contraste', en: 'High contrast mode' },
    'accessibility.largeText': { es: 'Texto ampliado', en: 'Large text' },
    
    // Notifications
    'notification.newDocument': { es: 'Nuevo documento recibido', en: 'New document received' },
    'notification.uploadSuccess': { es: 'Documento subido exitosamente', en: 'Document uploaded successfully' },
    'notification.uploadError': { es: 'Error al subir el documento', en: 'Error uploading document' },
    'notification.deleteSuccess': { es: 'Documento eliminado', en: 'Document deleted' },
    'notification.deleteError': { es: 'Error al eliminar', en: 'Error deleting' },
    
    // Common
    'common.close': { es: 'Cerrar', en: 'Close' },
    'common.cancel': { es: 'Cancelar', en: 'Cancel' },
    'common.save': { es: 'Guardar', en: 'Save' },
    'common.delete': { es: 'Eliminar', en: 'Delete' },
    'common.edit': { es: 'Editar', en: 'Edit' },
    'common.loading': { es: 'Cargando...', en: 'Loading...' },
    'common.error': { es: 'Error', en: 'Error' },
    'common.success': { es: 'Éxito', en: 'Success' },
    'common.all': { es: 'Todos', en: 'All' },
    
    // Feed Component
    'feed.title': { es: 'ULEAM Social', en: 'ULEAM Social' },
    'feed.search': { es: 'Buscar...', en: 'Search...' },
    'feed.tab': { es: 'Feed', en: 'Feed' },
    'feed.projects': { es: 'Proyectos', en: 'Projects' },
    'feed.users': { es: 'Usuarios', en: 'Users' },
    'feed.viewProfile': { es: 'Ver Perfil', en: 'View Profile' },
    'feed.quickActions': { es: 'Acciones Rápidas', en: 'Quick Actions' },
    'feed.createProject': { es: 'Crear Proyecto', en: 'Create Project' },
    'feed.newPost': { es: 'Nueva Publicación', en: 'New Post' },
    'feed.noPublications': { es: 'No hay publicaciones aún', en: 'No publications yet' },
    'feed.noProjects': { es: 'No hay proyectos disponibles', en: 'No projects available' },
    'feed.projectsNotFound': { es: 'No se encontraron proyectos', en: 'No projects found' },
    'feed.noUsers': { es: 'No se encontraron usuarios', en: 'No users found' },
    'feed.createNewProject': { es: 'Crear Nuevo Proyecto', en: 'Create New Project' },
    'feed.projectName': { es: 'Nombre del Proyecto', en: 'Project Name' },
    'feed.description': { es: 'Descripción', en: 'Description' },
    'feed.tags': { es: 'Etiquetas (separadas por comas)', en: 'Tags (comma separated)' },
    'feed.visibility': { es: 'Visibilidad', en: 'Visibility' },
    'feed.public': { es: 'Público', en: 'Public' },
    'feed.private': { es: 'Privado', en: 'Private' },
    'feed.newPublication': { es: 'Nueva Publicación', en: 'New Publication' },
    'feed.selectProject': { es: 'Selecciona un proyecto', en: 'Select a project' },
    'feed.content': { es: 'Contenido', en: 'Content' },
    'feed.thinkingAbout': { es: '¿Qué estás pensando?', en: 'What are you thinking?' },
    'feed.publish': { es: 'Publicar', en: 'Publish' },
    'feed.writeComment': { es: 'Escribe un comentario...', en: 'Write a comment...' },
    'feed.connect': { es: 'Conectar', en: 'Connect' },
    
    // Profile Component
    'profile.title': { es: 'Mi Perfil', en: 'My Profile' },
    'profile.backToFeed': { es: 'Volver al Feed', en: 'Back to Feed' },
    'profile.myProjects': { es: 'Mis Proyectos', en: 'My Projects' },
    'profile.documents': { es: 'Documentos', en: 'Documents' },
    'profile.noProjects': { es: 'No tienes proyectos aún', en: 'You have no projects yet' },
    'profile.noDocuments': { es: 'No tienes documentos aún', en: 'You have no documents yet' },
    
    // Admin Component
    'admin.title': { es: 'Gestión de Usuarios', en: 'User Management' },
    'admin.search': { es: 'Buscar usuarios...', en: 'Search users...' },
    'admin.noUsers': { es: 'No se encontraron usuarios.', en: 'No users found.' },
    'admin.addUser': { es: 'Agregar Usuario', en: 'Add User' },
    'admin.name': { es: 'Nombre', en: 'Name' },
    'admin.lastname': { es: 'Apellido', en: 'Last Name' },
    'admin.id': { es: 'Cédula', en: 'ID' },
    'admin.birthdate': { es: 'Fecha de Nacimiento', en: 'Birth Date' },
    'admin.email': { es: 'Correo', en: 'Email' },
    'admin.password': { es: 'Contraseña', en: 'Password' },
  };

  constructor() {
    // Cargar idioma desde localStorage
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang) {
      this.currentLanguage.next(savedLang);
    }
  }

  public getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }

  public setLanguage(lang: Language): void {
    this.currentLanguage.next(lang);
    localStorage.setItem('app-language', lang);
  }

  public translate(key: string): string {
    const lang = this.currentLanguage.value;
    return this.translations[key]?.[lang] || key;
  }

  public instant(key: string): string {
    return this.translate(key);
  }
}
