---
layout   : single
title    : "CentOS 7.0 - ユーザ管理ツール Usermin 導入！"
published: true
date     : 2014-09-16 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

「CentOS 7.0 - ユーザ管理ツール Usermin 導入」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- メールサーバ構築済みであること。
- Web サーバは Apache ではなく Nginx を想定。
- Usermin 1.600 をインストールする。
- RPMforge, EPEL リポジトリ導入済み。（[CentOS 7.0 - リポジトリ追加]( "CentOS 7.0 - リポジトリ追加")）
- 主に「[CentOSで自宅サーバー構築](http://centossrv.com/ "CentOSで自宅サーバー構築")」を参照。

### 1. Perl - Net::SSLeay, Authen::PAM モジュールインストール

ベースリポジトリ存在しなければ別のリポジトリからインストールされる。

``` text
# yum -y install perl-Net-SSLeay perl-Authen-PAM
```

### 2. GPG キーインポート

``` text
# rpm --import http://www.webmin.com/jcameron-key.asc
```

### 3. Usermin パッケージダウンロード

``` text
# wget http://prdownloads.sourceforge.net/webadmin/usermin-1.600-1.noarch.rpm
```

### 4. Userminインストール

``` text
# rpm -Uvh usermin-1.600-1.noarch.rpm
```

### 5. 後始末

``` text
# rm -f usermin-1.600-1.noarch.rpm
```

### 6. Usermin 設定ファイル config 編集

File: `/etc/usermin/config`

{% highlight bash linenos %}
#lang=en.UTF-8  # <= コメント化
lang=ja_JP.euc  # <= 追加（日本語化）
{% endhighlight %}

### 7. Usermin 設定ファイル miniserv.conf

File: `/etc/usermin/miniserv.conf`

{% highlight bash linenos %}
denyusers=root  # <= 最終行へ追加（root でのログイン拒否）
{% endhighlight %}

### 8. Usermin 実行機能編集

File: `/etc/usermin/webmin.acl`

{% highlight bash linenos %}
#user: at changepass chfn commands cron cshrc fetchmail file filter forward
gnupg htaccess-htpasswd htaccess language mailbox mailcap man mysql plan
postgresql proc procmail quota schedule shell spam ssh telnet theme tunnel
updown usermount          # <= コメント化
user: changepass forward  # <= 追加（パスワード変更とメール転送設定のみ実行可能）
{% endhighlight %}

### 9. サーバー証明書設定

SSLアクセスに必要なサーバー証明書を、Nginx 用のサーバー証明書から作成する。（念の為、デフォルトの Usermin 用サーバ証明書は退避しておく）

``` text
# mv /etc/usermin/miniserv.pem /etc/usermin/miniserv.pem.org
# cat /etc/pki/tls/certs/server.crt /etc/pki/tls/certs/server.key > /etc/usermin/miniserv.pem
```

### 10. Usermin 再起動

``` text
# systemctl restart usermin
```

### 11. ファイアウォール設定

ポート TCP:2000 を開放する。

``` text
# firewall-cmd --add-port=20000/tcp
success
# firewall-cmd --add-port=20000/tcp --permanent
success
# firewall-cmd --list-ports
110/tcp 465/tcp 4000-4005/tcp 443/tcp 873/tcp 20000/tcp
```

### 12. 動作確認

ブラウザで `https:/＜サーバ名＞:20000/` にアクセス＆ HTTPS 認証（ブラウザにより方法は異なる）し、`root` でアクセスできないこと、一般ユーザでログインできて各種設定が正常に動作することなどを確認する。

![CENTOS_7-0_USERMIN_1]({{site.baseurl}}/images/2014/09/16/CENTOS_7-0_USERMIN_1.png "CENTOS_7-0_USERMIN_1")

![CENTOS_7-0_USERMIN_2]({{site.baseurl}}/images/2014/09/16/CENTOS_7-0_USERMIN_2.png "CENTOS_7-0_USERMIN_2")

---

以上。

