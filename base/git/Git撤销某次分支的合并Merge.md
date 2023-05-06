# Git撤销某次分支的合并Merge

> 原文[Git撤销某次分支的合并Merge](https://www.cnblogs.com/meetuj/p/13208690.html)

## 问题描述

某天，所有的开发文件已经在dev分支上，但是这时候，线上出了一个问题，需要及时修复，于是从master分支上，拉了一个bug分支，进行处理，
master分支本应合并bug分支，结果合并了dev分支，而且还commit，并推到了远端的master分支，这时候才发现出了问题，于是乎，问题就来了

## 方法一：无法强推

1. 找到最后一次提交到master分支的commit_id，即merge前的commit_id，也就是目标要回退到的commit_id
2. 执行回退
    ```shell
    git reset --hard commit_id
    #执行完成后，此时本地已经回退到了上一次提交的版本，但是远程仍然是被改变的版本。
    ```
3. 重新创建一个分支,这时候的分支就是上一次提交的代码
    ```shell
    git checkout -b newmaster
   ```
4. 推到对应的远程newmaster
    ```shell
    git push origin newmaster:newmaster
   ```
5. 这个时候相当于备份做好了，接下来就可以删除本地及远端的master分支
    ```shell
    git branch -d master
    git push --delete origin master
   ```
6. 从newmaster分支，重新在创建master分支，并推向远端
    ```shell
    git checkout -b master origin/newmaster
    git push master:master
   ```
   
## 方法2：需强推远程

1. 找到最后一次提交到master分支的commit_id，即merge前的commit_id，也就是目标要回退到的commit_id
2. 执行回退
    ```shell
    git reset --hard commit_id
    #执行完成后，此时本地已经回退到了上一次提交的版本，但是远程仍然是被改变的版本。
   ```
3. 强推远程
    ```shell
    git push origin HEAD --force #远程提交回退
   ```
