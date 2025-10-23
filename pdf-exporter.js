// pdf-exporter.js
// Pediatric Drug Calculator - Professional PDF Export
// Optimized PDF generation with professional medical formatting

class PDFExporter {
    static async exportToPDF(medications, weight, emergencyCount, commonCount) {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const margin = 15;
                const contentWidth = pageWidth - (margin * 2);
                let yPosition = margin;

                // Add professional header
                yPosition = this.addHeader(pdf, pageWidth, margin, yPosition);
                yPosition += 5;

                // Add patient information section
                yPosition = this.addPatientInfo(pdf, margin, yPosition, contentWidth, weight);
                yPosition += 8;

                // Add summary section
                yPosition = this.addSummarySection(pdf, margin, yPosition, contentWidth, medications.length, emergencyCount, commonCount);
                yPosition += 12;

                // Add emergency medications if available
                const emergencyMeds = medications.filter(med => med.categoryType === 'Emergency');
                if (emergencyMeds.length > 0) {
                    yPosition = this.addMedicationSection(pdf, 'EMERGENCY MEDICATIONS', emergencyMeds, margin, yPosition, contentWidth, pageWidth);
                    yPosition += 8;
                }

                // Add common medications if available
                const commonMeds = medications.filter(med => med.categoryType === 'Common');
                if (commonMeds.length > 0) {
                    yPosition = this.addMedicationSection(pdf, 'ROUTINE MEDICATIONS', commonMeds, margin, yPosition, contentWidth, pageWidth);
                    yPosition += 8;
                }

                // Add footer with disclaimers
                this.addFooter(pdf, pageWidth, margin);

                resolve(pdf);
            } catch (error) {
                reject(error);
            }
        });
    }

    static addHeader(pdf, pageWidth, margin, yPosition) {
        // Main title background
        pdf.setFillColor(44, 62, 80);
        pdf.rect(0, 0, pageWidth, 25, 'F');
        
        // Main title
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PEDIATRIC DRUG CALCULATOR', pageWidth / 2, 12, { align: 'center' });
        
        // Subtitle
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255, 0.9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Emergency Medication Reference Guide', pageWidth / 2, 18, { align: 'center' });
        
        return 30;
    }

    static addPatientInfo(pdf, margin, yPosition, contentWidth, weight) {
        // Section header
        pdf.setFillColor(52, 152, 219);
        pdf.rect(margin, yPosition, contentWidth, 6, 'F');
        
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PATIENT INFORMATION', margin + 5, yPosition + 4.2);
        
        yPosition += 10;
        
        // Patient details in a clean layout
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        
        const ageEstimate = this.estimateAge(weight);
        
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

    static addSummarySection(pdf, margin, yPosition, contentWidth, totalMeds, emergencyCount, commonCount) {
        // Summary box with subtle background
        pdf.setFillColor(248, 249, 250);
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin, yPosition, contentWidth, 20, 'FD'); // Filled and drawn
        
        // Summary title
        pdf.setFontSize(9);
        pdf.setTextColor(52, 152, 219);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CALCULATION SUMMARY', margin + 5, yPosition + 6);
        
        // Summary content - organized in columns
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        
        const col1 = margin + 8;
        const col2 = margin + 65;
        const col3 = margin + 120;
        
        // First row
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total Medications:', col1, yPosition + 13);
        pdf.setFont('helvetica', 'normal');
        pdf.text(totalMeds.toString(), col1 + 28, yPosition + 13);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Emergency Drugs:', col2, yPosition + 13);
        pdf.setFont('helvetica', 'normal');
        pdf.text(emergencyCount.toString(), col2 + 25, yPosition + 13);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Routine Drugs:', col3, yPosition + 13);
        pdf.setFont('helvetica', 'normal');
        pdf.text(commonCount.toString(), col3 + 22, yPosition + 13);
        
        // Second row - clinical information
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        pdf.text('All doses calculated per standard pediatric guidelines', margin + 5, yPosition + 18);
        
        return yPosition + 25;
    }

    static addMedicationSection(pdf, sectionTitle, medications, margin, yPosition, contentWidth, pageWidth) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Check if we need a new page
        const estimatedHeight = medications.length * 4.5 + 15;
        if (yPosition + estimatedHeight > pageHeight - 25) {
            pdf.addPage();
            yPosition = margin;
        }
        
        // Section header
        const isEmergency = sectionTitle.includes('EMERGENCY');
        if (isEmergency) {
            pdf.setFillColor(231, 76, 60);
        } else {
            pdf.setFillColor(52, 152, 219);
        }
        pdf.rect(margin, yPosition, contentWidth, 5, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text(sectionTitle, margin + 5, yPosition + 3.5);
        
        yPosition += 8;
        
        // Table headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition, contentWidth, 4, 'F');
        
        pdf.setFontSize(7);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        
        const columns = [
            { name: 'MEDICATION', width: 65 },
            { name: 'VOLUME', width: 20 },
            { name: 'DOSE', width: 25 },
            { name: 'ROUTE', width: 18 },
            { name: 'CONCENTRATION', width: 32 }
        ];
        
        let xPos = margin + 2;
        columns.forEach(col => {
            pdf.text(col.name, xPos, yPosition + 2.8);
            xPos += col.width;
        });
        
        yPosition += 6;
        
        // Table rows
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        
        medications.forEach((med, index) => {
            // Check for page break
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = margin;
                
                // Re-add headers on new page
                pdf.setFillColor(240, 240, 240);
                pdf.rect(margin, yPosition, contentWidth, 4, 'F');
                
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'bold');
                
                let headerX = margin + 2;
                columns.forEach(col => {
                    pdf.text(col.name, headerX, yPosition + 2.8);
                    headerX += col.width;
                });
                
                yPosition += 6;
            }
            
            // Alternate row background for readability
            if (index % 2 === 0) {
                pdf.setFillColor(250, 250, 250);
                pdf.rect(margin, yPosition - 1, contentWidth, 4, 'F');
            }
            
            // Medication data
            xPos = margin + 2;
            
            // Medication name (truncated)
            let medName = med.name;
            if (medName.length > 35) {
                medName = medName.substring(0, 35) + '...';
            }
            pdf.text(medName, xPos, yPosition + 2.5);
            xPos += columns[0].width;
            
            // Volume (highlighted)
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(231, 76, 60);
            pdf.text(`${med.displayVolume} mL`, xPos, yPosition + 2.5);
            xPos += columns[1].width;
            
            // Total dose
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.text(med.totalDose, xPos, yPosition + 2.5);
            xPos += columns[2].width;
            
            // Route
            pdf.text(med.route, xPos, yPosition + 2.5);
            xPos += columns[3].width;
            
            // Concentration
            let concentration = med.concentration;
            if (concentration.length > 25) {
                concentration = concentration.substring(0, 25) + '...';
            }
            pdf.text(concentration, xPos, yPosition + 2.5);
            
            yPosition += 4.5;
        });
        
        return yPosition;
    }

    static addFooter(pdf, pageWidth, margin) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Footer separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
        
        // Disclaimer text
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'italic');
        
        const disclaimers = [
            'IMPORTANT: This document is for medical reference only. All calculations must be verified by qualified healthcare professionals.',
            'Dosages are based on standard pediatric guidelines and may require adjustment for individual patient conditions.',
            'Always follow hospital protocols, verify medication concentrations, and double-check calculations before administration.',
            'The prescribing practitioner is responsible for determining the appropriateness of any medication and dosage.'
        ];
        
        let yPos = pageHeight - 27;
        disclaimers.forEach(disclaimer => {
            const lines = pdf.splitTextToSize(disclaimer, pageWidth - (margin * 2));
            lines.forEach(line => {
                pdf.text(line, margin, yPos);
                yPos += 3;
            });
        });
        
        // Footer info
        pdf.setFontSize(6);
        pdf.setTextColor(150, 150, 150);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated by Pediatric Drug Calculator - Professional Medical Reference - ${new Date().getFullYear()}`, 
                pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    // Utility methods
    static estimateAge(weight) {
        if (weight < 3) return 'Newborn';
        if (weight < 6) return '1-3 months';
        if (weight < 8) return '3-6 months';
        if (weight < 10) return '6-9 months';
        if (weight < 12) return '9-12 months';
        if (weight < 14) return '1-2 years';
        if (weight < 16) return '2-3 years';
        if (weight < 20) return '4-5 years';
        if (weight < 25) return '6-8 years';
        if (weight < 35) return '9-11 years';
        if (weight < 45) return '12-14 years';
        return '15+ years';
    }

    static getTotalMedsCount(weight) {
        // Estimate based on weight categories
        if (weight < 10) return 18;
        if (weight < 20) return 22;
        if (weight < 30) return 25;
        return 28;
    }

    // Method to generate filename
    static generateFileName(weight) {
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 16);
        return `Pediatric_Drug_Calculations_${weight}kg_${timestamp}.pdf`;
    }

    // Method to save PDF
    static savePDF(pdf, weight) {
        const fileName = this.generateFileName(weight);
        pdf.save(fileName);
        return fileName;
    }

    // Method to get PDF as blob (for potential future features)
    static getPDFAsBlob(pdf) {
        return pdf.output('blob');
    }

    // Method to get PDF as data URL (for potential preview feature)
    static getPDFAsDataURL(pdf) {
        return pdf.output('datauristring');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFExporter;
}