---
layout   : single
title    : "Debian 8 (Jessie) - SSH サーバ構築！"
published: true
date     : 2015-05-24 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- SSH
---

Debian GNU/Linux 8 (Jessie) 上に SSH サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 「[Debian 8 (Jessie) - インストール（サーバ用途・最小構成）！]({{site.baseurl}}/2015/05/22/debian-8-installation-for-small-server/ "Debian 8 (Jessie) - インストール（サーバ用途・最小構成）！")」の方法でインストールが完了していることを想定。
* 「[Debian 8 (Jessie) - サーバ初期設定！]({{site.baseurl}}/2015/05/23/debian-8-initial-setting/ "Debian 8 (Jessie) - サーバ初期設定")」の方法で初期設定が完了していることを想定。
* サーバの IP アドレス `192.168.11.102`、ホスト名 `vbox`、ユーザ名 `masaru` を想定。
* DNS サーバは未だ設定していない。  
  （設定済みなら、ローカルから IP アドレスではなくホスト名で SSH 接続可）
* クライアント側は Linux Mint 17.1(64bit) を想定。
* SSH 接続に Putty, TeraTerm 等のツールは使用しない。端末コンソールから接続する。
* 以下ではポート 9999 を想定。

### 1. SSH サーバのインストール

Debian インストール時に SSH サーバをインストールしていなければ、以下のようにして SSH サーバをインストールする。

``` text
# apt-get -y install ssh
```

### 2. SSH 設定ファイルの編集

root でログインできないよう、設定ファイルを編集する。  
ポートもデフォルトの 22 から変更する。（セキュリティ上、必須）

```bash /etc/ssh/sshd_config
#Port 22
Port 9999                         # <= 適当に変更

PermitRootLogin without-password  # <= このままでよい

AllowUsers root                   # <= ログイン可能なユーザを明示的に設定
AllowUsers masaru                 # <=     〃
```

`PermitRootLogin without-password` は、root のログインは許可されるものの、ログインを行うには適切な SSH のキーが必要とされるようになるという意味。

### 3. SSH サーバの再起動

設定を有効化するため、SSH サーバを再起動する。

``` text
# systemctl restart ssh
```

### 4. パスワード接続

一旦ログアウト後、再度クライント側の端末コンソールからサーバに接続してみる。  
"Are you sure you want to continue connecting (yes/no)?" で `yes` 応答、その後パスワードを入力すれば接続できる。

``` text
# ssh -p 9999 192.168.11.102
The authenticity of host '[192.168.11.102]:3701 ([192.168.11.102]:3701)' can't be established.
ECDSA key fingerprint is 94:d5:27:0c:d6:f0:0a:65:25:b5:05:0c:f9:82:92:54.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '[192.168.11.102]:9999' (ECDSA) to the list of known hosts.
masaru@192.168.11.102's password:

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Thu Apr 30 23:34:48 2015
masaru@vbox:~$ 
```

クライアント側のユーザがサーバ側と異なる場合は、以下のようにユーザ名も指定する。

``` text
# ssh -p 9999 hoge@192.168.11.102
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
+--[ RSA 2048]-----------------------------------------+
|   .oo.          |
|    oo.          |
|   . Eo          |
| .   . + o       |
|  o . . S        |
| + . . o +       |
|o o   + . o      |
|.. . . . +       |
| .. .   o        |
+------------------------------------------------------+
```

### 6. サーバ側の設定

作成した鍵ペアで SSH サーバーへ鍵方式でログインできるように、サーバ側の「ログインしようとする一般ユーザ」で設定する。  
"~/authorized_keys" には、先ほど作成した鍵ペアの公開鍵ファイル（"xxxx.pub"）の内容をそのまま貼り付ける。

``` text
$ mkdir ~/.ssh

$ chmod 700 ~/.ssh
```

File: `~/.ssh/authorized_keys`

{% highlight bash linenos %}
ssh-rsa .........
{% endhighlight %}

```

$ chmod 600 ~/.ssh/authorized_keys
```

### 7. SSH 設定ファイルの編集

パスワード認証をできないようにするため、 SSH 設定ファイルを編集する。  
今度は一般ユーザではなく、 `su -` で root になって（`sudo` コマンドを導入していれば、`sudo vi ...` でもよい）。

File: `/etc/ssh/sshd_config`

{% highlight bash linenos %}
#PasswordAuthentication yes
PasswordAuthentication no  # <= コメント解除＆変更
{% endhighlight %}

### 8. SSH サーバの再起動

設定を有効化するため、SSH サーバを再起動する。

``` text
# systemctl restart ssh
```

### 9. 鍵認証接続のテスト

一旦ログアウトし、再度接続する。  
パスワード認証ではなく、鍵認証なので以下のようなコマンドとなる。（指定する秘密キーのファイル名は、ペア作成時に指定したファイル名）  
鍵用のパスワード問い合わせダイアログが表示されるので応答する。

``` text
# ssh -i ~/.ssh/id_rsa -p 9999 192.168.11.102

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Thu Apr 30 23:44:20 2015 from 192.168.11.13
masaru@vbox:~$ 
```

２回目からは以下のコマンドでよい。

``` text
$ ssh 192.168.11.102
```

---

以上。

