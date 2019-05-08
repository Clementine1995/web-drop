# 常见的css默认样式

在页面开发中，如果没有使用一些UI框架，自己使用原生的标签，在不同浏览器里可能表现会不符合自己的预期。

+ chrome下button，input等focus默认边框。默认情况下Chrome会给他们加一个蓝色的边框，这一点可以在控制台勾选上:focus看到`outline: -webkit-focus-ring-color auto 5px;`这么一条样式，如果不想要可以直接设置`outline:none`来解决。
+ ios下nput 和textarea表单默认会有个内阴影，一定程度上影响视觉一致，可以通过`-webkit-appearance: none;`来去掉它。
+ a标签的:visited伪类，是否访问过某网站是由浏览器记住的，:link、:visited、:hover、:actived的顺序可以让着四个效果都显示出来，想要去掉a标签的下划线使用`text-decoration:none`
+ ul无序列表标签，默认会在li项的前面加上圆点，如果需要去掉的话需要使用`list-style:none`来清除。

todo~