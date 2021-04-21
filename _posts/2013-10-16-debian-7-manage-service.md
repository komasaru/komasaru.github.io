---
layout   : single
title    : "Debian 7 Wheezy - サービスの管理！"
published: true
date     : 2013-10-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 7.1.0 サーバでのサービスを管理する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0(Wheezy) での作業を想定。
- 最近は `update-rc.d` コマンドは非推奨となっていることを認識しておく。

### 1. sysv-rc-conf のインストール

CentOS 等の RedHat 系ディストリビューションのサービス管理ツール `chkconfig` にあたる `sysv-rc-conf` というツールを使用することができる。  
インストールは以下のようにする。

``` text 
# aptitude -y install sysv-rc-conf
```

### 2. sysv-rc-conf でサービス一覧表示

`sysv-rc-conf` でサービスの一覧を表示するには以下のようにする。

``` text 
# sysv-rc-conf --list
acpid        2:on       3:on    4:on    5:on
bootlogs     1:on       2:on    3:on    4:on    5:on
console-setu S:on
cron         2:on       3:on    4:on    5:on
halt         0:off
         :
====< 途中省略 >====
         :
umountfs     0:off      6:off
umountroot   0:off      6:off
urandom      0:off      6:off   S:on
virtualbox-g 0:off      1:off   2:on    3:on    4:on    5:on    6:off
x11-common   S:on
```

### 3. sysv-rc-conf でのサービス自動起動設定

`sysv-rc-conf` でサービスの自動起動を有効化・無効化するには以下のようにする。

``` text 
# sysv-rc-conf acpid off  # <= acpid の自動起動無効化

# sysv-rc-conf acpid on   # <= acpid の自動起動有効化
```

### 4. 一覧形式での自動起動設定

`sysv-rc-conf` をオプション無しで実行すると以下のような画面になる。  
`-` でサービス停止、`=`, `+` でサービス開始、スペースでランレベル別に ON/OFF できる。

``` text 
┌ SysV Runlevel Config   -: stop service  =/+: start service  h: help  q: quit ────────────┐
│                                                                                          │
│ service      1       2       3       4       5       0       6       S                   │
│ ----------------------------------------------------------------------------             │
│ acpid       [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]                  │
│ bootlogs    [X]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]                  │
│ console-s$  [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]                  │
│ cron        [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]                  │
│ halt        [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]                  │
│ kbd         [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]                  │
│ keyboard-$  [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]                  │
│ killprocs   [X]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]                  │
│ kmod        [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]                  │
│ lvm2        [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]                  │
│ motd        [X]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]                  │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Use the arrow keys or mouse to move around.      ^n: next pg     ^p: prev pg             │
│                        space: toggle service on / off                                    │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5. insserv コマンドの利用

`sysv-rc-conf` をインストールして使用しなくても、`insserv` コマンドを使用することも可能である。

以下のコマンドでサービスの一覧（終了・起動時のランレベル等）を表示する。

``` text 
# insserv -s  # <= もしくは --showall オプション
K:01:0 6:urandom
K:06:0 6:umountfs
K:04:0 6:hwclock.sh
K:04:0 6:umountnfs.sh
K:05:0 6:networking
         :
====< 途中省略 >====
         :
S:07:S:kmod
S:08:S:checkfs.sh
S:07:S:checkroot-bootclean.sh
S:11:S:udev-mtab
S:05:S:lvm2
```

サービスの自動起動を無効化するには以下のようにする。

``` text 
# insserv -r hoge
```

サービスの自動起動を有効化するには以下のようにする。

``` text 
# insserv -d hoge
```

---

以上。

