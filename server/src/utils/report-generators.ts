import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { Readable } from 'stream';

/**
 * Generate PDF report from data
 * @param data Report data
 * @param title Report title
 * @returns Promise<Buffer> containing PDF data
 */
export const generatePDF = (data: any, title: string): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      // Collect PDF data chunks
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Add title
      doc.fontSize(25).text(title, { align: 'center' });
      doc.moveDown();

      // Add generation date
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'center',
      });
      doc.moveDown(2);

      // Add summary section if available
      if (data.summary) {
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown();

        Object.entries(data.summary).forEach(([key, value]) => {
          // Skip nested objects in summary for simplicity
          if (typeof value !== 'object') {
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());

            let formattedValue = value;
            // Format currency values
            if (
              key.toLowerCase().includes('price') ||
              key.toLowerCase().includes('value') ||
              key.toLowerCase().includes('total') ||
              key.toLowerCase().includes('revenue') ||
              key.toLowerCase().includes('profit')
            ) {
              formattedValue = `₦${Number(value).toLocaleString()}`;
            }
            // Format percentage values
            else if (
              key.toLowerCase().includes('rate') ||
              key.toLowerCase().includes('percentage') ||
              key.toLowerCase().includes('margin')
            ) {
              formattedValue = `${Number(value).toFixed(2)}%`;
            }

            doc.fontSize(12).text(`${formattedKey}: ${formattedValue}`);
          }
        });

        doc.moveDown(2);
      }

      // Add other sections based on data structure
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'summary' && Array.isArray(value) && value.length > 0) {
          const sectionTitle = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());

          doc.fontSize(16).text(sectionTitle, { underline: true });
          doc.moveDown();

          // For arrays, create a simple table
          if (value.length <= 10) {
            // Limit to 10 items for readability
            value.forEach((item, index) => {
              const itemText = Object.entries(item)
                .map(([itemKey, itemValue]) => {
                  const formattedKey = itemKey
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());

                  let formattedValue = itemValue;
                  // Format currency values
                  if (
                    itemKey.toLowerCase().includes('price') ||
                    itemKey.toLowerCase().includes('value') ||
                    itemKey.toLowerCase().includes('total') ||
                    itemKey.toLowerCase().includes('sales') ||
                    itemKey.toLowerCase().includes('revenue') ||
                    itemKey.toLowerCase().includes('profit')
                  ) {
                    formattedValue = `₦${Number(itemValue).toLocaleString()}`;
                  }

                  return `${formattedKey}: ${formattedValue}`;
                })
                .join(', ');

              doc.fontSize(10).text(`${index + 1}. ${itemText}`);
              doc.moveDown(0.5);
            });
          } else {
            doc
              .fontSize(10)
              .text(
                `[${value.length} items - too many to display in PDF format]`
              );
          }

          doc.moveDown(2);
        }
      });

      // Add footer
      doc
        .fontSize(10)
        .text('PharmaSync Report - Confidential', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Excel report from data
 * @param data Report data
 * @param sheetName Sheet name
 * @returns Buffer containing Excel data
 */
export const generateExcel = async (
  data: any,
  sheetName: string
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Add title
  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = sheetName;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Add generation date
  sheet.mergeCells('A2:E2');
  const dateCell = sheet.getCell('A2');
  dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
  dateCell.font = { size: 10, italic: true };
  dateCell.alignment = { horizontal: 'center' };

  let rowIndex = 4;

  // Add summary section if available
  if (data.summary) {
    sheet.getCell(`A${rowIndex}`).value = 'Summary';
    sheet.getCell(`A${rowIndex}`).font = { size: 14, bold: true };
    rowIndex += 1;

    Object.entries(data.summary).forEach(([key, value]) => {
      // Skip nested objects in summary for simplicity
      if (typeof value !== 'object') {
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());

        sheet.getCell(`A${rowIndex}`).value = formattedKey;
        // Convert value to a valid Excel cell value type
        const cellValue =
          typeof value === 'number'
            ? value
            : typeof value === 'boolean'
            ? value
            : typeof value === 'string'
            ? value
            : String(value);
        sheet.getCell(`B${rowIndex}`).value = cellValue;
        rowIndex += 1;
      }
    });

    rowIndex += 1;
  }

  // Add other sections based on data structure
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'summary' && Array.isArray(value) && value.length > 0) {
      const sectionTitle = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      sheet.getCell(`A${rowIndex}`).value = sectionTitle;
      sheet.getCell(`A${rowIndex}`).font = { size: 14, bold: true };
      rowIndex += 1;

      // For arrays, create a table
      if (value.length > 0) {
        // Add headers
        const headers = Object.keys(value[0]);
        headers.forEach((header, colIndex) => {
          const formattedHeader = header
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());

          const cell = sheet.getCell(rowIndex, colIndex + 1);
          cell.value = formattedHeader;
          cell.font = { bold: true };
        });

        rowIndex += 1;

        // Add data rows
        value.forEach((item) => {
          headers.forEach((header, colIndex) => {
            const itemValue = item[header];
            // Convert to a valid Excel cell value type
            const cellValue =
              typeof itemValue === 'number'
                ? itemValue
                : typeof itemValue === 'boolean'
                ? itemValue
                : typeof itemValue === 'string'
                ? itemValue
                : itemValue === null || itemValue === undefined
                ? ''
                : String(itemValue);
            sheet.getCell(rowIndex, colIndex + 1).value = cellValue;
          });
          rowIndex += 1;
        });

        rowIndex += 1;
      }
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
};

/**
 * Generate CSV report from data
 * @param data Report data
 * @returns Buffer containing CSV data
 */
export const generateCSV = (data: any): Buffer => {
  try {
    let csvData = '';

    // Add metadata
    csvData += `# Report generated on: ${new Date().toLocaleString()}\n\n`;

    // Process each section
    Object.entries(data).forEach(([key, value]) => {
      const sectionTitle = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      csvData += `# ${sectionTitle}\n`;

      if (
        key === 'summary' &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Handle summary object
        const summaryObj = value as Record<string, any>;
        Object.entries(summaryObj).forEach(([summaryKey, summaryValue]) => {
          if (typeof summaryValue !== 'object') {
            const formattedKey = summaryKey
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());

            csvData += `${formattedKey},${summaryValue}\n`;
          }
        });
      } else if (Array.isArray(value) && value.length > 0) {
        // Handle arrays using json2csv
        try {
          const parser = new Parser({ fields: Object.keys(value[0]) });
          const csv = parser.parse(value);
          csvData += csv + '\n\n';
        } catch (err) {
          csvData += `Error parsing ${key} data\n\n`;
        }
      }

      csvData += '\n';
    });

    return Buffer.from(csvData);
  } catch (error) {
    console.error('Error generating CSV:', error);
    return Buffer.from('Error generating CSV report');
  }
};
