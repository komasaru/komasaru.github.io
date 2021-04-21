---
layout   : single
title    : "CentOS 6.5 - ユーザ管理ツール（Usermin）導入！"
published: true
date     : 2014-01-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

前回は CentOS 6.5 サーバ上で PHP と Web サーバ Nginx の連携を行いました。  
今回はユーザ管理ツール Usermin の導入を行います。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- メールサーバ構築済みであること。
- Web サーバは Apache ではなく Nginx を想定。
- [CentOS 6.5 - 初期設定！]({{site.baseurl}}/2013/12/13/centos-6-5-first-setting "CentOS 6.5 - 初期設定！") 内のとおり RPMforge リポジトリの導入を行なっている。
- Usermin 1.550 をインストールする。
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参考にしている。  
  （実際は、過去にこのサイトを参考にして作業した際に記録していたものを参照している）

### 1. Perl - Net::SSLeay モジュールインストール

RPMforge リポジトリから Perl の Net::SSLeay モジュールをインストールする。

``` text
# yum --enablerepo=rpmforge -y install perl-Net-SSLeay
```

### 2. Perl - Authen::PAM モジュールインストール

RPMforge リポジトリから Perl の Authen::PAM モジュールをインストールする。

``` text
# yum --enablerepo=rpmforge -y install perl-Authen-PAM
```

### 3. GPG キーインポート

公開鍵 GPG(GNU Privacy Guard) キーが必要なのでインポートする。

``` text
# rpm --import http://www.webmin.com/jcameron-key.asc
```

### 4. Usermin パッケージダウンロード

``` text
# wget http://prdownloads.sourceforge.net/webadmin/usermin-1.550-1.noarch.rpm
```

### 5. Userminインストール

``` text
# rpm -Uvh usermin-1.550-1.noarch.rpm
```

### 6. 後始末

``` text
# rm -f usermin-1.550-1.noarch.rpm
```

### 7. Usermin 設定ファイル config 編集

File: `/etc/usermin/config`

{% highlight bash linenos %}
lang=ja_JP.euc  # <= 最終行に追加（日本語化）
{% endhighlight %}

### 8. Usermin 設定ファイル miniserv.conf

File: `/etc/usermin/miniserv.conf`

{% highlight bash linenos %}
denyusers=root  # <= 最終行へ追加（root でのログイン拒否）
{% endhighlight %}

### 9. Usermin 実行機能編集

File: `/etc/usermin/webmin.acl`

{% highlight bash linenos %}
#user: at changepass chfn commands cron cshrc fetchmail file forward gnupg htaccess-htpasswd htaccess language mailbox man mysql plan postgresql proc procmail quota shell spam ssh telnet theme tunnel updown usermount  # <= コメント化
user: changepass forward       # <= 追加（パスワード変更とメール転送設定のみ実行可能）
{% endhighlight %}

### 10. Usermin 再起動

当然、未起動なら `start` でよい。

``` text
# /etc/rc.d/init.d/usermin restart
Stopping Usermin server in /usr/libexec/usermin
Starting Usermin server in /usr/libexec/usermin
```

### 11. サーバー証明書設定

SSLアクセスに必要なサーバー証明書を、Nginx 用のサーバー証明書から作成する。（念の為、デフォルトの Usermin 用サーバ証明書は退避しておく）

``` text
# mv /etc/usermin/miniserv.pem /etc/usermin/miniserv.pem.org

# cat /etc/pki/tls/certs/server.crt /etc/pki/tls/certs/server.key > /etc/usermin/miniserv.pem
```

### 12. Usermin 再起動

``` text
# /etc/rc.d/init.d/usermin restart
Stopping Usermin server in /usr/libexec/usermin
Starting Usermin server in /usr/libexec/usermin
```

### 13. 動作確認

ブラウザで `https:/＜サーバ名＞:20000/` にアクセス＆ HTTPS 認証し、`root` でアクセスできないこと、一般ユーザでログインできて各種設定が正常に動作することなどを確認する。

![CENTOS_6-5_USERMIN_1]({{site.baseurl}}/images/2014/01/21/CENTOS_6-5_USERMIN_1.png "CENTOS_6-5_USERMIN_1")
![CENTOS_6-5_USERMIN_2]({{site.baseurl}}/images/2014/01/21/CENTOS_6-5_USERMIN_2.png "CENTOS_6-5_USERMIN_2")

### 参考サイト

- [CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")

---

次回は、ユーザ管理ツール Usermin でメール自動返信ツール Vacation を利用する方法について紹介する予定です。

以上。

