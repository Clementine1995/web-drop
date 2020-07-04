import { reactive, effect, computed, ref } from './reactivity'

const state = reactive({
  name: '1111',
  age: 11,
  arr: [1, 2, 3]
})

console.log(state)

state.arr.push(4)

// 调用数组push方法,会先在数组中插入值，然后会在更新length

// vue3的核心，watch，watchEffect都是基于它
effect(() => {
  console.log(state.name)
})

state.name = 'hha' // 应该重新执行effect

// 写effect，之后会执行，并且 activeEffect = effect
// effect中会对数据进行一些操作，这里是取name，也就是会触发reactive中的get操作，然后就可以利用track两者关联起来 name = [effect]
// 稍后如果修改了name,就会通过 set() ，然后执行trigger可以通过name 找到当前的effect，然后将其执行


let myAge = computed(() => { // 它是一个lazy为true的effect
  return state.age * 2
})