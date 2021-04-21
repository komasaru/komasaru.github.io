---
layout   : single
title    : "Debian 10 (buster) - Let's Encrypt で常時 SSL 化(with Nginx)！"
published: true
date     : 2019-12-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
- SSL
---

Debian GNU/Linux 10 (buster) に構築した Web サーバ Nginx への接続を、 Let's Encrypt で取得した SSL サーバ証明書で常時 SSL 化するための方法についての記録です。

（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster; 64bit) での作業を想定。
* クライアント側も Debian GNU/Linux 10 (buster; 64bit) を想定。
* Web(HTTP)サーバ Nginx が「[Debian 10 (buster) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2019/12/20/debian-10-nginx-installation-by-official-apt "Debian 10 (buster) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")」の方法で導入済みであることを想定。
* Nginx 1.16.1 での作業を想定。
* Python 2.7 系がインストール済みであること。（当方は 2.7.16 がインストール済み）
* バーチャルホストは使用しない。
* root ユーザでの作業を想定。

### 1. Debian backports リポジトリの有効化

Let's Encrypt のクライアントソフトウェア Certbot を使用するが、 Debian 10 用の Certbot パケージは Stretch backports リポジトリから取得するため、 backports リポジトリが有効になっていなければ、有効にしておく。

File: `/etc/apt/sources.list`

``` text
deb http://ftp.debian.org/debian buster-backports main
```

パッケージリストの更新。

``` text
# apt -y update
```

### 2. Certbot クライアントのインストール

Let's Encrypt のクライアントソフトウェア Certbot をインストールする。

``` text
# apt -y -t buster-backports install certbot
```

### 3. Certbot のテスト

バージョンを出力してみる。

``` text
# certbot --version
certbot 0.31.0
```

オプション無しで実行してみる。

``` text
# certbot
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Certbot doesn't know how to automatically configure the web server 
on this system. However, it can still get a certificate for you. 
Please run "certbot certonly" to do so. You'll need to manually 
configure your web server to use the resulting certificate.
```

### 4. ポートの開放

ドメイン所有者の認証のために TCP ポートの `80` 番と `443` 番に接続されるので、開放されてなければ開放しておく。

`ufw` コマンドによるポート開放については、過去記事「[Debian 10 (buster) - ファイアウォール設定！]({{site.baseurl}}/2019/10/26/debian-10-firewall-setting "Debian 10 (buster) - ファイアウォール設定！")」を参照。

### 5. Certbot クライアントの起動

証明書発行のために Certbot クライアントを起動する。（起動後の設定は次項で）

``` text
# certbot certonly --standalone -d example.jp -d www.example.jp
```

* `example.jp`, `www.example.jp` は自分のものに置き換えること。
* 上記コマンド実行後、最初にバージョンチェックが行われ、必要に応じてアップデートされる。

### 6. メールアドレス等の設定

メールアドレスの設定と利用規約への同意を行う。

Web サーバ Nginx を停止していなかったので、以下では停止するよう警告された。

``` text
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator standalone, Installer None
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): webmaster@mk-mode.com

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(A)gree/(C)ancel: A

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing to share your email address with the Electronic Frontier
Foundation, a founding partner of the Let's Encrypt project and the non-profit
organization that develops Certbot? We'd like to send you email about our work
encrypting the web, EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: Y
Obtaining a new certificate
Performing the following challenges:
http-01 challenge for mk-mode.com
http-01 challenge for www.mk-mode.com
Cleaning up challenges
Problem binding to port 80: Could not bind to IPv4 or IPv6.

IMPORTANT NOTES:
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
```

### 7. Web サーバ の停止

Certbot クライアントは、ドメイン所有者であることの認証に TCP ポートの `80` 番と `443` 番を使用するため、 Web サーバ（今回は Nginx）を一時的に終了させる必要がある。

``` text
# systemctl stop nginx
```

### 8. Certbot クライアントの再実行

``` text
# certbot certonly --standalone -d example.jp -d www.example.jp
```

* `example.jp`, `www.example.jp` は自分のものに置き換えること。
* 最初の Certbot 実行時に設定したメールアドレスや利用規約の同意の情報は引き継がれる。

