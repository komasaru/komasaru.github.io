---
layout   : single
title    : "Debian 10 (buster) - MariaDB 10.4 サーバ構築（ソースビルド）！"
published: true
date     : 2019-12-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- Debian
- MariaDB
---

Debian GNU/Linux 10 (buster) 上に DB サーバ MariaDB（10.4系）を構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 接続元のマシンは LMDE 3 (Linux Mint Debian Edition 3; 64bit) を想定。
* インストールする MariaDB は、当記事執筆時点で最新の 10.4.8 とする。
* MariaDB とは言っても中身は MySQL が元になっているので、各所で `mysql` のキーワードが出現する。
* データディレクトリは `/var/lib/mysql` ディレクトリ配下とする。
* root ユーザでの作業を想定。

### 1. sources.list ファイルの編集

今回は MariaDB をソースをビルドしてインストールするので、本来は `sources.list` の編集は必要ないが、 MariaDB のビルドに依存するパッケージをインストールすために使用するので、編集する。  
`/etc/apt/sources.list` に直接記述してもよいが、今回は `/etc/apt/sources.list.d/mariadb.list` を新規作成する。  
記述する内容は「[こちら(repository configuration tool)](https://downloads.mariadb.org/mariadb/repositories/#mirror=yamagata-university "repository configuration tool")」で確認可能。

File: `/etc/apt/sources.list.d/mariadb.list`

{% highlight bash %}
# MariaDB 10.4 repository list - created 2019-09-17 04:07 UTC
# http://downloads.mariadb.org/mariadb/repositories/
deb [arch=amd64] http://mirror.aarnet.edu.au/pub/MariaDB/repo/10.4/debian buster main
deb-src http://mirror.aarnet.edu.au/pub/MariaDB/repo/10.4/debian buster main
{% endhighlight %}

`sources.list` を使用しない方法等については「[こちら](http://downloads.mariadb.org/mariadb/repositories/ "MariaDB - Setting up MariaDB Repositories - MariaDB")」を参照。

### 2. パッケージリストの更新

`sources.list` を編集したので、パッケージリストを更新する。

``` text
# apt -y update
```

``` text
      :
===< 中略 >===
      :

エラー:2 http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/10.3/debian stretch InRelease
  公開鍵を利用できないため、以下の署名は検証できませんでした: NO_PUBKEY F1656F24C74CD1D8
無視:8 https://packages.groonga.org/debian stretch InRelease
ヒット:9 https://packages.groonga.org/debian stretch Release
パッケージリストを読み込んでいます... 完了
W: GPG エラー: http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/10.3/debian stretch InRelease: 公開鍵を利用できないため、以下の署名は検証できませんでした: NO_PUBKEY F1656F24C74CD1D8
E: リポジトリ http://ftp.yz.yamagata-u.ac.jp/pub/dbms/mariadb/repo/10.3/debian stretch InRelease は署名されていません。
N: このようなリポジトリから更新を安全に行うことができないので、デフォルトでは更新が無効になっています。
N: リポジトリの作成とユーザ設定の詳細は、apt-secure(8) man ページを参照してください。
```

上記のように、 GPG 公開鍵に関するエラーが出力される場合は、以下のようにした後に再試行する。

``` text
# apt-key adv --keyserver keyserver.ubuntu.com --recv-keys F1656F24C74CD1D8
```

### 3. 依存パッケージのインストール

``` text
# apt build-dep mariadb-server
```

または、「[こちら](https://mariadb.com/kb/en/library/Build_Environment_Setup_for_Linux/ "Build Environment Setup for Linux - MariaDB Knowledge Base")」を参考に、ビルドに必要なパッケージをインストールしてもよい。（但し、インストール漏れに注意）

### 4. sources.list ファイルの削除

MariaDB 用 `sources.list` ファイル `/etc/apt/sources.list.d/mariadb.list` はもう不要なので削除しておく。（`/etc/apt/sources.list` を直接編集したのなら、 MariaDB に関する記述を削除する）

``` text
# rm -f /etc/apt/sources.list.d/mariadb.list
```

### 5. アーカイブの取得

「[こちら](https://downloads.mariadb.org/ "Downloads - MariaDB")」から MariaDB の最新 Stable 版をダウンロードし、適当なディレクトリに配置する。（今回、当方はダウンロードした `mariadb-10.4.8.tar.gz` を `/usr/local/src` ディレクトリ配下に配置した）

そして、展開する。

``` text
# cd /usr/local/src
# wget -O mariadb-10.4.8.tar.gz https://downloads.mariadb.org/interstitial/mariadb-10.4.8/source/mariadb-10.4.8.tar.gz/from/http%3A//mirror.aarnet.edu.au/pub/MariaDB/
# tar zxvf mariadb-10.4.8.tar.gz
```

### 6. ソースのビルド＆インストール

先ほど展開したディレクトリと同じ階層にビルド用のディレクトリを作成し、そのディレクトリ内で `cmake` する。（以下の各種ビルドオプションは当方の例）

``` text
# mkdir build-mariadb
# cd build-mariadb
# cmake ../mariadb-10.4.8 -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
 -DMYSQL_DATADIR=/var/lib/mysql \
 -DMYSQL_UNIX_ADDR=/var/run/mysqld/mysqld.sock \
 -DENABLED_LOCAL_INFILE=1 \
 -DDEFAULT_CHARSET=utf8_mb4 \
 -DDEFAULT_COLLATION=utf8_general_ci \
 -DWITH_EXTRA_CHARSETS=all \
 -DWITH_INNOBASE_STORAGE_ENGINE=1
```

そして、 `make` 後、インストールする。

``` text
# make -j$(grep '^processor' /proc/cpuinfo | wc -l)
# make install
```

* `make` コマンドの `-j` はなくても問題ない。（並列ビルド（高速化）しないのなら）

### 7. ユーザ・グループ作成

MySQL 用のユーザとグループを作成する。

``` text
# groupadd mysql
# useradd -r mysql -g mysql
```

### 8. データディレクトリ作成

データディレクトリが無ければ作成し、所有者・グループを設定しておく。

``` text
# mkdir /var/lib/mysql
# chown -R mysql. /var/lib/mysql
```

### 9. ログディレクトリ作成

ログ用ディレクトリを作成し、所有者・グループを設定しておく。

``` text
# mkdir /var/log/mysql
# chown -R mysql. /var/log/mysql/
```

### 10. ソケット・PIDディレクトリ作成

ソケット・プロセスID用ディレクトリの所有者・グループを設定する。

``` text
# mkdir /var/run/mysqld
# chown -R mysql. /var/run/mysqld
```

### 11. 設定ファイルの編集

用意されている設定ファイルの中から自分の環境に近いものを `/etc/my.cnf` として複製し、更に自分の環境に合うよう編集する。

``` text
# cp /usr/local/mysql/support-files/my-huge.cnf /etc/my.cnf
```

【注意】  
`/etc/my.cnf` より後に `/etc/mysql/my.cnf` が読み込まれる（`/etc/my.cnf` の内容よりも `/etc/mysql/my.cnf` の内容が優先される）ので、 `/etc/my.cnf` のみを使用したければ `/etc/mysql/my.cnf` を削除するか、（拡張子が `.cnf` で終わらないよう）リネームする。  
`/etc/my.cnf` を作成せず、最初から `/etc/mysql/my.cnf` を編集する方法でもよいだろう。

### 12. 初期 DB の生成

``` text
# cd /usr/local/mysql
# scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/var/lib/mysql --defaults-file=/etc/my.cnf
```

### 13. 起動スクリプトの作成

``` text
# cp support-files/mysql.server /etc/init.d/mysqld
# chmod +x /etc/init.d/mysqld
```

### 14. PID ディレクトリの自動生成

前項の方法で起動スクリプトを用意した場合、 `/var/run`(`/run`) 配下のディレクトリは自動で生成してくれないので、自動で生成するよう、 `/usr/lib/tmpfiles.d/var.conf` に以下の1行を追加する。（`/var/run`(`/run`) ディレクトリは `tmpfs` を使用しているため、 OS 再起動後には消滅する。通常は、起動スクリプト内で生成するよう設定されていることが多いが、今回使用したスクリプト内では設定されていなかった。）  
（当方ブログ過去記事「[Linux - マシン起動時にディレクトリ・ファイルを自動作成！](https://www.mk-mode.com/octopress/2015/12/08/linux-dir-file-automatic-creation-on-boot/ "Linux - マシン起動時にディレクトリ・ファイルを自動作成！")」も参照）

File: `/usr/lib/tmpfiles.d/var.conf`

{% highlight bash %}
d /var/run/mysqld 0755 mysql root -
{% endhighlight %}

もしくは、 `mysqld_save` コマンド実行直前に以下のような記述を追加してもよいだろう。（当方、未確認）

File: `/etc/init.d/mysqld`

{% highlight bash %}
test -e /var/run/mysqld || install -m 755 -o mysql -g root -d /var/run/mysqld
{% endhighlight %}

### 15. 環境変数 PATH の設定

各種コマンドへのパスを設定するために `/etc/profile` の最終行に以下の記述を追加する。

File: `/etc/profile`

{% highlight bash %}
PATH=/usr/local/mysql/bin:$PATH
export PATH
{% endhighlight %}

そして、即時有効化。（マシン再起動でもよい）

``` text
# source /etc/profile
```

### 16. 起動・再起動・ステータス確認・停止のテスト

起動・再起動・ステータス確認・停止ができるか確認する。

``` text
# /etc/init.d/mysqld start
# /etc/init.d/mysqld restart
# /etc/init.d/mysqld status
# /etc/init.d/mysqld stop
```

もちろん、 `service` コマンドでも起動・再起動・ステータス確認・停止ができるはず。

また、 `systemctl` コマンドでも起動・再起動・ステータス確認・停止ができるはず。

``` text
# systemctl start mysqld
# systemctl restart mysqld
# systemctl status mysqld
# systemctl stop mysqld
```

### 17. セキュリティ設定

MariaDB サーバが起動していることを確認し、root のバスワード設定、テストDB削除等を行う。
（`root` のパスワードのみ設定して、後はデフォルト（エンター押下）。但し、 `root` によるリモート接続を行いたければ `Disallow root login remotely?` で `n` 応答）

``` text
# cd /usr/local/mysql/bin
# ./mysql_secure_installation
```

### 18. 動作確認

MariaDB サーバにログインしてみる。

``` text
# mysql -u root -p
Enter password:        # <= root パスワードで応答
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 20
Server version: 10.4.8-MariaDB-log Source distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

root@localhost:(none) 13:39:56> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.002 sec)

root@localhost:(none) 13:39:59> exit
Bye
```

* 上記の（やや複雑な）プロンプトは当方の設定によるもの。

### 19. 自動起動の設定

OS 起動時に自動で起動するように設定するには次のようにする。（以下は `systemd-sysv` で設定する場合）

``` text
# systemctl is-enabled mysqld
mysqld.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install is-enabled mysqld
disabled

# systemctl enable mysqld
mysqld.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable mysqld

# systemctl is-enabled mysqld
mysqld.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install is-enabled mysqld
enabled
```

### 20. ファイアウォール(ufw)の設定

リモートで MariaDB サーバにアクセスする場合（GUI ツールを使用する場合等）は、TCP ポート `3306` を開放する必要がある。

``` text
# ufw allow 3306/tcp
Rule added

# ufw status
    :
3306/tcp                   ALLOW       Anywhere
    :
```

---

以上。

