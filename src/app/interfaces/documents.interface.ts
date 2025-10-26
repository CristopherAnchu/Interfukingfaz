export interface DocumentsInterface {
    id: string
    fechaSubida: string
    numero: string
    tipo: string
    asunto: string
    quienSube: string
    quienSubeEmail: string
    paraQuienEs: string
    paraQuienEsEmail: string
    fileName: string
    fileType: string
    etiquetas: string
    visibleTo: string[]
}

export interface DocumentUpload {
    numero: string
    tipo: string
    asunto: string
    paraQuienEsEmail: string
    file: File
    etiquetas: string
}

export interface ApiResponse {
    success: boolean
    message: string
    document?: DocumentsInterface
}