// medications-database.js
// Pediatric Drug Calculator - Accurate Medication Database
// Based on Emergency Drug Equations and PRRT Equations Excel files

class MedicationDatabase {
    static getEmergencyMedications() {
        return [
            // Epinephrine variations
            {
                name: "Epinephrine 1:10,000",
                concentration: "0.1 mg/mL",
                equation: "0.1 * W",
                min_ml: 0,
                max_ml: 10,
                route: "IV/IO",
                category: "Cardiac",
                notes: "Cardiac arrest, symptomatic bradycardia",
                type: "emergency"
            },
            {
                name: "Epinephrine 1:1,000", 
                concentration: "1 mg/mL",
                equation: "0.1 * W",
                min_ml: 0,
                max_ml: 2.5,
                route: "ET",
                category: "Cardiac",
                notes: "Endotracheal administration",
                type: "emergency"
            },

            // Atropine variations
            {
                name: "Atropine 1 mg/10 ml",
                concentration: "0.1 mg/mL", 
                equation: "0.2 * W",
                min_ml: 1,
                max_ml: 5,
                route: "IV",
                category: "Cardiac",
                notes: "Minimum dose 1 mL, maximum dose 5 mL",
                type: "emergency"
            },
            {
                name: "Atropine 0.5 mg/ml",
                concentration: "0.5 mg/mL",
                equation: "0.04 * W", 
                min_ml: 0.2,
                max_ml: 1,
                route: "IV",
                category: "Cardiac",
                notes: "Minimum dose 0.2 mL, maximum dose 1 mL",
                type: "emergency"
            },
            {
                name: "Atropine 0.6 mg/ml",
                concentration: "0.6 mg/mL",
                equation: "0.033 * W",
                min_ml: 0.167, 
                max_ml: 0.833,
                route: "IV",
                category: "Cardiac",
                notes: "Minimum dose 0.167 mL, maximum dose 0.833 mL",
                type: "emergency"
            },
            {
                name: "Atropine ET 1 mg/10 ml",
                concentration: "0.1 mg/mL",
                equation: "0.6 * W",
                min_ml: 0,
                max_ml: 20,
                route: "ET",
                category: "Cardiac", 
                notes: "Endotracheal administration",
                type: "emergency"
            },
            {
                name: "Atropine ET 0.5 mg/ml",
                concentration: "0.5 mg/mL",
                equation: "0.12 * W",
                min_ml: 0,
                max_ml: 4,
                route: "ET",
                category: "Cardiac",
                notes: "Endotracheal administration",
                type: "emergency"
            },
            {
                name: "Atropine ET 0.6 mg/ml",
                concentration: "0.6 mg/mL", 
                equation: "0.1 * W",
                min_ml: 0,
                max_ml: 3.33,
                route: "ET",
                category: "Cardiac",
                notes: "Endotracheal administration",
                type: "emergency"
            },

            // Other emergency medications
            {
                name: "Amiodarone",
                concentration: "50 mg/mL",
                equation: "0.1 * W",
                min_ml: 0,
                max_ml: 300,
                route: "IV",
                category: "Cardiac",
                notes: "For refractory VF/VT",
                type: "emergency"
            },
            {
                name: "Adenosine 1st",
                concentration: "3 mg/mL",
                equation: "0.033 * W",
                min_ml: 0,
                max_ml: 6,
                route: "IV",
                category: "Cardiac",
                notes: "First dose for SVT, rapid push",
                type: "emergency"
            },
            {
                name: "Adenosine 2nd",
                concentration: "3 mg/mL",
                equation: "0.067 * W",
                min_ml: 0,
                max_ml: 12,
                route: "IV",
                category: "Cardiac",
                notes: "Second dose for SVT if needed",
                type: "emergency"
            },
            {
                name: "Calcium",
                concentration: "100 mg/mL",
                equation: "0.2 * W",
                min_ml: 0,
                max_ml: 20,
                route: "IV",
                category: "Electrolyte",
                notes: "Calcium gluconate or chloride",
                type: "emergency"
            },
            {
                name: "Flumazenil",
                concentration: "0.1 mg/mL",
                equation: "0.1 * W",
                min_ml: 0,
                max_ml: 2,
                route: "IV",
                category: "Antidote",
                notes: "Benzodiazepine reversal, max 2 mL",
                type: "emergency"
            },
            {
                name: "Glucagon",
                concentration: "1 mg/mL",
                equation: "0.1 * W",
                min_ml: 0,
                max_ml: 1,
                route: "IV/IM",
                category: "Endocrine",
                notes: "Hypoglycemia, maximum 1 mL",
                type: "emergency"
            },
            {
                name: "Lidocaine IV",
                concentration: "20 mg/mL",
                equation: "0.05 * W",
                min_ml: 0,
                max_ml: null,
                route: "IV",
                category: "Cardiac",
                notes: "Ventricular arrhythmias",
                type: "emergency"
            },
            {
                name: "Lidocaine ET",
                concentration: "20 mg/mL",
                equation: "0.1 * W",
                min_ml: 0,
                max_ml: null,
                route: "ET",
                category: "Cardiac",
                notes: "Endotracheal administration",
                type: "emergency"
            },
            {
                name: "Naloxone IV",
                concentration: "0.4 mg/mL",
                equation: "0.025 * W",
                min_ml: 0,
                max_ml: 2,
                route: "IV",
                category: "Antidote",
                notes: "Opioid reversal, maximum 2 mL",
                type: "emergency"
            },
            {
                name: "Naloxone ET",
                concentration: "0.4 mg/mL",
                equation: "0.05 * W",
                min_ml: 0,
                max_ml: null,
                route: "ET",
                category: "Antidote",
                notes: "Endotracheal administration",
                type: "emergency"
            },
            {
                name: "Rocuronium",
                concentration: "10 mg/mL",
                equation: "0.06 * W",
                min_ml: 0,
                max_ml: null,
                route: "IV",
                category: "Neuromuscular",
                notes: "Rapid sequence intubation",
                type: "emergency"
            },
            {
                name: "Sodium Bicarbonate",
                concentration: "1 mEq/mL",
                equation: "1.0 * W",
                min_ml: 0,
                max_ml: null,
                route: "IV",
                category: "Electrolyte",
                notes: "Metabolic acidosis",
                type: "emergency"
            },
            {
                name: "Sodium Chloride",
                concentration: "0.9%",
                equation: "20.0 * W",
                min_ml: 0,
                max_ml: null,
                route: "IV",
                category: "Fluid",
                notes: "Volume expansion, bolus",
                type: "emergency"
            }
        ];
    }

