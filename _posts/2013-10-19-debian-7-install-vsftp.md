---
layout   : single
title    : "Debian 7 Wheezy - FTP サーバ構築！"
published: true
date     : 2013-10-19 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- FTP
---

Debian GNU/Linux 7.1.0 サーバに FTP サーバ vsftpd を構築する方法についての記録です。  
FTP サーバは世の中に pro-FTPD, pure-FTPd 等色々とありますが、使い慣れた vsftpd で FTP サーバを構築します。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 接続元のマシンは Linux Mint 14(64bit) を想定。
- 接続テストでは FileZilla という FTP クライアントを使用する。

### 1. vsftpd インストール

FTP サーバの vsftpd を以下のようにしてインストールする。

``` text 
# aptitude -y install vsftpd
```

### 2. vsftpd 設定ファイル編集

以下のように設定を編集する。

File: `/etc/vsftpd.conf`

{% highlight bash linenos %} 
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
{% endhighlight %}

### 3. ホームディレクトリより上層へのアクセス許可設定

ホームディレクトリより上層へのアクセスを許可するユーザのリストを作成する。（上記設定ファイル内の "/etc/vsftpd.chroot_list" のこと）  
指定は、１行に１ユーザ。

File: `/etc/vsftpd.chroot_list`

{% highlight bash linenos %} 
masaru
{% endhighlight %}

### 4. SSL サーバ構築

vsftpd を SSL/TLS で使用できるようにするには SSL サーバが必要であるので、OpenSSL をインストールする。

``` text 
# aptitude -y install openssl
```

### 5. サーバ証明書作成

vsftpd を SSL/TLS で使用できるようサーバ証明書を作成する。

``` text 
# cd /etc/ssl/private
# openssl req -x509 -nodes -newkey rsa:1024 -keyout /etc/ssl/private/vsftpd.pem -out /etc/ssl/private/vsftpd.pem
Generating a 1024 bit RSA private key
.......++++++
................++++++
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

### 6. vsftpd 設定ファイル編集

サーバ証明書を使用できるよう vsftpd 設定ファイルを以下のように編集する。（最終行に追加する）

File: `/etc/vsftpd.conf`

{% highlight bash linenos %} 
ssl_enable=YES              # <= SSL有効化
force_local_data_ssl=YES    # <= SSL必須にする
force_local_logins_ssl=YES  # <= SSL必須にする
{% endhighlight %}

### 7. vsftpd 再起動

設定を有効化するために、vsftpd を再起動する。

``` text 
# /etc/init.d/vsftpd restart
Stopping FTP server: vsftpd.
Starting FTP server: vsftpd.
```

### 8. ファイアウォール（iptables）設定

外部に公開する場合は、ポートを開放する必要がある。

File: `/etc/iptables/rules.v4`

{% highlight bash linenos %} 
# 外部からのTCP21番ポート(FTP)へのアクセスを許可
-A INPUT -p tcp --dport 21 -j ACCEPT
{% endhighlight %}

そして、設定を反映させるために iptables-persistent を再起動する。

``` text 
# /etc/init.d/iptables-persistent restart
Loading iptables rules... IPv4... skipping IPv6 (no rules to load)...done.
```

### 9. 動作確認

クライアント側から FTP クライアント等を使用して FTP サーバにアクセスしてみる。  
以下は、 FileZilla での設定例である。（最低限これだけで良いはず）

![FILEZILLA_1]({{site.baseurl}}/images/2013/10/19/FILEZILLA_1.png "FILAZILLA設定例")

「接続」ボタンクリックで、「パスーワード入力」、「鍵認証」を経てログインできるはず。

![FILEZILLA_2]({{site.baseurl}}/images/2013/10/19/FILEZILLA_2.png "FILAZILLAパスワード入力")
![FILEZILLA_3]({{site.baseurl}}/images/2013/10/19/FILEZILLA_3.png "FILAZILLA鍵認証")
![FILEZILLA_4]({{site.baseurl}}/images/2013/10/19/FILEZILLA_4.png "FILAZILLAログイン成功")

あとは、ファイルをアップロードしたりダウンロードしたりしてみる。

---

以上。

