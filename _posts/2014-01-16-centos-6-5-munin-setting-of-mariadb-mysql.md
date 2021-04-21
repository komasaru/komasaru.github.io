---
layout   : single
title    : "CentOS 6.5 - サーバ監視ツール（munin）で MariaDB(MySQL) を監視！"
published: true
date     : 2014-01-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- munin
- MariaDB
- MySQL
---

前回は CentOS 6.5 サーバ上のサーバ監視ツール munin で CPU 温度・電圧・ファン回転数監視の設定を行いました。  
今回はサーバ監視ツール munin で MariaDB(MySQL) の監視設定を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 閲覧に使用する Web(HTTP) サーバは Nginx を想定。
- MySQL 用プラグインはデフォルトで用意されているものを使用する。

### 1. munin-node 設定ファイル編集

File: `/etc/munin/plugin-conf.d/munin-node`

{% highlight bash linenos %}
[mysql*]
env.mysqlopts -u root -p＜root のパスワード＞
#env.mysqladmin /usr/bin/mysqladmin              # <= デフォルトの MySQL の場合
env.mysqladmin /usr/local/mysql/bin/mysqladmin   # <= ソースインストールした場合
{% endhighlight %}

### 2. シンボリックリング設定

あらかじめデフォルトで用意されているプラグインの中から、使用したいものにシンボリックリンクを設定する。  
（ストレージエンジンに "MyISAM" を使用していないなら、以下の `mysql_isam_space_` の行は不要）

``` text
# ln -s /usr/share/munin/plugins/mysql_bytes /etc/munin/plugins/mysql_bytes
# ln -s /usr/share/munin/plugins/mysql_innodb /etc/munin/plugins/mysql_innodb
# ln -s /usr/share/munin/plugins/mysql_isam_space_ /etc/munin/plugins/mysql_isam_space_  # <= MyISAM 使用時のみ
# ln -s /usr/share/munin/plugins/mysql_queries /etc/munin/plugins/mysql_queries
# ln -s /usr/share/munin/plugins/mysql_slowqueries /etc/munin/plugins/mysql_slowqueries
# ln -s /usr/share/munin/plugins/mysql_threads /etc/munin/plugins/mysql_threads
```

### 3. munin-node 再起動

``` text
# /etc/rc.d/init.d/munin-node restart
Stopping Munin Node agents:                                [  OK  ]
Starting Munin Node:                                       [  OK  ]
```

### 4. 動作確認

５分ほど待ってブラウザから `http://＜サーバ名orIPアドレス＞/munin` にアクセスして、 "MySQL" 関連が追加されていることを確認する。

以下は、実運用中サーバでの例。

![CENTOS_6-5_MUNIN_CPU]({{site.baseurl}}/images/2014/01/16/CENTOS_6-5_MUNIN_MYSQL.png "CENTOS_6-5_MUNIN_MYSQL")

---

次回は、サーバ監視ツール munin で Web(HTTP) サーバ Nginx を監視する設定について紹介する予定です。

以上。

