---
layout   : single
title    : "Debian 10 (buster) - FTP サーバ構築！"
published: true
date     : 2019-11-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- FTP
---

Debian GNU/Linux 10 (buster) に FTP サーバを構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 接続元のマシンは LMDE 3(Linux Mint Debian Edition3)(64bit) を想定。
* 接続テストでは FileZilla という FTP クライアントを使用する。
* root ユーザでの作業を想定。

### 1. vsftpd のインストール

``` text
# apt -y install vsftpd
```

### 2. vsftpd 設定ファイルの編集

File: `/etc/vsftpd.conf`

{% highlight bash %}
# anonymous によるログインを無効化
anonymous_enable=NO

# ローカルアクセスの許可
local_enable=YES

# 書き込み許可
write_enable=YES

# アスキーモードでの転送を許可
ascii_upload_enable=YES
ascii_download_enable=YES

# chroot 有効化
chroot_local_user=YES

# chroot リスト有効化
chroot_list_enable=YES

# chrootリスト指定
chroot_list_file=/etc/vsftpd.chroot_list

# ディレクトリごと一括での転送を有効化
ls_recurse_enable=YES

# chroot のルートディレクトリ指定 ( 最終行に追加 )
# ( 指定しない場合はユーザーのホームディレクトリ直下 )
# public_htmlを指定した場合で、且つ当該ディレクトリがないとログインできないので注意
local_root=public_html
{% endhighlight %}

### 3. ホームディレクトリより上層へのアクセス許可設定

ホームディレクトリより上層へのアクセスを許可するユーザのリストを作成する。（上記設定ファイル内の "/etc/vsftpd.chroot_list" のこと）  
指定は、１行に１ユーザ。

File: `/etc/vsftpd.chroot_list`

{% highlight bash %}
masaru
{% endhighlight %}

### 4. SSL サーバの構築

vsftpd を SSL/TLS で使用できるようにするには SSL サーバが必要であるので、未インストールなら OpenSSL をインストールする。

``` text
# apt -y install openssl
```

### 5. サーバ証明書の作成

vsftpd を SSL/TLS で使用できるようサーバ証明書を作成する。

``` text
# cd /etc/ssl/private
# openssl req -x509 -nodes -newkey rsa:2048 -keyout /etc/ssl/private/vsftpd.pem -out /etc/ssl/private/vsftpd.pem
Generating a 2048 bit RSA private key
.............................................................................+++
....................................................................+++
writing new private key to '/etc/ssl/private/vsftpd.pem'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:JP                                    # <= 国の略名
State or Province Name (full name) [Some-State]:Shimane                 # <= 都道府県名
Locality Name (eg, city) []:Matsue                                      # <= 市区町村名
Organization Name (eg, company) [Internet Widgits Pty Ltd]:mk-mode.com  # <= サイト名（何でもよい）
Organizational Unit Name (eg, section) []:                              # <= 部署名（空でよい）
Common Name (e.g. server FQDN or YOUR name) []:ftp.mk-mode.com          # <= ホスト名
Email Address []:root@mk-mode.com                                       # <= 管理者メールアドレス
```

作成したサーバ証明書のパーミッションを設定する。（所有者読み込み専用に）

``` text
# chmod 400 vsftpd.pem
```

### 6. vsftpd 設定ファイルの編集

サーバ証明書を使用できるよう vsftpd 設定ファイルを以下のように編集する。（最終行に追加）

File: `/etc/vsftpd.conf`

{% highlight bash %}
ssl_enable=YES              # SSL有効化
force_local_data_ssl=YES    # SSL必須にする
force_local_logins_ssl=YES  # SSL必須にする
ssl_ciphers=HIGH            # 追加（FTP クライアント FileZilla に対応するため）
{% endhighlight %}

### 7. vsftpd の再起動

設定を有効化するために、vsftpd を再起動する。

``` text
# systemctl restart vsftpd
```

### 8. ファイアウォール (ufw) の設定

外部に公開する場合は、TCP ポート 21(FTP) へのアクセスを許可する必要がある。

``` text
# ufw allow 21/tcp
Rule added

# ufw status
Status: active

To                         Action      From
--                         ------      ----
9999/tcp                   ALLOW       192.168.11.0/24
53                         ALLOW       Anywhere
21/tcp                     ALLOW       Anywhere
```

### 9. 動作確認

クライアント側からコマンドラインや FTP クライアントでサーバに接続して、アップロード・ダウンロード等各種操作が可能かチェックする。  
FTP クライアント FileZilla なら以下のように設定してログイン。

* ホスト：サーバホスト名 or サーバ IP アドレス
* プロトコル：「FTP - ファイル転送プロトコル」
* 暗号化：「明示的な FTP over TLS が必要」
* ログオンの種類：「通常」 or 「パスワードを尋ねる」
* ユーザ：ユーザ名
* 転送モード：「アクティブ」

### 10. 自動起動の設定

vsftpd インストール直後はマシン起動時に自動で vsftpd が起動するようになっている。

自動起動しないように設定するなら以下のようにする。

``` text
# systemctl disable vsftpd
Synchronizing state of vsftpd.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install disable vsftpd
insserv: warning: current start runlevel(s) (empty) of script `vsftpd' overrides LSB defaults (2 3 4 5).
insserv: warning: current stop runlevel(s) (0 1 2 3 4 5 6) of script `vsftpd' overrides LSB defaults (0 1 6).

# systemctl is-enabled vsftpd
disabled  # <= disabled であることを確認
```

逆に自動起動するように設定するなら以下のようにする。

``` text
# systemctl enable vsftpd
Synchronizing state of vsftpd.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable vsftpd
insserv: warning: current start runlevel(s) (empty) of script `vsftpd' overrides LSB defaults (2 3 4 5).
insserv: warning: current stop runlevel(s) (0 1 2 3 4 5 6) of script `vsftpd' overrides LSB defaults (0 1 6).

# systemctl is-enabled vsftpd
enabled  # <= enabled であることを確認
```

---

以上。

