# 🩺 Pediatric Drug Calculator

A **fast, always-on, offline** medication dosage calculator built for **pediatric emergency** and **PRRT (Pediatric Resuscitation Reference Table)** use.  
Developed with [Electron](https://www.electronjs.org/) and [Bootstrap](https://getbootstrap.com/) to provide a **clean**, **full-screen** interface optimized for **emergency rooms**, **ICUs**, and **bedside use**.

---

## 🚀 Key Features

- 🖥️ **Always-on / Auto-start:** Launches automatically when the system boots.  
- 🧭 **Fullscreen Kiosk Mode:** No standard close/minimize buttons; exit through secure settings only.  
- 🩹 **Dual Modes:**
  - 🚨 **Emergency Mode:** Rapid mL dose calculation using weight-based equations.  
  - 💉 **PRRT Mode:** Advanced mg/kg and concentration-based dosing with validation.
- ⚖️ **Shared Weight Input:** One input drives both calculation modes.  
- 🧾 **PDF Export:** Clean, print-ready tables for medical documentation.  
- 🪄 **Bootstrap UI:** Responsive and intuitive interface.  
- 📴 **Offline First:** Works without an internet connection.

---

## 📊 Example Table (Emergency Mode)

| Medication               | Route | Equation     | Volume (mL) | Min | Max |
|---------------------------|-------|--------------|------------|-----|-----|
| Epinephrine 1:10,000      | IV    | 0.1 × W      | 2.0        | 0   | 10  |
| Atropine 0.5 mg/mL        | IV    | 0.04 × W     | 0.8        | 0.2 | 1.0 |
| Adenosine 1st             | IV    | 0.033 × W    | 0.66       | 0   | 6   |

---

## 🧮 Calculation Modes

### 🚨 Emergency Mode
Uses predefined equations like `0.1 × weight` to calculate medication volumes quickly.

### 💉 PRRT Mode
Calculates **mg dose** based on weight and concentration, including **min/max dose validation**.

---

## 🛡️ Safety Features

- Dose and volume validation against min/max reference values.  
- Automatic warnings when exceeding safe limits.  
- Kiosk mode to prevent accidental closure during use.  
- Secure exit flow (no accidental closing).

---

## 🧰 Tech Stack

- ⚡ [Electron](https://www.electronjs.org/)  
- 💻 [Bootstrap](https://getbootstrap.com/)  
- 🧮 Safe math parser for dose equations  
- 📝 [html2canvas](https://html2canvas.hertzen.com/) & [jsPDF](https://github.com/parallax/jsPDF) for PDF generation

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
