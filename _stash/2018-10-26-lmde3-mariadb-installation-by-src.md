---
layout   : single
title    : "LMDE 3 - MariaDB 10.3 サーバ構築（ソースビルド）！"
published: true
date     : 2018-10-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LMDE3
- MariaDB
---

データベースサーバ MariaDB 10.3 系を LMDE 3 (Linux Mint Debian Edition 3) に構築する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* インストールする MariaDB は、当記事執筆時点で最新の 10.3.9 とする。
* インストール先は “/usr/local/mysql” ディレクトリ配下とする。
* データディレクトリは “/var/lib/mysql” ディレクトリ配下とする。
* root ユーザでの作業を想定。

### 1. 依存パッケージのインストール

「[こちら](https://mariadb.com/kb/en/library/Build_Environment_Setup_for_Linux/ "Build Environment Setup for Linux - MariaDB Knowledge Base")」を参考に、ビルドに必要なパッケージをインストールする。  
当方は、未インストールだった以下をインストールした。

``` text
$ sudo apt install cmake bison libevent-dev
```

### 2. アーカイブの取得

「[こちら](https://downloads.mariadb.org/ "Downloads - MariaDB")」から MariaDB の最新 Stable 版をダウンロードし、適当なディレクトリに配置する。（今回、当方は "mariadb-10.3.9.tar.gz" をダウンロードした）

そして、展開する。

``` text
$ tar zxvf mariadb-10.3.9.tar.gz
```

### 3. ソースのビルド＆インストール

先ほど展開したディレクトリと同じ階層にビルド用のディレクトリを作成する。（先ほど展開したディレクトリ内ではない）

``` text
$ mkdir build-mariadb
```

次に、ビルド用ディレクトリ内へ移動して cmake する。（各種ビルドオプションは当方の例）

``` text
$ cd build-mariadb
$ cmake ../mariadb-10.3.9 -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
-DMYSQL_DATADIR=/var/lib/mysql \
-DMYSQL_UNIX_ADDR=/var/run/mysqld/mysqld.sock \
-DENABLED_LOCAL_INFILE=1 \
-DDEFAULT_CHARSET=utf8_mb4 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_EXTRA_CHARSETS=all \
-DWITH_INNOBASE_STORAGE_ENGINE=1
```

そして、 make 後、インストールする。

``` text
$ make -j$(grep '^processor' /proc/cpuinfo | wc -l)
$ sudo make install
```

### 4. ユーザ・グループ作成

MySQL 用のユーザとグループを作成する。

``` text 
$ sudo groupadd mysql
$ sudo useradd -r -g mysql mysql
```

### 5. データディレクトリ作成

データディレクトリが無ければ作成し、所有者・グループを設定しておく。

``` text
$ sudo mkdir /var/lib/mysql
$ sudo chown -R mysql. /var/lib/mysql
```

### 6. ログディレクトリ作成

ログ用ディレクトリを作成し、所有者・グループを設定しておく。

``` text
$ sudo mkdir /var/log/mysql
$ sudo chown -R mysql. /var/log/mysql/
```

### 7. ソケット・PIDディレクトリ作成

ソケット・プロセスID用ディレクトリの所有者・グループを設定する。

``` text
$ sudo mkdir /var/run/mysqld
$ sudo chown -R mysql. /var/run/mysqld
```

### 8. 設定ファイルの編集

用意されている設定ファイルの中から自分の環境に近いものを `/etc/my.cnf` として複製し、更に自分の環境に合うよう編集する。

``` text
$ sudo cp /usr/local/mysql/support-files/my-huge.cnf /etc/my.cnf
```

【注意】  
`/etc/my.cnf` より後に `/etc/mysql/my.cnf` が読み込まれる（`/etc/my.cnf` の内容よりも `/etc/mysql/my.cnf` の内容が優先される）ので、 `/etc/my.cnf` のみを使用したければ `/etc/mysql/my.cnf` を削除するか、（拡張子が `.cnf` で終わらないよう）リネームするなどする。  
`/etc/my.cnf` を作成せず、最初から `/etc/mysql/my.cnf` を編集する方法でも良いだろう。

[](
$ sudo mv /etc/mysql/my.cnf{,.org}
)

### 9. 初期 DB の生成

``` text
$ cd /usr/local/mysql
$ sudo scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/var/lib/mysql --defaults-file=/etc/my.cnf
```

### 10. 起動スクリプトの作成

``` text
$ sudo cp support-files/mysql.server /etc/init.d/mysqld
$ sudo chmod +x /etc/init.d/mysqld
```

### 11. PID ディレクトリの自動生成

前項の方法で起動スクリプトを用意した場合、 "/var/run"("/run") 配下のディレクトリは自動で生成してくれないので、自動で生成するよう、 "/usr/lib/tmpfiles.d/var.conf" に以下の1行を追加する。（"/var/run"("/run") ディレクトリは tmpfs を使用しているため、 OS 再起動後には消滅する。通常は、起動スクリプト内で生成するよう設定されていることが多いが、今回使用したスクリプト内では設定されていなかった。）  
（当方ブログ過去記事「[Linux - マシン起動時にディレクトリ・ファイルを自動作成！](https://www.mk-mode.com/octopress/2015/12/08/linux-dir-file-automatic-creation-on-boot/ "Linux - マシン起動時にディレクトリ・ファイルを自動作成！")」も参照）

File: `/usr/lib/tmpfiles.d/var.conf`

{% highlight text linenos %}
d /var/run/mysqld 0755 mysql root -
{% endhighlight %}

もしくは、 `mysqld_save` コマンド実行直前に以下のような記述を追加してもよいだろう。（当方、未確認）

File: `/etc/init.d/mysqld`

{% highlight text linenos %}
test -e /var/run/mysqld || install -m 755 -o mysql -g root -d /var/run/mysqld
{% endhighlight %}

### 12. 環境変数 PATH の設定

mysql コマンドへのパスを設定するために /etc/profile の最終行に以下の記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %}
PATH=/usr/local/mysql/bin:$PATH
export PATH
{% endhighlight %}

そして、即時有効化。（マシン再起動でもよい）

``` text
# source /etc/profile
```

### 13. 起動・再起動・ステータス確認・停止のテスト

起動・再起動・ステータス確認・停止ができるか確認する。

``` text
$ sudo /etc/init.d/mysqld start
$ sudo /etc/init.d/mysqld restart
$ sudo /etc/init.d/mysqld status
$ sudo /etc/init.d/mysqld stop
```

もちろん、”service” コマンドでも起動・再起動・ステータス確認・停止ができるはずです。

また、 init サービスではなく systemd として使用したければ、 `apt install systemd-sysv` を実行して、マシンをリブートする。（systemd-sysv インストール済みなら、リブートのみでよい？ `systemctl daemon-reload` のみでよい？ ※当方、未確認）

### 14. セキュリティ設定

MariaDB サーバが起動していることを確認し、root のバスワード設定、テストDB削除等を行う。
（root のパスワードのみ設定して、後はデフォルト（エンター押下）。但し、 root によるリモート接続を行いたければ Disallow root login remotely? で n 応答）

``` text
$ cd /usr/local/mysql/bin
$ sudo ./mysql_secure_installation
```

### 15. 動作確認

MariaDB サーバにログインしてみる。

``` text
# mysql -u root -p
Enter password:        # <= root パスワードで応答
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 20
Server version: 10.3.9-MariaDB-log Source distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

root@localhost:(none) 23:33:18> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.001 sec)

root@localhost:(none) 23:33:26>
```

---

以上。

