---
layout   : single
title    : "MySQL - datadir 変更時のエラー対策(on Debian)！"
published: true
date     : 2015-02-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
- LinuxMint
- Debian
---

Linux Mint などの Debian GNU/Linux 系のディストリビューション上に Apt で MySQL サーバをインストール後に datadir を変更すると、エラーで起動しなく状況に陥るようです。
（ちなみに、 Debian Wheezy 上の MariaDB では今回のような現象は発生しない（経験上））

当方、これまで MySQL サーバはソースをビルドしてインストールことが多かったため、今回のような現象については疎かったというのもありますが。

以下、現象・原因・対策についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit) での作業を想定。（Debian 系は同じ）
* MySQL 5.6.23 を MySQL 公式 Apt リポジトリを使用してインストールしている。  
  （参照：「[MySQL 5.6 - APT リポジトリからインストール(on Linux Mint 17.1)！]({{site.baseurl}}/2015/01/10/mysql-installation-on-linux-mint-by-apt/ "MySQL 5.6 - APT リポジトリからインストール(on Linux Mint 17.1)！")」）

### 1. 現象

まず、MySQL サーバを停止する。

そして、 datadir を変更すべく "my.cnf" を以下のように変更する。

File: `/etc/mysql/my.cnf`

{% highlight bash linenos %}
[mysqld]
#datadir = /var/lib/mysql
datadir = /home/mysql
{% endhighlight %}

次に、これまでの datadir を新しい場所に所有者・権限を維持したまま複製する。

最後に、MySQL サーバを起動する。

すると、エラーで起動せず、ログを確認してみると以下のようなメッセージが出力されている。

File: `/var/log/mysql/error.log`

{% highlight text linenos %}
^G/usr/sbin/mysqld: Can't find file: './mysql/plugin.frm' (errno: 13 - Permission denied)
{% endhighlight %}

### 2. 原因

プログラム単位でアクセス制御を行う AppArmor の設定で、新しいディレクトリに対するアクセス許可が設定されていなかったため。

File: `/etc/apparmor.d/usr.sbin.mysqld`

{% highlight text linenos %}

#          :
# ====< 途中省略 >====
#          :

# Allow data dir access
  /var/lib/mysql/ r,
  /var/lib/mysql/** rwk,

#          :
# ====< 途中省略 >====
#          :
{% endhighlight %}

### 3. 対策

アクセス許可するディレクトリの設定を変更する。

File: `/etc/apparmor.d/usr.sbin.mysqld`

{% highlight text linenos %}

#          :
# ====< 途中省略 >====
#          :

# Allow data dir access
  #/var/lib/mysql/ r,
  #/var/lib/mysql/** rwk,
  /home/mysql/ r,
  /home/mysql/** rwk,

#          :
# ====< 途中省略 >====
#          :
{% endhighlight %}

これで、 MySQL が新しいディレクトリを datadir として起動するようになる。

---

ソースをビルドしてインストールすることが多かったので、Apt でインストールして datadir を変更するする際に若干戸惑いましたが、今回のことで勉強になりました。

以上。

