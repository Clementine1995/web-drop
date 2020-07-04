import { isObject } from '../share/utils'
import { mutableHandler } from './baseHandlers'

export function reactive(target) {
  // 创建一个响应式对象 target 可能是对象或者数组以及set,map，所以代理时也需要区分

  return createReactiveOjbect(target, mutableHandler
    // {
    //   get() {},
    //   set() {}
    //   // 处理代理这些方法外，可能还有很多陷阱, 所以统一抽离
    // }
  )
}

function createReactiveOjbect(target, baseHandler) {
  if (!isObject(target)) { // 不是对象直接返回
    return target
  }
  const observed = new Proxy(target, baseHandler)

  return observed
}