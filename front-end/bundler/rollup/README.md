# Rollup

> 官方文档[rollup.js](https://cn.rollupjs.org/introduction/)

## 概括

Rollup 是一个用于 JavaScript 的模块打包工具，它将小的代码片段编译成更大、更复杂的代码，例如库或应用程序。它使用 JavaScript 的 ES6 版本中包含的新标准化代码模块格式，
而不是以前的 CommonJS 和 AMD 等特殊解决方案。ES 模块允许你自由无缝地组合你最喜欢的库中最有用的个别函数。这在未来将在所有场景原生支持，但 Rollup 让你今天就可以开始这样做。

## 安装

```shell
npm install --global rollup
```

这将使 Rollup 可以作为全局命令行工具使用。

## 快速开始

可以通过带有可选配置文件的 命令行界面 或 JavaScript API 来使用 Rollup。运行`rollup --help`以查看可用选项和参数。

这些命令假定你的应用程序入口点命名为 main.js，并且希望将所有导入编译到一个名为 bundle.js 的单个文件中。

```shell
# 对于浏览器：
# 编译为包含自执行函数（'iife'）的 <script>。
rollup main.js --file bundle.js --format iife

# 对于 Node.js:
# 编译为一个 CommonJS 模块 ('cjs')
rollup main.js --file bundle.js --format cjs

# 对于浏览器和 Node.js：
# UMD 格式需要一个包名
rollup main.js --file bundle.js --format umd --name "myBundle"
```

## 背景

将项目分解为较小的独立部分通常可以使软件开发更加容易，因为这通常可以消除意外的交互，并大大减少你需要解决的问题的复杂性，而仅仅是首先编写较小的项目 
并不一定是最好的方式。不幸的是，JavaScript 在历史上并没有将这种能力作为语言的核心特性之一。这在 ES6 版本的 JavaScript 中得到了改变，该版本包括一种语法，用于导入和导出函数和数据，以便它们可以在单独的脚本之间共享。

该规范现在已经稳定，但仅在现代浏览器中实现，并未在 Node.js 中完全落地。Rollup 允许你使用新的模块系统编写代码，然后将其编译回现有的支持格式，
例如 CommonJS 模块、AMD 模块和 IIFE 样式脚本。这意味着你可以编写 对未来兼容 的代码，并且还可以获得以下几点收益……

## 除屑优化（Tree-Shaking）

除了可以使用 ES 模块之外，Rollup 还可以静态分析你导入的代码，并将排除任何实际上没有使用的内容。这使你可以在现有的工具和模块的基础上构建，而不需要添加额外的依赖项或使项目的大小变得臃肿。

例如，使用 CommonJS 必须导入整个工具或库。

```js
// 使用 CommonJS 导入整个 utils 对象
const utils = require('./utils');
const query = 'Rollup';
// 使用 utils 对象的 ajax 方法。
utils.ajax(`https://api.example.com?search=${query}`).then(handleResponse);
```

使用 ES 模块，我们不需要导入整个 utils 对象，而只需导入我们需要的一个 ajax 函数：

```js
// 使用 ES6 的 import 语句导入 ajax 函数。
import { ajax } from './utils';
const query = 'Rollup';
// 调用 ajax 函数
ajax(`https://api.example.com?search=${query}`).then(handleResponse);
```

因为 Rollup 只包含最少的内容，因此它生成的库和应用程序更轻、更快、更简单。由于这种方法可以利用显式的 import 和 export 语句，因此它比仅运行最小化混淆工具更能有效检测出已编译输出代码中的未使用变量。

## 兼容性

导入 CommonJS，Rollup 可以通过插件 导入现有的 CommonJS 模块。

## 发布 ES 模块

为了确保你的 ES 模块可以立即被处理 CommonJS 的工具，例如 Node.js 和 webpack 使用，你可以使用 Rollup 编译成 UMD 或 CommonJS 格式，然后在 package.json 文件中使用 main 属性指向编译后的版本。
如果你的 package.json 文件还有一个 module 字段，那么像 Rollup 和 webpack 2+ 这样的可感知 ES 模块的工具将直接 导入 ES 模块版本。

## 命令行接口

Rollup 通常应该从命令行使用。你可以提供一个可选的 Rollup 配置文件，以简化命令行使用并启用高级 Rollup 功能。

### 配置文件

Rollup 配置文件是可选的，但它们非常强大和方便，因此推荐使用。配置文件是一个 ES 模块，它导出一个默认对象，其中包含所需的选项：

```js
export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	}
};
```

通常，它被称为 `rollup.config.js` 或 `rollup.config.mjs`，并位于项目的根目录中。除非使用 `--configPlugin` 或 `--bundleConfigAsCjs` 选项，
否则 Rollup 将直接使用 Node 导入该文件。请注意，使用原生 Node ES 模块时存在一些注意事项，因为 Rollup 将遵循 `Node ESM` 语义。

如果你想使用 require 和 module.exports 编写 CommonJS 模块的配置文件，你应该将文件扩展名更改为 `.cjs`。

使用 `--configPlugin` 选项将始终强制将你的配置文件先转换为 CommonJS 格式。

配置文件支持下面列出的选项。有关每个选项的详细信息，请参阅选项大全：

```js
// rollup.config.js

