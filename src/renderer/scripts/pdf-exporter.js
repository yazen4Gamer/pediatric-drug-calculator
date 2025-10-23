// src/renderer/scripts/pdf-exporter.js
// Pediatric Drug Calculator - Professional PDF Export
// Clean and modular export system for Emergency & PRRT medications

export default class PDFExporter {
    static async exportToPDF(medications, weight, emergencyCount, prrtCount) {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();

                const pageWidth = pdf.internal.pageSize.getWidth();
                const margin = 15;
                const contentWidth = pageWidth - (margin * 2);
                let yPosition = margin;

                // Header
                yPosition = this.addHeader(pdf, pageWidth);
                yPosition += 3;

                // Patient info
                yPosition = this.addPatientInfo(pdf, margin, yPosition, contentWidth, weight);
                yPosition += 4;

                // Summary
                yPosition = this.addSummarySection(
                    pdf, margin, yPosition, contentWidth,
                    medications.length, emergencyCount, prrtCount
                );
                yPosition += 6;

                // Emergency meds section
                const emergencyMeds = medications.filter(med => med.type === 'emergency');
                if (emergencyMeds.length > 0) {
                    yPosition = this.addMedicationSection(
                        pdf, 'EMERGENCY MEDICATIONS',
                        emergencyMeds, margin, yPosition,
                        contentWidth, pageWidth
                    );
                    yPosition += 4;
                }

                // PRRT meds section
                const prrtMeds = medications.filter(med => med.type === 'prrt');
                if (prrtMeds.length > 0) {
                    yPosition = this.addMedicationSection(
                        pdf, 'PRRT MEDICATIONS',
                        prrtMeds, margin, yPosition,
                        contentWidth, pageWidth
                    );
                    yPosition += 4;
                }

                // Footer
                this.addFooter(pdf, pageWidth, margin);

                resolve(pdf);
            } catch (error) {
                reject(error);
            }
        });
    }

    // --------------------------------------------------
    // HEADER SECTION
    // --------------------------------------------------
    static addHeader(pdf, pageWidth) {
        pdf.setFillColor(44, 62, 80);
        pdf.rect(0, 0, pageWidth, 25, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text('PEDIATRIC DRUG CALCULATOR', pageWidth / 2, 12, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255, 0.9);
        pdf.text('Emergency & PRRT Medication Reference Guide', pageWidth / 2, 18, { align: 'center' });

        return 30;
    }

    // --------------------------------------------------
    // PATIENT INFO
    // --------------------------------------------------
    static addPatientInfo(pdf, margin, yPosition, contentWidth, weight) {
        pdf.setFillColor(52, 152, 219);
        pdf.rect(margin, yPosition, contentWidth, 6, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text('PATIENT INFORMATION', margin + 5, yPosition + 4.2);

        yPosition += 10;

        const ageEstimate = this.estimateAge(weight);
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);

        // First row
        pdf.setFont('helvetica', 'bold');
        pdf.text('Weight:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${weight} kg`, margin + 20, yPosition);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Age Estimate:', margin + 60, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(ageEstimate, margin + 95, yPosition);

        // Second row
        pdf.setFont('helvetica', 'bold');
        pdf.text('Generated:', margin, yPosition + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(new Date().toLocaleString(), margin + 25, yPosition + 5);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Total Meds:', margin + 60, yPosition + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(this.getTotalMedsCount(weight).toString(), margin + 85, yPosition + 5);

        return yPosition + 12;
    }

    // --------------------------------------------------
    // SUMMARY SECTION
    // --------------------------------------------------
    static addSummarySection(pdf, margin, yPosition, contentWidth, totalMeds, emergencyCount, prrtCount) {
        pdf.setFillColor(248, 249, 250);
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin, yPosition, contentWidth, 20, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(52, 152, 219);
        pdf.text('CALCULATION SUMMARY', margin + 5, yPosition + 6);

        const col1 = margin + 8;
        const col2 = margin + 65;
        const col3 = margin + 120;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Total Medications:', col1, yPosition + 13);
        pdf.setFont('helvetica', 'normal');
        pdf.text(totalMeds.toString(), col1 + 28, yPosition + 13);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Emergency Drugs:', col2, yPosition + 13);
        pdf.setFont('helvetica', 'normal');
        pdf.text(emergencyCount.toString(), col2 + 25, yPosition + 13);

        pdf.setFont('helvetica', 'bold');
        pdf.text('PRRT Drugs:', col3, yPosition + 13);
        pdf.setFont('helvetica', 'normal');
        pdf.text(prrtCount.toString(), col3 + 22, yPosition + 13);

        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        pdf.text('All doses calculated per standard pediatric guidelines', margin + 5, yPosition + 18);

        return yPosition + 25;
    }

    // --------------------------------------------------
    // MEDICATION TABLE SECTION
    // --------------------------------------------------
    static addMedicationSection(pdf, sectionTitle, medications, margin, yPosition, contentWidth, pageWidth) {
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Section header
        pdf.setFillColor(sectionTitle.includes('EMERGENCY') ? 231 : 52, sectionTitle.includes('EMERGENCY') ? 76 : 152, sectionTitle.includes('EMERGENCY') ? 60 : 219);
        pdf.rect(margin, yPosition, contentWidth, 5, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.text(sectionTitle, margin + 5, yPosition + 3.5);
        yPosition += 8;

        const columns = [
            { name: 'MEDICATION', width: 65 },
            { name: 'VOLUME', width: 20 },
            { name: 'DOSE', width: 25 },
            { name: 'ROUTE', width: 18 },
            { name: 'CONCENTRATION', width: 32 }
        ];

        // Header row
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition, contentWidth, 4, 'F');

        let xPos = margin + 2;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(0, 0, 0);
        columns.forEach(col => {
            pdf.text(col.name, xPos, yPosition + 2.8);
            xPos += col.width;
        });
        yPosition += 6;

        // Medication rows
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);

        medications.forEach((med, i) => {
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = margin;
            }

            // Alternate row background
            if (i % 2 === 0) {
                pdf.setFillColor(250, 250, 250);
                pdf.rect(margin, yPosition - 1, contentWidth, 4, 'F');
            }

            let x = margin + 2;
            let medName = med.name.length > 35 ? med.name.substring(0, 35) + '…' : med.name;
            pdf.text(medName, x, yPosition + 2.5);
            x += columns[0].width;

            // Volume
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(231, 76, 60);
            pdf.text(`${med.displayVolume} mL`, x, yPosition + 2.5);
            x += columns[1].width;

            // Dose
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.text(med.totalDose || '-', x, yPosition + 2.5);
            x += columns[2].width;

            // Route
            pdf.text(med.route || '-', x, yPosition + 2.5);
            x += columns[3].width;

            // Concentration
            let concentration = med.concentration || '';
            if (concentration.length > 25) concentration = concentration.substring(0, 25) + '…';
            pdf.text(concentration, x, yPosition + 2.5);

            yPosition += 4.5;
        });

        return yPosition;
    }

    // --------------------------------------------------
    // FOOTER
    // --------------------------------------------------
    static addFooter(pdf, pageWidth, margin) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);

        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);

        const disclaimers = [
            'This document is for medical reference only. Verify all calculations with qualified healthcare professionals.',
            'Dosages are based on standard pediatric guidelines and may require individual adjustments.',
            'Follow hospital protocols, verify concentrations, and double-check calculations before administration.'
        ];

        let y = pageHeight - 27;
        disclaimers.forEach(line => {
            const wrapped = pdf.splitTextToSize(line, pageWidth - (margin * 2));
            wrapped.forEach(w => {
                pdf.text(w, margin, y);
                y += 3;
            });
        });

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Generated by Pediatric Drug Calculator - ${new Date().getFullYear()}`,
            pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    // --------------------------------------------------
    // UTILITIES
    // --------------------------------------------------
    static estimateAge(weight) {
        if (weight < 3) return 'Newborn';
        if (weight < 6) return '1–3 months';
        if (weight < 8) return '3–6 months';
        if (weight < 10) return '6–9 months';
        if (weight < 12) return '9–12 months';
        if (weight < 14) return '1–2 years';
        if (weight < 16) return '2–3 years';
        if (weight < 20) return '4–5 years';
        if (weight < 25) return '6–8 years';
        if (weight < 35) return '9–11 years';
        if (weight < 45) return '12–14 years';
        return '15+ years';
    }

    static getTotalMedsCount(weight) {
        if (weight < 10) return 18;
        if (weight < 20) return 22;
        if (weight < 30) return 25;
        return 28;
    }

    static generateFileName(weight) {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 16);
        return `Pediatric_Drug_Calculations_${weight}kg_${timestamp}.pdf`;
    }

    static savePDF(pdf, weight) {
        const fileName = this.generateFileName(weight);
        pdf.save(fileName);
        return fileName;
    }

    static getPDFAsBlob(pdf) {
        return pdf.output('blob');
    }

    static getPDFAsDataURL(pdf) {
        return pdf.output('datauristring');
    }
}
