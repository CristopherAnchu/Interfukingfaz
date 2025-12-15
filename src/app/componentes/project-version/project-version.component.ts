import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ProjectService } from '../../services/project.service';
import { VersionService } from '../../services/version.service';
import { Project } from '../../interfaces/projects.interface';

@Component({
  selector: 'app-project-version',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './project-version.component.html',
  styleUrl: './project-version.component.css'
})
export class ProjectVersionComponent implements OnInit {
  form!: FormGroup;
  project: Project | null = null;
  nextVersion = 1;
  message = '';
  messageType: 'Success' | 'Error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private versionService: VersionService
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      this.setMessage('Proyecto no especificado', 'Error');
      return;
    }

    const proj = this.projectService.getProjectById(projectId);
    if (!proj) {
      this.setMessage('Proyecto no encontrado', 'Error');
      return;
    }

    this.project = proj;
    this.nextVersion = this.versionService.getNextVersionNumber(proj.id);

    this.form = this.fb.group({
      version: [{ value: this.nextVersion, disabled: true }],
      description: ['', [Validators.required, Validators.minLength(5)]],
      file: [null],
      notes: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Guardamos solo el nombre para esta demo/avance
      const file = input.files[0];
      this.form.patchValue({ file: file.name });
    }
  }

  submit(): void {
    if (!this.project) return;
    if (this.form.invalid) {
      this.setMessage('Complete la descripción de cambios', 'Error');
      return;
    }

    const { description, file, notes } = this.form.getRawValue();
    this.versionService.addVersion({
      projectId: this.project.id,
      version: this.nextVersion,
      description,
      fileName: file || undefined,
      notes: notes || undefined,
      date: new Date().toISOString()
    });

    this.setMessage('Versión registrada (avance de demo).', 'Success');
    // Recalcular siguiente versión para permitir otra carga inmediata
    this.nextVersion = this.versionService.getNextVersionNumber(this.project.id);
    this.form.reset({ version: this.nextVersion, description: '', file: null, notes: '' });
  }

  back(): void {
    this.router.navigate(['/profile']);
  }

  private setMessage(msg: string, type: 'Success' | 'Error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; this.messageType = ''; }, 4000);
  }
}
