import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PersonenService } from '../../../services/personen.service';
import { Person } from '../../../models/person';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-personen-detail',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './personen-detail.component.html',
  styleUrl: './personen-detail.component.scss'
})
export class PersonenDetailComponent {

 


  checked = false;

  // Date model properties
  geburtsdatum: Date | null = null;
  eintrittsdatum: Date | null = null;
  austrittsdatum: Date | null = null;
  strafregisterbescheid: Date | null = null;
  interessenskonflikt: Date | null = null;

  // Add these properties
  eingabeGepruft: boolean = false;
  aktiv: boolean = true;

  // Default expansion state for sections
  personDataExpanded = true;
  organisationDataExpanded = true;
  betriebsdatenExpanded = true; // Method to update panel state with enhanced scroll position preservation
 
  person: Person = {
    id: '',
    nachname: '',
    vorname: '',
     aktiv: false,
   };


  constructor(private personenService : PersonenService,
    private route: ActivatedRoute
  ){

  }

  ngOnInit() {
    this.loadPerson();
  }

  loadPerson(): void {
    const id = +this.route.snapshot.paramMap.get('id')!; 
    this.personenService.loadPersonDetails(id.toString()).subscribe((data) => {
      console.log(data);
      this.person = data;
    });
  }

  
  updatePanelState(panel: string, isExpanded: boolean): void {
    // Store current scroll position
    const form = document.querySelector('form');
    const scrollPosition = form ? form.scrollTop : 0;

    // Create a reference point for scroll position
    const focusElement = document.activeElement;

    // Prevent scroll events during animation
    if (form) {
      form.style.pointerEvents = 'none';
      // Add a class to disable animations temporarily
      form.classList.add('disable-transitions');
    }

    // Update panel state
    switch (panel) {
      case 'person':
        this.personDataExpanded = isExpanded;
        break;
      case 'organisation':
        this.organisationDataExpanded = isExpanded;
        break;
      case 'betriebsdaten':
        this.betriebsdatenExpanded = isExpanded;
        break;
    } // Enhanced restore position function with progressive approach
    const restorePosition = (attempt = 0) => {
      if (form) {
        // Restore scroll position
        form.scrollTop = scrollPosition;

        // Re-enable pointer events after the initial restore
        if (attempt > 0) {
          form.style.pointerEvents = '';
        }

        // Re-enable transitions after final attempt
        if (attempt >= 3) {
          form.classList.remove('disable-transitions');

          // If we had a focused element, try to restore focus
          if (focusElement && focusElement instanceof HTMLElement) {
            focusElement.focus({ preventScroll: true });
          }
        }
      }
    };

    // Progressive multi-stage restore for maximum reliability
    restorePosition(0); // Immediate restore
    requestAnimationFrame(() => restorePosition(1)); // Next frame restore
    setTimeout(() => restorePosition(2), 50); // Short delay restore
    setTimeout(() => restorePosition(3), 200); // Final restore after all layout is complete
    setTimeout(restorePosition, 300);
  }
}
