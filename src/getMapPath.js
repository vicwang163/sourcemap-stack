var path = require('path')
var url = require('url')

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
    // 精简逻辑
    let basename = path.basename(stack.filepath,'.js');
    let dirname = path.dirname(stack.filepath);
    // var arr = basename.split('.');
    // if (arr.length === 2) {
    //   mapName = mapName.replace(/\[name\]/g, arr[0]);
    // } else if (arr.length === 3) {
    //   mapName = mapName.replace(/\[name\]/g, arr[0]);
    //   mapName = mapName.replace(/\[hash\]/g, arr[1]);
    // }
    mapName = mapName.replace(/\[name\]/g, basename);

    if (params.mapUrl) {
      let urlObj = url.parse(dirname)
      dirname = params.mapUrl + urlObj.pathname
      dirname = dirname.replace(/\/$/, '')
    }
    stack.mapUrl = dirname + '/' + mapName
  }
}