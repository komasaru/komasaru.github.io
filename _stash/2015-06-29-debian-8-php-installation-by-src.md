---
layout   : single
title    : "Debian 8 (Jessie) - PHP インストール（ソースビルド）！"
published: true
date     : 2015-06-29 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- PHP
---

Debian GNU/Linux 8 (Jessie) に PHP をソースをビルドしてインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
* クライアント側は Linux Mint 17.1 を想定。
* Web サーバ Nginx, DB サーバ MariaDB(MySQL) と連携することを想定。
* DB サーバ MariaDB がインストール済みであることを想定。
* Web&ReverseProxy サーバ Nginx がインストール済みであることを想定。
* PHP 5.6.8（当記事執筆時点で最新）をインストールする。

### 1. 依存パッケージのインストール

ビルドに必要と思われるパッケージで未インストールのものをインストールしておく。（`configure` オプションの指定により必要になるパッケージは異なる）  

``` text
# apt-get -y install g++ libxml2-dev libxslt-dev libcurl4-openssl-dev \
libicu-dev libmcrypt-dev zlib1g-dev libpng-dev
```

"libcurl4-openssl-dev" は "libcurl4-gnutls-dev" か "libcurl4-nss-dev" でもよい。（"libcurl-dev" が必要なだけなので）

### 2. アーカイブファイルのダウンロード＆展開

``` text
# cd /usr/local/src
# wget http://jp1.php.net/get/php-5.6.8.tar.gz/from/jp1.php.net/mirror -O php-5.6.8.tar.gz
# tar zxvf php-5.6.8.tar.gz
```

### 3. ビルド＆インストール

環境やサーバでやりたいことによっては、他に必要な `configure` オプションや不要なオプションもあるかもしれないが、取り急ぎ以下のようにした。必要になった際に都度ビルドし直すことにする。（但し、今回は Nginx と PHP-FPM で連携することを想定しているので `--enable-fpm` 等の PHP-FPM 関連のオプションは必須）

``` text
# cd php-5.6.8

# ./configure --prefix=/usr/local/php-5.6.8 \
--enable-mbstring \
--with-mysql \
--with-pdo-mysql \
--with-mysqli \
--enable-pcntl \
--enable-fpm \
--with-fpm-user=nginx \
--with-fpm-group=nginx \
--with-openssl \
--with-pcre-regex \
--with-zlib \
--with-curl \
--with-mhash \
--with-xsl \
--with-mcrypt \
--with-pear \
--enable-exif \
--enable-ftp \
--with-gd \
--enable-gd-native-ttf \
--enable-gd-jis-conv \
--without-unixODBC \
--disable-posix \
--disable-sysvmsg \
--disable-sysvshm \
--disable-sysvsem \
--disable-debug \
--enable-intl \
--with-config-file-path=/etc
# make
# make install
```

`make` 終了時に `make test` をするようメッセージが出力されるので、必要なら `make test` でビルド結果をテストする。

### 4. 環境変数 PATH の設定

前述のように `configure` でインストール先を `/usr/local/php-5.6.8` としたので、最初はパスが通っていない。以下のように "/etc/profile" の最終行に記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %}
export PATH=/usr/local/php-5.6.8/bin:$PATH
{% endhighlight %}

そして、即時有効化。

``` text
# source /etc/profile
```

### 5. インストールの確認

``` text
# php -v
PHP 5.6.8 (cli) (built: May  8 2015 10:35:32)
Copyright (c) 1997-2015 The PHP Group
Zend Engine v2.6.0, Copyright (c) 1998-2015 Zend Technologies
```

### 6. 設定ファイルの準備

ソースをビルドしてインストールした場合、 "php.ini" は存在しない。  
`configure` 時に設定フィルの配置場所を `--with-config-file-path` で指定した場合はそのディレクトリに、指定しなかった場合は "＜インストールディレクトリ＞/lib/" にサンプルファイルを複製する。（以下は指定した場合）  
ちなみに、 `php -i | grep php.ini` or `php --ini` で設定ファイルの配置すべき場所（今存在する場所ではない）を確認できる。

``` text
# cp /usr/local/src/php-5.6.8/php.ini-production /etc/php.ini
```

取り急ぎ、タイムゾーンだけ設定しておく。

File: `/etc/php.ini`

{% highlight bash linenos %}
date.timezone = Asia/Tokyo
{% endhighlight %}

---

以上。

