import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';

interface TimeEntry {
  productPosition: string;
  month: string;
  employee: string;
  hours: number;
  approved: boolean;
}

@Component({
  selector: 'app-time-tracking-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-tracking-table.component.html',
  styleUrls: ['./time-tracking-table.component.scss'],
})
export class TimeTrackingTableComponent implements OnInit {
  timeEntries: TimeEntry[] = [];
  activeSection: string = '';

  private employees = [
    'Hassan Terab',
    'Müller Thomas',
    'Hofstetter Walter',
    'Mustermann Max',
    'Einberger Peter',
    'Selaru Stelian',
    'Balluku Gerdsch',
    'Tauber Markus',
  ];

  private products = [
    'GetIt3',
    'Infrastruktur',
    'BMI',
    'Anwesenheitsliste',
    'Urlaub',
    'Krankenstand',
    'Bereitschaft',
    'Zeiterfassung',
    'Produktverwaltung',
    'Personenverwaltung',
  ];

  private activities = [
    'Entwicklung',
    'Testing',
    'Bugfixing',
    'Support',
    'Administration',
    'Management',
    'Qualitätssicherung',
    'Dokumentation',
    'Planung',
    'Analyse',
  ];

  constructor(
    private navigationService: NavigationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the current route from the ActivatedRoute
    const currentPath = this.route.snapshot.routeConfig?.path || '';
    const fullPath = '/' + currentPath;
    this.activeSection = fullPath;

    // Generate initial data based on the current route
    this.generateRandomData(fullPath);

    // Subscribe to active route changes from the navigation service
    this.navigationService.activeRoute$.subscribe((route) => {
      this.activeSection = route;
      // Generate random data for the active section
      this.generateRandomData(route);
    });
  }

  // Generate random data based on the route
  private generateRandomData(route: string): void {
    // Extract route name for use in the data
    const routeName =
      route.substring(1).charAt(0).toUpperCase() + route.substring(2);

    // Generate 2-4 random entries
    const numEntries = Math.floor(Math.random() * 3) + 2;
    const entries: TimeEntry[] = [];

    for (let i = 0; i < numEntries; i++) {
      entries.push({
        productPosition:
          this.getRandomProduct() +
          ' » ' +
          this.getRandomActivity() +
          ' (' +
          routeName +
          ')',
        month: this.getRandomMonth(),
        employee: this.getRandomEmployee(),
        hours: parseFloat((Math.random() * 40).toFixed(1)),
        approved: Math.random() > 0.5,
      });
    }

    this.timeEntries = entries;
  }

  private getRandomEmployee(): string {
    return this.employees[Math.floor(Math.random() * this.employees.length)];
  }

  private getRandomProduct(): string {
    return this.products[Math.floor(Math.random() * this.products.length)];
  }

  private getRandomActivity(): string {
    return this.activities[Math.floor(Math.random() * this.activities.length)];
  }

  private getRandomMonth(): string {
    const year = 2025;
    const month = Math.floor(Math.random() * 12) + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  }
}
