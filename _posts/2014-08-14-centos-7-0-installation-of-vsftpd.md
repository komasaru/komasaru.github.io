---
layout   : single
title    : "CentOS 7.0 - FTP サーバ vsftpd 構築！"
published: true
date     : 2014-08-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- FTP
---

「CentOS 7.0 - FTP サーバ vsftpd 構築」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- IPv6 は使用しない。
- FirewallD のゾーンは public を使用する。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. vsftpd インストール

``` text
# yum -y install vsftpd
```

### 2. vsftpd 設定ファイル編集

File: `/etc/vsftpd/vsftpd.conf`

{% highlight bash linenos %}
# Allow anonymous FTP? (Beware - allowed by default if you comment this out).
anonymous_enable=NO               # <= 変更（匿名ユーザログイン禁止）

# Activate logging of uploads/downloads.
xferlog_enable=YES                # <= 変更（ログファイル書き込み有効化）

# You may override where the log file goes if you like. The default is shown
# below.
xferlog_file=/var/log/vsftpd.log  # <= コメント解除＆変更（ログファイル名）

# If you want, you can have your log file in standard ftpd xferlog format
xferlog_std_format=NO             # <= 変更（wu-ftpd スタイルでログを記録）

# By default the server will pretend to allow ASCII mode but in fact ignore
# the request. Turn on the below options to have the server actually do ASCII
# mangling on files when in ASCII mode.
# Beware that on some FTP servers, ASCII support allows a denial of service
# attack (DoS) via the command "SIZE /big/file" in ASCII mode. vsftpd
# predicted this attack and has always been safe, reporting the size of the
# raw file.
# ASCII mangling is a horrible feature of the protocol.
ascii_upload_enable=YES           # コメント解除（アスキーモードでのアップロードを許可）
ascii_download_enable=YES         # コメント解除（アスキーモードでのダウンロードを許可）

# You may fully customise the login banner string:
ftpd_banner=Welcome to mk-mode FTP service.  # <= コメント解除＆変更（ログイン時にソフト名とバージョンを非表示（設定のメッセージを表示））

# You may specify an explicit list of local users to chroot() to their home
# directory. If chroot_local_user is YES, then this list becomes a list of
# users to NOT chroot().
chroot_local_user=YES                     # <= コメント解除（デフォルトでホームディレクトリより上層へのアクセスを禁止）
chroot_list_enable=YES                    # <= コメント解除（ホームディレクトリより上層へのアクセスを許可するユーザのリストの有効化）
# (default follows)
chroot_list_file=/etc/vsftpd/chroot_list  # <= コメント解除（ホームディレクトリより上層へのアクセスを許可するユーザのリスト名）

# You may activate the "-R" option to the builtin ls. This is disabled by
# default to avoid remote users being able to cause excessive I/O on large
# sites. However, some broken FTP clients such as "ncftp" and "mirror" assume
# the presence of the "-R" option, so there is a strong case for enabling it.
ls_recurse_enable=YES                     # <= コメント解除（ディレクトリごと削除可能）

# When "listen" directive is enabled, vsftpd runs in standalone mode and
# listens on IPv4 sockets. This directive cannot be used in conjunction
# with the listen_ipv6 directive.
listen=YES                                # <= IPv4 をリッスンする

# This directive enables listening on IPv6 sockets. By default, listening
# on the IPv6 "any" address (::) will accept connections from both IPv6
# and IPv4 clients. It is not necessary to listen on *both* IPv4 and IPv6
# sockets. If you want that (perhaps because you want to listen on specific
# addresses) then you must run two copies of vsftpd with two configuration
# files.
# Make sure, that one of the listen options is commented !!
listen_ipv6=NO                            # <= IPv6 をリッスンしない

