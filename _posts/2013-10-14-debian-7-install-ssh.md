---
layout   : single
title    : "Debian 7 Wheezy - SSH サーバ構築！"
published: true
date     : 2013-10-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- SSH
---

Debian GNU/Linux 7.1.0 に SSH サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- 「[Debian 7 Wheezy - インストール（サーバ用途・最小構成）！]({{site.baseurl}}/2013/10/09/debian-7-install-for-small-server "Debian 7 Wheezy - インストール（サーバ用途・最小構成）！")」の方法でインストールが完了していることを想定。
- 「[Debian 7 Wheezy - サーバ初期設定！]({{site.baseurl}}/2013/10/10/debian-7-setting "Debian 7 Wheezy - サーバ初期設定")」の方法で初期設定が完了していることを想定。
- サーバの IP アドレス `192.168.11.102`、ホスト名 `vbox`、ユーザ名 `masaru` を想定。
- クライアント側は Linux Mint 14(64bit) を想定。
- SSH 接続に Putty, TeraTerm 等のツールは使用しない。端末コンソールから接続する。

### 1. SSH サーバインストール

以下のようにして SSH サーバをインストールする。

``` text 
# aptitude -y install ssh
```

### 2. SSH 設定ファイル編集

root でログインできないよう、設定ファイルを編集する。  
ポートもデフォルトの 22 から変更する。（必須）

File: `/etc/ssh/sshd_config`

{% highlight bash linenos %} 
#Port 22
Port 9999           # <= 適当に変更

#PermitRootLogin yes
PermitRootLogin no  # <= 変更
{% endhighlight %}

### 3. SSH サーバ再起動

設定を有効化するため、SSH サーバを再起動する。

``` text 
# /etc/init.d/ssh restart
```

### 4. パスワード接続

クライント側の端末コンソールからサーバに接続してみる。  
"Are you sure you want to continue connecting (yes/no)?" で `yes` 応答、その後パスワードを入力すれば接続できる。

``` text 
# ssh 192.168.11.102 -p 9999
The authenticity of host '192.168.11.102 (192.168.11.102)' can't be established.
ECDSA key fingerprint is 87:ed:8e:29:1f:c8:89:ee:6b:5c:c4:3f:a5:23:12:c5.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '192.168.11.102' (ECDSA) to the list of known hosts.
masaru@192.168.11.102's password:
Linux vbox 3.2.0-4-amd64 #1 SMP Debian 3.2.46-1+deb7u1 x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Mon Sep 30 10:00:19 2013
masaru@vbox:~$
```

クライアント側のユーザがサーバ側と異なる場合は、以下のようにユーザ名も指定する。

``` text 
# ssh hoge@192.168.11.102 -p 9999
```

以降、サーバ操作時にクライアント側の端末コンソールから行なう。  
クライント側からリモート接続すれば、文字化けしていた日本語も正常に表示されるはず。

### 5. 鍵ペア（公開・秘密）の生成

クライアント側で以下のコマンドで公開鍵・秘密鍵を生成する。  
作成先・ファイル名を指定しなければ、/home/(ユーザ名)/.ssh/ に id_rsa, id_rsa.pub が作成される。 途中、鍵用のパスワードも入力する。

``` text 
$ ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/home/masaru/.ssh/id_rsa): /home/masaru/.ssh/id_rsa_vbox_debian
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/masaru/.ssh/id_rsa_vbox_debian.
Your public key has been saved in /home/masaru/.ssh/id_rsa_vbox_debian.pub.
The key fingerprint is:
96:af:59:18:9c:a0:c2:da:86:7e:d7:24:05:d0:31:da masaru@p183
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

### 6. サーバ側設定

作成した鍵ペアで SSH サーバーへ鍵方式でログインできるように、サーバ側の「ログインしようとする一般ユーザ」で設定する。  
"~/authorized_keys" には、先ほど作成した鍵ペアの公開鍵ファイル（"xxxx.pub"）の内容をそのまま貼り付ける。

``` text 
$ mkdir ~/.ssh

$ chmod 700 ~/.ssh

$ vi ~/.ssh/authorized_keys
ssh-rsa .........

$ chmod 600 ~/.ssh/authorized_keys
```

### 7. SSH 設定ファイル編集

パスワード認証をできないようにするため、 SSH 設定ファイルを編集する。  
今度は一般ユーザではなく、 `su -` で root になって（`sudo` コマンドを導入していれば、`sudo vi ...` でもよい）。

File: `/etc/ssh/sshd_config`

{% highlight bash linenos %} 
#PasswordAuthentication yes
PasswordAuthentication no  # <= コメント解除＆変更
{% endhighlight %}

### 8. SSH サーバ再起動

設定を有効化するため、SSH サーバを再起動する。

``` text 
# /etc/init.d/ssh restart
```

### 9. 鍵認証接続テスト

一旦ログアウトし、再度接続する。  
パスワード認証ではなく、鍵認証なので以下のようなコマンドとなる。（指定する秘密キーのファイル名は、ペア作成時に指定したファイル名）

``` text 
$ ssh -i ~/.ssh/id_rsa_vbox_debian 192.168.11.102
The authenticity of host '192.168.11.102 (192.168.11.102)' can't be established.
ECDSA key fingerprint is 87:ed:8e:29:1f:c8:89:ee:6b:5c:c4:3f:a5:23:12:c5.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '192.168.11.102' (ECDSA) to the list of known hosts.
Enter passphrase for key '/home/masaru/.ssh/id_rsa_vbox_debian':
Linux vbox 3.2.0-4-amd64 #1 SMP Debian 3.2.46-1+deb7u1 x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Mon Sep 30 21:34:08 2013 from 192.168.11.13
```

２回目からは以下のコマンドでよい。

``` text 
$ ssh 192.168.11.102
```

---

以上。

