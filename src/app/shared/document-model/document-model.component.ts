import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DocumentsInterface } from "../../interfaces/documents.interface"

@Component({
  selector: 'app-document-model',
  imports: [CommonModule],
  templateUrl: './document-model.component.html',
  styleUrl: './document-model.component.css'
})
export class DocumentModelComponent {
  @Input() isVisible = false
  @Input() document: DocumentsInterface | null = null
  @Output() closeModal = new EventEmitter<void>()

  close(): void {
    this.closeModal.emit()
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close()
    }
  }
}
