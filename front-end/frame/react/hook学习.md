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

useState 就是一个 Hook，通过在函数组件里调用它来给组件添加一些内部 state。React 会在重复渲染时保留这个 state。useState 会返回一对值：当前状态和一个让你更新它的函数，你可以在事件处理函数中或其他一些地方调用这个函数。它类似 class 组件的 this.setState，但是**它不会把新的 state 和旧的 state 进行合并**。

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

### 自定义 Hook简介

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

在 React 的 class 组件中，render 函数是不应该有任何副作用的。一般把副作用操作放到 componentDidMount 和 componentDidUpdate 函数中。

```jsx
componentDidMount() {
    document.title = `You clicked ${this.state.count} times`;
  }

  componentDidUpdate() {
    document.title = `You clicked ${this.state.count} times`;
  }
```

可以看到这里我们需要在两个生命周期函数中编写重复的代码。

#### 使用Hook的示例

```jsx
function Example() {
  ...
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });
  ...
}
```

+ useEffect告诉 React 组件需要在渲染后执行某些操作。React 会保存你传递的函数，并且在执行 DOM 更新之后调用它。
+ useEffect 放在组件内部让我们可以在 effect 中直接访问 count state 变量（或其他 props）。
+ 第一次渲染之后和每次更新之后都会执行useEffect。

每次我们重新渲染，都会生成新的 effect，替换掉之前的。某种意义上讲，effect 更像是渲染结果的一部分 —— 每个 effect “属于”一次特定的渲染。

注意：与 componentDidMount 或 componentDidUpdate 不同，使用 **useEffect 调度的 effect 不会阻塞浏览器更新屏幕**，这让你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。在个别情况下（例如测量布局），有单独的 **useLayoutEffect** Hook 供你使用，其 API 与 useEffect 相同。

### 需要清除的 effect

有一些副作用是需要清除的。例如订阅外部数据源。这种情况下，清除工作是非常重要的，可以防止引起内存泄露

#### 使用 Class 的示例

在 React class 中，你通常会在 componentDidMount 中设置订阅，并在 componentWillUnmount 中清除它。

```js
componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  handleStatusChange(status) {
    this.setState({
      isOnline: status.isOnline
    });
  }
```

#### 使用 Hook 的示例

如果你的 effect 返回一个函数，React 将会在执行清除操作时调用它

```jsx
useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // Specify how to clean up after this effect:
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
```

+ 每个 effect 都可以返回一个清除函数。
+ React 会在组件卸载的时候执行清除操作。

### 使用 Effect 的提示

#### 使用多个 Effect 实现关注点分离

一个值的设置逻辑是可能被分割到 componentDidMount 和 componentDidUpdate 中的，另一个逻辑可能被分割到 componentDidMount 和 componentWillUnmount 中的。这样 componentDidMount 中同时包含了两个不同功能的代码。

Hook 允许我们按照代码的用途分离他们， 而不是像生命周期函数那样。React 将按照 effect 声明的顺序依次调用组件中的每一个 effect。

#### 解释: 为什么每次更新的时候都要运行 Effect

忘记正确地处理 componentDidUpdate 是 React 应用中常见的 bug 来源。

并不需要特定的代码来处理更新逻辑，因为 useEffect 默认就会处理。它会在调用一个新的 effect 之前对前一个 effect 进行清理。

下面就是上面按时间列出一个可能会产生的订阅和取消订阅操作调用序列：

```jsx
// Mount with { friend: { id: 100 } } props
ChatAPI.subscribeToFriendStatus(100, handleStatusChange);     // 运行第一个 effect

// Update with { friend: { id: 200 } } props
ChatAPI.unsubscribeFromFriendStatus(100, handleStatusChange); // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(200, handleStatusChange);     // 运行下一个 effect

// Update with { friend: { id: 300 } } props
ChatAPI.unsubscribeFromFriendStatus(200, handleStatusChange); // 清除上一个 effect
ChatAPI.subscribeToFriendStatus(300, handleStatusChange);     // 运行下一个 effect

// Unmount
ChatAPI.unsubscribeFromFriendStatus(300, handleStatusChange); // 清除最后一个 effect
```

#### 提示: 通过跳过 Effect 进行性能优化

