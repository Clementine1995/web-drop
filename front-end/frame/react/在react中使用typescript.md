# 在React中使用Typescript

>[小邵教你玩转Typescript、ts版React全家桶脚手架](https://juejin.im/post/5c04d3f3f265da612e28649c)
>[TypeScript 在 React 中使用总结](https://juejin.im/post/5bab4d59f265da0aec22629b)
>[优雅的在 react 中使用 TypeScript](https://juejin.im/postf/5bed5f03e51d453c9515e69b)

## 在 react 中使用 ts 的几点原则和变化

+ 所有用到jsx语法的文件都需要以tsx后缀命名
+ 使用组件声明时的Component<P, S>泛型参数声明，来代替PropTypes！
+ 全局变量或者自定义的window对象属性，统一在项目根下的global.d.ts中进行声明定义
+ 对于项目中常用到的接口数据对象，在types/目录下定义好其结构化类型声明
+ 使用React提供的Event对象的类型声明，约束事件
+ 使用泛型T来约束Promise以及其他异步库（axios）

## 使用React组件

### 声明类组件

使用 TSX 我们可以这样写

```tsx
// import React from "react" // 之前的写法
import * as React from 'react'

interface IProps {
  color: string,
  size?: string,
}
interface IState {
  count: number,
}
class App extends React.Component<IProps, IState> {
  static defaultProps = {
    // ...
  }

  public state = {
    count: 1,
  }
  public render () {
    return (
      <div>Hello world</div>
    )
  }
}
```

那么 Component 的泛型是如何实现的呢，我们可以参考下 React 的类型定义文件

```ts
class Component<P, S> {
    readonly props: Readonly<{ children?: ReactNode }> & Readonly<P>;
    state: Readonly<S>;
}
```

在这里可以看到 Component 这个泛型类， P 代表 Props 的类型， S 代表 State 的类型。

Component 泛型类在接收到 P ， S 这两个泛型变量后，将只读属性 props 的类型声明为交叉类型 `Readonly<{ children?: ReactNode }> & Readonly<P>;` 使其支持 children 以及我们声明的 color 、 size 。
通过泛型的类型别名 Readonly 将 props 的所有属性都设置为只读属性。

需要特别强调的是，如果用到了state，除了在声明组件时通过泛型参数传递其state结构，还需要在初始化state时声明为 readonly。这是因为我们使用 class properties 语法对state做初始化时，会覆盖掉Component<P, S>中对state的readonly标识。

#### 防止直接更新 state

React的 state 更新需要使用 setState 方法，但是我们经常误操作，直接对 state 的属性进行更新。

```ts
this.state.count = 2
```

现在有了 TypeScript 我们可以通过将 state ，以及 state 下面的属性都设置为只读类型，从而防止直接更新 state 。

```ts
public readonly state: Readonly<IState> = {
  count: 1,
}
```

### 声明函数式组件

在 React 的声明文件中 已经定义了一个 SFC 类型，使用这个类型可以避免我们重复定义 children、 propTypes、 contextTypes、 defaultProps、displayName 的类型。使用 SFC 进行无状态组件开发，`type SFC<P>`其中已经定义了children类型。：

```tsx
import { SFC } from 'react'
import { MouseEvent } from 'react'
import * as React from 'react'
interface IProps {
  onClick (event: MouseEvent<HTMLDivElement>): void,
}
// 当我们需要传递 Props 时，只用定义一个 Props 接口，然后给 props 指明类型：
const Button: SFC<IProps> = ({onClick, children}) => {
  return (
    <div onClick={onClick}>
      { children }
    </div>
  )
}
export default Button
```

### 使用react高阶组件

因为react中的高阶组件本质上是个高阶函数的调用，所以高阶组件的使用，我们既可以使用函数式方法调用，也可以使用装饰器。但是在TS中，编译器会对装饰器作用的值做签名一致性检查，而我们在高阶组件中一般都会返回新的组件，并且对被作用的组件的props进行修改（添加、删除）等。这些会导致签名一致性校验失败，TS会给出错误提示。这带来两个问题：

#### 第一，是否还能使用装饰器语法调用高阶组件呢

这个答案也得分情况：如果这个高阶组件正确声明了其函数签名，那么应该使用函数式调用，比如 withRouter：

```tsx
import { RouteComponentProps } from 'react-router-dom';

const App = withRouter(class extends Component<RouteComponentProps> {
    // ...
});

// 以下调用是ok的
<App />
```

如上的例子，我们在声明组件时，注解了组件的props是路由的RouteComponentProps结构类型，但是我们在调用App组件时，并不需要给其传递RouteComponentProps里说具有的location、history等值，这是因为withRouter这个函数自身对齐做了正确的类型声明。

#### 第二，使用装饰器语法或者没有函数类型签名的高阶组件怎么办？

如何正确的声明高阶组件？

就是将高阶组件注入的属性都声明可选（通过Partial这个映射类型），或者将其声明到额外的injected组件实例属性上。 我们先看一个常见的组件声明：

```tsx
import { RouteComponentProps } from 'react-router-dom';

// 方法一
@withRouter
class App extends Component<Partial<RouteComponentProps>> {
    public componentDidMount() {
        // 这里就需要使用非空类型断言了
        this.props.history!.push('/');
    }
    // ...
});

// 方法二
@withRouter
class App extends Component<{}> {
  get injected() {
      return this.props as RouteComponentProps
  }

  public componentDidMount() {
      this.injected.history.push('/');
  }
  // ...
```

如何正确的声明高阶组件？

```tsx
interface IUserCardProps {
    name: string;
    avatar: string;
    bio: string;

    isAdmin?: boolean;
}
class UserCard extends Component<IUserCardProps> { /* ... */}
```

上面的组件要求了三个必传属性参数：name、avatar、bio，isAdmin是可选的。加入此时我们想要声明一个高阶组件，用来给UserCard传递一个额外的布尔值属性visible，我们也需要在UserCard中使用这个值，那么我们就需要在其props的类型里添加这个值：

```tsx
interface IUserCardProps {
    name: string;
    avatar: string;
    bio: string;
    visible: boolean;

    isAdmin?: boolean;
}
@withVisible
class UserCard extends Component<IUserCardProps> {
    render() {
        // 因为我们用到visible了，所以必须在IUserCardProps里声明出该属性
        return <div className={this.props.visible ? '' : 'none'}>...</div>
    }
}

function withVisiable(WrappedComponent) {
    return class extends Component {
        render() {
            return <WrappedComponent {..this.props}  visiable={true} />
        }
    }
}
```

但是这样一来，我们在调用UserCard时就会出现问题，因为visible这个属性被标记为了必需，所以TS会给出错误。这个属性是由高阶组件注入的，所以我们肯定是不能要求都再传一下的。
可能你此时想到了，把visible声明为可选。没错，这个确实就解决了调用组件时visible必传的问题。这确实是个解决问题的办法。但是就像上一个问题里提到的，这种应对办法应该是对付哪些没有类型声明或者声明不正确的高阶组件的。
所以这个就要求我们能正确的声明高阶组件：

```tsx
interface IVisible {
    visible: boolean;
}

 //排除 IVisible
function withVisible<Self>(WrappedComponent: React.ComponentType<Self & IVisible>): React.ComponentType<Omit<Self, 'visible'>> {
    return class extends Component<Self> {
        render() {
            return <WrappedComponent {...this.props}  visible={true} />
        }
    }
}
```

如上，我们声明withVisible这个高阶组件时，利用泛型和类型推导，我们对高阶组件返回的新的组件以及接收的参数组件的props都做出类型声明。

## 事件处理

我们在进行事件注册时经常会在事件处理函数中使用 event 事件对象，例如当使用鼠标事件时我们通过 clientX、clientY 去获取指针的坐标。

大家可以想到直接把 event 设置为 any 类型，但是这样就失去了我们对代码进行静态检查的意义。

```ts
function handleEvent (event: any) {
  console.log(event.clientY)
}
```

试想下当我们注册一个 Touch 事件，然后错误的通过事件处理函数中的 event 对象去获取其 clientY 属性的值，在这里我们已经将 event 设置为 any 类型，导致 TypeScript 在编译时并不会提示我们错误， 当我们通过 event.clientY 访问时就有问题了，因为  Touch 事件的 event 对象并没有  clientY 这个属性。
通过 interface 对 event 对象进行类型声明编写的话又十分浪费时间，幸运的是 React 的声明文件提供了 Event 对象的类型声明。

### Event 事件对象类型

常用 Event 事件对象类型：

+ ClipboardEvent<T = Element> 剪贴板事件对象
+ DragEvent<T = Element> 拖拽事件对象
+ ChangeEvent<T = Element>  Change 事件对象
+ KeyboardEvent<T = Element> 键盘事件对象
+ MouseEvent<T = Element> 鼠标事件对象
+ TouchEvent<T = Element>  触摸事件对象
+ WheelEvent<T = Element> 滚轮事件对象
+ AnimationEvent<T = Element> 动画事件对象
+ TransitionEvent<T = Element> 过渡事件对象

实例：

```tsx
import { MouseEvent } from 'react'

interface IProps {

  onClick (event: MouseEvent<HTMLDivElement>): void,
}
```

### 事件处理函数类型

当我们定义事件处理函数时有没有更方便定义其函数类型的方式呢？答案是使用 React 声明文件所提供的 EventHandler 类型别名，通过不同事件的 EventHandler 的类型别名来定义事件处理函数的类型。
EventHandler 类型实现源码 node_modules/@types/react/index.d.ts 。

```ts
type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"];
type ReactEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>;
type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;
type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;
type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;
type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;
```

EventHandler 接收 E ，其代表事件处理函数中 event 对象的类型。

bivarianceHack 为事件处理函数的类型定义，函数接收一个 event 对象，并且其类型为接收到的泛型变量 E 的类型, 返回值为 void。

实例：

```ts
interface IProps {
  onClick : MouseEventHandler<HTMLDivElement>,
}
```

## 使用泛型T来约束Promise以及其他异步库（axios）

在做异步操作时我们经常使用 async 函数，函数调用时会 return 一个 Promise 对象，可以使用 then 方法添加回调函数。
`Promise<T>` 是一个泛型类型，T 泛型变量用于确定使用 then 方法时接收的第一个回调函数（onfulfilled）的参数类型。

```tsx
interface IResponse<T> {
  message: string,
  result: T,
  success: boolean,
}
async function getResponse (): Promise<IResponse<number[]>> {
  return {
    message: '获取成功',
    result: [1, 2, 3],
    success: true,
  }
}
getResponse()
  .then(response => {
    console.log(response.result)
  })
```

我们首先声明 IResponse 的泛型接口用于定义 response 的类型，通过 T 泛型变量来确定 result 的类型。
然后声明了一个 异步函数 getResponse 并且将函数返回值的类型定义为 Promise<IResponse<number[]>> 。
最后调用 getResponse 方法会返回一个 promise 类型，通过 then 调用，此时 then 方法接收的第一个回调函数的参数 response 的类型为，{ message: string, result: number[], success: boolean} 。

### 配合 axios 使用

通常情况下，我们会把后端返回数据格式单独放入一个 interface 里：

```ts
// 请求接口数据
export interface ResponseData<T = any> {
  /**
   * 状态码
   * @type { number }
   */
  code: number;

  /**
   * 数据
   * @type { T }
   */
  result: T;

  /**
   * 消息
   * @type { string }
   */
  message: string;
}
```

当我们把 API 单独抽离成单个模块时：

```ts
// 在 axios.ts 文件中对 axios 进行了处理，例如添加通用配置、拦截器等
import Ax from './axios';

import { ResponseData } from './interface.ts';

export function getUser<T>() {
  return Ax.get<ResponseData<T>('/somepath')
    .then(res => res.data)
    .catch(err => console.error(err));
}
```

接着我们写入返回的数据类型 User，这可以让 TypeScript 顺利推断出我们想要的类型：

```ts
interface User {
  name: string;
  age: number;
}

async function test() {
  // user 被推断出为
  // {
  //  code: number,
  //  result: { name: string, age: number },
  //  message: string
  // }
  const user = await getUser<User>();
}
```

## react-router使用

安装 `npm i react-router-dom @types/react-router-dom` 或者 `yarn add react-router-dom @types/react-router-dom`

使用的时候与不使用ts时基本一致，但是如果要是用withRouter之类的封装时，直接在组件内部使用location、history之类的props时，会报错因为声明时的props上并不存在这些属性，可以使用router官方提供的RouteComponentProps，在上面高阶组件使用时已经写过。

### 代码分割

使用官方推荐的@loadable/component配合@babel/plugin-syntax-dynamic-import，即可实现路由动态加载。

```tsx
import loadable from '@loadable/component'

const HomeComponent = loadable(() => import('./views/home'))
```

### 防止 xss 攻击

input，textarea 等标签，不要直接把 html 文本直接渲染在页面上,使用 xssb 等过滤之后再输出到标签上;

```jsx
import { html2text } from 'xss';
render(){
  <div
  dangerouslySetInnerHTML={{
    __html: html2text(htmlContent)
  }}
/>
}
```

### 使用私有属性取代state状态

对于一些不需要控制ui的状态属性，我们可以直接绑到this上， 即私有属性，没有必要弄到this.state上，不然会触发渲染机制，造成性能浪费 例如请求翻页数据的时候,我们都会有个变量。

```js
// bad
state: IState = {
  pageNo:1,
  pageSize:10
};

// good
queryParams:Record<string,any> = {
  pageNo:1,
  pageSize:10
}
```

### a标签安全问题

使用a标签打开一个新窗口过程中的安全问题。新页面中可以使用window.opener来控制原始页面。如果新老页面同域，那么在新页面中可以任意操作原始页面。如果是不同域，新页面中依然可以通过window.opener.location，访问到原始页面的location对象
在带有target="_blank"的a标签中，加上rel="noopener"属性。如果使用window.open的方式打开页面，将opener对象置为空。

```js
var newWindow = window.open();
newWindow.opener = null;
```

## 使用Ref

### TypeScript 中传递引用

先看正常情况下，对原生 DOM 元素的引用。示例：

```js
class App extends Component<{}, {}> {
  private inputRef = React.createRef();

  componentDidMount() {
    /** 🚨 Object is possibly 'null' */
    this.inputRef.current.focus();
  }

  render() {
    return (
      <div className="App">
        {/* 🚨 Type '{}' is missing the following properties from type 'HTMLInputElement':... */}
        <input type="text" ref={this.inputRef} />
      </div>
    );
  }
}
```

像上面那样创建并使用存在两个问题。

一个是提示我们的引用无法赋值到 `<input>` 的 ref 属性上，类型不兼容。引用需要与它真实所指代的元素类型相符，这正是 TypeScript 类型检查为我们添加的约束。这个约束的好处是，我们在使用引用的时候，就知道这个引用真实的元素类型，TypeScript 会自动提示可用的方法和属性，同时防止调用该元素身上没有的属性和方法。这里修正的方法很简单，查看 React.createRef() 的方法签名，会发现它是个泛型方法，支持传递类型参数。

```js
function createRef<T>(): RefObject<T>;
```

在createRef这里需要一个泛型，这个泛型就是需要ref组件的类型，因为这个是input组件，所以类型是HTMLInputElement，当然如果是div组件的话那么这个类型就是HTMLDivElement。

```ts
private inputRef = React.createRef<HTMLInputElement>();
```

第二个问题是即使在 componentDidMount 生命周期中使用，TypeScript 仍然提示 current 的值有可能为空。上面讨论过，其实此时我们知道它不可能为空的。但因为 TypeScript 无法理解 componentDidMount，所以它不知道此时引用其实是可以安全使用的。解决办法当然是加上判空的逻辑。

```jsx
componentDidMount() {
  if(this.inputRef.current){
    this.inputRef.current.focus();
  }
}
```

还可通过变量后添加 ! 操作符告诉 TypeScript 该变量此时非空。

```js
componentDidMount() {
  this.inputRef.current!.focus();
}
```

修复后完整的代码如下：

```js
class App extends Component<{}, {}> {
  private inputRef = React.createRef<HTMLInputElement>();

  componentDidMount() {
    this.inputRef.current!.focus();
  }

  render() {
    return (
      <div className="App">
        <input type="text" ref={this.inputRef} />
      </div>
    );
  }
}
```

### React + TypeScript 组件引用的传递

继续到组件的情况，当需要引用的元素在另一个组件内部时，还是通过 React.forwardRef()。

这是该方法的签名：

function forwardRef<T, P = {}>(Component: RefForwardingComponent<T, P>): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
可以看到，方法接收两个类型参数，T 为需要引用的元素类型，我们示例中是 HTMLInputElement，P 为组件的 props 类型。

所以添加引用传递后，FancyInput 组件在 TypeScript 中的版本应该长这样：

```js
const FancyInput = React.forwardRef<HTMLInputElement, {}>((props, ref) => {
  return <input type="text" ref={ref} className="fancy-input" />;
});
```

使用组件：

```js
class App extends Component<{}, {}> {
  private inputRef = React.createRef<HTMLInputElement>();

  componentDidMount() {
    this.inputRef.current!.focus();
  }

  render() {
    return (
      <div className="App">
        <FancyInput ref={this.inputRef} />
      </div>
    );
  }
}
```

### 无状态组件中使用

```js
function TestComp(props){
  let refDom;
  return (<div>
    <div ref={(node) => refDom = node}>
        ...
    </div>
  </div>)
}
```
