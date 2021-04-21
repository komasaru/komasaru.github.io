---
layout   : single
title: 'Linux - Google 日本語入力 Mozc の tool コマンド！'
published: true
date     : 2017-06-27 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Google 日本語入力 Mozc の tool コマンドで各種ウィンドウを開く方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。

### 1. Mozc プロパティ

``` text
$ /usr/lib/mozc/mozc_tool --mode=config_dialog
```

### 2. Mozc 辞書ツール

``` text
$ /usr/lib/mozc/mozc_tool --mode=dictionary_tool
```

### 3. Mozc 単語登録

``` text
$ /usr/lib/mozc/mozc_tool --mode=word_register_dialog
```

### 4. Mozc 手書き文字入力

``` text
$ /usr/lib/mozc/mozc_tool --mode=hand_writing
```

### 5. 「Mozc 文字パレット」を開く

``` text
$ /usr/lib/mozc/mozc_tool --mode=character_palette
```

### 6. 応用

当方は辞書登録をよく行うが、GUI でメニューから「辞書ツール」経由で「単語登録」ウィンドウを開くのは若干の手間なので、エイリアスの設定をして（常に開いている）ターミナルから `mozc-word` 実行で「単語登録」ウィンドウが開くようにしている。（シェルスクリプトを作成して、それを実行するようにしてもよいだろう）

File: `~/.zshrc`

{% highlight bash linenos %}
alias mozc-word="/usr/lib/mozc/mozc_tool --mode=word_register_dialog"
{% endhighlight %}

上記はシェルが zsh の場合の例だが、シェルが bash なら "~/.bashrc" 等に追記。

### 7. 参考サイト

* [JapaneseEnvironment/Mozc - Debian Wiki](https://wiki.debian.org/JapaneseEnvironment/Mozc "JapaneseEnvironment/Mozc - Debian Wiki")

---

以上。

