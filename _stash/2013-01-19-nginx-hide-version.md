---
layout   : single
title    : "Nginx - バージョン情報隠蔽！"
published: true
date     : 2013-01-19 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
---

Web サーバのバージョン情報を公開するのはセキュリティ上よろしくないので、Nginx のバージョン情報を隠蔽する。

ソースをビルドしてインストールする方法・基本設定については過去記事を参照。

- [Nginx - Linux Mint にインストール（ソースビルド）！]({{site.baseurl}}/2013/01/14/nginx-linux-mint-install-by-src "Nginx - Linux Mint にインストール（ソースビルド）！")
- [Nginx - 基本的な設定！]({{site.baseurl}}/2013/01/15/nginx-setting "Nginx - 基本的な設定！")

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- Nginx 1.2.6 がソースビルドによりインストール済み。
- パッケージを利用してインストールした Nginx とはディレクトリ構成等が若干異なる。
  （別途作成したヴァーチャルホストの設定ファイルを取り込む形式になっていたり・・・）

### 1. HTTP レスポンスヘッダ確認

現状の HTTP レスポンスヘッダを `curl` で確認してみる。  
`Server: nginx/1.1.19` とバージョン情報が取得できてしまう。

``` bash 
$ curl -I http://localhost
HTTP/1.1 200 OK
Server: nginx/1.2.6
Date: Sat, 29 Dec 2012 04:45:55 GMT
Content-Type: text/html
Content-Length: 177
Last-Modified: Wed, 24 Oct 2012 01:13:33 GMT
Connection: keep-alive
Accept-Ranges: bytes
```

### 2. Nginx 設定編集

Nginx の設定ファイル `/usr/local/nginx/conf/nginx.conf` の `http` ディレクティブに以下のように記述を追加する。  
実際には、デフォルトでコメントアウトされているので、コメント解除するだけ。

File: `/etc/nginx/nginx.conf`

{% highlight bash linenos %}
http {
  :
  server_tokens off;  # <= 追加
  :
}
{% endhighlight %}

### 3. 設定リロード

設定を有効化するためにリロードする。

``` bash 
$ sudo service nginx reload
```

### 4. HTTP レスポンスヘッダ再確認

現状の HTTP レスポンスヘッダを `curl` で確認してみる。  
`Server: nginx` とバージョン情報が表示されなくなった。

``` bash 
$ curl -I http://localhost
HTTP/1.1 200 OK
Server: nginx
Date: Sat, 29 Dec 2012 04:50:13 GMT
Content-Type: text/html
Content-Length: 177
Last-Modified: Wed, 24 Oct 2012 01:13:33 GMT
Connection: keep-alive
Accept-Ranges: bytes
```

---

これで、バージョン情報を隠蔽することが出来ました。

以上。

