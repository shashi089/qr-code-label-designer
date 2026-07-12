import { StickerPrinter, StickerLayout, StickerElement } from "qrlayout-core";
import "./styles.css";

export { StickerPrinter };
export type { StickerLayout, StickerElement };

interface DesignerLayout extends StickerLayout {
    targetEntity?: string;
}

export interface EntityField {
    name: string;
    label: string;
}

export interface EntitySchema {
    label: string;
    fields: EntityField[];
    sampleData: any;
}

export interface DesignerOptions {
    element: HTMLElement;
    initialLayout?: StickerLayout;
    entitySchemas?: Record<string, EntitySchema>;
    onSave?: (layout: StickerLayout) => void;
}

export class QRLayoutDesigner {
    private container: HTMLElement;
    private currentLayout: DesignerLayout;
    private entitySchemas: Record<string, EntitySchema>;
    private selectedElementId: string | null = null;
    private isDarkMode = false;
    private pxPerUnit = 1;
    private isDragging = false;
    private printer: StickerPrinter;
    private onSaveCallback?: (layout: StickerLayout) => void;

    // Phase 1.2: Undo / Redo
    private undoStack: string[] = [];
    private redoStack: string[] = [];
    private readonly MAX_UNDO = 20;

    // Phase 1.2: Snap-to-grid
    private snapToGrid = false;
    private readonly GRID_SIZE = 1; // in current layout units

    // Phase 1.2: Keyboard handler reference for cleanup
    private _keyHandler!: (e: KeyboardEvent) => void;

    // DOM Elements
    private canvas!: HTMLCanvasElement;
    private editorOverlay!: HTMLDivElement;
    private elementsContainer!: HTMLDivElement;
    private propertyPanel!: HTMLDivElement;
    private propContent!: HTMLDivElement;
    private leftSidebar!: HTMLElement;
    private rightSidebar!: HTMLElement;
    private sampleDataContainer!: HTMLDivElement;
    private undoBtn!: HTMLButtonElement;
    private redoBtn!: HTMLButtonElement;

    // Inputs
    private inputs!: {
        entity: HTMLSelectElement;
        name: HTMLInputElement;
        width: HTMLInputElement;
        height: HTMLInputElement;
        unit: HTMLSelectElement;
        labelWidth: HTMLLabelElement;
        labelHeight: HTMLLabelElement;
        bg: HTMLInputElement;
        bgPicker: HTMLInputElement;
        sampleData: HTMLDivElement;
    };

    constructor(options: DesignerOptions) {
        this.container = options.element;
        this.printer = new StickerPrinter();
        this.onSaveCallback = options.onSave;
        this.entitySchemas = options.entitySchemas || {};

        this.currentLayout = (options.initialLayout as DesignerLayout) || {
            id: "layout-" + Date.now(),
            name: "New Layout",
            targetEntity: "",
            width: 100,
            height: 60,
            unit: "mm",
            backgroundColor: "#ffffff",
            elements: []
        };

        this.init();
    }

    private init() {
        this.renderTemplate();
        this.cacheDOM();
        this.renderEntityOptions();
        this.syncInputsFromLayout();
        this.bindEvents();
        this.renderSampleDataEditor();
        this.renderElementsList();
        this.updatePreview();
    }

