---
layout   : single
title    : "Debian 8 (Jessie) - サービスの管理！"
published: true
date     : 2015-06-03 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 8 (Jessie) でのサービスの管理についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* SystemD の簡単な使用法と SysVinit の導入を行う。  
  （当方、普段は SystemD でサービスの管理を行うが、有事の際に備えて `sysv-rc-conf` コマンドも使用できるよう準備しておく（RedHat 系ディストリビューションのサービス管理ツール `chkconfig` にあたるもの））

### 1. SystemD の使用方法

以下は vsftpd サーバの例。（`vsftpd.service` が正式なサービス名だが `.service` は省略可能）

``` text
$ systemctl start vsftpd        # <= vsftpd サービスの起動
$ systemctl stop vsftpd         # <= vsftpd サービスの停止
$ systemctl status vsftpd       # <= vsftpd サービスの状況確認
$ systemctl enable vsftpd       # <= vsftpd サービスの自動起動設定
$ systemctl disable vsftpd      # <= vsftpd サービスの自動起動解除
$ systemctl is-enabled vsftpd   # <= vsftpd サービスが自動起動設定されているか
$ systemctl list-unit-files -t service | grep vsftpd  # <= vsftpd 起動設定の確認
$ systemctl -t service          # <= 起動中サービス一覧の確認
$ systemctl -t service --all    # <= 全サービス一覧の確認
$ systemctl poweroff            # <= システム Shutdown 後電源 OFF
$ systemctl halt                # <= システム Shutdown 後 Halt
$ systemctl reboot              # <= システム Shutdown 後リブート
```

SystemD 未対応のサービスの場合でも自動で従来の SysVinit にサービスの管理を移譲しますが、 `systemctl list-unit-files` での確認はできないので注意。（現時点の Debian には多い）

### 2. sysv-rc-conf のインストール

``` text
# apt-get -y install sysv-rc-conf
```

### 3. sysv-rc-conf でサービス一覧表示

`sysv-rc-conf` でサービスの一覧を表示するには以下のようにする。

``` text
# sysv-rc-conf --list
acpid        2:on       3:on    4:on    5:on
bootlogs     1:on       2:on    3:on    4:on    5:on
clamav-daemo 0:off      1:off   2:on    3:on    4:on    5:on    6:off
clamav-fresh 0:off      1:off   2:on    3:on    4:on    5:on    6:off
console-setu S:on
         :
====< 途中省略 >====
         :
umountfs     0:off      6:off
umountroot   0:off      6:off
urandom      0:off      6:off   S:on
virtualbox-g 0:off      1:off   2:on    3:on    4:on    5:on    6:off
x11-common   S:on
```

### 4. sysv-rc-conf でのサービス自動起動設定

`sysv-rc-conf` でサービスの自動起動を有効化・無効化するには以下のようにする。

``` text
# sysv-rc-conf acpid off  # acpid の自動起動無効化する場合

# sysv-rc-conf acpid on   # acpid の自動起動有効化する場合
```

### 5. 一覧形式での自動起動設定

`sysv-rc-conf` をオプション無しで実行すると以下のような画面になる。（ある程度のサイズのコンソール画面が必要）  
`-` でサービス停止、`=`, `+` でサービス開始、スペースでランレベル別に ON/OFF できる。

``` text
┌ SysV Runlevel Config   -: stop service  =/+: start service  h: help  q: quit ┐
│                                                                              │
│ service      1       2       3       4       5       0       6       S       │
│ ---------------------------------------------------------------------------- │
│ acpid       [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]      │
│ bootlogs    [X]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]      │
│ clamav-da$  [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]      │
│ clamav-fr$  [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]      │
│ console-s$  [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]      │
│ cron        [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]      │
│ exim4       [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]      │
│ halt        [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]      │
│ kbd         [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]      │
│ keyboard-$  [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [ ]     [X]      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ Use the arrow keys or mouse to move around.      ^n: next pg     ^p: prev pg │
│                        space: toggle service on / off                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6. insserv コマンドの利用

`sysv-rc-conf` をインストールして使用しなくても、デフォルトで用意されている `insserv` コマンドを使用することも可能である。

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

