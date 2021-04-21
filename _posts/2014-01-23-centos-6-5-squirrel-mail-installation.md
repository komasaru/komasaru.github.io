---
layout   : single
title    : "CentOS 6.5 - Webmail システム SquirrelMail 導入！"
published: true
date     : 2014-01-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバ上でユーザ管理ツール Usermin でメール自動返信 Vacation を利用する設定を行いました。  
今回は Web メールシステム SquirrelMail の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- Web サーバは Nginx を想定。
- SMTP サーバ Postfix 構築済み。
- IMAP サーバ Dovecot 構築済み。
- PHP インストール済み。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. アーカイブダウンロード＆展開

アーカイブをダウンロードし、展開する。そして、ディレクトリごと所定の位置へ移動する。

``` text
# wget http://sourceforge.net/projects/squirrelmail/files/stable/1.4.22/squirrelmail-webmail-1.4.22.tar.gz/download
# tar zxvf squirrelmail-webmail-1.4.22.tar.gz
# mv squirrelmail-webmail-1.4.22 /var/www/webmail
# rm -f squirrelmail-webmail-1.4.22.tar.gz  # <= 後始末
```

### 2. 日本語設定

日本語が使用できるように設定する。

``` text
# mkdir -p locales                             # <= locales ディレクトリ作成
# cd locales                                   # <= locales ディレクトリへ移動
# wget http://jaist.dl.sourceforge.net/sourceforge/squirrelmail/ja_JP-1.4.18-20090526.tar.bz2
                                               # <= locale ダウンロード
# tar jxvf ja_JP-1.4.18-20090526.tar.bz2       # <= locale 展開
# ./install                                    # <= localeインストール
Please enter path to your squirrelmail installation:/var/www/webmail
                                               # <= インストール先を入力

# cd                                           # <= ルートへ移動
# rm -rf locales                               # <= 後始末
# cd /var/www/webmail/po/                      # <= ディレクトリ移動
# ./compilepo ja_JP                            # <= squirrelmail.po ファイル作成
Compiling ../locale/ja_JP/LC_MESSAGES/squirrelmail.po

# cd                                           # <= ルートへ移動
# chmod 730 /var/www/webmail/data/             # <= dataディレクトリの権限設定
# chown -R nginx:nginx /var/www/webmail/data/  # <= data ディレクトリの所有者設定
```

### 3. SquirrelMail 設定

設定用スクリプトを実行して各種設定を行う。

``` text
# /var/www/webmail/config/conf.pl
```

以下、入力部分のみ箇条書き。

- `Main Menu` で `10`(Languages) を選択。
- `Language preferences` で `1`(Default Language) を選択。
- 言語として `ja_JP` と入力。
- `Language preferences` で `2`(Default Charset) を選択。
- 文字コードとして `iso-2022-jp` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `1`(Organization Preferences) を選択。
- `Organization Preferences` で `5`(Signout Page) を選択。
- ログアウト時に表示するページとして `/webmail` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `2`(Server Settings) を選択。
- `Server Settings - General` で `1`(Domain) を選択。
- ドメイン名として `mk-mode.com` と入力。
- `Server Settings - General` で `A`(Update IMAP Settings) を選択。
- `Server Settings - IMAP Settings` で `4`(IMAP Server) を選択。
- IMAP サーバ名として `mail.mk-mode.com` と入力。
- `Server Settings - IMAP Settings` で `8`(Server software) を選択。
- IMAP サーバソフト名として `dovecot` と入力。
- `Server Settings - IMAP Settings` で `B`(Update SMTP Settings) を選択。
- `Server Settings - SMTP Settings` で `4`(SMTP Server) を選択。
- SMTP サーバ名として `mail.mk-mode.com` と入力。
- `Server Settings - SMTP Settings` で `7`(SMTP Authentication) を選択。
- `Try to detect auth mechanisms? [y/N]` で `y` と入力。
- `none, login, plain, cram-md5, or digest-md5 [none]` で `login` と入力。
- `SMTP connections? [y/N]` で `n` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `4`(General Settings) を選択。
- `General Options` で `7`(Hide SM attributions) を選択。
- `Hide SM attributions (y/n) [n]` で `y` と入力。
- `General Options` で `1`(Data Directory) を選択。
- データディレクトリとして `../data/` と入力。
- `General Options` で `2`(Attachment Directory) を選択。
- 添付データディレクトリとして `$data_dir` と入力。
- `General Options` で `16`(Only secure cookies if poss.) を選択。
- Secure Login プラグインによるログインを不可にするために `n` と入力。
- `r` で `Main Menu` へ戻る。
- `Main Menu` で `3`(Folder Defaults) を選択。
- `Folder Defaults` で `3`(Trash Folder) を選択。
- ゴミ箱フォルダとして `Trash` と入力。
- `Folder Defaults` で `4`(Sent Folder) を選択。
- 送信済みフォルダとして `Sent` と入力。
- `Folder Defaults` で `5`(Drafts Folder) を選択。
- 草稿フォルダとして `Drafts` と入力。
- `q` で終了。
- `y` で書き込み。

