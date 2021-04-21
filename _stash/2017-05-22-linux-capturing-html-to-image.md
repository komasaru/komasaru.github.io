---
layout   : single
title: 'Linux - コマンドで Web ページのキャプチャ！'
published: true
date     : 2017-05-22 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LMDE2
---

Linux のコマンドラインから Web ページ(HTML)をキャプチャ（PDF, PNG 化等）する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* キャプチャには wkhtmltopdf コマンドを使用する。

### 1. パッケージのインストール

`wkhtmltopdf` をインストールすると、 `wkhtmltopdf` コマンド以外に `wkhtmltoimage` コマンドも使用できるようになる。

``` text
$ sudo apt install wkhtmltopdf
```

### 2. Web ページの PDF 化

`wkhtmltopdf` コマンドの引数に対象ページの URL と出力ファイル名を指定して実行。

``` text
$ wkhtmltopdf http://example.com/foo.html example_foo.pdf
```

* オプション無指定で「A4 縦」とみなされる。

### 3. Web ページの PNG 化

`wkhtmltoimage` コマンドの引数に対象のページの URL と出力ファイル名を指定して実行。

``` text
$ wkhtmltoimage http://example.com/foo.html example_foo.png
```

* 出力ファイルの拡張子で画像フォーマットが自動判別される。(JPEG なら `jpg` にする等）

### 4. その他

個人的には、オプション無しのデフォルト設定で事足りている。

サイズやフォント等を詳細に設定したければ、ヘルプ／マニュアル参照のこと。

``` text
$ wkhtmltopdf -h
$ wkhtmltoimage -h
$ man wkhtmltopdf
$ man wkhtmltoimage
```

`-h` は `--help` でもよい。 `-H` にすると拡張ヘルプ。

### 5. 参考サイト

* [wkhtmltopdf](https://wkhtmltopdf.org/ "wkhtmltopdf")

---

自動で定期的に Web サイトのキャプチャを取りたい場合、シェルスクリプトを作成して cron 登録するとよいでしょう。

当方は、 Web スクレイピングで気になる状態になった場合にキャプチャして確認したりしています。

以上。

