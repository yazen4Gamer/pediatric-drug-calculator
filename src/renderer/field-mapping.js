// --------------------------------------------------------------------
// PDF_FIELD_MAP - Connects medication names/routes to PDF field names
// --------------------------------------------------------------------
export const PDF_FIELD_MAP = {
    // --- Basic Info ---
    weight: "Weight",
    date: "Date",

    // --- Epinephrine ---
    "epinephrine 1:10,000 iv/io": "EpinephrineIV",
    "epinephrine 1:10,000": "EpinephrineIV",
    "epinephrine 1:1,000 et": "EpinephrineET",
    "epinephrine 1:1,000": "EpinephrineET",

    // --- Atropine (IV) ---
    "atropine 1 mg/10 ml iv": "Atropine_01_IV",
    "atropine 0.5 mg/ml iv": "Atropine_05_IV",
    "atropine 0.6 mg/ml iv": "Atropine_06_IV",

    // --- Atropine (ET) ---
    "atropine 1 mg/10 ml et": "Atropine_01_ET",
    "atropine 0.5 mg/ml et": "Atropine_05_ET",
    "atropine 0.6 mg/ml et": "Atropine_06_ET",

    // --- Cardiac & Electrolyte Drugs ---
    "amiodarone": "Amiodarone",
    "adenosine 1st": "Adenosine1",
    "adenosine 2nd": "Adenosine2",
    "calcium": "Calcium",

    // --- Antidotes ---
    "flumazenil": "Flumazenil",
    "naloxone iv": "NaloxoneIV",
    "naloxone et": "NaloxoneET",

    // --- Endocrine ---
    "glucagon": "Glucagon",

    // --- Lidocaine ---
    "lidocaine iv": "LidocaineIV",
    "lidocaine et": "LidocaineET",

    // --- Neuromuscular ---
    "rocuronium": "Rocuronium",

    // --- Electrolyte / Fluid ---
    "sodium bicarbonate": "Bicarbonate",
    "sodium chloride": "VolumeExpanders",

    // --- Defibrillation & Cardioversion ---
    "defibrillation 1": "Defibrillation1",
    "defibrillation 2": "Defibrillation2",
    "defibrillation 3": "Defibrillation3",
    "cardioversion": "Cardioversion"
};
