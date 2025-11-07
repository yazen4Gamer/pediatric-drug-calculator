// renderer.js - Pediatric Drug Calculator Main Logic
// Enhanced version with new features and improvements

import MedicationDatabase from './scripts/calc/medications-database.js';
import PDFExporter from './scripts/pdf-exporter.js';
import { PDF_FIELD_MAP } from './field-mapping.js';

class DrugCalculator {
    constructor() {
        this.currentWeight = null;
        this.calculationHistory = [];
        this.currentResults = []; // Track current displayed results
        this.settings = this.loadSettings();
        this.charts = {}; // Store chart instances
        this.init();
    }

    // ------------------------------
    // INITIALIZATION
    // ------------------------------
    init() {
        this.bindEvents();
        this.bindWindowControls();
        this.bindQuickActions();
        this.addCustomStyles();
        this.bindSearchAndFilters();
        this.bindSettings();
        this.bindVisualization();
        this.applySavedTheme();
        this.updateStatus('Ready - Enter patient weight to calculate medication doses.');
        console.log('Pediatric Drug Calculator v2.0 initialized');
    }

    bindEvents() {
        // Main action buttons
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateAll());
        //document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTemplatePDF());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('expandAllBtn').addEventListener('click', () => this.toggleAllDetails());
        document.getElementById('emergencyModeBtn').addEventListener('click', () => this.toggleEmergencyMode());

        const weightInput = document.getElementById('weight');
        
        // Enter key to calculate
        weightInput.addEventListener('keypress', e => { 
            if (e.key === 'Enter') this.calculateAll(); 
        });
        
        // Auto-calculate with debouncing
        weightInput.addEventListener('input', e => {
            this.validateWeightInput(e.target);
            if (this.settings.autoCalculate && e.target.value && parseFloat(e.target.value) > 0) {
                clearTimeout(this.autoCalculateTimeout);
                this.autoCalculateTimeout = setTimeout(() => this.calculateAll(), 800);
            }
        });

