# sourcemap-stack

## 参数定义  
参数属性 | 说明
-----|-----
mapUrl | sourcemap 地址链接，如果不填，表示sourcemap地址跟实际js路径一样
mapName | 参考webpack的地址格式，比如：[name].[hash].js.map
mapEncrypt | 如果map文件放到跟js同目录下，一起发布到cdn上，处于安全考虑，可以使用对称性加密map文件,加密包使用[encrypte](https://cnpmjs.org/package/encrypter),如果没有加密，这项不填
desc | js error 的堆栈信息

## API 

### getStackByError
根据错误的stack error信息，提取出调动的堆栈关系  

Input:  
```javascript
TypeError: console.logs is not a function
at n (http://localhost:8082/app.js:6:180422)
at a.clickme (http://localhost:8082/app.js:6:180791)
at Proxy.r (http://localhost:8082/app.js:6:1053)
at click (http://localhost:8082/app.js:6:172962)
at HTMLHeadingElement.t (http://localhost:8082/app.js:6:7539)
```
Output:  
```json
[
  {"filepath":"http://localhost:8082/app.js","row":"6","column":"180422","html":false},
  {"filepath":"http://localhost:8082/app.js","row":"6","column":"180791","html":false},
  {"filepath":"http://localhost:8082/app.js","row":"6","column":"1053","html":false},
  {"filepath":"http://localhost:8082/app.js","row":"6","column":"172962","html":false},
  {"filepath":"http://localhost:8082/app.js","row":"6","column":"7539","html":false}
]
```

### getMapPath  
根据map参数的配置，获取sourcemap地址  
Output:  
```json
[
{"filepath":"http://localhost:8082/app.js","row":"6","column":"180422","html":false,"mapUrl":"http://localhost:8082/app.js.map"},
{"filepath":"http://localhost:8082/app.js","row":"6","column":"180791","html":false,"mapUrl":"http://localhost:8082/app.js.map"},
{"filepath":"http://localhost:8082/app.js","row":"6","column":"1053","html":false,"mapUrl":"http://localhost:8082/app.js.map"},
{"filepath":"http://localhost:8082/app.js","row":"6","column":"172962","html":false,"mapUrl":"http://localhost:8082/app.js.map"},
{"filepath":"http://localhost:8082/app.js","row":"6","column":"7539","html":false,"mapUrl":"http://localhost:8082/app.js.map"}
]
```

### getRealStack  
解析真正的调用关系  


## 调用demo  

```javascript
// 获取请求内容
let params = this.ctx.request.body
// 获取调用堆栈
let stacks = sourcemapStack.getStackByError(params.desc)
// 增加map地址
sourcemapStack.getMapPath(stacks, params)
// 获取真实调用地址
stacks = yield sourcemapStack.getRealStack(stacks)

```

## 具体使用文章

[https://qianduan.group/posts/59e5c3d0cf830d7057327c95](https://qianduan.group/posts/59e5c3d0cf830d7057327c95)