import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import keywordService from '../services/keywordService';

// Simple debugging function
const debug = (message, data) => {
  console.log(`[CSV Parser] ${message}`, data);
};

// Function to normalize column names from different banks/credit cards
const normalizeColumnName = (header) => {
  if (!header) return '';
 
  const h = header.toLowerCase().trim();
 
  if (h.includes('date') || h.includes('time')) return 'date';
  if (h.includes('desc') || h.includes('narration') || h.includes('details') || h.includes('transaction')) return 'description';
  if (h.includes('debit') || h.includes('amount') || h.includes('withdraw') || h.includes('payment') || h.includes('cad')) return 'amount';
  if (h.includes('credit') || h.includes('deposit')) return 'credit';
  if (h.includes('balance')) return 'balance';
  if (h.includes('categ')) return 'category';
 
  return h;
};

// Parse and normalize CSV data into standard expense objects
const parseCSVData = (csvData) => {
  debug("Starting CSV parsing...", { dataLength: csvData.length });
 
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          debug("PapaParse completed", {
            rows: results.data.length,
            fields: results.meta.fields,
            errors: results.errors
          });
         
          if (!results.data || results.data.length === 0) {
            throw new Error('No data found in CSV file');
          }
         
          // Process headers to find key columns
          const headers = results.meta.fields;
          const normalizedHeaders = headers.map(h => normalizeColumnName(h));
         
          debug("Headers:", headers);
          debug("Normalized headers:", normalizedHeaders);
         
          // Find key columns
          const dateIndex = normalizedHeaders.indexOf('date');
          const descIndex = normalizedHeaders.indexOf('description');
          const amountIndex = normalizedHeaders.indexOf('amount');
          const creditIndex = normalizedHeaders.indexOf('credit');
          const debitIndex = normalizedHeaders.indexOf('debit');
         
          debug("Column indexes:", { dateIndex, descIndex, amountIndex, creditIndex, debitIndex });
         
          if (dateIndex === -1) {
            throw new Error('Could not find a date column in the CSV');
          }
         
          if (descIndex === -1) {
            throw new Error('Could not find a description column in the CSV');
          }
         
          if (amountIndex === -1 && (creditIndex === -1 || debitIndex === -1)) {
            throw new Error('Could not find amount, credit or debit columns in the CSV');
          }
         
          const dateField = headers[dateIndex];
          const descriptionField = headers[descIndex];
          const amountField = amountIndex !== -1 ? headers[amountIndex] : null;
          const creditField = creditIndex !== -1 ? headers[creditIndex] : null;
          const debitField = debitIndex !== -1 ? headers[debitIndex] : null;
         
          // Transform data into standard expense objects
          debug("Starting to transform data rows...");
          const expenses = [];
          const ignoredTransactions = [];
         
          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
           
            // Skip empty rows
            if (Object.keys(row).length === 0) continue;
           
            try {
              // Get description first to check if it should be ignored
              const description = row[descriptionField] ? row[descriptionField].trim() : "Unknown";
             
              // Check if this transaction should be ignored
              if (keywordService.shouldIgnoreTransaction(description)) {
                debug(`Ignoring transaction: "${description}"`);
                ignoredTransactions.push(row);
                continue;
              }
             
              // Handle amount
              let amount = 0;
             
              if (amountField) {
                // Parse amount from the amount field
                const rawAmount = row[amountField];
                if (rawAmount) {
                  // Remove any non-numeric chars except dots and minus signs
                  const cleanAmount = rawAmount.toString().replace(/[^\d.-]/g, '');
                  amount = parseFloat(cleanAmount) || 0;
                }
              } else {
                // Handle credit/debit fields
                const rawDebit = debitField ? row[debitField] : '0';
                const rawCredit = creditField ? row[creditField] : '0';
               
                // Process debit (make it negative)
                let debit = 0;
                if (rawDebit) {
                  const cleanDebit = rawDebit.toString().replace(/[^\d.-]/g, '');
                  debit = parseFloat(cleanDebit) || 0;
                  if (debit > 0) debit = -debit; // Ensure debits are negative
                }
               
                // Process credit
                let credit = 0;
                if (rawCredit) {
                  const cleanCredit = rawCredit.toString().replace(/[^\d.-]/g, '');
                  credit = parseFloat(cleanCredit) || 0;
                }
               
                amount = credit + debit; // Credit is positive, debit is negative
              }
             
              // Parse date
              let date = new Date();
              const rawDate = row[dateField];
             
              if (rawDate) {
                // Try standard date parsing first
                date = new Date(rawDate);
               
                // If that fails, try common formats
                if (isNaN(date.getTime())) {
                  // Try DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD
                  const dateParts = rawDate.split(/[-/\.]/);
                 
                  if (dateParts.length === 3) {
                    // If the first part has 4 digits, assume YYYY-MM-DD
                    if (dateParts[0].length === 4) {
                      date = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);
                    }
                    // Try DD/MM/YYYY
                    else {
                      date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                     
                      // If that fails, try MM/DD/YYYY
                      if (isNaN(date.getTime())) {
                        date = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
                      }
                    }
                  }
                }
              }
             
              // Get a valid date string or use today
              const formattedDate = !isNaN(date.getTime())
                ? date.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
             
              expenses.push({
                id: uuidv4(),
                date: formattedDate,
                description: description,
                amount: amount,
                category: null, // Will be set by categorizer later
                originalData: row
              });
            } catch (rowError) {
              debug(`Error processing row ${i}:`, rowError);
              // Continue with next row instead of failing the whole import
            }
          }
         
          debug("Successfully created expense objects:", expenses.length);
          debug("Ignored transactions:", ignoredTransactions.length);
         
          resolve({
            expenses,
            ignoredCount: ignoredTransactions.length
          });
        } catch (error) {
          debug("Error in parse completion handler:", error);
          reject(error);
        }
      },
      error: (error) => {
        debug("PapaParse error:", error);
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

export { parseCSVData };