### 4. プラグインアーカイブダウンロード＆展開

プラグインを全てのバージョンの SquirrelMail でそのまま動くようにする "Compatibility"、ログイン時に自動的にhttps(SSL)でアクセスする "Secure Login" を導入する。

``` text
# wget "http://www.squirrelmail.org/countdl.php?fileurl=http%3A%2F%2Fwww.squirrelmail.org%2Fplugins%2Fcompatibility-2.0.16-1.0.tar.gz"
# wget "http://www.squirrelmail.org/countdl.php?fileurl=http%3A%2F%2Fwww.squirrelmail.org%2Fplugins%2Fsecure_login-1.4-1.2.8.tar.gz"

# cd /var/www/webmail/plugins/

# tar zxvf /root/compatibility-*.tar.gz
# tar zxvf /root/secure_login-*.tar.gz

# rm -f /root/compatibility-*.tar.gz
# rm -f /root/secure_login-*.tar.gz
```

### 5. Secure Login プラグイン設定

ログイン後もSSL通信を継続するようにするため、設定ファイルサンプルを複製して編集する。

``` text
# cp secure_login/config.sample.php secure_login/config.php
```

File: `secure_login/config.php`

{% highlight bash linenos %}
   $change_back_to_http_after_login = 0;  # <= 変更
{% endhighlight %}

### 6. SquirrelMail 設定

``` text
# /var/www/webmail/config/conf.pl
```

- `Main Menu` で `8`(Plugins) を選択。
- `Plugins` で `4`(compatibility) を選択。（※番号は環境により異なる！）
- `Plugins` で `14`(secure_login) を選択。（※番号は環境により異なる！）
- `q` で終了。
- `y` で書き込み。

### 7. 添付ファイルサイズ拡大

添付ファイルサイズを拡大する設定を行う。（例として 10MB を想定）

まず、メールサイズの上限を 20MB（添付ファイルサイズの２倍位） に設定する（Postfix 設定ファイル編集する）。

File: `/etc/postfix/main.cf`

{% highlight bash linenos %}
message_size_limit = 20971520  # <= 20MB = 0*1024*1024
{% endhighlight %}

そして、設定を反映させるために Postfix をリロードする。

``` text
# /etc/rc.d/init.d/postfix reload
postfix を再読み込み中:                                    [  OK  ]
```

次に、PHP 設定ファイルを編集する。

File: `/etc/php.ini`

{% highlight bash linenos %}
#upload_max_filesize = 2M
upload_max_filesize = 10M  # <= 変更

#post_max_size = 8M
post_max_size = 10M        # <= 変更
{% endhighlight %}

### 8. Nginx 設定

Nginx 設定ファイルをの `server` ディレクティブ（HTTPS 用）内に以下のように記述を追加する。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
    server {

         # ===< 省略 >===

         # Squirrel Mail
         location /webmail {
             alias /var/www/webmail;
             index index.php;
             allow 127.0.0.1;
             allow 192.168.11.0/24;
             deny  all;
         }

         location ~ /webmail/.*\.php$ {
             fastcgi_pass    127.0.0.1:9000;
             fastcgi_index   index.php;
             fastcgi_param   SCRIPT_FILENAME  /var/www/$uri;
             include         fastcgi_params;
         }

         # ===< 省略 >===

    }
{% endhighlight %}

`http://＜サーバホスト名orアドレス＞/webmail/` で `https//＜サーバホスト名orアドレス＞/webmail/` にリライトさせたいなら、Nginx 設定ファイルの `server` ディレクティブ（HTTP 用）に以下のように `rewrite` 設定を追加すればよい。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
    server {

         # ===< 省略 >===

         rewrite ^/webmail(.*)?$ https://$http_host/webmail$1 last;

         # ===< 省略 >===

    }
{% endhighlight %}

### 9. Nginx リロード

設定を反映させるため Nginx をリロードする。

``` text
# /etc/rc.d/init.d/nginx reload
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
nginx を再読み込み中:                                      [  OK  ]
```

### 10. 動作確認

ブラウザで `https:/＜サーバ名＞/webmail/` にアクセスし、ログイン画面が表示されるか、その他各種動作を確認する。  
`http` を `https` にリライトするように設定している場合は `http:/＜サーバ名＞/webmail/` でアクセスし `https:/＜サーバ名＞/webmail/` にリライトされるかも確認する。

![CENTOS_6-5_SQUIRREL_MAIL_1]({{site.baseurl}}/images/2014/01/23/CENTOS_6-5_SQUIRREL_MAIL_1.png "CENTOS_6-5_SQUIRREL_MAIL_1")
![CENTOS_6-5_SQUIRREL_MAIL_2]({{site.baseurl}}/images/2014/01/23/CENTOS_6-5_SQUIRREL_MAIL_2.png "CENTOS_6-5_SQUIRREL_MAIL_2")

---

次回は、ログ監視ツール SWATCH の導入について紹介する予定です。

以上。

