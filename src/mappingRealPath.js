var http = require('http');
var https = require('https');
var url = require('url')
var vlq = require('vlq')
var Encrypter = require('encrypter')
/*
* 根据error堆栈关系，mapping 真实堆栈关系
* @param {Array} stacks
*/
export async function getRealStack (stacks, params) {
  let result = []
  let setmap = Object.create(null)
  let encrypter = null
  if (params.mapEncrypt.trim()) {
    encrypter = new Encrypter(params.mapEncrypt.trim())
  }
  // 获取文件内容
  for (let i = 0; i < stacks.length; i++) {
    let stack = stacks[i]
    if (stack.html) {
      stack['content'] = await getContent(stack.filepath)
      result.push(stack)
      continue
    }
    let content = setmap[stack.mapUrl]
    if (!content) {
      // read content
      content = await getContent(stack.mapUrl)
      // 如果map内容为空，我们则读取filepath
      if (!content) {
        content = await getContent(stack.filepath)
        // 如果原有js文件存在，则直接
        if (content) {
          result.push({
            filepath: stack.filepath,
            content,
            row: stack.row,
            column: stack.column
          })
          continue
        } else {
          // 如果还是为空，则抛错
          return {
            message: `${stack.mapUrl} or ${stack.filepath} is invalid`
          }
        }
      }
      // decrypt content
      if (encrypter) {
        let rt = null;
        try {
          rt = encrypter.decrypt(content)
          content = rt
        } catch (e) {}
      }
      content = JSON.parse(content)
      content = mappingSingleFile(content)
      setmap[stack.mapUrl] = content
    }
    // 查找堆栈
    let mapResult = mapErrorPosition(content, stack.row, stack.column)
    if (mapResult) {
      mapResult['filepath'] = content['sources'][mapResult.sourceIndex]
      mapResult['content'] = content['sourcesContent'][mapResult.sourceIndex]
      result.push(mapResult)
    } else {
      result.push(stack)
    }
  }
  return result
}

/*
* 查找堆栈位置
* @param {Object} content：位置信息
* @param {Number} row
* @param {Number} column
*/
function mapErrorPosition (content, row, column) {
  let mapResult = content[row] && content[row][column] || null
  if (!mapResult) {
    let columns = content[row]
    if (!columns) {
      return null
    }
    column = parseInt(column)
    // 进行修正
    for (let i = 1; i < 10; i++) {
      if (columns[column - i]) {
        column = column - i
        break
      } else if (columns[column + i]) {
        column = column + i
        break
      }
    }
    mapResult = content[row][column]
  }
  return mapResult
}

async function getContent (filepath) {
  return new Promise((resolve) => {
    let get = /^https/.test(filepath) ? https.get : http.get
    let options = parseUrl(filepath)
    get(options, (res) => {
      if (res.statusCode === 200) {
        let totalBuffer = Buffer.alloc(0)
        res.on('data', (chunk) => {
          totalBuffer = Buffer.concat([totalBuffer, chunk], totalBuffer.length + chunk.length)
        });
        res.on('end', () => {
          let str = totalBuffer.toString()
          resolve(str)
        });
      } else {
        resolve(null)
      }
    })
    .on('error', (error) => {
      resolve(null)
    })
  })
}

function parseUrl (url) {
  let matches = url.match(/(https?:)\/\/([\w\.]+):?(\d*)(.*)/)
  return {
    protocol: matches[1],
    hostname: matches[2],
    port: matches[3],
    pathname: matches[4],
    path: matches[4],
    timeout: 5000
  }
}

function mappingSingleFile (object) {
  let mappings = object.mappings
  let lines = mappings.split(';')
  let result = {}
  let tempResult
  // 转码后的列
  let transformedColumn = 1
  // 文件索引
  let sourceIndex = 0
  // 文件row
  let sourceRow = 1
  // 文件列
  let sourceColumn = 1
  // 字段名
  let sourceNameIndex = 0
  
  for (let i = 0, len = lines.length; i < len; i++) {
    let line = lines[i]
    if (!line) {
      continue
    }
    tempResult = result[i + 1] = {}
    transformedColumn = 1
    let arr = line.split(',')
    for (let j = 0, len1 = arr.length; j < len1; j++) {
      let ret = vlq.decode(arr[j])
      let info = {}
      transformedColumn += ret[0]
      if (ret[1] !== undefined) {
        sourceIndex += ret[1]
        sourceRow += ret[2]
        sourceColumn += ret[3]
        info.sourceIndex = sourceIndex
        info.row = sourceRow
        info.column = sourceColumn
        if (ret[4] !== undefined) {
          sourceNameIndex += ret[4]
          info.name = object.names[sourceNameIndex]
        }
        // assign info
        tempResult[transformedColumn] = info
      }
    }
  }
  result.sources = object.sources
  result.sourcesContent = object.sourcesContent
  return result
}