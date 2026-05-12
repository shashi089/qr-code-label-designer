import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { StorageService } from './services/storage.service';
import { LucideAngularModule, Home, Tag, Users, Cpu, Package } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-demo';
  isDesigner = false;

  readonly HomeIcon = Home;
  readonly TagIcon = Tag;
  readonly UsersIcon = Users;
  readonly CpuIcon = Cpu;
  readonly PackageIcon = Package;

  constructor(private router: Router, private storage: StorageService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isDesigner = event.urlAfterRedirects.includes('/designer');
    });
    
    // Initialize default data
    this.storage.initializeDefaults();
  }

  handleReset() {
    if (confirm('Are you sure? This will delete all labels and employees.')) {
      this.storage.clearAll();
      window.location.reload();
    }
  }

  isActive(route: string, exact: boolean = false): boolean {
    if (exact) {
      return this.router.url === route;
    }
    return this.router.url.startsWith(route);
  }
}
