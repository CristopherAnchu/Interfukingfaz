import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent {
  @Input() progress: number = 0;
  @Input() showPercentage: boolean = true;
  @Input() color: string = '#c00';
  @Input() height: string = '8px';
  @Input() label: string = '';
  @Input() animated: boolean = true;

  get progressStyle() {
    return {
      width: `${Math.min(100, Math.max(0, this.progress))}%`,
      backgroundColor: this.color,
      height: this.height
    };
  }

  get containerStyle() {
    return {
      height: this.height
    };
  }
}
