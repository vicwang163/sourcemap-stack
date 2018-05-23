var path = require('path')
/*
* 转换error stack为数组，用于分析sourcemap
*/
export function getStackByError (str) {
  let result = []
  // fix filepath带?的情况，例如http://static.daojia.com/assets/other/test/debug_page/bug.min.js?v=1:1:102这种情况
  str.replace(/https?:\/\/[\w\d:\/\.\-?=]+/g, function (value) {
    if (/^http/.test(value)) {
      result.push(value)
    }
  })
  result = result.map((item) => {
    let arr = path.basename(item).split(':')
    let column = arr.pop()
    let row = arr.pop()
    let filepath = path.dirname(item) + '/' + arr.join('')
     // fix filepath带?的情况，例如http://static.daojia.com/assets/other/test/debug_page/bug.min.js?v=1:1:102这种情况
    let qindex = filepath.indexOf('?');
    if (qindex > -1) {
      filepath = filepath.substring(0, qindex);
    }

    let html = !/\.js$/.test(filepath)
    return {filepath, row, column, html}
  })
  if (!result.length) {
    result = null
  }
  return result
}