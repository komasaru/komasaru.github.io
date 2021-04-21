---
layout   : single
title    : "CentOS 7.0 - ファイルサーバ NFS 構築！"
published: true
date     : 2014-08-15 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- NFS
---

「CentOS 7.0 - ファイルサーバ NFS 構築」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- IPv6 は使用しない。
- 接続可能なマシンのネットワークは 192.168.11.0/24 を想定。
- ドメイン名は mk-mode.com、サーバホスト名は vbox を想定。
- NFS 用ディレクトリを新たに作成する。（”/home” 配下に “/exports” ディレクトリを作成する）
- クライアント側でマウントに使用するディレクトリは “/var/exports” とする。
- サーバ側は root で作業することを想定、クライアント側は一般ユーザで作業することを想定している。
- FirewallD のゾーンは public を使用する。

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

exports ファイルを以下のように作成する。

File: `/etc/exports`

{% highlight bash linenos %}
/home/exports 192.168.11.0/24(rw,sync,no_root_squash,no_all_squash)  # <= 追加
{% endhighlight %}

### 5. rpcbind, nfs-server, nfs-lock, nfs-idmap 起動

``` text
# systemctl restart rpcbind
# systemctl start nfs-server
# systemctl start nfs-lock
# systemctl start nfs-idmap
```

### 6. 自動起動設定

サーバ起動時に自動で NFS サーバ等が起動するように設定する。（rpcbind は元々有効化されているが）

``` text
# systemctl enable rpcbind
# systemctl list-unit-files -t service | grep rpcbind
rpcbind.service                             enabled  # <= enabled であることを確認

# systemctl enable nfs-server
ln -s '/usr/lib/systemd/system/nfs-server.service' '/etc/systemd/system/nfs.target.wants/nfs-server.service'
# systemctl list-unit-files -t service | grep nfs-server
nfs-server.service                          enabled  # <= enabled であることを確認

# systemctl enable nfs-lock
ln -s '/usr/lib/systemd/system/nfs-lock.service' '/etc/systemd/system/nfs.target.wants/nfs-lock.service'
# systemctl list-unit-files -t service | grep nfs-lock
nfs-lock.service                            enabled  # <= enabled であることを確認

# systemctl enable nfs-idmap
ln -s '/usr/lib/systemd/system/nfs-idmap.service' '/etc/systemd/system/nfs.target.wants/nfs-idmap.service'
# systemctl list-unit-files -t service | grep nfs-idmap
nfs-idmap.service                           enabled  # <= enabled であることを確認
```

### 7. ファイアウォール設定

``` text
# firewall-cmd --add-service=nfs
success
# firewall-cmd --add-service=nfs --permanent
success
# firewall-cmd --list-services
dhcpv6-client dns ftp nfs ssh
```

【以下、クライアント側での作業】

### 8. NFS クライアントインストール

``` text
$ sudo aptitude -y install nfs-common
```

### 9. 設定ファイル編集

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

{% highlight bash linenos %}
vbox.mk-mode.com:/home/exports   /var/exports  nfs     defaults        0       0
{% endhighlight %}

クライアントマシン再起動時にマウントされるかも確認しておく。

---

以上。

