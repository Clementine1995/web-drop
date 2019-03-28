# 在React中使用Typescript

>[小邵教你玩转Typescript、ts版React全家桶脚手架](https://juejin.im/post/5c04d3f3f265da612e28649c)
>[TypeScript 在 React 中使用总结](https://juejin.im/post/5bab4d59f265da0aec22629b)
>[优雅的在 react 中使用 TypeScript](https://juejin.im/post/5bed5f03e51d453c9515e69b)

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

在 React 的声明文件中 已经定义了一个 SFC 类型，使用这个类型可以避免我们重复定义 children、 propTypes、 contextTypes、 defaultProps、displayName 的类型。使用 SFC 进行无状态组件开发：

```tsx
import { SFC } from 'react'
import { MouseEvent } from 'react'
import * as React from 'react'
interface IProps {
  onClick (event: MouseEvent<HTMLDivElement>): void,
}
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

#### 第一，是否还能使用装饰器语法调用高阶组件？

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