### 9. SSL/TLS サーバ証明書の取得完了

しばらく待つと、以下のようなメッセージを出力して SSL/TLS サーバ証明書の取得プロセスが完了する。

``` text
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator standalone, Installer None
Obtaining a new certificate
Performing the following challenges:
http-01 challenge for mk-mode.com
http-01 challenge for www.mk-mode.com
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/mk-mode.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/mk-mode.com/privkey.pem
   Your cert will expire on 2020-02-15. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le

```

* サーバ証明書の実体（ファイル）は、 `/etc/letsencrypt/archive/ドメイン名` ディレクトリ配下に保存される。
  - サーバ証明書（公開鍵） ... `certN.pem`
  - 中間証明書 ... `chainN.pem`
  - サーバ証明書と中間証明書の結合ファイル ... `fullchainN.pem`
  - 秘密鍵 ... `privkeyN.pem`
* シンボリックリンクは、 `/etc/letsencrypt/live/ドメイン名` ディレクトリ配下に保存される。
  - サーバ証明書（公開鍵） ... `cert.pem`
  - 中間証明書 ... `chain.pem`
  - サーバ証明書と中間証明書の結合ファイル ... `fullchain.pem`
  - 秘密鍵 ... `privkey.pem`
* SSL/TLS サーバ証明書の取得に失敗した場合は、ポート開放等の設定を再確認する。

### 10. Nginx 設定ファイルの編集

環境により設定ファイルの配置ディレクトリやファイル名、記述方法等が異なるかもしれない。適宜置き換えること。

File: `/etc/nginx/conf.d/default.conf`

``` text
server {
    listen 80;
    #       :
    # ===< 中略 >===
    #       :
    return 301 https://$host$request_uri;  # <= 追加
    #       :
    # ===< 中略 >===
    #       :
}
```

File: `/etc/nginx/conf.d/ssl.conf`

``` text
server {
    listen 443 ssl;
    #       :
    # ===< 中略 >===
    #       :
    ssl on;                                                               # <= 追加
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;                            # <= 追加
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;  # <= 追加
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;    # <= 追加
    #       :
    # ===< 中略 >===
    #       :
```

### 11. Nginx 設定ファイルの文法チェック

``` text
# nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

問題があれば、設定ファイルの内容を見直す。

### 12. Web サーバ の起動

停止していた Web サーバ（今回は Ngxin）を再開させる。

``` text
# systemctl start nginx
```

### 13. 証明書の更新

Debian 用 Certbot は、インストール時に自動で更新されるよう `/etc/cron.d/certbot` が登録されるので、自分でコマンドを実行して更新する必要はないはずだったが、最近は Web サーバが起動していると `certbot -q renew` に失敗するので、編集する。（`--pre-hook`, `--post-hook` オプションの追加）

File: `/etc/cron.d/certbot`

``` text
# /etc/cron.d/certbot: crontab entries for the certbot package
#
# Upstream recommends attempting renewal twice a day
#
# Eventually, this will be an opportunity to validate certificates
# haven't been revoked, etc.  Renewal will only occur if expiration
# is within 30 days.
#
# Important Note!  This cronjob will NOT be executed if you are
# running systemd as your init system.  If you are running systemd,
# the cronjob.timer function takes precedence over this cronjob.  For
# more details, see the systemd.timer manpage, or use systemctl show
# certbot.timer.
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

#0 */12 * * * root test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(43200))' && certbot -q renew
0 */12 * * * root test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(43200))' && certbot -q renew --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
```

cron 登録されていない場合は、証明書の失効日（有効期限は90日）が近づいたら、証明書更新のためにコマンドを実行する必要がある。（失効日が近くない場合は、実行しても更新は行われない）

``` text
# certbot renew
```

もしくは、自動で更新するよう cron 登録を行う。（以下は一例。上記の cron をコピー＆ペーストしてもよいだろう）

File: `/etc/cron.d/certbot`

``` text
0 2 * * * root certbot renew && systemctl reload nginx
```

### 14. 参考サイト

* [ユーザーガイド - Let's Encrypt 総合ポータル](https://letsencrypt.jp/docs/using.html "ユーザーガイド - Let's Encrypt 総合ポータル")

---

以上。

