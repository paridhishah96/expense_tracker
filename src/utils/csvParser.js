import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";

// Function to normalize column names from different banks/credit cards
const normalizeColumnName = (header) => {
  header = header.toLowerCase().trim();

  if (header.includes("date") || header.includes("time")) return "date";
  if (
    header.includes("desc") ||
    header.includes("narration") ||
    header.includes("details") ||
    header.includes("transaction")
  )
    return "description";
  if (
    header.includes("debit") ||
    header.includes("amount") ||
    header.includes("withdraw") ||
    header.includes("payment")
  )
    return "amount";
  if (header.includes("credit") || header.includes("deposit")) return "credit";
  if (header.includes("balance")) return "balance";
  if (header.includes("categ")) return "category";

  return header; // return the original if no match
};

// Detect the CSV format based on headers
const detectFormat = (headers) => {
  const normalizedHeaders = headers.map((h) => normalizeColumnName(h));

  // Try to find date, description and amount columns
  const hasDate = normalizedHeaders.includes("date");
  const hasDesc = normalizedHeaders.includes("description");
  const hasAmount = normalizedHeaders.includes("amount");
  const hasDebit = normalizedHeaders.includes("debit");
  const hasCredit = normalizedHeaders.includes("credit");

  if (!hasDate) {
    throw new Error("No date column found in CSV");
  }

  if (!hasDesc) {
    throw new Error("No description column found in CSV");
  }

  if (!hasAmount && !(hasDebit || hasCredit)) {
    throw new Error("No amount/debit/credit column found in CSV");
  }

  return {
    dateField: headers[normalizedHeaders.indexOf("date")],
    descriptionField: headers[normalizedHeaders.indexOf("description")],
    amountField: hasAmount
      ? headers[normalizedHeaders.indexOf("amount")]
      : null,
    debitField: hasDebit ? headers[normalizedHeaders.indexOf("debit")] : null,
    creditField: hasCredit
      ? headers[normalizedHeaders.indexOf("credit")]
      : null,
    categoryField: normalizedHeaders.includes("category")
      ? headers[normalizedHeaders.indexOf("category")]
      : null,
  };
};

// Parse and normalize CSV data into standard expense objects
const parseCSVData = (csvData) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            throw new Error("No data found in CSV file");
          }

          // Get the format based on the headers
          const format = detectFormat(results.meta.fields);

          // Transform data into standard expense objects
          const expenses = results.data.map((row) => {
            let amount = 0;

            // Handle different amount formats
            if (format.amountField) {
              // Some banks use negative for expenses, positive for income
              amount =
                parseFloat(row[format.amountField].replace(/[^\d.-]/g, "")) ||
                0;
            } else {
              // Some banks use separate debit/credit columns
              const debit = format.debitField
                ? parseFloat(row[format.debitField].replace(/[^\d.-]/g, "")) ||
                  0
                : 0;
              const credit = format.creditField
                ? parseFloat(row[format.creditField].replace(/[^\d.-]/g, "")) ||
                  0
                : 0;

              // Make debits negative, credits positive
              amount = credit - debit;
            }

            // Parse date
            let date = new Date(row[format.dateField]);
            if (isNaN(date.getTime())) {
              // Try different date formats
              const dateParts = row[format.dateField].split(/[-/\.]/);
              if (dateParts.length === 3) {
                // Try DD/MM/YYYY or MM/DD/YYYY
                date = new Date(
                  `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
                );
                if (isNaN(date.getTime())) {
                  date = new Date(
                    `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`
                  );
                }
              }
            }

            // Format date as ISO string
            const formattedDate = !isNaN(date.getTime())
              ? date.toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0];

            return {
              id: uuidv4(),
              date: formattedDate,
              description: row[format.descriptionField].trim(),
              amount: amount,
              category: format.categoryField ? row[format.categoryField] : null,
              originalData: row, // Keep the original data for reference
            };
          });

          resolve(expenses);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

// Make sure to properly export the function
export default { parseCSVData };
