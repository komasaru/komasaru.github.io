---
layout   : single
title    : "CentOS 7.0 - サーバ監視ツール Munin で MariaDB(MySQL) を監視！"
published: true
date     : 2014-09-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- munin
---

「CentOS 7.0 - サーバ監視ツール Munin で MariaDB(MySQL) を監視」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- 閲覧に使用する Web(HTTP) サーバは Nginx を想定。
- MySQL 用プラグインはデフォルトで用意されているものを使用する。

### 1. munin-node 設定ファイル編集

File: `/etc/munin/plugin-conf.d/munin-node`

{% highlight bash linenos %}
[mysql*]
env.mysqlopts -u root -p＜root のパスワード＞
env.mysqladmin /usr/bin/mysqladmin
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
# systemctl restart munin-node
```

### 4. 動作確認

５分ほど待ってブラウザから `http://＜サーバ名orIPアドレス＞/munin` にアクセスして、"sensor" に "MySQL" 関連が追加されていることを確認する。  
当然ながら、マシンが仮想マシンなら値は取得できないので、ご注意を！

以下は、実運用中（CentOS 6.5）サーバでの例。

![CENTOS_7-0_MUNIN_MYSQL]({{site.baseurl}}/images/2014/09/11/CENTOS_7-0_MUNIN_MYSQL.png "CENTOS_7-0_MUNIN_MYSQL")

---

以上。

