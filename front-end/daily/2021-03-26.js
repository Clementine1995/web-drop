// eventbus
// on(),emit,off,once

function EventBus() {
  this.msgQueues = {};
}

EventBus.prototype = {
  on: function (msgName, func) {
    // (this.msgQueues[msgName] || (this.msgQueues[msgName] = [])).push(func)
    if (this.msgQueues.hasOwnProperty(msgName)) {
      if (typeof this.msgQueues[msgName] === "function") {
        this.msgQueues[msgName] = [this.msgQueues[msgName], func];
      } else {
        this.msgQueues[msgName] = [...this.msgQueues[msgName], func];
      }
    } else {
      this.msgQueues[msgName] = func;
    }
  },
  once: function (msgName, func) {
    this.msgQueues[msgName] = func;
  },
  emit: function (msgName, payload) {
    if (!this.msgQueues[msgName]) {
      return;
    }

    if (typeof this.msgQueues[msgName] === "function") {
      this.msgQueues[msgName](payload);
    } else {
      this.msgQueues[msgName].map((fn) => {
        fn(payload);
      });
    }
  },
  off: function (msgName) {
    if (!this.msgQueues[msgName]) {
      return;
    }
    delete this.msgQueues[msgName];
  },
};

// setTimeout 实现 setInterval

let timeId;
function mySetInterval(cb, time) {
  const fn = () => {
    cb();
    timeId = setTimeout(() => {
      fn();
    }, time);
  };
  timeId = setTimeout(fn, time);
  return timeId;
}

// 实现new

function myNew() {
  var obj = {};
  var constructor = [].shift.call(arguments);
  var args = [].slice.call(arguments);
  obj.__proto__ = constructor.prototype;
  // var obj = Object.create(constructor.prototype)
  // Object.setPrototypeOf(obj, constrcutor.prototype)
  var res = constructor.call(obj, ...args);

  return res instanceof Object ? res : obj;
}
// 实现call

function myCall(context, ...args) {
  context = context || window;
  let fn = Symbol();
  context[fn] = this;

  let result = context[fn](...args);
  delete context[fn];

  return result;
}

// 实现apply

function myApply(context, arr) {
  context = context || window;
  let fn = Symbol();
  context[fn] = this;

  let result = context[fn](...arr);
  delete context[fn];
  return result;
}

// 实现bind

function myBind() {
  var self = this;
  var context = [].shift.call(arguments);
  var args1 = [].slice.call(arguments);

  var result = function () {
    var args2 = [].slice.call(arguments);

    return self.apply(
      this instanceof result ? this : context,
      args1.concat(args2)
    );
  };

  var Agent = function () {};
  Agent.prototype = self.prototype;
  result.prototype = new Agent();
  return result;
}

// 防抖

function debounce(fn, wait, immediate) {
  var timeId, result;
  var debounce = function () {
    var context = this;
    var args = arguments;
    if (timeId) {
      clearTimeout(timeId);
    }

    if (immediate) {
      var callNow = !timeId;
      timeId = setTimeout(function () {
        timeId = null;
      }, wait);
      if (callNow) result = fn.apply(context, args);
    } else {
      timeId = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    }

    return result;
  };

  debounce.cancel = function () {
    clearTimeout(timeId);
    timeId = null;
  };
}

// 节流

function throttle(fn, wait) {
  var timeId;

  return function () {
    var context = this;
    var args = arguments;
    if (!timeId) {
      setTimeout(function () {
        fn.call(context, args);
        timeId = null;
      }, wait);
    }
  };
}

// 浅拷贝

function shallowClone(obj) {
  if (typeof obj !== "object") {
    return;
  }

  var newObj = obj instanceof Array ? [] : {};

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[key] = object[key];
    }
  }

  return newObj;
}
// 深拷贝简单版

function deepClone(obj, map = new WeakMap()) {
  if (typeof obj !== "object") {
    return;
  }

  var newObj = obj instanceof Array ? [] : {};

  if (map.get(obj)) {
    return map.get(obj);
  }
  map.set(obj, newObj);
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[key] =
        typeof object[key] === "object"
          ? deepClone(object[key], map)
          : object[key];
    }
  }

  return newObj;
}

// 数组去重
function quchong(arr) {
  const temp = [];
  for (const item of arr) {
    if (temp.indexOf(item) === -1) {
      temp.push(item);
    }
  }
}

function quchong2(arr) {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}

function quchong3(arr) {
  const obj = {};
  return arr.filter((item, index) => {
    return obj.hasOwnProperty[item] ? false : (object[item] = true);
  });
}

function quchong4(arr) {
  return [...new Set(arr)];
}

// reduce 实现map

function myMap(cb, arr) {
  return arr.reduce((cur, pre) => {
    cur.push(cb(pre));
    return cur;
  }, []);
}

// reduce flat

function myFlat(arr) {
  return arr.reduce((cur, pre) => {
    cur.push(Array.isArray(pre) ? myFlat(pre) : pre);
    return cur;
  }, []);
}

// 创建对象的方法
function createObj(age) {
  var obj = new Object();
  obj.name = "12";
  obj.age = age;
  return obj;
}

// 构造函数模式

function createObj2(age) {
  this.name = "123";
  this.age = age;
}

function createObj3() {}

createObj.prototype.name = "123";
createObj.prototype.getName = function () {};

function createObj4(name) {
  this.name = name;
}

createObj.prototype.getName = function () {};

// 原型链继承

function Parent1() {
  this.name = "1";
}

Parent1.prototype.getName = function () {};

function Child1(params) {}

Child1.prototype = new Parent1();

// 经典继承
function Parent2() {
  this.name = "1";
}

function Child2(params) {
  Parent2.call(this);
}

// 组合继承

function Parent3() {
  this.name = "1";
}

Parent3.prototype.getName = function () {};

function Child3(params) {
  Parent3.call(this);
}

Child3.prototype = new Parent3();
Child3.prototype.constructor = Child3;

// 原型式继承
function createObj4(obj) {
  function F(params) {}
  F.prototype = obj;
  return new F();
}
// 寄生式继承

function createObj5(obj) {
  var clone = Object.create(obj);
  clone.sayName = function () {};
  return clone;
}

// 寄生式组合继承

function Parent4() {
  this.name = "1";
}

Parent4.prototype.getName = function () {};

function Child4(params) {
  Parent3.call(this);
}

function F() {}

F.prototype = Parent4.prototype;

Child4.prototype = new F();
