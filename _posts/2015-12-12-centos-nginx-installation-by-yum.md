---
layout   : single
title    : "CentOS - Web/Proxy サーバ Nginx の最新版を yum インストール！"
published: true
date     : 2015-12-12 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---

Debian GNU/Linux や Linux Mint への公式 Apt を使用した Nginx のインストールは記録として残していましたが、 CentOS への公式 yum を使用したインストールについて記録として残してなかったので、今回記録しておくことにしました。

<!--more-->

### 0. 前提条件

* CentOS 7.1-1503(x86_64) での作業を想定。（CentOS 6 系、5系でも同様（起動方法、自動起動設定、ファイアウォール設定以外は））

### 1. yum リポジトリの登録

``` text
# rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
```

以下のようなリポジトリ設定ファイルが作成される。  
（上記を実行せず、直接以下のようなファイルを作成してもよい）

File: `/etc/yum.repos.d/nginx.repo`

{% highlight bash linenos %}
# nginx.repo

[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/OS/OSRELEASE/$basearch/
gpgcheck=0
enabled=1
{% endhighlight %}

### 2. Nginx のインストール

``` text
# yum -y install nginx
```

### 3. Ngins インストールの確認

``` text
# nginx -v
nginx version: nginx/1.8.0
```

### 4. Nginx 設定ファイルの編集

Nginx 設定ファイルが "/etc/nginx" ディレクトリ内にあるので、必要に応じて編集する。  
（取り急ぎ、今回は編集しない）

### 5. Nginx の起動

``` text
# systemctl start nginx
```

### 6. Nginx 自動起動の設定

マシン起動時に Nginx が自動で起動するようにしたければ以下のようにする。

``` text
# systemctl enable nginx
systemctl list-unit-files -t service | grep nginx

# systemctl list-unit-files -t service | grep nginx
nginx.service                             enabled  # <= enabled であることを確認
```

### 7. ファイアウォールの設定

``` text
# firewall-cmd --add-service=http
success
# firewall-cmd --add-service=http --permanent
success
# firewall-cmd --list-services
dhcpv6-client dns ftp http nfs pop3s smtp ssh
```

### 8. 動作確認

ブラウザで `http://＜サーバ名＞/` にアクセスしてみ "Welcome to nginx! ..." と表示されればよい。

### 9. 参考サイト

* [nginx - Linux packages](http://nginx.org/en/linux_packages.html "nginx - Linux packages")

---

以上。

