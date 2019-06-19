# React Hook

## 简介

什么是Hook？

React官方给出的定义是：Hook可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

为何要使用它？

+ 组件之间复用状态逻辑很难：之前React 没有提供将可复用性行为“附加”到组件的途径，可以使用之后高级的东西，比如render prop 和高阶组件来解决这个问题，但同时也会带来“嵌套地狱”这个问题，而Hook 使你在无需修改组件结构的情况下复用状态逻辑。
+ 复杂组件变得难以理解：组件起初通常很简单，但逐渐会被状态逻辑和副作用充斥。每个生命周期常常包含一些不相关的逻辑。相互关联且需要对照修改的代码被进行了拆分，而完全不相关的代码却在同一个方法中组合在一起。而 Hook 将组件中相互关联的部分拆分成更小的函数（比如设置订阅或请求数据），而并非强制按照生命周期划分。
+ 难以理解的 class：class 是学习 React 的一大屏障，必须去理解 JavaScript 中 this 的工作方式，还不能忘记绑定事件处理器这将会使代码变得非常冗余。而 Hook 使你在非 class 的情况下可以使用更多的 React 特性。

## 概览

### State Hook

下面例子用来显示一个计数器。当你点击按钮，计数器的值就会增加

```jsx
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

useState 就是一个 Hook，通过在函数组件里调用它来给组件添加一些内部 state。React 会在重复渲染时保留这个 state。useState 会返回一对值：当前状态和一个让你更新它的函数，你可以在事件处理函数中或其他一些地方调用这个函数。它类似 class 组件的 this.setState，但是它不会把新的 state 和旧的 state 进行合并。

useState 唯一的参数就是初始 state。在上面的例子中，我们的计数器是从零开始的，所以初始 state 就是 0。值得注意的是，不同于 this.state，这里的 state 不一定要是一个对象，这个初始 state 参数只有在第一次渲染的会被用到。

#### 声明多个 state 变量

你可以在一个组件中多次使用 State Hook:

```js
function ExampleWithManyStates() {
  // 声明多个 state 变量！
  // 数组解构的语法让我们在调用 useState 时可以给 state 变量取不同的名字。
  const [age, setAge] = useState(42);
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
  // ...
}
```

#### 什么是Hook呢

Hook 是一些可以让你在函数组件里“钩入” React state 及生命周期等特性的函数。Hook 不能在 class 组件中使用 —— 这使得你不使用 class 也能使用 React。

### Effect Hook

在 React 组件中执行过数据获取、订阅或者手动修改过 DOM，我们统一把这些操作称为“副作用”，而会产生副作用的Hook，我们称他们为Effect Hook

useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途，只不过被合并成了一个 API。

例如，下面这个组件在 React 更新 DOM 后会设置一个页面标题：

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // 使用浏览器的 API 更新页面标题
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

当你调用 useEffect 时，就是在告诉 React 在完成对 DOM 的更改后运行你的“副作用”函数。由于副作用函数是在组件内声明的，所以它们可以访问到组件的 props 和 state。默认情况下，React 会在每次渲染后调用副作用函数 —— 包括**第一次**渲染的时候。

副作用函数还可以通过返回一个函数来指定如何“清除”副作用。例如，在下面的组件中使用副作用函数来订阅好友的在线状态，并通过取消订阅来进行清除操作：

```jsx
import React, { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);

    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

在这个示例中，React 会在组件销毁或者后续渲染重新执行副作用函数时取消对 ChatAPI 的订阅。

跟 useState 一样，你可以在组件中多次使用 useEffect ：

```jsx
function FriendStatusWithCounter(props) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }
  // ...
```

通过使用 Hook，你可以把组件内相关的副作用组织在一起（例如创建订阅及取消订阅），而不要把它们拆分到不同的生命周期函数里。

### Hook 使用规则

Hook 就是 JavaScript 函数，但是使用它们会有两个额外的规则：

