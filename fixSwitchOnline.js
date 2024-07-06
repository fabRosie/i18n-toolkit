


(async () => {
  const args = process.argv.slice(2);
  if (args[0] === 'sn') {
    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');
    const xlsx = require('xlsx');
    const _ = require('lodash');
    // 读取原始中文 JavaScript 文件
    let jsChineseOriginObject = require("../src/locale/langs/zh.js");
    const { obj2str } = require('obj2str') // 对象转字符串工具

    //自建应用获取 tenant_access_token
    const AppID = "cli_a603bd0811ba500c"
    const AppSecret = "QOn8EiU6r9L3b5RguCsXsy8Y1aLLrype"
    const TableToken = "FabNs5fIHhzvDAtqzEfcWqiXn2f"

    let UserToken = ""
    let TenantToken = ""

    let SheetInfo = {}
    let DataList = []

    // 请求TenantToken
    const authInfo = await axios({
      method: 'POST',
      url: `https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal`,
      data: {
        app_id: AppID,
        app_secret: AppSecret
      },
      headers: {
        'Content-Type': `application/json; charset=utf-8`
      }
    })

    TenantToken = authInfo.data.tenant_access_token

    // 根据工作表 ID 查询工作表属性信息，包括工作表的标题、索引位置、是否被隐藏等
    const tableInfo = await axios({
      method: 'GET',
      url: `https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${TableToken}/sheets/query`,
      headers: {
        'Authorization': `Bearer ${TenantToken}`
      }
    })

    SheetInfo = tableInfo.data.data.sheets[0]

    const tableData = await axios({
      method: 'GET',
      url: `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${TableToken}/values/${SheetInfo.sheet_id}!A2:C${SheetInfo.grid_properties.row_count}`,
      headers: {
        'Authorization': `Bearer ${TenantToken}`
      }
    })





    DataList = tableData.data.data.valueRange.values

    let excelData = DataList.map(item => {
      return {
        '中文': item[0],
        '英文': item[1],
        '德文': item[2]
      };
    });


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
          updateObjectGerman(subKey, newValue, defaultValue, [...childrenKeys]);
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
})()


