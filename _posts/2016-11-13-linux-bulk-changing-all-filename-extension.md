---
layout   : single
title    : "Linux - ディレクトリ内の全ファイルの拡張子を一括変更！"
published: true
date     : 2016-11-13 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- sed
---

Linux で「特定のディレクトリ内の特定の複数のファイルに対して、その拡張子を一括で変更する」方法についての備忘録です。

<!--more-->

### 0. 前提条件

* 今回は LMDE2 (Linux Mint Debian Edition 2) での作業を想定。

### 1. 実行例

以下は、カレントディレクトリ内の拡張子が "markdown" である全ファイルの拡張子を "md" に変更する例。

``` text
$ for f in *.markdown; do
> mv $f ${f%.markdown}.md;
> done
```

* `for f in *.markdown; do ... done` で、カレントディレクトリ内の拡張子が "markdown" の全ファイルをループ処理。
* `mv A B` で、ファイル A の名称を B に変換。
* `${f%.markdown}` の `%` は最短後置パターンの削除で、`$f` の右端から最短で一致する部分を削除。
* `${f%.markdown}.md` で、ファイル名から ".markdown" を削除して ".md" を追加 。

---

あるディレクトリ内の大量のファイルの拡張子を一括で変換したい事案が発生したために、その際の作業を記録しておいた次第です。

以上。

