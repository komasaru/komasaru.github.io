---
layout   : single
title    : "Nginx - Gzip 圧縮！"
published: true
date     : 2013-01-18 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- LinuxMint
- Nginx
---

軽量 Web サーバ  Nginx での Gzip 圧縮の設定についてです。  
（Debian, Ubuntu 等 GNU 系ディストリビューションは同様だと思う）

Web サーバでの Gzip 圧縮とは、要求した側にデータを返却する際にサーバ側で Gzip 圧縮して容量を小さくし高速化することです。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit) での作業を想定。
- Nginx 1.2.6 がソースビルドによりインストール済み。
- パッケージを利用してインストールした Nginx とはディレクトリ構成等が若干異なるが、Gzip 圧縮の設定については同じ。

### 1. 設定

取り急ぎ、設定ファイル（当方は `/usr/local/nginx/conf/nginx.conf`）の http ディレクティブ内に以下のような記述を追加してみた。

File: `/usr/local/nginx/conf/nginx.conf`

{% highlight bash linenos %}
http {

    :

    gzip              on;
    gzip_http_version 1.0;
    gzip_types        text/plain
                      text/xml
                      text/css
                      application/xml
                      application/xhtml+xml
                      application/rss+xml
                      application/atom_xml
                      application/javascript
                      application/x-javascript
                      application/x-httpd-php;
    gzip_disable      "MSIE [1-6]\.";
    gzip_disable      "Mozilla/4";
    gzip_comp_level   1;
    gzip_buffers      4 8k;
    gzip_min_length   1100;

    :

}
{% endhighlight %}

### 2. 各項目の説明

各設定項目については、以下のとおり。

- gzip on  
  ... gzip を使用する宣言
- gzip_http_version  
  ... gzip を使用する際の HTTP バージョン（1.0 にしておけば、1.1 でも有効化される）
- gzip_types  
  ... gzip 圧縮する対象のファイル形式を mime タイプで指定。（`text/html` は Nginx がデフォルトで Gzip 圧縮しているので不要）
- gzip_disable  
  ... gzip 圧縮しないブラウザを指定。（今回は MicroSoft IE Ver.1 - 6 と Firefox Ver.4 を設定）
- gzip_comp_level  
  ... gzip 圧縮レベルを設定（0-9）（0は非圧縮, 1以上にしても圧縮率の変化は少ない）
- gzip_buffers  
  ... gzip 圧縮で使用するバッファサイズを設定。（`4 8k` は 4 x 8k = 32k という意味）
- gzip_min_length  
  ... gzip 圧縮の対象とする最小ファイルサイズ（単位：byte）を設定

### 3. ログ出力設定

Ngix のアクセスログに Gzip 圧縮率も出力するように設定ファイル（今回の場合 `/usr/local/nginx/conf/nginx.conf`）を編集する。  
（`log_foamrt` のサイトに `"$gzip_ratio"` を追加）

File: `/usr/local/nginx/conf/nginx.conf``

{% highlight bash linenos %}
http {

    :

    log_format combined '$remote_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        '"$http_referer" "$http_user_agent" "$gzip_ratio"';

    :

}
{% endhighlight %}

### 4. Nginx リロード

設定を有効化させるために Nginx をリロードする。（未起動なら起動する）

``` bash 
$ sudo service nginx reload
```

### 5. 確認

何か作業（サーバへアクセス）してみて、アクセスログファイルを確認してみる。

File: `/var/log/nginx/access.log`

{% highlight bash linenos %}
$ cat /var/log/nginx/access.log
{% endhighlight %}

設定した通りのフォーマットで記録されている。

### 6. 参考サイト

- [apache のかわりにnginxを使ってみる(6) nginx でgzipを使うには | レンタルサーバー・自宅サーバー設定・構築のヒント](http://server-setting.info/centos/apache-nginx-6-gzip-use.html "apache のかわりにnginxを使ってみる(6) nginx でgzipを使うには | レンタルサーバー・自宅サーバー設定・構築のヒント")

---

これで、Nginx で Gzip 圧縮できるようになりました。

以上。

