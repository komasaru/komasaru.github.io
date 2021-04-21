---
layout   : single
title    : "CentOS 6.5 - PHP と Nginx の連携！"
published: true
date     : 2014-01-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- PHP
- Nginx
---

前回は CentOS 6.5 サーバ上で PHP のインストール（ソースビルド）を行いました。  
今回は PHP と Web サーバ Nginx の連携を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- 「[CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！]({{site.baseurl}}/2014/01/05/centos-6-5-nginx-installation-by-src "CentOS 6.5 - Web サーバ Nginx 構築（ソースインストール）！")」のとおり Nginx のインストールを行なっている。
- 「[CentOS 6.5 - PHP インストール（ソースビルド）！]({{site.baseurl}}/2014/01/19/centos-6-5-php-installation-by-src "CentOS 6.5 - PHP インストール（ソースビルド）") 」のとおり PHP のインストールを行なっている。

### 1. PHP-FPM 設定ファイル作成

デフォルトの設定ファイルを複製する

``` text
# cd /usr/local/php-5.5.8/etc/
# cp php-fpm.conf.default php-fpm.conf
```

### 2. PHP-FPM 起動スクリプト作成

PHP をソースを（PHP-FPM オプション付きで）ビルドしてインストールした場合、デフォルトでは PHP-FPM 起動用スクリプトが存在しない。  
起動用スクリプトをソースディレクトリ内から複製してを作成する。

``` text
# cp /usr/local/src/php-5.5.8/sapi/fpm/init.d.php-fpm /etc/init.d/php-fpm
```

### 3. PHP-FPM 起動スクリプト権限設定

``` text
# chmod 755 /etc/init.d/php-fpm
```

### 4. PHP-FPM 起動

PHP-FPM 起動スクリプトを使用して起動する。

``` text
# /etc/init.d/php-fpm start
Starting php-fpm  done
```

### 5. Nginx 設定ファイル編集

`server` ディレクティブ内の php の部分をコメント解除＆編集する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
        location ~ \.php$ {
            root           html;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_scrip    t_name;
            fastcgi_param  SCRIPT_FILENAME  /var/www/html$fastcgi_s    cript_name;
            include        fastcgi_params;
        }

{% endhighlight %}

### 6. Nginx 起動

Nginx が起動していなければ起動し、起動していればリロードする。

### 7. PHP-FPM 自動起動設定

マシン起動時に自動で PHP-FPM が起動するうように設定する。

``` text
# chkconfig --add php-fpm
# chkconfig php-fpm on
# chkconfig --list php-fpm  # <= 2,3,4,5 が "on" であることを確認
php-fpm         0:off   1:off   2:on    3:on    4:on    5:on    6:off
```

### 8. サンプルページ作成

ドキュメントルートにサンプルページを作成する。

File: `/var/www/html/phpinfo.php`

{% highlight php linenos %}
<?php
  phpinfo();
?>
{% endhighlight %}

### 9. 動作確認

以下のように php ファイルを作成してドキュメントルートに置き、`http://＜サーバアドレス＞/phpinfo.php` にアクセスしてみる。  
PHP 情報ページが表示されればよい。

![CENTOS_6-5_NGINX_PHP-FPM]({{site.baseurl}}/images/2014/01/20/CENTOS_6-5_NGINX_PHP-FPM.png "CENTOS_6-5_NGINX_PHP-FPM")

---

次回は、ユーザ管理ツール（Usermin）導入について紹介する予定です。

以上。

