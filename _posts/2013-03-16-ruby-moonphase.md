---
layout   : single
title    : "Ruby - 月相計算！"
published: true
date     : 2013-03-16 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- カレンダー
---

少し前に、グレゴリオ暦（Y年m月d日 H時M分S秒）から太陽・月の黄経、月齢を計算する Ruby スクリプトの紹介しました。

- [Ruby - 太陽黄経計算！]({{site.baseurl}}/2013/03/04/ruby-longitude-sun/ "Ruby - 太陽黄経計算！")
- [Ruby - 月黄経計算！]({{site.baseurl}}/2013/03/06/ruby-longitude-moon/ "Ruby - 月黄経計算！")
- [Ruby - 月齢計算！]({{site.baseurl}}/2013/03/08/ruby-moonage/ "Ruby - 月齢計算！")

今回は、グレゴリオ暦（Y年m月d日 H時M分S秒）から月相（月の満ち欠け）を計算する Ruby スクリプトの紹介です。

月相は月齢と連動はしますが、正確には一致しません。  
月の公転軌道が真円でないからです。

より正確に月相を計算するには太陽と月の黄経の差から計算します。

今回紹介するのは、当方サイトの旧暦計算等で使用しているスクリプトから月相計算部分のみ抜粋した形となっています。  
ですが、実際には太陽黄経と月黄経が求まれば簡単に計算できるものであります。

<!--more-->

### 0. 前提条件

- Linux Mint 14 Nadia (64bit), Ruby 2.0.0-p0 で作成・動作確認。

### 1. 概要

まず月相は、月の黄経から太陽の黄経を引いた値(0 以上 360 未満の値)を 0 から 27 の整数値に換算したものである。

![MOONPHASE]({{site.baseurl}}/images/2013/03/16/MOONPHASE.png "MOONPHASE")

<table class="common">
  <tr>
    <th class="center">黄経差</th><th class="center">月相</th><th class="center">呼び名</th>
  </tr>
  <tr>
    <td class="right">0 °</td><td class="right">0</td><td class="left">新月（朔）</td>
  </tr>
  <tr>
    <td class="right">90 °</td><td class="right">7</td><td class="left">上弦</td>
  </tr>
  <tr>
    <td class="right">180 °</td><td class="right">14</td><td class="left">満月（望）</td>
  </tr>
  <tr>
    <td class="right">270 °</td><td class="right">21</td><td class="left">下弦</td>
  </tr>
</table>

そして、月相を計算する大まかな流れは以下のとおり。

1. グレゴリオ暦からユリウス通日を計算。  
   ユリウス通日については、過去記事もご参考に。-> [* 日数計算の方法！ - mk-mode BLOG](http://www.mk-mode.com/octopress/2011/09/22/22002000/ "ユリウス通日から")
2. ユリウス通日から太陽の黄経を計算。
3. ユリウス通日から月の黄経を計算。
4. 太陽の黄経と月の黄経から月相を計算。

今回は Ruby スクリプトの紹介なので、ここでは摂動等の詳細は説明しません。  
「摂動」とは互いの惑星の重力により軌道が乱れるということ、という事だけに留めておく。

### 2. Ruby スクリプト作成

作成した Ruby スクリプトは、長くなったので、ここには掲載しない。  
GitHub リポジトリに登録してああるので、そちらを参照。  
重要なのは、太陽と月の黄経の計算することと、月の黄経から太陽の黄経を引いた値を 0 から 27 の値に換算すること。  
月の黄経から太陽の黄経を引いた値がマイナスになる場合は、角度の正規化を行う（360 を加算する）。

- [Calendar/calc_moonphase.rb at master · komasaru/Calendar · GitHub](https://github.com/komasaru/Calendar/blob/master/calc_moonphase.rb "Calendar/calc_moonphase.rb at master · komasaru/Calendar · GitHub")

### 3. Ruby スクリプト実行

引数に8桁数字（YYYYMMDD 形式）か14桁数字（YYYYMMDDHHMMSS）を指定して、実行する。  
（引数を指定しなければ、現在日時（システム日時）を判断する）

``` bash 
$ ruby calc_moonphase.rb 20130316
黄経・太陽 = 355.19062960962077°
黄経・月   = 40.25276171663072°
2013-03-16 00:00:00 の月相 = 4
```

### 4. 参考文献

黄経計算に必要な摂動項・比例項の計算に使用する定数等、大変参考になる書籍です。

---

当方、カレンダー作成や旧暦計算の Ruby スクリプトを作成してい使用していましたが、任意の日時の月相を計算するだけのスクリプトを作成していなかったので、今回作成した次第です。

ちなみに、当方サイトのカレンダーはこちら。

- [mk-mode SITE : カレンダー（月間）](http://www.mk-mode.com/rails/calendar/calendar "mk-mode SITE : カレンダー（月間）")

以上。

