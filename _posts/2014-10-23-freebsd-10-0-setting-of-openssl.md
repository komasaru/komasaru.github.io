---
layout   : single
title    : "FreeBSD 10.0 - 暗号化通信 OpenSSL 設定！"
published: true
date     : 2014-10-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- SSL
---

「FreeBSD 10.0 - 暗号化通信 OpenSSL 設定」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* ここでは秘密鍵の作成を行う。（証明書の作成は必要になった時にその都度行う）
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. 秘密鍵作成

``` text
# cd /etc/ssl
# openssl genrsa -des3 -out server.key 2048
[root@vbox ssl]# openssl genrsa -des3 -out server.key 2048
Generating RSA private key, 2048 bit long modulus
..................+++
...+++
e is 65537 (0x10001)
Enter pass phrase for server.key:              # <= パスワード入力
Verifying - Enter pass phrase for server.key:  # <= パスワード確認入力
```

### 2. パスワード削除

``` text
# openssl rsa -in server.key -out server.key
Enter pass phrase for server.key:              # <= パスワード応答
writing RSA key
```

### 3. アクセス権変更

``` text
# chmod 400 server.key
# cd
```

---

以上。

