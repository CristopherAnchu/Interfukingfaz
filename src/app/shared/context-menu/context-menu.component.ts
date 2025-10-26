import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

export interface ContextMenuAction {
  label: string
  action: string
  icon?: string
}

@Component({
  selector: 'app-context-menu',
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent {
  @Input() isVisible = false
  @Input() position = { x: 0, y: 0 }
  @Input() actions: ContextMenuAction[] = []
  @Output() actionSelected = new EventEmitter<string>()

  onActionClick(action: string): void {
    this.actionSelected.emit(action)
  }
}
