// src/renderer/scripts/calc/medications-database.js
// Pediatric Drug Calculator - Medication Database & Calculation Engine
// Rewritten with mathjs, validation, mg calculation & clean structure

import { evaluate } from './utils/math-helper.js';
export default class MedicationDatabase {
    // ---------------------------------------------
    // Emergency Medications
    // ---------------------------------------------
    static getEmergencyMedications() {
        return [
            { name: "Epinephrine 1:10,000", concentration: "0.1", equation: "0.1 * W", min_ml: 0, max_ml: 10, route: "IV/IO", category: "Cardiac", notes: "Cardiac arrest, symptomatic bradycardia", type: "emergency" },
            { name: "Epinephrine 1:1,000", concentration: "1", equation: "0.1 * W", min_ml: 0, max_ml: 2.5, route: "ET", category: "Cardiac", notes: "Endotracheal administration", type: "emergency" },

            { name: "Atropine 1 mg/10 ml", concentration: "0.1", equation: "0.2 * W", min_ml: 1, max_ml: 5, route: "IV", category: "Cardiac", notes: "Minimum dose 1 mL, maximum dose 5 mL", type: "emergency" },
            { name: "Atropine 0.5 mg/ml", concentration: "0.5", equation: "0.04 * W", min_ml: 0.2, max_ml: 1, route: "IV", category: "Cardiac", notes: "Min 0.2 mL, max 1 mL", type: "emergency" },
            { name: "Atropine 0.6 mg/ml", concentration: "0.6", equation: "0.033 * W", min_ml: 0.167, max_ml: 0.833, route: "IV", category: "Cardiac", notes: "Min 0.167 mL, max 0.833 mL", type: "emergency" },

            { name: "Amiodarone", concentration: "50", equation: "0.1 * W", min_ml: 0, max_ml: 300, route: "IV", category: "Cardiac", notes: "For refractory VF/VT", type: "emergency" },
            { name: "Adenosine 1st", concentration: "3", equation: "0.033 * W", min_ml: 0, max_ml: 6, route: "IV", category: "Cardiac", notes: "First dose for SVT, rapid push", type: "emergency" },
            { name: "Adenosine 2nd", concentration: "3", equation: "0.067 * W", min_ml: 0, max_ml: 12, route: "IV", category: "Cardiac", notes: "Second dose for SVT", type: "emergency" },

            { name: "Calcium", concentration: "100", equation: "0.2 * W", min_ml: 0, max_ml: 20, route: "IV", category: "Electrolyte", notes: "Calcium gluconate or chloride", type: "emergency" },
            { name: "Flumazenil", concentration: "0.1", equation: "0.1 * W", min_ml: 0, max_ml: 2, route: "IV", category: "Antidote", notes: "Benzodiazepine reversal", type: "emergency" },
            { name: "Glucagon", concentration: "1", equation: "0.1 * W", min_ml: 0, max_ml: 1, route: "IV/IM", category: "Endocrine", notes: "Hypoglycemia", type: "emergency" },

            { name: "Lidocaine IV", concentration: "20", equation: "0.05 * W", min_ml: 0, max_ml: null, route: "IV", category: "Cardiac", notes: "Ventricular arrhythmias", type: "emergency" },
            { name: "Lidocaine ET", concentration: "20", equation: "0.1 * W", min_ml: 0, max_ml: null, route: "ET", category: "Cardiac", notes: "Endotracheal administration", type: "emergency" },

            { name: "Naloxone IV", concentration: "0.4", equation: "0.025 * W", min_ml: 0, max_ml: 2, route: "IV", category: "Antidote", notes: "Opioid reversal", type: "emergency" },
            { name: "Naloxone ET", concentration: "0.4", equation: "0.05 * W", min_ml: 0, max_ml: null, route: "ET", category: "Antidote", notes: "Endotracheal", type: "emergency" },

            { name: "Rocuronium", concentration: "10", equation: "0.06 * W", min_ml: 0, max_ml: null, route: "IV", category: "Neuromuscular", notes: "RSI", type: "emergency" },
            { name: "Sodium Bicarbonate", concentration: "1", equation: "1.0 * W", min_ml: 0, max_ml: null, route: "IV", category: "Electrolyte", notes: "Metabolic acidosis", type: "emergency" },
            { name: "Sodium Chloride", concentration: "0", equation: "20.0 * W", min_ml: 0, max_ml: null, route: "IV", category: "Fluid", notes: "Bolus", type: "emergency" }
        ];
    }

