function* generator() {
  const test1 = yield 1 + 2
  const test2 = yield test1 + 3
  const test3 = yield test2 + 4

  return test3
}

const interator = generator()

console.log(interator.next())
console.log(interator.next(3))
console.log(interator.next(6))
console.log(interator.next(10))

const arr = [1, 2, 3, 4, 5, 6, 7]

arr.forEach((item) => {
  if (item === 3) {
    throw new Error()
  }
  // console.log(item)
})

arr.map((item) => {
  if (item === 3) {
    throw new Error()
  }
  console.log(item)
})

setTimeout(() => {
  Promise.resolve(3).then((res) => {
    console.log(res)
  })
  console.log(1)
}, 1000)

setTimeout(() => {
  console.log(2)
}, 1000)
