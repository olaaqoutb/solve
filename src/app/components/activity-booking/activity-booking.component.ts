import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import {
  TimeEntry,
  Activity,
  MonthSummary,
} from '../../models/time-entry.interface';

@Component({
  selector: 'app-activity-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
  ],
  templateUrl: './activity-booking.component.html',
  styleUrls: ['./activity-booking.component.scss'],
})
export class ActivityBookingComponent implements OnInit {
  activityForm: FormGroup;
  selectedDate: Date | null = null;
  selectedTimeEntry: TimeEntry | null = null;
  showActivityForm = false;
  currentMonth = 'Mai 2025';

  // Dummy data
  monthSummaries: MonthSummary[] = [
    {
      month: 'April 2025',
      year: 2025,
      totalHours: '74:35',
      status: 'abgeschlossen',
    },
    {
      month: 'Mai 2025',
      year: 2025,
      totalHours: '78:00',
      status: 'offen',
    },
  ];

  timeEntries: TimeEntry[] = [
    {
      id: '1',
      date: new Date(2025, 4, 2), // May 2nd
      dayName: 'Fr.',
      gestempelt: '05:42',
      gebucht: '05:40',
      status: 'abgeschlossen',
      activities: [
        {
          id: 'a1',
          title: 'Tätigkeitsbericht IV/2 GUI Erneuerung',
          product: 'GETIT Tätigkeitsbericht IV/2',
          productPosition: 'GUI Erneuerung',
          bookingPoint: 'GUI Erneuerung',
          activityType: 'Programmierung',
          duration: { hours: 5, minutes: 40 },
          description: 'GETIT - Implementierung von Abwesenheiten Maske',
          jiraTicket: 'GETIT-731',
          timeRange: '07:14 - 12:56',
        },
      ],
    },
    {
      id: '2',
      date: new Date(2025, 4, 5), // May 5th
      dayName: 'Mo.',
      gestempelt: '07:52',
      gebucht: '07:25',
      status: 'abgeschlossen',
    },
    {
      id: '3',
      date: new Date(2025, 4, 6), // May 6th
      dayName: 'Di.',
      gestempelt: '10:04',
      gebucht: '09:30',
      status: 'abgeschlossen',
    },
    {
      id: '4',
      date: new Date(2025, 4, 7), // May 7th
      dayName: 'Mi.',
      gestempelt: '09:18',
      gebucht: '09:00',
      status: 'abgeschlossen',
    },
    {
      id: '5',
      date: new Date(2025, 4, 8), // May 8th
      dayName: 'Do.',
      gestempelt: '09:01',
      gebucht: '08:30',
      status: 'abgeschlossen',
    },
    {
      id: '6',
      date: new Date(2025, 4, 9), // May 9th
      dayName: 'Fr.',
      gestempelt: '05:02',
      gebucht: '05:00',
      status: 'abgeschlossen',
    },
    {
      id: '7',
      date: new Date(2025, 4, 12), // May 12th
      dayName: 'Mo.',
      gestempelt: '08:45',
      gebucht: '08:15',
      status: 'abgeschlossen',
    },
    {
      id: '8',
      date: new Date(2025, 4, 13), // May 13th
      dayName: 'Di.',
      gestempelt: '09:55',
      gebucht: '09:25',
      status: 'abgeschlossen',
    },
    {
      id: '9',
      date: new Date(2025, 4, 14), // May 14th
      dayName: 'Mi.',
      gestempelt: '08:03',
      gebucht: '07:40',
      status: 'abgeschlossen',
    },
    {
      id: '10',
      date: new Date(2025, 4, 15), // May 15th
      dayName: 'Do.',
      gestempelt: '07:43',
      gebucht: '07:35',
      status: 'abgeschlossen',
    },
    {
      id: '11',
      date: new Date(2025, 4, 16), // May 16th
      dayName: 'Fr.',
      gestempelt: '04:48',
      gebucht: '00:00',
      status: 'offen',
    },
    {
      id: '12',
      date: new Date(2025, 4, 19), // May 19th
      dayName: 'Mo.',
      gestempelt: '08:36',
      gebucht: '00:00',
      status: 'offen',
    },
  ];

  // Dropdown options
  products = [
    'GETIT Tätigkeitsbericht IV/2',
    'BMI Portal System',
    'Anwesenheitsverwaltung',
    'Zeiterfassung Plus',
  ];

  productPositions = [
    'GUI Erneuerung',
    'Backend Development',
    'Database Design',
    'Testing & QA',
  ];

  bookingPoints = [
    'GUI Erneuerung',
    'API Development',
    'Database Migration',
    'System Integration',
  ];

  activityTypes = [
    'Programmierung',
    'Testing',
    'Dokumentation',
    'Meeting',
    'Analyse',
  ];

  constructor(private fb: FormBuilder) {
    this.activityForm = this.fb.group({
      product: ['', Validators.required],
      productPosition: ['', Validators.required],
      bookingPoint: ['', Validators.required],
      activityType: ['', Validators.required],
      hours: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      minutes: [
        0,
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      description: [''],
      jiraTicket: [''],
    });
  }

  ngOnInit(): void {
    // Set default selected date to today or first available entry
    if (this.timeEntries.length > 0) {
      this.selectTimeEntry(this.timeEntries[0]);
    }
  }

  selectTimeEntry(entry: TimeEntry): void {
    this.selectedTimeEntry = entry;
    this.selectedDate = entry.date;
    this.showActivityForm = false;
  }

  openActivityForm(): void {
    this.showActivityForm = true;
    this.activityForm.reset();
  }

  closeActivityForm(): void {
    this.showActivityForm = false;
    this.activityForm.reset();
  }

  saveActivity(): void {
    if (this.activityForm.valid && this.selectedTimeEntry) {
      const formValue = this.activityForm.value;

      const newActivity: Activity = {
        id: Date.now().toString(),
        title: `${formValue.activityType} - ${formValue.product}`,
        product: formValue.product,
        productPosition: formValue.productPosition,
        bookingPoint: formValue.bookingPoint,
        activityType: formValue.activityType,
        duration: {
          hours: formValue.hours,
          minutes: formValue.minutes,
        },
        description: formValue.description,
        jiraTicket: formValue.jiraTicket,
        timeRange: '08:00 - 16:00', // This would be calculated based on actual times
      };

      // Add activity to selected time entry
      if (!this.selectedTimeEntry.activities) {
        this.selectedTimeEntry.activities = [];
      }
      this.selectedTimeEntry.activities.push(newActivity);

      // Update gebucht time (this would be calculated properly in real implementation)
      const totalMinutes = formValue.hours * 60 + formValue.minutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      this.selectedTimeEntry.gebucht = `${hours
        .toString()
        .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      this.closeActivityForm();
    }
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mär',
      'Apr',
      'Mai',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Okt',
      'Nov',
      'Dez',
    ];
    const month = monthNames[date.getMonth()];
    return `${day}. ${month}`;
  }

  getDayName(date: Date): string {
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return dayNames[date.getDay()] + '.';
  }

  getCurrentMonthSummary(): MonthSummary {
    return (
      this.monthSummaries.find((m) => m.month === this.currentMonth) ||
      this.monthSummaries[1]
    );
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  hasActivities(entry: TimeEntry): boolean {
    return Boolean(entry.activities && entry.activities.length > 0);
  }
}
