const args = process.argv.slice(2);
if (args[0] === 'sn') {
  const fs = require('fs');
  const path = require('path');
  const xlsx = require('xlsx');
  const _ = require('lodash');
  const { obj2str } = require('obj2str')


  // 读取原始中文 JavaScript 文件
  let jsChineseOriginObject = require("../src/locale/langs/zh.js");



  // 指定要读取的 Excel 文件名
  const excelFileName = '翻译字典.xlsx';
  const filePath = path.join('./', excelFileName);

  // 读取 Excel 文件
  const workbook = xlsx.readFile(filePath);

  // 获取第一个工作表（假设只有一个工作表）
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 将工作表转换为 JSON 对象
  const excelData = xlsx.utils.sheet_to_json(worksheet);

  let jsEnghlishObject = {}
  let jsGermanObject = {}

     // 递归更新对象的函数
     function updateObjectEnglish(key, newValue, defaultValue, childrenKeys = []) {
      childrenKeys.push(key)
      let lookCase = _.get(jsChineseOriginObject, childrenKeys);
      let englishCase = _.get(jsEnghlishObject, childrenKeys)
      if (typeof lookCase === 'object') {
        _.set(jsEnghlishObject, childrenKeys, { ...englishCase })
        // 如果属性值是对象，则递归调用 updateObject
        for (const subKey in lookCase) {
          updateObjectEnglish(subKey, newValue, defaultValue, [...childrenKeys]);
        }
      } else {
        if (lookCase == newValue['中文']) {
          _.set(jsEnghlishObject, childrenKeys, newValue['英文'])
        } else {
          if (!englishCase) {
            _.set(jsEnghlishObject, childrenKeys, `${defaultValue}-${lookCase}`)
          }
        }
      }
    }



    // 递归更新对象的函数
    function updateObjectGerman(key, newValue, defaultValue, childrenKeys = []) {
      childrenKeys.push(key)
      let germanCase = _.get(jsGermanObject, childrenKeys)

      let lookCase = _.get(jsChineseOriginObject, childrenKeys);
      if (typeof lookCase === 'object') {
        _.set(jsGermanObject, childrenKeys, { ...germanCase })
        // 如果属性值是对象，则递归调用 updateObject
        for (const subKey in lookCase) {
          updateObjectEnglish(subKey, newValue, defaultValue, [...childrenKeys]);
        }
      } else {
        if (lookCase == newValue['中文']) {
          _.set(jsGermanObject, childrenKeys, newValue['德文'])
        } else {
          if (!germanCase) {
            _.set(jsGermanObject, childrenKeys, `${defaultValue}-${lookCase}`)
          }
        }
      }
    }




    // 遍历 Excel 数据
    for (const excelRow of excelData) {
      for (const jsChineseKey in jsChineseOriginObject) {
        updateObjectEnglish(jsChineseKey, excelRow, "English");
        updateObjectGerman(jsChineseKey, excelRow, "Deutsch");
      }
    }


  let usedDefaultValuesEnglish = [];
  let usedDefaultValuesGerman = [];

  // 处理完后判断使用了默认值的情况
  const hasUsedDefaultValues = (obj, defaultValueArray) => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'object') {
        hasUsedDefaultValues(value, defaultValueArray);
      } else if (typeof value === 'string' && (value.startsWith('English-') || value.startsWith('Deutsch-'))) {
        defaultValueArray.push(value);
      }
    }
  };

  // 判断使用了默认值的情况并推送到新数组中
  hasUsedDefaultValues(jsEnghlishObject, usedDefaultValuesEnglish);
  hasUsedDefaultValues(jsGermanObject, usedDefaultValuesGerman);

  const jsEnghlishObjectFix = `const lang = ${obj2str(jsEnghlishObject)};\n module.exports = lang;`;
  const jsGermanFObjectFix = `const lang = ${obj2str(jsGermanObject)};\n module.exports = lang;`

  fs.writeFileSync('../src/locale/langs/en.js', jsEnghlishObjectFix, 'utf-8');
  fs.writeFileSync('../src/locale/langs/de.js', jsGermanFObjectFix, 'utf-8');


  if (usedDefaultValuesEnglish.length) {
    console.log(usedDefaultValuesEnglish.length, "基于本地 zh-CN 文件, 英语在excel未找到的数量 (英语翻译)");
  } else {
    console.log("恭喜你! 英语文件 在excel中都找到了翻译, 任务完毕(英语翻译)");
  }


  if (usedDefaultValuesGerman.length) {
    console.log(usedDefaultValuesGerman.length, "基于本地  zh-CN 文件,德语在excel未找到的数量 (德语翻译)");
  } else {
    console.log("恭喜你! 德语文件 在excel中都找到了翻译, 任务完毕(德语)");
  }
} else {
  throw new Error('请使用npm方式调用---> npm run 文件名称');
}

