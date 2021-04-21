---
layout   : single
title    : "Debian 10 (buster) - サーバ初期設定！"
published: true
date     : 2019-10-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 10 (buster) インストール後の初期設定についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 「[Debian 10 (buster) - インストール（サーバ用途・最小構成）！]({{site.baseurl}}/2019/10/05/debian-10-installation-for-small-server "Debian 10 (buster) - インストール（サーバ用途・最小構成）！")」の方法でインストールが完了していることを想定。
* 一般ユーザ名は "masaru" を想定。
* 以下の作業は全て root ユーザで行うことを想定。
* コマンドラインプロンプト `#` は root ユーザ、 `$` は一般ユーザであることを理解しておく。  
  コメントしての `#` と混同しないよう注意する。
* ネットワークカードは "eth0" を想定。
* IP アドレスは固定する。
* IPv6 は使用しない。
* ドメインは "mk-mode" を想定。
* ネットワークの MTU 最適値は 1454 を想定。  
  （デフォルトは 1500 だが、環境により最適値は異なるので、算出して設定するとよい。参照： [Linux - MTU 最適値の導出！]({{site.baseurl}}/2015/11/26/linux-mtu-best-effort/ "Linux - MTU 最適値の導出！")）
* 各種設定ファイルの編集方法までは説明しない。（`vi` コマンドについての初歩的な知識があることが前提）  
* 実際の作業は、物理マシンから SSH 接続で仮想マシン接続して行なっている。

### 1. ネットワークの設定

デフォルトでは DHCP で IP アドレスが付与されるので、固定する。  
root でログイン後 `/etc/network/interfaces` を編集する。

File: `/etc/network/interfaces`

{% highlight bash linenos %}
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
allow-hotplug enp0s3
auto enp0s3                         # <= 追加（自動起動）
#iface enp0s3 inet dhcp             # <= コメント化（DHCP を使用しない）
iface enp0s3 inet static            # <= 追加（IP アドレス固定化）
    address         192.168.11.101  # <= 追加（IP アドレス）
    network         192.168.11.0    # <= 追加（ネットワークアドレス）
    netmask         255.255.255.0   # <= 追加（ネットマスク）
    broadcast       192.168.11.255  # <= 追加（ブロードキャストアドレス）
    gateway         192.168.11.1    # <= 追加（デフォルトゲートウェイ（ルータの IP アドレス））
    dns-nameservers 192.168.11.1    # <= 追加（ネームサーバ（現時点ではルータの IP アドレス））
    dns-search      mk-mode         # <= 追加（DNS 検索）
    mtu             1454            # <= 追加（MTU 最適値）
{% endhighlight %}

そして、設定変更を反映させるために、システムを再起動する。

``` text
# systemctl reboot
```

ネットワーク再起動後は、以下のコマンドで確認してみるとよい。（もはや `ifconfig` は非推奨）

``` text
# ip addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN groupdefault qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1454 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:5e:a5:9f brd ff:ff:ff:ff:ff:ff
    inet 192.168.11.101/24 brd 192.168.11.255 scope global enp0s3
       valid_lft forever preferred_lft forever
    inet6 fe80::a00:27ff:fe5e:a59f/64 scope link
       valid_lft forever preferred_lft forever
```

（`ip addr show` は `ip a` でもよい）

### 2. IPv6 の無効化

IPv6 は使用しないので無効にしておく。

File: `/etc/sysctl.conf`

{% highlight bash linenos %}
# 最終行に追加
net.ipv6.conf.all.disable_ipv6 = 1
{% endhighlight %}

そして、即時反映。（マシンを再起動してもよい）

``` text
# sysctl -p
net.ipv6.conf.all.disable_ipv6 = 1
```

以下のコマンドで IPv6 が無効になっていることを確認してみるとよい。（もはや `ifconfig` は非推奨）

``` text
# ip addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN groupdefault qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1454 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:5e:a5:9f brd ff:ff:ff:ff:ff:ff
    inet 192.168.11.101/24 brd 192.168.11.255 scope global enp0s3
       valid_lft forever preferred_lft forever
```

（`ip addr show` は `ip a` でもよい）

### 3. 管理用ユーザの設定

root でログインし、インストール時に作成した一般ユーザを管理ユーザにし、 root になれるよう設定する。

``` text
# usermod -G adm masaru
```

File: `/etc/pam.d/su`

{% highlight bash linenos %}
# 15行目当たり、コメント解除し編集
auth       required   pam_wheel.so   group=adm
{% endhighlight %}

ちなみに、RedHat 系の場合 `adm` ではなく `wheel` である。

