# 起步

## Hello World

有两个需要主要关注的方法。setup 方法只运行一次，通常用于初始化，或者用于创建不需要重复循环运行的代码。draw 方法会循环运行，它用于动画。

第一个例子，写一个 setup 方法，并添加一行

```js
function setup() {
  line(15, 25, 70, 90);
}
```

打开浏览器，你就可以看到一条线。

添加一个 draw 方法让你能够合并动画，例如下面这个例子，每次执行draw时更新一个变量，来实现一个圆从屏幕中移过的效果。

```js
let x = 0;

function setup() {
  background(100);  
}

function draw() {
  ellipse(x, height/2, 20, 20);
  x = x + 1;
}
```

这种使用方法所有p5有关的实例方法都是挂载到 window 上的，这样在简单程序中可能不会有问题，但是一旦你使用了其他库，又或者程序代码很多之后，就会出现一些问题。这样就可以使用 实例模式

```js
const s = ( p ) => {

  let x = 100; 
  let y = 100;

  p.setup = function() {
    p.createCanvas(700, 410);
  };

  p.draw = function() {
    p.background(0);
    p.fill(255);
    p.rect(x,y,50,50);
  };
};

let myp5 = new p5(s);
```

当然也可以指定构造函数第二个参数，它是你希望初始化p5的html的元素的id。

```js
let myp5 = new p5(s, 'myContainer');
```

又或者是按需的全局模式

```js
new p5();

let boop = random(100);

function setup() {
    createCanvas(100, 100);
}

function draw() {
    background(255, 0, boop);
}
```

## createCanvas

默认画的canvas是 100*100 的，如果想要调整这个尺寸，就需要使用它，写在setup里。

```js
function setup() {
  createCanvas(600, 400);
  line(15, 25, 70, 90);
}
```

如果想在默认的使用方式下，指定canvas的展示位置，需要使用 parent 方法，可以在你的html文档中指定展示canvas 实例的容器。

```html
<div id='myContainer'></div>
```

然后在setup 中指定

```js
function setup() {
  let myCanvas = createCanvas(600, 400);
  myCanvas.parent('myContainer');
}
```

虽然p5 api提供了很多方法来创建图形，但是没有暴露原生 H5 Canvas的一些方法，你可以通过 drawingContext，来使用他们，具体有哪些的话，可以查看MDN。

```js
function setup() {
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = -5;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "black";
  background(200);
  ellipse(width/2, height/2, 50, 50);
}
```

## Mouse and touch interaction

p5 设置了一些方法来处理鼠标和触碰交互

具体可以查看 [API 参考](http://p5js.org/zh-Hans/reference)

如果希望在触发这些事件的时候阻止浏览器的默认行为，就需要 return false。

## Asynchronous calls and file loading

### Callbacks

所有的 load 方法都是接收一个 callback方法的，作为最后一个可选参数。看下面的例子，在一个图片 load 完成后的时候画出它，如果不在回调中，直接调用 image方法，就是画一个空白。

```js
function setup() {
  createCanvas(400, 240);
  loadImage('cat.jpg', drawCat);
}

function drawCat(img) {
  image(img, 0, 0);
}
```

### Preload

你也可以使用preload 方法，如果有它存在，会先于setup执行，

```js
let img;
function preload() {
  img = loadImage('cat.jpg');
}

function setup() {
  createCanvas(400, 240);
  image(img, 0, 0);
}
```

## Loading Screen

如果你加载的媒体比较大，这可能会有一部分等待时间，如果希望在大文件加载出来之前有一个 loading，你可以给d对应的容器加一个id p5_loading，就像下面这样

```html
<div id="p5_loading" class="loadingclass">this could be some sweet graphics loading lots of bits.</div>
```

