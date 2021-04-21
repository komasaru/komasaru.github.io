---
layout   : single
title    : "Linux - curl コマンドで HTTP ステータスのみを確認！"
published: true
date     : 2016-05-28 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

特定の URL の HTTP ステータスのみを知りたいことがあると思います。（当方はよくあります）

以下、curl コマンドを使用して指定の URL の HTTP ステータスを確認する方法についての記録です。

<!--more-->

### 0. 前提条件

* 当方、Linux Mint 17.2(64bit) で動作を確認。
* curl コマンドが導入済みであること。（大抵は既インストールのはず）

### 1. コマンドの実行

``` text
$ curl -s -o /dev/null -w "%{http_code}\n" http://www.mk-mode.com/octopress/
200
```

* `-s` は、進捗状況やエラーを表示しないオプション（`--silent` と同じ）
* `-o <file>` は、取得したデータを <file> に出力する（廃棄する）オプション（`--output <file>` と同じ）  
  （`-o /dev/null` で、出力を廃棄）
* `-w <format>` は、 `<format>` の書式でカスタム出力するオプション（`--write-out <format>` と同じ）  
  （`-w "%{http_code}\n"` で、http_code の値と改行コードを出力）
* リダイレクトにも対応させたければ、 `-L` オプションを追加するとよい。

### 2. 参考サイト

* [cURL - How To Use](https://curl.haxx.se/docs/manpage.html "cURL - How To Use")

---

bash スクリプトに組み込んで、何かと応用できます。

以上。

