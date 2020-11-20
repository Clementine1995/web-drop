// 2020-11-13

// 使用 Promise 实现每隔一秒输出 1、2、3

const oneToThree = () => {
  const arr = [1, 2, 3]
  arr.reduce((prev, next) => {
    return prev.then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(next)
          resolve()
        }, 1000)
      })
    })
  }, Promise.resolve())
}
console.log(oneToThree())

// 第二种
const promiseEach1 = (arr, cb) => {
  arr.reduce((prev, next) => {
    return prev.then(() => {
      return cb(next)
    })
  }, Promise.resolve())
}

const arr = [1, 2, 3]

promiseEach1(arr, (next) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('1:', next)
      resolve()
    }, 1000)
  })
})

// 第三种

async function promiseEach2 (arr, cb)  {
   for (const item of arr) {
    await cb(item)
  }
}

promiseEach2(arr, (next) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('2:', next)
      resolve()
    }, 1000)
  })
})

// 使用 Promise 实现红绿灯交替重复亮

function red() {
  console.log('red');
}
function yellow() {
  console.log('yellow');
}
function green() {
  console.log('green');
}

const light = (timer, cb) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      cb()
      resolve()
    }, timer)
  })
}

const run = () => {
  Promise.resolve().then(() => {
    return light(3000, red)
  }).then(() => {
    return light(2000, yellow)
  }).then(() => {
    return light(1000, green)
  }).then(() => {
    run()
  })
}

run()

// 封装一个异步加载图片的方法

function loadImg (url) {
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      console.log('图片加载完成')
      resolve(img)
    }

    img.onerror = () => {
      console.log('图片加载失败')
      reject(img)
    }
    img.src = url
  })
}