---
layout   : single
title    : "Debian 7 Wheezy - PHP インストール！"
published: true
date     : 2013-11-09 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- PHP
---

Debian GNU/Linux 7 Wheezy サーバに PHP5 をインストール・設定する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- Web サーバは Apache2 を想定。

### 1. PHP インストール

PHP とその他関連ライブラリを以下のようにしてインストールする。

``` text 
# aptitude -y install php5 php5-cgi libapache2-mod-php5 php5-common php-pear
```

### 2. 設定ファイル編集

設定ファイル "mods-enabled/mime.conf" を以下のように編集する。

File: `/etc/apache2/mods-enabled/mime.conf`

{% highlight bash linenos %} 
AddHandler php5-script .php  # <= 追加（PHP として扱う拡張子）
{% endhighlight %}

設定ファイル "php.ini" を以下のように編集する。

File: `/etc/php5/apache2/php.ini`

{% highlight bash linenos %} 
date.timezone = "Asia/Tokyo"  # <= タイムゾーンを日本に変更
{% endhighlight %}

### 3. Apache2 再起動

設定を有効にするため、Apache2 を再起動する。

``` text 
# /etc/init.d/apache2 restart
Restarting web server: apache2 ... waiting .
```

### 4. 動作確認用 PHP スクリプト作成

動作確認ように以下のような PHP スクリプトを作成する。

File: `/var/www/index.php`

{% highlight php linenos %} 
<?php
  phpinfo();
?>
{% endhighlight %}

### 5. 動作確認

ブラウザで `http://＜Webサーバのホスト名 or IP アドレス＞/phpinfo.php` にアクセスして以下のように表示されれば成功である。

![DEBIAN_PHP5]({{site.baseurl}}/images/2013/11/09/DEBIAN_PHP5.png "DEBIAN_PHP5")

---

以上。