（--- 以下、ローカルマシンから一般ユーザで SSH 接続し root になって作業 ---）  
まだ、 SSH の設定を行っていないので、実際には `ssh masaru@vbox` 

### 4. コマンドエイリアスの設定

よく使用するコマンド＋オプションのエイリアスを設定しておく。  
取り急ぎ、当方がよく使用するコマンドのみ。

root に適用する場合は、root ユーザでログインして以下のように設定する。

File: `/etc/profile`

{% highlight bash linenos %}
# 最終行に追記
alias ll='ls $LS_OPTIONS -l --color=auto'
alias l='ls $LS_OPTIONS -lA --color=auto'
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'
{% endhighlight %}

（各ユーザに適用する場合は `/home/username/.profile` か `/home/username/.bashrc` を編集する）

即時適用。

``` text
# source /etc/profile
```

### 5. コマンドプロンプトの変更

root では、コマンドプロンプトがデフォルトで以下のように表示される。  
例えば、以下のようにディレクトリが深くなるとコマンドプロンプトも長くなってしまう。

``` text
root@vbox:~# cd /var/lib/apt/mirrors/partial
root@vbox:/var/lib/apt/mirrors/partial#
```

"/etc/profile" に以下を追記する。（好みに応じて編集する）

File: `/etc/profile`

{% highlight bash linenos %}
PS1='[\u@\h \W]\$ '  # <= 最終行に追記
{% endhighlight %}

以下のコマンドで即時反映する。（マシン再起動でもよい）

``` text
# source /etc/profile
```

以下のようなコマンドプロントになる。  
ディレクトリが深くなっても一番深いディレクトリ名のみ表示されるので、コマンドプロンプトが長くなることはない。

``` text
[root@vbox ~]# cd /var/lib/apt/mirrors/partial
[root@vbox partial]#
```

### 6. システムの最新化

システムの各種パッケージのバージョンが古い可能性もあるので、ネットワーク経由で最新にしておく。

まず、 `/etc/apt/sources.list` 内の `cdrom` の行がコメントアウトされてなければ、コメントアウトしておく。

File: `/etc/apt/sources.list`

``` text
# deb cdrom:[Debian GNU/Linux 10.5.0 _buster_ - Official amd64 DVD Binary-1 20180714-10:25]/ stretch contrib main

         :
===< 以下、省略 >===
         :
```

そして、次を実行。

``` text
# apt -y update   # <= パッケージリスト最新化
# apt -y upgrade  # <= システム最新化
```

### 7. Vim のインストール

テキストエディタ Vi の高機能版 Vim をインストール・設定する。

``` text
# apt -y install vim
```

File: `/etc/profile`

``` bash
alias vi='vim'  # 最終行に追加
```

即時適用。

``` text
# source /etc/profile
```

必要に応じて Vim 設定ファイル（"~/.vimrc" or "/etc/vim/vimrc"）を編集する。（ここでは説明しない）

### 8. sudo のインストール

権限移譲を実現する sudo をインストール・設定する。

``` text
# apt -y install sudo
```

`visudo` コマンドで設定。

``` text
# 最終行に追加（masaru に root 権限全てを付与）
masaru   ALL=(ALL)   ALL
```

保存は `CTRL + O` で、ファイル名を `sudoers` にする。  
終了は `CTRL + X` を押下する。

これで、一般ユーザでログイン時に `sudo ＜コマンド＞` で root ユーザでのコマンド実行が可能になる。  
通常はこれで充分だが、コマンド別に権限を詳細に設定すること等も可能である。（ここでは説明しない）

### 9. システム起動時にメッセージ出力

デフォルトでは、システム起動時に各種メッセージが画面出力されない。

システム起動時に各種メッセージが画面出力するようにするには、以下のようにする。

File: `/etc/default/grub`

{% highlight bash %}
#GRUB_CMDLINE_LINUX_DEFAULT="quiet"  # <= コメントアウト
GRUB_CMDLINE_LINUX_DEFAULT=""        # <= 追加
{% endhighlight %}

``` text
# update-grub
```

これで、次回起動時にメッセージが画面出力される。

### 10. less コマンドへのシンタックスハイライトの設定

ます、 source-highlight をインストールする。

``` text
# apt -y install source-highlight
```

File: `/etc/profile`

{% highlight bash %}
# 最終行に以下の2行を追記
export LESS='-NR'
export LESSOPEN='| /usr/share/source-highlight/src-hilite-lesspipe.sh %s'
{% endhighlight %}

そして、即時適用。（ログインし直してもよい）

``` text
# source /etc/profile
```

---

以上。

