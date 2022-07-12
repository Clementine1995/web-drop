# 39 行小工具 install-pkg 安装包，值得一学

> 原文[39 行小工具 install-pkg 安装包，值得一学！](https://lxchuan12.gitee.io/install-pkg)

## install-pkg 是什么

以编程方式安装包。自动检测包管理器（npm、yarn 和 pnpm）。

## 源码

### index.js

导出所有

```js
// src/install.ts
export * from "./detect"
export * from "./install"
```

我们来看 install.ts 文件，installPackage 方法。

### installPackage 安装包

```js
// src/install.ts
import execa from 'execa'
import { detectPackageManager } from '.'

export interface InstallPackageOptions {
  cwd?: string
  dev?: boolean
  silent?: boolean
  packageManager?: string
  preferOffline?: boolean
  additionalArgs?: string[]
}

export async function installPackage(names: string | string[], options: InstallPackageOptions = {}) {
  // agent 也就是包管理器
  const agent = options.packageManager || await detectPackageManager(options.cwd) || 'npm'
  // names 是要安装的包
  if (!Array.isArray(names))
    names = [names]

  const args = options.additionalArgs || []

  if (options.preferOffline)
    args.unshift('--prefer-offline')

  return execa(
    agent,
    [
      agent === 'yarn'
        ? 'add'
        : 'install',
      options.dev ? '-D' : '',
      ...args,
      ...names,
    ].filter(Boolean),
    {
      stdio: options.silent ? 'ignore' : 'inherit',
      cwd: options.cwd,
    },
  )
}
```

支持安装多个，也支持指定包管理器，支持额外的参数。其中 [github execa](https://github.com/sindresorhus/execa) 是执行脚本

也就是说：最终执行类似以下的脚本。

```sh
pnpm install -D --prefer-offine release-it react antd
```

接着来看 detect.ts 文件 探测包管理器 detectPackageManager 函数如何实现的

### detectPackageManager 探测包管理器

根据当前目录锁文件，探测包管理器。

```js
// src/detect.ts
import path from "path"
import findUp from "find-up"

export type PackageManager = "pnpm" | "yarn" | "npm"

const LOCKS: Record<string, PackageManager> = {
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "package-lock.json": "npm",
}

export async function detectPackageManager(cwd = process.cwd()) {
  const result = await findUp(Object.keys(LOCKS), { cwd })
  const agent = result ? LOCKS[path.basename(result)] : null
  return agent
}
```

其中 [find-up](https://github.com/sindresorhus/find-up#readme) 查找路径。

```sh
/
└── Users
    └── install-pkg
        ├── pnpm-lock.yaml
```

```js
import { findUp } from "find-up"

console.log(await findUp("pnpm-lock.yaml"))
//=> '/Users/install-pkg/pnpm-lock.yaml'
```

`path.basename('/Users/install-pkg/pnpm-lock.yaml')` 则是 pnpm-lock.yaml。

所以在有 pnpm-lock.yaml 文件的项目中，detectPackageManager 函数最终返回的是 pnpm。

至此可以用一句话总结原理就是：通过锁文件自动检测使用何种包管理器（npm、yarn、pnpm），最终用 execa 执行类似如下的命令。

```sh
pnpm install -D --prefer-offine release-it react antd
```

## package.json script 命令解析

```js
{
  "name": "@antfu/install-pkg",
  "version": "0.1.0",
  "scripts": {
    "prepublishOnly": "nr build",
    "dev": "nr build --watch",
    "start": "esno src/index.ts",
    "build": "tsup src/index.ts --format cjs,esm --dts --no-splitting",
    "release": "bumpp --commit --push --tag && pnpm publish",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "lint:fix": "nr lint -- --fix"
  },
}
```

### ni 神器

[github ni](https://github.com/antfu/ni)

自动根据锁文件 yarn.lock / pnpm-lock.yaml / package-lock.json 检测使用 yarn / pnpm / npm 的包管理器。

```sh
nr dev --port=3000

# npm run dev -- --port=3000
# yarn run dev --port=3000
# pnpm run dev -- --port=3000
```

nci - clean install

```sh
nci
# npm ci
# 简单说就是不更新锁文件
# yarn install --frozen-lockfile
# pnpm install --frozen-lockfile
```

### esno 运行 ts

[esno](https://github.com/antfu/esno#readme) TypeScript / ESNext node runtime powered by esbuild

```js
#!/usr/bin/env node

const spawn = require("cross-spawn")
const spawnSync = spawn.sync

const register = require.resolve("esbuild-register")

const argv = process.argv.slice(2)

process.exit(
  spawnSync("node", ["-r", register, ...argv], { stdio: "inherit" }).status
)
```

esbuild-register 简单说：使用 esbuild 即时传输 JSX、TypeScript 和 esnext 功能

### tsup 打包 ts

打包 TypeScript 库的最简单、最快的方法。[tsup](https://github.com/egoist/tsup#readme)

### bumpp 交互式提升版本号

[bumpp](https://github.com/antfu/bumpp) 交互式 CLI 可增加版本号等

### eslint 预设

[eslint 预设](https://github.com/antfu/eslint-config)

```sh
pnpm add -D eslint @antfu/eslint-config
```

添加 .eslintrc 文件

```js
// .eslintrc
{
  "extends": ["@antfu"],
  "rules": {}
}
```
