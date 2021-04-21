---
layout   : single
title    : "Debian 10 (buster) - PHP インストール（Nginx と連携）！"
published: true
date     : 2020-01-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- PHP
- Nginx
---

Debian GNU/Linux 10 (buster) に PHP をソースをビルドしてインストールし、 Web／リバースプロキシサーバ Nginx と連携する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
* クライアント側は LMDE 3 (Linux Mint Debian Edition 3; 64bit) を想定。
* Web サーバとして Apache2 でなく Nginx と連携させることを想定しているので、 Nginx がインストール済みであること。（参照： [Debian 10 (buster) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2019/12/20/debian-10-nginx-installation-by-official-apt "Debian 10 (buster) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")）
* 標準リポジトリから PHP 7.3.9 をインストールする。
* root ユーザでの作業を想定。

### 1.  PHP のインストール

``` text
# apt -y install php php-cgi php-fpm php-common php-pear php-mbstring
```

### 2. インストールの確認

``` text
# php -v
PHP 7.3.9-1~deb10u1 (cli) (built: Sep 18 2019 10:33:23) ( NTS )
Copyright (c) 1997-2018 The PHP Group
Zend Engine v3.3.9, Copyright (c) 1998-2018 Zend Technologies
    with Zend OPcache v7.3.9-1~deb10u1, Copyright (c) 1999-2018, by Zend Technologies
```

### 3. php-fpm 設定ファイルの編集

user, gropu 等を Nginx と同じものに編集する。  
ついでに、ソケットファイルの設定も確認しておく。

File: `/etc/php/7.3/fpm/pool.d/www.conf`

{% highlight bash %}
user = nginx              # <= www-data から変更
group = nginx             # <= www-data から変更

listen.owner = nginx      # <= www-data から変更
listen.group = nginx      # <= www-data から変更
{% endhighlight %}

### 4. PHP 設定ファイルの編集

タイムゾーンを設定する。（日本時間）

File: `/etc/php/7.3/fpm/php.ini`

{% highlight bash %}
[Date]
; Defines the default timezone used by the date functions
; http://php.net/date.timezone
;date.timezone =
date.timezone = Asia/Tokyo  // <= 追加
{% endhighlight %}

### 5. Nginx 設定ファイルの編集

File: `/etc/nginx/conf.d/default.conf`

{% highlight bash %}
location ~ \.php$ {
    fastcgi_pass    unix:/run/php/php7.3-fpm.sock;
    fastcgi_index   index.php;
    include         fastcgi_params;
    fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
{% endhighlight %}

### 6. 表示テスト用 PHP ソースの作成

ドキュメントルートへ以下のような内容の `phpinfo.php` を作成する。

File: `phpinfo.php`

{% highlight php linenos %}
<? phpinfo(); ?>
{% endhighlight %}

### 7. サービスの再起動

``` text
$ systemctl restart nginx
$ systemctl restart php7.3-fpm
```

### 8. 動作確認

プラウザで `http://＜サーバアドレス＞/phpinfo.php` にアクセスしてみて、 PHP 情報ページが表示されればよい。

### 9. 参考サイト

* [PHP: Unix システムへのインストール - Manual](http://jp2.php.net/manual/ja/install.unix.php "PHP: Unix システムへのインストール - Manual")

---

以上。

