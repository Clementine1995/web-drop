# Git 提交消息规范指南

>具体内容可参考[Git 提交消息规范指南](https://github.com/giscafer/front-end-manual/issues/28)

这里主要用的npm包是 `commitizen`

## 全局使用

全局安装 commitizen ，`npm install -g commitizen`。

然后安装你比较喜欢的 commitizen 全局适配器，比如 cz-conventional-changelog，`npm install -g cz-conventional-changelog`。

然后在家目录下创建一个 .czrc 文件，并在其中写入

```shell
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```

之后就可以使用 `git cz` 来代替 `git commit` 命令了，并且 `git commit` 命令后面可以跟的参数 cz 同样支持。
