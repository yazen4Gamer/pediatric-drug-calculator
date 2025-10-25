# 🩺 Pediatric Drug Calculator

A **fast, always-on, offline** medication dosage calculator built for **pediatric emergencies** and **PRRT (Pediatric Resuscitation Reference Table)** use.  
Developed with [Electron](https://www.electronjs.org/) and [Bootstrap](https://getbootstrap.com/) to provide a **clean**, **full-screen**, and **reliable** interface for **emergency rooms**, **ICUs**, and **bedside use**.

---

## 📥 Download

👉 [**Download the latest release**](https://github.com/yazen4Gamer/pediatric-drug-calculator/releases)

> ⚠️ **Important:**  
> After installation, right-click the app and choose **“Run as Administrator”** to enable auto-start functionality.  
> The app will still run without it, but auto-launch will not be enabled unless elevated permissions are granted.

---

## 🚀 Key Features

- 🖥️ **Auto-Start on Boot** – Launches automatically when the system starts.  
- 🧭 **Fullscreen Kiosk Mode** – Prevents accidental closing during emergencies.  
- 🩹 **Dual Modes:**  
  - 🚨 **Emergency Mode:** Rapid mL dose calculation using weight-based equations.  
  - 💉 **PRRT Mode:** Advanced mg/kg dosing with min/max validation.  
- ⚖️ **Shared Weight Input** – One input updates all calculations simultaneously.  
- 🧾 **PDF Export** – Clean print-ready reference sheets for documentation.  
- 🪄 **Bootstrap UI** – Fast and responsive user interface.  
- 📴 **Offline First** – No internet connection required once installed.

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
Uses predefined equations like `0.1 × weight` to calculate critical medication volumes instantly.

### 💉 PRRT Mode
Performs mg/kg dosing calculations with concentration and min/max validation — ideal for weight-based pediatric resuscitation protocols.

---

## 🛡️ Safety Features

- ✅ Validates doses and volumes against safe ranges  
- ⚠️ Warns if limits are exceeded  
- 🖥️ Locks in kiosk mode to avoid accidental closure  
- 🔒 Secure exit flow for controlled shutdown

---

## 🧰 Tech Stack

- ⚡ [Electron](https://www.electronjs.org/) — cross-platform desktop framework  
- 💻 [Bootstrap](https://getbootstrap.com/) — responsive UI  
- 🧮 [mathjs](https://mathjs.org/) — safe math parsing  
- 📝 [html2canvas](https://html2canvas.hertzen.com/) & [jsPDF](https://github.com/parallax/jsPDF) — PDF export

---

## 🧪 Developer Setup

```bash
# Clone the repository
git clone https://github.com/yazen4Gamer/pediatric-drug-calculator.git

# Enter the project directory
cd pediatric-drug-calculator

# Install dependencies
npm install

# Run the app in development mode
npm run dev
