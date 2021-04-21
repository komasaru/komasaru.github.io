---
layout   : single
title    : "CentOS 6.5 - PHP インストール（ソースビルド）！"
published: true
date     : 2014-01-19 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- PHP
---

前回は CentOS 6.5 サーバ上の Web(HTTP) サーバ Nginx で SSL 接続するため設定を行いました。  
今回は PHP のインストール（ソースビルド）を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- Web サーバ Nginx, DB サーバ MySQL(MariaDB) と連携することを想定。
- 「[CentOS 6.5 - 初期設定！]({{site.baseurl}}/2013/12/13/centos-6-5-first-setting "CentOS 6.5 - 初期設定！") 」内のとおり RPMforge リポジトリの導入を行なっている。
- 「[CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！]({{site.baseurl}}/2014/01/05/centos-6-5-nginx-installation-by-src "CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！")」のとおり Nginx のインストールを行なっている。
- 「[CentOS 6.5 - DB サーバ MariaDB 構築（ソースインストール）！]({{site.baseurl}}/2014/01/06/centos-6-5-mariadb-installation-by-src "CentOS 6.5 - DB サーバ MariaDB 構築（ソースインストール）！")」のとおり MySQL(MariaDB) のインストールを行なっている。

### 1. 事前準備

ビルドに必要と思われるパッケージで未インストールのものをインストールしておく。（`configure` オプションの指定により必要になるパッケージは異なる）  
"libmcrypt" は標準リポジトリに存在しないので RPMforge リポジトリからインストールする。

``` text
# yum -y install libxml2-devel \
libxslt-devel \
libcurl-devel \
libpng-devel \
libicu-devel

# yum -y --enablerepo=rpmforge install libmcrypt libmcrypt-devel
```

### 2. アーカイブファイルダウンロード＆展開

``` text
# cd /usr/local/src
# wget http://jp1.php.net/get/php-5.5.8.tar.gz/from/jp1.php.net/mirror
# tar zxvf php-5.5.8
```

### 3. ビルド＆インストール

環境やサーバでやりたいことによっては、他に必要な `configure` オプションや不要なオプションもあるかもしれないが、取り急ぎ以下のようにした。必要になった際に都度ビルドし直すことにする。（但し、今回は Nginx と PHP-FPM で連携するので `--enable-fpm` 等の PHP-FPM 関連のオプションは必須）

``` text
# cd php-5.5.8

# ./configure --prefix=/usr/local/php-5.5.8 \
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

`make` 終了時に `make test` をするようメッセージが出力されるので、必要なら `make test` でビルド結果を確認する。

### 4. PATH 設定

前述のように `configure` でインストール先を `/usr/local/php-5.5.8` としたので、最初はパスが通っていない。以下のように "/root/.bash_profile" の最終行に記述を追加する。

File: `/root/.bash_profile`

{% highlight bash linenos %}
export PATH=/usr/local/php-5.5.8/bin:$PATH
{% endhighlight %}

そして、有効化する。

``` text
# source /root/.bash_profile
```

### 5. インストール確認

``` text
# php -v
PHP 5.5.8 (cli) (built: Jan 15 2014 00:42:43)
Copyright (c) 1997-2013 The PHP Group
Zend Engine v2.5.0, Copyright (c) 1998-2013 Zend Technologies
```

### 6. 設定ファイル準備

ソースをビルドしてインストールした場合、 "php.ini" は存在しない。  
`configure` 時に設定フィルの配置場所を `--with-config-file-path` で指定した場合はそのディレクトリに、指定しなかった場合は "＜インストールディレクトリ＞/lib/" にサンプルファイルを複製する。（以下は指定した場合）  
ちなみに、 `php -i | grep php.ini` or `php --ini` で設定ファイルの配置場所を確認できる。

``` text
# cp /usr/local/src/php-5.5.8/php.ini-production /etc/php.ini
```

取り急ぎ、タイムゾーンだけ設定しておく。

File: `/etc/php.ini`

{% highlight bash linenos %}
date.timezone = Asia/Tokyo
{% endhighlight %}

---

次回は、PHP を Web サーバ Nginx と連携する方法について紹介する予定です。

以上。

