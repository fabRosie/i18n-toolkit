const args = process.argv.slice(2);
if (args[0] === 'sn') {
  const fs = require('fs');
  const path = require('path');
  const xlsx = require('xlsx');
  let jsChineseOriginObject = require("../src/locale/langs/zh.js");

  // 指定要读取的 Excel 文件名
  const excelFileName = '翻译字典.xlsx';
  const filePath = path.join('./', excelFileName);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  let noFindList = [];

  function compareValues(obj, path = '') {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof obj[key] === 'object') {
        // 递归比较对象的值
        compareValues(obj[key], currentPath);
      } else if (obj[key] && !excelData.some(row => row["中文"] === obj[key])) {
        // 如果当前值在目标数组中找不到匹配 && 也不是默认的 ctx__(x)  中文值

        if (obj[key].indexOf('ctx') == -1) {
          console.log(obj[key]);

        }
      }
    }
  }

  // 调用 compareValues 函数
  compareValues(jsChineseOriginObject);


} else {
  throw new Error('请使用npm方式调用---> npm run 文件名称');
}

