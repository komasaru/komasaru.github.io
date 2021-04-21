---
layout   : single
title    : "Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！"
published: true
date     : 2015-06-19 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
---

Debian GNU/Linux 8 (Jessie) に Web サーバ Nginx を導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0 前提条件

* Debian GNU/Linux 8 (Jesie) での作業を想定。
* 接続元のマシンは Linux Mint 17.1(64bit) を想定。
* Debian 公式リポジトリの Nginx はバージョンが古いため、Nginx リポジトリを使用して 1.8.0（当記事執筆時点最新安定版）をインストールする。
* 実際に運用する際は、ドキュメントルートを変更する等、設定を編集すること。

### 1. リポジトリ追加の設定

まず、キー追加。

``` text
# wget http://nginx.org/keys/nginx_signing.key
# apt-key add nginx_signing.key
```

そして、リポジトリ追加の設定を行う。  
実際には、以下を "/etc/apt/sources.list" の最終行に追加するか、以下の内容で "/etc/apt/sources.list.d/Nginx.list" なるファイルを作成する。

File: `/etc/apt/sources.list.d/Nginx.list`

{% highlight bash linenos %}
deb http://nginx.org/packages/debian/ jessie nginx
deb-src http://nginx.org/packages/debian/ jessie nginx
{% endhighlight %}

### 2. Nginx のインストール

Apt パッケージリストを更新後、 Nginx をインストールする。

``` text
# apt-get update
# apt-get -y install nginx
```

### 3. インストールの確認

Nginx がインストールできたか確認してみる。(`-v` の代わりに `-V` オプションを使用すると詳細に表示される）

``` text
# nginx -v
nginx version: nginx/1.8.0
```

### 4. 設定

今回のインストール環境の場合、基本的（グローバル）な設定のファイルは `/etc/nginx/nginx.conf` で、このファイルから "/etc/nginx/conf.d" ディレクトリ配下の設定ファイルを読み込む形式となっている。  
取り急ぎ、デフォルトのままとした。  
詳細な設定は、「[当ブログ Nginx 関連の過去記事](http://www.mk-mode.com/octopress/tags/nginx/ "Tag: Nginx - mk-mode BLOG")」を参照。

### 5. ファイアウォール(ufw)の設定

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

### 6. 起動確認

ブラウザで `http://＜サーバアドレス or ホスト名＞/` にアクセスしてみる。
"Welcome to nginx!" と以下５行くらい表示されば成功。

### 7. 自動起動の設定

マシン起動時に自動で Nginx を起動させるには以下のようにする。（インストール直後は自動起動するようになっているが）

``` text
# systemctl enable nginx

# sysv-rc-conf --list | grep nginx
nginx        0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

自動起動しないようにするには、

``` text
# systemctl disable nginx

# sysv-rc-conf --list | grep nginx
nginx        0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

### 8. 参考サイト

- [nginx: Linux packages](http://nginx.org/en/linux_packages.html "nginx: Linux packages")

---

以上。