    static getPRRTMedications() {
        return [
            // PRRT Medications from Excel file
            {
                name: "Epinephrine (IM)",
                concentration: "1 mg/mL",
                equation: "0.01 * W",
                min_ml: 0,
                max_ml: 0.5,
                route: "IM",
                category: "Allergy",
                notes: "Anaphylaxis, severe allergic reaction",
                type: "prrt"
            },
            {
                name: "Hydrocortisone Na succinate",
                concentration: "50 mg/mL",
                equation: "D / 50", // D = dose in mg (needs input)
                min_ml: 0,
                max_ml: 2, // 100 mg / 50 mg/mL = 2 mL
                route: "IV",
                category: "Steroid",
                notes: "Requires dose input, max 100 mg/dose",
                type: "prrt",
                requiresDoseInput: true
            },
            {
                name: "Dexamethasone",
                concentration: "4 mg/mL",
                equation: "(0.6 * W) / 4",
                min_ml: 0,
                max_ml: 4,
                route: "IV/IM",
                category: "Steroid",
                notes: "Croup, inflammation, max 16 mg",
                type: "prrt"
            },
            {
                name: "Methylprednisolone",
                concentration: "62.5 mg/mL",
                equation: "(1 * W) / 62.5", // Using lower range 1 mg/kg
                min_ml: 0,
                max_ml: null,
                route: "IV",
                category: "Steroid",
                notes: "1-2 mg/kg, varies per protocol",
                type: "prrt"
            },
            {
                name: "Acetaminophen",
                concentration: "10 mg/mL",
                equation: "(15 * W) / 10",
                min_ml: 0,
                max_ml: 7.5,
                route: "PO/PR",
                category: "Analgesic",
                notes: "Fever and pain management, 15 mg/kg",
                type: "prrt"
            },
            {
                name: "Diphenhydramine",
                concentration: "50 mg/mL",
                equation: "(1 * W) / 50", // Using 1 mg/kg
                min_ml: 0,
                max_ml: 1,
                route: "IV/IM",
                category: "Antihistamine",
                notes: "Allergic reactions, 1-2 mg/kg, max 50 mg",
                type: "prrt"
            },
            {
                name: "Albuterol",
                concentration: "2 mg/mL",
                equation: "(0.15 * W) / 2",
                min_ml: 0,
                max_ml: 2.5,
                route: "Nebulized",
                category: "Respiratory",
                notes: "Bronchospasm, max 5 mg",
                type: "prrt"
            },
            {
                name: "Racepinephrine",
                concentration: "22.5 mg/mL",
                equation: "0.05 * W", // Using lower range
                min_ml: 0,
                max_ml: null,
                route: "Nebulized",
                category: "Respiratory",
                notes: "0.05-0.1 mL/kg, per clinical order",
                type: "prrt"
            },
            {
                name: "Ipratropium",
                concentration: "0.25 mg/mL",
                equation: "D * 4", // D = dose in mg (needs input)
                min_ml: 0,
                max_ml: 2,
                route: "Nebulized",
                category: "Respiratory",
                notes: "Requires dose input, max 0.5 mg",
                type: "prrt",
                requiresDoseInput: true
            },
            {
                name: "Flumazenil",
                concentration: "0.1 mg/mL",
                equation: "(0.01 * W) / 0.1",
                min_ml: 0,
                max_ml: 2,
                route: "IV",
                category: "Antidote",
                notes: "Benzodiazepine reversal, max 0.2 mg",
                type: "prrt"
            },
            {
                name: "Naloxone",
                concentration: "0.4 mg/mL",
                equation: "(0.1 * W) / 0.4",
                min_ml: 0,
                max_ml: 5,
                route: "IV",
                category: "Antidote",
                notes: "Opioid reversal, max 2 mg",
                type: "prrt"
            },
            {
                name: "Levetiracetam",
                concentration: "100 mg/mL",
                equation: "(20 * W) / 100", // Using lower range 20 mg/kg
                min_ml: 0,
                max_ml: 45,
                route: "IV",
                category: "Anticonvulsant",
                notes: "20-60 mg/kg, max 4500 mg",
                type: "prrt"
            },
            {
                name: "Glucagon",
                concentration: "1 mg/mL",
                equation: "(0.02 * W) / 1", // Using lower range 0.02 mg/kg
                min_ml: 0,
                max_ml: 1,
                route: "IV/IM",
                category: "Endocrine",
                notes: "Hypoglycemia, 0.02-0.03 mg/kg, max 1 mg",
                type: "prrt"
            },
            {
                name: "Furosemide",
                concentration: "10 mg/mL",
                equation: "(1 * W) / 10",
                min_ml: 0,
                max_ml: 4,
                route: "IV",
                category: "Diuretic",
                notes: "Edema, hypertension, max 40 mg",
                type: "prrt"
            }
        ];
    }

