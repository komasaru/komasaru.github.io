---
layout   : single
title    : "Debian 10 (buster) - Web サーバ Nginx 構築（Nginx 公式リポジトリ使用）！"
published: true
date     : 2019-12-20 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Nginx
---

Debian GNU/Linux 10 (buster) に Web サーバ Nginx を Nginx 公式リポジトリを使用して導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 接続元のマシンは LMDE 3 (Linux Mint Debian Edition 3; 64bit) を想定。
* Debian 公式リポジトリの Nginx はバージョンが古いため、Nginx リポジトリを使用して 1.16.1（当記事執筆時点最新安定版）をインストールする。
* 実際に運用する際は、ドキュメントルートを変更する等、設定を編集すること。
* root ユーザでの作業を想定。

### 1. リポジトリ追加の設定

まず、キー追加。

``` text
# wget http://nginx.org/keys/nginx_signing.key
# apt-key add nginx_signing.key
```

そして、リポジトリ追加の設定を行う。  
実際には、以下を `/etc/apt/sources.list` の最終行に追加するか、以下の内容で `/etc/apt/sources.list.d/nginx.list` なるファイルを作成する。

File: `/etc/apt/sources.list.d/nginx.list`

{% highlight bash %}
deb http://nginx.org/packages/debian/ buster nginx
deb-src http://nginx.org/packages/debian/ buster nginx
{% endhighlight %}

### 2. Nginx のインストール

Apt パッケージリストを更新後、 Nginx をインストールする。

``` text
# apt -y update
# apt -y install nginx
```

### 3. インストールの確認

Nginx がインストールできたか確認してみる。(`-v` の代わりに `-V` オプションを使用すると詳細に表示される）

``` text
# nginx -v
nginx version: nginx/1.16.1
```

### 4. 設定

今回のインストール環境の場合、基本的（グローバル）な設定のファイルは `/etc/nginx/nginx.conf` で、このファイルから `/etc/nginx/conf.d` ディレクトリ配下の設定ファイルを読み込む形式となっている。  
取り急ぎ、デフォルトのままとした。
詳細な設定は、「[当ブログ Nginx 関連の過去記事](https://www.mk-mode.com/blog/tags/nginx/ "Tag: Nginx - mk-mode BLOG")」を参照。

### 5. ファイアウォール(ufw)の設定

TCP ポート 80 を開放する必要がある。（HTTPS の場合は TCP `443`）

``` text
# ufw allow 80/tcp
Rule added

# ufw status
    :
80/tcp                     ALLOW       Anywhere
    :
```

### 6. サーバの起動

``` text
# systemctl start nginx
```

### 7. 起動確認

ブラウザで `http://＜サーバアドレス or ホスト名＞/` にアクセスしてみる。
`Welcome to nginx!` と以下5行くらい表示されば成功。

### 8. 自動起動の設定

マシン起動時に自動で Nginx を起動させるには以下のようにする。（インストール直後は自動起動するようになっているが）

``` text
# systemctl enable nginx
nginx.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable nginx

# systemctl is-enabled nginx
nginx.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install is-enabled nginx
enabled
```

（`nginx` はネイティブなサービスでないため、 `systemd-sysv-install` にリダイレクトされる）


自動起動しないようにするには、

``` text
 systemctl disable nginx
nginx.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install disable nginx
insserv: warning: current start runlevel(s) (empty) of script `nginx' overrides LSB defaults (2 3 4 5).
insserv: warning: current stop runlevel(s) (0 1 2 3 4 5 6) of script `nginx' overrides LSB defaults (0 1 6).

# systemctl is-enabled nginx
nginx.service is not a native service, redirecting to systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install is-enabled nginx
disabled
```

### 9. 参考サイト

* [nginx: Linux packages](http://nginx.org/en/linux_packages.html "nginx: Linux packages")

---

以上。