+ 只能在函数最外层调用 Hook。不要在循环、条件判断或者子函数中调用。
+ 只能在 React 的函数组件中调用 Hook。不要在其他 JavaScript 函数中调用。

### 自定义 Hook

自定义 Hook 可以让你在不增加组件的情况下达到重用一些状态逻辑的目的。

前面，我们介绍了一个叫 FriendStatus 的组件，它通过调用 useState 和 useEffect 的 Hook 来订阅一个好友的在线状态。假设我们想在另一个组件里重用这个订阅逻辑。

首先，我们把这个逻辑抽取到一个叫做 useFriendStatus 的自定义 Hook 里：

```jsx
import React, { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```

它将 friendID 作为参数，并返回该好友是否在线：

现在我们可以在两个组件中使用它：

```jsx
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);

  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```

这两个组件的 state 是完全独立的。Hook 是一种复用状态逻辑的方式，它不复用 state 本身。事实上 Hook 的每次调用都有一个完全独立的 state ，因此你可以在单个组件中多次调用同一个自定义 Hook。如果函数的名字以 “use” 开头并调用其他 Hook，我们就说这是一个自定义 Hook。

### 其他 Hook

+ useContext 让你不使用组件嵌套就可以订阅 React 的 Context。
+ useReducer 可以让你通过 reducer 来管理组件本地的复杂 state。

## 使用 State Hook

### 声明 State 变量

在 class 中，我们通过在构造函数中设置 this.state 为 { count: 0 } 来初始化 count state 为 0：

```jsx
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }
```

在函数组件中，我们没有 this，所以我们不能分配或读取 this.state。我们直接在组件中调用 useState Hook：

```jsx
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 “count” 的 state 变量
  const [count, setCount] = useState(0);
}
```

**调用 useState 方法的时候做了什么?**它定义一个 “state 变量”。我们的变量叫 count， 但是我们可以叫他任何名字，比如 banana。这是一种在函数调用时保存变量的方式 —— useState 是一种新方法，它与 class 里面的 this.state 提供的功能完全相同。一般来说，在函数退出后变量就就会”消失”，而 state 中的变量会被 React 保留。

**useState 需要哪些参数？** useState() 方法里面唯一的参数就是初始 state。不同于 class 的是，我们可以按照需要使用数字或字符串对其进行赋值，而不一定是对象。在示例中，只需使用数字来记录用户点击次数，所以我们传了 0 作为变量的初始 state。（如果我们想要在 state 中存储两个不同的变量，只需调用 useState() 两次即可。）

**useState 方法的返回值是什么？** 返回值为：当前 state 以及更新 state 的函数。这就是我们写 const [count, setCount] = useState() 的原因。这与 class 里面 this.state.count 和 this.setState 类似，唯一区别就是你需要成对的获取它们。如果你不熟悉我们使用的语法，我们会在本章节的底部介绍它。

### 读取 State

当我们想在 class 中显示当前的 count，我们读取 this.state.count：

```jsx
  <p>You clicked {this.state.count} times</p>
```

在函数中，我们可以直接用 count:

```jsx
  <p>You clicked {count} times</p>
```

### 更新 State

在 class 中，我们需要调用 this.setState() 来更新 count 值：

```jsx
  <button onClick={() => this.setState({ count: this.state.count + 1 })}>
    Click me
  </button>
```

在函数中，我们已经有了 setCount 和 count 变量，所以我们不需要 this:

```jsx
  <button onClick={() => setCount(count + 1)}>
    Click me
  </button>
```

## 使用 Effect Hook

可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。在 React 组件中有两种常见副作用操作：需要清除的和不需要清除的。我们来更仔细地看一下他们之间的区别。

### 无需清除的 effect

有时候，我们只想在 React 更新 DOM 之后运行一些额外的代码。比如发送网络请求，手动变更 DOM，记录日志，这些都是常见的无需清除的操作。因为我们在执行完这些操作之后，就可以忽略他们了。让我们对比一下使用 class 和 Hook 都是怎么实现这些副作用的。

#### 使用 class 的示例

