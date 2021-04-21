---
layout   : single
title    : "Nginx - Linux Mint 13 へ最新をインストール（パッケージ使用）！"
published: true
date     : 2014-02-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- LinuxMint
- Nginx
---

これまで Linux Mint 上で Web(Reverse Proxy) サーバ Nginx をソースをビルドしてインストールしたり、標準リポジトリからパッケージインストールしたりしてきました。

- [Nginx - Linux Mint にインストール（ソースビルド）！]({{site.baseurl}}/2013/01/14/nginx-linux-mint-install-by-src/ "Nginx - Linux Mint にインストール（ソースビルド）！")
- [Nginx - Linux Mint にインストール（パッケージ使用）！]({{site.baseurl}}/2013/01/13/nginx-linux-mint-install-by-apt/ "Nginx - Linux Mint にインストール（パッケージ使用）！")

今回はパッケージでインストールするのですが、標準リポジトリではなく Nginx リポジトリを使用してインストールしてみます。

<!--more-->

### 0. 前提条件

- Linux Mint 13(Maya, 64bit) での作業を想定。
- Nginx 1.4.5 をインスールする。
- サービス管理ソフト `sysv-rc-conf` コマンドインストール済み。（`update-rc.d` コマンドは今は非推奨）

### 1. 公開鍵登録

``` text
$ wget http://nginx.org/keys/nginx_signing.key
$ sudo apt-key add nginx_signing.key
```

### 2. sources.list 編集

File: `/etc/apt/sources.list`

{% highlight text linenos %}
deb http://nginx.org/packages/ubuntu/ precise nginx
deb-src http://nginx.org/packages/ubuntu/ precise nginx
{% endhighlight %}

`precise` は Linux Mint 13(Maya) の場合であり、14(Nadia) なら `quantal`、15(Olivia) なら `raring`、16(Petra) なら `saucy` である。

### 3. パッケージリスト更新

``` text
$ sudo apt-get update
```

### 4. Nginx インストール

``` text
$ sudo apt-get install nginx
```

### 5. インストール確認

``` text
$ nginx -v
nginx version: nginx/1.4.5
```

`-V` オプションで `configure` オプションも確認可能。

### 6. 起動

``` text
$ sudo /etc/init.d/nginx start
```

### 7. 動作確認

Web ブラウザで `http://127.0.0.1/` にアクセスしてみる。特に設定を変更していなければ Nginx の初期画面が表示されるはずである。

### 8. 自動起動設定

インストール直後は、マシン起動時に自動で Nginx が起動するようになっている。

``` text
$ sudo sysv-rc-conf --list | grep nginx
nginx        0:off      1:off   2:on    3:on    4:on    5:on    6:off
```

自動起動してもよいのなら設定を変更する必要はないが、自動起動させたくないのなら以下のようにする。

``` text
$ sudo sysv-rc-conf nginx off
$ sudo sysv-rc-conf --list | grep nginx
nginx        0:off      1:off   2:off   3:off   4:off   5:off   6:off
```

### 参考サイト

- [nginx: Linux packages](http://nginx.org/en/linux_packages.html "nginx: Linux packages")

---

当然、パッケージでインストールした場合は、ソースをビルド（オプションを詳細に設定）してインストールした場合と比べると、不要な機能までもまとめてインストールされてしまう。

使用する環境や好みの問題なので、ここでは多くは語りません。

以上。

