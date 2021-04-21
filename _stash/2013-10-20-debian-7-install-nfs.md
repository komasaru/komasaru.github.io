---
layout   : single
title    : "Debian 7 Wheezy - NFS サーバ構築！"
published: true
date     : 2013-10-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- NFS
---

Debian GNU/Linux 7.1.0 サーバにファイルサーバ NFS を構築する方法についての記録です。  
NFS サーバは、クライアントが Unix/Linux である場合のファイルサーバです。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- 接続可能なマシンのネットワークは `192.168.11.0/24` を想定。
- ドメイン名は `mk-mode.com`、サーバホスト名は `vbox` を想定。
- NFS 用ディレクトリを新たに作成する。（"/var" 配下に "/exports" ディレクトリを作成する）
- クライアント側でマウントに使用するディレクトリも "/var/exports" とする。
- サーバ側は root で作業することを想定、クライアント側は一般ユーザで作業することを想定している。
- ファイアウォール iptables は一時的にオフにしている。  
  ※NFS サーバは都度ポート番号が変更になるので iptables で開放するポートを指定できないため。  
  ※別途、NFS サーバのポートを固定する措置を施せばよい。（次回紹介する）

### 1. NFS サーバインストール

NFS サーバを以下のようにしてインストールする。

``` text 
# aptitude -y install nfs-kernel-server
```

### 2. idmapd 設定編集

"/etc/idmapd.conf" というユーザー名・グループ名と UID/GID のマッピングを保持するデーモンの設定ファイルを、以下のように編集する。

File: `/etc/idmapd.conf`

{% highlight bash linenos %} 
Domain = mk-mode.com  # < = 自ドメイン名に変更
{% endhighlight %}

### 3. NFS 用ディレクトリ作成

共有 NFS ディレクトリを以下のようにして作成する。  
所有者・所有グループは "/etc/idmapd.conf" に記載されている nobody, nogroup とする。

``` text 
# mkdir /var/exports
# chown -R nobody:nogroup /var/exports
```

### 4. exports 編集

設定ファイル "/etc/exports" を以下のように編集（追記）する。

File: `/etc/exports`

{% highlight bash linenos %} 
/var/exports 192.168.11.0/24(rw,sync,fsid=0,no_root_squash,no_subtree_check)
{% endhighlight %}

### 5. NFS サーバ再起動

設定を反映させるため、NFS サーバを再起動する。

``` text 
# /etc/init.d/nfs-kernel-server restart
Stopping NFS kernel daemon: mountd nfsd.
Unexporting directories for NFS kernel daemon....
Exporting directories for NFS kernel daemon....
Starting NFS kernel daemon: nfsd mountd.
```

【以下、クライアント側での作業】

### 6. NFS クライアントインストール

NFS クライアントを以下のようにしてインストールする。

``` text 
$ sudo aptitude -y install nfs-common
```

### 7. idmapd 設定編集

NFS サーバ同様 "etc/idmapd.conf" という設定ファイルを、以下のように編集する。

File: `/etc/idmapd.conf`

{% highlight bash linenos %} 
Domain = mk-mode.com  # < = 自ドメイン名に変更
{% endhighlight %}

### 8. NFS クライアント再起動

設定を反映させるため、NFS クライアントを再起動する。（Linux Mint, Ubuntu の場合）

``` text 
$ sudo initctl restart idmapd
idmapd start/running, process 14257
```

クライアントマシンが Debian GNU/Linux なら以下のようにして再起動する。

``` text 
$ sudo /etc/init.d/nfs-common restart
```

### 9. マウント用ディレクトリ作成

マウントするディレクトリを作成する。

``` text 
$ sudo mkdir /var/exports
```

### 10. マウント

NFS サーバのディレクトリ使用するために、クライアントマシンでマウントする。  
以下では、クライアントマシンの "/var/exports" ディレクトリにマウントしている。

``` text 
$ sudo mount -t nfs vbox.mk-mode.com:/var/exports /var/exports
```

### 10. 確認

マウントできているか `df` コマンドで確認する。

``` text 
# df -h
Filesystem                     Size  Used Avail Use% Mounted on
/dev/sda3                      7.4G  1.3G  5.8G  18% /
udev                           2.0G  4.0K  2.0G   1% /dev
tmpfs                          791M  948K  790M   1% /run
none                           5.0M  4.0K  5.0M   1% /run/lock
none                           2.0G   13M  2.0G   1% /run/shm
none                           100M   12K  100M   1% /run/user
/dev/sda7                      7.4G  158M  6.9G   3% /tmp
/dev/sda8                      363G  111G  234G  33% /home
/dev/sda5                       37G   12G   24G  34% /usr
/dev/sda6                       37G  3.3G   32G  10% /var
/dev/sda1                      230M   34M  185M  16% /boot
/dev/sdb1                      917G  288G  583G  34% /home/etc
vbox.mk-mode.com:/var/exports  2.8G  378M  2.3G  15% /var/exports
```

その他、クライアントマシンからファイルを貼り付けてみたり、削除してみたりしてみる。

### 11. 自動マウント設定

上記の方法ではクライアントマシンを再起動するたびにマウントしないといけないので、マシン起動時に自動マウントようにしたければ以下のように fstab を設定する。

File: `/etc/fstab`

{% highlight bash linenos %} 
vbox.mk-mode.com:/var/exports   /var/exports  nfs     defaults        0       0
{% endhighlight %}

クライアントマシン再起動時にマウントされるかも確認しておく。

---

以上。

