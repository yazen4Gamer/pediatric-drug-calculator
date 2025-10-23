// renderer.js - Pediatric Drug Calculator Main Logic
// Clean ES Module version aligned with the refactored architecture

import MedicationDatabase from './scripts/calc/medications-database.js';
import PDFExporter from './scripts/pdf-exporter.js';

class DrugCalculator {
    constructor() {
        this.currentWeight = null;
        this.init();
    }

    // ------------------------------
    // INITIALIZATION
    // ------------------------------
    init() {
        this.bindEvents();
        this.bindWindowControls();
        this.addCustomStyles();
        this.bindSearchAndFilters();
        this.bindSettings();
        this.updateStatus('Ready - Enter patient weight to calculate medication doses.');
        console.log('Pediatric Drug Calculator initialized');
    }

    bindEvents() {
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateAll());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());

        const weightInput = document.getElementById('weight');
        weightInput.addEventListener('keypress', e => { if (e.key === 'Enter') this.calculateAll(); });
        weightInput.addEventListener('input', e => this.validateWeightInput(e.target));
    }

    bindWindowControls() {
        document.getElementById('minimizeBtn').addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });
    }

    // ------------------------------
    // INPUT VALIDATION
    // ------------------------------
    validateWeightInput(input) {
        const value = parseFloat(input.value);
        if (value > 150) {
            input.value = '150';
            this.showError('Maximum weight is 150 kg');
        } else if (value < 0.1 && input.value !== '') {
            input.value = '0.1';
        }
    }

    // ------------------------------
    // Search & Filter
    // ------------------------------
    bindSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        const filterRadios = document.querySelectorAll('input[name="filterGroup"]');

        // Live search
        searchInput.addEventListener('input', () => this.applySearchAndFilter());

        // Filter toggles
        filterRadios.forEach(radio => {
            radio.addEventListener('change', () => this.applySearchAndFilter());
        });
    }

    applySearchAndFilter() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const selectedFilter = document.querySelector('input[name="filterGroup"]:checked').value;

        // Always recalculate from full DB
        const emergencyResults = this.calculateCategory('emergency', this.currentWeight || 0);
        const prrtResults = this.calculateCategory('prrt', this.currentWeight || 0);
        let allResults = [...emergencyResults, ...prrtResults];

        // Apply category filter
        if (selectedFilter === 'emergency') {
            allResults = allResults.filter(med => med.categoryType === 'Emergency');
        } else if (selectedFilter === 'prrt') {
            allResults = allResults.filter(med => med.categoryType === 'PRRT');
        }

        // Apply search query
        if (query.trim() !== '') {
            allResults = allResults.filter(med =>
                med.name.toLowerCase().includes(query) ||
                med.route.toLowerCase().includes(query) ||
                med.category.toLowerCase().includes(query)
            );
        }

        this.displayModernTable(allResults);
    }

    // ------------------------------
    // Setting
    // ------------------------------
    bindSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const autoLaunchToggle = document.getElementById('autoLaunchToggle');
    const alwaysOnTopToggle = document.getElementById('alwaysOnTopToggle');
    const darkThemeToggle = document.getElementById('darkThemeToggle');

    // Open modal
    settingsBtn.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
        this.loadSettingsState();
    });

    // Handle toggles
    autoLaunchToggle.addEventListener('change', async () => {
            const enabled = autoLaunchToggle.checked;
            await window.electronAPI.setAutoLaunch(enabled);
        });

        alwaysOnTopToggle.addEventListener('change', async () => {
            const enabled = alwaysOnTopToggle.checked;
            await window.electronAPI.setAlwaysOnTop(enabled);
        });

        darkThemeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-theme', darkThemeToggle.checked);
            localStorage.setItem('darkTheme', darkThemeToggle.checked ? 'true' : 'false');
        });
    }

    async loadSettingsState() {
        // Load auto launch
        const autoLaunchEnabled = await window.electronAPI.getAutoLaunchStatus();
        document.getElementById('autoLaunchToggle').checked = autoLaunchEnabled;

        // Load theme preference
        const darkMode = localStorage.getItem('darkTheme') === 'true';
        document.getElementById('darkThemeToggle').checked = darkMode;
        if (darkMode) document.body.classList.add('dark-theme');

        // Version info
        document.getElementById('appVersionLabel').textContent = 'v1.0.0';
    }

    // ------------------------------
    // CALCULATION
    // ------------------------------
    calculateAll() {
        const weightInput = document.getElementById('weight');
        const weight = parseFloat(weightInput.value);

        if (!weight || weight <= 0) {
            this.showError('Please enter a valid weight greater than 0 kg');
            weightInput.focus();
            return;
        }

        if (weight > 150) {
            this.showError('Maximum weight is 150 kg');
            weightInput.value = '150';
            weightInput.focus();
            return;
        }

        this.currentWeight = weight;
        this.updateStatus(`Calculating doses for ${weight} kg patient...`);
        this.showLoadingState();

        setTimeout(() => {
            try {
                const emergencyResults = this.calculateCategory('emergency', weight);
                const prrtResults = this.calculateCategory('prrt', weight);
                const allResults = [...emergencyResults, ...prrtResults];

                this.displayModernTable(allResults);
                this.updateSummaryCard(weight, allResults.length, emergencyResults.length, prrtResults.length);

                document.getElementById('exportBtn').disabled = false;
                this.updateStatus(`Calculation complete for ${weight} kg patient - ${allResults.length} medications calculated`);
                this.showSuccess('All medications calculated successfully');
            } catch (error) {
                this.showError(`Calculation error: ${error.message}`);
            }
        }, 50);
    }

    showLoadingState() {
        document.getElementById('all-results').innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="text-primary fw-medium">Calculating medication doses...</div>
                </td>
            </tr>`;
    }

    calculateCategory(type, weight) {
        const medications = MedicationDatabase.getMedicationsByType(type).filter(m => !m.requiresDoseInput);

        return medications.map(med => {
            const result = MedicationDatabase.calculateVolume(med, weight);
            let totalDose = this.formatTotalDose(med, result.volume, result.doseMg);

            return {
                name: med.name,
                concentration: med.concentration,
                route: med.route,
                category: med.category,
                notes: med.notes,
                displayVolume: result.displayVolume ?? 'Error',
                totalDose: totalDose ?? 'Error',
                categoryType: type === 'emergency' ? 'Emergency' : 'PRRT',
                type
            };
        });
    }

    formatTotalDose(med, volume, doseMg) {
        if (!volume || volume === 0 || isNaN(volume)) return 'Error';
        if (doseMg && !isNaN(doseMg)) return `${doseMg.toFixed(2)} mg`;
        return `${volume.toFixed(2)} mL`;
    }

    // ------------------------------
    // TABLE RENDERING
    // ------------------------------
    displayModernTable(medications) {
        const container = document.getElementById('all-results');

        if (!medications.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="bi bi-calculator display-4 d-block mb-3 opacity-50"></i>
                        <div class="fs-5 fw-medium mb-2">Ready for Calculation</div>
                        <div class="text-muted">Enter patient weight and click "Calculate All" to see results</div>
                    </td>
                </tr>`;
            return;
        }

        container.innerHTML = medications.map(med => `
            <tr class="medication-row">
                <td class="ps-3">
                    <span class="badge ${this.getCategoryClass(med.category)} category-badge">${med.categoryType}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <strong class="medication-name">${med.name}</strong>
                        ${med.categoryType === 'Emergency' ? '<i class="bi bi-exclamation-triangle text-danger ms-2" title="Emergency Medication"></i>' : ''}
                    </div>
                </td>
                <td class="text-center dose-highlight">${med.displayVolume} mL</td>
                <td class="text-center">${med.totalDose}</td>
                <td class="text-center concentration-cell">${med.concentration}</td>
                <td class="text-center">
                    <span class="badge ${this.getRouteClass(med.route)} route-badge">${med.route}</span>
                </td>
                <td class="pe-3 notes-cell" title="${med.notes}">${med.notes}</td>
            </tr>
        `).join('');

        document.getElementById('resultsCount').textContent = `${medications.length} medications`;
        this.addRowInteractions();
    }

    addRowInteractions() {
        const rows = document.querySelectorAll('.medication-row');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                rows.forEach(r => r.classList.remove('table-active'));
                row.classList.add('table-active');
            });
        });
    }

    // ------------------------------
    // UI HELPERS
    // ------------------------------
    getCategoryClass(category) {
        const classes = {
            'Cardiac': 'bg-danger',
            'Electrolyte': 'bg-info',
            'Antidote': 'bg-warning text-dark',
            'Endocrine': 'bg-success',
            'Neuromuscular': 'bg-secondary',
            'Fluid': 'bg-primary',
            'Sedative': 'bg-dark',
            'Analgesic': 'bg-orange',
            'Antihistamine': 'bg-purple',
            'Respiratory': 'bg-teal',
            'Antibiotic': 'bg-indigo',
            'Steroid': 'bg-pink',
            'Antiemetic': 'bg-cyan',
            'GI': 'bg-brown',
            'Allergy': 'bg-danger',
            'Diuretic': 'bg-info',
            'Anticonvulsant': 'bg-warning text-dark'
        };
        return classes[category] || 'bg-dark';
    }

    getRouteClass(route) {
        const classes = {
            'IV': 'bg-primary',
            'IV/IO': 'bg-info',
            'ET': 'bg-warning text-dark',
            'PO': 'bg-success',
            'PR': 'bg-success',
            'PO/PR': 'bg-success',
            'IV/IM': 'bg-secondary',
            'IM': 'bg-secondary',
            'Nebulized': 'bg-purple',
            'Inhalation': 'bg-teal'
        };
        return classes[route] || 'bg-dark';
    }

    updateSummaryCard(weight, totalMeds, emergencyCount, prrtCount) {
        const summaryCard = document.getElementById('summaryCard');
        summaryCard.classList.remove('d-none');

        document.getElementById('patientWeightDisplay').textContent = `${weight} kg`;
        document.getElementById('totalMedsDisplay').textContent = totalMeds;
        document.getElementById('emergencyCount').textContent = emergencyCount;
        document.getElementById('prrtCount').textContent = prrtCount;

        summaryCard.style.animation = 'fadeIn 0.5s ease-in';
    }

    // ------------------------------
    // EXPORT TO PDF
    // ------------------------------
    async exportResults() {
        if (!this.currentWeight) {
            this.showError('No calculation results to export. Please calculate medications first.');
            return;
        }

        try {
            this.updateStatus('Generating professional PDF report...');
            const exportBtn = document.getElementById('exportBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF...';
            exportBtn.disabled = true;

            const emergencyResults = this.calculateCategory('emergency', this.currentWeight);
            const prrtResults = this.calculateCategory('prrt', this.currentWeight);
            const allResults = [...emergencyResults, ...prrtResults];

            const pdf = await PDFExporter.exportToPDF(allResults, this.currentWeight, emergencyResults.length, prrtResults.length);
            const fileName = PDFExporter.savePDF(pdf, this.currentWeight);

            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;

            this.updateStatus(`PDF generated for ${this.currentWeight} kg patient`);
            this.showSuccess(`PDF exported successfully: ${fileName}`);
        } catch (error) {
            console.error('PDF export error:', error);
            const exportBtn = document.getElementById('exportBtn');
            exportBtn.innerHTML = '<i class="bi bi-file-pdf me-2"></i>Export to PDF';
            exportBtn.disabled = false;
            this.showError(`Failed to generate PDF: ${error.message}`);
        }
    }

    // ------------------------------
    // CLEAR & STATUS
    // ------------------------------
    clearAll() {
        document.getElementById('weight').value = '';
        document.getElementById('all-results').innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-calculator display-4 d-block mb-3 opacity-50"></i>
                    <div class="fs-5 fw-medium mb-2">Ready for Calculation</div>
                    <div class="text-muted">Enter patient weight and click "Calculate All" to see results</div>
                </td>
            </tr>`;
        document.getElementById('exportBtn').disabled = true;
        document.getElementById('summaryCard').classList.add('d-none');
        document.getElementById('resultsCount').textContent = 'No calculations yet';
        this.currentWeight = null;
        this.updateStatus('Ready - Enter patient weight to calculate medication doses.');
        document.getElementById('weight').focus();
        this.showSuccess('All calculations cleared');
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.style.opacity = '0.8';
        setTimeout(() => (statusElement.style.opacity = '1'), 100);
    }

    showError(message) {
        this.updateStatus(`Error: ${message}`);
        const el = document.getElementById('status');
        el.classList.replace('text-muted', 'text-danger');
        setTimeout(() => el.classList.replace('text-danger', 'text-muted'), 5000);
    }

    showSuccess(message) {
        this.updateStatus(`Success: ${message}`);
        const el = document.getElementById('status');
        el.classList.replace('text-muted', 'text-success');
        setTimeout(() => el.classList.replace('text-success', 'text-muted'), 3000);
    }

    // ------------------------------
    // STYLING
    // ------------------------------
    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .bg-orange { background-color: #e67e22 !important; }
            .bg-purple { background-color: #9b59b6 !important; }
            .bg-teal { background-color: #1abc9c !important; }
            .bg-indigo { background-color: #34495e !important; }
            .bg-pink { background-color: #e84393 !important; }
            .bg-cyan { background-color: #00cec9 !important; }
            .bg-brown { background-color: #a1887f !important; }
            .medication-row:hover { background-color: rgba(52, 152, 219, 0.05) !important; }
            .medication-name { font-size: 0.95em; line-height: 1.3; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            .table-active { background-color: rgba(52, 152, 219, 0.1) !important; border-left: 3px solid #3498db; }
        `;
        document.head.appendChild(style);
    }
}

// ------------------------------
// STARTUP
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    new DrugCalculator();
});

export default DrugCalculator;
