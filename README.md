# 🩺 Pediatric Drug Calculator

A **fast, always-on, offline** medication dosage calculator designed for **pediatric emergency** and **PRRT (Pediatric Resuscitation Reference Table)** use.  
Built with [Electron](https://www.electronjs.org/) and [Bootstrap](https://getbootstrap.com/) to deliver a clean, full-screen interface optimized for emergency rooms, ICUs, and rapid bedside use.

---

## 🚀 Features

- **Always-on / Auto-start:** launches automatically with system startup.  
- **Fullscreen Kiosk Mode:** no close buttons; can only be exited through secure settings.  
- **Emergency & PRRT Modes:** switch between two calculation modes:
  - 🚨 **Emergency:** quick mL dose calculation using weight-based equations.  
  - 💉 **PRRT:** advanced mg/kg and concentration-based dosing.
- **Shared Weight Input:** single weight entry for both calculation modes.  
- **PDF Export:** print-ready dosing tables for medical documentation.  
- **Bootstrap UI:** responsive, clean, and easy to navigate.  
- **Offline:** no internet required.

---

## 📊 Example Table (Emergency Mode)

| Medication               | Route | Equation     | Volume (mL) | Min | Max |
|---------------------------|-------|--------------|------------|-----|-----|
| Epinephrine 1:10,000      | IV    | 0.1 × W      | 2.0        | 0   | 10  |
| Atropine 0.5 mg/mL        | IV    | 0.04 × W     | 0.8        | 0.2 | 1.0 |
| Adenosine 1st             | IV    | 0.033 × W    | 0.66       | 0   | 6   |

---

## 🧮 Calculation Modes

- **Emergency Mode:**  
  Uses predefined equations like `0.1 × weight` to compute volumes quickly.

- **PRRT Mode:**  
  Calculates **mg dose** based on weight and concentration, with safety checks for max dose/volume.

---

## 🛡️ Safety Features

- Dose and volume validation against min/max limits.  
- Warnings if exceeding maximum recommended values.  
- No direct app close (exit through secure settings only).  
- Kiosk mode to prevent accidental closure.

---

## 🧰 Tech Stack

- ⚡ [Electron](https://www.electronjs.org/)
- 💻 [Bootstrap](https://getbootstrap.com/)
- 🧮 Math parser (safe equation evaluation)
- 📝 HTML2Canvas & jsPDF for PDF generation

---

## 🧪 Installation

```bash
# Clone the repository
git clone https://github.com/yazen4Gamer/pediatric-drug-calculator.git

# Navigate into the project
cd pediatric-drug-calculator

# Install dependencies
npm install

# Start the app
npm start
