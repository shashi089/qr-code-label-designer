import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { StickerLayout } from 'qrlayout-ui';

const STORAGE_KEY = 'qr_labels_data';
const EMPLOYEE_STORAGE_KEY = 'employee_data';
const MACHINE_STORAGE_KEY = 'machine_data';
const BIN_STORAGE_KEY = 'bin_data';

export interface Employee {
    id: string;
    fullName: string;
    employeeId: string;
    department: string;
    joinDate: string;
}

export interface Machine {
    id: string;
    machineName: string;
    machineCode: string;
    location: string;
    model: string;
}

export interface Bin {
    id: string;
    binCode: string;
    storageType: string;
    aisle: string;
    rack: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getLabels(): StickerLayout[] {
    if (!this.isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveLabels(labels: StickerLayout[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
  }

  addLabel(label: StickerLayout): void {
    const labels = this.getLabels();
    const index = labels.findIndex(l => l.id === label.id);
    if (index >= 0) {
      labels[index] = label;
    } else {
      labels.push(label);
    }
    this.saveLabels(labels);
  }

  deleteLabel(id: string): void {
    const labels = this.getLabels().filter(l => l.id !== id);
    this.saveLabels(labels);
  }

  getEmployees(): Employee[] {
    if (!this.isBrowser) return [];
    const data = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveEmployees(employees: Employee[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
  }

  addEmployee(employee: Employee): void {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === employee.id);
    if (index >= 0) {
      employees[index] = employee;
    } else {
      employees.push(employee);
    }
    this.saveEmployees(employees);
  }

  deleteEmployee(id: string): void {
    const employees = this.getEmployees().filter(e => e.id !== id);
    this.saveEmployees(employees);
  }

  getMachines(): Machine[] {
    if (!this.isBrowser) return [];
    const data = localStorage.getItem(MACHINE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveMachines(machines: Machine[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(MACHINE_STORAGE_KEY, JSON.stringify(machines));
  }

  addMachine(machine: Machine): void {
    const machines = this.getMachines();
    const index = machines.findIndex(m => m.id === machine.id);
    if (index >= 0) {
      machines[index] = machine;
    } else {
      machines.push(machine);
    }
    this.saveMachines(machines);
  }

  deleteMachine(id: string): void {
    const machines = this.getMachines().filter(m => m.id !== id);
    this.saveMachines(machines);
  }

  getBins(): Bin[] {
    if (!this.isBrowser) return [];
    const data = localStorage.getItem(BIN_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveBins(bins: Bin[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(BIN_STORAGE_KEY, JSON.stringify(bins));
  }

  addBin(bin: Bin): void {
    const bins = this.getBins();
    const index = bins.findIndex(b => b.id === bin.id);
    if (index >= 0) {
      bins[index] = bin;
    } else {
      bins.push(bin);
    }
    this.saveBins(bins);
  }

  deleteBin(id: string): void {
    const bins = this.getBins().filter(b => b.id !== id);
    this.saveBins(bins);
  }

  initializeDefaults(): void {
    if (!this.isBrowser) return;

    if (this.getEmployees().length === 0) {
      this.saveEmployees([
        { id: '1', fullName: 'Vikram Singh', employeeId: 'EMP-001', department: 'Operations', joinDate: '2023-01-10' },
        { id: '2', fullName: 'Ananya Gupta', employeeId: 'EMP-002', department: 'Engineering', joinDate: '2023-03-15' },
        { id: '3', fullName: 'Rohan Mehta', employeeId: 'EMP-003', department: 'Logistics', joinDate: '2023-06-20' }
      ]);
    }
    if (this.getMachines().length === 0) {
      this.saveMachines([
        { id: 'm1', machineName: 'Lakshmi CNC Router', machineCode: 'CNC-01', location: 'Section A', model: '2024-Pro' },
        { id: 'm2', machineName: 'Godrej Heavy Press', machineCode: 'PRS-05', location: 'Floor B', model: 'Heavy-Duty' },
        { id: 'm3', machineName: 'Kirloskar Generator', machineCode: 'GEN-01', location: 'Utility Area', model: 'Silent-500' }
      ]);
    }
    if (this.getBins().length === 0) {
      this.saveBins([
        { id: 'b1', binCode: 'BIN-DEL-R1', storageType: 'Pallet Rack', aisle: 'Delhi Aisle 01', rack: 'R1' },
        { id: 'b2', binCode: 'BIN-MUM-R2', storageType: 'Shelf', aisle: 'Mumbai Aisle 01', rack: 'R2' },
        { id: 'b3', binCode: 'BIN-BLR-R1', storageType: 'Cold Storage', aisle: 'Bangalore Aisle 02', rack: 'R1' }
      ]);
    }
    if (this.getLabels().length === 0) {
      this.saveLabels([
        {
          id: 'default-emp-layout',
          name: 'Professional ID Badge',
          targetEntity: 'employee',
          width: 85.6,
          height: 53.98,
          unit: 'mm',
          backgroundColor: '#ffffff',
          elements: [
            { id: 'e1', type: 'text', x: 30, y: 10, w: 50, h: 10, content: '{{fullName}}', style: { fontSize: 18, fontWeight: 'bold' } },
            { id: 'e2', type: 'text', x: 30, y: 20, w: 50, h: 8, content: '{{employeeId}}', style: { fontSize: 12 } },
            { id: 'e3', type: 'text', x: 30, y: 28, w: 50, h: 6, content: '{{department}}', style: { fontSize: 10, color: '#666666' } },
            { id: 'e4', type: 'qr', x: 5, y: 10, w: 22, h: 22, content: 'emp:{{employeeId}}' }
          ]
        },
        {
          id: 'default-machine-layout',
          name: 'Equipment Asset Tag',
          targetEntity: 'machine',
          width: 60,
          height: 30,
          unit: 'mm',
          backgroundColor: '#f8fafc',
          elements: [
            { id: 'm1', type: 'text', x: 25, y: 5, w: 32, h: 5, content: 'PROPERTY OF INDUSTRIAL CO.', style: { fontSize: 8, fontWeight: 'bold' } },
            { id: 'm2', type: 'text', x: 25, y: 12, w: 32, h: 8, content: '{{machineName}}', style: { fontSize: 14, fontWeight: 'bold' } },
            { id: 'm3', type: 'text', x: 25, y: 22, w: 32, h: 6, content: 'Code: {{machineCode}}', style: { fontSize: 10 } },
            { id: 'm4', type: 'qr', x: 3, y: 5, w: 20, h: 20, content: 'asset:{{machineCode}}' }
          ]
        },
        {
          id: 'default-storage-layout',
          name: 'Storage Location Label',
          targetEntity: 'storage',
          width: 100,
          height: 50,
          unit: 'mm',
          backgroundColor: '#ffffff',
          elements: [
            { id: 'b1', type: 'text', x: 10, y: 10, w: 50, h: 8, content: 'AISLE: {{aisle}}', style: { fontSize: 12 } },
            { id: 'b2', type: 'text', x: 10, y: 25, w: 80, h: 20, content: '{{binCode}}', style: { fontSize: 32, fontWeight: 'bold' } },
            { id: 'b4', type: 'qr', x: 65, y: 10, w: 30, h: 30, content: 'storage:{{binCode}}' }
          ]
        }
      ]);
    }
  }

  clearAll(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
    localStorage.removeItem(MACHINE_STORAGE_KEY);
    localStorage.removeItem(BIN_STORAGE_KEY);
  }
}