在某些情况下，每次渲染后都执行清理或者执行 effect 可能会导致性能问题。在 class 组件中，我们可以通过在 componentDidUpdate 中添加对 prevProps 或 prevState 的比较逻辑解决：

```jsx
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    document.title = `You clicked ${this.state.count} times`;
  }
}
```

所以在 useEffect 的 Hook API中，如果某些特定值在两次重渲染之间没有发生变化，你可以通知 React 跳过对 effect 的调用，只要传递数组作为 useEffect 的第二个可选参数即可：

```jsx
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```

注意：如果数组中有多个元素，即使只有一个元素发生变化，React 也会执行 effect。

对于有清除操作的 effect 同样适用：

```jsx
useEffect(() => {
  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
  };
}, [props.friend.id]); // 仅在 props.friend.id 发生变化时，重新订阅
```

注意：

+ 如果你要使用此优化方式，请确保数组中包含了所有外部作用域中会随时间变化并且在 effect 中使用的变量，否则你的代码会引用到先前渲染中的旧变量。
+ 如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（[]）作为第二个参数。这就告诉 React 你的 effect 不依赖于 props 或 state 中的任何值，所以它永远都不需要重复执行。
+ 如果你传入了一个空数组（[]），effect 内部的 props 和 state 就会一直拥有其初始值。尽管传入 [] 作为第二个参数更接近大家更熟悉的 componentDidMount 和 componentWillUnmount 思维模式，但我们有更好的方式来避免过于频繁的重复调用 effect。

## Hook 规则

### 只在最顶层使用 Hook

不要在循环，条件或嵌套函数中调用 Hook， 确保总是在你的 React 函数的最顶层调用他们。遵守这条规则，你就能确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。

### 只在 React 函数中调用 Hook

不要在普通的 JavaScript 函数中调用 Hook。你可以：

+ ✅ 在 React 的函数组件中调用 Hook
+ ✅ 在自定义 Hook 中调用其他 Hook

可以使用 `eslint-plugin-react-hooks` 的插件来执行这两条规则，具体可以查看npm官网。

### Hook的一些说明

React 靠的是 Hook 调用的顺序来知道哪个 state 对应哪个 useState。
只要 Hook 的调用顺序在多次渲染之间保持一致，React 就能正确地将内部 state 和对应的 Hook 进行关联。

如果将Hook放在条件语句中，顺序可能会发生改变，导致后面的 Hook 调用都被提前执行，产生bug，这就是为什么 Hook 需要在我们组件的最顶层调用。

## 自定义 Hook

### 提取自定义 Hook

当我们想在两个函数之间共享逻辑时，我们会把它提取到第三个函数中。而组件和 Hook 都是函数，所以也同样适用这种方式。

自定义 Hook 是一个函数，其名称以 “use” 开头，函数内部可以调用其他的 Hook。 例如，下面的 useFriendStatus 是我们第一个自定义的 Hook:

```jsx
import React, { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```

与组件中一致，请确保只在自定义 Hook 的顶层无条件地调用其他 Hook。与 React 组件不同的是，自定义 Hook 不需要具有特殊的标识。我们可以自由的决定它的参数是什么，以及它应该返回什么（如果需要的话）。换句话说，它就像一个正常的函数。但是它的名字应该始终以 use 开头。

### 使用自定义 Hook

我们一开始的目标是在 FriendStatus 和 FriendListItem 组件中去除重复的逻辑，即：这两个组件都想知道好友是否在线。

现在我们已经把这个逻辑提取到 useFriendStatus 的自定义 Hook 中，然后就可以使用它了：

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

+ 自定义 Hook 必须以 “use” 开头
+ 在两个组件中使用相同的 Hook 不会共享 state
+ 每次调用 Hook，它都会获取独立的 state。

#### 提示：在多个 Hook 之间传递信息

由于 Hook 本身就是函数，因此我们可以在它们之间传递信息。

我们将使用聊天程序中的另一个组件来说明这一点。这是一个聊天消息接收者的选择器，它会显示当前选定的好友是否在线:

```jsx
const friendList = [
  { id: 1, name: 'Phoebe' },
  { id: 2, name: 'Rachel' },
  { id: 3, name: 'Ross' },
];

function ChatRecipientPicker() {
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);

  return (
    <>
      <Circle color={isRecipientOnline ? 'green' : 'red'} />
      <select
        value={recipientID}
        onChange={e => setRecipientID(Number(e.target.value))}
      >
        {friendList.map(friend => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </>
  );
}
```

