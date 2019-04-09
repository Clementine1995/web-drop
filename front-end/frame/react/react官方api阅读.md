# React官方API阅读

## React概览

### 组件

以通过子类 React.Component 或 React.PureComponent 来定义 React 组件。React 组件也可以被定义为可被包装的函数：React.memo

#### React.Component

```jsx
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

#### React.PureComponent

React.Component 并未实现 shouldComponentUpdate()，而 React.PureComponent 中以浅层对比 prop 和 state 的方式来实现了该函数。如果对象中包含复杂的数据结构，则有可能因为无法检查深层的差别，产生错误的比对结果。仅在你的 props 和 state 较为简单时，才使用 React.PureComponent，或者在深层数据结构发生变化时调用 forceUpdate() 来确保组件被正确地更新。

此外，React.PureComponent 中的 shouldComponentUpdate() 将跳过所有子组件树的 prop 更新。因此，请确保所有子组件也都是“纯”的组件。

#### React.memo

```jsx
const MyComponent = React.memo(function MyComponent(props) {
  /* 使用 props 渲染 */
});
```

React.memo 为高阶组件。适用于函数组件，但不适用于 class 组件。如果你的函数组件在给定相同 props 的情况下渲染相同的结果，那么你可以通过将其包装在 React.memo 中调用。

默认情况下其只会对复杂对象做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。

```jsx
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
}
export default React.memo(MyComponent, areEqual);
```

注意：此方法仅作为性能优化的方式而存在。但请不要依赖它来“阻止”渲染，因为这会产生 bug。与 class 组件中 shouldComponentUpdate() 方法不同的是，如果 props 相等，areEqual 会返回 true；如果 props 不相等，则返回 false。这与 shouldComponentUpdate 方法的返回值相反。

### 创建 React 元素

我们建议使用 JSX 来编写你的 UI 组件。每个 JSX 元素都是调用 React.createElement() 的语法糖。

### 转换元素

+ cloneElement()
+ isValidElement() 验证对象是否为 React 元素，返回值为 true 或 false。
+ React.Children

#### cloneElement()

```js
React.cloneElement(
  element,
  [props],
  [...children]
)
```

以 element 元素为样板克隆并返回新的 React 元素。返回元素的 props 是将新的 props 与原始元素的 props 浅层合并后的结果。新的子元素将取代现有的子元素，而来自原始元素的 key 和 ref 将被保留。

React.cloneElement() 几乎等同于：`<element.type {...element.props} {...props}>{children}</element.type>`

但是，这也保留了组件的 ref。这意味着当通过 ref 获取子节点时，你将不会意外地从你祖先节点上窃取它。相同的 ref 将添加到克隆后的新元素中。

#### React.Children

React.Children 提供了用于处理 this.props.children 不透明数据结构的实用方法

1.React.Children.map

语法：`React.Children.map(children, function[(thisArg)])`，在 children 里的每个直接子节点上调用一个函数，并将 this 设置为 thisArg。如果 children 是一个数组，它将被遍历并为数组中的每个子节点调用该函数。

2.React.Children.forEach

语法：`React.Children.forEach(children, function[(thisArg)])`，与 React.Children.map() 类似，但它不会返回一个数组。

3.React.Children.count

语法：`React.Children.count(children)`，返回 children 中的组件总数量，等同于通过 map 或 forEach 调用回调函数的次数。

4.React.Children.only

语法：`React.Children.only(children)`，它应该接收React元素而不是数组

5.React.Children.toArray

语法：`React.Children.toArray(children)`，将 children 这个复杂的数据结构以数组的方式扁平展开并返回，并为每个子节点分配一个 key。当你想要在向下传递 this.props.children 之前对内容重新排序或获取子集时，可以考虑使用它。

### Fragments

React 还提供了用于减少不必要嵌套的组件。

### Refs

#### React.createRef

#### React.forwardRef

React.forwardRef 会创建一个React组件，这个组件能够将其接受的 ref 属性转发到其组件树下的另一个组件中。具体可以参考[Refs转发](https://zh-hans.reactjs.org/docs/forwarding-refs.html)

### Suspense

### Hook

## Component

React 的组件可以定义为 class 或函数的形式。如需定义 class 组件，需要继承 React.Component，在 React.Component 的子类中有个必须定义的 render() 函数。

### 组件的生命周期

以使用此[生命周期图谱](http://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)作为速查表

### render()

render 被调用时，它会检查 this.props 和 this.state 的变化并返回以下类型之一：

+ React 元素。通常通过 JSX 创建。
+ 数组或 fragments。使得 render 方法可以返回多个元素。
+ Portals。可以渲染子节点到不同的 DOM 子树中。
+ 字符串或数值类型。它们在 DOM 中会被渲染为文本节点
+ 布尔类型或 null。什么都不渲染。

render() 函数应该为纯函数，这意味着在不修改组件 state 的情况下，每次调用时都返回相同的结果，如需与浏览器进行交互，请在 componentDidMount() 或其他生命周期方法中执行你的操作。如果 shouldComponentUpdate() 返回 false，则不会调用 render()。

### constructor()

如果不初始化 state 或不进行方法绑定，则不需要为 React 组件实现构造函数。

构造函数仅用于以下两种情况：

+ 通过给 this.state 赋值对象来初始化内部 state。不需要调用 setState() 方法。
+ 为事件处理函数绑定实例

注意：**避免将 props 的值复制给 state**

### componentDidMount()

componentDidMount() 会在组件挂载后（插入 DOM 树中）立即调用。依赖于 DOM 节点的初始化应该放在这里。如需通过网络请求获取数据，此处是实例化请求的好地方。这个方法是比较适合添加订阅的地方。

可以在 componentDidMount() 里可以直接调用 setState()。它将触发额外渲染，但此渲染会发生在浏览器更新屏幕之前。如此保证了即使在 render() 两次调用的情况下，用户也不会看到中间状态。请谨慎使用该模式，因为它会导致性能问题。通常，你应该在 constructor() 中初始化 state。

### componentDidUpdate()

componentDidUpdate() 会在更新后会被立即调用。首次渲染不会执行此方法。
当组件更新后，可以在此处对 DOM 进行操作。如果你对更新前后的 props 进行了比较，也可以选择在此处进行网络请求。

```js
componentDidUpdate(prevProps) {
  // 典型用法（不要忘记比较 props）：
  if (this.props.userID !== prevProps.userID) {
    this.fetchData(this.props.userID);
  }
}
```

你也可以在 componentDidUpdate() 中直接调用 setState()，但请注意它必须被包裹在一个条件语件里，正如上述的例子那样进行处理，否则会导致死循环。它还会导致额外的重新渲染，虽然用户不可见，但会影响组件性能。

如果组件实现了 getSnapshotBeforeUpdate() 生命周期（不常用），则它的返回值将作为 componentDidUpdate() 的第三个参数 “snapshot” 参数传递。否则此参数将为 undefined。

### componentWillUnmount()

componentWillUnmount() 会在组件卸载及销毁之前直接调用。在此方法中执行必要的清理操作，例如，清除 timer，取消网络请求或清除在 componentDidMount() 中创建的订阅等。componentWillUnmount() 中不应调用 setState()。

### shouldComponentUpdate()

当 props 或 state 发生变化时，shouldComponentUpdate() 会在渲染执行之前被调用。返回值默认为 true。此方法仅作为性能优化的方式而存在。应该考虑使用内置的 PureComponent 组件，而不是手动编写 shouldComponentUpdate()。如果你一定要手动编写此函数，可以将 this.props 与 nextProps 以及 this.state 与nextState 进行比较，并返回 false 以告知 React 可以跳过更新。请注意，返回 false 并不会阻止子组件在 state 更改时重新渲染。
不建议在 shouldComponentUpdate() 中进行深层比较或使用 JSON.stringify()。这样非常影响效率，且会损害性能。

### static getDerivedStateFromProps()

它应返回一个对象来更新 state，如果返回 null 则不更新任何内容。此方法适用于罕见的用例，即 state 的值在任何时候都取决于 props。此方法无权访问组件实例。请注意，不管原因是什么，都会在每次渲染前触发此方法。

### getSnapshotBeforeUpdate()

getSnapshotBeforeUpdate() 在最近一次渲染输出（提交到 DOM 节点）之前调用。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。此生命周期的任何返回值将作为参数传递给 componentDidUpdate()。

### Error boundaries

它会在其子组件树中的任何位置捕获 JavaScript 错误，如果 class 组件定义了生命周期方法 static getDerivedStateFromError() 或 componentDidCatch() 中的任何一个（或两者），它就成为了 Error boundaries。

### static getDerivedStateFromError()

此生命周期会在后代组件抛出错误后被调用。 它将抛出的错误作为参数，并返回一个值以更新 state。
注意：getDerivedStateFromError() 会在渲染阶段调用，因此不允许出现副作用。 如遇此类情况，请改用 componentDidCatch()。

### componentDidCatch()

它接收两个参数：

+ error —— 抛出的错误。
+ info —— 带有 componentStack key 的对象，其中包含有关组件引发错误的栈信息。

componentDidCatch() 会在“提交”阶段被调用，因此允许执行副作用。 它应该用于记录错误之类的情况。

### setState()

setState() 并不总是立即更新组件。它会批量推迟更新。这使得在调用 setState() 后立即读取 this.state 成为了隐患。为了消除隐患，请使用 componentDidUpdate 或者 setState 的回调函数

### forceUpdate()

可以调用 forceUpdate() 强制让组件重新渲染。通常你应该避免使用 forceUpdate()，尽量在 render() 只使用 this.props 和 this.state

### defaultProps

defaultProps 可以为 Class 组件添加默认 props。这一般用于 props 未赋值，但又不能为 null 的情况。

### displayName

displayName 字符串多用于调试消息。通常，你不需要设置它，因为它可以根据函数组件或 class 组件的名称推断出来。

## DOM 元素

### checked

当 `<input>` 组件的 type 类型为 checkbox 或 radio 时，组件支持 checked 属性。而 defaultChecked 则是非受控组件的属性，用于设置组件首次挂载时是否被选中。

### className

### dangerouslySetInnerHTML

dangerouslySetInnerHTML 是 React 为浏览器 DOM 提供 innerHTML 的替换方案。因此，你可以直接在 React 中设置 HTML，但当你想设置 dangerouslySetInnerHTML 时，需要向其传递包含 key 为 __html 的对象，以此来警示你。例如：

```jsx
function createMarkup() {
  return {__html: 'First &middot; Second'};
}

