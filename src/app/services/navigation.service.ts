import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private menuItemsSource = new BehaviorSubject<MenuItem[]>([
 /*   {
      label: 'Anwesenheitsliste',
      icon: 'list',
      route: '/attendance',
      active: false,
    },
    */
    {
      label: 'Anwesenheitsliste',
      icon: 'user',
      route: '/anwesenheitsliste',
      active: false,
    },
    {
      label: 'Tätigkeiten buchen',
      icon: 'edit',
      route: '/book-activities',
      active: false,
    },
    {
      label: 'Tätigkeiten historisch',
      icon: 'clock',
      route: '/activities-history',
      active: false,
    },
    {
      label: 'Tätigkeiten korrigieren',
      icon: 'edit-2',
      route: '/edit-activities',
      active: false,
    },
    /*
    {
      label: 'Abwesenheit',
      icon: 'user-minus',
      route: '/abwesenheit',
      active: false,
    },*/
    {
      label: 'Abwesenheit',
      icon: 'user-minus',
      route: '/abwesenheit-2',
      active: false,
    },
    {
      label: 'Abwesenheit korrigieren',
      icon: 'user-x',
      route: '/edit-absence',
      active: true, // Default active tab
    },
    {
      label: 'Nachverrechnung',
      icon: 'calculator',
      route: '/calculation',
      active: false,
    },
    {
      label: 'Bereitschaft korrigieren',
      icon: 'clock',
      route: '/standby',
      active: false,
    },
    {
      label: 'Freigabe korrigieren',
      icon: 'check-circle',
      route: '/freigabe-korrigieren',
      active: false,
    },
    {
      label: 'Freigabe historisch',
      icon: 'archive',
      route: '/freigabe-history',
      active: false,
    },
     {
      label: 'Freigabe',
      icon: 'archive',
      route: '/freigabe',
      active: false,
    },
    {
      label: 'Stempelzeiten',
      icon: 'calendar',
      route: '/timestamps',
      active: false,
    },
    /*
    {
      label: 'Personen',
      icon: 'users',
      route: '/persons',
      active: false,
    }, */
    {
      label: 'Personen',
      icon: 'users',
      route: '/personen',
      active: false,
    },
    {
      label: 'Produkte',
      icon: 'package',
      route: '/products',
      active: false,
    },
    {
      label: 'Verträge',
      icon: 'file-text',
      route: '/contracts',
      active: false,
    },
    {
      label: 'Organisationseinheiten',
      icon: 'grid',
      route: '/organization',
      active: false,
    },
    {
      label: 'organization2',
      icon: 'grid',
      route: '/organization2',
      active: false,
    },
    {
      label: 'preson2',
      icon: 'users',
      route: '/preson2',
      active: false,
    },
    {
      label: 'Zivildiener',
      icon: 'user',
      route: '/civilian-service',
      active: false,
    },
    {
      label: 'Auswertungen',
      icon: 'bar-chart-2',
      route: '/reports',
      active: false,
    },
    {
      label: 'Beenden',
      icon: 'log-out',
      route: '/exit',
      active: false,
    },
  ]);

  private activeRouteSource = new BehaviorSubject<string>('/edit-absence');

  menuItems$ = this.menuItemsSource.asObservable();
  activeRoute$ = this.activeRouteSource.asObservable();

  constructor(private router: Router) {}

  setActiveMenuItem(route: string): void {
    const updatedItems = this.menuItemsSource.value.map((item) => ({
      ...item,
      active: item.route === route,
    }));

    this.menuItemsSource.next(updatedItems);
    this.activeRouteSource.next(route);

    // Navigate to the route without the leading slash
    if (route.startsWith('/')) {
      this.router.navigateByUrl(route.substring(1));
    }
  }

  getActiveRoute(): string {
    return this.activeRouteSource.value;
  }
}
