---
layout   : single
title    : "RMagick - Fontconfig warning 対策！"
published: true
date     : 2016-08-22 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
---

RMagick 2.15.4 （ImageMagick 画像処理ライブラリ等を Ruby から呼び出せるようにできるインターフェースの機能を持った RubyGems ライブラリ）を利用した自作の Ruby スクリプトを実行した際に警告メッセージが出力されました。

以下、現象・原因・対策についての記録です。

<!--more-->

### 0. 前提条件

* LMDE2(Linux Mint Debian Edition 2)
* Ruby 2.3.1-p112
* RMagick 2.15.4

### 1. 現象

RMagick を利用した Ruby スクリプトを実行すると以下のような警告メッセージが出力される。

``` text
Fontconfig warning: "/etc/fonts/conf.d/69-language-selector-ja-jp.conf",
 line 126: Having multiple values in <test> isn't supported and may not work as expected
Fontconfig warning: "/etc/fonts/conf.d/69-language-selector-ja-jp.conf",
 line 126: Having multiple values in <test> isn't supported and may not work as expected
```

### 2. 原因

"/etc/fonts/conf.d/69-language-selector-ja-jp.conf" の126行までの `<test>` タグ内に `<string>` タグが連続して記述されている。

File: `/etc/fonts/conf.d/69-language-selector-ja-jp.conf`

{% highlight bash linenos %}
        <test name="family" compare="contains">
            <string>IPA Pゴシック</string>
            <string>IPA P明朝</string>
            ...
            ...
            ...
        </test>
{% endhighlight %}

### 3. 対策

`<string>` タグそれぞれを `<test>` タグで囲むように編集する。

File: `/etc/fonts/conf.d/69-language-selector-ja-jp.conf`

{% highlight bash linenos %}
        <test name="family" compare="contains">
            <string>IPA Pゴシック</string>
        </test>
        <test name="family" compare="contains">
            <string>IPA P明朝</string>
        </test>
            ...
            ...
            ...
        </test>
{% endhighlight %}

### 4. 確認

再度、目的の Ruby スクリプトを実行して、警告メッセージが出力されなくなったことを確認する。

---

この現象は、当方のデスクトップ環境をこれまで使用していた Ubuntu 派生の Linux Mint から Debian 派生の LMDE2 に変更したからでしょうかね。

以上。

