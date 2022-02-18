# 鸟哥的 Linux 私房菜

## 十、认识与学习 BASH

### 变量功能

變數就是以一組文字或符號等，來取代一些設定或者是一串保留的資料

#### 变量的取用与设置：echo, 变量设置规则, unset

获取变量：echo

```shell
[dmtsai@study ~]$ echo $variable
[dmtsai@study ~]$ echo ${PATH}
/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/dmtsai/.local/bin:/home/dmtsai/bin
```

变量设置规则

1. 变量与变量内容以一个等号'='来链接
2. 等号两边不能直接接空白字符
3. 变量名称只能是英文字母与数字，但是开头字符不能是数字
4. 变量内容若有空白字符可使用双引号'"'或单引号'''将变量内容结合起来，双引号内的$可以解析变量，而单引号包裹内容都视为纯文本
5. 可用跳脱字符『 \ 』将特殊符号（如 [Enter]， $， \， 空白字符， '等）变成一般字符
6. 若该变量为扩增变量内容时，则可用 "$变量名称" 或 ${变数} 累加内容
7. 若该变量需要在其他子程序执行，则需要以 export 来使变量变成环境变量
8. 取消变量的方法为使用 unset ：『unset 变量名称』

#### 环境变量的功能

用 env 查看环境变量

```shell
[dmtsai@study ~]$ env
HOSTNAME=study.centos.vbird    <== 主机的名称
TERM=xterm                     <== 终端机使用的环境是什么类型
SHELL=/bin/bash                <== 目前的环境下，使用的shell是哪一个
```

用 set 观察所有变量，不止环境变量还有 bash 内的变量等等

export 将自定义变量转换为环境变量，用于父子进程之间共享

#### 变量从键盘读取、数组与宣告

read：最常被用在 shell script 的撰写档中，跟使用者对话。

```shell
[dmtsai@study ~]$ read [-pt] variable
選項與參數：
-p  ：後面可以接提示字元！
-t  ：後面可以接等待的『秒數！』這個比較有趣～不會一直等待使用者啦！

[dmtsai@study ~]$ read atest
This is a test        <==此時游標會等待輸入！請輸入左側文字看看
[dmtsai@study ~]$ echo ${atest}
This is a test          <==剛剛輸入的資料已經變成一個變數內容！
```

declare/typeset：声明变量的类型

```shell
[dmtsai@study ~]$ declare [-aixr] variable
選項與參數：
-a  ：將後面名為 variable 的變數定義成為陣列 (array) 類型
-i  ：將後面名為 variable 的變數定義成為整數數字 (integer) 類型
-x  ：用法與 export 一樣，就是將後面的 variable 變成環境變數；
-r  ：將變數設定成為 readonly 類型，該變數不可被更改內容，也不能 unset
```

数组变量类型：var[index]=content

#### 变量内容的删除，取代与替换

### 命令别名与历史命令

#### 命令别名设定：alias, unalias

#### 历史命令：history

查詢曾經下達過的指令

### 资料流重导向

将某个命令执行后应该要出现在屏幕上的内容，给传输到其他的地方。

#### 什么是资料流重导向

standard output：标准输出，指令执行所回传的正确的信息
standard error output：标准错误输出，指令执行失败所回传的错误信息

1. 標準輸入　　(stdin) ：代碼為 0 ，使用 < 或 <<
2. 標準輸出　　(stdout)：代碼為 1 ，使用 > 或 >>
3. 標準錯誤輸出(stderr)：代碼為 2 ，使用 2> 或 2>>

`>` 与 `>>` 区别是 `>` 为覆盖，而 `>>` 为累加

/dev/null 垃圾桶黑洞装置与特殊写法

```shell
# 如果要将错误信息忽略掉而不显示或存储，使用/dev/null
[dmtsai@study ~]$ find /home -name .bashrc 2> /dev/null
# 如果要将正确和错位信息写到一个文件中，使用 2>&1 或者 &>
[dmtsai@study ~]$ find /home -name .bashrc > list 2>&1
[dmtsai@study ~]$ find /home -name .bashrc &> list
```

standard input： < 与 <<

```shell
範例七：用 stdin 取代鍵盤的輸入以建立新檔案的簡單流程
[dmtsai@study ~]$ cat > catfile < ~/.bashrc
[dmtsai@study ~]$ ll catfile ~/.bashrc
```

标准输入的 `<<` 代表 結束的输入字符。

```shell
[dmtsai@study ~]$ cat > catfile << "eof"
> This is a test.
> OK now stop
> eof  <==輸入這關鍵字，立刻就結束而不需要輸入 [ctrl]+d
```

#### 命令执行的判断依据

`cmd ; cmd` 多个命令间用分号分隔，可以一次执行多个命令，不考虑命令间的相关性

`cmd1 && cmd2` cmd1 执行完毕且正确执行，则开始执行 cmd2；若 cmd1 执行完毕且为错误，则 cmd2 不执行

`cmd1 || cmd2` cmd1 执行完毕且正确执行，则不执行 cmd2；若 cmd1 执行完毕且为错误，则 cmd2 执行

### 管道命令(pipe)
