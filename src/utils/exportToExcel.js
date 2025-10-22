import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
    if (!data || data.length === 0) {
        alert("لا توجد بيانات لتصديرها.");
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${fileName}_${date}.xlsx`);
};
