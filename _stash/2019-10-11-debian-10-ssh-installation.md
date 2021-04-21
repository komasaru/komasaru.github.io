---
layout   : single
title    : "Debian 10 (buster) - SSH サーバ構築！"
published: true
date     : 2019-10-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- SSH
---

Debian GNU/Linux 10 (buster) 上に SSH サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) サーバでの作業を想定。
* サーバの IP アドレス `192.168.11.101`、ホスト名 `vbox`、ユーザ名 `masaru` を想定。
* DNS サーバは未だ設定していない。  
  （設定済みなら、ローカルから IP アドレスではなくホスト名で SSH 接続可）
* クライアント側は LMDE 3(Linux Mint Debian Edition 3)(64bit) を想定。
* SSH 接続は端末コンソールから行う。
* ポートは、デフォルトの `22` から `9999` に変更することを想定。（`9999` は架空）
* root ユーザでの作業を想定。

### 1. SSH サーバのインストール

Debian インストール時に SSH サーバをインストールしていなければ、以下のようにして SSH サーバをインストールする。

``` text
# apt -y install ssh
```

### 2. SSH 設定ファイルの編集

root でログインできないよう、設定ファイルを編集する。  
ポートもデフォルトの `22` から変更する。（セキュリティ上、必須）

File: `/etc/ssh/sshd_config`

{% highlight bash %}
#Port 22
Port 9999                         # <= 適当に変更

# rootユーザーのログインはパスワード認証以外のみ許可する
PermitRootLogin without-password

# SSHプロトコル ver.2 で公開鍵認証を許可する
PubkeyAuthentication yes

# パスワード認証を許可する(rootユーザー以外に適用)
PasswordAuthentication yes

# チャレンジレスポンス認証を拒否する
ChallengeResponseAuthentication no

# PAMを使用する
UsePAM yes

AllowUsers root                   # <= ログイン可能なユーザを明示的に設定
AllowUsers masaru                 # <=     〃
{% endhighlight %}

* `PermitRootLogin without-password` は、root のログインは許可されるものの、ログインを行うには適切な SSH のキーが必要とされるようになるという意味。

### 3. SSH サーバの再起動

設定を有効化するため、SSH サーバを再起動する。

``` text
# systemctl restart ssh
```

### 4. パスワード接続

一旦ログアウト後、再度クライント側の端末コンソールからサーバに接続してみる。  
"Are you sure you want to continue connecting (yes/no)?" で `yes` 応答、その後パスワードを入力すれば接続できる。

``` text
# ssh -p 9999 192.168.11.101
masaru@192.168.11.101's password:
Linux vbox 4.19.0-6-amd64 #1 SMP Debian 4.19.67-2 (2019-08-28) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Mon Sep 23 10:05:54 2019 from 192.168.11.13
```

クライアント側のユーザがサーバ側と異なる場合は、以下のようにユーザ名も指定する。

``` text
# ssh -p 9999 hoge@192.168.11.101
```

以降、サーバ操作時にクライアント側の端末コンソールから行なう。  
クライント側からリモート接続すれば、文字化けしていた日本語も正常に表示されるはず。

### 5. 鍵ペア（公開・秘密）の生成

**クライアント側で**以下のコマンドで公開鍵・秘密鍵を生成する。  
作成先・ファイル名を指定しなければ、 `/home/(ユーザ名)/.ssh/` に `id_rsa`, `id_rsa.pub` が作成される。 途中、鍵用のパスワードも入力する。

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
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

### 6. サーバ側の設定

作成した鍵ペアで SSH サーバーへ鍵方式でログインできるように、サーバ側の「ログインしようとする一般ユーザ」で設定する。  
`~/authorized_keys` には、先ほど作成した鍵ペアの公開鍵ファイル（`xxxx.pub`）の内容をそのまま貼り付ける。

``` text
$ mkdir ~/.ssh

$ chmod 700 ~/.ssh
```

File: `~/.ssh/authorized_keys`

{% highlight bash %}
ssh-rsa .........
{% endhighlight %}

``` text
$ chmod 600 ~/.ssh/authorized_keys
```

### 7. SSH 設定ファイルの編集

パスワード認証をできないようにするため、 SSH 設定ファイルを編集する。  
今度は一般ユーザではなく、 `su -` で root になって（`sudo` コマンドを導入していれば、`sudo vi ...` でもよい）。

File: `/etc/ssh/sshd_config`

{% highlight bash %}
PasswordAuthentication no  # <= 変更
{% endhighlight %}

### 8. SSH サーバの再起動

``` text
# systemctl restart ssh
```

### 9. 鍵認証接続のテスト

一旦ログアウトし、再度接続する。  
パスワード認証ではなく、鍵認証なので以下のようなコマンドとなる。（指定する秘密キーのファイル名は、ペア作成時に指定したファイル名）  
鍵用のパスワード問い合わせダイアログが表示されるので応答する。

``` text
# ssh -i ~/.ssh/id_rsa -p 9999 192.168.11.101
Linux vbox 4.19.0-6-amd64 #1 SMP Debian 4.19.67-2 (2019-08-28) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Mon Sep 23 10:08:49 2019 from 192.168.11.13
```

2回目からは以下のコマンドでよい。

``` text
$ ssh -p 9999 192.168.11.101
```

---

以上。

