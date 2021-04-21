---
layout   : single
title    : "Debian GNU/Linux Wheezy - root のパスワードが消えた！"
published: true
date     : 2015-02-05 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux Wheezy (7.8.0) での作業中に root のパスワードが消滅し root ユーザになれなくなったため、原因の調査を行い対策を施しました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux Wheezy (7.8.0) での作業を想定。

### 1. 現象

一般ユーザから root になろうとすると以下のようなエラーが出るようになった。（今までエラーにならなかったのに）

``` text
$ su -
Password:
su: Authentication failure
```

そればかりか、SSH 接続ではなく当該マシン上で直接 root でログインしようとしてもログインできない。

しかし、一般ユーザで `sudo` コマンドは使用可能。

### 2. 原因調査

直前に一般ユーザを一括で作成する（`newusers` コマンドを使用したシェルスクリプトでの）作業をしていたので、誤って何かを編集したのではないかと思い、"/etc/passwd", "/etc/aliases", "/etc/pam.d/su" 等を確認するも、特に怪しい箇所は見当たらない。

以下のように SUID パーミッションを確認してみるが、問題ない。

``` text
$ ls -l /bin/su
-rwsr-xr-x 1 root root 36816 May 26  2012 /bin/su 
```

### 3. 対策

試しに root ユーザのパスワードを変更してみたら、root ユーザになれるようなった。root での直接ログインも可能になった。  
やはり、何らかの誤操作で root のパスワードが削除されてしまってたようだ。（全く心当たりがないが）

``` text
$ sudo su -

# passwd
Enter new UNIX password:
Retype new UNIX password:
passwd: password updated successfully

# exit
logout

$ su -
Password:
#
```

（`$` は一般ユーザのプロンプト、 `#` は root ユーザのプロント）

---

今回の作業の肝となるところは、 `sudo` コマンドが効くので「`sudo su -` を使用してその後の作業を行う」というところでした。

以上。