// 可以是数组（即多个输入源）
export default {
	// 核心输入选项
	external,
	input, // 有条件地需要
	plugins,

	// 进阶输入选项
	cache,
	logLevel,
	makeAbsoluteExternalsRelative,
	maxParallelFileOps,
	onLog,
	onwarn,
	preserveEntrySignatures,
	strictDeprecations,

	// 危险区域
	context,
	moduleContext,
	preserveSymlinks,
	shimMissingExports,
	treeshake,

	// 实验性
	experimentalCacheExpiry,
	experimentalLogSideEffects,
	experimentalMinChunkSize,
	perf,

	// 必需（可以是数组，用于描述多个输出）
	output: {
		// 核心输出选项
		dir,
		file,
		format,
		globals,
		name,
		plugins,

		// 进阶输出选项
		assetFileNames,
		banner,
		chunkFileNames,
		compact,
		dynamicImportInCjs,
		entryFileNames,
		extend,
		externalImportAttributes,
		footer,
		generatedCode,
		hoistTransitiveImports,
		inlineDynamicImports,
		interop,
		intro,
		manualChunks,
		minifyInternalExports,
		outro,
		paths,
		preserveModules,
		preserveModulesRoot,
		sourcemap,
		sourcemapBaseUrl,
		sourcemapExcludeSources,
		sourcemapFile,
		sourcemapFileNames,
		sourcemapIgnoreList,
		sourcemapPathTransform,
		validate,

		// 危险区域
		amd,
		esModule,
		exports,
		externalLiveBindings,
		freeze,
		indent,
		noConflict,
		sanitizeFileName,
		strict,
		systemNullSetters,

		// 实验性
		experimentalMinChunkSize
	},

	watch: {
		buildDelay,
		chokidar,
		clearScreen,
		exclude,
		include,
		skipWrite
	}
};
```

你可以从配置文件中导出一个数组，以便一次从多个不相关的输入进行打包，即使在监视模式下也可以。要使用相同的输入打出不同的包，你需要为每个输入提供一个输出选项数组：

```js
// rollup.config.js (building more than one bundle)

export default [
	{
		input: 'main-a.js',
		output: {
			file: 'dist/bundle-a.js',
			format: 'cjs'
		}
	},
	{
		input: 'main-b.js',
		output: [
			{
				file: 'dist/bundle-b1.js',
				format: 'cjs'
			},
			{
				file: 'dist/bundle-b2.js',
				format: 'es'
			}
		]
	}
];
```

