


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


    const AppID = "cli_a603bd0811ba500c"
    const AppSecret = "QOn8EiU6r9L3b5RguCsXsy8Y1aLLrype"
    const TableToken = "FabNs5fIHhzvDAtqzEfcWqiXn2f"

    let UserToken = ""
    let TenantToken = ""

    let SheetInfo = {}
    let DataList = []


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
})()


