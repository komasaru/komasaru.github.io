---
layout   : single
title    : "Debian 7.8 - Web サーバ Nginx インストール（Apt 使用）！"
published: true
date     : 2015-01-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
---

以前 Debian GNU/Linux Wheezy 7.1.0 サーバで Web・プロキシサーバ Nginx をソースビルドでインストールする方法について紹介しました。

* [Debian 7 Wheezy - Web サーバ Nginx をインストール（ソースビルド）！]({{site.baseurl}}/2013/10/28/debian-7-install-nginx-by-src/ "Debian 7 Wheezy - Web サーバ Nginx をインストール（ソースビルド）！")

今回は Nginx 公式の Apt リポジトリを使用してインストール方法についての記録です。

<!--more-->

### 0 前提条件

- Debian GNU/Linux Wheezy 7.8.0 での作業を想定。
- 接続元のマシンは Linux Mint 17.1(64bit) を想定。
- インストールする Nginx のバージョンは 1.6.2（当記事執筆時点最新安定版）を想定。
- ファイアウォール ufw 導入済みであることを想定。（参照「[Debian 7.8 - ファイアウォール ufw 導入！]({{site.baseurl}}/2015/01/17/debian-7-8-ufw-installation/ "Debian 7.8 - ファイアウォール ufw 導入！")」）

### 1. リポジトリ追加設定

まず、キー追加。

``` text
# wget http://nginx.org/keys/nginx_signing.key
# apt-key add nginx_signing.key
```

そして、リポジトリ追加設定を行う。  
実際には、以下を "/etc/apt/sources.list" の最終行に追加するか、以下の内容で "/etc/apt/sources.list.d/Nginx.list" なるファイルを作成する。

File: `"/etc/apt/sources.list"`

{% highlight bash linenos %}
deb http://nginx.org/packages/debian/ wheezy nginx
deb-src http://nginx.org/packages/debian/ wheezy nginx
{% endhighlight %}

### 2. Nginx インストール

Apt パッケージリストを更新後、 Nginx をインストールする。

``` text
# apt-get update
# apt-get install nginx
```

### 3. インストール確認

Nginx がインストールできたか確認してみる。(`-v` の代わりに `-V` オプションを使用すると詳細に表示される）

``` text
# nginx -v
nginx version: nginx/1.6.2
```

### 4. 設定

今回のインストール環境の場合、基本的（グローバル）な設定のファイルは `/etc/nginx/nginx.conf` で、このファイルから "/etc/nginx/conf.d" ディレクトリ配下の設定ファイルを読み込む形式となっている。  
取り急ぎ、デフォルトのままとした。  
詳細な設定は、「[当ブログ Nginx 関連の過去記事](http://www.mk-mode.com/octopress/tags/nginx/ "Tag: Nginx - mk-mode BLOG")」を参照のこと。

### 5. サービスの開始・停止等

サービスを使って Nginx を起動してみる。

``` text
# /etc/init.d/nginx start|stop|status|restart|reload|force-reload|upgrade|configtest

or

# service nginx start|stop|status|restart|reload|force-reload|upgrade|configtest
```

### 6. ファイアウォール (ufw) 設定

TCP ポート 80 を開放する必要がある。（HTTPS の場合は TCP: 443）

``` text
# ufw allow 80/tcp
Rule added
Rule added (v6)

# ufw status
    :
80/tcp                     ALLOW       Anywhere
    :
80/tcp                     ALLOW       Anywhere (v6)
```

### 7. 起動確認

ブラウザで `http://＜サーバアドレス or ホスト名＞/` にアクセスしてみる。
"Welcome to nginx!" と以下５行くらい表示されば成功。

### 8. 自動起動設定

マシン起動時に自動で Nginx を起動させるには以下のようにする。（インストール直後は自動起動するようになっているが）

`sysv-rc-conf` 導入済みの場合は、以下のようにする。

``` text
# sysv-rc-conf nginx on

# sysv-rc-conf --list | grep nginx
nginx        0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

自動起動しないようにするには、

``` text
# sysv-rc-conf nginx off

# sysv-rc-conf --list | grep nginx
nginx        0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

`sysv-rc-conf` コマンド未導入なら、 `insserv` コマンドで設定可能。  
（`insserv -s` コマンドではサービスの状況を確認できないので、 `ls` コマンドで init プロセスファイルの有無を確認）

``` text
# insserv -d nginx

# ls -l /etc/rc*.d/*nginx
lrwxrwxrwx 1 root root 15  1月 16 17:20 /etc/rc0.d/K01nginx -> ../init.d/nginx
lrwxrwxrwx 1 root root 15  1月 16 17:20 /etc/rc1.d/K01nginx -> ../init.d/nginx
lrwxrwxrwx 1 root root 15  1月 16 17:36 /etc/rc2.d/S01nginx -> ../init.d/nginx
lrwxrwxrwx 1 root root 15  1月 16 17:36 /etc/rc3.d/S01nginx -> ../init.d/nginx
lrwxrwxrwx 1 root root 15  1月 16 17:36 /etc/rc4.d/S01nginx -> ../init.d/nginx
lrwxrwxrwx 1 root root 15  1月 16 17:36 /etc/rc5.d/S01nginx -> ../init.d/nginx
lrwxrwxrwx 1 root root 15  1月 16 17:20 /etc/rc6.d/K01nginx -> ../init.d/nginx
```

``` text
# insserv -r nginx

# ls -l /etc/rc*.d/*nginx
ls: /etc/rc*.d/*nginx にアクセスできません: そのようなファイルやディレクトリはありません
```

ちなみに、`update-rc.d` コマンドで設定する方法は最近は非推奨らしい。

### 9. 参考サイト

- [nginx: Linux packages](http://nginx.org/en/linux_packages.html "nginx: Linux packages")

---

以上。

