---
layout   : single
title    : "Heroku - コマンドラインツール Heroku Toolbelt のインストール！"
published: true
date     : 2014-12-05 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Heroku
---

PaaS 環境 Heroku を使用する準備として、 Heroku コマンドを使えるようにするために Heroku Toolbelt というものをインストールします。

以下、その記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。
* Git 環境が構築済みであること。（当方は、 Git 1.9.1 の環境が構築済み）
* Heroku アカウント作成済みであることを想定。（アカウント作成は、 "[Heroku](http://www.heroku.com/ "Heroku | Cloud Application Platform")" サイトにアクセしてメールアドレスの登録後、パスワードを設定する程度）

### 1. Heroku Toolbelt のインストール

"[Heroku Toolbelt](https://toolbelt.heroku.com/ "Heroku Toolbelt")" にアクセスすると、使用している OS に合わせてアクティブになる。  
当方の場合は Linux Mint なので "Debian/Ubuntu" がアクティブになり、以下のようなコマンドが表示された。

``` text
$ wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh
```

このコマンドをローカル環境の端末にコピー＆ペーストして実行する。

### 2. Heroku Toolbelt インストール確認

以下のコマンドで Heroku Toolbelt がインストールされたか確認する。

``` text
$ heroku version
heroku-toolbelt/3.16.2 (x86_64-linux) ruby/2.1.5
```

### 3. Heroku ログイン認証

Heroku アカウントとローカル環境の Heroku コマンドを紐付けるために、認証しておく必要がある。

ローカル環境で以下のように実行する。  
（登録済みのメールアドレスとパスワードを入力する）

``` text
$ heroku login
Enter your Heroku credentials.
Email: hogehogehoge@fugafugafuga.com
Password (typing will be hidden):
Your Heroku account does not have a public ssh key uploaded.
Found the following SSH public keys:
1) id_rsa.pub
2) id_rsa_hoge.pub
3) id_rsa_fuga.pub
Which would you like to use with your Heroku account? 1
Uploading SSH public key /home/hogehogehoge/.ssh/id_rsa.pub... done
Authentication successful.
```

（当方のように、 SSH キー設定が複数存在するような場合は選択することになるだろう。但し、２回目以降は問われない）

### 4. アカウント確認

Heroku コマンドと紐付いているアカウントを確認するには以下のようにする。

``` text
$ heroku auth:whoami
hogehogehoge@fugafugafuga.com
```

---

これで、 PaaS 環境 Heroku でアプリを運用する準備が整いました。 Rails アプリ等をアップして運用してみるとよいでしょう。

当方は自宅サーバ派なので、 Heroku で本格的に Rails アプリ等を運用することは（今のところ）考えていません。（簡単なテスト等を行うくらい）  
Rails アプリ以外で Heroku で本格運用してみたいと考えているものはありますが。

以上。

