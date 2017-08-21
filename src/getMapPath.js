var path = require('path')

/*
* 根据map参数添加相应的map url
* @param {Array} stacks: 调用堆栈地址
* @param {Object} params: map参数配置
*/

export function getMapPath (stacks, params) {
  for (let i = 0; i < stacks.length; i++) {
    let stack = stacks[i]
    if (stack.html){
      continue
    }
    let mapName = params.mapName
    let basename = path.basename(stack.filepath)
    let dirname = path.dirname(stack.filepath)
    let arr = basename.split('.')
    if (arr.length === 2) {
      mapName = mapName.replace(/\[name\]/g, arr[0])
    } else if (arr.length === 3) {
      mapName = mapName.replace(/\[name\]/g, arr[0])
      mapName = mapName.replace(/\[hash\]/g, arr[1])
    }
    if (params.mapUrl) {
      stack.mapUrl = params.mapUrl + '/' + mapName
    } else {
      stack.mapUrl = dirname + '/' + mapName
    }
  }
}