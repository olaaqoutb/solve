import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss'
})
export class ErrorDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  formatDetail(detail: string): string {
  if (!detail) return '';
  return detail.split('\n').map(l => l.trim()).join('\n');
}
}
