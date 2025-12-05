import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
 import { MatButtonModule } from '@angular/material/button';
import { StempelzeitDto } from '../../models/person';


@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrl: './delete-confirm-dialog.component.scss'
})
export class DeleteConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { row: StempelzeitDto }
  ) {}

  confirmDelete(): void {
    this.dialogRef.close(true); // Pass 'true' when user confirms
  }

  cancel(): void {
    this.dialogRef.close(false); // Pass 'false' when user cancels
  }

}
