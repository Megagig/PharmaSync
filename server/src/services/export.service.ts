import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import { IReportData, ReportFormat } from '../interfaces/report.interface';
import config from '../config';
import { sendEmail } from './email.service';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Generate a unique filename for a report
 * @param reportTitle Report title
 * @param format File format
 * @returns Unique filename
 */
const generateFilename = (reportTitle: string, format: string): string => {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const sanitizedTitle = reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${sanitizedTitle}_${timestamp}.${format.toLowerCase()}`;
};

/**
 * Export report data to PDF
 * @param reportData Report data
 * @returns Path to the generated file
 */
export const exportToPdf = async (reportData: IReportData): Promise<string> => {
  const filename = generateFilename(reportData.title, 'pdf');
  const filePath = path.join(uploadDir, filename);
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Title
      doc.fontSize(20).text(reportData.title, { align: 'center' });
      doc.moveDown();
      
      // Report metadata
      doc.fontSize(12).text(`Generated: ${format(reportData.generatedAt, 'PPpp')}`);
      if (reportData.startDate && reportData.endDate) {
        doc.text(`Period: ${format(reportData.startDate, 'PP')} to ${format(reportData.endDate, 'PP')}`);
      }
      doc.moveDown();
      
      // Summary section
      if (reportData.summary) {
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown(0.5);
        
        Object.entries(reportData.summary).forEach(([key, value]) => {
          doc.fontSize(12).text(`${key}: ${typeof value === 'number' ? value.toLocaleString() : value}`);
        });
        
        doc.moveDown();
      }
      
      // Data tables
      if (Array.isArray(reportData.data)) {
        doc.fontSize(16).text('Data', { underline: true });
        doc.moveDown(0.5);
        
        // Determine columns from first data item
        if (reportData.data.length > 0) {
          const columns = Object.keys(reportData.data[0]);
          
          // Create table header
          const tableTop = doc.y;
          const tableLeft = 50;
          const colWidth = (doc.page.width - 100) / columns.length;
          
          // Draw header
          doc.fontSize(10).font('Helvetica-Bold');
          columns.forEach((col, i) => {
            doc.text(col, tableLeft + i * colWidth, tableTop, { width: colWidth, align: 'left' });
          });
          
          // Draw rows
          doc.font('Helvetica');
          let rowTop = tableTop + 20;
          
          reportData.data.slice(0, 20).forEach((row) => {
            // Check if we need a new page
            if (rowTop > doc.page.height - 100) {
              doc.addPage();
              rowTop = 50;
            }
            
            columns.forEach((col, i) => {
              const value = row[col];
              doc.text(
                typeof value === 'number' ? value.toLocaleString() : String(value || ''),
                tableLeft + i * colWidth,
                rowTop,
                { width: colWidth, align: 'left' }
              );
            });
            
            rowTop += 20;
          });
          
          if (reportData.data.length > 20) {
            doc.moveDown();
            doc.text(`... and ${reportData.data.length - 20} more rows`);
          }
        }
      }
      
      // Charts section
      if (reportData.charts && reportData.charts.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Charts', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(12).text('Charts are available in the web interface.');
        doc.moveDown();
      }
      
      // Finalize the PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export report data to CSV
 * @param reportData Report data
 * @returns Path to the generated file
 */
export const exportToCsv = async (reportData: IReportData): Promise<string> => {
  const filename = generateFilename(reportData.title, 'csv');
  const filePath = path.join(uploadDir, filename);
  
  try {
    if (Array.isArray(reportData.data) && reportData.data.length > 0) {
      const parser = new Parser();
      const csv = parser.parse(reportData.data);
      
      fs.writeFileSync(filePath, csv);
      return filePath;
    } else {
      // Create a simple CSV with summary data if no detailed data
      let csv = `"${reportData.title}"\n`;
      csv += `"Generated","${format(reportData.generatedAt, 'PPpp')}"\n`;
      
      if (reportData.startDate && reportData.endDate) {
        csv += `"Period","${format(reportData.startDate, 'PP')} to ${format(reportData.endDate, 'PP')}"\n`;
      }
      
      csv += '\n"Summary"\n';
      
      if (reportData.summary) {
        Object.entries(reportData.summary).forEach(([key, value]) => {
          csv += `"${key}","${value}"\n`;
        });
      }
      
      fs.writeFileSync(filePath, csv);
      return filePath;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Export report data to Excel
 * @param reportData Report data
 * @returns Path to the generated file
 */
export const exportToExcel = async (reportData: IReportData): Promise<string> => {
  const filename = generateFilename(reportData.title, 'xlsx');
  const filePath = path.join(uploadDir, filename);
  
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PharmaSync';
    workbook.created = new Date();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Title and metadata
    summarySheet.addRow([reportData.title]);
    summarySheet.getRow(1).font = { bold: true, size: 16 };
    summarySheet.addRow([]);
    
    summarySheet.addRow(['Generated', format(reportData.generatedAt, 'PPpp')]);
    if (reportData.startDate && reportData.endDate) {
      summarySheet.addRow(['Period', `${format(reportData.startDate, 'PP')} to ${format(reportData.endDate, 'PP')}`]);
    }
    summarySheet.addRow([]);
    
    // Summary data
    summarySheet.addRow(['Summary']);
    summarySheet.getRow(6).font = { bold: true };
    
    let rowIndex = 7;
    if (reportData.summary) {
      Object.entries(reportData.summary).forEach(([key, value]) => {
        summarySheet.addRow([key, value]);
        rowIndex++;
      });
    }
    
    // Data sheet
    if (Array.isArray(reportData.data) && reportData.data.length > 0) {
      const dataSheet = workbook.addWorksheet('Data');
      
      // Add headers
      const headers = Object.keys(reportData.data[0]);
      dataSheet.addRow(headers);
      dataSheet.getRow(1).font = { bold: true };
      
      // Add data rows
      reportData.data.forEach((row) => {
        dataSheet.addRow(Object.values(row));
      });
      
      // Auto-fit columns
      dataSheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });
    }
    
    // Save workbook
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    throw error;
  }
};

/**
 * Export report data to JSON
 * @param reportData Report data
 * @returns Path to the generated file
 */
export const exportToJson = async (reportData: IReportData): Promise<string> => {
  const filename = generateFilename(reportData.title, 'json');
  const filePath = path.join(uploadDir, filename);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
    return filePath;
  } catch (error) {
    throw error;
  }
};

/**
 * Export report data to the specified format
 * @param reportData Report data
 * @param format Export format
 * @returns Path to the generated file
 */
export const exportReport = async (reportData: IReportData, format: ReportFormat): Promise<string> => {
  switch (format) {
    case ReportFormat.PDF:
      return exportToPdf(reportData);
    case ReportFormat.CSV:
      return exportToCsv(reportData);
    case ReportFormat.EXCEL:
      return exportToExcel(reportData);
    case ReportFormat.JSON:
      return exportToJson(reportData);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Email a report to recipients
 * @param reportPath Path to the report file
 * @param reportTitle Report title
 * @param format Report format
 * @param recipients Email recipients
 * @returns Success status
 */
export const emailReport = async (
  reportPath: string,
  reportTitle: string,
  format: ReportFormat,
  recipients: string[]
): Promise<boolean> => {
  try {
    const fileContent = fs.readFileSync(reportPath);
    const fileName = path.basename(reportPath);
    
    const result = await sendEmail({
      to: recipients,
      subject: `${reportTitle} - PharmaSync Report`,
      text: `Please find attached the ${reportTitle} report.`,
      html: `
        <p>Hello,</p>
        <p>Please find attached the <strong>${reportTitle}</strong> report.</p>
        <p>This report was automatically generated by PharmaSync.</p>
        <p>Thank you,<br>PharmaSync Team</p>
      `,
      attachments: [
        {
          filename: fileName,
          content: fileContent,
          contentType: format === ReportFormat.PDF ? 'application/pdf' :
                      format === ReportFormat.CSV ? 'text/csv' :
                      format === ReportFormat.EXCEL ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                      'application/json',
        },
      ],
    });
    
    return result;
  } catch (error) {
    console.error('Error emailing report:', error);
    return false;
  }
};
