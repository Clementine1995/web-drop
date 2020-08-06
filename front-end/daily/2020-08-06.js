// // 另一种考虑比较全面的深拷贝

// function deepClone(obj, hash = new WeakMap()) {
//   if (obj === null) return
//   if (obj instanceof Date) return new Date(obj)
//   if (obj instanceof RegExp) return new RegExp(obj)
//   if (typeof obj !== 'object') return obj

//   if (hash.get(obj)) return hash.get(obj)

//   let cloneObj = new obj.constructor()

//   hash.set(obj, cloneObj)
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       cloneObj[key] = deepClone(obj[key], hash)
//     }
//   }
//   return cloneObj
// }

// let obj = { name: 1, address: { x: 100 } };
// obj.o = obj; // 对象存在循环引用的情况
// let d = deepClone(obj);
// obj.address.x = 200;
// console.log(d);

// clone.js

// 可以深度克隆的类型
const mapTag = '[object Map]'
const setTag = '[object Set]'
const arrayTag = '[object Array]'
const objectTag = '[object Object]'
const argsTag = '[object Arguments]'

// 不可以深度克隆的类型
const boolTag = '[object Boolean]'
const dateTag = '[object Date]'
const numberTag = '[object Number]'
const stringTag = '[object String]'
const symbolTag = '[object Symbol]'
const errorTag = '[object Error]'
const regexpTag = '[object RegExp]'
const funcTag = '[object Function]'

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag]

function forEach(array, iteratee) { // 把 forin 改造成 while
  let index = -1
  const length = array.length
  while(++index < length) {
    iteratee(array[index], index)
  }
}

function isObject(target) {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');
}

function getType(target) {
  return Object.prototype.toString.call(target)
}

function getInit(target) {
  const Ctor = target.constructor;
  return new Ctor();
}

function cloneOtherType(target, type) {
  const Ctor = target.constructor
  switch (type) {
    case boolTag:
    case numberTag:
    case stringTag:
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return cloneReg(target);
    case symbolTag:
      return cloneSymbol(target);
    case funcTag:
      return cloneFunction(target);
    default:
      return null;
  }
}

function cloneSymbol(target) {
  return Object(Symbol.prototype.valueOf.call(target));
}

function cloneReg(target) {
  const reFlags = /\w*$/;
  const result = new target.constructor(target.source, reFlags.exec(target));
  result.lastIndex = target.lastIndex;
  return result;
}

function cloneFunction(func) {
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  if (func.prototype) {
    const param = paramReg.exec(funcString);
    const body = bodyReg.exec(funcString);
    if (body) {
      if (param) {
        const paramArr = param[0].split(',');
        return new Function(...paramArr, body[0]);
      } else {
        return new Function(body[0]);
      }
    } else {
      return null;
    }
  } else {
    return eval(funcString);
  }
}

function clone(target, map = new WeakMap()) {
  if (!isObject(target)) {
    return target
  }

  // 初始化
  const type = getType(target)
  let cloneObj

  if (deepTag.includes(type)) {
    cloneObj = getInit(target, type)
  } else {
    return cloneOtherType(target, type);
  }

  if (map.get(target)) {
    return map.get(target)
  }
  map.set(target, cloneObj)

  if (type === setTag) {
    target.forEach(value => {
      cloneObj.add(clone(value, map));
    });
    return cloneObj;
  }

  if (type === mapTag) {
    target.forEach((value, key) => {
      cloneObj.set(key, clone(value, map));
    });
    return cloneObj;
  }

  const keys = type === arrayTag ? undefined : Object.keys(target)

  forEach(keys || target, (value, key) => {
    if (keys) {
      key = value
    }
    cloneObj[key] = clone(target[key], map)
  })

  return cloneObj 
}

const target = {
  field1: 1,
  field2: undefined,
  field3: 'hahahaha',
  field4: {
    child1: 'child1',
    child2: {
      child2: 'child2'
    }
  },
  field5: [2, 6, 9],
  field6: Symbol('symbol'),
  field7: new Map([['key1', 'value1']]),
  field8: new Set([['key2', 'value2']]),
  field9: function () { console.log('ahhahahah') },
  field10: () => {console.log('999999999999')},
  field11: new Date(),
  field12: /a/
}

const copy = clone(target)
console.log(copy)