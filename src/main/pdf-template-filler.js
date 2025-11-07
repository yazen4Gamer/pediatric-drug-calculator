const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function fillTemplate(data) {
  const isDev = process.env.NODE_ENV === 'development' || !process.resourcesPath.includes('app.asar');
  const templatePath = isDev
    ? path.join(__dirname, '..', '..', 'assets', 'DrugTemplate3.pdf')
    : path.join(process.resourcesPath, 'assets', 'DrugTemplate3.pdf');

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Fill all keys in payload automatically
  for (const [key, value] of Object.entries(data)) {
    try {
      const field = form.getTextField(key);
      if (field) {
        field.setText(value.toString());
      } else {
        console.warn(`⚠️ Field "${key}" not found in template.`);
      }
    } catch (err) {
      console.error(`Error filling field ${key}:`, err);
    }
  }

  form.flatten();

  const desktop = process.env.USERPROFILE || process.env.HOME || process.cwd();
  const outputPath = path.join(desktop, 'Desktop', `DrugDoses_${Date.now()}.pdf`);
  fs.writeFileSync(outputPath, await pdfDoc.save());

  return outputPath;
}

module.exports = { fillTemplate };
