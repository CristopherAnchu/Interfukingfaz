import { Injectable } from '@angular/core';

export interface ProjectVersionEntry {
  projectId: string;
  version: number;
  description: string;
  notes?: string;
  fileName?: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class VersionService {
  private readonly KEY = 'LOCALVERSIONS';

  private loadAll(): Record<string, ProjectVersionEntry[]> {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveAll(data: Record<string, ProjectVersionEntry[]>): void {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  }

  public getVersions(projectId: string): ProjectVersionEntry[] {
    const all = this.loadAll();
    return all[projectId] || [];
  }

  public getNextVersionNumber(projectId: string): number {
    const list = this.getVersions(projectId);
    if (!list.length) return 1;
    return Math.max(...list.map(v => v.version)) + 1;
  }

  public addVersion(entry: ProjectVersionEntry): void {
    const all = this.loadAll();
    const list = all[entry.projectId] || [];
    list.push(entry);
    all[entry.projectId] = list;
    this.saveAll(all);
  }
}