    private renderTemplate() {
        this.container.classList.add("qrlayout-designer");
        this.container.innerHTML = `
        <header>
            <div data-el="header-left"></div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn btn-icon btn-outline" data-el="undo-btn" data-action="undo" title="Undo (Ctrl+Z)" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                </button>
                <button class="btn btn-icon btn-outline" data-el="redo-btn" data-action="redo" title="Redo (Ctrl+Y)" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                </button>
                <div style="width: 1px; height: 24px; background: var(--border-color);"></div>
                <button class="btn btn-icon btn-outline" data-action="toggle-theme" title="Toggle Dark Mode">
                    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                </button>
                <button class="btn btn-primary" data-action="save">Save Layout</button>
            </div>
        </header>
        <div class="main-container">
            <div class="edit-view" style="display: flex; flex: 1; height: 100%;">
                <!-- LEFT SIDEBAR: CONFIG & ELEMENTS -->
                <aside class="sidebar">
                    <!-- Configuration -->
                    <div class="sidebar-section">
                        <div class="sidebar-title">Layout Settings</div>
                        <div class="form-group">
                            <label>Target Entity</label>
                            <select data-input="entity">
                                <option value="">Select Entity...</option>
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Internal Layout Name</label>
                            <input type="text" data-input="name" placeholder="Standard Badge" />
                        </div>
                        <div class="form-group">
                            <label>Size Preset</label>
                            <select data-input="preset">
                                <option value="">Custom</option>
                                <option value="100x60mm">Badge — 100 × 60 mm</option>
                                <option value="100x50mm">EU Standard — 100 × 50 mm</option>
                                <option value="50x25mm">Mini Tag — 50 × 25 mm</option>
                                <option value="62x29mm">Brother QL — 62 × 29 mm</option>
                                <option value="4x6in">Shipping Label — 4" × 6"</option>
                                <option value="3x2in">Asset Tag — 3" × 2"</option>
                                <option value="2x1in">Small Label — 2" × 1"</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group" style="flex: 1">
                                <label data-label="width">Width (mm)</label>
                                <input type="number" data-input="width" value="100" step="0.01" />
                            </div>
                            <div class="form-group" style="flex: 1">
                                <label data-label="height">Height (mm)</label>
                                <input type="number" data-input="height" value="60" step="0.01" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Measurement Unit</label>
                            <select data-input="unit">
                                <option value="mm">Millimeters (mm)</option>
                                <option value="cm">Centimeters (cm)</option>
                                <option value="in">Inches (in)</option>
                                <option value="px">Pixels (px)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Base Background</label>
                            <div class="color-picker-wrapper">
                                <input type="color" data-input="bg-picker" class="color-preview" style="padding: 0; border: 1px solid var(--border-color); cursor: pointer; background: none;" />
                                <input type="text" data-input="bg" value="#ffffff" placeholder="#ffffff" />
                            </div>
                        </div>
                    </div>

                    <!-- Elements List -->
                    <div class="sidebar-section">
                        <div class="sidebar-title">
                            Elements
                            <div style="display: flex; gap: 6px">
                                <button class="btn btn-outline btn-sm" data-action="add-text" title="Add Text">+ Text</button>
                                <button class="btn btn-outline btn-sm" data-action="add-qr" title="Add QR">+ QR</button>
                                <button class="btn btn-outline btn-sm" data-action="add-barcode" title="Add Barcode">+ Barcode</button>
                            </div>
                        </div>
                        <div data-el="elements-container" class="element-list" style="margin-top: 8px;"></div>
                    </div>

                    <!-- Sample Data Trigger -->
                    <div class="sidebar-section" style="margin-top: auto; border-top: 1px solid var(--border-color); border-bottom: none;">
                        <button class="btn btn-outline btn-block" data-action="edit-sample-data" style="gap: 10px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
                            Edit Sample Data
                        </button>
                    </div>
                </aside>

                <!-- CENTER: CANVAS -->
                <main class="preview-area">
                    <button id="toggle-left" class="sidebar-toggle" title="Toggle Settings">☰</button>
                    <button id="toggle-right" class="sidebar-toggle" title="Toggle Properties" style="display: none;">✎</button>

                    <div class="canvas-toolbar">
                        <label class="snap-grid-label" title="Snap elements to a 1-unit grid while dragging">
                            <input type="checkbox" data-action="toggle-grid" />
                            <span>Snap to Grid</span>
                        </label>
                        <span class="canvas-toolbar-hint">Del — delete · Arrow — nudge · Shift+Arrow — nudge 5x · Ctrl+D — duplicate</span>
                    </div>

                    <div class="canvas-wrapper">
                        <canvas data-el="preview-canvas"></canvas>
                        <div data-el="editor-overlay" class="editor-overlay"></div>
                    </div>
                </main>

                <!-- RIGHT SIDEBAR: PROPERTIES -->
                <aside class="sidebar-right" data-el="property-panel" style="display: none;">
                    <div class="sidebar-section">
                        <div class="sidebar-title">Element Properties</div>
                        <div data-el="prop-content"></div>
                        <button class="btn btn-danger btn-block" data-action="delete-element" style="margin-top: 24px">Delete Element</button>
                    </div>
                </aside>
            </div>
        </div>

        <!-- MODAL FOR SAMPLE DATA -->
        <div class="modal-overlay" data-el="sample-data-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Sample Data</h3>
                    <button class="btn-close" data-action="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 20px;">
                        Update the values below to see how they appear on your layout in real-time.
                    </p>
                    <div data-el="sample-data-container" class="sample-data-grid"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" data-action="close-modal">Done Editing</button>
                </div>
            </div>
        </div>
        `;
    }

    private cacheDOM() {
        const q = (sel: string) => this.container.querySelector(sel) as HTMLElement;
        const qi = (key: string) => this.container.querySelector(`[data-input="${key}"]`) as any;

        this.canvas = q('[data-el="preview-canvas"]') as HTMLCanvasElement;
        this.editorOverlay = q('[data-el="editor-overlay"]') as HTMLDivElement;
        this.elementsContainer = q('[data-el="elements-container"]') as HTMLDivElement;
        this.propertyPanel = q('[data-el="property-panel"]') as HTMLDivElement;
        this.propContent = q('[data-el="prop-content"]') as HTMLDivElement;
        this.leftSidebar = q('.sidebar');
        this.rightSidebar = q('.sidebar-right');
        this.undoBtn = q('[data-el="undo-btn"]') as HTMLButtonElement;
        this.redoBtn = q('[data-el="redo-btn"]') as HTMLButtonElement;

        this.inputs = {
            entity: qi('entity'),
            name: qi('name'),
            width: qi('width'),
            height: qi('height'),
            unit: qi('unit'),
            labelWidth: q('[data-label="width"]') as HTMLLabelElement,
            labelHeight: q('[data-label="height"]') as HTMLLabelElement,
            bg: qi('bg'),
            bgPicker: qi('bg-picker'),
            sampleData: q('[data-el="sample-data-container"]') as HTMLDivElement
        };
        this.sampleDataContainer = this.inputs.sampleData;
    }

