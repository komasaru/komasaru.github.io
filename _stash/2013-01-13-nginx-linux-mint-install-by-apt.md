---
layout   : single
title    : "Nginx - Linux Mint にインストール（パッケージ使用）！"
published: true
date     : 2013-01-13 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
---

Linux Mint に軽量 Web サーバ  Nginx をインストールする手順についてです。  
（Debian, Ubuntu 等 GNU 系ディストリビューションは同様だと思う）

GNU 系 Linux ディストリビューションに Nginx をインストールするには、

- apt (`apt-get`, `aptitude`) でインストールする。（Synaptic パッケージマネージャも同じ）
- deb パッケージでインストールする。
- ソースをビルドしてインストールする。

方法がありますが、今回は単純に apt でのインストールをしてみました。

<!--more-->
ちなみに、当記事執筆時点では以下のような状況。

- apt では 1.1.19 が最新。
- 安定版ソースは 1.2.6 が最新。
- 開発版ソースは 1.3.9 が最新。

### 0. 前提条件

- Linux Mint 13 Maya (64bit) での作業を想定。

### 1. Nginx インストール

Synaptic パッケージマネージャか `apt-get` 等でインストールする。  
`apt-get` なら以下の通り。

``` bash 
$ sudo apt-get nginx
```

### 2. インストール確認

インストールできているかバージョンを表示して確認する。

``` bash 
$ nginx -v
nginx version: nginx/1.1.19
```

`configure` オプションの状況も確認するなら `-V` オプションを使用する。

### 3. Nginx 起動

Nginx の起動は以下のようにする。

``` bash 
$ sudo service nginx start
Starting nginx: nginx.
```

よくあるサービスの起動方法と同じ。停止は `stop`、再起動は `restart`、リロードは `reload` 等。

### 4. 起動確認

ブラウザで `http://127.0.0.1/` にアクセスして以下のような画面が表示されれば、インストールに成功している。

![NGIXN_1]({{site.baseurl}}/images/2013/01/13/NGINX_1.png "NGINX_1")

### 5. 設定

Nginx を apt でインストールすると、設定ファイルは `/etc/nginx/` ディレクトリ配下にある。  
Nginx の全体的（グローバル）な設定は `/etc/nginx/nginx.conf` で行い、追加の設定は `/etc/nginx/conf.d/` ディレクトリ配下へ設定ファイルを置く。  
バーチャルホストの設定は `/etc/nginx/sites-available` ディレクトリ配下へ設定ファイルを置き、`/etc/nginx/sites-enabled` ディレクトリへリンクを貼る。  
`/etc/nginx/nginx.conf` ファイルが `/etc/nginx/conf.d/`, `/etc/nginx/sites-enabled` ディレクトリ配下のファイルを取り込む形となっている。（今回は設定については説明しません）

### 6. 自動起動設定

サーバ起動時に自動で Nginx を起動させるなら以下のようにすれば良いようだ。  
（今回、当方はローカル環境での作業なので、自動起動の設定はしていない。）

``` bash 
$ sudo update-rc.d nginx defaults
```

### 7. 参考サイト

- [Nginx](http://wiki.nginx.org/Main "Nginx")
- [nginx](http://nginx.org/ja/ "nginx")

---

これで、ローカル環境（GNU ディストリビューション）では、軽量 Web サーバ Nginx が使用できるようになりました。  
しかし、外部公開するには、デフォルトのままでは脆弱すぎるので、セキュリティ面等でまだまだ設定が必要です。  
外部公開 Web サーバとして使用するにはまだまだ時間がかかりそうです。

以上。

