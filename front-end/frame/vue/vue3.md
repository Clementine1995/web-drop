# Vue3

## 代码管理模式

Vue3使用 monorepo + lerna来管理代码，monorepo是一种将多个package放在一个repo中的代码管理模式，而lerna是用来管理多个package的工具

package.json中private为true的不会被列举出来

## Proxy

defineProperty 需要给对象重写getter/setter，并且需要递归性能比较差