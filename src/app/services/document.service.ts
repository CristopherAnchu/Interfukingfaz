//Imortación de librerías de angular
import { Injectable } from '@angular/core';

//Importaciones de sevicios
import { StorageService } from './storage.service';
import { UsersService } from './users.service';

//importaciones de interfaces
import { DocumentsInterface, ApiResponse } from '../interfaces/documents.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(
    private storageService: StorageService,
    private usersService: UsersService
  ) { }

  //Funcion para añador un nuevo documento
  public addDocument(documentData: any): ApiResponse {
    const documents = this.storageService.getDocuments();

    let initialVisibleTo: string[] = [];

    if (documentData.paraQuienEsEmail === "all" ) {
     initialVisibleTo = ["all"];
    } else {
      initialVisibleTo.push(documentData.quienSubeEmail);
      initialVisibleTo.push(documentData.paraQuienEsEmail);
      initialVisibleTo = [...new Set(initialVisibleTo)];
    }

    const newDocument: DocumentsInterface = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fechasubida: new Date().toISOString().slice(0, 10),
      ...documentData,
      visibleTo: initialVisibleTo
    }

    documents.push(newDocument);
    this.storageService.setDocuments(documents);
    return { success: true, message: "Documento agregado correctamente", document: newDocument };
  }

  //Funcion para obtener documento por la id
  public getDocumentbyId(docid: string): DocumentsInterface | undefined {
    const documents = this.storageService.getDocuments();
    return documents.find(document => document.id === docid);
  }

  //Funcion para obtener todos los documentos
  public getAlldocuments(): DocumentsInterface[] {
    return this.storageService.getDocuments();
  }

  //Obtener documentos para un usuario
  public getDocumentsForUser(UserEmanil: string): DocumentsInterface[] {
    const documents = this.storageService.getDocuments();
    return documents.filter(document => document.visibleTo.includes(UserEmanil));
  }

  //Obtener documentos Subidos por el usuario
  public getMydocuments(UserEmanil: string): DocumentsInterface[] {
    const documents = this.storageService.getDocuments()
    return documents.filter(
      (doc) => 
        (doc.quienSubeEmail === UserEmanil) &&
        doc.visibleTo &&
        (doc.visibleTo.includes(UserEmanil) || doc.visibleTo.includes("all"))
    )
  }

  public getReceivedDocuments(UserEmanil: string): DocumentsInterface[] {
    const documents = this.storageService.getDocuments();
    return documents.filter(
      (doc) => 
        (doc.paraQuienEsEmail === UserEmanil || doc.paraQuienEsEmail === "all") &&
        doc.visibleTo &&
        (doc.visibleTo.includes(UserEmanil) || doc.visibleTo.includes("all"))
    )
  }

  public markDocumentAsHiddenForUser(docId: string, userEmail: string): ApiResponse {
    let documents = this.storageService.getDocuments()
    const docIndex = documents.findIndex((doc) => doc.id === docId)

    if (docIndex !== -1) {
      const documentToUpdate = documents[docIndex]

      if (documentToUpdate.visibleTo.includes("all")) {
        const allUsers = this.usersService.getAllUsers()
        documentToUpdate.visibleTo = allUsers.filter((u) => u.email !== userEmail).map((u) => u.email)
      } else {
        documentToUpdate.visibleTo = documentToUpdate.visibleTo.filter((email: string) => email !== userEmail)
      }

      if (documentToUpdate.visibleTo.length === 0) {
        documents = documents.filter((doc) => doc.id !== docId)
        this.storageService.setDocuments(documents)
        return { success: true, message: "Documento eliminado." }
      } else {
        this.storageService.setDocuments(documents)
        return { success: true, message: "Documento eliminado." }
      }
    }
    return { success: false, message: "Documento no encontrado." }
  }

  public DeleteDocument(docId: string): ApiResponse {
    let documents = this.storageService.getDocuments()
    const initialLength = documents.length
    documents = documents.filter((doc) => doc.id !== docId)

    if (documents.length < initialLength) {
      this.storageService.setDocuments(documents)
      return { success: true, message: "Documento eliminado." }
    }

    return { success: false, message: "Documento no encontrado." }
  }

  public getAllTags(): string[] {
    const documents = this.storageService.getDocuments()
    const allTags = new Set<string>()

    documents.forEach((doc) => {
      if (doc.etiquetas) {
        doc.etiquetas.split(",").forEach((tag: string) => {
          const trimmedTag = tag.trim()
          if (trimmedTag) {
            allTags.add(trimmedTag)
          }
        })
      }
    })

    return Array.from(allTags).sort()
  }

}
