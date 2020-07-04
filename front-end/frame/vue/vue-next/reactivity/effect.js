import { TriggerOpTypes } from "./operation"

export function effect(fn, options = {}) {
  
  const effect = createReactiveEffect(fn, options)

  if (!options.lazy) {
    effect() // 默认就执行
  }

  return effect
}

let uid = 0

let activeEffect

const effectSatck = [] // 栈结构

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    // 防止不停的更改属性，导致死循环，比如在effect中修改了监听的变量，如果没有下面的push操作，就会一直触发，有了这一步判断
    // 在函数执行完成并且pop之前，相同的effect不会再进来执行
    if (!effectSatck.includes(effect)) { 
      try {
        effectSatck.push(effect);
        activeEffect = effect // 将effect放到了 activeEffect上
        return fn()
      } catch (error) {
        
      } finally {
        effectSatck.pop()
        activeEffect = effectSatck[effectSatck.length - 1]
      }
    }
    
  }

  effect.options = options
  effect.id = uid++
  effect.deps = [] // 依赖了哪些属性

  return effect
}

const targetMap = new WeakMap()

export function track(target, type, key) {
  // 
  console.log(activeEffect)
  // 只有effect里对属性取值才存起来
  if (activeEffect == undefined) {
    return
  }
  let depsMap = targetMap.get(target)

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)

  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect) // dep会是这样一种结构 { "name": Set {effect, effect } }
    activeEffect.deps.push(dep) // 让这个effect也记录一下dep
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target) // 获取当前对应的map,里面存了target上属性对应的effect

  if (!depsMap) {
    return
  }
  // 计算属性要优先于默认的effect执行，为什么呢？

  const effects = new Set()

  const computedRunners = new Set()

  const add = (effectToAdd) => {
    if (effectToAdd) {
      effectToAdd.forEach(effect => {
        if (effect.options.computed) {
          computedRunners.add(effect)
        } else {
          effects.add(effect)
        }
      });
    }
  }

  if (key !== null) {
    add(depsMap.get(key))
  }

  if (type === TriggerOpTypes.ADD) { // 对数组新增属性，会触发length对应的依赖 因为在取值的时候回对length属性进行依赖收集
    add(depsMap.get(Array.isArray(target) ? 'length' : ''))
  }

  const run = (effect) => {
    if (effect.options.scheduler) {
      effect.options.scheduler()
    } else {
      effect()
    }
  }
  computedRunners.forEach(run)
  effects.forEach(run)
}