    // ---------------------------------------------
    // PRRT Medications
    // ---------------------------------------------
    static getPRRTMedications() {
        return [
            { name: "Epinephrine (IM)", concentration: "1", equation: "0.01 * W", min_ml: 0, max_ml: 0.5, route: "IM", category: "Allergy", notes: "Anaphylaxis", type: "prrt" },
            { name: "Hydrocortisone Na succinate", concentration: "50", equation: "D / 50", min_ml: 0, max_ml: 2, route: "IV", category: "Steroid", notes: "Requires dose input", type: "prrt", requiresDoseInput: true },
            { name: "Dexamethasone", concentration: "4", equation: "(0.6 * W) / 4", min_ml: 0, max_ml: 4, route: "IV/IM", category: "Steroid", notes: "Croup, max 16 mg", type: "prrt" },
            { name: "Methylprednisolone", concentration: "62.5", equation: "(1 * W) / 62.5", min_ml: 0, max_ml: null, route: "IV", category: "Steroid", notes: "1-2 mg/kg", type: "prrt" },
            { name: "Acetaminophen", concentration: "10", equation: "(15 * W) / 10", min_ml: 0, max_ml: 7.5, route: "PO/PR", category: "Analgesic", notes: "15 mg/kg", type: "prrt" },
            { name: "Diphenhydramine", concentration: "50", equation: "(1 * W) / 50", min_ml: 0, max_ml: 1, route: "IV/IM", category: "Antihistamine", notes: "1-2 mg/kg", type: "prrt" },
            { name: "Albuterol", concentration: "2", equation: "(0.15 * W) / 2", min_ml: 0, max_ml: 2.5, route: "Nebulized", category: "Respiratory", notes: "Max 5 mg", type: "prrt" },
            { name: "Racepinephrine", concentration: "22.5", equation: "0.05 * W", min_ml: 0, max_ml: null, route: "Nebulized", category: "Respiratory", notes: "0.05-0.1 mL/kg", type: "prrt" },
            { name: "Ipratropium", concentration: "0.25", equation: "D * 4", min_ml: 0, max_ml: 2, route: "Nebulized", category: "Respiratory", notes: "Requires dose input", type: "prrt", requiresDoseInput: true },
            { name: "Flumazenil", concentration: "0.1", equation: "(0.01 * W) / 0.1", min_ml: 0, max_ml: 2, route: "IV", category: "Antidote", notes: "Max 0.2 mg", type: "prrt" },
            { name: "Naloxone", concentration: "0.4", equation: "(0.1 * W) / 0.4", min_ml: 0, max_ml: 5, route: "IV", category: "Antidote", notes: "Max 2 mg", type: "prrt" },
            { name: "Levetiracetam", concentration: "100", equation: "(20 * W) / 100", min_ml: 0, max_ml: 45, route: "IV", category: "Anticonvulsant", notes: "20-60 mg/kg", type: "prrt" },
            { name: "Glucagon", concentration: "1", equation: "(0.02 * W) / 1", min_ml: 0, max_ml: 1, route: "IV/IM", category: "Endocrine", notes: "0.02-0.03 mg/kg", type: "prrt" },
            { name: "Furosemide", concentration: "10", equation: "(1 * W) / 10", min_ml: 0, max_ml: 4, route: "IV", category: "Diuretic", notes: "Max 40 mg", type: "prrt" }
        ];
    }

    // ---------------------------------------------
    // Utility Methods
    // ---------------------------------------------
    static getAllMedications() {
        return [...this.getEmergencyMedications(), ...this.getPRRTMedications()];
    }

    static getMedicationsByType(type) {
        if (type === 'emergency') return this.getEmergencyMedications();
        if (type === 'prrt') return this.getPRRTMedications();
        return this.getAllMedications();
    }

    static searchMedications(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllMedications().filter(med =>
            med.name.toLowerCase().includes(lowerQuery) ||
            med.category.toLowerCase().includes(lowerQuery) ||
            med.route.toLowerCase().includes(lowerQuery) ||
            med.notes.toLowerCase().includes(lowerQuery)
        );
    }

    static getMedicationsByCategory(category) {
        return this.getAllMedications().filter(med =>
            med.category.toLowerCase() === category.toLowerCase()
        );
    }

    static getMedicationsByRoute(route) {
        return this.getAllMedications().filter(med =>
            med.route.toLowerCase().includes(route.toLowerCase())
        );
    }

    static getDatabaseStats() {
        const emergency = this.getEmergencyMedications();
        const prrt = this.getPRRTMedications();
        const allMeds = this.getAllMedications();
        return {
            totalMedications: allMeds.length,
            emergencyCount: emergency.length,
            prrtCount: prrt.length,
            categories: [...new Set(allMeds.map(med => med.category))],
            routes: [...new Set(allMeds.map(med => med.route))],
            types: ["emergency", "prrt"]
        };
    }

    // ---------------------------------------------
    // Equation Validation & Volume Calculation
    // ---------------------------------------------
    static validateEquation(equation, weight) {
        try {
            const safeEquation = equation.replace('W', weight.toString());
            const result = evaluate(safeEquation , weight);
            return { valid: true, result };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    static calculateVolume(medication, weight, customDose = null) {
        if (weight <= 0 || weight > 200) {
            return { error: "Invalid weight value. Please enter a realistic weight." };
        }

        let equation = medication.equation;

        if (medication.requiresDoseInput) {
            if (customDose == null) {
                return { error: `Dose input required for ${medication.name}` };
            }
            equation = equation.replace('D', customDose.toString());
        }

        equation = equation.replace('W', weight.toString());

        try {
            let volume = evaluate(equation , weight);

            if (medication.min_ml !== null) volume = Math.max(volume, medication.min_ml);
            if (medication.max_ml !== null) volume = Math.min(volume, medication.max_ml);

            const concValue = parseFloat(medication.concentration);
            const doseMg = !isNaN(concValue) && concValue > 0 ? volume * concValue : null;

            return {
                volume,
                doseMg,
                displayVolume: volume.toFixed(2),
                equationUsed: equation
            };

        } catch (error) {
            return { error: `Calculation error: ${error.message}` };
        }
    }
}