    private renderEntityOptions() {
        const select = this.inputs.entity;
        while (select.options.length > 1) {
            select.remove(1);
        }

        Object.keys(this.entitySchemas).forEach(key => {
            const schema = this.entitySchemas[key];
            const option = document.createElement("option");
            option.value = key;
            option.text = schema.label || key;
            select.add(option);
        });
    }

    private syncInputsFromLayout() {
        this.inputs.entity.value = this.currentLayout.targetEntity || "";
        this.inputs.name.value = this.currentLayout.name;
        this.inputs.width.value = String(this.currentLayout.width);
        this.inputs.height.value = String(this.currentLayout.height);
        this.inputs.unit.value = this.currentLayout.unit;
        this.inputs.labelWidth.innerText = `Width (${this.currentLayout.unit})`;
        this.inputs.labelHeight.innerText = `Height (${this.currentLayout.unit})`;
        this.inputs.bg.value = this.currentLayout.backgroundColor || "#ffffff";
        const isValidHex = (val: string) => /^#[0-9A-F]{6}$/i.test(val);
        if (isValidHex(this.inputs.bg.value)) {
            this.inputs.bgPicker.value = this.inputs.bg.value;
        }
    }

    private bindEvents() {
        // Undo / Redo buttons
        this.undoBtn.addEventListener('click', () => this.undo());
        this.redoBtn.addEventListener('click', () => this.redo());

        // Global Buttons
        this.container.querySelector('[data-action="toggle-theme"]')?.addEventListener('click', (e) => {
            this.isDarkMode = !this.isDarkMode;
            this.container.classList.toggle("dark-mode", this.isDarkMode);
            const btn = (e.currentTarget as HTMLElement);
            const sun = btn.querySelector('.sun-icon') as HTMLElement;
            const moon = btn.querySelector('.moon-icon') as HTMLElement;
            if (this.isDarkMode) {
                sun.style.display = 'block';
                moon.style.display = 'none';
            } else {
                sun.style.display = 'none';
                moon.style.display = 'block';
            }
        });

        this.container.querySelector('[data-action="export-json"]')?.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(this.currentLayout, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${this.currentLayout.name.toLowerCase().replace(/ /g, "-")}.json`;
            a.click();
        });

        this.container.querySelector('[data-action="save"]')?.addEventListener('click', () => {
            if (this.onSaveCallback) {
                this.onSaveCallback(this.currentLayout);
            }
        });

        this.container.querySelector('[data-action="edit-sample-data"]')?.addEventListener('click', () => {
            this.showSampleDataModal();
        });

        this.container.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelector('[data-el="sample-data-modal"]')?.classList.remove('show');
            });
        });

        // Sidebar Toggles
        this.container.querySelector('#toggle-left')?.addEventListener('click', () => {
            this.leftSidebar.classList.toggle("show");
        });
        const toggleRight = this.container.querySelector('#toggle-right');
        toggleRight?.addEventListener('click', () => {
            this.rightSidebar.classList.toggle("show");
        });

        // Layout Inputs
        this.inputs.entity.onchange = (e) => {
            this.currentLayout.targetEntity = (e.target as HTMLSelectElement).value;
            this.renderSampleDataEditor();
            this.renderPropertyPanel();
            this.updatePreview();
        };
        this.inputs.name.oninput = (e) => this.currentLayout.name = (e.target as HTMLInputElement).value;
        this.inputs.width.oninput = (e) => { this.currentLayout.width = parseFloat((e.target as HTMLInputElement).value) || 100; this.updatePreview(); };
        this.inputs.height.oninput = (e) => { this.currentLayout.height = parseFloat((e.target as HTMLInputElement).value) || 60; this.updatePreview(); };
        this.inputs.unit.onchange = (e) => {
            this.currentLayout.unit = (e.target as HTMLSelectElement).value as any;
            this.inputs.labelWidth.innerText = `Width (${this.currentLayout.unit})`;
            this.inputs.labelHeight.innerText = `Height (${this.currentLayout.unit})`;
            this.updatePreview();
        };
        this.inputs.bg.oninput = (e) => {
            const val = (e.target as HTMLInputElement).value;
            this.currentLayout.backgroundColor = val;
            const isValidHex = (v: string) => /^#[0-9A-F]{6}$/i.test(v);
            if (isValidHex(val)) {
                this.inputs.bgPicker.value = val;
            }
            this.updatePreview();
        };

        this.inputs.bgPicker.oninput = (e) => {
            const val = (e.target as HTMLInputElement).value;
            this.currentLayout.backgroundColor = val;
            this.inputs.bg.value = val;
            this.updatePreview();
        };

        // Element Actions
        this.container.querySelector('[data-action="add-text"]')?.addEventListener('click', () => {
            this.snapshot();
            const id = "t" + Date.now();
            this.currentLayout.elements.push({ id, type: 'text', x: 10, y: 10, w: 40, h: 10, content: "New Text" });
            this.selectElement(id);
            this.updatePreview();
        });

        this.container.querySelector('[data-action="add-qr"]')?.addEventListener('click', () => {
            this.snapshot();
            const id = "q" + Date.now();
            this.currentLayout.elements.push({ id, type: 'qr', x: 5, y: 5, w: 20, h: 20, content: "{{id}}" });
            this.selectElement(id);
            this.updatePreview();
        });

        this.container.querySelector('[data-action="add-barcode"]')?.addEventListener('click', () => {
            this.snapshot();
            const id = "b" + Date.now();
            this.currentLayout.elements.push({ id, type: 'barcode', x: 5, y: 5, w: 50, h: 15, content: "{{id}}", barcodeFormat: 'CODE128' });
            this.selectElement(id);
            this.updatePreview();
        });

        this.container.querySelector('[data-action="delete-element"]')?.addEventListener('click', () => {
            this.deleteSelectedElement();
        });

        // Snap to grid toggle
        this.container.querySelector('[data-action="toggle-grid"]')?.addEventListener('change', (e) => {
            this.snapToGrid = (e.target as HTMLInputElement).checked;
            this.updateEditorOverlay();
        });

        // Size preset
        const presetSelect = this.container.querySelector('[data-input="preset"]') as HTMLSelectElement;
        presetSelect?.addEventListener('change', (e) => {
            const val = (e.target as HTMLSelectElement).value;
            if (val) {
                this.applyPreset(val);
                (e.target as HTMLSelectElement).value = "";
            }
        });

        // Keyboard shortcuts
        this._keyHandler = (e: KeyboardEvent) => {
            const tag = (document.activeElement as HTMLElement)?.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            if (isInput) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault(); this.undo(); return;
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault(); this.redo(); return;
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElementId) {
                e.preventDefault(); this.deleteSelectedElement(); return;
            }
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && this.selectedElementId) {
                e.preventDefault(); this.nudgeSelected(e.key, e.shiftKey ? 5 : 1); return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && this.selectedElementId) {
                e.preventDefault(); this.duplicateSelected(); return;
            }
            if (e.key === 'Escape') {
                this.selectElement(null); return;
            }
        };
        document.addEventListener('keydown', this._keyHandler);

        // Resize observer to handle responsiveness
        new ResizeObserver(() => {
            if (this.container.offsetWidth > 768) {
                this.leftSidebar.classList.remove("show");
                this.rightSidebar.classList.remove("show");
            }
            this.renderPropertyPanel();
        }).observe(this.container);
    }

    public async updatePreview() {
        if (!this.canvas || !this.currentLayout) return;

        const sampleData = (this.currentLayout.targetEntity && this.entitySchemas[this.currentLayout.targetEntity])
            ? this.entitySchemas[this.currentLayout.targetEntity].sampleData
            : {};

        // Skipping canvas re-render during drag prevents other elements from shaking.
        if (!this.isDragging) {
            await this.printer.renderToCanvas(this.currentLayout, sampleData, this.canvas);
            const rect = this.canvas.getBoundingClientRect();
            if (rect.width > 0 && this.currentLayout.width > 0) {
                this.pxPerUnit = rect.width / this.currentLayout.width;
            }
        }

        this.updateEditorOverlay();
    }

    private showSampleDataModal() {
        this.renderSampleDataEditor();
        this.container.querySelector('[data-el="sample-data-modal"]')?.classList.add('show');
    }

    private renderSampleDataEditor() {
        if (!this.sampleDataContainer) return;

        const entity = this.currentLayout.targetEntity;
        if (!entity || !this.entitySchemas[entity]) {
            this.sampleDataContainer.innerHTML = `
                <div style="font-size: 0.75rem; color: var(--text-secondary); padding: 12px; background: var(--panel-bg-alt); border-radius: 8px; border: 1px dashed var(--border-color); text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>Select an entity above to see fields</span>
                </div>
            `;
            return;
        }

        const schema = this.entitySchemas[entity];
        this.sampleDataContainer.innerHTML = "";

        const grid = document.createElement("div");
        grid.className = "sample-data-grid-container";

        schema.fields.forEach(field => {
            const group = document.createElement("div");
            group.className = "form-group";
            group.style.margin = "0";

            const label = document.createElement("label");
            label.style.display = "flex";
            label.style.justifyContent = "space-between";
            label.innerHTML = `
                <span>${field.label || field.name}</span>
                <code style="font-size: 0.625rem; opacity: 0.6; background: var(--panel-bg-alt); padding: 1px 4px; border-radius: 3px;">{{${field.name}}}</code>
            `;

            const input = document.createElement("input");
            input.type = "text";
            input.value = schema.sampleData[field.name] || "";
            input.placeholder = `Enter sample ${field.name}...`;
            input.style.fontSize = "0.8125rem";

            input.oninput = (e) => {
                schema.sampleData[field.name] = (e.target as HTMLInputElement).value;
                this.updatePreview();
            };

            group.appendChild(label);
            group.appendChild(input);
            grid.appendChild(group);
        });

        this.sampleDataContainer.appendChild(grid);
    }

    private renderElementsList() {
        this.elementsContainer.innerHTML = "";
        this.currentLayout.elements.forEach(el => {
            const div = document.createElement("div");
            div.className = `element-item ${this.selectedElementId === el.id ? "active" : ""}`;
            div.innerHTML = `
                <div class="element-info">
                    <span class="element-name">${el.type.toUpperCase()}</span>
                    <span class="element-sub">${String(el.content).substring(0, 20)}</span>
                </div>
            `;
            div.onclick = () => this.selectElement(el.id);
            this.elementsContainer.appendChild(div);
        });
    }

    private selectElement(id: string | null) {
        this.selectedElementId = id;
        this.renderElementsList();
        this.renderPropertyPanel();
        this.updateEditorOverlay();

        if (id && this.container.offsetWidth <= 768) {
            this.rightSidebar.classList.add("show");
        }
    }

    private renderPropertyPanel() {
        const toggleRight = this.container.querySelector("#toggle-right") as HTMLButtonElement;

        if (!this.selectedElementId) {
            this.propertyPanel.style.display = "none";
            if (toggleRight) toggleRight.style.display = "none";
            return;
        }

        if (this.container.offsetWidth <= 768) {
            if (toggleRight) toggleRight.style.display = "flex";
        } else {
            if (toggleRight) toggleRight.style.display = "none";
        }

        const el = this.currentLayout.elements.find(e => e.id === this.selectedElementId);
        if (!el) return;

        this.propertyPanel.style.display = "block";
        this.propContent.innerHTML = `
            <!-- Alignment Toolbar -->
            <div class="align-toolbar">
                <span class="align-toolbar-label">Align to Label</span>
                <div class="align-toolbar-btns">
                    <button class="btn btn-icon btn-outline align-btn" data-align="left" title="Align Left Edge" style="width:28px;height:28px;">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="6" height="8" rx="1"/><line x1="1" y1="1" x2="1" y2="13"/></svg>
                    </button>
                    <button class="btn btn-icon btn-outline align-btn" data-align="center-h" title="Center Horizontally" style="width:28px;height:28px;">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="6" height="8" rx="1"/><line x1="7" y1="1" x2="7" y2="13"/></svg>
                    </button>
                    <button class="btn btn-icon btn-outline align-btn" data-align="right" title="Align Right Edge" style="width:28px;height:28px;">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="6" height="8" rx="1"/><line x1="13" y1="1" x2="13" y2="13"/></svg>
                    </button>
                    <div class="align-sep"></div>
                    <button class="btn btn-icon btn-outline align-btn" data-align="top" title="Align Top Edge" style="width:28px;height:28px;">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="8" height="6" rx="1"/><line x1="1" y1="1" x2="13" y2="1"/></svg>
                    </button>
                    <button class="btn btn-icon btn-outline align-btn" data-align="center-v" title="Center Vertically" style="width:28px;height:28px;">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="8" height="6" rx="1"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
                    </button>
                    <button class="btn btn-icon btn-outline align-btn" data-align="bottom" title="Align Bottom Edge" style="width:28px;height:28px;">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="8" height="6" rx="1"/><line x1="1" y1="13" x2="13" y2="13"/></svg>
                    </button>
                </div>
            </div>

            <div class="form-group">
                ${el.type === 'qr' ? `
                <label>Field Separator</label>
                <input type="text" id="prop-qr-separator" placeholder="e.g. | or -" value="${el.qrSeparator || ''}">
                ` : ''}
                ${el.type === 'barcode' ? `
                <label>Barcode Format</label>
                <select id="prop-barcode-format">
                    <option value="CODE128" ${(el.barcodeFormat || 'CODE128') === 'CODE128' ? 'selected' : ''}>CODE128 — Universal / Logistics</option>
                    <option value="EAN13"   ${el.barcodeFormat === 'EAN13'   ? 'selected' : ''}>EAN-13 — Retail (12 digits)</option>
                    <option value="UPCA"    ${el.barcodeFormat === 'UPCA'    ? 'selected' : ''}>UPC-A — US Retail (11 digits)</option>
                    <option value="CODE39"  ${el.barcodeFormat === 'CODE39'  ? 'selected' : ''}>CODE39 — Industrial / MRO</option>
                    <option value="ITF14"   ${el.barcodeFormat === 'ITF14'   ? 'selected' : ''}>ITF-14 — Carton / Pallet (13 digits)</option>
                </select>
                ` : ''}
                <label>Content</label>
                <textarea data-prop="content-val" rows="2">${el.content}</textarea>
                <div class="field-buttons" data-el="field-suggestions"></div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1;"><label>X (pos)</label><input type="number" step="0.01" data-prop="x" value="${el.x.toFixed(2)}"></div>
                <div class="form-group" style="flex:1;"><label>Y (pos)</label><input type="number" step="0.01" data-prop="y" value="${el.y.toFixed(2)}"></div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1;"><label>Width</label><input type="number" step="0.01" data-prop="w" value="${el.w.toFixed(2)}"></div>
                <div class="form-group" style="flex:1;"><label>Height</label><input type="number" step="0.01" data-prop="h" value="${el.h.toFixed(2)}"></div>
            </div>
            ${el.type === 'text' ? `
                <div style="height: 1px; background: var(--border-color); margin: 16px 0;"></div>
                <div class="form-row">
                    <div class="form-group" style="flex:1;">
                        <label>Font Size</label>
                        <input type="number" data-prop="fontSize" value="${el.style?.fontSize || 12}">
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>Font Weight</label>
                        <select data-prop="fontWeight">
                            <option value="normal" ${el.style?.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="bold" ${el.style?.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Horizontal Align</label>
                    <div class="toggle-group" style="width: 100%;">
                        <button class="toggle-btn prop-align-h ${el.style?.textAlign === 'left' ? 'active' : ''}" data-val="left" style="flex:1;">Left</button>
                        <button class="toggle-btn prop-align-h ${el.style?.textAlign === 'center' ? 'active' : ''}" data-val="center" style="flex:1;">Center</button>
                        <button class="toggle-btn prop-align-h ${el.style?.textAlign === 'right' ? 'active' : ''}" data-val="right" style="flex:1;">Right</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Vertical Align</label>
                    <div class="toggle-group" style="width: 100%;">
                        <button class="toggle-btn prop-align-v ${el.style?.verticalAlign === 'top' ? 'active' : ''}" data-val="top" style="flex:1;">Top</button>
                        <button class="toggle-btn prop-align-v ${el.style?.verticalAlign === 'middle' ? 'active' : ''}" data-val="middle" style="flex:1;">Middle</button>
                        <button class="toggle-btn prop-align-v ${el.style?.verticalAlign === 'bottom' ? 'active' : ''}" data-val="bottom" style="flex:1;">Bottom</button>
                    </div>
                </div>
            ` : ''}
            ${el.type === 'barcode' ? `
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 12px 0 0; line-height: 1.5;">
                    EAN-13 needs 12 digits &nbsp;·&nbsp; UPC-A needs 11 digits &nbsp;·&nbsp; ITF-14 needs 13 digits
                </p>
            ` : ''}
        `;

        // Alignment toolbar buttons
        this.propContent.querySelectorAll('.align-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.alignElement((btn as HTMLElement).dataset.align!);
            });
        });

        // Suggestions from Props
        const suggestions = this.propContent.querySelector('[data-el="field-suggestions"]');
        const entitySchema = this.currentLayout.targetEntity ? this.entitySchemas[this.currentLayout.targetEntity] : null;

        if (entitySchema && suggestions) {
            entitySchema.fields.forEach(f => {
                const pill = document.createElement("div");
                pill.className = "field-pill";
                pill.innerText = `+ ${f.label}`;
                pill.onclick = () => {
                    el.content += `{{${f.name}}}`;
                    this.renderPropertyPanel();
                    this.updatePreview();
                };
                suggestions.appendChild(pill);
            });
        }

        // QR separator
        const sepInput = this.propContent.querySelector("#prop-qr-separator");
        if (sepInput) {
            sepInput.addEventListener("input", (e) => {
                el.qrSeparator = (e.target as HTMLInputElement).value;
                this.updatePreview();
            });
        }

        // Barcode format
        const barcodeFormatSelect = this.propContent.querySelector("#prop-barcode-format");
        if (barcodeFormatSelect) {
            barcodeFormatSelect.addEventListener("change", (e) => {
                this.snapshot();
                (el as any).barcodeFormat = (e.target as HTMLSelectElement).value;
                this.updatePreview();
            });
        }

        // Property inputs — live update on input, snapshot on blur (focus captures state before editing)
        const link = (key: string, field: string, isNum = false, subField?: string) => {
            const input = this.propContent.querySelector(`[data-prop="${key}"]`) as HTMLInputElement | null;
            if (!input) return;

            let preEditState: string | null = null;

            input.addEventListener("focus", () => {
                preEditState = JSON.stringify(this.currentLayout);
            });

            input.addEventListener("input", (e) => {
                const val = (e.target as HTMLInputElement).value;
                const finalVal = isNum ? parseFloat(val) || 0 : val;
                if (subField) {
                    if (!el.style) el.style = {};
                    (el.style as any)[subField] = finalVal;
                } else {
                    (el as any)[field] = finalVal;
                }
                this.updatePreview();
            });

            input.addEventListener("blur", () => {
                if (preEditState !== null) {
                    this.undoStack.push(preEditState);
                    if (this.undoStack.length > this.MAX_UNDO) this.undoStack.shift();
                    this.redoStack = [];
                    this.updateUndoButtons();
                    preEditState = null;
                }
            });
        };

        link("content-val", "content");
        link("x", "x", true);
        link("y", "y", true);
        link("w", "w", true);
        link("h", "h", true);
        link("fontSize", "style", true, "fontSize");
        link("fontWeight", "style", false, "fontWeight");

        this.propContent.querySelectorAll(".prop-align-h").forEach(btn => {
            btn.addEventListener("click", () => {
                this.snapshot();
                if (!el.style) el.style = {};
                el.style.textAlign = (btn as HTMLElement).dataset.val as any;
                this.renderPropertyPanel();
                this.updatePreview();
            });
        });

        this.propContent.querySelectorAll(".prop-align-v").forEach(btn => {
            btn.addEventListener("click", () => {
                this.snapshot();
                if (!el.style) el.style = {};
                el.style.verticalAlign = (btn as HTMLElement).dataset.val as any;
                this.renderPropertyPanel();
                this.updatePreview();
            });
        });
    }

    private updateEditorOverlay() {
        if (!this.editorOverlay || !this.canvas) return;

        if (!this.isDragging) {
            this.editorOverlay.style.width = this.canvas.style.width;
            this.editorOverlay.style.height = this.canvas.style.height;
        }

        // Update grid dots visual
        if (this.snapToGrid && this.pxPerUnit > 0) {
            const dotSpacing = this.GRID_SIZE * this.pxPerUnit;
            this.editorOverlay.style.setProperty('--grid-dot-spacing', `${dotSpacing}px`);
            this.editorOverlay.classList.add('show-grid');
        } else {
            this.editorOverlay.classList.remove('show-grid');
        }

        // Reconcile DOM: remove stale items, keep existing ones
        const existingIds = new Set(this.currentLayout.elements.map(e => e.id));
        this.editorOverlay.querySelectorAll('.editor-item').forEach(node => {
            if (!existingIds.has((node as HTMLElement).dataset.id!)) node.remove();
        });

        this.currentLayout.elements.forEach(el => {
            let item = this.editorOverlay.querySelector(`.editor-item[data-id="${el.id}"]`) as HTMLElement | null;

            if (!item) {
                item = document.createElement("div");
                item.className = "editor-item";
                item.dataset.id = el.id;

                const handle = document.createElement("div");
                handle.className = "resize-handle";
                item.appendChild(handle);

                handle.onmousedown = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.startElementResize(e, el, item!);
                };

                item.onmousedown = (e) => {
                    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
                    e.preventDefault();
                    this.selectElement(el.id);
                    this.startElementDrag(e, el, item!);
                };

                this.editorOverlay.appendChild(item);
            }

            item.classList.toggle("selected", this.selectedElementId === el.id);
            item.style.left = `${el.x * this.pxPerUnit}px`;
            item.style.top = `${el.y * this.pxPerUnit}px`;
            item.style.width = `${el.w * this.pxPerUnit}px`;
            item.style.height = `${el.h * this.pxPerUnit}px`;
        });
    }

    private startElementResize(e: MouseEvent, el: StickerElement, item: HTMLElement) {
        this.snapshot();
        this.isDragging = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const initW = el.w;
        const initH = el.h;

        const snap = (val: number) =>
            this.snapToGrid ? Math.round(val / this.GRID_SIZE) * this.GRID_SIZE : val;

        const onMove = (me: MouseEvent) => {
            el.w = snap(Math.max(this.GRID_SIZE, initW + (me.clientX - startX) / this.pxPerUnit));
            el.h = snap(Math.max(this.GRID_SIZE, initH + (me.clientY - startY) / this.pxPerUnit));
            item.style.width = `${el.w * this.pxPerUnit}px`;
            item.style.height = `${el.h * this.pxPerUnit}px`;
            this.renderPropertyPanel();
        };
        const onUp = () => {
            this.isDragging = false;
            this.updatePreview();
            this.renderPropertyPanel();
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    private startElementDrag(e: MouseEvent, el: StickerElement, item: HTMLElement) {
        this.snapshot();
        this.isDragging = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const initX = el.x;
        const initY = el.y;

        const snap = (val: number) =>
            this.snapToGrid ? Math.round(val / this.GRID_SIZE) * this.GRID_SIZE : val;

        const onMove = (me: MouseEvent) => {
            el.x = snap(initX + (me.clientX - startX) / this.pxPerUnit);
            el.y = snap(initY + (me.clientY - startY) / this.pxPerUnit);
            item.style.left = `${el.x * this.pxPerUnit}px`;
            item.style.top = `${el.y * this.pxPerUnit}px`;
            this.renderPropertyPanel();
        };
        const onUp = () => {
            this.isDragging = false;
            this.updatePreview();
            this.renderPropertyPanel();
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    public destroy() {
        document.removeEventListener('keydown', this._keyHandler);
        this.container.innerHTML = "";
        this.container.classList.remove("qrlayout-designer");
    }

    // ── Phase 1.2: Undo / Redo ────────────────────────────────────────────────

    private snapshot(): void {
        this.undoStack.push(JSON.stringify(this.currentLayout));
        if (this.undoStack.length > this.MAX_UNDO) this.undoStack.shift();
        this.redoStack = [];
        this.updateUndoButtons();
    }

    private undo(): void {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(JSON.stringify(this.currentLayout));
        this.currentLayout = JSON.parse(this.undoStack.pop()!);
        this.selectedElementId = null;
        this.syncInputsFromLayout();
        this.renderSampleDataEditor();
        this.renderElementsList();
        this.renderPropertyPanel();
        this.updatePreview();
        this.updateUndoButtons();
    }

    private redo(): void {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(JSON.stringify(this.currentLayout));
        this.currentLayout = JSON.parse(this.redoStack.pop()!);
        this.selectedElementId = null;
        this.syncInputsFromLayout();
        this.renderSampleDataEditor();
        this.renderElementsList();
        this.renderPropertyPanel();
        this.updatePreview();
        this.updateUndoButtons();
    }

    private updateUndoButtons(): void {
        if (this.undoBtn) this.undoBtn.disabled = this.undoStack.length === 0;
        if (this.redoBtn) this.redoBtn.disabled = this.redoStack.length === 0;
    }

    // ── Phase 1.2: Keyboard Shortcut Actions ─────────────────────────────────

    private nudgeSelected(key: string, step: number): void {
        const el = this.currentLayout.elements.find(e => e.id === this.selectedElementId);
        if (!el) return;
        this.snapshot();
        if (key === 'ArrowLeft')  el.x = Math.max(0, el.x - step);
        if (key === 'ArrowRight') el.x += step;
        if (key === 'ArrowUp')    el.y = Math.max(0, el.y - step);
        if (key === 'ArrowDown')  el.y += step;
        this.updatePreview();
        this.renderPropertyPanel();
    }

    private duplicateSelected(): void {
        const el = this.currentLayout.elements.find(e => e.id === this.selectedElementId);
        if (!el) return;
        this.snapshot();
        const newEl: StickerElement = {
            ...el,
            id: el.type[0] + Date.now(),
            x: el.x + this.GRID_SIZE * 5,
            y: el.y + this.GRID_SIZE * 5
        };
        this.currentLayout.elements.push(newEl);
        this.selectElement(newEl.id);
        this.updatePreview();
    }

    private deleteSelectedElement(): void {
        if (!this.selectedElementId) return;
        this.snapshot();
        this.currentLayout.elements = this.currentLayout.elements.filter(e => e.id !== this.selectedElementId);
        this.selectElement(null);
        this.updatePreview();
    }

    // ── Phase 1.2: Element Alignment ─────────────────────────────────────────

    private alignElement(direction: string): void {
        const el = this.currentLayout.elements.find(e => e.id === this.selectedElementId);
        if (!el) return;
        this.snapshot();
        const { width, height } = this.currentLayout;
        switch (direction) {
            case 'left':     el.x = 0; break;
            case 'center-h': el.x = (width - el.w) / 2; break;
            case 'right':    el.x = width - el.w; break;
            case 'top':      el.y = 0; break;
            case 'center-v': el.y = (height - el.h) / 2; break;
            case 'bottom':   el.y = height - el.h; break;
        }
        this.updatePreview();
        this.renderPropertyPanel();
    }

    // ── Phase 1.2: Label Size Presets ─────────────────────────────────────────

    private applyPreset(value: string): void {
        const presets: Record<string, { width: number; height: number; unit: 'mm' | 'in' | 'cm' | 'px' }> = {
            '100x60mm': { width: 100, height: 60,  unit: 'mm' },
            '100x50mm': { width: 100, height: 50,  unit: 'mm' },
            '50x25mm':  { width: 50,  height: 25,  unit: 'mm' },
            '62x29mm':  { width: 62,  height: 29,  unit: 'mm' },
            '4x6in':    { width: 4,   height: 6,   unit: 'in' },
            '3x2in':    { width: 3,   height: 2,   unit: 'in' },
            '2x1in':    { width: 2,   height: 1,   unit: 'in' },
        };
        const preset = presets[value];
        if (!preset) return;
        this.currentLayout.width = preset.width;
        this.currentLayout.height = preset.height;
        this.currentLayout.unit = preset.unit;
        this.syncInputsFromLayout();
        this.updatePreview();
    }
}
