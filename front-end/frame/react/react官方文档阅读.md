# React官方文档阅读

## 元素渲染

更新 UI 唯一的方式是创建一个全新的元素，并将其传入 ReactDOM.render()。

## 组件&Props

组件名称必须以大写字母开头。React 会将以小写字母开头的组件视为原生 DOM 标签。例如，`<div />`代表 HTML 的 div 标签，而 `<Welcome />` 则代表一个组件，并且需在作用域内使用 Welcome。
所有 React 组件都必须像纯函数一样保护它们的 props 不被更改。

## State & 生命周期

State 的更新可能是异步的

因为 this.props 和 this.state 可能会异步更新，所以你不要依赖他们的值来更新下一个状态。

```js
// Correct
this.setState((state, props) => ({
  counter: state.counter + props.increment
}));
```

## 事件处理

+ React 事件的命名采用小驼峰式（camelCase），而不是纯小写。
+ 使用 JSX 语法时你需要传入一个函数作为事件处理函数，而不是一个字符串。

在 JavaScript 中，class 的方法默认不会绑定 this。如果你忘记绑定 this.handleClick 并把它传入了 onClick，当你调用这个函数的时候 this 的值为 undefined。

```js
constructor(props) {
  super(props);
  this.state = {isToggleOn: true};

  // 为了在回调中使用 `this`，这个绑定是必不可少的
  this.handleClick = this.handleClick.bind(this);
}
```

如果觉得使用 bind 很麻烦，这里有两种方式可以解决。

```js
handleClick = () => {
  console.log('this is:', this);
}
//或者

render() {
    // 此语法确保 `handleClick` 内的 `this` 已被绑定。
    return (
      <button onClick={(e) => this.handleClick(e)}>
        Click me
      </button>
    );
  }
```

在循环中，通常我们会为事件处理函数传递额外的参数。例如，若 id 是你要删除那一行的 ID，以下两种方式都可以向事件处理函数传递参数：

```js
<button onClick={(e) => this.deleteRow(id, e)}>Delete Row</button>
<button onClick={this.deleteRow.bind(this, id)}>Delete Row</button>
```

## 条件渲染

### 与运算符 &&

通过花括号包裹代码，你可以在 JSX 中嵌入任何表达式。这也包括 JavaScript 中的逻辑与 (&&) 运算符。它可以很方便地进行元素的条件渲染。

```jsx
return (
  <div>
    <h1>Hello!</h1>
    {unreadMessages.length > 0 &&
      <h2>
        You have {unreadMessages.length} unread messages.
      </h2>
    }
  </div>
);
```

之所以能这样做，是因为在 JavaScript 中，true && expression 总是会返回 expression, 而 false && expression 总是会返回 false。

### 阻止组件渲染

可以让 render 方法直接返回 null，而不进行任何渲染。注意：在组件的 render 方法中返回 null 并不会影响组件的生命周期。

## 列表 & Keys

使用map()来将数组转化为元素

Keys 帮助 React 识别哪些元素改变了，比如被添加或删除。因此你应当给数组中的每一个元素赋予一个确定的标识。当元素没有确定 id 的时候，万不得已你可以使用元素索引 index 作为 key，但是不推荐。

一个好的经验法则是：在 map() 方法中的元素需要设置 keys 属性。

```jsx
const listItems = numbers.map((number) =>
  // 正确！key 应该在数组的上下文中被指定
  <ListItem key={number.toString()}
            value={number} />
);
```

如果一个 map() 嵌套了太多层级，那可能就是你提取组件的一个好时机。

## 表单

### 受控组件

简单来说就是为表单元素，input、select、textarea等的value绑定state，然后监听其变化事件，然后在事件中拿到新的值并通过setState来更新对应的value。

## 状态提升

也就是在父组件中将子组件中希望公用的属性通过state声明，并通过props传给子组件，同时把改变这些props的方法也传递给子组件，在子组件中这些值的变化方法中调用。

## 组合&继承

推荐组合

### 包含关系

类似于Vue中的slot，react中可以使用一个特殊的 children prop 来将他们的子组件传递到渲染结果中：

```jsx
function FancyBorder(props) {
  return (
    <div className={'FancyBorder FancyBorder-' + props.color}>
      {props.children}
    </div>
  );
}

function WelcomeDialog() {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">
        Welcome
      </h1>
      <p className="Dialog-message">
        Thank you for visiting our spacecraft!
      </p>
    </FancyBorder>
  );
}
```

对应于Vue中的具名插槽，在React中，你可能需要在一个组件中预留出几个“洞”。这种情况下，我们可以不使用 children，而是自行约定：将所需内容传入 props，并使用相应的 prop。

