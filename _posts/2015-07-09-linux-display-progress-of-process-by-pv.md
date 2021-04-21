---
layout   : single
title    : "Linux - pv コマンドで処理進捗状況表示！"
published: true
date     : 2015-07-09 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux で何か時間のかかる処理を実行中に、処理の進行状況や処理終了までの大まなか残り時間を知りたいことがあります。

以下、 pv コマンド使用してプログレバーを表示させる方法についての備忘録です。（"pv" は Pipe Viewer の略）

ちなみに、当方が pv コマンドを導入した主な理由は、 MariaDB(MySQL) の大容量ダンプファイルをインポート（リストア）する際に進捗状況を知りたかったからです。

<!--more-->

### 0. 前提条件

* Debian 8.1 Jessie での作業を想定。  
  （他バージョンも同様。他ディストリビューションもインストール方法以外は同様）

### 1. pv コマンドのインストール

``` text
# apt-get install pv
```

### 2. 使用方法

（`pv` コマンドには `cat` コマンドのような機能があることに留意）

以下は、テキストファイルを gzip 圧縮する例。  
（`gzip -c hoge.txt.gz | pv > /dev/null` でも gzip 圧縮は可能だが、テキストファイルの容量が取得できないため処理終了までの残り時間は分からない）

``` text
# pv hoge.txt | gzip > hoge.txt.gz
5.53MiB 0:00:01 [5.19MiB/s] [=====>                  ] 28% ETA 0:00:02
```

以下は、テキストファイルの取得と gzip 圧縮の2処理に名前を付けて同時に監視する例。

``` text
# pv -cN source hoge.text | gzip | pv -cN gzip > hoge.txt.gz
   source: 7.41MiB 0:00:02 [1.39MiB/s] [===>         ] 37% ETA 0:00:03
     gzip:  320KiB 0:00:02 [ 153KiB/s] [ <=>                         ]
```

以下は、 MariaDB や MySQL のダンプファイルをインポート（リストア）する例。

``` text
# pv hoge.dump | mysql -u root -p db_name
```

また、データ量が分かっているのなら `pv -s 1024m` のように指定することも可能。  
その他各種オプションについては `man pv` で確認可能。

### 参考サイト

* [A Unix Utility You Should Know About: Pipe Viewer - good coders code, great reuse](http://www.catonmat.net/blog/unix-utilities-pipe-viewer/ "A Unix Utility You Should Know About: Pipe Viewer - good coders code, great reuse")

---

これで、時間がかかる処理も終了時間の見当が付くようになります。

以上。

