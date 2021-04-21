---
layout   : single
title    : "Debian 9 (Stretch) - PHP インストール（Nginx と連携）！"
published: true
date     : 2017-09-28 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- PHP
- Nginx
---

Debian GNU/Linux 9 (Stretch) に PHP をソースをビルドしてインストールし、 Web／リバースプロキシサーバ Nginx と連携する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* クライアント側は LMDE2(Linux Mint Debian Edition 2) を想定。
* Web サーバとして Apache2 でなく Nginx と連携させることを想定しているので、 Nginx がインストール済みであること。（参照： [Debian 9 (Stretch) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2017/09/16/debian-9-nginx-installation-by-official-apt/ "Debian 9 (Stretch) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")）
* 標準リポジトリから PHP 7.0.19 をインストールする。
* root ユーザでの作業を想定。

### 1.  PHP のインストール

``` text
# apt -y install php php-cgi php-fpm php-common php-pear php-mbstring
```

### 2. インストールの確認

``` text
# php -v
PHP 7.0.19-1 (cli) (built: May 11 2017 14:04:47) ( NTS )
Copyright (c) 1997-2017 The PHP Group
Zend Engine v3.0.0, Copyright (c) 1998-2017 Zend Technologies
    with Zend OPcache v7.0.19-1, Copyright (c) 1999-2017, by Zend Technologies
```

### 3. php-fpm 設定ファイルの編集

user, gropu 等を Nginx と同じものに編集する。  
ついでに、ソケットファイルの設定も確認しておく。

File: `/etc/php/7.0/fpm/pool.d/www.conf`

{% highlight bash linenos %}
user = nginx              # <= www-data から変更
group = nginx             # <= www-data から変更

listen.owner = nginx      # <= www-data から変更
listen.group = nginx      # <= www-data から変更
{% endhighlight %}

### 4. PHP 設定ファイルの編集

タイムゾーンを設定する。（日本時間）

File: `/etc/php/7.0/fpm/php.ini`

{% highlight bash linenos %}
[Date]
; Defines the default timezone used by the date functions
; http://php.net/date.timezone
;date.timezone =
date.timezone = Asia/Tokyo  // <= 追加
{% endhighlight %}

### 5. Nginx 設定ファイルの編集

File: `/etc/nginx/conf.d/default.conf`

{% highlight bash linenos %}
location ~ \.php$ {
    fastcgi_pass    unix:/run/php/php7.0-fpm.sock;
    fastcgi_index   index.php;
    include         fastcgi_params;
    fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
{% endhighlight %}

### 6. 表示テスト用 PHP ソースの作成

ドキュメントルートへ以下のような内容の "phpinfo.php" を作成する。

File: `phpinfo.php`

{% highlight php linenos %}
<? phpinfo(); ?>
{% endhighlight %}

### 7. サービスの再起動

``` text
$ systemctl restart nginx
$ systemctl restart php7.0-fpm
```

### 8. 動作確認

プラウザで `http://＜サーバアドレス＞/phpinfo.php` にアクセスしてみて、 PHP 情報ページが表示されればよい。

### 9. 参考サイト

* [PHP: Unix システムへのインストール - Manual](http://jp2.php.net/manual/ja/install.unix.php "PHP: Unix システムへのインストール - Manual")

---

以上。

