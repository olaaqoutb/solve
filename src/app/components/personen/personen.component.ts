import {
  Component,
  AfterViewInit,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

import { Router } from '@angular/router';
import { Person } from '../../models/person';

@Component({
  selector: 'app-personen',
  templateUrl: './personen.component.html',
  styleUrl: './personen.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatTableModule,
  ],
})
export class PersonenComponent implements AfterViewInit, OnInit, OnDestroy {
  // Columns to display in the table
  displayedColumns: string[] = [
    'select',
    'status',
    'familienname',
    'vorname',
    'mitarbeiterart',
    'gesamt',
    'geplant',
    'gebucht',
    'geplant2026',
    'rolle',
    'delete', // Add this new column
  ];

  // Sample data - 3 dummy entries as shown in the reference
  dataSource = [
    {
      selected: false,
      status: 'active',
      familienname: 'Müller',
      vorname: 'Thomas',
      mitarbeiterart: 'intern',
      gesamt: 1600,
      geplant: 0,
      gebucht: 0,
      geplant2026: 0,
      rolle: 'Default',
    },
    {
      selected: true,
      status: 'inactive',
      familienname: 'Schmidt',
      vorname: 'Anna',
      mitarbeiterart: 'extern',
      gesamt: 1400,
      geplant: 21,
      gebucht: 13.05,
      geplant2026: 0,
      rolle: 'Default',
    },
    {
      selected: false,
      status: 'active',
      familienname: 'Weber',
      vorname: 'Michael',
      mitarbeiterart: 'Zivildienstleistender',
      gesamt: 1600,
      geplant: 4,
      gebucht: 0.92,
      geplant2026: 0,
      rolle: 'Default',
    },
  ];

  // Currently selected person
  selectedPerson: Person | null = null;

  // Add this property to track menu state
  isMenuOpen = false;

  constructor(private router: Router) {}

  // Handle row selection
  selectPerson(person: Person): void {
    this.selectedPerson = person;
    // Add any additional actions when selecting a person
  }

  // Search functionality
  search(searchTerm: string): void {
    // Implement search logic
    console.log('Searching for:', searchTerm);
  }

  // Add this method to handle delete operations
  deletePerson(person: Person, event: Event): void {
    // Prevent the row click event from triggering
   /* event.stopPropagation();

    // Implement delete logic here
    console.log('Deleting person:', person);

    // Example: Remove the person from the dataSource
    const index = this.dataSource.findIndex((p) => p === person);
    if (index >= 0) {
      // Create a new array without the deleted person
      const updatedData = [...this.dataSource];
      updatedData.splice(index, 1);
      this.dataSource = updatedData;
    }
      */
  }

  // Handle row click event
  onRowClick(event: MouseEvent, row: Person) {
    // Check if the click was on a cell or some internal element
    const target = event.target as HTMLElement;

    // Don't trigger selection if clicking on a mat-cell (to allow text selection)
    if (
      target.classList.contains('mat-cell') ||
      target.closest('.mat-cell') ||
      window.getSelection()?.toString()
    ) {
      // User is likely trying to select text - do nothing
      return;
    }

    // Otherwise select the row
    this.selectPerson(row);
  }

  // Add a method to toggle the menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    // Close menu when clicking outside of it
    if (this.isMenuOpen) {
      setTimeout(() => {
        window.addEventListener('click', this.closeMenuOnOutsideClick);
      }, 0);
    }
  }

  // Handle menu item clicks
  handleMenuAction(action: string): void {
    console.log(`Menu action selected: ${action}`);

    // Implement different actions based on menu selection
    switch (action) {
      case 'all':
        console.log('Showing all people');
        // Implement functionality to show all people
        break;
      case 'current':
        console.log('Showing current people');
        // Implement functionality to show current people
        break;
      case 'upload':
        console.log('Opening information upload');
        // Implement functionality to upload information
        break;
      case 'conflict':
        console.log('Opening conflict form upload');
        // Implement functionality to upload conflict forms
        break;
    }

    // Close menu after action
    this.isMenuOpen = false;
  }

  // Close menu when clicking outside
  closeMenuOnOutsideClick = (event: MouseEvent): void => {
    // Check if the click is outside the menu and menu button
    const menuButton = document.querySelector('.menu-button');
    const menuPanel = document.querySelector('.burger-menu-panel');

    if (
      !menuButton?.contains(event.target as Node) &&
      !menuPanel?.contains(event.target as Node)
    ) {
      this.isMenuOpen = false;
      window.removeEventListener('click', this.closeMenuOnOutsideClick);

      // Need to trigger change detection since this is an async event handler
      // Use NgZone if available, or a timeout as a fallback
      setTimeout(() => {
        // This will trigger change detection
      }, 0);
    }
  };

  goToPersonForm(): void {
    this.router.navigate(['/person-form']);
  }

  ngOnInit() {
    // No longer initializing dataSource with persons
  }

  ngAfterViewInit() {
    // Force the table to recalculate columns when data loads
    if (this.dataSource && this.dataSource.length > 0) {
      // Create a new data source from the existing data
      const dataSource = new MatTableDataSource(this.dataSource);
      // Assign it back
      this.dataSource = dataSource.data;
      // Force change detection
      setTimeout(() => {}, 0);
    }
  }

  // Clean up event listeners when component is destroyed
  ngOnDestroy(): void {
    window.removeEventListener('click', this.closeMenuOnOutsideClick);
  }
}
