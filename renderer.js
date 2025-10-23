// renderer.js - Pediatric Drug Calculator Main Logic
// Updated for new medication database structure

const { ipcRenderer } = require('electron');
const MedicationDatabase = require('./medications-database');
const PDFExporter = require('./pdf-exporter');

class DrugCalculator {
    constructor() {
        this.medications = MedicationDatabase.getAllMedications();
        this.currentWeight = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.bindWindowControls();
        this.updateStatus('Ready - Enter patient weight to calculate medication doses.');
    }

    bindEvents() {
        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculateAll();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportResults();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });

        // Enter key in weight field
        document.getElementById('weight').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateAll();
            }
        });

        // Real-time input validation
        document.getElementById('weight').addEventListener('input', (e) => {
            this.validateWeightInput(e.target);
        });

        // IPC messages from main process
        ipcRenderer.on('calculate-all', () => {
            this.calculateAll();
        });

        ipcRenderer.on('export-results', () => {
            this.exportResults();
        });
    }

    bindWindowControls() {
        // Minimize button
        document.getElementById('minimizeBtn').addEventListener('click', () => {
            ipcRenderer.invoke('minimize-window');
        });
    }

    validateWeightInput(input) {
        const value = parseFloat(input.value);
        if (value > 150) {
            input.value = '150';
            this.showError('Maximum weight is 150 kg');
        } else if (value < 0.1 && value !== '') {
            input.value = '0.1';
        }
    }

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

        // Show loading state
        this.showLoadingState();

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            try {
                // Calculate all medications (excluding dose-input medications)
                const emergencyResults = this.calculateCategory('emergency', weight);
                const prrtResults = this.calculateCategory('prrt', weight);
                const allResults = [...emergencyResults, ...prrtResults];

                // Display in modern table
                this.displayModernTable(allResults);

                // Update summary card
                this.updateSummaryCard(weight, allResults.length, emergencyResults.length, prrtResults.length);

                // Enable export button
                document.getElementById('exportBtn').disabled = false;
                
                this.updateStatus(`Calculation complete for ${weight} kg patient - ${allResults.length} medications calculated`);
                this.showSuccess('All medications calculated successfully');
                
            } catch (error) {
                this.showError(`Calculation error: ${error.message}`);
            }
        }, 50);
    }

    showLoadingState() {
        const container = document.getElementById('all-results');
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="text-primary fw-medium">Calculating medication doses...</div>
                </td>
            </tr>
        `;
    }

    calculateCategory(category, weight) {
        // Filter out medications that require dose input
        const medications = this.medications[category].filter(med => !med.requiresDoseInput);
        
        return medications.map(med => {
            try {
                // Use the database calculation method for accuracy
                const result = MedicationDatabase.calculateVolume(med, weight);
                
                if (result.error) {
                    throw new Error(result.error);
                }

                // Calculate dose based on concentration
                let totalDose = this.calculateTotalDose(med, result.volume);
                
                return {
                    name: med.name,
                    concentration: med.concentration,
                    route: med.route,
                    category: med.category,
                    notes: med.notes,
                    calculatedVolume: result.volume,
                    displayVolume: result.displayVolume,
                    totalDose: totalDose,
                    categoryType: category === 'emergency' ? 'Emergency' : 'PRRT'
                };
            } catch (error) {
                console.error(`Error calculating ${med.name}:`, error);
                return {
                    ...med,
                    calculatedVolume: 0,
                    displayVolume: 'Error',
                    totalDose: 'Error',
                    categoryType: category === 'emergency' ? 'Emergency' : 'PRRT'
                };
            }
        });
    }

    calculateTotalDose(med, volume) {
        // Handle fluid medications
        if (med.name.includes('Bolus') || med.name.includes('Saline') || med.name.includes('Ringers') || med.concentration.includes('0.9%')) {
            return `${volume.toFixed(0)} mL`;
        }
        
        // Handle electrolyte medications
        if (med.concentration.includes('mEq')) {
            return `${volume.toFixed(1)} mEq`;
        }
        
        // Handle standard mg/mL medications
        const concentrationMatch = med.concentration.match(/(\d+\.?\d*)\s*mg\/mL/);
        if (concentrationMatch) {
            const concentration = parseFloat(concentrationMatch[1]);
            const doseMg = volume * concentration;
            return `${doseMg.toFixed(2)} mg`;
        }
        
        return 'N/A';
    }

    displayModernTable(medications) {
        const container = document.getElementById('all-results');
        
        if (medications.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="bi bi-calculator display-4 d-block mb-3 opacity-50"></i>
                        Enter patient weight and click "Calculate All Medications" to see results
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        
        medications.forEach(med => {
            const categoryClass = this.getCategoryClass(med.category);
            const routeClass = this.getRouteClass(med.route);
            
            html += `
                <tr class="medication-row">
                    <td class="ps-3">
                        <span class="badge ${categoryClass} category-badge">${med.categoryType}</span>
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
                        <span class="badge ${routeClass} route-badge">${med.route}</span>
                    </td>
                    <td class="pe-3 notes-cell" title="${med.notes}">${med.notes}</td>
                </tr>
            `;
        });

        container.innerHTML = html;
        
        // Update results count
        document.getElementById('resultsCount').textContent = `${medications.length} medications`;
        
        // Add click handlers for rows
        this.addRowInteractions();
    }

    addRowInteractions() {
        const rows = document.querySelectorAll('.medication-row');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                // Remove highlight from all rows
                rows.forEach(r => r.classList.remove('table-active'));
                // Add highlight to clicked row
                row.classList.add('table-active');
            });
        });
    }

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
        document.getElementById('commonCount').textContent = prrtCount; // Using existing ID, update HTML label
        
        // Add animation
        summaryCard.style.animation = 'fadeIn 0.5s ease-in';
    }

    async exportResults() {
        if (!this.currentWeight) {
            this.showError('No calculation results to export. Please calculate medications first.');
            return;
        }

        try {
            this.updateStatus('Generating professional PDF report...');
            
            // Show exporting state
            const exportBtn = document.getElementById('exportBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF...';
            exportBtn.disabled = true;

            // Get current medications
            const emergencyResults = this.calculateCategory('emergency', this.currentWeight);
            const prrtResults = this.calculateCategory('prrt', this.currentWeight);
            const allResults = [...emergencyResults, ...prrtResults];

            // Generate PDF
            const pdf = await PDFExporter.exportToPDF(
                allResults, 
                this.currentWeight, 
                emergencyResults.length, 
                prrtResults.length
            );

            // Save PDF
            const fileName = PDFExporter.savePDF(pdf, this.currentWeight);
            
            // Restore button state
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            
            this.updateStatus(`Professional PDF report generated for ${this.currentWeight} kg patient`);
            this.showSuccess(`PDF exported successfully: ${fileName}`);
            
        } catch (error) {
            console.error('PDF export error:', error);
            
            // Restore button state on error
            const exportBtn = document.getElementById('exportBtn');
            exportBtn.innerHTML = '<i class="bi bi-file-pdf me-2"></i>Export to PDF';
            exportBtn.disabled = false;
            
            this.showError(`Failed to generate PDF: ${error.message}`);
        }
    }

    clearAll() {
        document.getElementById('weight').value = '';
        document.getElementById('all-results').innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-calculator display-4 d-block mb-3 opacity-50"></i>
                    <div class="fs-5 fw-medium mb-2">Ready for Calculation</div>
                    <div class="text-muted">Enter patient weight and click "Calculate All Medications" to see results</div>
                </td>
            </tr>
        `;
        document.getElementById('exportBtn').disabled = true;
        document.getElementById('summaryCard').classList.add('d-none');
        document.getElementById('resultsCount').textContent = 'No calculations yet';
        this.currentWeight = null;
        this.updateStatus('Ready - Enter patient weight to calculate medication doses.');
        document.getElementById('weight').focus();
        
        // Show clear confirmation
        this.showSuccess('All calculations cleared');
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        
        // Add visual feedback for status changes
        statusElement.style.opacity = '0.8';
        setTimeout(() => {
            statusElement.style.opacity = '1';
        }, 100);
    }

    showError(message) {
        this.updateStatus(`Error: ${message}`);
        
        // Visual error feedback
        const statusElement = document.getElementById('status');
        statusElement.classList.remove('text-muted');
        statusElement.classList.add('text-danger');
        
        setTimeout(() => {
            statusElement.classList.remove('text-danger');
            statusElement.classList.add('text-muted');
        }, 5000);
        
        console.error('Error:', message);
    }

    showSuccess(message) {
        this.updateStatus(`Success: ${message}`);
        
        // Visual success feedback
        const statusElement = document.getElementById('status');
        statusElement.classList.remove('text-muted');
        statusElement.classList.add('text-success');
        
        setTimeout(() => {
            statusElement.classList.remove('text-success');
            statusElement.classList.add('text-muted');
        }, 3000);
        
        console.log('Success:', message);
    }

    // Utility method to get database statistics
    getDatabaseStats() {
        return MedicationDatabase.getDatabaseStats();
    }

    // Method to search medications
    searchMedications(query) {
        const allMeds = [...this.medications.emergency, ...this.medications.prrt];
        return allMeds.filter(med => 
            med.name.toLowerCase().includes(query.toLowerCase()) ||
            med.category.toLowerCase().includes(query.toLowerCase()) ||
            med.route.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Add custom styles for the enhanced UI
const addCustomStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .bg-orange { background-color: #e67e22 !important; }
        .bg-purple { background-color: #9b59b6 !important; }
        .bg-teal { background-color: #1abc9c !important; }
        .bg-indigo { background-color: #34495e !important; }
        .bg-pink { background-color: #e84393 !important; }
        .bg-cyan { background-color: #00cec9 !important; }
        .bg-brown { background-color: #a1887f !important; }
        
        .medication-row { transition: background-color 0.2s ease; }
        .medication-row:hover { background-color: rgba(52, 152, 219, 0.05) !important; }
        
        .medication-name { 
            font-size: 0.95em;
            line-height: 1.3;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .table-active { 
            background-color: rgba(52, 152, 219, 0.1) !important;
            border-left: 3px solid #3498db;
        }
        
        .concentration-cell {
            font-family: 'Courier New', monospace;
            font-size: 0.8em;
        }
        
        .notes-cell {
            font-size: 0.8em;
            line-height: 1.2;
            max-height: 2.4em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
    `;
    document.head.appendChild(style);
};

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add custom styles first
    addCustomStyles();
    
    // Initialize the calculator
    new DrugCalculator();
    
    // Add some startup enhancements
    console.log('Pediatric Drug Calculator initialized successfully');
    console.log('Database statistics:', MedicationDatabase.getDatabaseStats());
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DrugCalculator;
}