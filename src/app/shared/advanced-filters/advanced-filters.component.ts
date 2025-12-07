import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface FilterConfig {
  searchTerm?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  fileType?: string;
  author?: string;
  sortBy?: 'date' | 'name' | 'type';
  sortOrder?: 'asc' | 'desc';
}

@Component({
  selector: 'app-advanced-filters',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './advanced-filters.component.html',
  styleUrl: './advanced-filters.component.css'
})
export class AdvancedFiltersComponent implements OnInit {
  @Input() availableTags: string[] = [];
  @Input() availableFileTypes: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'];
  @Output() filtersApplied = new EventEmitter<FilterConfig>();
  @Output() filtersCleared = new EventEmitter<void>();

  filterForm: FormGroup;
  showAdvanced = false;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      selectedTags: [[]],
      dateFrom: [''],
      dateTo: [''],
      fileType: [''],
      author: [''],
      sortBy: ['date'],
      sortOrder: ['desc']
    });
  }

  ngOnInit(): void {
    // Aplicar filtros automáticamente cuando cambian
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  toggleTag(tag: string): void {
    const currentTags = this.filterForm.value.selectedTags || [];
    const index = currentTags.indexOf(tag);
    
    if (index > -1) {
      currentTags.splice(index, 1);
    } else {
      currentTags.push(tag);
    }
    
    this.filterForm.patchValue({ selectedTags: currentTags });
  }

  isTagSelected(tag: string): boolean {
    const currentTags = this.filterForm.value.selectedTags || [];
    return currentTags.includes(tag);
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    const filters: FilterConfig = {
      searchTerm: values.searchTerm,
      tags: values.selectedTags,
      dateFrom: values.dateFrom,
      dateTo: values.dateTo,
      fileType: values.fileType,
      author: values.author,
      sortBy: values.sortBy,
      sortOrder: values.sortOrder
    };
    
    this.filtersApplied.emit(filters);
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      selectedTags: [],
      dateFrom: '',
      dateTo: '',
      fileType: '',
      author: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    
    this.filtersCleared.emit();
  }

  hasActiveFilters(): boolean {
    const values = this.filterForm.value;
    return !!(
      values.searchTerm ||
      (values.selectedTags && values.selectedTags.length > 0) ||
      values.dateFrom ||
      values.dateTo ||
      values.fileType ||
      values.author
    );
  }

  getActiveFiltersCount(): number {
    let count = 0;
    const values = this.filterForm.value;
    
    if (values.searchTerm) count++;
    if (values.selectedTags && values.selectedTags.length > 0) count += values.selectedTags.length;
    if (values.dateFrom) count++;
    if (values.dateTo) count++;
    if (values.fileType) count++;
    if (values.author) count++;
    
    return count;
  }
}
