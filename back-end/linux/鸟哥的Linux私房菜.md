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

1. 标准输入　　(stdin) ：代码为 0 ，使用 < 或 <<
2. 标准输出　　(stdout)：代码为 1 ，使用 > 或 >>
3. 标准错误输出(stderr)：代码为 2 ，使用 2> 或 2>>

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

管道命令 `|` 只能处理前一个指令传来的标准输出，对于标准错误输出没有直接处理能力。

在每个管道命令后面接的必须为指令，并且这个指令要具有能够接受标准输出的能力，比如 less, more, tail 等。

#### 截取命令：cut,grep

截取命令就是将一段资料经过分析后，取出所需要的，或者是分析关键字，取得想要的那一行。它是针对一行一行来分析的。

cut 的主要用途就是将同一行里的资料进行分解，在处理多空格相连的数据时，比较吃力

```shell
[dmtsai@study ~]$ cut -d '分割字符' -f fields <==用于有特定的分隔字符
[dmtsai@study ~]$ cut -c 字符区间            <==用于排列整齐的资讯
選項與參數：
-d  ：後面接分隔字元。與 -f 一起使用；
-f  ：依據 -d 的分隔字元將一段訊息分割成為數段，用 -f 取出第幾段的意思；
-c  ：以字元 (characters) 的單位取出固定字元區間；

範例一：將 PATH 變數取出，我要找出第五個路徑。
[dmtsai@study ~]$ echo ${PATH}
/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/dmtsai/.local/bin:/home/dmtsai/bin
#      1      |    2   |       3       |    4    |           5           |      6         |

[dmtsai@study ~]$ echo ${PATH} | cut -d ':' -f 5
# 如同上面的數字顯示，我們是以『 : 』作為分隔，因此會出現 /home/dmtsai/.local/bin
# 那麼如果想要列出第 3 與第 5 呢？，就是這樣：
[dmtsai@study ~]$ echo ${PATH} | cut -d ':' -f 3,5

範例二：將 export 輸出的訊息，取得第 12 字元以後的所有字串
[dmtsai@study ~]$ export
declare -x HISTCONTROL="ignoredups"
declare -x HISTSIZE="1000"

[dmtsai@study ~]$ export | cut -c 12-
HISTCONTROL="ignoredups"
HISTSIZE="1000"
```

grep 可以解析一行文字，取得關鍵字，若該行有存在關鍵字，就會整行列出來。

```shell
[dmtsai@study ~]$ grep [-acinv] [--color=auto] '搜寻字串' filename
選項與參數：
-a ：將 binary 檔案以 text 檔案的方式搜尋資料
-c ：計算找到 '搜寻字串' 的次數
-i ：忽略大小寫的不同，所以大小寫視為相同
-n ：順便輸出行號
-v ：反向選擇，亦即顯示出沒有 '搜寻字串' 內容的那一行！
--color=auto ：可以將找到的關鍵字部分加上顏色的顯示！

範例一：將 last 當中，有出現 root 的那一行就取出來；
[dmtsai@study ~]$ last | grep 'root'
[dmtsai@study ~]$ last | grep 'root' |cut -d ' ' -f 1
```

#### 排序命令： sort, wc, uniq

sort 可以进行排序，而且可以根据不同的数据形态排序

```shell
[dmtsai@study ~]$ sort [-fbMnrtuk] [file or stdin]
選項與參數：
-f  ：忽略大小寫的差異，例如 A 與 a 視為編碼相同；
-b  ：忽略最前面的空白字元部分；
-M  ：以月份的名字來排序，例如 JAN, DEC 等等的排序方法；
-n  ：使用『純數字』進行排序(預設是以文字型態來排序的)；
-r  ：反向排序；
-u  ：就是 uniq ，相同的資料中，僅出現一行代表；
-t  ：分隔符號，預設是用 [tab] 鍵來分隔；
-k  ：以那個區間 (field) 來進行排序的意思

範例一：個人帳號都記錄在 /etc/passwd 下，請將帳號進行排序。
[dmtsai@study ~]$ cat /etc/passwd | sort
abrt:x:173:173::/etc/abrt:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
alex:x:1001:1002::/home/alex:/bin/bash
```

uniq 用于排序后，将重复的数据只列出一个，也就是去重。

