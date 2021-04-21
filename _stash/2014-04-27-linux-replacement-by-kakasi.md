---
layout   : single
title    : "Linux - KAKASI で「日本語 => ローマ字・かな・カナ」変換！"
published: true
date     : 2014-04-27 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
---

日本語をひらがなやカタカナ、ローマ字に変換する方法についての記録です。

変換には "KAKASI" というアプリを使用します。

<!--more-->

### 0. 前提条件

- Linux Mint 13 での作業を想定。  
  （他の Linux ディストリビューションでも同様）
- 実行環境の文字コードは utf-8 を想定。  
  （実行環境の文字コードやファイルの文字コードの違いにより、使用するオプションが変わってくるので注意）

### 1. インストール

よくある以下のような方法でインストールする。（`apt-get` でインストールしてもよいが、バージョンが少し古いかも）

``` text
$ wget http://kakasi.namazu.org/stable/kakasi-2.3.6.tar.gz
$ tar zxvf kakasi-2.3.6.tar.gz
$ cd kakasi-2.3.6
$ ./configure
$ make
$ sudo make install
```

### 2. インストール確認

以下のようなコマンドでインストールできているか確認する。  
（`--help` や `--version` 等のオプションは存在しないが、存在しないオプションを指定すると、バージョン情報や使用方法が表示される。）

``` text
$ kakasi --help
KAKASI - Kanji Kana Simple Inverter  Version 2.3.6
Copyright (C) 1992-1999 Hironobu Takahashi. All rights reserved.

Usage: kakasi -a[jE] -j[aE] -g[ajE] -k[ajKH] -E[aj] -K[ajkH] -H[ajkKH] -J[ajkKH]
              -i{oldjis,newjis,dec,euc,sjis,utf8} -o{oldjis,newjis,dec,euc,sjis,utf8}
              -r{hepburn,kunrei} -p -s -f -c"chars"  [jisyo1, jisyo2,,,]

      Character Sets:
       a: ascii  j: jisroman  g: graphic  k: kana (j,k     defined in jisx0201)
       E: kigou  K: katakana  H: hiragana J: kanji(E,K,H,J defined in jisx0208)

      Options:
      -i: input coding system    -o: output coding system
      -r: romaji conversion system
      -p: list all readings (with -J option)
      -s: insert separate characters (with -J option)  -S"chars": set separator
      -f: furigana mode (with -J option)
      -F[rl]"chars": set parentheses around furigana
      -c: skip chars within jukugo (with -J option: default TAB CR LF BLANK)
      -C: romaji Capitalize (with -Ja or -Jj option)
      -U: romaji Upcase     (with -Ja or -Jj option)
      -u: call fflush() after 1 character output
      -t: use old romaji table
      -w: wakatigaki mode
      -{l,L}: level {hiragana,furigana} mode (-{l,L}[123456jn])
      -y: display yomi of each kanji characters

Report bugs to <bug-kakasi@namazu.org>.
```

### 3. 使用例（「日本語 => ローマ字」変換）

順を追ってテストしてみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi
漢字かな混じり文変換テスト。
```

まだ、全く変換されない。

漢字をローマ字に変換するオプション `-Ja` を付加してみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi -Ja
tanuki?chitsurei??ren?yamainu?renkou??ka?asukikan?スkani??
```

文字化けする。（都合上 `?` で表示している）

文字コード（入力・出力）を指定するオプション `-i utf-8`、 `-o utf8` を付加してみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi -Ja -i utf-8 -o utf-8
kanjiかなmajiりbunhenkanテスト。
```

漢字の部分はローマ字に変換された。

ひらがなとカタカナをローマ字にするオプション `-Ha`、`-Ka` を付加してみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi -Ja -Ha -Ka -i utf-8 -o utf-8
kanjikanamajiribunhenkantesuto。
```

ひらがな・カタカナ部分もローマ字に変換された。

記号を変換するオプション `-Ea` を付加してみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi -Ja -Ha -Ka -Ea -i utf-8 -o utf-8
kanjikanamajiribunhenkantesuto.
```

すべてローマ字に変換された。

単語と単語の区別が分かりにくいので、単語間に空白を挿入するオプション `-s` を付加してみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi -Ja -Ha -Ka -Ea -s -i utf-8 -o utf-8
kanji kana maji ri bun henkan tesuto .
```

「混じり」が "maji ri" となるがまずまずでしょう。

### 4. 使用例（「日本語 => ひらがな」変換）

漢字をひらがな、カタカナをひらがなに変換するオプション `-JH`、`-KH` オプションを使用して変換してみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi -JH -KH -s -i utf-8 -o utf-8
かんじ かな まじ り ぶん へんかん てすと 。
```

### 5. 使用例（「日本語 => カタカナ」変換）

同様に、漢字をカタカナ、ひらがなをカタカナに変換するオプション `-JK`、`-HK` オプションを使用して変換してみる。

``` text
$ echo 漢字かな混じり文変換テスト。 | kakasi -JK -HK -s -i utf-8 -o utf-8
カンジ カナ マジ リ ブン ヘンカン テスト 。
```

### 6. 使用例（ファイル読み込み）

まず、変換対象文字列をあらかじめ以下のように別のファイルに変換対象の文章を容易しておく。（文字コード： utf-8）

File: `kakasi.txt`

{% highlight text linenos %}
漢字かな混じり文変換テスト。
{% endhighlight %}

このファイルを読み込ませて変換してみる。

``` text
$ kakasi -Ja -Ha -Ka -Ea -s -i utf-8 -o utf-8 < kakasi.txt
kanji kana maji ri bun henkan tesuto .
```

以下のようにしてもよい。

``` text
$ cat kakasi.txt | kakasi -Ja -Ha -Ka -Ea -s -i utf-8 -o utf-8
kanji kana maji ri bun henkan tesuto .
```

### 4. 参考サイト

- [KAKASI - 漢字→かな(ローマ字)変換プログラム](http://kakasi.namazu.org/ "KAKASI - 漢字→かな(ローマ字)変換プログラム")

---

若干変換（区切り等）に不自然な部分もありますが、使えないこともないでしょう。

また、今回は単に変換するだけでしたが、音声合成ソフトに読ませたり、日本語のスペルチェックを行なったり、と応用も可能かと思われます。

以上。

