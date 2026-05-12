import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Employee } from '../../services/storage.service';
import { TableComponent, Column } from '../table/table.component';
import { LucideAngularModule, Plus, X, Printer, FileText, Image as ImageIcon, Info } from 'lucide-angular';
import { StickerPrinter } from 'qrlayout-core';
import { exportToPDF } from 'qrlayout-core/pdf';
import type { StickerLayout } from 'qrlayout-ui';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, LucideAngularModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  labels: StickerLayout[] = [];
  selectedLayoutId: string = '';
  selectedEmployeeIds: string[] = [];

  isModalOpen: boolean = false;
  editingEmployee: Employee | null = null;
  formData: Partial<Employee> = {};

  printer: StickerPrinter;

  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly PrinterIcon = Printer;
  readonly FileTextIcon = FileText;
  readonly ImageIcon = ImageIcon;
  readonly InfoIcon = Info;

  columns: Column[] = [
    { header: 'Employee ID', accessorKey: 'employeeId' },
    { header: 'Full Name', accessorKey: 'fullName' },
    { header: 'Department', accessorKey: 'department' },
    { header: 'Join Date', accessorKey: 'joinDate' },
  ];

  constructor(private storage: StorageService) {
    this.printer = new StickerPrinter();
  }

  ngOnInit() {
    this.loadData();
  }

  get hasSelection(): boolean {
    return this.selectedEmployeeIds.length > 0;
  }

  get hasLayout(): boolean {
    return !!this.selectedLayoutId;
  }

  loadData() {
    this.employees = this.storage.getEmployees();
    const loadedLabels = this.storage.getLabels();
    this.labels = loadedLabels.filter(l => l.targetEntity === 'employee');
    if (this.labels.length > 0 && !this.selectedLayoutId) {
      this.selectedLayoutId = this.labels[0].id;
    }
  }

  handleOpenModal(employee?: Employee) {
    if (employee) {
      this.editingEmployee = employee;
      this.formData = { ...employee };
    } else {
      this.editingEmployee = null;
      this.formData = {};
    }
    this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
    this.editingEmployee = null;
    this.formData = {};
  }

  handleSave() {
    if (!this.formData.fullName || !this.formData.employeeId) return;

    const employee: Employee = {
      id: this.editingEmployee?.id || crypto.randomUUID(),
      fullName: this.formData.fullName!,
      employeeId: this.formData.employeeId!,
      department: this.formData.department || '',
      joinDate: (this.formData.joinDate || new Date().toISOString().split('T')[0]) as string
    };

    this.storage.addEmployee(employee);
    this.loadData();
    this.handleCloseModal();
  }

  handleDelete(employee: Employee) {
    if (confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
      this.storage.deleteEmployee(employee.id);
      this.loadData();
      this.selectedEmployeeIds = this.selectedEmployeeIds.filter(id => id !== employee.id);
    }
  }

  getSelectedEmployees() {
    return this.employees.filter(e => this.selectedEmployeeIds.includes(e.id));
  }

  getActiveLayout() {
    return this.labels.find(l => l.id === this.selectedLayoutId);
  }

  async handleExportPNG() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedEmployees();
    if (!layout || selected.length === 0) return;

    for (const emp of selected) {
      const dataUrl = await this.printer.renderToDataURL(layout, emp as any, { format: 'png' });
      const link = document.createElement('a');
      link.download = `${emp.fullName}-badge.png`;
      link.href = dataUrl;
      link.click();
    }
  }

  async handleExportPDF() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedEmployees();
    if (!layout || selected.length === 0) return;

    const pdf = await exportToPDF(layout, selected as any[]);
    pdf.save(`batch-badges-${Date.now()}.pdf`);
  }

  handleExportZPL() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedEmployees();
    if (!layout || selected.length === 0) return;

    const zplArray = this.printer.exportToZPL(layout, selected as any[]);
    const zplContent = zplArray.join('\n');

    console.log('ZPL Code generated:', zplContent);

    const blob = new Blob([zplContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-badges.zpl`;
    link.click();
  }
}
