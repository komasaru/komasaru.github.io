---
layout   : single
title    : "Debian 8 (Jessie) - Web メールシステム Roundcube Webmail インストール（ソースビルド）！"
published: true
date     : 2015-07-06 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Mail
- Postfix
- Dovecot
---

Debian GNU/Linux 8 (Jessie) に Web メールソフト RoundcubeMail をソースをビルドしてインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* 送信メールサーバ Postfix, 受信メールサーバ Dovecot インストール済み。
* DB サーバ MariaDB(MySQL) インストール済み。（[Debian 8 (Jessie) - DB サーバ MariaDB 構築！]({{site.baseurl}}/2015/06/18/debian-8-mariadb-installation/ "Debian 8 (Jessie) - DB サーバ MariaDB 構築！")）
* Web サーバは Apache ではなく Nginx を想定。（[Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2015/06/19/debian-8-nginx-installation-by-official-apt/ "Debian 8 (Jessie) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")）
* PHP インスール済みであること。（[Debian 8 (Jessie) - PHP インストール（ソースビルド）！]({{site.baseurl}}/2015/06/29/debian-8-php-installation-by-src/ "Debian 8 (Jessie) - PHP インストール（ソースビルド）！")）
* PHP と Nginx の連携が設定済みであること。（[Debian 8 (Jessie) - PHP と Nginx の連携！]({{site.baseurl}}/2015/06/30/debian-8-php-cooperation-with-nginx/ "Debian 8 (Jessie) - PHP と Nginx の連携！")）
* RoundCube Webmail は当記事執筆時点で最新の 1.1.1 をインストールする。（「[Roundcube Webmail - Browse /roundcubemail at SourceForge.net](http://sourceforge.net/projects/roundcubemail/files/roundcubemail/ "Roundcube Webmail - Browse /roundcubemail at SourceForge.net")」で最新版を確認）
* http アクセスを https にリダイレクトしない（https アクセスのみを許可する）方法を採用する。

### 1. Roundcube Webmail のインストール

アーカイブをダウンロードしてインストールを行う。  
（Roundcube Webmail は apt でもインストール可能だが、依存性の関係で Apache もインストールされてしまうことに留意）。

``` text
# wget http://downloads.sourceforge.net/project/roundcubemail/roundcubemail/1.1.1/roundcubemail-1.1.1.tar.gz
                                           # <= アーカイブダウンロード
# tar zxvf roundcubemail-1.1.1.tar.gz      # <= アーカイブ展開
# mv roundcubemail-*/ /var/www/roundcube   # <= 所定の位置へ移動
# chown nginx:nginx -R /var/www/roundcube  # <= 所有者変更
# chmod o+w -R /var/www/roundcube/temp/    # <= 書き込み権限付与
# chmod o+w -R /var/www/roundcube/logs/    # <= 書き込み権限付与
# rm -f roundcubemail-1.1.1.tar.gz         # <= 後始末
```

### 2. 文字化けの対応

機種依存文字が文字化けしないよう文字コード設定ファイル "rcube_charset.php" を以下のように編集する。

File: `/var/www/roundcube/program/lib/Roundcube/rcube_charset.php`

{% highlight bash linenos %}
        // convert charset using mbstring module
        if ($mbstring_list !== false) {
            $aliases['WINDOWS-1257'] = 'ISO-8859-13';
            // ====[ 追加 ]===>
            $aliases['JIS'] = 'ISO-2022-JP-MS';
            $aliases['ISO-2022-JP'] = 'ISO-2022-JP-MS';
            $aliases['EUC-JP'] = 'EUCJP-WIN';
            $aliases['SJIS'] = 'SJIS-WIN';
            $aliases['SHIFT_JIS'] = 'SJIS-WIN';
            // <===[ 追加 ]====
            // it happens that mbstring supports ASCII but not US-ASCII
            if (($from == 'US-ASCII' || $to == 'US-ASCII') && !in_array('US-ASCII', $mbstring_list)) {
                $aliases['US-ASCII'] = 'ASCII';
            }
{% endhighlight %}

次に、 "mime.types" を取得する。

``` text
# wget http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
                                            # <= ダウンロード
# mv mime.types /var/www/roundcube/config/  # <= 所定の位置へ移動
```

そして、デフォルト設定ファイル "defaults.inc.php" を以下のように編集する。

File: `/var/www/roundcube/config/defaults.inc.php`

{% highlight bash linenos %}
// Absolute path to a local mime.types mapping table file.
// This is used to derive mime-types from the filename extension or vice versa.
// Such a file is usually part of the apache webserver. If you don't find a file named mime.types on your system,
// download it from http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
$config['mime_types'] = '/var/www/roundcube/config/mime.types';  // <= 変更（mime.types の位置を指定）
{% endhighlight %}

### 3. パッケージのインストール

必要なパッケージをインストールする。

``` text
# apt-get -y install php-pear php5-mysql php5-mcrypt php5-intl
```

必要な Pear モジュールもインストールする。

``` text
# pear install Auth_SASL
# pear install Net_SMTP
# pear install Net_IDNA2
# pear install Mail_mime
# pear install Mail_mimeDecode
```

（安定版が存在せずエラーになる場合は `-beta` や `-alpha` を付与するようメッセージが出力されるはずなので、それに従う）

### 4. データベースの設定

MariaDB サーバに root でログインして以下のようにデータベース・ユーザの作成を行う。

``` text
# mysql -u root -p
Enter password:                                   # <= root パスワード
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 34
Server version: 10.0.16-MariaDB-1-log (Debian)

Copyright (c) 2000, 2014, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE DATABASE roundcubemail;  # <= roundcubemail データベース作成
Query OK, 1 row affected (0.00 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON roundcubemail.* TO roundcube@localhost IDENTIFIED BY '任意のパスワード';
                                                  # <= ユーザ roundcube 作成
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> FLUSH PRIVILEGES;               # <= 即時反映
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> exit                            # <= ログアウト
Bye
```

### 5. データベースの初期化

用意されている SQL ファイルを使用してデータベース roundcubemail を初期化する。

``` text
# mysql -u roundcube -p roundcubemail < /var/www/roundcube/SQL/mysql.initial.sql
Enter password:  # <= roundcube ユーザのパスワード
```

### 6. PHP 設定ファイルの編集

PHP 設定ファイルでタイムゾーンが未設定なら設定する。（日本時間）

File: `/etc/php.ini`

{% highlight php linenos %}
[Date]
; Defines the default timezone used by the date functions
; http://php.net/date.timezone
;date.timezone =
date.timezone = Asia/Tokyo  // <= 追加
{% endhighlight %}

### 7. RoundCube Webmail デフォルト設定ファイルの編集

File: `/var/www/roundcube/config/defaults.inc.php`

{% highlight php linenos %}
// This domain will be used to form e-mail addresses of new users
// Specify an array with 'host' => 'domain' values to support multiple hosts
// Supported replacement variables:
// %h - user's IMAP hostname
// %n - http hostname ($_SERVER['SERVER_NAME'])
// %d - domain (http hostname without the first part)
// %z - IMAP domain (IMAP hostname without the first part)
// For example %n = mail.domain.tld, %t = domain.tld
$config['mail_domain'] = 'mk-mode.com';     # <= 変更 （送信元メールアドレスのドメインを指定）

// Use this charset as fallback for message decoding$
$config['default_charset'] = 'ISO-2022-1';  # <= 変更（日本語対応）

// enforce connections over https
// with this option enabled, all non-secure connections will be redirected.
// set the port for the ssl connection as value of this option if it differs from the default 443
$config['force_https'] = true;              # <= 変更（https アクセス(SSL)の強制）

// the way how contact names are displayed in the list
// 0: display name
// 1: (prefix) firstname middlename surname (suffix)
// 2: (prefix) surname firstname middlename (suffix)
// 3: (prefix) surname, firstname middlename (suffix)
$config['addressbook_name_listing'] = 2;    # <= 変更（アドレス帳での表示を姓名形式に）

// Set true if deleted messages should not be displayed$
// This will make the application run slower$
$config['skip_deleted'] = true;             # <= 変更（削除済みメッセージを非表示）
{% endhighlight %}

### 8. Nginx 設定ファイルの編集

`https://サーバー名/roundcube/` で Web メールへアクセスできるようにするために、Nginx 設定ファイル server ディレクティブ（SSL 設定側）内に以下のように追記する。

File: `/etc/nginx/conf.d/ssl.conf`

{% highlight bash linenos %}
server {
    listen       443 ssl;
    server_name  localhost;

    #ssl_certificate      /etc/nginx/cert.pem;
    ssl_certificate      /etc/ssl/private/server.crt;
    #ssl_certificate_key  /etc/nginx/cert.key;
    ssl_certificate_key  /etc/ssl/private/server.key;

    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers   on;

    location / {
        #root   /usr/share/nginx/html;
        root   /var/www/html;
        index  index.html index.htm;
    }

    # ====[ 追加 ]===>
    # RoundCube Webmail
    location /roundcube {
        alias /var/www/roundcube;
        allow 127.0.0.1;        # <= 内部からのみアクセス可にする場合
        allow 192.168.11.0/24;  # <= 内部からのみアクセス可にする場合
        deny all;               # <= 内部からのみアクセス可にする場合
        # allow all;            # <= 外部からもアクセス可にする場合
        index  index.php;
    }
    location /roundcube/config {
        deny all;
    }
    location /roundcube/temp {
        deny all;
    }
    location /roundcube/logs {
        deny all;
    }

    location ~ /roundcube/.*\.php$ {
        fastcgi_pass    127.0.0.1:9000;
        fastcgi_index   index.php;
        fastcgi_param   SCRIPT_FILENAME  /var/www/$uri;
        include         fastcgi_params;
        fastcgi_pass_header "X-Accel-Redirect";
        fastcgi_pass_header "X-Accel-Buffering";
        fastcgi_pass_header "X-Accel-Charset";
        fastcgi_pass_header "X-Accel-Expires";
        fastcgi_pass_header "X-Accel-Limit-Rate";
    }
    # <===[ 追加 ]====

}
{% endhighlight %}

ちなみに、Web サーバが Nginx ではなく Apache の場合は "/etc/httpd/conf.d/roundcubemail.conf" を以下の内容で作成すればよい。（詳細なアクセス許可・拒否設定は不明）

File: `/etc/httpd/conf.d/roundcubemail.conf`

{% highlight bash linenos %}
echo Alias /roundcube /var/www/roundcube
{% endhighlight %}

### 9. Nginx, PHP-FPM の再起動

設定反映のため Nginx（Apache なら httpd）, PHP-FPM を再起動する。

``` text
# systemctl restart nginx

# systemctl resatrt php-fpm
```

### 10. RoundCube Webmail の設定

Web ブラウザで `https://＜サーバ名 or IP アドレス＞/roundcube/installer/` へアクセスする。  
そして、画面上で以下のように設定する。

1. [NEXT] ボタンを押下する。  
   （但し、赤字で "NOT OK" がある場合は [NEXT] が非活性で押下できない。未導入のモジュールを導入するなどし、 "NOT OK" を無くす）
2. Logging & Debugging  
   - "log_driver" で "syslog” を選択する。（ログを "/var/log/messages" に出力）
3. Database setup  
   - "Database name", "Database user name" が正しいか確認する。
   - "Database password" に roundcubemail データベースのパスワードを入力する。
4. IMAP Settings  
   - "default_host" にメールサーバー名（当方の例： "mail.mk-mode.com"）を入力する。
   - "junk_mbox" に "Spam" と入力する。
5. SMTP Settings  
   - "smtp_server" にメールサーバー名（当方の例： "mail.mk-mode.com"）を入力する。
   - "Use the current IMAP username and password for SMTP authentication" をチェックする。  
     （SMTP 認証に IMAP サーバーのユーザー名／パスワードを使用する）
6. Display settings & user prefs  
   - "language" に "ja_JP" と入力する。
   - "If preview pane is enabled" をチェックする。（メール一覧下部にプレビューを表示）
7. [CREATE CONFIG] ボタンを押下する。
8. [CONTINUE] ボタンを押下する。
9. 必要なら、"Test SMTP config", "Test IMAP config" でメール送信テストをしてみる。
10. 最後に警告メッセージに従い "installer" ディレクトリを削除する。  
   `rm -rf /var/www/roundcube/installer`

### 11. 動作確認

Web ブラウザで `https://＜サーバ名 or IP アドレス＞/roundcube/` へアクセスし、メールのユーザ名・パスワードでログインできること、各種操作が可能なことを確認する。  
また、ログイン後に各種設定も可能である。

### 12. 参考サイト

* [Roundcube - Free and Open Source Webmail Software](http://roundcube.net/ "Roundcube - Free and Open Source Webmail Software")
* [Webmailシステム構築(RoundCube Webmail) - CentOSで自宅サーバー構築](http://centossrv.com/roundcubemail.shtml "Webmailシステム構築(RoundCube Webmail) - CentOSで自宅サーバー構築")

---

以上。

