(() => {
  const axios = require("axios");
  const fs = require("fs");
  const path = require("path");
  const xlsx = require("xlsx");
  const _ = require("lodash");
  // 读取原始中文 JavaScript 文件
  let jsChineseOriginObject = require("./en.js");

  function getAllValues(obj) {
    let values = [];

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          values = values.concat(getAllValues(obj[key]));
        } else {
          values.push(obj[key]);
        }
      }
    }

    return values;
  }

  const valueArray = getAllValues(jsChineseOriginObject);

  function writeEnglishTxtFile(valueArr) {
    // 定义文件路径和名称
    const filePath = "output.txt";

    fs.writeFile(filePath, valueArr.join("\n"), (err) => {
      if (err) {
        // 处理写入错误
        console.error("写入文件时发生错误:", err);
      } else {
        // 成功写入文件
        console.log("文件已成功写入:", filePath);
      }
    });
  }

  writeEnglishTxtFile(valueArray);
})();
