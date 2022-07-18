# 读取 json 文件有趣的 npm 包

> 原文[从 vue-cli 源码中，我发现了 27 行读取 json 文件有趣的 npm 包](https://lxchuan12.gitee.io/read-pkg)

如何用 import 加载 json 文件，vue-cli 源码里有 read-pkg 这个包。源码仅 27 行，非常值得学习

## 场景

优雅的获取 package.json 文件。

[read-pkg](https://npm.im/read-pkg)

[vue-cli 源码](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-shared-utils/lib/pkg.js)

```js
const fs = require("fs")
const path = require("path")
const readPkg = require("read-pkg")

exports.resolvePkg = function (context) {
  if (fs.existsSync(path.join(context, "package.json"))) {
    return readPkg.sync({ cwd: context })
  }
  return {}
}
```

也许会想直接 require('package.json'); 不就可以了。但在 ES 模块下，目前无法直接引入 JSON 文件。

接着来看 [阮一峰老师的 JSON 模块](https://es6.ruanyifeng.com/#docs/proposals#JSON-%E6%A8%A1%E5%9D%97)

> import 命令目前只能用于加载 ES 模块，现在有一个提案，允许加载 JSON 模块。 import 命令能够直接加载 JSON 模块以后，就可以像下面这样写。
>
> import 命令导入 JSON 模块时，命令结尾的 assert {type: "json"} 不可缺 少。这叫做导入断言，用来告诉 JavaScript 引擎，现在加载的是 JSON 模块。

```js
import configData from "./config.json" assert { type: "json" }
console.log(configData.appName)
```

接下来看 read-pkg 源码 。

## 源码

看源码一般先看 package.json，再看 script。

### package.json

```json
{
  "name":
  "scripts": {
    "test": "xo && ava && tsd"
  }
}
```

test 命令有三个包，一一查阅了解

- xo：JavaScript/TypeScript linter (ESLint wrapper) with great defaults JavaScript/TypeScript linter（ESLint 包装器）具有很好的默认值
- tsd：Check TypeScript type definitions 检查 TypeScript 类型定义
- nodejs 测试工具 ava：Node.js test runner that lets you develop with confidence

### 测试用例

这个测试用例文件，主要就是主入口 `index.js` 导出的两个方法 `readPackage`, `readPackageSync`。异步和同步的方法。

判断读取的 `package.json` 的 `name` 属性与测试用例的 `name` 属性是否相等。

判断读取 `package.json` 的 `_id` 是否是真值。

同时支持指定目录。`{ cwd }`

```js
// read-pkg/test/test.js
import { fileURLToPath } from "url"
import path from "path"
import test from "ava"
import { readPackage, readPackageSync } from "../index.js"

const dirname = path.dirname(fileURLToPath(import.meta.url))
process.chdir(dirname)
const rootCwd = path.join(dirname, "..")

test("async", async (t) => {
  const package_ = await readPackage()
  t.is(package_.name, "unicorn")
  t.truthy(package_._id)
})

test("async - cwd option", async (t) => {
  const package_ = await readPackage({ cwd: rootCwd })
  t.is(package_.name, "read-pkg")
})

test("sync", (t) => {
  const package_ = readPackageSync()
  t.is(package_.name, "unicorn")
  t.truthy(package_._id)
})

test("sync - cwd option", (t) => {
  const package_ = readPackageSync({ cwd: rootCwd })
  t.is(package_.name, "read-pkg")
})
```

#### url 模块

url 模块提供用于网址处理和解析的实用工具。[url 中文文档](http://nodejs.cn/api/url.html#urlfileurltopathurl)

url.fileURLToPath(url) 方法：url | 要转换为路径的文件网址字符串或网址对象。 返回: 完全解析的特定于平台的 Node.js 文件路径。 此函数可确保正确解码百分比编码字符，并确保跨平台有效的绝对路径字符串。

#### import.meta.url

[import.meta.url](https://es6.ruanyifeng.com/?search=import.meta.url&x=10&y=9#docs/proposals#import-meta)

> import.meta.url 返回当前模块的 URL 路径。举例来说，当前模块主文件的路径是`https://foo.com/main.js`，import.meta.url 就返回这个路径。如果模块里面还有一个数据文件 data.txt，那么就可以用下面的代码，获取这个数据文件的路径。 new URL('data.txt', import.meta.url) 注意，Node.js 环境中，import.meta.url 返回的总是本地路径，即是 file:URL 协议的字符串，比如 `file:///home/user/foo.js`

#### process.chdir

process.chdir() 方法更改 Node.js 进程的当前工作目录，如果失败则抛出异常（例如，如果指定的 directory 不存在）。

### 27 行主入口源码

导出异步和同步的两个方法，支持传递参数对象，cwd 默认是 process.cwd()，normalize 默认标准化。

分别是用 fsPromises.readFile fs.readFileSync 读取 package.json 文件。

用 [parse-json](https://github.com/sindresorhus/parse-json) 解析 json 文件。

用 [npm 官方库 normalize-package-data](https://github.com/npm/normalize-package-data) 规范化 package 元数据。

```js
import process from "node:process"
import fs, { promises as fsPromises } from "node:fs"
import path from "node:path"
import parseJson from "parse-json"
import normalizePackageData from "normalize-package-data"

export async function readPackage({
  cwd = process.cwd(),
  normalize = true,
} = {}) {
  const filePath = path.resolve(cwd, "package.json")
  const json = parseJson(await fsPromises.readFile(filePath, "utf8"))

  if (normalize) {
    normalizePackageData(json)
  }

  return json
}

export function readPackageSync({
  cwd = process.cwd(),
  normalize = true,
} = {}) {
  const filePath = path.resolve(cwd, "package.json")
  const json = parseJson(fs.readFileSync(filePath, "utf8"))

  if (normalize) {
    normalizePackageData(json)
  }

  return json
}
```

#### process 进程模块

[process 中文文档](http://nodejs.cn/api/process.html#process)，很常用的模块。process 对象提供有关当前 Node.js 进程的信息并对其进行控制。 虽然它作为全局可用，但是建议通过 require 或 import 显式地访问它：

```js
import process from "node:process"
```

也就是说引用 node 原生库可以加 node: 前缀，比如 `import util from 'node:util'`

#### path 路径模块

[path 中文文档](http://nodejs.cn/api/path.html)，path 模块提供了用于处理文件和目录的路径的实用工具。

#### fs 文件模块

[fs 中文文档](http://nodejs.cn/api/fs.html)，path 模块提供了用于处理文件和目录的路径的实用工具。

#### parseJson 解析 JSON

[parse-json](https://github.com/sindresorhus/parse-json)

更多有用的错误提示。

```js
// 源码有删减
const fallback = require("json-parse-even-better-errors")
const parseJson = (string, reviver, filename) => {
  if (typeof reviver === "string") {
    filename = reviver
    reviver = null
  }

  try {
    try {
      return JSON.parse(string, reviver)
    } catch (error) {
      fallback(string, reviver)
      throw error
    }
  } catch (error) {
    // 省略
  }
}
```

#### normalizePackageData 规范化包元数据

[normalize-package-data](https://github.com/npm/normalize-package-data)

```js
module.exports = normalize
function normalize(data, warn, strict) {
  // 省略若干代码
  data._id = data.name + "@" + data.version
}
```

这也就是为啥测试用例中用了 `t.truthy(package_._id);` 来检测 `_id` 属性是否为真值。
