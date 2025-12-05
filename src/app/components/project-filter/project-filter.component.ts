import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-filter.component.html',
  styleUrls: ['./project-filter.component.scss'],
})
export class ProjectFilterComponent {
  selectedFilter: string = 'Projektoffice';
  filters: string[] = ['Projektoffice', 'Alle Projekte', 'Meine Projekte'];
}
