---
layout   : single
title    : "Linux - pwgen でランダム文字列生成！"
published: true
date     : 2017-01-26 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

Linux の `pwgen` コマンドで、パスワード等のランダムな文字列（半角英数）を生成する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2) での作業を想定。（最低限、 Debian 系では同様のはず）

### 1. インストール

コマンドが未インストールならインストールする。

``` text
$ sudo apt install -y pwgen
```

### 2. 使用方法

``` text
$ pwgen [ OPTIONS ] [ pw_length ] [ num_pw ]
```

オプション等を何も指定しない場合。（8文字のランダムな文字列が 8 * 20 個出力される。

``` text
$ pwgen
EsoPaij6 na0Ohgie zaeP0que vi2beiLo cheeTh1i aer3ohTh kuo3Jiep tah7ioN6
oaG9rah6 iF5Thizo tooP6ief OoP9loh6 Coh6pah4 taix7Ahy IT5aikoh aiBapha7
Zeiko2ch ni6Oonge aeCeruR7 AicuTah1 ohMei6ri Gaeh9kee ohPhei7u chaegh7B
ieB6ethi Naewoz6U Yi5Teid1 Tei0pow1 ahNg8ein oobes2Ye Ae0AeBie ou3XuKai
JohR6oph shi1Cai3 hei7Yoon Eech9tha zohhee3A Aichuk2c ha5nae0U kahh5OhG
ying2Rox noo5WiNa maez0ohC AhJiepu2 janaiY6i aibiev1U Baria6oo wei7aePh
wohie5Za eeNg1air da0Vu2Oh Koo5Et0j ahsh6VeM Quuz3oGu lee2od0S Afe2coo5
cei2Paig aicep8Ae Doo0hoo0 Oith3cie Aepee1ie Ooph4chi guf1quuN elaeTh4e
ao0aiVa7 Xoa2aesh tahGh9fe ahYu0ohz vohc4eeZ Pas8iR0u Cais9ahc ohraiw3V
Fie0peJ9 ahGh7ood hong4Iet tahzee4O Dah1eaYi ru2wohL7 Thai4eed Ohd5Veed
to0Eiphi Fees9eem fuar7Ac4 chae0ioG mooXib2a oPhee6Ai eajoo6Oh chaeVae2
ohLoer0u rohch5Oe Geekood0 duz1Ash2 Rae8Ji3n ausohWa8 Reisho7p fiy0Zeid
de0Ceas6 maoShoh0 uph6Iu4O zu7haeWi eic3Aet8 Va4oong1 ait6ceeN ejeiZ6te
Pahk9Qua iere4EaJ Soh6kiGh eiSaif1u eeC4oot1 eeXae7Ae aehe1No8 luR8joo1
Wio5nohW eeH2moxa Eequai6e pahf7Eef tiewieM4 eiL7NaiK ei5DieDu Uom8uloh
xeiR2aer ojeiTae5 Aphon0xi neixii8Y vie3uoWe yeex1Reh ohB2aigu ooph5Ig1
ee9Eewae see6looZ viPhee0r Hoh6VeiR pho6Otho aeth7The eeF1phi0 rae1buPu
Ohku2ohJ ohl7Ohyu waehu2Ai iepoo8Lu thieWah8 phoo9ohB Oogh3eix vee3Ihah
eiB7en4g Feir4xee zaelaiH9 ohch2ieY Eilai1ah aiWagh8i ao1Iesh8 Jo8aP3Ox
aN2pahga aiNgu6ki aroo3aeY ov8phiuZ eiCh2Fee eip3GooM ieXai2th hi2Uyaem
```

20文字のランダムな文字列を１個だけ出力したい場合。

``` text
$ pwgen 20 1
aem3Eighi8cee8aing1e
```

少なくとも１個の英大文字を含めいた場合。

``` text
$ pwgen -c 20 1
au7Popham2maedaquieB
```

英大文字を含めたくない場合。

``` text
$ pwgen -A 20 1
ohthohlur3quup7ohjae
```

少なくとも１個の数字を含めたい場合。

``` text
$ pwgen -n 20 1
gee9liRoongoh4hahng1
```

数字を含めたくない場合。

``` text
$ pwgen -0 20 1
athohHuJohsalubioshi
```

少なくとも１個の特殊文字を含めたい場合。

``` text
$ pwgen -y 20 1
eu;ghie8meeCutae'w0O
```

完全にランダムなパスワードを生成したい場合。（意味不明）

``` text
$ pwgen -s 20 1
1fYdL3YmXdo0G3kTo1T8
```

曖昧な文字を含めたくない場合。（意味不明）

``` text
$ pwgen -B 20 1
emoo4uneey7yu7ei7aiR
```

その他、ヘルプ。（`man pwgen` でもよい）

``` text
$ pwgen -h
Usage: pwgen [ OPTIONS ] [ pw_length ] [ num_pw ]

Options supported by pwgen:
  -c or --capitalize
        Include at least one capital letter in the password
  -A or --no-capitalize
        Don't include capital letters in the password
  -n or --numerals
        Include at least one number in the password
  -0 or --no-numerals
        Don't include numbers in the password
  -y or --symbols
        Include at least one special symbol in the password
  -s or --secure
        Generate completely random passwords
  -B or --ambiguous
        Don't include ambiguous characters in the password
  -h or --help
        Print a help message
  -H or --sha1=path/to/file[#seed]
        Use sha1 hash of given file as a (not so) random generator
  -C
        Print the generated passwords in columns
  -1
        Don't print the generated passwords in columns
  -v or --no-vowels
        Do not use any vowels so as to avoid accidental nasty words
```

---

以上。

