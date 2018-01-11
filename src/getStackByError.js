var path = require('path')
/*
* 转换error stack为数组，用于分析sourcemap
*/
export function getStackByError (str) {
  let result = []
  str.replace(/https?:\/\/[\w\d:\/\.\-]+/g, function (value) {
    if (/^http/.test(value)) {
      result.push(value)
    }
  })
  result = result.map((item) => {
    let arr = path.basename(item).split(':')
    let column = arr.pop()
    let row = arr.pop()
    let filepath = path.dirname(item) + '/' + arr.join('')
    let html = !/\.js$/.test(filepath)
    return {filepath, row, column, html}
  })
  if (!result.length) {
    result = null
  }
  return result
}