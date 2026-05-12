import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { TableComponent, Column } from '../table/table.component';
import { LucideAngularModule, Plus, Layout, Smartphone } from 'lucide-angular';
import type { StickerLayout } from 'qrlayout-ui';

@Component({
  selector: 'app-labels',
  standalone: true,
  imports: [CommonModule, TableComponent, LucideAngularModule],
  templateUrl: './labels.component.html',
  styleUrl: './labels.component.css'
})
export class LabelsComponent implements OnInit {
  labels: StickerLayout[] = [];

  readonly PlusIcon = Plus;
  readonly LayoutIcon = Layout;
  readonly SmartphoneIcon = Smartphone;

  columns: Column[] = [
    { header: 'Template Name', id: 'name' },
    { header: 'Target Entity', id: 'targetEntity' },
    { header: 'Dimensions', id: 'dimensions' },
    { header: 'Elements', id: 'elements' }
  ];

  constructor(private router: Router, private storage: StorageService) {}

  ngOnInit() {
    this.storage.initializeDefaults();
    this.labels = this.storage.getLabels();
  }

  handleCreateNew() {
    this.router.navigate(['/labels/designer']);
  }

  handleEdit(label: StickerLayout) {
    this.router.navigate(['/labels/designer'], { queryParams: { id: label.id } });
  }

  handleDelete(label: StickerLayout) {
    if (confirm(`Are you sure you want to delete "${label.name}"?`)) {
      this.storage.deleteLabel(label.id);
      this.labels = this.storage.getLabels();
    }
  }
}