我们将当前选择的好友 ID 保存在 recipientID 状态变量中，并在用户从 `<select>` 中选择其他好友时更新这个 state。

由于 useState 为我们提供了 recipientID 状态变量的最新值，因此我们可以将它作为参数传递给自定义的 useFriendStatus Hook：

```js
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);
```

如此可以让我们知道当前选中的好友是否在线。当我们选择不同的好友并更新 recipientID 状态变量时，useFriendStatusHook 将会取消订阅之前选中的好友，并订阅新选中的好友状态。

### useYourImagination()

尽量避免过早地增加抽象逻辑。既然函数组件能够做的更多，那么代码库中函数组件的代码行数可能会剧增。这属于正常现象 —— 不必立即将它们拆分为 Hook。

例如，有个复杂的组件，其中包含了大量以特殊的方式来管理的内部状态。useState 并不会使得集中更新逻辑变得容易，因此你可能更愿意使用 redux 中的 reducer 来编写。

编写一个 useReducer 的 Hook，使用 reducer 的方式来管理组件的内部 state 呢？其简化版本可能如下所示：

```jsx
function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);

  function dispatch(action) {
    const nextState = reducer(state, action);
    setState(nextState);
  }

  return [state, dispatch];
}
// 在组件中使用它，让 reducer 驱动它管理 state：

function Todos() {
  const [todos, dispatch] = useReducer(todosReducer, []);

  function handleAddClick(text) {
    dispatch({ type: 'add', text });
  }

  // ...
}
```

在复杂组件中使用 reducer 管理内部 state 的需求很常见，我们已经将 useReducer 的 Hook 内置到 React 中。你可以在 Hook API 索引中找到它使用，搭配其他内置的 Hook 一起使用。

## Hook API