```jsx
function SplitPane(props) {
  return (
    <div className="SplitPane">
      <div className="SplitPane-left">
        {props.left}
      </div>
      <div className="SplitPane-right">
        {props.right}
      </div>
    </div>
  );
}

function App() {
  return (
    <SplitPane
      left={
        <Contacts />
      }
      right={
        <Chat />
      } />
  );
}
```

## React 哲学

+ 将设计好的 UI 划分为组件层级，一个组件原则上只能负责一个功能，JSON 数据模型的层级结构也是一个参考
+ 用 React 创建一个静态版本，先用已有的数据模型渲染一个不包含交互功能的 UI。在构建应用的静态版本时，完全不应该使用 state 构建静态版本。state 代表了随时间会产生变化的数据，应当仅在实现交互时使用。所以构建应用的静态版本时，你不会用到它。可以自上而下或者自下而上构建应用
+ 确定 UI state 的最小（且完整）表示，通过 state 来完成触发基础数据模型改变，只保留应用所需的可变 state 的最小集合，其他数据均由它们计算产生。通过问自己以下三个问题，你可以逐个检查相应数据是否属于 state：
  + 该数据是否是由父组件通过 props 传递而来的？如果是，那它应该不是 state。
  + 该数据是否随时间的推移而保持不变？如果是，那它应该也不是 state。
  + 你能否根据其他 state 或 props 计算出该数据的值？如果是，那它也不是 state。
+ 确定 state 放置的位置，需要确定哪个组件能够改变这些 state，或者说拥有这些 state。React 中的数据流是单向的，哪个组件应该拥有某个 state 这件事，可以尝试通过以下步骤来判断：
  + 找到根据这个 state 进行渲染的所有组件。
  + 找到他们的共同所有者（common owner）组件（在组件层级上高于所有需要该 state 的组件）。
  + 该共同所有者组件或者比它层级更高的组件应该拥有该 state。
  + 如果你找不到一个合适的位置来存放该 state，就可以直接创建一个新的组件来存放该 state，并将这一新组件置于高于共同所有者组件层级的位置。
+ 添加反向数据流，也就是父组件必须将一个能够触发 state 改变的回调函数（callback）传递给子组件。

## 代码分割

### React.lazy、Suspense、异常捕获边界（Error boundaries）

