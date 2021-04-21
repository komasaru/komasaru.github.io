---
layout   : single
title    : "CentOS 7.0 - Webmail システム RoundCube Webmail 導入！"
published: true
date     : 2014-09-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Postfix
- Dovecot
- PHP
- Nginx
---

「CentOS 7.0 - Webmail システム RoundCube Webmail 導入」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- メールサーバ構築済みであること。
- Web サーバは Apache ではなく Nginx を想定。
- PHP インスール済みであること。（[CentOS 7.0 - PHP インストール（ソースビルド）]( "CentOS 7.0 - PHP インストール（ソースビルド）")）
- PHP と Nginx の連携が設定済みであること。（[CentOS 7.0 - PHP と Nginx の連携]( "CentOS 7.0 - PHP と Nginx の連携")）
- RoundCube Webmail は当記事執筆時点で最新の 1.0.2 をインストールする。（「[Roundcube Webmail - Browse /roundcubemail at SourceForge.net](http://sourceforge.net/projects/roundcubemail/files/roundcubemail/ "Roundcube Webmail - Browse /roundcubemail at SourceForge.net")」で最新版を確認）
- http アクセスを https にリダイレクトしない（https アクセスのみを許可する）方法を採用する。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. RoundCube Webmail インストール

アーカイブをダウンロードしてインストールを行う。  
（RoundCube Webmail は yum でもインストール可能だが、依存性の関係で Apache もインストールされてしまうことに留意）。

``` text
# wget "http://downloads.sourceforge.net/project/roundcubemail/roundcubemail/1.0.2/roundcubemail-1.0.2.tar.gz?r=http%3A%2F%2Fsourceforge.net%2Fprojects%2Froundcubemail%2Ffiles%2Flatest%2Fdownload&ts=1406347435&use_mirror=jaist" -O roundcubemail.tar.gz
                                           # <= アーカイブダウンロード
# tar zxvf roundcubemail.tar.gz            # <= アーカイブ展開
# mv roundcubemail-*/ /var/www/roundcube   # <= 所定の位置へ移動
# chown nginx:nginx -R /var/www/roundcube  # <= 所有者変更
# chmod o+w -R /var/www/roundcube/temp/    # <= 書き込み権限付与
# chmod o+w -R /var/www/roundcube/logs/    # <= 書き込み権限付与
# rm -f roundcubemail.tar.gz               # <= 後始末
```

### 2. 文字化け対応

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

### 3. パッケージンストール

php-mysql, php-xml が必要なので、未インストールならインストールする。

``` text
# yum -y install php-mysql php-xml
```

### 4. データベース設定

MariaDB サーバに root でログインして以下のようにデータベース・ユーザの作成を行う。

``` text
# mysql -u root -p
Enter password:                                   # <= root パスワード
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 5
Server version: 5.5.37-MariaDB MariaDB Server

Copyright (c) 2000, 2014, Oracle, Monty Program Ab and others.

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

### 5. データベース初期化

用意されている SQL ファイルを使用してデータベース roundcubemail を初期化する。

``` text
# mysql -u roundcube -p roundcubemail < /var/www/roundcube/SQL/mysql.initial.sql
Enter password:  # <= roundcube ユーザのパスワード
```

### 6. PHP 設定ファイル編集

PHP 設定ファイルでタイムゾーンが未設定なら設定する。（日本時間）

File: `/etc/php.ini`

{% highlight php linenos %}
[Date]
; Defines the default timezone used by the date functions
; http://php.net/date.timezone
;date.timezone =
date.timezone = Asia/Tokyo  // <= 追加
{% endhighlight %}

### 7. RoundCube Webmail デフォルト設定ファイル編集

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
$config['mail_domain'] = 'mk-mode.com';  # <= 変更 （送信元メールアドレスのドメインを指定）

// enforce connections over https
// with this option enabled, all non-secure connections will be redirected.
// set the port for the ssl connection as value of this option if it differs from the default 443
$config['force_https'] = true;           # <= 変更（https アクセス(SSL)の強制）
{% endhighlight %}

### 8. Nginx 設定ファイル編集

`https://サーバー名/roundcube/` で Web メールへアクセスできるようにするために、Nginx 設定ファイル server ディレクティブ（SSL 設定側）内に以下のように追記する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
    server {
        listen 443;

        # ====[ 追加 ]===>
        # RoundCube Webmail
        location /roundcube {
            alias /var/www/roundcube;
            allow 127.0.0.1;        # <= 内部からのみアクセス可にする場合
            allow 192.168.11.0/24;  # <= 内部からのみアクセス可にする場合
            deny all;               # <= 内部からのみアクセス可にする場合
            # allow all;            # <= 外部からもアクセス可にする場合
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

### 9. Nginx, PHP-FPM リロード

設定反映のため Nginx（Apache なら httpd）, PHP-FPM をリロードする。

``` text
# systemctl reload nginx
# systemctl reload php-fpm
```

### 10. RoundCube Webmail 設定

Web ブラウザで `https://＜サーバ名 or IP アドレス＞/roundcube/installer/` へアクセスする。  
そして、画面上で以下のように設定する。

1. 「NEXT」ボタンを押下する。
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
7. 「CREATE CONFIG」ボタンを押下する。
8. 「CONTINUE」ボタンを押下する。
9. 必要なら、"Test SMTP config", "Test IMAP config" でメール送信テストをしてみる。

最後に警告メッセージに従い全インストーラディレクトリを削除する。

``` text
# rm -rf /var/www/roundcube/installer/
```

### 11. 動作確認

Web ブラウザで `https://＜サーバ名 or IP アドレス＞/roundcube/` へアクセスし、メールのユーザ名・パスワードでログインできること、各種操作が可能なことを確認する。  
また、ログイン後に各種設定も可能である。

![CENTOS_7-0_ROUNDCUBEMAIL_1]({{site.baseurl}}/images/2014/09/18/CENTOS_7-0_ROUNDCUBEMAIL_1.png "CENTOS_7-0_ROUNDCUBEMAIL_1")

![CENTOS_7-0_ROUNDCUBEMAIL_2]({{site.baseurl}}/images/2014/09/18/CENTOS_7-0_ROUNDCUBEMAIL_2.png "CENTOS_7-0_ROUNDCUBEMAIL_2")

### 12. 参考サイト

- [Roundcube - Free and Open Source Webmail Software](http://roundcube.net/ "Roundcube - Free and Open Source Webmail Software")

---

以上。

