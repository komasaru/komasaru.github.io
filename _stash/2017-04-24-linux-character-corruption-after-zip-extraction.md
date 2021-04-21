---
layout   : single
title    : "Linux - ZIP ファイル展開後にファイル名が文字化けする場合！"
published: true
date     : 2017-04-24 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Windows で ZIP 圧縮されたファイルを受け取り、 Linux で展開すると、ファイル名が文字化けすることがあります。

以下、解消法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。

### 1. unar パッケージのインストール

通常の `unzip` コマンドで展開するとファイル名が文字化けするので、 `unar` コマンドを使用する。

``` text
$ sudo apt install unar
```

### 2. ZIP ファイルの展開

オプションが色々存在するが、基本的にはファイル名を指定して実行するだけ。

``` text
$ unar filename.zip
```

`unar` コマンドでは文字化けしていたファイル名が、文字化けせずに展開される。

### 3. ファイルマネージャの右クリック対応

ファイルマネージャで右クリックで展開できるようにしたければ、スクリプトを作成して所定の位置に配置すればよい。

Caja なら "~/.config/caja/scripts" ディレクトリ配下、 Nemo なら "~/.local/share/nemo/scripts" ディレクトリ配下に以下のような内容のスクリプトファイルを配置し、

File: `~/.config/caja/scripts/unar`

{% highlight bash linenos %}
#!/bin/sh

for arg
do
  unar $arg
done
{% endhighlight %}

実行権限を与える。

``` text
$ sudo chmod +x ~/.config/caja/scripts/unar
```

展開するには、 ZIP ファイル右クリックでスクリプトを実行させればよい。

### 4. その他

Ubuntu なら、 [Ubuntuの日本語環境 - Ubuntu Japanese Team](http://www.ubuntulinux.jp/japanese "Ubuntuの日本語環境 - Ubuntu Japanese Team") の「方法２・Japanese Teamのパッケージレポジトリを追加する」に記述されていることを実行すれば、 `unzip` コマンドにパッチがあてられるようだが、当方は未確認。

---

国の某機関から取得した ZIP ファイルを `unzip` コマンドで展開した際に文字化けして困っていましたが、 `unar` コマンドのおかげで苦労せずに済みます。

以上。

