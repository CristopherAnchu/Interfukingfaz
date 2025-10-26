import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly USER_KEY = 'LOCALUSER';
  private readonly DOCUMENT_KEY = 'LOCALDOCUMENT';
  private readonly CURRENT_USER_KEY = 'LOCALCURRENTUSER';

  private SetItem(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log("Error al guardar los datos",error);
    }
  }

  private GetItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.log("Error al obtener los datos",error);
      return null;
    }
  }

  private RemoveItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log("Error al borrar los datos",error);
    }
  }

  // set, get y delete para usuario
  public getUsers(): any[] {
    return this.GetItem(this.USER_KEY) || [];
  }
  
  public setUsers(user: any[]) {
    this.SetItem(this.USER_KEY, user);
  }

  public deleteUsers(user: any) {
    this.RemoveItem(this.USER_KEY);
  }

  // set, get y delete para documentos
  public getDocuments(): any[] {
    return this.GetItem(this.DOCUMENT_KEY) || [];
  }

  public setDocuments(documents: any[]) {
    this.SetItem(this.DOCUMENT_KEY, documents);
  }

  public deleteDocuments(document: any) {
    this.RemoveItem(this.DOCUMENT_KEY);
  }

  //get, set y remove para el usuario actual
  getCurrentUser(): any {
    return sessionStorage.getItem(this.CURRENT_USER_KEY)
      ? JSON.parse(sessionStorage.getItem(this.CURRENT_USER_KEY)!)
      : null
  }

  setCurrentUser(user: any) {
    sessionStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))  
  }

  removeCurrentUser(): void {
    sessionStorage.removeItem(this.CURRENT_USER_KEY)
  }

}

