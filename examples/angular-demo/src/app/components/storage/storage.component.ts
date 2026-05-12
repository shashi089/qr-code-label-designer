import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Bin } from '../../services/storage.service';
import { TableComponent, Column } from '../table/table.component';
import { LucideAngularModule, Plus, X, Printer, FileText, Image as ImageIcon, Info } from 'lucide-angular';
import { StickerPrinter } from 'qrlayout-core';
import { exportToPDF } from 'qrlayout-core/pdf';
import type { StickerLayout } from 'qrlayout-ui';

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, LucideAngularModule],
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.css'
})
export class StorageComponent implements OnInit {
  bins: Bin[] = [];
  labels: StickerLayout[] = [];
  selectedLayoutId: string = '';
  selectedBinIds: string[] = [];

  isModalOpen: boolean = false;
  editingBin: Bin | null = null;
  formData: Partial<Bin> = {};

  printer: StickerPrinter;

  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly PrinterIcon = Printer;
  readonly FileTextIcon = FileText;
  readonly ImageIcon = ImageIcon;
  readonly InfoIcon = Info;

  columns: Column[] = [
    { header: 'BIN Code', accessorKey: 'binCode' },
    { header: 'Storage Type', accessorKey: 'storageType' },
    { header: 'Aisle', accessorKey: 'aisle' },
    { header: 'Rack', accessorKey: 'rack' },
  ];

  constructor(private storage: StorageService) {
    this.printer = new StickerPrinter();
  }

  ngOnInit() {
    this.loadData();
  }

  get hasSelection(): boolean {
    return this.selectedBinIds.length > 0;
  }

  get hasLayout(): boolean {
    return !!this.selectedLayoutId;
  }

  loadData() {
    this.bins = this.storage.getBins();
    const loadedLabels = this.storage.getLabels();
    this.labels = loadedLabels.filter(l => l.targetEntity === 'storage');
    if (this.labels.length > 0 && !this.selectedLayoutId) {
      this.selectedLayoutId = this.labels[0].id;
    }
  }

  handleOpenModal(bin?: Bin) {
    if (bin) {
      this.editingBin = bin;
      this.formData = { ...bin };
    } else {
      this.editingBin = null;
      this.formData = {};
    }
    this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
    this.editingBin = null;
    this.formData = {};
  }

  handleSave() {
    if (!this.formData.binCode || !this.formData.aisle) return;

    const bin: Bin = {
      id: this.editingBin?.id || crypto.randomUUID(),
      binCode: this.formData.binCode!,
      storageType: this.formData.storageType || '',
      aisle: this.formData.aisle!,
      rack: this.formData.rack || ''
    };

    this.storage.addBin(bin);
    this.loadData();
    this.handleCloseModal();
  }

  handleDelete(bin: Bin) {
    if (confirm(`Are you sure you want to delete Bin ${bin.binCode}?`)) {
      this.storage.deleteBin(bin.id);
      this.loadData();
      this.selectedBinIds = this.selectedBinIds.filter(id => id !== bin.id);
    }
  }

  getSelectedBins() {
    return this.bins.filter(b => this.selectedBinIds.includes(b.id));
  }

  getActiveLayout() {
    return this.labels.find(l => l.id === this.selectedLayoutId);
  }

  async handleExportPNG() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedBins();
    if (!layout || selected.length === 0) return;

    for (const item of selected) {
      const dataUrl = await this.printer.renderToDataURL(layout, item as any, { format: 'png' });
      const link = document.createElement('a');
      link.download = `bin-${item.binCode}.png`;
      link.href = dataUrl;
      link.click();
    }
  }

  async handleExportPDF() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedBins();
    if (!layout || selected.length === 0) return;

    const pdf = await exportToPDF(layout, selected as any[]);
    pdf.save(`batch-bin-labels-${Date.now()}.pdf`);
  }

  handleExportZPL() {
    const layout = this.getActiveLayout();
    const selected = this.getSelectedBins();
    if (!layout || selected.length === 0) return;

    const zplArray = this.printer.exportToZPL(layout, selected as any[]);
    const zplContent = zplArray.join('\n');
    console.log('ZPL Code generated:', zplContent);

    const blob = new Blob([zplContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-bin-labels.zpl`;
    link.click();
  }
}
