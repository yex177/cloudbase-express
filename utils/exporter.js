const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// 导出Excel
const exportToExcel = async (data, filename, columns) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('数据');

  // 设置列
  worksheet.columns = columns;

  // 添加数据
  data.forEach(item => {
    worksheet.addRow(item);
  });

  // 生成文件路径
  const outputPath = path.join(__dirname, '../uploads', `${filename}.xlsx`);

  // 写入文件
  await workbook.xlsx.writeFile(outputPath);

  return outputPath;
};

// 导出PDF
const exportToPDF = async (data, filename, columns) => {
  const doc = new PDFDocument();
  const outputPath = path.join(__dirname, '../uploads', `${filename}.pdf`);
  const writeStream = fs.createWriteStream(outputPath);

  doc.pipe(writeStream);

  // 标题
  doc.fontSize(16).text(filename, { align: 'center' });
  doc.moveDown();

  // 表格
  const tableTop = 100;
  const rowHeight = 25;
  const colWidth = 150;

  // 列标题
  columns.forEach((column, index) => {
    doc.fontSize(12).text(column.header, 50 + index * colWidth, tableTop);
  });

  // 数据行
  data.forEach((item, rowIndex) => {
    const y = tableTop + (rowIndex + 1) * rowHeight;
    columns.forEach((column, colIndex) => {
      doc.fontSize(10).text(item[column.key] || '', 50 + colIndex * colWidth, y);
    });
  });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
};

module.exports = {
  exportToExcel,
  exportToPDF
};