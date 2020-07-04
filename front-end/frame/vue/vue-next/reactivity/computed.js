import { isFunction } from '../share/utils'
import { effect, trigger, track } from './effect'
import { TriggerOpTypes, TrackOpTypes } from './operation'

export function computed(getterOrOptions) {
  let getter
  let setter

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => {}
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  let dirty = true // 默认第一次取值是执行getter方法的
  let computed
  // 计算属性也是一个effect
  let runner = effect(getter, {
    lazy: true,
    computed: true, // 标识，表示是计算属性
    scheduler: () => {
      if (!dirty) {
        dirty = true // 当计算属性依赖的值变化之后就会执行这个方法

        trigger(computed, TriggerOpTypes.SET, 'value')
      }
    }
  })
  let value
  computed = {
    get value () {
      if (dirty) { // 多次取值不会重新执行effect
        value = runner()
        dirty = false
        track(computed, TrackOpTypes.GET, 'value')
      }
      return value
    },
    set value(newValue) {
      setter(newValue)
    }
  }

  return computed
}