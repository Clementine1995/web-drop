# HTML拖拽API

>参考自[Drag Operations](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations)
>
>参考自[Data​Transfer](https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer)
>
>参考自[拖拉事件](https://wangdoc.com/javascript/events/drag.html)

## 可拖动属性

默认情况下web页面中文本选择、图像和链接是可拖拽的，其他元素默认不可拖动。如果想要其他的 HTML 元素可拖动，需要：

+ 在你想要拖动的元素上，将 draggable 属性设置成 true 。
+ 为事件添加一个监听器 dragstart。
+ 在上面定义的监听器中设置拖动数据。

注意：一旦某个元素节点的draggable属性设为true，就无法再用鼠标选中该节点内部的文字或子节点了。用户必须按住 alt 键，用鼠标选择文本，或者使用键盘来代替。

## 拖拉事件

当元素节点或选中的文本被拖拉时，就会持续触发拖拉事件，包括以下一些事件：

### drag

拖拉过程中，在被拖拉的节点上**持续**触发（相隔几百毫秒）。可冒泡并且可以取消，默认行为继续拖拽行为。

### dragstart

用户开始拖拉时，在被拖拉的节点上触发，该事件的target属性是被拖拉的节点。通常应该在这个事件的监听函数中，指定拖拉的数据。可冒泡并且可以取消，默认行为启动拖放操作。

### dragend

拖拉结束时（释放鼠标键或按下 ESC 键）在被拖拉的节点上触发，该事件的target属性是被拖拉的节点。它与dragstart事件，在同一个节点上触发。不管拖拉是否跨窗口，或者中途被取消，dragend事件总是会触发的。可冒泡但不可取消，默认行为执行改变。

### dragenter

拖拉进入当前节点时，在当前节点上触发一次，该事件的target属性是当前节点。通常应该在这个事件的监听函数中，指定是否允许在当前节点放下（drop）拖拉的数据。如果当前节点没有该事件的监听函数，或者监听函数不执行任何操作，就意味着不允许在当前节点放下数据。在视觉上显示拖拉进入当前节点，也是在这个事件的监听函数中设置。可冒泡可取消，默认动作取消拖动

### dragover

拖拉到当前节点上方时，在当前节点上持续触发（相隔几百毫秒），该事件的target属性是当前节点。该事件与dragenter事件的区别是，dragenter事件在进入该节点时触发，然后只要没有离开这个节点，dragover事件会持续触发。可冒泡可取消，默认行为重置当前的拖拽动作为"none"

### dragleave

拖拉操作离开当前节点范围时，在当前节点上触发，该事件的target属性是当前节点。如果要在视觉上显示拖拉离开操作当前节点，就在这个事件的监听函数中设置。可冒泡不可取消，默认行为无。

### drop

被拖拉的节点或选中的文本，释放到目标节点时，在目标节点上触发。注意，如果当前节点不允许drop，即使在该节点上方松开鼠标键，也不会触发该事件。如果用户按下 ESC 键，取消这个操作，也不会触发该事件。该事件的监听函数负责取出拖拉数据，并进行相关处理。可冒泡可取消，默认行为执行改变

注意:

+ 拖拉过程只触发以上这些拖拉事件，尽管鼠标在移动，但是鼠标事件不会触发。
+ 将文件从操作系统拖拉进浏览器，不会触发dragstart和dragend事件。
+ dragenter和dragover事件的监听函数，用来取出拖拉的数据（即允许放下被拖拉的元素）。由于网页的大部分区域不适合作为放下拖拉元素的目标节点，所以这两个事件的默认设置为当前节点不允许接受被拖拉的元素。如果想要在目标节点上放下的数据，首先必须阻止这两个事件的默认行为。

## DragEvent 接口

DragEvent 是一个表示拖、放交互的一个DOM event 接口。拖拉事件都继承了DragEvent接口，这个接口又继承了MouseEvent接口和Event接口。

浏览器原生提供一个DragEvent()构造函数，用来生成拖拉事件的实例对象。

语法：`new DragEvent(type, DragEventInit)`

DragEvent()构造函数接受两个参数，第一个参数是字符串，表示事件的类型，该参数必须；第二个参数是事件的配置对象，用来设置事件的属性，该参数可选。配置对象除了接受MouseEvent接口和Event接口的配置属性，还可以设置dataTransfer属性要么是null，要么是一个DataTransfer接口的实例。

## DataTransfer

所有拖拉事件的实例都有一个DragEvent.dataTransfer属性，用来读写需要传递的数据。它可以保存一项或多项数据、一种或者多种数据类型。这个属性的值是一个DataTransfer接口的实例。

拖拉的数据分成两方面：数据的种类（又称格式）和数据的值。数据的种类是一个 MIME 字符串（比如text/plain、image/jpeg），数据的值是一个字符串。一般来说，如果拖拉一段文本，则数据默认就是那段文本；如果拖拉一个链接，则数据默认就是链接的 URL。

拖拉事件开始时，开发者可以提供数据类型和数据值。拖拉过程中，开发者通过dragenter和dragover事件的监听函数，检查数据类型，以确定是否允许放下（drop）被拖拉的对象。比如，在只允许放下链接的区域，检查拖拉的数据类型是否为text/uri-list。

发生drop事件时，监听函数取出拖拉的数据，对其进行处理。

### DataTransfer实例属性

#### dropEffect

DataTransfer.dropEffect属性用来设置放下（drop）被拖拉节点时的效果，会影响到拖拉经过相关区域时鼠标的形状。它可能取下面的值。

+ copy: 复制到新的位置
+ move: 移动到新的位置
+ link: 建立一个源位置到新位置的链接
+ none: 禁止放置（禁止任何操作）

dropEffect属性一般在dragenter和dragover事件的监听函数中设置，对于dragstart、drag、dragleave这三个事件，dropEffect会被初始化为 “none”，该属性不起作用。因为该属性只对接受被拖拉的节点的区域有效，对被拖拉的节点本身是无效的。进入目标区域后，拖拉行为会初始化成设定的效果。

#### effectAllowed

DataTransfer.effectAllowed属性设置本次拖拉中允许的效果。可能的值：

+ copy: 复制到新的位置.
+ move:移动到新的位置 .
+ link:建立一个源位置到新位置的链接.
+ copyLink: 允许复制或者链接.
+ copyMove: 允许复制或者移动.
+ linkMove: 允许链接或者移动.
+ all: 允许所有的操作.
+ none: 禁止所有操作.
+ uninitialized: 缺省值（默认值）, 相当于 all.

这个属性与dropEffect属性是同一件事的两个方面。前者设置被拖拉的节点允许的效果，后者设置接受拖拉的区域的效果，它们往往配合使用。

dragstart事件的监听函数，可以用来设置这个属性。其他事件的监听函数里面设置这个属性是无效的。只要dropEffect属性和effectAllowed属性之中，有一个为none，就无法在目标节点上完成drop操作。

#### files

DataTransfer.files属性是一个 FileList 对象，包含一组本地文件，可以用来在拖拉操作中传送。如果本次拖拉不涉及文件，则该属性为空的 FileList 对象。

#### types

DataTransfer.types属性是一个只读的数组，每个成员是一个字符串，里面是拖拉的数据格式（通常是 MIME 值）。比如，如果拖拉的是文字，对应的成员就是text/plain。

#### items

DataTransfer.items属性返回一个类似数组的只读对象（DataTransferItemList 实例），每个成员就是本次拖拉的一个对象（DataTransferItem 实例）。如果本次拖拉不包含对象，则返回一个空对象。

DataTransferItemList 实例具有以下的属性和方法。

+ length：返回成员的数量
+ add(data, type)：增加一个指定内容和类型（比如text/html和text/plain）的字符串作为成员
+ add(file)：add方法的另一种用法，增加一个文件作为成员
+ remove(index)：移除指定位置的成员
+ clear()：移除所有的成员

DataTransferItem 实例具有以下的属性和方法。

+ kind：返回成员的种类（string还是file）。
+ type：返回成员的类型（通常是 MIME 值）。
+ getAsFile()：如果被拖拉是文件，返回该文件，否则返回null。
+ getAsString(callback)：如果被拖拉的是字符串，将该字符传入指定的回调函数处理。该方法是异步的，所以需要传入回调函数。

#### mozCursor(Gecko支持)

拖动光标状态。这主要用来控制光标在拖动过程中的显示。可取值：

+ auto：使用系统默认行为。
+ default：使用默认的Gecko 行为，是要在拖动操作期间将光标设置为一个箭头。

注意: 这个方法目前只能在Windows上实现

#### mozItemCount(Gecko支持)

正被拖动的项的数目。

#### mozSourceNode(Gecko支持)

启动拖动操作时鼠标光标所在的节点。 外部拖动或调用者无法访问节点时，此值为null。

#### mozUserCancelled(Gecko支持)

此属性仅适用于dragend事件，如果用户通过按escape取消拖动操作，则该属性为true。在所有其他情况下，它将是假的，包括由于任何其他原因导致拖动失败，例如由于无效位置的丢失。此属性目前尚未在Linux上实现。

### DataTransfer 的实例方法

#### setData()

DataTransfer.setData()方法用来设置拖拉事件所带有的数据。该方法没有返回值。

语法：`obj.setData(type,data);`

该方法接受两个参数，都是字符串。第一个参数表示要添加的数据类型（比如text/plain），第二个参数是要添加的数据。如果指定类型的数据在dataTransfer属性不存在，那么这些数据将被加入，否则原有的数据将被新数据替换。

如果是拖拉文本框或者拖拉选中的文本，会默认将对应的文本数据，添加到dataTransfer属性，不用手动指定。

```html
<div draggable="true">
  aaa
</div>
```

上面代码中，拖拉这个`<div>`元素会自动带上文本数据aaa。

使用setData方法，可以替换到原有数据。

```html
<div
  draggable="true"
  ondragstart="event.dataTransfer.setData('text/plain', 'bbb')"
>
  aaa
</div>
```

上面代码中，拖拉数据实际上是bbb，而不是aaa。

Tips：通过在同一个事件上面，存放三种类型的数据，使得拖拉事件可以在不同的对象上面，drop不同的值。

#### getData()

语法：`obj.getData(type);`

DataTransfer.getData()方法接受一个字符串（表示数据类型）作为参数，返回事件所带的指定类型的数据（通常是用setData方法添加的数据）。如果指定类型的数据不存在，则返回空字符串。通常只有**drop事件触发后**，才能取出数据。

注意：getData方法返回的是一个字符串，如果其中包含多项数据，就必须手动解析。

#### clearData()

语法：`obj.clearData(type);`

DataTransfer.clearData()方法接受一个字符串（表示数据类型）作为参数，删除事件所带的指定类型的数据。如果没有指定类型，则删除所有数据。如果指定类型不存在，则调用该方法不会产生任何效果。

注意，该方法只能在**dragstart**事件的监听函数之中使用，因为这是拖拉操作的数据唯一可写的时机。

#### setDragImage()

拖动过程中（dragstart事件触发后），浏览器会显示一张图片跟随鼠标一起移动，表示被拖动的节点。这张图片是自动创造的，通常显示为被拖动节点的外观，不需要自己动手设置。

语法：`obj.setDragImage(imgElement,offsetX,offsetY);`

DataTransfer.setDragImage()方法可以自定义这张图片。它接受三个参数。第一个是`<img>`节点或者`<canvas>`节点，如果省略或为null，则使用被拖动的节点的外观；第二个和第三个参数为鼠标相对于该图片左上角的横坐标和右坐标。

#### Gecko支持

+ mozClearDataAt()：删除指定索引处与给定格式相关的数据项。
+ mozGetDataAt()：取得指定索引处的与给定的格式相关联的数据项，如果不存在返回null。
+ mozSetDataAt()
+ mozTypesAt()：保存一个指定索引处被存储的数据格式类型的列表。
