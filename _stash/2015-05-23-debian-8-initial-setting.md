---
layout   : single
title    : "Debian 8 (Jessie) - サーバ初期設定！"
published: true
date     : 2015-05-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
---

Debian GNU/Linux 8 (Jessie) インストール後の初期設定についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 「[Debian 8 (Jessie) - インストール（サーバ用途・最小構成）！]({{site.baseurl}}/2015/05/22/debian-8-installation-for-small-server/ "Debian 8 (Jessie) - インストール（サーバ用途・最小構成）！")」の方法でインストールが完了していることを想定。
* ユーザ名は "masaru" とを想定。
* コマンドラインプロンプト `#` は root ユーザ、 `$` は一般ユーザであることを理解しておく。  
  コメントしての `#` と混同しないよう注意する。
* ネットワークカードは "eth0" を想定。
* IP アドレスは固定する。
* 各種設定ファイルの編集方法までは説明しない。（`vi` コマンドについての初歩的な知識があることが前提）  

### 1. ネットワークの設定

デフォルトでは DHCP で IP アドレスが付与されるので、固定する。  
root でログイン後 "/etc/network/interfaces" を編集する。

File: `/etc/network/interfaces`

{% highlight bash linenos %}
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto eth0

#iface eth0 inet dhcp           # <= コメント化（DHCP を使用しない）
iface eth0 inet static          # <= 追加（IP アドレス固定化）
address         192.168.11.102  # <= 追加（IP アドレス）
network         192.168.11.0    # <= 追加（ネットワークアドレス）
netmask         255.255.255.0   # <= 追加（ネットマスク）
broadcast       192.168.11.255  # <= 追加（ブロードキャストアドレス）
gateway         192.168.11.1    # <= 追加（デフォルトゲートウェイ（ルータの IP アドレス））
dns-nameservers 192.168.11.1    # <= 追加（ネームサーバ（現時点ではルータの IP アドレス））
{% endhighlight %}

そして、設定変更の反映。（マシンを再起動してもよい）

``` text
# ifdown eth0 && ifup eth0
```

以下のコマンドで確認してみるとよい。

``` text
# ifconfig
```

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

以下のコマンドで IPv6 が無効になっていることを確認してみるとよい。

``` text
# ifconfig
```

### 3. 管理用ユーザの設定

root でログインし、インストール時に作成した一般ユーザを管理ユーザにし、 root になれるよう設定する。

``` text
# usermod -G adm masaru
```

File: `/etc/pam.d/su`

{% highlight bash linenos %}
# 15行目当たり、コメント解除し編集
auth       required   pam_wheel.so  group=adm
{% endhighlight %}

ちなみに、RedHat 系の場合 `adm` ではなく `wheel` である。

（--- 以下、ローカルマシンから一般ユーザで SSH 接続し root になって作業 ---）

### 4. コマンドエイリアスの設定

よく使用するコマンド＋オプションのエイリアスを設定しておく。  
取り急ぎ、当方がよく使用するコマンドのみ。

root に適用する場合は、root ユーザでログインして以下のように設定する。

File: `/etc/profile`

{% highlight bash linenos %}
alias ll='ls -l --color=auto'  # <= 最終行に追記
{% endhighlight %}

即時適用。

``` text
# source /etc/profile
```

各ユーザに適用する場合は、各ユーザでログインして以下のように設定する。

File: `~/.bashrc`

{% highlight bash linenos %}
alias ll='ls -l --color=auto'  # <= 最終行に追記
{% endhighlight %}

即時適用。

``` text
$ source .bashrc
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

システムの各種パッケージのバージョンが古い可能性もあるので、最新にしておく。

``` text
# apt-get update      # <= パッケージリスト最新化

# apt-get -y upgrade  # <= システム最新化
```

### 7. Vim のインストール

テキストエディタ Vi の高機能版 Vim をインストール・設定する。

``` text
# apt-get -y install vim
```

File: `/etc/profile`

{% highlight bash linenos %}
alias vi='vim'  # 最終行に追加
{% endhighlight %}

即時適用。

``` text
# source /etc/profile
```

必要に応じて Vim 設定ファイル（"~/.vimrc" or "/etc/vim/vimrc"）を編集する。（ここでは説明しない）

### 8. sudo のインストール

権限移譲を実現する sudo をインストール・設定する。

``` text
# apt-get -y install sudo
```

`visudo` コマンドで設定。

File: `visudo`

{% highlight bash linenos %}
# 最終行に追加（masaru に root 権限全てを付与）
masaru   ALL=(ALL)   ALL
{% endhighlight %}

保存は `CTRL + O` で、ファイル名を `sudoers` にする。  
終了は `CTRL + X` を押下する。

これで、一般ユーザでログイン時に `sudo ＜コマンド＞` で root でのコマンド実行が可能になる。  
通常はこれで充分だが、コマンド別に権限を詳細に設定すること等も可能である。（ここでは説明しない）

---

以上。

