---
layout   : single
title    : "FreeBSD 10.0 - FTP サーバ vsftpd インストール！"
published: true
date     : 2014-10-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- FreeBSD
- FTP
---

「FreeBSD 10.0 - FTP サーバ vsftpd インストール」についての記録です。

（旧バージョンでの個人の作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* 以下の作業は、リモート接続して行う。（リモートから `ssh vbox` で接続）
* リモート端末は、 Linux Mint 17 マシンを想定しているが、 Unix 系 OS なら同じ。
* 設定ファイル等のテキストファイルの編集には `vi` コマンドを使用。
* 作業はリモート接続で一般ユーザから root になって行う。
* ログローテションをするので logrotate がインストール済みであること。
* SSL 証明書を使用するので OpenSSL がインストール・設定済みであること。
* 外部へ公開するなら BIND がインストール・設定済みであること。
* FTP の PASV モードで使用するポートは 4000〜4009/TCP を想定。
* 主に[FreeBSDサーバー構築マニュアル](http://freebsd.server-manual.com/ "FreeBSDサーバー構築マニュアル")を参照。

### 1. SSL 証明書作成

``` text
# cd /etc/ssl/
# openssl req -new -x509 -days 3650 -key server.key -out ftp.crt
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:JP                                    # <= 国略称（２桁）
State or Province Name (full name) [Some-State]:Shimane                 # <= 都道府県名
Locality Name (eg, city) []:Matsue                                      # <= 市区町村名
Organization Name (eg, company) [Internet Widgits Pty Ltd]:mk-mode.com  # <= 会社・組織名等
Organizational Unit Name (eg, section) []:                              # <= 部署名（空でよい）
Common Name (e.g. server FQDN or YOUR name) []:ftp.mk-mode.com          # <= 管理者名（ホスト名等）
Email Address []:postmaster@mk-mode.com                                 # <= 管理者メールアドレス

# cat server.key ftp.crt > ftp.pem
# chmod 400 ftp.*
# cd
```

### 2. pkgtools.conf 編集

`make` 実行時に常時設定するパラメータを設定しておく。

File: `/usr/local/etc/pkgtools.conf`

{% highlight bash linenos %}
  MAKE_ARGS = {
    'ftp/vsftpd' => 'WITH_VSFTPD_SSL=yes',  # <= 追加
  }
{% endhighlight %}

### 3. vsftpd インストール

``` text
# cd /usr/ports/ftp/vsftpd
# make BATCH=yes WITH_VSFTPD_SSL=yes install clean
# cd
```

### 4. 設定ファイル編集

まず、設定ファイルに書き込み権限を付与。

``` text
# chmod 640 /usr/local/etc/vsftpd.conf
```

そして、編集。

File: `/usr/local/etc/vsftpd.conf`

{% highlight bash linenos %}
anonymous_enable=NO                # <= 変更（匿名ログインを拒否）

local_enable=YES                   # <= コメント解除（ローカルログインを許可）

write_enable=YES                   # <= コメント解除（書き込みを許可）

local_umask=022                    # <= コメント解除（新規ファイルの権限設定）

xferlog_file=/var/log/vsftpd.log   # <= コメント解除（ログファイルの指定）

ascii_upload_enable=YES            # <= コメント解除（アスキーモードでのアップロードを許可）

ascii_download_enable=YES          # <= コメント解除（アスキーモードでのダウンロードを許可）

chroot_local_user=YES              # <= コメント解除（ローカルユーザの chroot 化）

chroot_list_enable=YES             # <= コメント解除（ホームディレクトリより上位への移動を禁止するユーザリストを使用）

chroot_list_file=/etc/vsftpd.chroot_list  # <= コメント解除（ホームディレクトリより上位への移動を禁止するユーザリストのファイル）

ls_recurse_enable=YES              # <= コメント解除（ディレクトリ単位での再帰的な削除を許可）

listen=NO                          # <= NO になっていることを確認（inetd での起動を許可）

# 最終行に下記を追加
pasv_enable=YES                  # <= PASV モード有効
pasv_addr_resolve=YES            # <= pasv_address 有効
pasv_address=ftp.mk-mode.com     # <= ルータの WAN 側 IP アドレス（内部のみなら不要）
pasv_min_port=4000               # <= PAXV モードの最小ポート番号
pasv_max_port=4009               # <= PAXV モードの最大ポート番号
use_localtime=YES                # <= ローカルタイムを使用
ssl_enable=YES                   # <= SSL接続を許可
rsa_cert_file=/etc/ssl/ftp.pem   # <= SSL 証明書ファイルを指定
require_ssl_reuse=NO             # <= SSL セッションを再利用しない
force_local_logins_ssl=NO        # <= 強制 SSL 接続を解除
force_local_data_ssl=NO          # <= 強制 SSL 接続を解除
force_dot_files=YES              # <= ドットファイルを表示
{% endhighlight %}

### 5. アクセス許可設定

File: `/etc/hosts.allow`

{% highlight bash linenos %}
vsftpd: ALL    # <= 最終行に追加
{% endhighlight %}

### 6. chroot 設定

chroot 化する（FTP サーバに接続させる）ユーザの一覧を作成。

File: `/etc/vsftpd.chroot_list`

{% highlight bash linenos %}
masaru
{% endhighlight %}

### 6. inetd 設定

FTP サーバへの接続要求のあった場合のみ vsftpd を起動させるために設定ファイルを編集。（最終行に以下の記述をを追記）

File: `/etc/inetd.conf`

{% highlight bash linenos %}
ftp     stream  tcp     nowait          root    /usr/local/libexec/vsftpd       vsftpd
{% endhighlight %}

### 7. inetd 自動起動設定

File: `/etc/rc.conf`

{% highlight bash linenos %}
inetd_enable="YES"    # <= 追加
{% endhighlight %}

### 8. inetd 起動

``` text
# /etc/rc.d/inetd start
Starting inetd.
```

### 9. ログローテーション設定

以下の内容のファイルを作成。

File: `/usr/local/etc/logrotate.d/vsftpd`

{% highlight bash linenos %}
/var/log/vsftpd.log{
    daily
    rotate 4
    create
    nocompress
    missingok
    sharedscripts
    postrotate
        /bin/kill -HUP `cat /var/run/inetd.pid`
    endscript
}
{% endhighlight %}

### 10. ファイアウォール設定

FTP サーバを外部に公開する場合は、FTP 用ポート：21/TCP、PASV モード用ポート 4000〜4009/TCP を開放する。（内部のみの場合も適切に設定する）

### 11. 動作確認

ローカルマシンなどから、コマンドや FTP クライアントで FTP サーバへ接続し各種操作が可能か確認する。

---

以上。

