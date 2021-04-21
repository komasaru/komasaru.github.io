---
layout   : single
title    : "Debian 8 (Jessie) - PHP と Nginx の連携！"
published: true
date     : 2015-06-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- PHP
- Nginx
---

Debian GNU/Linux 8 (Jessie) にインストールした PHP を Web サーバ Nginx と連携する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* クライアント側は Linux Mint 17.1 を想定。
* 「[Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2015/06/19/debian-8-nginx-installation-by-official-apt/ "Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")」のとおり Nginx のインストールを行なっている。
* 「[Debian 8 (Jessie) - PHP インストール（ソースビルド）！]({{site.baseurl}}/2015/06/29/debian-8-php-installation-by-src/ "Debian 8 (Jessie) - PHP インストール（ソースビルド）！") 」のとおり PHP のインストールを行なっている。
* ドキュメントルートは "/var/www/html" を想定。
* サービスの起動は SysVinit ではなく SystemD を想定。

### 1. PHP-FPM 設定ファイルの作成

デフォルトの設定ファイルを複製する

``` text
# cd /usr/local/php-5.6.8/etc/
# cp php-fpm.conf.default php-fpm.conf
```

### 2. PHP-FPM サービス起動スクリプトの作成

PHP をソースを（PHP-FPM オプション付きで）ビルドしてインストールした場合、デフォルトでは PHP-FPM サービス起動用スクリプトが存在しない。  
サービス起動用スクリプトをソースディレクトリ内から複製してを作成する。

``` text
# cp /usr/local/src/php-5.6.8/sapi/fpm/php-fpm.service /etc/systemd/system/
```

そして、編集。（`${prefix}`, `${exec_prefix}` を環境に合わせて変更）

File: `/etc/systemd/system/php-fpm.service`

{% highlight bash linenos %}
[Unit]
Description=The PHP FastCGI Process Manager
After=syslog.target network.target

[Service]
Type=simple
PIDFile=/var/run/php-fpm.pid
ExecStart=/usr/local/php-5.6.8/sbin/php-fpm --nodaemonize --fpm-config /usr/local/php-5.6.8/etc/php-fpm.conf
ExecReload=/bin/kill -USR2 $MAINPID

[Install]
WantedBy=multi-user.target
{% endhighlight %}

### 3. PHP-FPM 起動スクリプトの権限設定

``` text
# chmod +x /etc/systemd/system/php-fpm.service
```

### 4. PHP-FPM サービスの起動

``` text
# systemctl start php-fpm
```

### 5. Nginx 設定ファイルの編集

`server` ディレクティブ内の php の部分をコメント解除＆編集する。

File: `/etc/nginx/conf.d/default.conf`

{% highlight bash linenos %}
        location ~ \.php$ {
            root           html;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
            fastcgi_param  SCRIPT_FILENAME  /var/www/html$fastcgi_script_name;
            include        fastcgi_params;
        }

{% endhighlight %}

### 6. Nginx のリロード

Nginx が起動していなければ起動し、起動していればリロードする。

``` text
# systemctl reload nginx
```

### 7. PHP-FPM 自動起動の設定

マシン起動時に自動で PHP-FPM が起動するうように設定する。

``` text
# systemctl enable php-fpm
Created symlink from /etc/systemd/system/multi-user.target.wants/php-fpm.service to /etc/systemd/system/php-fpm.service.
```

### 8. サンプルページの作成

ドキュメントルートにサンプルページを作成する。

File: `/var/www/html/phpinfo.php`

{% highlight php linenos %}
<?php
  phpinfo();
?>
{% endhighlight %}

### 9. 動作確認

`http://＜サーバアドレス＞/phpinfo.php` にアクセスしてみる。  
PHP 情報ページが表示されればよい。

---

以上。