    // Get all medications merged with proper classification
    static getAllMedications() {
        return {
            emergency: this.getEmergencyMedications(),
            prrt: this.getPRRTMedications()
        };
    }

    // Get medications by type (emergency or prrt)
    static getMedicationsByType(type) {
        if (type === 'emergency') {
            return this.getEmergencyMedications();
        } else if (type === 'prrt') {
            return this.getPRRTMedications();
        } else {
            return [...this.getEmergencyMedications(), ...this.getPRRTMedications()];
        }
    }

    // Search medications by name, category, or route
    static searchMedications(query) {
        const allMeds = [...this.getEmergencyMedications(), ...this.getPRRTMedications()];
        const lowerQuery = query.toLowerCase();
        
        return allMeds.filter(med => 
            med.name.toLowerCase().includes(lowerQuery) ||
            med.category.toLowerCase().includes(lowerQuery) ||
            med.route.toLowerCase().includes(lowerQuery) ||
            med.notes.toLowerCase().includes(lowerQuery)
        );
    }

    // Get medications by category
    static getMedicationsByCategory(category) {
        const allMeds = [...this.getEmergencyMedications(), ...this.getPRRTMedications()];
        return allMeds.filter(med => 
            med.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Get medications by route
    static getMedicationsByRoute(route) {
        const allMeds = [...this.getEmergencyMedications(), ...this.getPRRTMedications()];
        return allMeds.filter(med => 
            med.route.toLowerCase().includes(route.toLowerCase())
        );
    }

    // Get database statistics
    static getDatabaseStats() {
        const emergency = this.getEmergencyMedications();
        const prrt = this.getPRRTMedications();
        const allMeds = [...emergency, ...prrt];
        
        return {
            totalMedications: allMeds.length,
            emergencyCount: emergency.length,
            prrtCount: prrt.length,
            categories: [...new Set(allMeds.map(med => med.category))],
            routes: [...new Set(allMeds.map(med => med.route))],
            types: ["emergency", "prrt"]
        };
    }

    // Get medications that require dose input
    static getMedicationsRequiringDoseInput() {
        const allMeds = [...this.getEmergencyMedications(), ...this.getPRRTMedications()];
        return allMeds.filter(med => med.requiresDoseInput);
    }

    // Validate medication equation
    static validateEquation(equation, weight) {
        try {
            const safeEquation = equation.replace('W', weight.toString());
            const result = eval(safeEquation);
            return { valid: true, result: result };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Calculate medication volume
    static calculateVolume(medication, weight, customDose = null) {
        let equation = medication.equation;
        
        // Handle medications that require dose input
        if (medication.requiresDoseInput && customDose !== null) {
            equation = equation.replace('D', customDose.toString());
        } else if (medication.requiresDoseInput) {
            return { error: `Dose input required for ${medication.name}` };
        }
        
        // Replace W with weight
        equation = equation.replace('W', weight.toString());
        
        try {
            let volume = eval(equation);
            
            // Apply constraints
            if (medication.min_ml !== null) {
                volume = Math.max(volume, medication.min_ml);
            }
            if (medication.max_ml !== null) {
                volume = Math.min(volume, medication.max_ml);
            }
            
            return { 
                volume: volume,
                displayVolume: volume.toFixed(2),
                equationUsed: equation
            };
            
        } catch (error) {
            return { error: `Calculation error: ${error.message}` };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicationDatabase;
}