# 以下を最下行へ追加
use_localtime=YES                            # <= タイムスタンプを日本時間
pasv_addr_resolve=YES                        # <= PASVモード接続先IPアドレスをホスト名から取得
pasv_address=ftp.mk-mode.com                 # <= PASVモード接続先IPアドレスが牽けるホスト名
pasv_min_port=4000                           # <= PASVモード接続時の最小ポート番号
pasv_max_port=4005                           # <= PASVモード接続時の最大ポート番号
ssl_enable=YES                               # <= SSLの有効化
rsa_cert_file=/etc/pki/tls/certs/vsftpd.pem  # <= サーバー証明書を指定
force_local_logins_ssl=NO                    # <= ログイン時にSSL接続を強制しない※暗号化しない接続もできるようにする場合のみ
force_local_data_ssl=NO                      # <= データ転送時にSSL接続を強制しない※暗号化しない接続もできるようにする場合のみ
{% endhighlight %}

### 3. ホームディレクトリより上層へのアクセスを許可するユーザのリスト作成

File: `/etc/vsftpd/chroot_list`

{% highlight bash linenos %}
masaru  # <= 対象のユーザ（例えば自分）を追加
{% endhighlight %}

### 4. タイムスタンプ設定

ホームディレクトリより上層へのアクセスができないユーザのタイムスタンプを日本時間にする設定を行う。

【サーバに新規にユーザを登録した際の対処】

``` text
# mkdir /etc/skel/etc  # <= ユーザのホームディレクトリ配下に "etc" ディレクトリが作成されるようにする

# cp /etc/localtime /etc/skel/etc/
# <= ユーザ登録時に "/etc/localtime" がホームディレクトリの "etc" ディレクトリへコピーされるようにする
```

【既存のユーザに対する対処】

まず、タイムスタンプ設定用スクリプトを作成する。

File: `localtimset`

{% highlight bash linenos %}
#!/bin/bash

for user in `ls /home`
do
   id $user > /dev/null 2>&1
   if [ $? -eq 0 ]; then
        grep $user /etc/vsftpd/chroot_list > /dev/null 2>&1
        if [ $? -ne 0 ] && [ ! -f /home/$user/etc/localtime ]; then
            mkdir -p /home/$user/etc
            cp /etc/localtime /home/$user/etc
            echo $user
        fi
   fi
done
{% endhighlight %}

タイムスタンプ設定用スクリプトを実行する。

``` text
# sh localtimset
masaru
fuga
 :
```

終了したら、もうこのスクリプトは不要なので削除する。

``` text
# rm -f localtimset
```

### 5. アクセス禁止ユーザリスト作成

vsftpd サーバにアクセスさせたくないユーザがあれば設定する。

File: `/etc/vsftpd/ftpusers`

{% highlight bash linenos %}
foo  # <= 対象のユーザを追加
{% endhighlight %}

### 6. サーバー証明書作成

以下のようにして FTP サーバ証明書を作成する。

``` text
# cd /etc/pki/tls/certs/

# make vsftpd.pem
umask 77 ; \
        PEM1=`/bin/mktemp /tmp/openssl.XXXXXX` ; \
        PEM2=`/bin/mktemp /tmp/openssl.XXXXXX` ; \
        /usr/bin/openssl req -utf8 -newkey rsa:2048 -keyout $PEM1 -nodes -x509 -days 365 -out $PEM2 -set_serial 0 ; \
        cat $PEM1 >  vsftpd.pem ; \
        echo ""    >> vsftpd.pem ; \
        cat $PEM2 >> vsftpd.pem ; \
        rm -f $PEM1 $PEM2
Generating a 2048 bit RSA private key
....................................................................+++
.....+++
writing new private key to '/tmp/openssl.a7lbqG'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:JP                                      # <= 国名
State or Province Name (full name) []:Shimane                             # <= 都道府県名
Locality Name (eg, city) [Default City]:Matsue                            # <= 市区町村名
Organization Name (eg, company) [Default Company Ltd]:mk-mode.com         # <= 会社名・サイト名
Organizational Unit Name (eg, section) []:                                # <= 部署名
Common Name (eg, your name or your server's hostname) []:ftp.mk-mode.com  # <= ホスト名・管理者名
Email Address []:root@mk-mode.com                                         # <= 管理者メールアドレス

# cd
```

