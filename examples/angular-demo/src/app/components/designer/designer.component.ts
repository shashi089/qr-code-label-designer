import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { QRLayoutDesigner, EntitySchema, StickerLayout } from 'qrlayout-ui';

const SAMPLE_SCHEMAS: Record<string, EntitySchema> = {
  employee: {
    label: "Employee Master",
    fields: [
      { name: "fullName", label: "Full Name" },
      { name: "employeeId", label: "Employee ID" },
      { name: "department", label: "Department" },
      { name: "joinDate", label: "Join Date" },
    ],
    sampleData: {
      fullName: "Aditi Sharma",
      employeeId: "EMP-092",
      department: "Quality Assurance",
      joinDate: "2023-11-05"
    }
  },
  machine: {
    label: "Machine Master",
    fields: [
      { name: "machineName", label: "Machine Name" },
      { name: "machineCode", label: "Machine Code" },
      { name: "location", label: "Location" },
      { name: "model", label: "Model" },
    ],
    sampleData: {
      machineName: "Tata hydraulic Press",
      machineCode: "P-4500-X",
      location: "Assembly Line 04",
      model: "THP-2024"
    }
  },
  storage: {
    label: "Storage Master",
    fields: [
      { name: "binCode", label: "BIN Code" },
      { name: "storageType", label: "Storage Type" },
      { name: "aisle", label: "Aisle" },
      { name: "rack", label: "Rack Number" },
    ],
    sampleData: {
      binCode: "WH-CHE-A12",
      storageType: "Cold Storage",
      aisle: "Chennai Aisle 12",
      rack: "R-08"
    }
  }
};

const DEFAULT_NEW_LAYOUT: Omit<StickerLayout, 'id'> = {
  name: "New QR Label",
  targetEntity: "employee",
  width: 100,
  height: 60,
  unit: "mm",
  backgroundColor: "#ffffff",
  elements: []
};

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './designer.component.html',
  styleUrl: './designer.component.css'
})
export class DesignerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  
  private designer: QRLayoutDesigner | null = null;
  readonly ArrowLeftIcon = ArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const currentLayoutId = params['id'] as string | null;
      let initialLayout: StickerLayout;

      if (currentLayoutId) {
        const found = this.storage.getLabels().find(l => l.id === currentLayoutId);
        if (found) {
          initialLayout = found;
        } else {
          initialLayout = { ...DEFAULT_NEW_LAYOUT, id: crypto.randomUUID() } as StickerLayout;
        }
      } else {
        initialLayout = { ...DEFAULT_NEW_LAYOUT, id: crypto.randomUUID() } as StickerLayout;
      }

      if (this.container?.nativeElement) {
        // Destroy existing designer if route changes while component is active
        if (this.designer) {
          this.designer.destroy();
        }

        this.designer = new QRLayoutDesigner({
          element: this.container.nativeElement,
          entitySchemas: SAMPLE_SCHEMAS,
          initialLayout: initialLayout,
          onSave: (savedLayout) => {
            this.storage.addLabel(savedLayout);
            this.router.navigate(['/labels']);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.designer) {
      this.designer.destroy();
      this.designer = null;
    }
  }

  handleBack() {
    this.router.navigate(['/labels']);
  }
}
