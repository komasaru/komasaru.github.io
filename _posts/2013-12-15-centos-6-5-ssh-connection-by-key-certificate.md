---
layout   : single
title    : "CentOS 6.5 - SSH サーバ 鍵認証接続！"
published: true
date     : 2013-12-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- SSH
---

前回は CentOS 6.5 サーバに SSH サーバ OpenSSH をインストールしました。  
今回は OpenSSH サーバに鍵認証方式で接続する設定を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- OpenSSH 6.4-p1 構築済み。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. 鍵ペア（公開・秘密）の生成

クライアント側で以下のコマンドで公開鍵・秘密鍵を生成する。
作成先・ファイル名を指定しなければ、/home/(ユーザ名)/.ssh/ に id_rsa, id_rsa.pub が作成される。 途中、鍵用のパスワードも入力する。

``` text
$ ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/hoge/.ssh/id_rsa): /home/hoge/.ssh/id_rsa_vbox_centos
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/hoge/.ssh/id_rsa_vbox_centos.
Your public key has been saved in /home/hoge/.ssh/id_rsa_vbox_centos.pub.
The key fingerprint is:
96:af:59:18:9c:a0:c2:da:86:7e:d7:24:05:d0:31:da hoge@p183
The key's randomart image is:
+--[ RSA 2048]----+
|   .oo.          |
|    oo.          |
|   . Eo          |
| .   . + o       |
|  o . . S        |
| + . . o +       |
|o o   + . o      |
|.. . . . +       |
| .. .   o        |
+-----------------+
```

### 2. 公開鍵設定

サーバ側で公開鍵の設定を行う。（ログインしようと考えているユーザで作業する）

まず、公開鍵格納用ディレクトリを作成して、パーミッションを変更する。

``` text
$ mkdir -p ~/.ssh
$ chmod 700 ~/.ssh
```

次に、クライアント側で作成した公開鍵（"xxxx.pub"）の内容を丸ごとコピー＆ペーストして authorized_keys に保存する。

File: `~/.ssh/authorized_keys`

{% highlight bash linenos %}
ssh-rsa xxxxx・・・xxxxx
{% endhighlight %}

そして、"authorized_keys" のパーミッションを変更する。

``` text
$ chmod 600 ~/.ssh/authorized_keys
```

### 3. SSH サーバ設定ファイル編集

root ユーザになって、SSH サーバ設定ファイルを以下のように編集する。

File: `/etc/ssh/sshd_config`

{% highlight bash linenos %}
#Port 22
Port 9999                    # <= ポートはデフォルト設定から適当に変更

#Protocol 2
Protocol 2                   # <= SSH2 での接続のみ許可

#SyslogFacility AUTH
SyslogFacility AUTHPRIV      # <= ログを "/var/log/secure" に記録する（CentOS デフォルトに合わせる）

#PermitRootLogin yes
PermitRootLogin no           # <= root でのログイン禁止

#PasswordAuthentication yes
PasswordAuthentication no    # <= パスワードでのログイン禁止（鍵認証方式でのログインのみ許可）

#PermitEmptyPasswords no
PermitEmptyPasswords no      # <= パスワードなしでのログイン禁止

#ClientAliveInterval 0       # <= SSH 接続を途切れ府場合はコメント解除して設定を変更してみる
#ClientAliveCountMax 3       # <=       〃

# chroot 設定（最終行へ追加）
# 管理者用ユーザ（wheel グループ所属ユーザ）以外は、
# 一般ユーザが自身のホームディレクトリ以外を参照できないようにする。
Match Group *,!wheel
        ChrootDirectory /home/%u/./
{% endhighlight %}

### 4. wheel 設定

初期設定時に設定していても、SSH 再インストール時に解除されているので、再度管理者用ユーザを wheel グループに追加する。

``` text
# usermod -G wheel hoge
```

### 5. SSH サーバのリロード

変更した設定を反映させるために SSH サーバをリロードする。

``` text
# /etc/rc.d/init.d/sshd reload
sshd を再読み込み中:                                       [  OK  ]
```

### 6. SSH アクセス制限設定

パスワード認証による接続は許可していないのでログインされる心配はないが、大量にログ出力されて煩わしいので、SSH サーバへアクセスできるホストを制限する。
（指定のもの以外のアクセスは全て拒否する設定）

File: `/etc/hosts.allow`

{% highlight bash linenos %}
sshd: 127.0.0.1    # <= 自身のアクセスを許可
sshd: 192.168.11.  # <= 内部ネットワーク（例：192.168.11.XXX）からのアクセスを許可
{% endhighlight %}

File: `/etc/hosts.deny`

{% highlight bash linenos %}
sshd: ALL
{% endhighlight %}

### 7. クライアント側から接続

クライアントマシンから SSH 接続してみる。

``` text
$ ssh -i ~/.ssh/id_rsa ＜サーバ IP アドレス or ホスト名＞ -p ＜ポート番号＞
```

２回目からは以下でよい。

``` text
$ ssh ＜サーバ IP アドレス or ホスト名＞ -p ＜ポート番号＞
```

### 8. 注意

SSH のポートはデフォルトでは `22` となっているが、セキュリティ上変更するのが望ましい。  
また、ポートを変更した場合は、後に行うファイアウォールの設定でも変更したポートに編集する。（そうしないと、クライアントからの SSH 接続が接続中に切れやすくなる）

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、NTP サーバ構築について紹介する予定です。

以上。

