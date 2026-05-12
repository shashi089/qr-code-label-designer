import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Machine } from '../../services/storage.service';
import { TableComponent, Column } from '../table/table.component';
import { LucideAngularModule, Plus, X, Printer, FileText, Image as ImageIcon, Info } from 'lucide-angular';
import { StickerPrinter } from 'qrlayout-core';
import { exportToPDF } from 'qrlayout-core/pdf';
import type { StickerLayout } from 'qrlayout-ui';

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, LucideAngularModule],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.css'
})
export class MachinesComponent implements OnInit {
  machines: Machine[] = [];
  labels: StickerLayout[] = [];
  selectedLayoutId: string = '';
  selectedMachineIds: string[] = [];

  isModalOpen: boolean = false;
  editingMachine: Machine | null = null;
  formData: Partial<Machine> = {};

  printer: StickerPrinter;

  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly PrinterIcon = Printer;
  readonly FileTextIcon = FileText;
  readonly ImageIcon = ImageIcon;
  readonly InfoIcon = Info;

  columns: Column[] = [
    { header: 'Machine Code', accessorKey: 'machineCode' },
    { header: 'Machine Name', accessorKey: 'machineName' },
    { header: 'Location', accessorKey: 'location' },
    { header: 'Model', accessorKey: 'model' },
  ];

  constructor(private storage: StorageService) {
    this.printer = new StickerPrinter();
  }

  ngOnInit() {
    this.loadData();
  }

  get hasSelection(): boolean {
    return this.selectedMachineIds.length > 0;
  }

  get hasLayout(): boolean {
    return !!this.selectedLayoutId;
  }

  loadData() {
    this.machines = this.storage.getMachines();
    const loadedLabels = this.storage.getLabels();
    this.labels = loadedLabels.filter(l => l.targetEntity === 'machine');
    if (this.labels.length > 0 && !this.selectedLayoutId) {
      this.selectedLayoutId = this.labels[0].id;
    }
  }

  handleOpenModal(machine?: Machine) {
    if (machine) {
      this.editingMachine = machine;
      this.formData = { ...machine };
    } else {
      this.editingMachine = null;
      this.formData = {};
    }
    this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
    this.editingMachine = null;
    this.formData = {};
  }

  handleSave() {
    if (!this.formData.machineName || !this.formData.machineCode) return;

    const machine: Machine = {
      id: this.editingMachine?.id || crypto.randomUUID(),
      machineName: this.formData.machineName!,
      machineCode: this.formData.machineCode!,
      location: this.formData.location || '',
      model: this.formData.model || ''
    };

    this.storage.addMachine(machine);
    this.loadData();
    this.handleCloseModal();
  }

  handleDelete(machine: Machine) {
    if (confirm(`Are you sure you want to delete ${machine.machineName}?`)) {
      this.storage.deleteMachine(machine.id);
      this.loadData();
      this.selectedMachineIds = this.selectedMachineIds.filter(id => id !== machine.id);
    }
  }

  getSelectedMachines() {
    return this.machines.filter(m => this.selectedMachineIds.includes(m.id));
  }

  getActiveLayout() {
    return this.labels.find(l => l.id === this.selectedLayoutId);
  }

  async handleExportPNG() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedMachines();
    if (!layout || selected.length === 0) return;

    for (const machine of selected) {
      const dataUrl = await this.printer.renderToDataURL(layout, machine as any, { format: 'png' });
      const link = document.createElement('a');
      link.download = `${machine.machineName}-label.png`;
      link.href = dataUrl;
      link.click();
    }
  }

  async handleExportPDF() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedMachines();
    if (!layout || selected.length === 0) return;

    const pdf = await exportToPDF(layout, selected as any[]);
    pdf.save(`batch-machine-labels-${Date.now()}.pdf`);
  }

  handleExportZPL() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedMachines();
    if (!layout || selected.length === 0) return;

    const zplArray = this.printer.exportToZPL(layout, selected as any[]);
    const zplContent = zplArray.join('\n');
    console.log('ZPL Code generated:', zplContent);

    const blob = new Blob([zplContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-machine-labels.zpl`;
    link.click();
  }
}
