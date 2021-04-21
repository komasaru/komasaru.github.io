---
layout   : single
title    : "Linux - FTP サーバとローカルでディレクトリ同期！"
published: true
date     : 2018-08-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- FTP
---

FTP サーバ上のディレクトリとローカルマシン上のディレクトリを同期する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2(Linux Mint Debian Edition 2), または、 Debian GNU/Linux 9.5 での作業を想定。
* FTP サーバとの同期には lftp コマンドを使用する。
* インタラクティブな処理ではなく、自動で一括して処理できるようスクリプトファイルを使用する。

### 1. lftp コマンドのインストール

`lftp` コマンドを使用するので、未インストールならインストールする。

``` text
$ sudo apt install lftp
```

### 2. FTP スクリプトファイルの作成

FTP 処理を行うスクリプトファイルを作成する。（以下は IERS（国際地球回転観測事業）から EOP データ（地球回転パラメータ）を取得する例）

File: `lftp_bulletin_b.txt`

{% highlight text linenos %}
open ftp://ftp.iers.org/products/eop/bulletinb
mirror -e -n -x metadata       iau1980     file/bulletin_b_iau1980
mirror -e -n -x metadata       iau2000     file/bulletin_b_iau2000
mirror -e -n -x 'metadata|xml' format_2009 file/bulletin_b_format_2009
close
quit
{% endhighlight %}

* `open site` で接続先 URL を指定して FTP 接続を確立する。
  + ユーザ名やパスワードを指定する必要があれば、 `-u user[,pass]` で指定する。
  + ポートを指定する必要があれば、 `-p port` で指定する。
* `mirror [OPTS] [source [target]]` で同期する。
  + `-e` は同期元が削除されれば同期先も削除するオプション。（`--delete` と同じ）
  + `-n` は新しいファイルのみ処理するオプション。（`--only-newer` と同じ）
  + `-x RX` は同期を除外するファイル／ディレクトリを指定するオプション。（`--exclude=RX` と同じ。`RX` は拡張正規表現で指定）
* `close` で FTP 接続を閉じる。
* `quit` で処理終了。
* その他、多数のオプションあり。後述の参考サイト等で確認すること。

### 3. 同期の開始

コマンドラインで FTP スクリプトファイルを指定して実行する。

``` text
$ lftp -f lftp_bulletin_b.txt
```

当方は、実際には、 bash スクリプト化したものを cron で定期的に実行するようにしている。

### 4. 参考サイト

* [LFTP - the manual page](https://lftp.yar.ru/lftp-man.html "LFTP - the manual page")

---

以上。

