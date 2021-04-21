---
layout   : single
title    : "Debian 7 Wheezy - SquirrelMail を Nginx で！"
published: true
date     : 2013-11-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
---

Debian GNU/Linux 7 Wheezy サーバ上の Web メールシステム SquirrelMail を Web サーバ Nginx で運用する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- Web サーバは Nginx を想定。
- SMTP サーバ Postfix 構築済み。
- IMAP サーバ Dovecot 構築済み。

### 1. PHP を Nginx と連携

以下の当ブログ過去記事を参考に PHP を Nginx と連携させる。（"PHP5-FPM" 使用）

- [Nginx - PHP との連携！ - mk-mode BLOG]({{site.baseurl}}/2013/01/20/nginx-php/ "Nginx - PHP との連携！ - mk-mode BLOG")

### 2. Nginx 設定

Nginx の設定ファイル "/usr/local/nginx/conf/nginx.conf" を以下のように編集する。（HTTPS 用ディレクティブ内に追記する）
（環境の違いによりディレクトリ構成が異なる場合、適宜読み替える。また、PHP5-FPM との連携は TCP ポートではなくソケットを使用している）

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %} 
http {
    # HTTPS server
    server {

        # Squirrel Mail
        location /squirrelmail {
            root /usr/share/;
            index index.php index.html index.htm;
            location ~ ^/squirrelmail/(.+\.php)$ {
                try_files $uri =404;
                root /usr/share/;
                #fastcgi_pass 127.0.0.1:9000;
                fastcgi_pass   unix:/var/run/php5-fpm.sock;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
            }
            location ~* ^/squirrelmail/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
                root /usr/share/;
            }
        }
        location /webmail {
            rewrite ^/* /squirrelmail last;
        }

    }
}
{% endhighlight %}

### 3. Nginx 再起動

設定を有効化するために Nginx を再起動する。

``` text 
# /etc/init.d/nginx restart
Restarting Nginx Daemon: nginx
Restarting Nginx Daemon: nginx.
```

### 4. 動作確認

ブラウザで `https://＜Webサーバのホスト名 or IP アドレス＞/webmail` にアクセスし、ログインできること等を確認する。

うまく行かなければ設定を見直してみる。（特に Nginx の設定ファイルは、説明しているサイトにより記述方法が異なっているので。ソケットやディレクトリの指定等）

### 参考サイト

- [Running SquirrelMail On Nginx (LEMP) On Debian Squeeze/Ubuntu 11.04 -- HowtoForge - Linux Howtos and Tutorials](http://www.howtoforge.com/running-squirrelmail-on-nginx-lemp-on-debian-squeeze-ubuntu-11.04 "Running SquirrelMail On Nginx (LEMP) On Debian Squeeze/Ubuntu 11.04 -- HowtoForge - Linux Howtos and Tutorials")

---

以上。