[Hook API](https://zh-hans.reactjs.org/docs/hooks-reference.html)

### useState

#### 函数式更新

如果新的 state 需要通过使用先前的 state 计算得出，那么可以将函数传递给 setState。该函数将接收先前的 state，并返回一个更新后的值。下面的计数器组件示例展示了 setState 的两种用法：

```jsx
function Counter({initialCount}) {
  const [count, setCount] = useState(initialCount);
  return (
    <>
      Count: {count}
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
    </>
  );
}
```

#### 惰性初始 state

initialState 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用：

```jsx
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});
```

#### 跳过 state 更新

调用 State Hook 的更新函数并传入当前的 state 时，React 将跳过子组件的渲染及 effect 的执行。（React 使用 Object.is 比较算法 来比较 state。）

需要注意的是，React 可能仍需要在跳过渲染前渲染该组件。不过由于 React 不会对组件树的“深层”节点进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用 useMemo 来进行优化。

### useEffect

在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志以及执行其他包含副作用的操作都是不被允许的

使用 useEffect 完成副作用操作。赋值给 useEffect 的函数会在组件渲染到屏幕之后执行。

如果组件多次渲染（通常如此），则在执行下一个 effect 之前，上一个 effect 就已被清除。在上述示例中，意味着组件的每一次更新都会创建新的订阅。

#### effect 的执行时机

在浏览器完成布局与绘制之后，传给 useEffect 的函数会延迟调用。因此不应在函数中执行阻塞浏览器更新屏幕的操作。

然而，并非所有 effect 都可以被延迟执行。例如，在浏览器执行下一次绘制前，用户可见的 DOM 变更就必须同步执行，这样用户才不会感觉到视觉上的不一致。React 为此提供了一个额外的 useLayoutEffect Hook 来处理这类 effect。

虽然 useEffect 会在浏览器绘制后延迟执行，但会保证在任何新的渲染前执行。

#### effect 的条件执行

默认情况下，effect 会在每轮组件渲染完成后执行。这样的话，一旦 effect 的依赖发生变化，它就会被重新创建。

仅需要在 source props 改变时重新创建。要实现这一点，可以给 useEffect 传递第二个参数，它是 effect 所依赖的值数组。

如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（[]）作为第二个参数。
如果你传入了一个空数组（[]），effect 内部的 props 和 state 就会一直拥有其初始值。

### useContext

接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值。

调用了 useContext 的组件总会在 context 值变化时重新渲染。如果重渲染组件的开销较大，你可以 通过使用 memoization 来优化。

### useReducer

在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。并且，使用 useReducer 还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递 dispatch 而不是回调函数 。

#### 指定初始 state

将初始 state 作为第二个参数传入 useReducer 是最简单的方法：

```jsx
  const [state, dispatch] = useReducer(
    reducer,
    {count: initialCount}
  );
```

#### 惰性初始化

你可以选择惰性地创建初始 state。为此，需要将 init 函数作为 useReducer 的第三个参数传入，这样初始 state 将被设置为 init(initialArg)。

这么做可以将用于计算 state 的逻辑提取到 reducer 外部，这也为将来对重置 state 的 action 做处理提供了便利：

```jsx
function init(initialCount) {
  return {count: initialCount};
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>

        Reset
      </button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  );
}
```

### useCallback

返回一个 memoized 回调**函数**。

useCallback(fn, deps) 相当于 useMemo(() => fn, deps)。

### useMemo

返回一个 memoized 值。请不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于 useEffect 的适用范畴，而不是 useMemo。

### useRef

useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内保持不变。

你应该熟悉 ref 这一种访问 DOM 的主要方式。如果你将 ref 对象以 `<div ref={myRef} />` 形式传入组件，则无论该节点如何改变，React 都会将 ref 对象的 .current 属性设置为相应的 DOM 节点。

useRef() 比 ref 属性更有用。它可以很方便地保存**任何可变值**，其类似于在 class 中使用实例字段的方式。

当 ref 对象内容发生变化时，useRef 并不会通知你。变更 .current 属性不会引发组件重新渲染。如果想要在 React 绑定或解绑 DOM 节点的 ref 时运行某些代码，则需要使用[回调 ref](https://zh-hans.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node) 来实现。

### useImperativeHandle

useImperativeHandle 应当与 forwardRef 一起使用

### useLayoutEffect

其函数签名与 useEffect 相同，但它会在所有的 DOM 变更之后同步调用 effect。可以使用它来读取 DOM 布局并同步触发重渲染。在浏览器执行绘制之前，useLayoutEffect 内部的更新计划将被同步刷新。

## FAQ

[Hook FAQ](https://zh-hans.reactjs.org/docs/hooks-faq.html)

### 从 Class 迁移到 Hook

生命周期方法要如何对应到 Hook？

+ constructor：函数组件不需要构造函数。你可以通过调用 useState 来初始化 state。如果计算的代价比较昂贵，你可以传一个函数给 useState。
+ getDerivedStateFromProps：改为 在渲染时 安排一次更新。
+ shouldComponentUpdate：详见React.memo.
+ render：这是函数组件体本身。
+ componentDidMount, componentDidUpdate, componentWillUnmount：useEffect Hook 可以表达所有这些(包括 不那么 常见 的场景)的组合。
+ componentDidCatch and getDerivedStateFromError：目前还没有这些方法的 Hook 等价写法，但很快会加上。

我该如何使用 Hook 进行数据获取？

该 [demo](https://codesandbox.io/s/jvvkoo8pq3) 会帮助你开始理解,欲了解更多，请查阅 [此文章](https://www.robinwieruch.de/react-hooks-fetch-data/) 来了解如何使用 Hook 进行数据获取。

### 我应该使用单个还是多个 state 变量

我们推荐把 state 切分成多个 state 变量，每个变量包含的不同值会在同时发生变化。

把独立的 state 变量拆分开还有另外的好处。这使得后期把一些相关的逻辑抽取到一个自定义 Hook 变得容易，比如说:

```jsx
func tion Box() {
  const position = useWindowPosition();
  const [size, setSize] = useState({ width: 100, height: 100 });
  // ...
}

function useWindowPosition() {
  const [position, setPosition] = useState({ left: 0, top: 0 });
  useEffect(() => {
    // ...
  }, []);
  return position;
}
```

如果 state 的逻辑开始变得复杂，我们推荐 用 reducer 来管理它，或使用自定义 Hook。

### 如何获取上一轮的 props 或 state

关键在于useEffect最后执行，usePrevious执行时先返回ref.current，第一次会返回undefined，然后再通过useEffect赋值。

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  return <h1>Now: {count}, before: {prevCount}</h1>;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

### 为什么我会在我的函数中看到陈旧的 props 和 state
