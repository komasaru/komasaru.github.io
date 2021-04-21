---
layout   : single
title    : "Debian 9 (Stretch) - NFS サーバ構築！"
published: true
date     : 2017-08-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- NFS
---

Debian GNU/Linux 9 (Stretch) に NFS サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretchs) での作業を想定。
* 接続元のマシンは LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
* ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。
* NFS 用ディレクトリを新たに作成する。（"/var" 配下に "/exports" ディレクトリを作成する）
* クライアント側でマウントに使用するディレクトリも "/var/exports" とする。
* サーバ側は root で作業することを想定、クライアント側は一般ユーザで作業することを想定している。

### 1. NFS サーバのインストール

``` text
# apt -y install nfs-kernel-server
```

### 2. idmapd 設定の編集

"/etc/idmapd.conf" というユーザー名・グループ名と UID/GID のマッピングを保持するデーモンの設定ファイルを以下のように編集する。

File: `/etc/idmapd.conf`

{% highlight bash linenos %}
Domain = mk-mode.com  # < = コメント解除＆自ドメイン名に変更
{% endhighlight %}

### 3. NFS 用ディレクトリの作成

共有 NFS ディレクトリを以下のようにして作成する。  
所有者・所有グループは "/etc/idmapd.conf" に記載されている nobody, nogroup とする。

``` text
# mkdir /var/exports
# chown -R nobody:nogroup /var/exports
```

### 4. exports の編集

設定ファイル "/etc/exports" を以下のように編集（追記）する。

File: `/etc/exports`

{% highlight bash linenos %}
/var/exports 192.168.11.0/24(rw,sync,fsid=0,no_root_squash,no_subtree_check)
{% endhighlight %}

### 5. ファイアウォール (ufw) の無効化

NFS サーバは都度ポート番号が変更になるため、ファイアウォールで開放するポートを指定できない。  
ファイアウォール ufw を「一時的」にオフにする。  
（別途、NFS サーバのポートを固定する措置を施せばよい（別記事））

``` text
# ufw disable
Firewall stopped and disabled on system startup
```

### 6. NFS サーバ再起動

設定を反映させるため、NFS サーバを再起動する。

``` text
# systemctl restart nfs-kernel-server
```

【以下、クライアント側・ローカルユーザでの作業】

### 7. NFS クライアントのインストール

NFS クライアントを以下のようにしてインストールする。

``` text
$ sudo apt install -y nfs-client
```

* Linux ディストリビューションによっては `apt command [options]` でなく `apt [options] command` のことがあるので注意。

### 8. idmapd 設定の編集

NFS サーバ同様 "etc/idmapd.conf" という設定ファイルを、以下のように編集する。

File: `/etc/idmapd.conf`

{% highlight bash linenos %}
Domain = mk-mode.com  # <= コメント解除＆自ドメイン名に変更
{% endhighlight %}

### 9. NFS クライアントの再起動

設定を反映させるため、NFS クライアントを再起動する。（LMDE2 等の場合）

``` text
$ sudo /etc/init.d/nfs-common restart
Stopping NFS common utilities: idmapd statd.
Starting NFS common utilities: statd idmapd.
```

クライアントマシンが Linux Mint や Ubuntu 等なら以下のようにして再起動する。

``` text
$ sudo systemctl restart idmapd
```

ちなみに、nfs-common は自動起動するようになっているが、普段使用しない場合は、以下のように自動起動しないように設定しておいてもよいだろう。（NFS を使用したい時のみ nfs-common を起動させる）

``` text
$ sudo /etc/init.d/nfs-common restart
```

### 10. マウント用ディレクトリの作成

マウントするディレクトリを作成する。

``` text
$ sudo mkdir /var/exports
```

### 11. マウント

NFS サーバのディレクトリ使用するために、クライアントマシンでマウントする。  
以下では、クライアントマシンの "/var/exports" ディレクトリにマウントしている。

``` text
$ sudo mount -t nfs vbox.mk-mode.com:/var/exports /var/exports
```

### 12. 確認

マウントできているか `df` コマンドで確認する。

``` text
# df -h
Filesystem                     Size  Used Avail Use% Mounted on
         :
====< 途中省略 >====
         :
vbox.mk-mode.com:/var/exports   1.7G  431M  1.2G   28% /var/exports
```

その他、クライアントマシンからファイルを貼り付けてみたり、削除してみたりしてみる。

### 13. 自動マウントの設定

上記の方法ではクライアントマシンを再起動するたびにマウントしないといけないので、マシン起動時に自動マウントするようにしたければ以下のように fstab を設定する。

File: `/etc/fstab`

{% highlight bash linenos %}
vbox.mk-mode.com:/var/exports   /var/exports  nfs     defaults        0       0
{% endhighlight %}

クライアントマシン再起動時にマウントされるかも確認しておく。

### 14. ファイアウォール (ufw) の有効化

テストのために無効化していたファイアウォールを有効化に戻す。※サーバ側

``` text
# ufw enable
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup
```

実際に運用する場会は、 NVF サーバのポートを固定する設定を施す。  
ここでは、一旦ファイアウォールを有効化に戻しておく。（この後続けて、次記事の方法で NFS サーバのポート固定の設定を施すのであれば、この限りでない）

---

以上。

