import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LabelsComponent } from './components/labels/labels.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { MachinesComponent } from './components/machines/machines.component';
import { StorageComponent } from './components/storage/storage.component';
import { DesignerComponent } from './components/designer/designer.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'labels', component: LabelsComponent },
  { path: 'labels/designer', component: DesignerComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'machines', component: MachinesComponent },
  { path: 'storage', component: StorageComponent },
  { path: '**', redirectTo: '' }
];
