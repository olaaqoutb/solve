import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationService, MenuItem } from '../../services/navigation.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatRippleModule,
    MatSidenavModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  menuItems: MenuItem[] = [];
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef;
  private lastScrollPosition = 0;
  isTouchDevice = false;

  constructor(
    private navigationService: NavigationService,
    private router: Router
  ) {
    // Detect if device is touch-enabled
    this.isTouchDevice = this.detectTouchDevice();
  }

  // Helper method to detect touch device
  private detectTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  ngOnInit(): void {
    // Get menu items from the navigation service
    this.navigationService.menuItems$.subscribe((items) => {
      this.menuItems = items;
    });

    // Listen to router events to update active menu item
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentRoute = '/' + event.urlAfterRedirects.substring(1);
        this.navigationService.setActiveMenuItem(currentRoute);

        // Restore scroll position after navigation
        this.restoreScrollPosition();
      });
  }

  ngAfterViewInit(): void {
    // Store initial scroll position
    if (this.sidebarContainer && this.sidebarContainer.nativeElement) {
      const container = this.sidebarContainer.nativeElement;
      // Add scroll event listener to track position
      container.addEventListener('scroll', () => {
        this.lastScrollPosition = container.scrollTop;
        // Save to session storage for persistence
        sessionStorage.setItem(
          'sidebarScrollPosition',
          String(this.lastScrollPosition)
        );
      });

      // Load initial scroll position from storage
      const savedPosition = sessionStorage.getItem('sidebarScrollPosition');
      if (savedPosition) {
        setTimeout(() => {
          container.scrollTop = parseInt(savedPosition, 10);
        }, 100);
      }
    }
  }
  /**
   * Preserves the current scroll position when clicking on a link
   */
  preserveScrollPosition(event: MouseEvent): void {
    if (this.sidebarContainer && this.sidebarContainer.nativeElement) {
      const container = this.sidebarContainer.nativeElement;

      // Save the current scroll position just before navigation
      this.lastScrollPosition = container.scrollTop;
      sessionStorage.setItem(
        'sidebarScrollPosition',
        String(this.lastScrollPosition)
      );

      // For links, especially the last 3, we need a more robust solution
      // Find which link was clicked
      const target = event.currentTarget as HTMLElement;
      const linkText = target.textContent?.trim() || '';
      const menuItemIndex = this.menuItems.findIndex(
        (item) => item.label.trim() === linkText
      );

      // Special handling for the last 3 links which often cause scroll reset
      const isBottomLink = menuItemIndex >= this.menuItems.length - 3;

      if (isBottomLink) {
        // Prevent the default scrolling behavior
        event.preventDefault();

        // Set a flag in session storage to indicate a bottom link was clicked
        sessionStorage.setItem('clickedBottomLink', 'true');

        // Navigate programmatically after a small delay
        setTimeout(() => {
          this.router.navigate([
            this.menuItems[menuItemIndex].route.substring(1),
          ]);
        }, 10);
      }
    }
  }
  /**
   * Restores the scroll position after navigation
   */
  private restoreScrollPosition(): void {
    if (this.sidebarContainer && this.sidebarContainer.nativeElement) {
      const container = this.sidebarContainer.nativeElement;
      const wasBottomLinkClicked =
        sessionStorage.getItem('clickedBottomLink') === 'true';

      // If a bottom link was clicked, we need special handling
      if (wasBottomLinkClicked) {
        // Clear the flag
        sessionStorage.removeItem('clickedBottomLink');

        // Restore scroll position with multiple attempts for reliability
        for (let delay of [0, 50, 100, 200, 300]) {
          setTimeout(() => {
            if (this.lastScrollPosition > 0) {
              container.scrollTop = this.lastScrollPosition;
            } else {
              const savedPosition = sessionStorage.getItem(
                'sidebarScrollPosition'
              );
              if (savedPosition) {
                container.scrollTop = parseInt(savedPosition, 10);
              }
            }
          }, delay);
        }
      } else {
        // Standard scroll restoration for other links
        setTimeout(() => {
          if (this.lastScrollPosition > 0) {
            container.scrollTop = this.lastScrollPosition;
          } else {
            const savedPosition = sessionStorage.getItem(
              'sidebarScrollPosition'
            );
            if (savedPosition) {
              container.scrollTop = parseInt(savedPosition, 10);
            }
          }
        }, 100);
      }
    }
  }
  // Map custom icon names to Material icons
  getIconName(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      // Basic UI Icons
      list: 'format_list_bulleted',
      edit: 'edit',
      'edit-2': 'edit_note',
      clock: 'access_time',
      'user-minus': 'person_remove',
      'user-x': 'person_off',
      calculator: 'calculate',
      'check-circle': 'check_circle',
      archive: 'archive',
      calendar: 'calendar_month',
      users: 'people',
      package: 'inventory_2',
      'file-text': 'description',
      grid: 'grid_view',
      user: 'person',
      'bar-chart-2': 'bar_chart',
      'log-out': 'logout',
      eye: 'visibility',

      // Additional government-related icons
      gavel: 'gavel',
      policy: 'policy',
      balance: 'balance',
      account_balance: 'account_balance',
      settings: 'settings',
      help: 'help',
      info: 'info',
      notifications: 'notifications',
      search: 'search',
      home: 'home',
      print: 'print',
      mail: 'mail_outline',
      phone: 'phone',
      location: 'location_on',
      message: 'message',
      warning: 'warning',
      error: 'error',
      security: 'security',
      dashboard: 'dashboard',
      folder: 'folder',
      document: 'description',
      chart: 'insert_chart',
      analytics: 'analytics',
      work: 'work',
      task: 'task',
      attach: 'attach_file',
      flag: 'flag',
      bookmark: 'bookmark',
      favorite: 'favorite',
      cloud: 'cloud',
      upload: 'cloud_upload',
      download: 'cloud_download',
    };

    return iconMap[iconName] || 'circle'; // Default icon if not found
  }
}
