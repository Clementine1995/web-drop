# Charles的使用

## 一、简单介绍

- Charles 是在 PC 端常用的网络封包截取工具，通过将自己设置成系统的网络访问代理服务器，使得所有的网络访问请求都通过它来完成，从而实现了网络封包的截取和分析。除了在做移动开发中调试端口外，Charles 也可以用于分析第三方应用的通讯协议。配合 Charles 的 SSL 功能，Charles 还可以分析 Https 协议。
- Charles 通过将自己设置成系统的网络访问代理服务器，使得所有的网络访问请求都通过它来完成，从而实现了网络封包的截取和分析。

### 主要功能

- 截取 Http 和 Https 网络封包
- 支持重发网络请求
- 支持修改网络请求参数，可用于数据mock，做接口测试
- 支持网络请求的截获并动态修改，可用于数据mock，做接口测试
- 支持模拟慢速网络
- 支持map local本地文件，可用于前后端调试

## 二、主界面介绍

### 1.工具导航栏

![工具导航栏](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827164606.png?token=AGJNUS7YJTPACT5522RKSOK5MTXAW)

- 清除所有请求
- 开始和停止录制
- 开始/停止网络截流
- 开始/停止 断点
- 编辑请求
- 请求重发
- 验证选中的请求，验证项可[参考](https://www.charlesproxy.com/documentation/tools/validate/)
- 常用功能，包含了 Tools 菜单中的常用功能。
- 常用设置，包含了 Proxy 菜单中的常用设置。

### 2.主界面视图

Charles界面提供两种视图，分别名为Structure和 Sequence：

- Structure： 此视图将网络请求按访问的域名分类
- Sequence： 此视图将网络请求按访问的时间排序

#### Structure视图

![Structure视图](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827164826.png?token=AGJNUS6M5O6QSXMO2ATSIA25MTXJ4)

#### Sequence视图

![Sequence视图](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827165205.png?token=AGJNUS4IYW5R4EGMYA63SAK5MTXXO)

选择sequence视图，可以在点击列表头部的信息，进行排序。例如点击“start”可以根据请求开始时间倒序顺序排列所有请求

### 3.Charles菜单

- 主菜单
   包括File、Edit、View、Proxy、Tools、Window、Help。用的最多的主菜单分别是 Proxy 和 Tools
   Proxy 菜单包含以下功能：
  - Start/Stop Recording：开始/停止记录会话。
  - Start/Stop Throttling：开始/停止节流。
  - Enable/Disable Breakpoints：开启/关闭断点模式。
  - Recording Settings：记录会话设置。
  - Throttle Settings：节流设置。
  - Breakpoint Settings：断点设置。
  - Reverse Proxies Settings：反向代理设置。
  - Port Forwarding Settings：端口转发。
  - Windows Proxy：记录计算机上的所有请求。
  - Proxy Settings：代理设置。
  - SSL Proxying Settings：SSL 代理设置。
  - Access Control Settings：访问控制设置。
  - External Proxy Settings：外部代理设置。
  - Web Interface Settings：Web 界面设置。

#### View

**Focused Hosts**: 只关注你想要关注的来源的请求，其他域名的都放在other hosts中，配置支持正则。

![Focused Hosts](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827165554.png?token=AGJNUS6JDAEWV6EXQYCWFLS5MTYFW)

#### Proxy

1.Recording Settings 录制设置

![Recording Settings](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827165746.png?token=AGJNUS2TTOI7DBKUVNUBQSK5MTYMW)

Options：通过 Recording Size Limits 限制记录数据的大小。当 Charles 记录时，请求、响应头和响应体存储在内存中，或写入磁盘上的临时文件。有时，内存中的数据量可能会变得太多，Charles 会通知您并停止录制。在这种情况下，您应该清除 Charles 会话以释放内存，然后再次开始录制。在录制设置中，您可以限制 Charles 将记录的最大大小; 这根本不会影响你的浏览，Charles 仅会停止录制。
Include：只有与配置的地址匹配的请求才会被录制
Exclude：与配置的地址匹配的请求将不会被录制

2.Throttle Settings(节流设置)

![Throttle Settings](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827170120.jpg?token=AGJNUS7AWB5NXT7WS43NZOK5MTY2A)

勾选 Enable Throttling 启用网速模拟配置，在 Throttle Preset 下选择网络类型即可，具体设置可以根据实际情况自行设置。如果只想模拟指定网站的慢速网络，可以再勾选上图中的 Only for selected hosts 项。

3.Breakpoints Settings(断点设置)

![Breakpoints Settings](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827170531.jpg?token=AGJNUS3OTAS2W7L6SNSBVXC5MTZLY)

可选择只断点 request 或 response。配置支持正则

4.Proxy Settings(代理设置)

手机端设置代理需要关注设置的代理端口号，例如8889

![Proxy Settings](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827171207.png?token=AGJNUS4MPABC7UNYF27V4MK5MT2DA)

5.SSL Proxy Settings(SSL 代理设置)

如果需要抓取https协议，必须enable ssl proxying

![SSL Proxy Settings](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827171408.png?token=AGJNUS6YPKEVNBOSNT2YD6K5MT2KM)

6.Access Control Settings(访问控制设置)

外部设备访问的ip列表，只有在列表中才是会被允许使用此代理

![SSL Proxy Settings](https://raw.githubusercontent.com/Clementine1995/pic-shack/master/img/20190827171535.png?token=AGJNUS3LLJ4SMSW6XFRFDUC5MT2P4)

#### Tools

1.No Caching Settings(禁用缓存)

No Caching 工具可防止客户端应用程序（如 Web 浏览器）缓存任何资源。因此，始终向远程网站发出请求，您始终可以看到最新版本。

2.Block Cookies Settings(禁用 Cookie)

Block Cookies 工具阻止了 Cookie 的发送和接收。它可用于测试网站，就像在浏览器中禁用了 Cookie 一样。

Block Cookies 工具通过操纵控制响应 Cookies 的 HTTP 请求头来禁用 Cookies。从请求中移除 Cookie 请求头，防止 Cookie 值从客户端应用程序（例如 Web 浏览器）发送到远程服务器。从响应中删除 Set-Cookie 请求头，防止请求设置客户端应用程序从远程服务器接收的 Cookie。

3.Map Remote Settings(远程映射)

Map Remote 工具根据配置的映射更改请求站点，以便从新站点透明地提供响应，就好像这是原始请求一样。

4.Map Local Settings(本地映射)

Map Local 工具使您可以使用本地文件，就像它们是远程网站的一部分一样。您可以在本地开发文件，并像在线上一样测试它们。本地文件的内容将返回给客户端，就像它是正常的远程响应一样。

Map Local 可以大大加快开发和测试速度，否则您必须将文件上传到网站以测试结果。使用 Map Local，您可以在开发环境中安全地进行测试。

当请求与 Map Local 映射匹配时，它会检查与路径匹配的本地文件。它不包括查询字符串（如果有）。如果在本地找到所请求的文件，则将其作为响应返回，就好像它是从远程站点加载的一样，因此它对客户端是透明的。如果在本地找不到所请求的文件，那么该请求会像平常一样由网站提供，返回由真正的服务器提供的数据。

5.Rewrite Settings(重写)

Rewrite 工具允许创建请求和响应在通过 Charles 时修改他们的规则。如：添加或更改头信息、搜索和替换响应内容中的某些文本等。

6.Black List Settings(黑名单)

Black List 工具允许输入应该被阻止的域名。当 Web 浏览器尝试从被列入黑名单的域名请求任何页面时，该请求将被 Charles 阻止。您还可以输入通配符来阻止其子域名。

7.White List Settings(白名单)

Black List 工具允许输入仅仅被允许的域名。Black List 工具将阻止除被列入白名单的域名之外的所有请求。

白名单工具用于仅允许指定的域名；黑名单工具，用于仅屏蔽指定的域名。

如果一个请求与“黑名单”和“白名单”都匹配，则该请求会被阻止。

8.Compose(编辑修改)

Compose 工具允许在原有的请求基础上修改。

9.Repeat(重复)

Repeat 工具允许选择一个请求并重复它，可以用于接口测试，相较于postman，不用配置header，cokie，参数，直接修改即可，更加方便。

10.Repeat Advanced(高级重复)

Repeat Advanced 工具扩展了 Repeat 工具，提供了迭代次数和并发数的选项。这对于负载测试非常有用。

11.Validate(验证)

`https://www.charlesproxy.com/documentation/tools/validate/`

前端测试可用

Validate 工具允许 Charles 通过将它们发送到 W3C HTML 验证器、W3C CSS 验证器和 W3C Feed 验证器来验证记录的响应。

验证报告在 Charles 中显示，其中包含与响应源中相应行相关联的任何警告或错误（双击错误消息中的行号可以切换到源视图）。

因为 Charles 测试它记录的响应，所以它可以测试不易测试的场景，例如在提交表单后呈现错误消息。

12.Import/Export Settings(导入/导出)

Import/Export 工具允许导入/导出 Charles 的 Proxy、Tools、Preferences 等设置。

可以导入他人的配置供自己使用，就不用另行配置了。

13.Profiles(配置)

Profiles 包含所有配置设置的完整副本。

每次更改当前设置时，系统都会更新当前活动的配置文件，当您更改活动配置文件时，所有设置都将恢复为上次使用该配置文件时的状态。

请注意，如果导入已保存的配置，则会覆盖当前配置文件的设置。建议使用导入/导出来备份或创建当前配置和配置文件的快照，以维护多个并行工作区。

## 三、使用方法

### pc

- 确保Start Recoding是开启状态
- 勾选proxy->mac OS Proxy/Window Proxy

### 移动端

首先使移动端设备和pc在一个局域网内

- 电脑端配置
  - 打开 Charles 的代理功能：通过主菜单打开 Proxy | Proxy Settings 弹窗，查看端口号port（默认是8888）
  - 查看pc的ip，主菜单 Help | Local IP Address，或者终端命令行查看
- 手机端配置
  - 打开wifi的更多设置->代理设置，输入pc的ip和charles设置的port

### 通过 Charles 进行 HTTPS 抓包

HTTPS 的抓包需要在 HTTP 抓包基础上再进行设置。需要完成一下步骤：

- 完成 HTTP 抓包配置。
- 电脑端安装 Charles 证书：通过 Charles 的主菜单 Help | SSL Proxying | Install Charles Root Certificate 安装证书。
- 设置 SSL 代理：通过主菜单打开 Proxy | SSL Proxy Settings 弹窗，勾选Enable SSL proxying
- 移动端安装 Charles 证书：通过 Charles 的主菜单 Help | SSL Proxying | Install Charles Root Certificate on a Mobile Device or Remote Browser 安装证书
- 设置好之后，我们打开手机上的任意需要网络请求的程序，就可以看到 Charles 弹出手机请求连接的确认菜单（只有首次弹出），点击 Allow 即可完成设置。

## 四、常见问题

### https协议抓包问题

查看是否未生效ssl配置，proxy-> ssl proxying settings，勾选上enable ssl proxy，并填写上host和port

### 配置未生效

- 查看是否勾选了enable ...
- 重启charles

### 无法记录任何请求

- 检查是否打开了 proxy -> start recording
- pc端：检查是否开启了proxy->maxos/windows proxy
- pc端：查看应用是否设置了使用本地代理，例如postman->settings->proxy->on
- pc端代理：查看是否安装了证书
- 移动端代理：查看是否配置了代理的ip和端口
- 移动代理：确认是否安装了证书，ios某些版本需要通用->关于本机->证书信任设置中  设置信任证书
- 移动端代理：查看pc中的proxy->access control settings是有允许设备对应的ip访问
