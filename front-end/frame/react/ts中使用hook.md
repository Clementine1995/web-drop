# TypeScript 中使用React Hook

>原文[TypeScript 中使用React Hook](https://juejin.im/post/5ce0134b5188256a220235eb)

## useState

大多数情况下，useState 的类型可以从初始化值推断出来。但当我们初始化值为 null、undefined或者对象以及数组的时候，我们需要制定useState的类型。

```tsx
// 可以推断 age 是 number类型
const [age, setAge] = useState(20);

// 初始化值为 null 或者 undefined时，需要显示指定 name 的类型
const [name, setName] = useState<string>();

// 初始化值为一个对象时
interface People {
    name: string;
    age: number;
    country?: string;
}
const [owner, setOwner] = useState<People>({name: 'rrd_fe', age: 5});

// 初始化值是一个数组时
const [members, setMembers] = useState<People[]>([]);
```

### 避免重复计算

如果initialState为函数，则useState在初始化时会立刻执行该函数和获取函数的返回值，在没有任何返回值得情况下为undefined。这里需要注意的是每次组件re-render都会导致useState中的函数重新计算，这里可以使用闭包函数来解决问题。

```jsx
// 优化前
const loop = () => {
  console.log("calc!");
  let res = 0;
  for (let i = 0, len = 1000; i < len; i++) {
    res += i;
  }
  return res;
};

const [value, setValue] = useState(loop());

// 优化后
const App = () => {
  const [value, setValue] = useState(() => {
    return loop();
  });
}
```

## useEffect

useEffect 用来在组件完成渲染之后增加副作用(side effect)，可以返回一个函数，用来做一些状态还原、移除listener等 clean up的操作。不需要处理返回值，所以可以不指定他的类型。useLayoutEffect类似。

```tsx
useEffect(() => {
    const listener = addEventListener(name, callback);
    return () => {
        removeEventListener(listener)
    }
}, [name, callback]);
```

## useMemo、useCallback

对于 useMemo 和 useCallback 我们可以从函数的返回值中推断出来他们返回的类型，需要显示指定。

```tsx
const age = 12;
// 推断 doubleAge 是 number类型
const doubleAge = useMemo(() => {
    return age * 2;
}, [age]);

// 推断 addTen 类型是 (initValue: number) => number
const addTen = useCallback((initValue: number) => {
    return initValue + 10;
});
```

默认情况，只要父组件状态变了（不管子组件依不依赖该状态），子组件也会重新渲染
一般的优化：

+ 类组件：可以使用 pureComponent ；
+ 函数组件：使用 React.memo ，将函数组件传递给 memo 之后，就会返回一个新的组件，新组件的功能：如果接受到的属性不变，则不重新渲染函数；

但是怎么保证属性不会变呢？这里使用 useState ，每次更新都是独立的，const [number,setNumber] = useState(0) 也就是说每次都会生成一个新的值（哪怕这个值没有变化），即使使用了 React.memo，也还是会重新渲染，可以使用useMemo、useCallback

```tsx
import React,{useState,memo,useMemo,useCallback} from 'react';

function SubCounter({onClick,data}){
    console.log('SubCounter render');
    return (
        <button onClick={onClick}>{data.number}</button>
    )
}
SubCounter = memo(SubCounter);

let oldData,oldAddClick;
export  default  function Counter2(){
    console.log('Counter render');
    const [name,setName]= useState('计数器');
    const [number,setNumber] = useState(0);
    // 父组件更新时，这里的变量和函数每次都会重新创建，那么子组件接受到的属性每次都会认为是新的
    // 所以子组件也会随之更新，这时候可以用到 useMemo
    // 有没有后面的依赖项数组很重要，否则还是会重新渲染
    // 如果后面的依赖项数组没有值的话，即使父组件的 number 值改变了，子组件也不会去更新
    //const data = useMemo(()=>({number}),[]);
    const data = useMemo(()=>({number}),[number]);
    console.log('data===oldData ',data===oldData);
    oldData = data;

    // 有没有后面的依赖项数组很重要，否则还是会重新渲染
    const addClick = useCallback(()=>{
        setNumber(number+1);
    },[number]);
    console.log('addClick===oldAddClick ',addClick===oldAddClick);
    oldAddClick=addClick;
    return (
        <>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)}/>
            <SubCounter data={data} onClick={addClick}/>
        </>
    )
}
```

## useRef

useRef 有两种比较典型的使用场景：

场景一： 和 hook 之前的 ref 类似，用来关联一个 Dom节点或者 class component 实例，从而可以直接操作 Dom节点 或者class component 的方法。 通常会给 ref 的 readonly 属性 current 初始化为 null，直到 ref 关联到组件上。 通常我们需要指定 useRef 的类型，参考如下:

```tsx
const RRDTextInput = () => {
    const inputRef = useRef<TextInput>(null);
    return <TextInput ref={inputRef} placeholder="人人贷大前端" />;
}
```

场景二：使用 ref 替代 class component 中的实例属性（变量保存），这种场景我们可以从初始化值中推断出类型，current 也是可修改的。

```tsx
// 推断 current 是 number 类型
const age = useRef(2);
```

### 场景1

只在组件 mount 之后执行的方法。希望 useEffect 只关心部分 props 或 state 变量的变动，从而重新执行副作用函数，其它 props 或 state 变量只取决于当时的状态。

```jsx
function App() {
  const [ count ] = useState(0);
  useEffect(() => {
    console.log(count);
  }, []); // 这里将会有警告，依赖数组中没有count
}


function useMount(mountedFn) {
  const mountedFnRef = useRef(null);
  mountedFnRef.current = mountedFn;

  useEffect(() => {
    mountedFnRef.current();
  }, [mountedFnRef]);
}

// 使用后warning解除
function App() {
  const [ count ] = useState(0);
  useMount(() => {
    console.log(count);
  });
}
```

### 场景2：只关心部分变量的变动

例子中的 Modal 组件需要根据 visible 变量的变动来执行相应的方法，又需要引用到其它的 props 或 state 变量，但是又不希望将它们放入 useEffect 依赖数组里，因为不关心它们的变动。如果将它们放入 useEffect 数组中，在 visible 变量不变的情况下，其它变量的变动会带来副作用函数的重复执行，这可能是非预期的。

```jsx
function Modal({
  visible,
  value
}) {
  useEffect(() => {
    if (visible) {
      // open modal
      console.log(value)
    } else {
      // hide modal
    }
  }, [visible])
}
```

需要一个辅助变量来记录 visible 变量的前一状态值，用来在副作用函数中判断是否因为 visible 变量变动触发的函数执行。为了便于复用，封装成 usePrevious 函数

```jsx
const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

function Modal({
  visible,
  value
}) {
  const preVisible = usePrevious(value);

  useEffect(() => {
    if (preVisible !== visible) {
      if (visible) {
        // open modal
        console.log(value)
        } else {
        // hide modal
      }
    }
  }, [visible, preVisible, value])
}
```

### 依赖数组中变量的比较问题

每次 App 组件渲染，传给 Child 组件的 list 变量都是一个全新引用地址的数组。如果 Child 组件将 list 变量放入了某个 hook 函数的依赖数组里，就会引起该 hook 函数的依赖变动。

```jsx
function App() {
  const list = [1, 2, 3];

  return (
    <>
      <Child list={list}></Child>
      <Child list={[4, 5, 6]}></Child>
    </>
  );
}
```

上面这种情况多加注意还是可以避免的，但在某些情况下我们希望依赖数组中对象类型的比较是浅比较或深比较。在 componnetDidUpdate 声明周期函数中这确实不难实现，但在函数式组件中还是需要借助 useRef 函数。

```jsx
import { isEqual } from 'lodash';

function useCampare(value, compare) {
  const ref = useRef(null);

  if (!compare(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

function Child({ list }) {
  const listArr = useCampare(list, isEqual);

  useEffect(() => {
    console.log(listArr);
  }, [listArr]);
}
```

### 函数引用变动问题

```jsx
function Button({
  child,
  disabled,
  onClick
}) {
  const handleBtnClickRef = useRef();

  handleBtnClickRef.current = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleBtnClick = useCallback(() => {
    handleBtnClickRef.current();
  }, [handleBtnClickRef]);

  return (
    <button onClick={handleBtnClick}>{child}</button>
  );
}
```

上面例子中，使用了一个 useRef 函数返回的变量 handleBtnClickRef 来保存最新的函数。因为该变量引用是固定的，所以 handleBtnClick 函数的引用也是固定的，触发 onClick 回调函数也能拿到最新的 disabled 和 onClick 值。

## useReducer

useReducer 可以认为是简配版的redux，可以让我们把复杂、散落在四处的useState，setState 集中到 reducer中统一处理。类似我们同样可以从reducer 函数(state逻辑处理函数)中推断出useReducer 返回的 state 和 dispatch 的 action类型，所以无需在显示的声明，参考如下实例：

```tsx
type ReducerAction =
    | { type: 'switchToSmsLogin' | 'switchToAccountLogin' }
    | {
        type: 'changePwdAccount' | 'changeSmsAccount';
        payload: {
            actualAccount: string;
            displayAccount: string;
        };
    };

interface AccountState {
    loginWithPwd: boolean;
    pwdActualAccount: string;
    pwdDisplayAccount: string;
    smsActualAccount: string;
    smsDisplayAccount: string;
}

function loginReducer(loginState: AccountState, action: ReducerAction): AccountState {
    switch (action.type) {
        case 'switchToAccountLogin':
            return {
                ...loginState,
                pwdActualAccount: loginState.smsActualAccount,
                pwdDisplayAccount: loginState.smsDisplayAccount,
                loginWithPwd: !loginState.loginWithPwd,
            };
        // 密码登陆页账号发生变化
        case 'changePwdAccount':
            return {
                ...loginState,
                pwdActualAccount: action.payload.actualAccount,
                pwdDisplayAccount: action.payload.displayAccount,
            };
        default:
            return loginState;
    }
}

// 可以从 loginReducer 推断出
// loginState 的类型 满足 AccountState interface
// dispatchLogin 接受的参数满足 ReducerAction 类型
const [loginState, dispatchLogin] = useReducer(loginReducer, initialState);

dispatchLogin({ type: 'switchToAccountLogin' });
dispatchLogin({
    type: 'changePwdAccount',
    payload: {
        actualAccount,
        displayAccount,
    },
});

// 错误： 不能将 logout 类型赋值给 type
dispatchLogin({ type: 'logout' });
// 错误： { type: 'changePwdAccount' } 类型缺少 payload属性
dispatchLogin({ type: 'changePwdAccount' });
```

## useImperativeHandle

useImperativeHandle 是 hook 中提供的允许我们 ref 一个function component 的方案，也是 Hook 在 TypeScript 中使用最复杂的场景。 我们先来看下面的Demo，一个RN转盘组件：

```tsx
// 第一步：定义转盘抽奖组件对外暴露的接口 start、stop
export interface WheelHandles {
    startLottery(): void;
    stopLottery(
        luckyIndex: number,
        stopCallback: () => void,
    ): void;
}

// 第二步：将转盘组件声明为 RefForwardingComponent 类型， 可以接受一个 ref props
// ref props 是通过 forwarding-refs 实现 https://reactjs.org/docs/forwarding-refs.html
const PrizeWheel: RefForwardingComponent<WheelHandles, Props> = (props, ref): => {

    function startLottery(): void {
        // 开始抽奖逻辑
    }

    function stopLottery(luckyIndex: number, stopCallback: () => void): void {
        // 停止抽奖逻辑
    }

    // 第三步： 通过 useImperativeHandle 实现对外提供预定义好的接口
    // useImperativeHandle 的 第一个 ref 参数， 我们可以从useRef(第四步会用到)推断出来
    // 第二个函数 return 内容， 可以从 WheelHandles推断出 不需要显示声明
    // 例如： 我们如果只实现的 startLottery， TypeScript 编译期间就会报错
    useImperativeHandle(ref, () => {
        return {
            startLottery,
            stopLottery,
        };
    });

    return (
        // 抽奖组件
    )
}

// 第四步 useRef 引用转盘对象， 并调用 startLottery 开始抽奖
const lotteryRef = useRef<PrizeWheelHandles>(null);

<PrizeWheel
    ref={lotteryRef}
    data={lotteryInfo}
/>

lotteryRef.current.startLottery();
```

## 自定义hook

在编写自定义 Hook 时，返回值一定要保持引用的一致性。 因为你无法确定外部要如何使用它的返回值。如果返回值被用做其他 Hook 的依赖，并且每次 re-render 时引用不一致（当值相等的情况），就可能会产生 bug。所以如果自定义 Hook 中暴露出来的值是 object、array等，都应该使用 useMemo。而函数应该使用useCallback，以确保当值相同时，引用不发生变化。