        // Quick weights button
        document.getElementById('quickWeightsBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('quickActionsModal'));
            modal.show();
        });

        // Prevent form submission on enter in search
        document.getElementById('searchInput').addEventListener('keypress', e => {
            if (e.key === 'Enter') e.preventDefault();
        });
    }

    bindQuickActions() {
        document.querySelectorAll('.quick-weight-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weight = e.currentTarget.getAttribute('data-weight');
                document.getElementById('weight').value = weight;
                this.calculateAll();
                const modal = bootstrap.Modal.getInstance(document.getElementById('quickActionsModal'));
                if (modal) modal.hide();
            });
        });
    }

    bindWindowControls() {
        document.getElementById('minimizeBtn').addEventListener('click', () => {
            window.electronAPI?.minimizeWindow?.();
        });

        document.getElementById('quickActionsBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('quickActionsModal'));
            modal.show();
        });
    }

    // ------------------------------
    // SETTINGS MANAGEMENT
    // ------------------------------
    loadSettings() {
        const defaultSettings = {
            autoCalculate: true,
            decimalPrecision: 2,
            darkTheme: false,
            emergencyMode: false,
            lastWeight: null,
            chartsCollapsed: false
        };

        try {
            const saved = localStorage.getItem('calculatorSettings');
            const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
            
            // Migrate old settings if needed
            if (localStorage.getItem('darkTheme')) {
                settings.darkTheme = localStorage.getItem('darkTheme') === 'true';
                localStorage.removeItem('darkTheme');
            }
            
            return settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('calculatorSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    applySavedTheme() {
        if (this.settings.darkTheme) {
            document.body.classList.add('dark-theme');
        }
    }

    bindSettings() {
        const settingsBtn = document.getElementById('settingsBtn');
        const autoLaunchToggle = document.getElementById('autoLaunchToggle');
        const alwaysOnTopToggle = document.getElementById('alwaysOnTopToggle');
        const darkThemeToggle = document.getElementById('darkThemeToggle');
        const autoCalculateToggle = document.getElementById('autoCalculateToggle');
        const decimalPrecision = document.getElementById('decimalPrecision');

        // Open modal
        settingsBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
            modal.show();
            this.loadSettingsState();
        });

        // Handle toggles
        autoLaunchToggle.addEventListener('change', async () => {
            const enabled = autoLaunchToggle.checked;
            try {
                await window.electronAPI?.setAutoLaunch?.(enabled);
            } catch (error) {
                console.error('Error setting auto launch:', error);
            }
        });

        alwaysOnTopToggle.addEventListener('change', async () => {
            const enabled = alwaysOnTopToggle.checked;
            try {
                await window.electronAPI?.setAlwaysOnTop?.(enabled);
            } catch (error) {
                console.error('Error setting always on top:', error);
            }
        });

        darkThemeToggle.addEventListener('change', () => {
            this.settings.darkTheme = darkThemeToggle.checked;
            document.body.classList.toggle('dark-theme', this.settings.darkTheme);
            this.saveSettings();
            this.updateChartsForTheme(); // Update charts when theme changes
        });

        autoCalculateToggle.addEventListener('change', () => {
            this.settings.autoCalculate = autoCalculateToggle.checked;
            this.saveSettings();
        });

        decimalPrecision.addEventListener('change', () => {
            this.settings.decimalPrecision = parseInt(decimalPrecision.value);
            this.saveSettings();
            // Recalculate if we have current weight
            if (this.currentWeight) {
                this.calculateAll();
            }
        });
    }

    async loadSettingsState() {
        try {
            // Load settings from storage
            document.getElementById('autoCalculateToggle').checked = this.settings.autoCalculate;
            document.getElementById('decimalPrecision').value = this.settings.decimalPrecision.toString();
            document.getElementById('darkThemeToggle').checked = this.settings.darkTheme;
            
            // Load auto launch
            const autoLaunchEnabled = await window.electronAPI?.getAutoLaunchStatus?.() || false;
            document.getElementById('autoLaunchToggle').checked = autoLaunchEnabled;

            // Load always on top
            const alwaysOnTopEnabled = await window.electronAPI?.getAlwaysOnTopStatus?.() || false;
            document.getElementById('alwaysOnTopToggle').checked = alwaysOnTopEnabled;

            // Version info
            document.getElementById('appVersionLabel').textContent = 'v2.0.0';
            
            // Load last weight
            if (this.settings.lastWeight) {
                document.getElementById('lastWeight').textContent = `${this.settings.lastWeight} kg`;
            }
        } catch (error) {
            console.error('Error loading settings state:', error);
        }
    }

    // ------------------------------
    // INPUT VALIDATION
    // ------------------------------
    validateWeightInput(input) {
        const value = parseFloat(input.value);
        if (isNaN(value)) return;
        
        if (value > 150) {
            input.value = '150';
            this.showError('Maximum weight is 150 kg');
        } else if (value < 0.1 && input.value !== '') {
            input.value = '0.1';
            this.showError('Minimum weight is 0.1 kg');
        }
    }

    // ------------------------------
    // SEARCH & FILTER - IMPROVED
    // ------------------------------
    bindSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        const filterRadios = document.querySelectorAll('input[name="filterGroup"]');
        const sortOptions = document.querySelectorAll('.sort-option');

        // Live search with debouncing
        searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.applySearchAndFilter(), 300);
        });

        // Clear search
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.applySearchAndFilter();
            searchInput.focus();
        });

        // Filter toggles
        filterRadios.forEach(radio => {
            radio.addEventListener('change', () => this.applySearchAndFilter());
        });

        // Sorting
        sortOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const sortBy = e.target.getAttribute('data-sort');
                this.sortResults(sortBy);
            });
        });
    }

    applySearchAndFilter() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        const selectedFilter = document.querySelector('input[name="filterGroup"]:checked').value;

        let filteredResults = [...this.currentResults];

        // Apply category filter
        if (selectedFilter === 'emergency') {
            filteredResults = filteredResults.filter(med => med.categoryType === 'Emergency');
        } else if (selectedFilter === 'prrt') {
            filteredResults = filteredResults.filter(med => med.categoryType === 'PRRT');
        }

        // Apply search query
        if (query !== '') {
            filteredResults = filteredResults.filter(med =>
                med.name.toLowerCase().includes(query) ||
                med.route.toLowerCase().includes(query) ||
                med.category.toLowerCase().includes(query) ||
                med.notes.toLowerCase().includes(query)
            );
        }

        this.displayModernTable(filteredResults);
    }

    sortResults(sortBy) {
        const sortedResults = [...this.currentResults].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'dose':
                    return this.extractDoseValue(a) - this.extractDoseValue(b);
                default:
                    return 0;
            }
        });

        this.currentResults = sortedResults;
        this.applySearchAndFilter(); // Reapply current filters
    }

    extractDoseValue(medication) {
        if (!medication.calculatedVolume) return 0;
        return medication.calculatedVolume;
    }

    // ------------------------------
    // CALCULATION - IMPROVED
    // ------------------------------
    calculateAll() {
    const weightInput = document.getElementById('weight');
    const weight = parseFloat(weightInput.value);

    if (!weight || weight <= 0 || isNaN(weight)) {
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

    requestAnimationFrame(() => {
        try {
            const emergencyResults = this.calculateCategory('emergency', weight);
            const prrtResults = this.calculateCategory('prrt', weight);
            const allResults = [...emergencyResults, ...prrtResults];

            // 🧾 Detailed console log for each medication
            console.groupCollapsed(`💊 Medication Calculations for ${weight} kg`);
            allResults.forEach((med, index) => {
                console.log(
                    `%c#${index + 1} ${med.name}`,
                    'color: #4CAF50; font-weight: bold;'
                );
                console.log(`   • Route: ${med.route}`);
                console.log(`   • Equation: ${med.rawMedication?.equation || med.equation}`);
                console.log(`   • Calculated Volume: ${med.displayVolume} mL`);
                if (med.totalDose) console.log(`   • Total Dose: ${med.totalDose}`);
                if (med.categoryType) console.log(`   • Category: ${med.categoryType}`);
                console.log('------------------------------');
            });
            console.groupEnd();

            console.log(`✅ Calculated ${allResults.length} medications for ${weight} kg patient`);

            this.currentResults = allResults;
            this.displayModernTable(allResults);
            this.updateSummaryCard(weight, allResults.length, emergencyResults.length, prrtResults.length);
            this.updateVisualization(allResults);

            this.addToHistory(weight);
            this.settings.lastWeight = weight;
            this.saveSettings();
            document.getElementById('lastWeight').textContent = `${weight} kg`;

            document.getElementById('exportBtn').disabled = false;
            this.updateStatus(`Calculation complete for ${weight} kg patient - ${allResults.length} medications calculated`);
            this.showSuccess('All medications calculated successfully');
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError(`Calculation error: ${error.message}`);
            this.showLoadingError();
        }
    });
}


    showLoadingState() {
        document.getElementById('all-results').innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="text-primary fw-medium">Calculating medication doses...</div>
                    <div class="small text-muted mt-2">Processing emergency and PRRT medications</div>
                </td>
            </tr>`;
    }

    showLoadingError() {
        document.getElementById('all-results').innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-danger">
                    <i class="bi bi-exclamation-triangle display-4 d-block mb-3"></i>
                    <div class="fs-5 fw-medium mb-2">Calculation Failed</div>
                    <div class="text-muted">Please try again or check the console for errors</div>
                </td>
            </tr>`;
    }

    calculateCategory(type, weight) {
        const medications = MedicationDatabase.getMedicationsByType(type).filter(m => !m.requiresDoseInput);

        return medications.map(med => {
            try {
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
                    type,
                    calculatedDose: result.doseMg,
                    calculatedVolume: result.volume,
                    rawMedication: med // Store original for reference
                };
            } catch (error) {
                console.error(`Error calculating ${med.name}:`, error);
                return {
                    name: med.name,
                    concentration: med.concentration,
                    route: med.route,
                    category: med.category,
                    notes: med.notes,
                    displayVolume: 'Error',
                    totalDose: 'Error',
                    categoryType: type === 'emergency' ? 'Emergency' : 'PRRT',
                    type,
                    calculatedDose: null,
                    calculatedVolume: null,
                    rawMedication: med,
                    error: error.message
                };
            }
        });
    }

    formatTotalDose(med, volume, doseMg) {
        if (!volume || volume === 0 || isNaN(volume)) return 'Error';
        
        const precision = this.settings.decimalPrecision;
        
        if (doseMg && !isNaN(doseMg)) {
            return `${doseMg.toFixed(precision)} mg`;
        }
        return `${volume.toFixed(precision)} mL`;
    }

    // ------------------------------
    // TABLE RENDERING - IMPROVED
    // ------------------------------
    displayModernTable(medications) {
        const container = document.getElementById('all-results');

        if (!medications.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="bi bi-search display-4 d-block mb-3 opacity-50"></i>
                        <div class="fs-5 fw-medium mb-2">No medications found</div>
                        <div class="text-muted">Try adjusting your search or filter criteria</div>
                    </td>
                </tr>`;
            document.getElementById('resultsCount').textContent = 'No results';
            return;
        }

        container.innerHTML = medications.map(med => `
            <tr class="medication-row" data-medication='${JSON.stringify(med).replace(/'/g, "&apos;")}'>
                <td class="ps-3">
                    <span class="badge ${this.getCategoryClass(med.category)} category-badge">${med.categoryType}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <strong class="medication-name">${med.name}</strong>
                        ${med.categoryType === 'Emergency' ? 
                            '<i class="bi bi-exclamation-triangle-fill text-danger ms-2" title="Emergency Medication"></i>' : 
                            '<i class="bi bi-activity text-success ms-2" title="PRRT Medication"></i>'}
                        ${med.error ? '<i class="bi bi-x-circle text-warning ms-2" title="Calculation Error"></i>' : ''}
                    </div>
                    <small class="text-muted">${med.category}</small>
                </td>
                <td class="text-center dose-highlight">${med.displayVolume}</td>
                <td class="text-center fw-bold">${med.totalDose}</td>
                <td class="text-center concentration-cell">${med.concentration}</td>
                <td class="text-center">
                    <span class="badge ${this.getRouteClass(med.route)} route-badge">${med.route}</span>
                </td>
                <td class="pe-3 notes-cell" title="${med.notes}">
                    <div class="notes-content">${med.notes}</div>
                    ${med.error ? `<small class="text-warning d-block mt-1">Error: ${med.error}</small>` : ''}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary details-btn" title="Show details">
                        <i class="bi bi-chevron-down"></i>
                    </button>
                </td>
            </tr>
            <tr class="medication-details d-none">
                <td colspan="8" class="bg-light">
                    <div class="p-3">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Calculation Details:</strong><br>
                                Weight: ${this.currentWeight} kg<br>
                                Volume: ${med.calculatedVolume?.toFixed(this.settings.decimalPrecision) || 'N/A'} mL<br>
                                Dose: ${med.calculatedDose?.toFixed(this.settings.decimalPrecision) || 'N/A'} mg
                            </div>
                            <div class="col-md-6">
                                <strong>Administration:</strong><br>
                                Route: ${med.route}<br>
                                Category: ${med.category}<br>
                                <small class="text-muted">${med.notes}</small>
                            </div>
                        </div>
                        ${med.error ? `
                        <div class="row mt-2">
                            <div class="col-12">
                                <div class="alert alert-warning small mb-0">
                                    <strong>Calculation Error:</strong> ${med.error}
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        document.getElementById('resultsCount').textContent = `${medications.length} medication${medications.length !== 1 ? 's' : ''}`;
        this.addRowInteractions();
    }

    addRowInteractions() {
        const rows = document.querySelectorAll('.medication-row');
        const detailButtons = document.querySelectorAll('.details-btn');

        // Row click handling
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.details-btn') && !e.target.closest('a')) {
                    rows.forEach(r => r.classList.remove('table-active'));
                    row.classList.add('table-active');
                }
            });
        });

        // Detail button handling
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const row = e.target.closest('.medication-row');
                const detailsRow = row.nextElementSibling;
                const isHidden = detailsRow.classList.contains('d-none');
                
                // Close all other details
                document.querySelectorAll('.medication-details').forEach(d => d.classList.add('d-none'));
                document.querySelectorAll('.details-btn i').forEach(icon => {
                    icon.className = 'bi bi-chevron-down';
                });

                // Toggle current
                if (isHidden) {
                    detailsRow.classList.remove('d-none');
                    btn.querySelector('i').className = 'bi bi-chevron-up';
                }
            });
        });
    }

    toggleAllDetails() {
        const allDetails = document.querySelectorAll('.medication-details');
        const allButtons = document.querySelectorAll('.details-btn i');
        const anyVisible = Array.from(allDetails).some(d => !d.classList.contains('d-none'));

        if (anyVisible) {
            // Close all
            allDetails.forEach(d => d.classList.add('d-none'));
            allButtons.forEach(icon => {
                icon.className = 'bi bi-chevron-down';
            });
        } else {
            // Open all
            allDetails.forEach(d => d.classList.remove('d-none'));
            allButtons.forEach(icon => {
                icon.className = 'bi bi-chevron-up';
            });
        }
    }

    // ------------------------------
    // VISUALIZATION - IMPROVED
    // ------------------------------
    bindVisualization() {
        document.getElementById('toggleChartsBtn').addEventListener('click', () => {
            this.toggleCharts();
        });
    }

    toggleCharts() {
        const chartsBody = document.querySelector('#visualizationCard .card-body');
        const toggleBtn = document.getElementById('toggleChartsBtn');
        const icon = toggleBtn.querySelector('i');
        
        if (chartsBody.style.display === 'none') {
            chartsBody.style.display = 'block';
            icon.className = 'bi bi-chevron-up';
            toggleBtn.innerHTML = '<i class="bi bi-chevron-up"></i> Collapse';
            this.settings.chartsCollapsed = false;
        } else {
            chartsBody.style.display = 'none';
            icon.className = 'bi bi-chevron-down';
            toggleBtn.innerHTML = '<i class="bi bi-chevron-down"></i> Expand';
            this.settings.chartsCollapsed = true;
        }
        this.saveSettings();
    }

    updateVisualization(medications) {
        const vizCard = document.getElementById('visualizationCard');
        vizCard.classList.remove('d-none');

        // Apply saved collapse state
        if (this.settings.chartsCollapsed) {
            this.toggleCharts();
        }

        this.createMedicationChart(medications);
        this.createRouteChart(medications);
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    createMedicationChart(medications) {
        const ctx = document.getElementById('medicationChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.medication) {
            this.charts.medication.destroy();
        }

        // Group by category
        const categories = {};
        medications.forEach(med => {
            if (!med.error) { // Exclude errored medications
                categories[med.category] = (categories[med.category] || 0) + 1;
            }
        });

        const isDark = this.settings.darkTheme;
        const textColor = isDark ? '#e9ecef' : '#212529';

        this.charts.medication = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#d35400'
                    ],
                    borderWidth: 2,
                    borderColor: isDark ? '#2d2d2d' : '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor,
                            font: {
                                size: 11
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Medications by Category',
                        color: textColor,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }

    createRouteChart(medications) {
        const ctx = document.getElementById('routeChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.route) {
            this.charts.route.destroy();
        }

        // Group by route
        const routes = {};
        medications.forEach(med => {
            if (!med.error) { // Exclude errored medications
                routes[med.route] = (routes[med.route] || 0) + 1;
            }
        });

        const isDark = this.settings.darkTheme;
        const textColor = isDark ? '#e9ecef' : '#212529';
        const gridColor = isDark ? '#404040' : '#e9ecef';

        this.charts.route = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(routes),
                datasets: [{
                    label: 'Number of Medications',
                    data: Object.values(routes),
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Medications by Route',
                        color: textColor,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    updateChartsForTheme() {
        if (this.charts.medication || this.charts.route) {
            // Recreate charts with new theme colors
            this.updateVisualization(this.currentResults);
        }
    }

    // ------------------------------
    // EMERGENCY MODE
    // ------------------------------
    toggleEmergencyMode() {
        const isEmergency = document.body.classList.toggle('emergency-mode');
        const btn = document.getElementById('emergencyModeBtn');
        
        this.settings.emergencyMode = isEmergency;
        this.saveSettings();
        
        if (isEmergency) {
            btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Emergency Mode Active';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-warning');
            this.showError('EMERGENCY MODE ACTIVATED - High visibility mode enabled');
        } else {
            btn.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Emergency Mode';
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-danger');
            this.showSuccess('Emergency mode deactivated');
        }
    }

    // ------------------------------
    // HISTORY MANAGEMENT
    // ------------------------------
    addToHistory(weight) {
        this.calculationHistory.unshift({
            weight,
            timestamp: new Date().toISOString(),
            timestampDisplay: new Date().toLocaleString()
        });

        // Keep only last 10 entries
        this.calculationHistory = this.calculationHistory.slice(0, 10);
        localStorage.setItem('calculationHistory', JSON.stringify(this.calculationHistory));
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

        // Trigger animation
        summaryCard.style.animation = 'none';
        setTimeout(() => {
            summaryCard.style.animation = 'fadeIn 0.5s ease-in';
        }, 10);
    }

    // ------------------------------
    // EXPORT TEMPLATE PDF (Enhanced + Unified UI)
    // ------------------------------
    async exportTemplatePDF() {
        console.log('🚀 Starting Template PDF Export...');

        // 1️⃣ Validate input
        if (!this.currentWeight || !this.currentResults?.length) {
            this.showError('No calculation results to export. Please calculate medications first.');
            return;
        }

        // 2️⃣ Prepare UI feedback
        this.updateStatus('Generating professional template PDF...');
        const exportBtn = document.getElementById('exportBtn');
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF...';
        exportBtn.disabled = true;

        // 3️⃣ Base payload info
        const payload = {
            Weight: `${this.currentWeight} Kg`,
            Date: new Date().toLocaleString(),
        };

        // 4️⃣ Build dynamic medication field mapping
        console.groupCollapsed(`💊 Building Template PDF Payload for ${this.currentWeight} kg...`);
        this.currentResults.forEach(med => {
            const nameKey = med.name.toLowerCase().trim();
            const routeKey = `${med.name.toLowerCase()} ${med.route.toLowerCase()}`.trim();

            const field =
                PDF_FIELD_MAP[routeKey] ||
                PDF_FIELD_MAP[nameKey] ||
                PDF_FIELD_MAP[med.rawMedication?.name?.toLowerCase()] ||
                null;

            if (field) {
                const isEnergy =
                    med.category.toLowerCase().includes('shock') ||
                    med.route.toLowerCase().includes('energy');

                const unit = isEnergy ? 'J' : 'mL';
                payload[field] = `${parseFloat(med.displayVolume).toFixed(2)} ${unit}`;

                console.log(
                    `%c✔ Added → ${field}: ${payload[field]} (from "${med.name}" [${med.route}])`,
                    'color: #4CAF50; font-weight: bold;'
                );
            } else {
                console.warn(`⚠️ No PDF field mapping found for "${med.name}" (${med.route})`);
            }
        });
        console.groupEnd();

        console.log(
            '📄 Final PDF Payload:\n' +
            Object.entries(payload)
                .map(([k, v]) => `   ${k}: ${v}`)
                .join('\n')
        );

        // 5️⃣ Generate and save the PDF
        try {
            const res = await window.electronAPI.fillTemplatePDF(payload);
            console.log('🧾 Template PDF export result:', res);

            // ✅ UI Feedback
            if (res.ok) {
                this.showSuccess(`✅ Template PDF created successfully!`);
                this.updateStatus(`Template PDF saved to: ${res.output}`);

                // Brief success animation on button
                exportBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>PDF Ready!';
                setTimeout(() => {
                    exportBtn.innerHTML = originalText;
                    exportBtn.disabled = false;
                }, 1800);
            } else {
                this.showError(`Template PDF failed: ${res.error}`);
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }
        } catch (error) {
            console.error('❌ PDF export error:', error);
            this.showError(`PDF export failed: ${error.message}`);
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
        }
    }


    async exportResults() {
        if (!this.currentWeight || !this.currentResults.length) {
            this.showError('No calculation results to export. Please calculate medications first.');
            return;
        }

        try {
            this.updateStatus('Generating professional PDF report...');
            const exportBtn = document.getElementById('exportBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF...';
            exportBtn.disabled = true;

            const pdf = await PDFExporter.exportToPDF(
                this.currentResults, 
                this.currentWeight, 
                this.currentResults.filter(m => m.categoryType === 'Emergency').length,
                this.currentResults.filter(m => m.categoryType === 'PRRT').length
            );
            
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
    // CLEAR & STATUS - IMPROVED
    // ------------------------------
    clearAll() {
        document.getElementById('weight').value = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('all-results').innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-calculator display-4 d-block mb-3 opacity-50"></i>
                    <div class="fs-5 fw-medium mb-2">Ready for Calculation</div>
                    <div class="text-muted">Enter patient weight and click "Calculate All" to see results</div>
                </td>
            </tr>`;
        
        document.getElementById('exportBtn').disabled = true;
        document.getElementById('summaryCard').classList.add('d-none');
        document.getElementById('visualizationCard').classList.add('d-none');
        document.getElementById('resultsCount').textContent = 'No calculations yet';
        document.querySelector('input[name="filterGroup"][value="all"]').checked = true;
        
        // Destroy charts
        this.destroyCharts();
        
        this.currentWeight = null;
        this.currentResults = [];
        this.updateStatus('Ready - Enter patient weight to calculate medication doses.');
        document.getElementById('weight').focus();
        this.showSuccess('All calculations cleared');
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.innerHTML = `<i class="bi bi-info-circle me-2"></i>${message}`;
            statusElement.style.opacity = '0.8';
            setTimeout(() => {
                if (statusElement) statusElement.style.opacity = '1';
            }, 100);
        }
    }

    showError(message) {
        this.updateStatus(`<span class="text-danger">${message}</span>`);
    }

    showSuccess(message) {
        this.updateStatus(`<span class="text-success">${message}</span>`);
        setTimeout(() => this.updateStatus('Ready - Enter patient weight to calculate medication doses.'), 3000);
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
            .medication-row { transition: all 0.2s ease; }
            .medication-row:hover { 
                background-color: rgba(52, 152, 219, 0.08) !important;
                transform: translateX(2px);
            }
            .medication-name { font-size: 0.95em; line-height: 1.3; }
            @keyframes fadeIn { 
                from { opacity: 0; transform: translateY(-10px); } 
                to { opacity: 1; transform: translateY(0); } 
            }
            .table-active { 
                background-color: rgba(52, 152, 219, 0.15) !important; 
                border-left: 4px solid #3498db;
                position: relative;
            }
            .notes-content {
                max-height: 3.6em;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            .medication-details {
                transition: all 0.3s ease;
            }
            .chart-container {
                position: relative;
                height: 250px;
                width: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    // ------------------------------
    // CLEANUP
    // ------------------------------
    destroy() {
        this.destroyCharts();
        // Remove any event listeners if needed
    }
}

// ------------------------------
// STARTUP
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    new DrugCalculator();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Cleanup if needed
});

export default DrugCalculator;