```shell
[dmtsai@study ~]$ uniq [-ic]
選項與參數：
-i  ：忽略大小寫字元的不同；
-c  ：進行計數

範例一：使用 last 將帳號列出，僅取出帳號欄，進行排序後僅取出一位；
[dmtsai@study ~]$ last | cut -d ' ' -f 1 | sort | uniq
```

wc 用于列出文档里有多少字，多少行，多少字元

#### 双向重导向：tee

```shell
[dmtsai@study ~]$ tee [-a] file
選項與參數：
-a  ：以累加 (append) 的方式，將資料加入 file 當中！

[dmtsai@study ~]$ last | tee last.list | cut -d " " -f1
# 這個範例可以讓我們將 last 的輸出存一份到 last.list 檔案中；
```

#### 字符转换命令：tr, col, join, paste, expand

tr 用于删除一段信息中的文字或者进行文字的替换

```shell
[dmtsai@study ~]$ tr [-ds] SET1 ...
選項與參數：
-d  ：刪除訊息當中的 SET1 這個字串；
-s  ：取代掉重複的字元！

範例一：將 last 輸出的訊息中，所有的小寫變成大寫字元：
[dmtsai@study ~]$ last | tr '[a-z]' '[A-Z]'

範例二：將 /etc/passwd 輸出的訊息中，將冒號 (:) 刪除
[dmtsai@study ~]$ cat /etc/passwd | tr -d ':'
```

col 可以用来简单的处理将 tab 键替换成空白键

```shell
[dmtsai@study ~]$ col [-xb]
選項與參數：
-x  ：將 tab 鍵轉換成對等的空白鍵
```

join 用于处理两个文档之间的数据，主要是处理两个档案中，有相同数据的那一行，进行合并。

paste 直接将两个文件中的相同行拼接在一起，中间已 tab 键分隔

expand 也适用于将 tab 转换为空白键，还可以使用 unexpand 将空白键转换为 tab

#### 分割命令：split

split 用于将大的文档依据文档大小或者行数来进行分割

```shell
[dmtsai@study ~]$ split [-bl] file PREFIX
選項與參數：
-b  ：後面可接欲分割成的檔案大小，可加單位，例如 b, k, m 等；
-l  ：以行數來進行分割。
PREFIX ：代表前置字元的意思，可作為分割檔案的前導文字。

範例一：我的 /etc/services 有六百多K，若想要分成 300K 一個檔案時？
[dmtsai@study ~]$ cd /tmp; split -b 300k /etc/services services
[dmtsai@study tmp]$ ll -k services*
-rw-rw-r--. 1 dmtsai dmtsai 307200 Jul  9 22:52 servicesaa
-rw-rw-r--. 1 dmtsai dmtsai 307200 Jul  9 22:52 servicesab
-rw-rw-r--. 1 dmtsai dmtsai  55893 Jul  9 22:52 servicesac
# 那個檔名可以隨意取的啦！我們只要寫上前導文字，小檔案就會以xxxaa, xxxab, xxxac 等方式來建立小檔案的！

範例二：如何將上面的三個小檔案合成一個檔案，檔名為 servicesback
[dmtsai@study tmp]$ cat services* >> servicesback
```

#### 参数代换 xargs

xargs 可以读入 stdin 的数据，并以空白字符或者断行字符作为分辨，将 stdin 的资料分隔成为 arguments，并且传递给不支持管道命令的指令。

```shell
[dmtsai@study ~]$ xargs [-0epn] command
選項與參數：
-0  ：如果輸入的 stdin 含有特殊字元，例如 \` , \\, 空白鍵等等字元時，這個 -0 參數
      可以將他還原成一般字元。這個參數可以用於特殊狀態喔！
-e  ：這個是 EOF (end of file) 的意思。後面可以接一個字串，當 xargs 分析到這個字串時，
      就會停止繼續工作！
-p  ：在執行每個指令的 argument 時，都會詢問使用者的意思；
-n  ：後面接次數，每次 command 指令執行時，要使用幾個參數的意思。
當 xargs 後面沒有接任何的指令時，預設是以 echo 來進行輸出喔！
```

#### 关于减号 - 的用途

在管道命令中，常常会使用到钱一个指令的 stdout 作为这次的 stdin，某些指令需要用到档案名来进行处理时，该 stdin 与 stdout 可以利用减号 - 来代替。

```shell
[root@study ~]# mkdir /tmp/homeback
[root@study ~]# tar -cvf - /home | tar -xvf - -C /tmp/homeback
```

## 十一、正则表达式与文件格式化处理