function MyComponent() {
  return <div dangerouslySetInnerHTML={createMarkup()} />;
}
```

### htmlFor

由于 for 在 JavaScript 中是保留字，所以 React 元素中使用了 htmlFor 来代替。

### onChange

onChange 事件与预期行为一致：每当表单字段变化时，该事件都会被触发。

### selected

`<option>` 组件支持 selected 属性。

### style

style 接受一个采用小驼峰命名属性的 JavaScript 对象，而不是 CSS 字符串。

```jsx
const divStyle = {
  color: 'blue',
  backgroundImage: 'url(' + imgUrl + ')',
};

function HelloWorldComponent() {
  return <div style={divStyle}>Hello World!</div>;
}
```

注意：样式不会自动补齐前缀。如需支持旧版浏览器，请手动补充对应的样式属性

### suppressContentEditableWarning

通常，当拥有子节点的元素被标记为 contentEditable 时，React 会发出一个警告，因为这不会生效。

### suppressHydrationWarning

如果你使用 React 服务端渲染，通常会在当服务端与客户端渲染不同的内容时发出警告。如果设置 suppressHydrationWarning 为 true，React 将不会警告你属性与元素内容不一致。

### All Supported HTML Attributes

在 React 16 中，任何标准的或自定义的 DOM 属性都是完全支持的。所有的 SVG 属性也完全得到了支持。