### 7. vsftpd 起動

vsftpd を起動する。

``` text
# systemctl start vsftpd
```

### 8. vsftpd 自動起動設定

サーバ起動時に自動で vsftpd が起動するよう設定する。

``` text
# systemctl enable vsftpd
ln -s '/usr/lib/systemd/system/vsftpd.service' '/etc/systemd/system/multi-user.target.wants/vsftpd.service'
# systemctl list-unit-files -t server | grep vsftpd
vsftpd.service                              enabled  # <= enabled であることを確認
vsftpd@.service                             disabled
```

### 9. アクセス制限設定

指定のもの以外は vsftpd にアクセスできないよう設定する。

File: `/etc/hosts.allow`

{% highlight bash linenos %}
vsftpd: 127.0.0.1
vsftpd: 192.168.11.
{% endhighlight %}

File: `/etc/hosts.deny`

{% highlight bash linenos %}
vsftpd: ALL
{% endhighlight %}

### 10. ファイアウォール設定

ルータでポート TCP:21 と PASV モード用のポートを開放する。（今回の場合 TCP:4000 〜 4005）

また、ファイアウォールの設定もこれに合わせる。

``` text
# firewall-cmd --add-service=ftp
success
# firewall-cmd --add-service=ftp --permanent
success
# firewall-cmd --list-services
dhcpv6-client dns ftp ssh

# firewall-cmd --add-port=4000-4005/tcp
success
# firewall-cmd --add-port=4000-4005/tcp --permanent
success
# firewall-cmd --list-ports
4000-4005/tcp
```

### 11. 動作確認

クライアント側からコマンドラインや FTP クライアントでサーバに接続して、アップロード・ダウンロード等各種操作が可能かチェックする。  
FTP クライアント FileZilla なら以下のように設定してログイン。

- ホスト：サーバホスト名 or サーバ IP アドレス
- プロトコル：「FTP - ファイル転送プロトコル」
- 暗号化：「明示的な FTP over TLS が必要」
- ログオンの種類：「通常」 or 「パスワードを尋ねる」
- ユーザ：ユーザ名

### 12. 問題点

当記事執筆時点では、自動起動の設定をしてもマシン再起動時には vsftpd デーモンの起動が失敗する。（おそらく、vsftpd インストール直後は問題なかったがが他のサービスをインストールしていくうちにそのような現象に陥るようになった。原因は不明）

``` text
# systemctl status vsftpd -l
vsftpd.service - Vsftpd ftp daemon
   Loaded: loaded (/usr/lib/systemd/system/vsftpd.service; enabled)
   Active: failed (Result: exit-code) since 火 2014-07-29 23:37:42 JST; 16min ago
  Process: 1106 ExecStart=/usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf (code=exited, status=2)

 7月 29 23:37:42 vbox.mk-mode.com systemd[1]: Starting Vsftpd ftp daemon...
 7月 29 23:37:42 vbox.mk-mode.com systemd[1]: vsftpd.service: control process exited, code=exited status=2
 7月 29 23:37:42 vbox.mk-mode.com systemd[1]: Failed to start Vsftpd ftp daemon.
 7月 29 23:37:42 vbox.mk-mode.com systemd[1]: Unit vsftpd.service entered failed state.
```

しかし、マシン起動後に手動でデーモンを起動すると正常に起動する。

そこで、vsftpd の起動を遅らせる方法を考えてみた。  
"/usr/lib/systemd/system/vsftpd.service" 内の `[Unit]` - `After` で何かのサービスの後に起動するように設定してみる。  
試しに MariaDB サービス起動後に vsftpd が起動するよう設定を変更してみたら成功した。（ちなみに FirewallD 起動後に vsftpd が起動するようにした場合は失敗した）

File: `/usr/lib/systemd/system/vsftpd.service`

{% highlight bash linenos %}
[Unit]
Description=Vsftpd ftp daemon
#After=network.target                 # <= コメント化
After=network.target mariadb.service  # <= 追加
{% endhighlight %}

---

以上。

