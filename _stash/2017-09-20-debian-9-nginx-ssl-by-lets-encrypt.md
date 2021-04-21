---
layout   : single
title    : "Debian 9 (Stretch) - Let's Encrypt で常時 SSL 化(with Nginx)！"
published: true
date     : 2017-09-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
- SSL
---

Debian GNU/Linux 9 (Stretch) に構築した Web サーバ Nginx への接続を、 Let's Encrypt で取得した SSL サーバ証明書で常時 SSL 化するための方法についての記録です。

（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* クライアント側は LMDE2(Linux Mint Debian Edition 2) を想定。
* Web(HTTP)サーバ Nginx が「[Debian 9 (Stretch) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！]({{site.baseurl}}/2017/09/16/debian-9-nginx-installation-by-official-apt/ "Debian 9 (Stretch) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！")」の方法で導入済みであることを想定。
* Nginx 1.12.1 での作業を想定。
* Python 2.6/2.7 系がインストール済みであること。（当方は 2.7.13 がインストール済み）
* バーチャルホストは使用しない。
* root ユーザでの作業を想定。

### 1. Debian backports リポジトリの有効化

Let's Encrypt のクライアントソフトウェア Certbot を使用するが、 Debian 9 用の Certbot パケージは Stretch backports リポジトリから取得するため、 backports リポジトリが有効になっていなければ、有効にしておく。

File: `/etc/apt/sources.list`

{% highlight bash linenos %}
deb http://ftp.debian.org/debian stretch-backports main
{% endhighlight %}

``` text
# apt -y update
```

### 2. Certbot クライアントのインストール

Let's Encrypt のクライアントソフトウェア Certbot をインストールする。

``` text
# apt -y -t stretch-backports install certbot
```

### 3. Certbot のテスト

バージョンを出力してみる。

``` text
# certbot --version
certbot 0.10.2
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

ドメイン所有者の認証のために TCP ポートの 80 番と 443 番に接続されるので、開放されてなければ開放しておく。

ufw コマンドによるポート開放については、過去記事「[Debian 9 (Stretch) - ファイアウォール設定！]({{site.baseurl}}/2017/08/16/debian-9-firewall-setting/ "Debian 9 (Stretch) - ファイアウォール設定！")」を参照。

### 5. Certbot クライアントの起動

証明書発行のために Certbot クライアントを起動する。

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
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel):abcdefg@example.com                     # <= メールアドレスの設定
Starting new HTTPS connection (1): acme-v01.api.letsencrypt.org

-------------------------------------------------------------------------------
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf. You must agree
in order to register with the ACME server at
https://acme-v01.api.letsencrypt.org/directory
-------------------------------------------------------------------------------
(A)gree/(C)ancel: A                             # <= 利用規約への同意
Obtaining a new certificate
Performing the following challenges:
tls-sni-01 challenge for example.com
tls-sni-01 challenge for www.example.com

-------------------------------------------------------------------------------
The program nginx (process ID 28156) is already listening on TCP port 443. This
will prevent us from binding to that port. Please stop the nginx program
temporarily and then try again.
-------------------------------------------------------------------------------
Press Enter to Continue
Cleaning up challenges
At least one of the required ports is already taken.

IMPORTANT NOTES:
 - If you lose your account credentials, you can recover through
   e-mails sent to abcdefg@example.com.
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
```

### 7. Web サーバ の停止

Certbot クライアントは、ドメイン所有者であることの認証に TCP ポートの 80 番と 443 番を使用するため、 Web サーバ（今回は Nginx）を一時的に終了させる必要がある。

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
Starting new HTTPS connection (1): acme-v01.api.letsencrypt.org
Obtaining a new certificate
Performing the following challenges:
tls-sni-01 challenge for example.com
tls-sni-01 challenge for www.example.com
/usr/lib/python2.7/dist-packages/OpenSSL/rand.py:58: UserWarning: implicit cast from 'char *' to a different pointer type: will be forbidden in the future (check that the types are as you expect; use an explicit ffi.cast() if they are correct)
  result_code = _lib.RAND_bytes(result_buffer, num_bytes)
Waiting for verification...
Cleaning up challenges
Generating key (2048 bits): /etc/letsencrypt/keys/0000_key-certbot.pem
Creating CSR: /etc/letsencrypt/csr/0000_csr-certbot.pem

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/example.com/fullchain.pem. Your cert will
   expire on 2017-10-15. To obtain a new or tweaked version of this
   certificate in the future, simply run certbot again. To
   non-interactively renew *all* of your certificates, run "certbot
   renew"
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

{% highlight bash linenos %}
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
{% endhighlight %}

File: `/etc/nginx/conf.d/ssl.conf`

{% highlight bash linenos %}
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
{% endhighlight %}

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

Debian 用 Certbot は、インストール時に、自動で更新されるよう `/etc/cron.d/certbot` が以下のように登録されるので、自分でコマンドを実行して更新する必要はない。

File: `/etc/cron.d/certbot`

{% highlight bash linenos %}
# /etc/cron.d/certbot: crontab entries for the certbot package
#
# Upstream recommends attempting renewal twice a day
#
# Eventually, this will be an opportunity to validate certificates
# haven't been revoked, etc.  Renewal will only occur if expiration
# is within 30 days.
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

0 */12 * * * root test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(3600))' && certbot -q renew
{% endhighlight %}

**しかし、 Nginx を使用している場合、 TCP Port Listen の関係で Nginx 停止する必要があるので、以下のようにするとよいだろう。**

File: `/etc/cron.d/certbot`

{% highlight bash linenos %}
# /etc/cron.d/certbot: crontab entries for the certbot package
#
# Upstream recommends attempting renewal twice a day
#
# Eventually, this will be an opportunity to validate certificates
# haven't been revoked, etc.  Renewal will only occur if expiration
# is within 30 days.
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

0 */12 * * * root certbot -q renew --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
{% endhighlight %}

* この `--pre-hook` は証明書が実際に取得・更新できる場合のみ、 `--post-hook` は証明書を取得・更新する試みが行われた場合のみ実行される。

もしも、 cron 登録されていない（しない）場合は、証明書の失効日（有効期限は90日）が近づいたら、証明書更新のためにコマンドを実行する必要がある。（失効日が近くない場合は、実行しても更新は行われない）

``` text
# certbot renew
```

### 14. 参考サイト

* [ユーザーガイド - Let's Encrypt 総合ポータル](https://letsencrypt.jp/docs/using.html "ユーザーガイド - Let's Encrypt 総合ポータル")

---

以上。

