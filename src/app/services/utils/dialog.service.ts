import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {}

  /**
   * Show delete confirmation dialog
   */
  async showDeleteConfirmation(entryName: string, entryDate?: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      panelClass: 'confirmation-dialog-panel',
      data: {
        title: 'Löschen bestätigen',
        message: `Wollen Sie den Eintrag "${entryName}"${entryDate ? ` (${entryDate})` : ''} wirklich löschen?`,
        confirmText: 'Ja',
        cancelText: 'Nein'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    return result === true;
  }

  /**
   * Show generic confirmation dialog
   */
  async showConfirmation(
    title: string,
    message: string,
    confirmText: string = 'Ja',
    cancelText: string = 'Nein'
  ): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      panelClass: 'confirmation-dialog-panel',
      data: {
        title,
        message,
        confirmText,
        cancelText
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    return result === true;
  }
}
