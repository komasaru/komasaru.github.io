---
layout   : single
title    : "CentOS 6.5 - ファイルサーバ（NFS）構築！"
published: true
date     : 2013-12-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- NFS
---

前回は CentOS 6.5 サーバに FTP サーバ vsftpd の構築を行いました。  
今回はファイルサーバ NFS の構築を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 接続可能なマシンのネットワークは 192.168.11.0/24 を想定。
- ドメイン名は mk-mode.com、サーバホスト名は vbox を想定。
- NFS 用ディレクトリを新たに作成する。（”/home” 配下に “/exports” ディレクトリを作成する）
- クライアント側でマウントに使用するディレクトリは “/var/exports” とする。
- サーバ側は root で作業することを想定、クライアント側は一般ユーザで作業することを想定している。
- 過去にこのサイトを参考にして作業した際に記録していたものを参照している。

### 1. インストール

NFS サーバツールを以下のようにしてインストールする。

``` text
# yum -y install nfs-utils
```

### 2. 設定ファイル編集

NFS 設定ファイルを以下のように編集する。

File: `/etc/idmapd.conf`

{% highlight bash linenos %}
Domain = mk-mode.com  # <= 自ドメイン名に変更
{% endhighlight %}

### 3. NFS 用ディレクトリ作成

NFS 用ディレクトリを作成し、所有者を設定する。

``` text
# mkdir /home/exports
# chown -R nfsnobody. /home/exports
```

### 4. exports 編集

exports ファイルを以下のように編集する。

File: `/etc/exports`

{% highlight bash linenos %}
/home/exports 192.168.11.0/24(rw,sync,no_root_squash,no_all_squash)  # <= 追加
{% endhighlight %}

### 5. IPv6 無効化設定

IPv6 を無効にしている場合、NFS mountd 起動時に

``` text
rpc.mountd: svc_tli_create: could not open connection for udp6
rpc.mountd: svc_tli_create: could not open connection for tcp6
rpc.mountd: svc_tli_create: could not open connection for udp6
rpc.mountd: svc_tli_create: could not open connection for tcp6
rpc.mountd: svc_tli_create: could not open connection for udp6
rpc.mountd: svc_tli_create: could not open connection for tcp6
```

というエラーが発生ため、"/etc/netconfig" を以下のように編集（コメントアウト）する。

File: `/etc/netconfig`

{% highlight bash linenos %}
#udp6       tpi_clts      v     inet6    udp     -       -
#tcp6       tpi_cots_ord  v     inet6    tcp     -       -
{% endhighlight %}

### 6. rpcbind, nfslock, nfs 起動

rpcbind, nfslock, nfs を以下のようにして起動する。

``` text
# /etc/rc.d/init.d/rpcbind start
rpcbind を起動中:                                          [  OK  ]
# /etc/rc.d/init.d/nfslock start
NFS statd を起動中:                                        [  OK  ]
# /etc/rc.d/init.d/nfs start
NFS サービスを起動中:                                      [  OK  ]
NFS クォータを起動中:                                      [  OK  ]
NFS mountd を起動中:                                       [  OK  ]
NFS デーモンを起動中:                                      [  OK  ]
RPC idmapd を起動中:                                       [  OK  ]
```

### 7. 自動起動設定

サーバ起動時に自動で NFS サーバ等が起動するように設定する。

``` text
# chkconfig rpcbind on
# chkconfig nfslock on
# chkconfig nfs on
# chkconfig --list rpcbind  # <= 2,3,4,5 が "on" であることを確認
rpcbind         0:off   1:off   2:on    3:on    4:on    5:on    6:off
# chkconfig --list nfslock  # <= 2,3,4,5 が "on" であることを確認
nfslock         0:off   1:off   2:on    3:on    4:on    5:on    6:off
# chkconfig --list nfs      # <= 2,3,4,5 が "on" であることを確認
nfs             0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

【以下、クライアント側での作業】

### 8. NFS クライアントインストール

NFS クライアントを以下のようにしてインストールする。

``` text
$ sudo aptitude -y install nfs-common
```

### 9. idmapd 設定編集

NFS サーバ同様 "etc/idmapd.conf" という設定ファイルを、以下のように編集する。

File: `/etc/idmapd.conf`

{% highlight bash linenos %}
Domain = mk-mode.com  # < = 自ドメイン名に変更
{% endhighlight %}

### 10. NFS クライアント再起動

設定を反映させるため、NFS クライアントを再起動する。（Linux Mint, Ubuntu の場合）

``` text
$ sudo initctl restart idmapd
idmapd start/running, process 14257
```

ちなみに、クライアントマシンが Debian GNU/Linux なら以下のようにして再起動する。

``` text
$ sudo /etc/init.d/nfs-common restart
```

### 11. マウント用ディレクトリ作成

マウントするディレクトリを作成する。

``` text
$ sudo mkdir /var/exports
```

### 12. マウント

NFS サーバのディレクトリ使用するために、クライアントマシンでマウントする。  
以下では、クライアントマシンの "/var/exports" ディレクトリにマウントしている。

``` text
$ sudo mount -t nfs vbox.mk-mode.com:/home/exports /var/exports
```

### 13. 確認

マウントできているか `df` コマンドで確認する。

``` text
# df -h
Filesystem                      Size  Used Avail Use% Mounted on
/dev/sda3                       7.4G  1.3G  5.7G  19% /
udev                            2.0G  4.0K  2.0G   1% /dev
tmpfs                           791M  952K  790M   1% /run
none                            5.0M  4.0K  5.0M   1% /run/lock
none                            2.0G  7.8M  2.0G   1% /run/shm
none                            100M  8.0K  100M   1% /run/user
/dev/sda7                       7.4G  156M  6.9G   3% /tmp
/dev/sda5                        37G   12G   23G  35% /usr
/dev/sda6                        37G  3.5G   32G  10% /var
/dev/sda1                       230M   34M  185M  16% /boot
/dev/sda8                       363G  119G  226G  35% /home
/dev/sdb1                       917G  278G  593G  32% /home/etc
vbox.mk-mode.com:/home/exports   18G  1.5G   15G   9% /var/exports
```

その他、クライアントマシンからファイルを貼り付けてみたり、削除してみたりしてみる。

### 14. 自動マウント設定

上記の方法ではクライアントマシンを再起動するたびにマウントしないといけないので、マシン起動時に自動マウントようにしたければ以下のように fstab を設定する。

File: `/etc/fstab`

{% highlight bash linenos %} %}
vbox.mk-mode.com:/home/exports   /var/exports  nfs     defaults        0       0
{% endhighlight %}

クライアントマシン再起動時にマウントされるかも確認しておく。

---

次回は、ファイルサーバ Samba の構築について紹介する予定です。

以上。

