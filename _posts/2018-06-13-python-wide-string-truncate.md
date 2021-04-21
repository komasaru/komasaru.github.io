---
layout   : single
title    : "Python - 全角文字を2バイト換算して指定バイト数で切り捨て！"
published: true
date     : 2018-06-13 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Python
---

以前、 Ruby で文字列内の全角文字（正確には、「全角文字」ではなく、2バイト以上の文字）を2バイト換算し、指定バイト数で切り捨てる方法について紹介しました。

* [Ruby - 全角文字を2バイト換算して指定バイト数で切り捨て！]({{site.baseurl}}/2017/12/18/ruby-wide-string-truncate/ "Ruby - 全角文字を2バイト換算して指定バイト数で切り捨て！")

今回は、同様のアルゴリズムを Python で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* Python 3.6.4 （エンコード：UTF-8）での作業を想定。

### 1. サンプルスクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）
* 切り捨てたたことが分かるよう文字を設定することも可能にしている。

File: `str_trunc.py`

{% highlight python linenos %}
#! /usr/local/bin/python3.6
"""
全角文字を2byte換算し、指定バイトで切り捨て（省略文字設定可）
※正確には、「全角文字」ではなく1byte超の文字
"""
ENC = "utf-8"


def trunc_str(src, trunc_at, om = ""):
    str_size, str_bytesize = len(src), len(src.encode(ENC))
    om_size = (len(om.encode(ENC))- len(om)) // 2 + len(om)
    if str_size == str_bytesize:
        if str_size <= trunc_at:
            return src
        else:
            return src[:(trunc_at - om_size)] + om
    if (str_bytesize - str_size) // 2 + str_size <= trunc_at:
        return src
    for i in range(str_size):
        s = (len(src[:(i + 1)].encode(ENC)) - len(src[:(i + 1)])) // 2 \
          + len(src[:(i + 1)])
        if s < trunc_at - om_size:
            continue
        elif s == trunc_at - om_size:
            return src[:(i + 1)] + om
        else:
            return src[:i] + om
    return src


src = "abcdefg"
print('src                      =', src)
print('trunc_str(src, 5)        =', trunc_str(src, 5))
print('trunc_str(src, 6)        =', trunc_str(src, 6))
print('trunc_str(src, 7)        =', trunc_str(src, 7))
print('trunc_str(src, 8)        =', trunc_str(src, 8))
print('trunc_str(src, 5, "...") =', trunc_str(src, 5, "..."))
print('trunc_str(src, 6, "...") =', trunc_str(src, 6, "..."))
print('trunc_str(src, 7, "...") =', trunc_str(src, 7, "..."))
print('trunc_str(src, 8, "...") =', trunc_str(src, 8, "..."))
print()
src = "AあBいCうDえEお"
print('src                          =', src)
print('trunc_str(src, 12)           =', trunc_str(src, 12))
print('trunc_str(src, 13)           =', trunc_str(src, 13))
print('trunc_str(src, 14)           =', trunc_str(src, 14))
print('trunc_str(src, 15)           =', trunc_str(src, 15))
print('trunc_str(src, 16)           =', trunc_str(src, 16))
print('trunc_str(src, 12, "...")    =', trunc_str(src, 12, "..."))
print('trunc_str(src, 13, "...")    =', trunc_str(src, 13, "..."))
print('trunc_str(src, 14, "...")    =', trunc_str(src, 14, "..."))
print('trunc_str(src, 15, "...")    =', trunc_str(src, 15, "..."))
print('trunc_str(src, 16, "...")    =', trunc_str(src, 16, "..."))
print('trunc_str(src, 12, "(続く)") =', trunc_str(src, 12, "(続く)"))
print('trunc_str(src, 13, "(続く)") =', trunc_str(src, 13, "(続く)"))
print('trunc_str(src, 14, "(続く)") =', trunc_str(src, 14, "(続く)"))
print('trunc_str(src, 15, "(続く)") =', trunc_str(src, 15, "(続く)"))
print('trunc_str(src, 16, "(続く)") =', trunc_str(src, 16, "(続く)"))
{% endhighlight %}

* [Gist - Python script to truncate string, including multi-byte characters.](https://gist.github.com/komasaru/b25cbdf754971f920dd2f5743e950c7d "Gist - Python script to truncate string, including multi-byte characters.")

### 2. サンプルスクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x str_trunc.py
```

そして、実行。

``` text
$ ./str_trunc.py
src                      = abcdefg
trunc_str(src, 5)        = abcde
trunc_str(src, 6)        = abcdef
trunc_str(src, 7)        = abcdefg
trunc_str(src, 8)        = abcdefg
trunc_str(src, 5, "...") = ab...
trunc_str(src, 6, "...") = abc...
trunc_str(src, 7, "...") = abcdefg
trunc_str(src, 8, "...") = abcdefg

src                          = AあBいCうDえEお
trunc_str(src, 12)           = AあBいCうDえ
trunc_str(src, 13)           = AあBいCうDえE
trunc_str(src, 14)           = AあBいCうDえE
trunc_str(src, 15)           = AあBいCうDえEお
trunc_str(src, 16)           = AあBいCうDえEお
trunc_str(src, 12, "...")    = AあBいCう...
trunc_str(src, 13, "...")    = AあBいCうD...
trunc_str(src, 14, "...")    = AあBいCうD...
trunc_str(src, 15, "...")    = AあBいCうDえEお
trunc_str(src, 16, "...")    = AあBいCうDえEお
trunc_str(src, 12, "(続く)") = AあBい(続く)
trunc_str(src, 13, "(続く)") = AあBいC(続く)
trunc_str(src, 14, "(続く)") = AあBいC(続く)
trunc_str(src, 15, "(続く)") = AあBいCうDえEお
trunc_str(src, 16, "(続く)") = AあBいCうDえEお
```

---

Twitter でツイートする際の文字数計算等に利用できるでしょう。と言うか、存分に利用している。

以上。