[中文官网文档](https://zh-hans.reactjs.org/docs/code-splitting.html#reactlazy)

## Context

在一个典型的 React 应用中，数据是通过 props 属性自上而下（由父及子）进行传递的，但这种做法对于某些类型的属性而言是极其繁琐的，Context 提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递 props。

注意：Context 设计目的是为了共享那些**对于一个组件树而言是“全局”**的数据。

使用：

```jsx
// Context 可以让我们无须明确地传遍每一个组件，就能将值深入传递进组件树。
// 为当前的 theme 创建一个 context（“light”为默认值）。
const ThemeContext = React.createContext('light');
class App extends React.Component {
  render() {
    // 使用一个 Provider 来将当前的 theme 传递给以下的组件树。
    // 无论多深，任何组件都能读取这个值。
    // 在这个例子中，我们将 “dark” 作为当前的值传递下去。
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

// 中间的组件再也不必指明往下传递 theme 了。
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Component {
  // 指定 contextType 读取当前的 theme context。
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  // 在这个例子中，当前的 theme 值为 “dark”。
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```

其余可参看[中文官方文档](https://zh-hans.reactjs.org/docs/context.html)

## Fragments

Fragments 允许你将子列表分组，而无需向 DOM 添加额外节点。类似与Vue中的template。

```jsx
class Columns extends React.Component {
  render() {
    return (
      <React.Fragment>
        <td>Hello</td>
        <td>World</td>
      </React.Fragment>
    );
  }
}
```

## 高阶组件

a higher-order component is a function that takes a component and returns a new component.
高阶组件是一个接受一个组件并返回一个新组件的函数，的函数。它是为了复用组件逻辑，在React第三方组件库里很常见，比如Redux中的connect。

HOC是纯函数，没有副作用。

不应该在高阶组件中修改传入组件的原型，并且应该过滤掉一些不相关的属性。

当一些函数的输出类型跟输入类型相同时它们就很容易组合在一起，比如connect跟withRouter，它们都接收一个组件参数，并且返回组件，这样就可以组合使用。`withRouter(connect(commentSelector)(WrappedComponent))`

可以给高阶组件返回的组件使用Display Name，来方便调试。

```jsx
function withSubscription(WrappedComponent) {
  class WithSubscription extends React.Component {/* ... */}
  WithSubscription.displayName = `WithSubscription(${getDisplayName(WrappedComponent)})`;
  return WithSubscription;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
```

注意事项：

+ 不要在Render中使用高阶组件，因为React是根据渲染前后组件是否相同，来决定是否diff比较然后更新的，如果不同会直接卸载，而高阶组件会返回一个新的组件。
+ 原组件上的静态方法应该复制才能在新组件中继续使用。
  + `Enhance.staticMethod = WrappedComponent.staticMethod;`
  + 使用hoist-non-react-statics来自动复制非React的静态方法
  + 还有一种方法就是把静态方法从组件中分离出来，单独导出
+ Refs不会传递，Refs将会指向最外层容器组件的实例而不是原始组件，想要解决的话可以使用Refs分发。

## 异常捕获边界

React16后增加了错误边界，错误边界指的是定义了static getDerivedStateFromError（）或componentDidCatch（）或两个都有的组件，static getDerivedStateFromError（）用于抛错后返回fallback UI，componentDidCatch（）用于打错误日志。

但是它不能捕获事件处理函数中的错误，如果要捕获还是使用try/catch，以及异步代码和ssr的错误。

推荐使用它们来包裹自己的组件，这样用户体验上会更好，只是一块地方报错并显示错误UI，而不至于整个app崩掉。

## Refs转发

Ref forwarding是一种将ref自动传递给组件的子组件的技术。

组件间相互引用的过程中，尽量地不要去依赖对方的DOM结构

```jsx
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 假如你没有通过 React.createRef的赋能，在function component上你是不可以直接挂载ref属性的。
// 而现在你可以这么做了，并能访问到原生的DOM元素:
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```

下面我们逐步逐步地来解释一下上面所说的是如何发生的：

1. 我们通过调用React.createRef来生成了一个React ref，并且把它赋值给了ref变量。
2. 我们通过手动赋值给`<FancyButton>`的ref属性进一步将这个React ref传递下去。
3. 接着，React又将ref传递给React.forwardRef()调用时传递进来的函数(props, ref) => ...。届时，ref将作为这个函数的第二个参数。
在(props, ref) => ...组件的内部，我们又将这个ref
4. 传递给了作为UI输出一部分的`<button ref={ref}>`组件。
5. 当`<button ref={ref}>`组件被真正地挂载到页面的时候，我们就可以在使用ref.current来访问真正的DOM元素button了。

注意：只有通过React.forwardRef定义的组件才能接收ref参数，并且这个方法不限于将ref传给dom组件，传给类组件实例也是可以的。

### 高阶组件里的Forwarding refs

```jsx
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      // Assign the custom prop "forwardedRef" as a ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }

  // Note the second param "ref" provided by React.forwardRef.
  // We can pass it along to LogProps as a regular prop, e.g. "forwardedRef"
  // And it can then be attached to the Component.
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```

### DevTools里面显示一个自定义的名字

```jsx
function logProps(Component) {
  class LogProps extends React.Component {
    // ...
  }

  function forwardRef(props, ref) {
    return <LogProps {...props} forwardedRef={ref} />;
  }

  // Give this component a more helpful display name in DevTools.
  // e.g. "ForwardRef(logProps(MyComponent))"
  const name = Component.displayName || Component.name;
  forwardRef.displayName = `logProps(${name})`;

  return React.forwardRef(forwardRef);
}
```

## 深入JSX

### React 必须在作用域内

由于 JSX 会编译为 React.createElement 调用形式，所以 React 库也必须包含在 JSX 代码作用域内。

### 在 JSX 类型中使用点语法

当你在一个模块中导出许多 React 组件时，这会非常方便。例如，如果 MyComponents.DatePicker 是一个组件，你可以在 JSX 中直接使用：

```jsx
import React from 'react';

const MyComponents = {
  DatePicker: function DatePicker(props) {
    return <div>Imagine a {props.color} datepicker here.</div>;
  }
}

function BlueDatePicker() {
  return <MyComponents.DatePicker color="blue" />;
}
```

### 用户定义的组件必须以大写字母开头

### 在运行时选择类型

你不能将通用表达式作为 React 元素类型。如果你想通过通用表达式来（动态）决定元素类型，你需要首先将它赋值给大写字母开头的变量。这通常用于根据 prop 来渲染不同组件的情况下:

```jsx
import React from 'react';
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  // 正确！JSX 类型可以是大写字母开头的变量。
  const SpecificStory = components[props.storyType];
  return <SpecificStory story={props.story} />;

  // 错误！JSX 类型不能是一个表达式。
  // return <components[props.storyType] story={props.story} />;
}
```

### JSX 中的 Props

有多种方式可以在 JSX 中指定 props。

#### JavaScript 表达式作为 Props

```jsx
// 包裹在 {} 中的 JavaScript 表达式作为一个 prop
<MyComponent foo={1 + 2 + 3 + 4} />
```

#### 字符串字面量

```jsx
<MyComponent message="hello world" />

<MyComponent message={'hello world'} />
```

当你将字符串字面量赋值给 prop 时，它的值是未转义的。

#### Props 默认值为 “True”

#### 属性展开

```jsx
function App1() {
  return <Greeting firstName="Ben" lastName="Hector" />;
}

function App2() {
  const props = {firstName: 'Ben', lastName: 'Hector'};
  return <Greeting {...props} />;
}
```

### JSX 中的子元素

包含在开始和结束标签之间的 JSX 表达式内容将作为特定属性 props.children 传递给外层组件。

有几种不同的方法来传递子元素：

1. 字符串字面量`<MyComponent>Hello world!</MyComponent>`
2. JSX 子元素
3. JavaScript 表达式作为子元素`<MyComponent>{'foo'}</MyComponent>`
4. 函数作为子元素
5. 布尔类型、Null 以及 Undefined 将会忽略

## Portals

Portals 提供了一种将子节点渲染到父组件DOM层次以外的 DOM 节点的方式。`ReactDOM.createPortal(child, container)`，第一个参数就是任何一个可渲染的React组件，第二个是DOM元素。

一般的当从render函数返回元素时，会作为子元素挂载到最近父元素的DOM中，Portals可以让你挂载到任意一个有效的DOM中。在编写一些对话框，小提示，悬浮卡的时候很有用。

关于 Portals 事件冒泡：不论portal被具体挂载到何处，它其他行为跟普通组件一致，比如将A组件挂载到了1号dom，但是B组件中引用了A组件，然后将B组件挂载到2号dom，那么事件具体捕获的时候实在2号dom中进行。

## Refs and the DOM

Refs 允许我们访问 DOM 节点或在 render 方法中创建的 React 元素。

### 何时使用 Refs

+ 管理焦点，文本选择或媒体播放。
+ 触发强制动画。
+ 集成第三方 DOM 库。

避免使用 refs 来做任何可以通过声明式实现来完成的事情。举个例子，避免在 Dialog 组件里暴露 open() 和 close() 方法，最好传递 isOpen 属性。**勿过度使用 Refs**。

[Refs](https://zh-hans.reactjs.org/docs/refs-and-the-dom.html)

## Render Props

render prop 是一个用于告知组件需要渲染什么内容的函数 prop。

```jsx
<Mouse render={mouse => (
  <Cat mouse={mouse} />
)}/>

// 在Mouse中
render() {
  return (
    <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>

      {/*
        Instead of providing a static representation of what <Mouse> renders,
        use the `render` prop to dynamically determine what to render.
      */}
      {this.props.render(this.state)}
    </div>
  );
}
```

可以使用带有 render prop 的常规组件来实现大多数高阶组件 (HOC)。

```jsx
// 如果你出于某种原因真的想要 HOC，那么你可以轻松实现
// 使用具有 render prop 的普通组件创建一个！
function withMouse(Component) {
  return class extends React.Component {
    render() {
      return (
        <Mouse render={mouse => (
          <Component {...this.props} mouse={mouse} />
        )}/>
      );
    }
  }
}
```

事实上， 任何被用于告知组件需要渲染什么内容的函数 prop 在技术上都可以被称为 “render prop”.

```jsx
<Mouse children={mouse => (
  <p>鼠标的位置是 {mouse.x}，{mouse.y}</p>
)}/>

//也可以直接放置到元素的内部！
<Mouse>
  {mouse => (
    <p>鼠标的位置是 {mouse.x}，{mouse.y}</p>
  )}
</Mouse>
```

注意：将 Render Props 与 React.PureComponent 一起使用时， render prop 会抵消使用 React.PureComponent 带来的优势。因为浅比较 props 的时候总会得到 false，并且在这种情况下每一个 render 对于 render prop 将会生成一个新的值。为了绕过这一问题，有时你可以定义一个 prop 作为实例方法。

## 非受控组件

推荐使用 受控组件 来处理表单数据，这时表单数据由 React 组件来管理，非受控组件表单数据将交由 DOM 节点来处理。

要编写一个非受控组件，而不是为每个状态更新都编写数据处理函数，你可以 使用 ref 来从 DOM 节点中获取表单数据。

如果你还是不清楚在某个特殊场景中应该使用哪种组件，那么 [这篇关于受控和非受控输入组件的文章](https://goshakkk.name/controlled-vs-uncontrolled-inputs-react/) 会很有帮助。

在 React 渲染生命周期时，表单元素上的 value 将会覆盖 DOM 节点中的值，在非受控组件中，你经常希望 React 能赋予组件一个初始值，但是不去控制后续的更新。 在这种情况下, 你可以指定一个 **defaultValue** 属性，而不是 value。

在 React 中，`<input type="file" />` 始终是一个非受控组件
