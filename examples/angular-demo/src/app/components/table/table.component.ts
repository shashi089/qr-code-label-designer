import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Edit2, Trash2 } from 'lucide-angular';

export interface Column {
  header: string;
  accessorKey?: string;
  id?: string;
  class?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() keyField: string = 'id';
  @Input() selectedIds?: string[];
  
  @Output() selectedIdsChange = new EventEmitter<string[]>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<any>;

  readonly Edit2Icon = Edit2;
  readonly Trash2Icon = Trash2;

  get isSelectionEnabled(): boolean {
    return this.selectedIds !== undefined;
  }

  get allIds(): string[] {
    return this.data.map(d => String(d[this.keyField]));
  }

  get isAllSelected(): boolean {
    return this.isSelectionEnabled && this.selectedIds?.length === this.data.length && this.data.length > 0;
  }

  get isIndeterminate(): boolean {
    const len = this.selectedIds?.length || 0;
    return this.isSelectionEnabled && len > 0 && len < this.data.length;
  }

  handleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIdsChange.emit(this.allIds);
    } else {
      this.selectedIdsChange.emit([]);
    }
  }

  handleSelectRow(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.selectedIds) return;
    
    let newSelection = [...this.selectedIds];
    if (checked) {
      newSelection.push(id);
    } else {
      newSelection = newSelection.filter(i => i !== id);
    }
    this.selectedIdsChange.emit(newSelection);
  }

  isSelected(item: any): boolean {
    return this.selectedIds?.includes(String(item[this.keyField])) || false;
  }

  hasObservers(emitter: EventEmitter<any>): boolean {
    return emitter.observed;
  }
}
