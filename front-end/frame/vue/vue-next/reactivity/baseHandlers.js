import { isObject, hadOwn, hasChanged } from '../share/utils'
import { reactive } from './reactive'
import { trigger, track } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operation'

const get = createGetter()
const set = createSetter()

function createGetter() {
  return function get (target, key, receiver) { // proxy + reflect

    // return target[key]

    const res = Reflect.get(target, key, receiver)
    // todu...

    console.log('进行了取值操作', target, key)

    track(target, TrackOpTypes.GET, key) // 依赖收集
    if (isObject(res)) { // 如果是对象，就再次代理并把它返回，而且不是一上来全部defineProperty，而是在取值时才代理，性能好很多
      return reactive(res)
    }
    return res
  }
}

function createSetter() {
  return function set (target, key, value, receiver) {
    // 需要判断是修改属性还是增加属性，如果原来的值和新设置的值一样，什么都不做
    const hadKey = hadOwn(target, key)
    const oldValue = target[key]

    // target[key] = value
    const result = Reflect.set(target, key, value, receiver)

    // 针对数组push之类的操作，做一个区分，如果已经有该属性，并且该属性没有发生变化，不做任何操作
    if (!hadKey) {
      console.log('属性新增操作', target, key)
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else if (hasChanged(value, oldValue)) {
      console.log('修改操作', target, key, oldValue)
      trigger(target, TriggerOpTypes.SET, key, value) // 触发依赖更新
    }

    
    // todo...

    console.log('进行了设置值操作', target, key)

    
    
    return result
  }
}

// 拦截普通对象和数组处理
export const mutableHandler = {
  // get,set也有可能不同，所以通过一个crate生成方法传入不同参数来生成
  get,
  set
}