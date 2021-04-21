---
layout   : single
title    : "Debian 7 Wheezy - Web サーバ Apache2 インストール！"
published: true
date     : 2013-11-08 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Apache
---

Debian GNU/Linux 7 Wheezy サーバに Web サーバ Apache2 を構築する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。

<!--more-->

### 0. 前提条件

- Debian GNU/Linux 7.1.0 での作業を想定。
- 別の Web サーバ（Nginx 等）がインストール済みなら停止しておくこと。  
  （ポートを別途設定しているのあれば、停止しなくてもよい）

### 1. Apache2 インストール

Apache2 を以下のようにしてインストールする。

``` text 
# aptitude -y install apache2
```

### 2. 設定ファイル編集

設定ファイル "sites-available/default" を以下のように編集する。

File: `/etc/apache2/sites-available/default`

{% highlight bash linenos %} 
ServerAdmin webmaster@mk-mode.com  # <= 管理者メールアドレスを変更

ServerName www.mk-mode.com         # <= Webサーバ名を追加

AllowOverride All                  # <= .htaccessを許可（"/var/www" の設定内）
{% endhighlight %}

設定ファイル "mods-enabled/dir.conf" を以下のように編集する。

File: `/etc/apache2/mods-enabled/dir.conf`

{% highlight bash linenos %} 
DirectoryIndex index.html index.htm index.php  # <= ディレクトリ名のみでアクセスできるファイル名（今後のために "index.php" も追加している）
{% endhighlight %}

設定ファイル "conf.d/security" を以下のように編集する。

File: `/etc/apache2/conf.d/security`

{% highlight bash linenos %} 
ServerTokens Prod    # <= エラーページ等でOS名を非表示

ServerSignature Off  # <= エラーページでサーバー情報を非表示
{% endhighlight %}

### 3. Apache2 再起動

設定を有効にするため、Apache2 を再起動する。

``` text 
# /etc/init.d/apache2 restart
Restarting web server: apache2 ... waiting .
```

### 4. 動作確認

ブラウザで `http://＜Webサーバのホスト名 or IP アドレス＞/` にアクセスして以下のように表示されれば成功である。

![DEBIAN_APACHE2]({{site.baseurl}}/images/2013/11/08/DEBIAN_APACHE2.png "DEBIAN_APACHE2")

---

以上。

