---
layout   : single
title    : "Debian 9 (Stretch) - サービスの管理！"
published: true
date     : 2017-08-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 9 (Stretch) でのサービスの管理についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* SystemD の簡単な使用法の説明と SysVinit の導入を行う。  
  （当方、普段は SystemD でサービスの管理を行うが、有事の際に備えて `sysv-rc-conf` コマンドも使用できるよう準備しておく（RedHat 系ディストリビューションのサービス管理ツール `chkconfig` にあたるもの））
* root ユーザでの作業を想定。

### 1. SystemD の使用方法

以下は vsftpd サーバの例。（`vsftpd.service` が正式なサービス名だが `.service` は省略可能）

``` text
$ systemctl start vsftpd        # <= vsftpd サービスの起動
$ systemctl stop vsftpd         # <= vsftpd サービスの停止
$ systemctl status vsftpd       # <= vsftpd サービスの状況確認
$ systemctl enable vsftpd       # <= vsftpd サービスの自動起動設定
$ systemctl disble vsftpd       # <= vsftpd サービスの自動起動解除
$ systemctl is-enabled vsftpd   # <= vsftpd サービスが自動起動設定されているか
$ systemctl list-unit-files -t service | grep vsftpd  # <= vsftpd 起動設定の確認
$ systemctl -t service          # <= 起動中サービス一覧の確認
$ systemctl -t service --all    # <= 全サービス一覧の確認
$ systemctl poweroff            # <= システム Shutdown 後電源 OFF
$ systemctl halt                # <= システム Shutdown 後 Halt
$ systemctl reboot              # <= システム Shutdown 後リブート
```

SystemD 未対応のサービスの場合でも自動で従来の SysVinit にサービスの管理を移譲しますが、その場合は `systemctl list-unit-files` での確認はできないので注意。

### 2. sysv-rc-conf のインストール

``` text
# apt -y install sysv-rc-conf
```

### 3. sysv-rc-conf でサービス一覧表示

`sysv-rc-conf` でサービスの一覧を表示するには以下のようにする。

``` text
# sysv-rc-conf --list
chrony       0:off      1:off   2:on    3:on    4:on    5:on    6:off
clamav-daemo 0:off      1:off   2:on    3:on    4:on    5:on    6:off
clamav-fresh 0:off      1:off   2:on    3:on    4:on    5:on    6:off
cron         2:on       3:on    4:on    5:on
dbus         2:on       3:on    4:on    5:on
         :
====< 途中省略 >====
         :
sudo
udev         S:on
ufw          1:off      S:on
unattended-u 0:off      2:on    3:on    4:on    5:on    6:off
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
┌ SysV Runlevel Config   -: stop service  =/+: start service  h: help  q: qu$ ┐
│                                                                             │
│ service      1       2       3       4       5       0       6       S      │
│ --------------------------------------------------------------------------$ │
│ chrony      [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]     │
│ clamav-da$  [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]     │
│ clamav-fr$  [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]     │
│ cron        [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]     │
│ dbus        [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]     │
│ exim4       [ ]     [X]     [X]     [X]     [X]     [ ]     [ ]     [ ]     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ Use the arrow keys or mouse to move around.      ^n: next pg     ^p: prev $ │
│                        space: toggle service on / off                       │
└─────────────────────────────────────────────────────────────────────────────
```

### 6. insserv コマンドの利用

`sysv-rc-conf` をインストールして使用しなくても、デフォルトで用意されている `insserv` コマンドを使用することも可能である。

以下のコマンドでサービスの一覧（終了・起動時のランレベル等）を表示する。（`-s` は `--showall` でもよい）

``` text
# insserv -s
K:01:0 1 6:chrony
K:03:0 1 6:rsyslog
K:02:0 6:networking
K:04:0 6:hwclock.sh
K:01:0 6:unattended-upgrades
         :
====< 途中省略 >====
         :
S:01:2 3 4 5:console-setup.sh
S:03:S:x11-common
S:03:S:procps
S:02:S:keyboard-setup.sh
S:05:S:kmod
S:02:2 3 4 5:sudo
```

サービスの自動起動を無効化するには以下のようにする。（`-r` は `--remove` でもよい）

``` text
# insserv -r hoge
```

サービスの自動起動を有効化するには以下のようにする。（`-d` は `--default` でもよい）

``` text
# insserv -d hoge
```

---

以上。

