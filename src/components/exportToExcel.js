import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an Excel file.
 * @param {Array<Object>} data The data to export.
 * @param {string} fileName The desired name of the file (without extension).
 * @param {string} sheetName The name of the sheet inside the Excel file.
 */
export const exportToExcel = (data, fileName, sheetName = 'البيانات') => {

    if (!data || data.length === 0) {
        alert("لا توجد بيانات لتصديرها.");
        return;
    }

    // 1. Create a new workbook
    const wb = XLSX.utils.book_new();

    // 2. Convert the array of objects to a worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // 3. Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 4. Generate the Excel file and trigger a download
    XLSX.writeFile(wb, `${fileName}.xlsx`);

};