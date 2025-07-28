import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

export class FileProcessor {
  // Convert CSV to Excel
  static csvToExcel(csvFile) {
    return new Promise((resolve, reject) => {
      Papa.parse(csvFile, {
        complete: (results) => {
          try {
            const ws = XLSX.utils.aoa_to_sheet(results.data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            
            // Generate Excel file
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            resolve({
              blob,
              filename: csvFile.name.replace('.csv', '.xlsx'),
              type: 'Excel'
            });
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  // Convert Excel to CSV
  static excelToCsv(excelFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const csvData = XLSX.utils.sheet_to_csv(worksheet);
          
          const blob = new Blob([csvData], { type: 'text/csv' });
          resolve({
            blob,
            filename: excelFile.name.replace(/\.(xlsx|xls)$/, '.csv'),
            type: 'CSV'
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(excelFile);
    });
  }

  // Convert Excel/CSV to JSON
  static toJson(file) {
    return new Promise((resolve, reject) => {
      if (file.name.toLowerCase().endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const jsonData = JSON.stringify(results.data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            resolve({
              blob,
              filename: file.name.replace('.csv', '.json'),
              type: 'JSON'
            });
          },
          error: reject
        });
      } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            resolve({
              blob,
              filename: file.name.replace(/\.(xlsx|xls)$/, '.json'),
              type: 'JSON'
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  }

  // Download processed file
  static downloadFile(result) {
    saveAs(result.blob, result.filename);
  }

  // Get supported conversions for a file
  static getSupportedConversions(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    
    const conversions = {
      'csv': ['Excel (.xlsx)', 'JSON (.json)'],
      'xlsx': ['CSV (.csv)', 'JSON (.json)'],
      'xls': ['CSV (.csv)', 'JSON (.json)'],
      'pdf': ['Text (.txt)'], // Would need Netlify Function
      'txt': ['PDF (.pdf)'], // Would need Netlify Function
      'docx': ['PDF (.pdf)', 'Text (.txt)'] // Would need Netlify Function
    };

    return conversions[ext] || [];
  }
}

// AI Analysis Service (calls Netlify Function)
export class AIAnalysisService {
  static async analyzeDocument(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Call Netlify Function for AI analysis
      const response = await fetch('/.netlify/functions/analyze-document', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      return await response.json();
    } catch (error) {
      // Fallback mock analysis for demo
      return this.getMockAnalysis(file);
    }
  }

  // Mock analysis for demo purposes
  static getMockAnalysis(file) {
    return {
      summary: "Financial Document Analysis Complete",
      insights: [
        {
          category: "Expense Categories",
          items: [
            "Office Supplies: $2,450 (15%)",
            "Travel & Transportation: $3,200 (20%)",
            "Marketing & Advertising: $1,800 (11%)",
            "Software & Subscriptions: $950 (6%)",
            "Utilities: $1,200 (7%)"
          ]
        },
        {
          category: "Trends Analysis",
          items: [
            "Monthly spending increased 12% over last quarter",
            "Travel expenses peaked in March (+45%)",
            "Software costs remained consistent",
            "Office supplies showed seasonal variation"
          ]
        },
        {
          category: "Key Insights",
          items: [
            "Total analyzed transactions: 247",
            "Average transaction value: $156",
            "Largest expense category: Travel (20%)",
            "Potential savings identified: $890/month"
          ]
        },
        {
          category: "Recommendations",
          items: [
            "Consider negotiating better rates for travel bookings",
            "Review recurring software subscriptions for optimization",
            "Implement expense approval workflow for amounts over $500",
            "Track seasonal patterns for better budget planning"
          ]
        }
      ],
      fileInfo: {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type || 'Unknown',
        processedAt: new Date().toLocaleString()
      }
    };
  }
}