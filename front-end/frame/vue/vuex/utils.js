export const forEachValue = (obj, callback) => { // 功能遍历对象
  Object.keys(obj).forEach(key => {
    callback(obj[key], key)
  })
}