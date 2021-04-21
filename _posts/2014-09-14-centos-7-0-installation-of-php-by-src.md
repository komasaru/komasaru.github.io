---
layout   : single
title    : "CentOS 7.0 - PHP インストール（ソースビルド）！"
published: true
date     : 2014-09-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- PHP
---

「CentOS 7.0 - PHP インストール（ソースビルド）」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- Web サーバ Nginx, DB サーバ MariaDB(MySQL) と連携することを想定。
- DB サーバ MariaDB がインストール済みである。
- RPMforge リポジトリ導入済み。（[CentOS 7.0 - リポジトリ追加]( "CentOS 7.0 - リポジトリ追加")）
- 「[CentOS 7.0 - Web サーバ Nginx 構築（ソースインストール）！]( "CentOS 7.0 - Web サーバ Nginx 構築（ソースインストール）！")」のとおり Nginx のインストールを行なっている。
- PHP 5.5.15（当記事執筆時点で最新）をインストールする。

### 1. 事前準備

ビルドに必要と思われるパッケージで未インストールのものをインストールしておく。（`configure` オプションの指定により必要になるパッケージは異なる）  
"libmcrypt-devel" は標準リポジトリに存在しないので EPEL リポジトリからインストールされる。

``` text
# yum -y install libxml2-devel libxslt-devel libcurl-devel \
libpng-devel libicu-devel libmcrypt-devel
```

### 2. アーカイブファイルダウンロード＆展開

``` text
# cd /usr/local/src
# wget http://jp1.php.net/get/php-5.5.15.tar.gz/from/jp1.php.net/mirror -O php-5.5.15.tar.gz
# tar zxvf php-5.5.15.tar.gz
```

### 3. ビルド＆インストール

環境やサーバでやりたいことによっては、他に必要な `configure` オプションや不要なオプションもあるかもしれないが、取り急ぎ以下のようにした。必要になった際に都度ビルドし直すことにする。（但し、今回は Nginx と PHP-FPM で連携するので `--enable-fpm` 等の PHP-FPM 関連のオプションは必須）

``` text
# cd php-5.5.15

# ./configure --prefix=/usr/local/php-5.5.15 \
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

### 4. PATH 設定

前述のように `configure` でインストール先を `/usr/local/php-5.5.15` としたので、最初はパスが通っていない。以下のように "/etc/profile" の最終行に記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %}
export PATH=/usr/local/php-5.5.15/bin:$PATH
{% endhighlight %}

そして、有効化する。

``` text
# source /etc/profile
```

### 5. インストール確認

``` text
# php -v
PHP 5.5.15 (cli) (built: Aug  4 2014 21:48:22)
Copyright (c) 1997-2014 The PHP Group
Zend Engine v2.5.0, Copyright (c) 1998-2014 Zend Technologies
```

### 6. 設定ファイル準備

ソースをビルドしてインストールした場合、 "php.ini" は存在しない。  
`configure` 時に設定フィルの配置場所を `--with-config-file-path` で指定した場合はそのディレクトリに、指定しなかった場合は "＜インストールディレクトリ＞/lib/" にサンプルファイルを複製する。（以下は指定した場合）  
ちなみに、 `php -i | grep php.ini` or `php --ini` で設定ファイルの配置すべき場所（今存在する場所ではない）を確認できる。

``` text
# cp /usr/local/src/php-5.5.15/php.ini-production /etc/php.ini
```

取り急ぎ、タイムゾーンだけ設定しておく。

File: `/etc/php.ini`

{% highlight bash linenos %}
date.timezone = Asia/Tokyo
{% endhighlight %}

---

以上。

