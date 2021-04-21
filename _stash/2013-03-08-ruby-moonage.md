---
layout   : single
title    : "Ruby - 月齢計算！"
published: true
date     : 2013-03-08 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- カレンダー
---

前回、前々回と、グレゴリオ暦（Y年m月d日 H時M分S秒）から太陽・月の黄経を計算する Ruby スクリプトの紹介しました。

- [Ruby - 太陽黄経計算！]({{site.baseurl}}/2013/03/04/ruby-longitude-sun/ "Ruby - 太陽黄経計算！")
- [Ruby - 月黄経計算！]({{site.baseurl}}/2013/03/06/ruby-longitude-moon/ "Ruby - 月黄経計算！")

今回は、グレゴリオ暦（Y年m月d日 H時M分S秒）から月齢を計算する Ruby スクリプトの紹介です。

月齢とは、朔（新月）からの経過日数のことです。

当然、地球・月の公転軌道が真円でないため、単純な計算にはなりません。  
天文学における摂動という概念も出てきます。（力学における摂動は異なります）

今回紹介するのは、当方サイトの旧暦計算等で使用しているスクリプトから月齢計算部分のみ抜粋した形となっています。

<!--more-->

> 【2016-06-10 追記】  
> RubyGems ライブラリ [mk_calendar - RubyGems.org](https://rubygems.org/gems/mk_calendar "mk_calendar - RubyGems.org")（or [komasaru/mk_calendar - GitHub](https://github.com/komasaru/mk_calendar "komasaru/mk_calendar - GitHub")） を作成しました。  
> 多少の改修を施したということもあり、 [komasaru/Calendar · GitHub](https://github.com/komasaru/Calendar "komasaru/Calendar - GitHub") で公開していた Ruby スクリプトは削除しました。  
> 【追記ここまで】

### 0. 前提条件

- Linux Mint 14 Nadia (64bit), Ruby 1.9.3-p392 で作成、 1.9.3-p392, 2.0.0-p0 で動作確認。

### 1. 概要

月齢を計算する大まかな流れは以下のとおり。

1. グレゴリオ暦からユリウス通日を計算。  
   ユリウス通日については、過去記事もご参考に。-> [* 日数計算の方法！ - mk-mode BLOG](http://www.mk-mode.com/octopress/2011/09/22/22002000/ "ユリウス通日から")
2. ユリウス通日から直前の朔を計算。  
   （ここで、太陽黄経・月黄経の計算もある）
3. ユリウス通日・直前の朔から月齢を計算。

今回は Ruby スクリプトの紹介なので、ここでは摂動等の詳細は説明しません。  
「摂動」とは互いの惑星の重力により軌道が乱れるということ、という事だけに留めておく。

### 2. Ruby スクリプト作成

作成した Ruby スクリプトは、長くなったので、ここには掲載しない。  
GitHub リポジトリに登録してああるので、そちらを参照。  
太陽・月の黄経の計算の他に朔（新月）の計算があり、この朔計算が月齢計算の一番重要なポイントとなっている。

- [Calendar/calc_moonage.rb at master · komasaru/Calendar · GitHub](https://github.com/komasaru/Calendar/blob/master/calc_moonage.rb "Calendar/calc_moonage.rb at master · komasaru/Calendar · GitHub")

### 3. Ruby スクリプト実行

引数に8桁数字（YYYYMMDD 形式）か14桁数字（YYYYMMDDHHMMSS）を指定して、実行する。  
（引数を指定しなければ、現在日時（システム日時）と判断する）

``` bash 
$ ruby calc_moonage.rb 20130301120000
2013-03-01 12:00:00 の月齢 = 18.81846047146246
```

### 4. 参考文献

摂動項・比例項の計算に使用する定数等、大変参考になる書籍です。

---

当方、カレンダー作成や旧暦計算の Ruby スクリプトを作成してい使用していましたが、任意の日時の月齢を計算するだけのスクリプトを作成していなかったので、今回作成した次第です。

ちなみに、当方サイトのカレンダーはこちら。

- [mk-mode SITE : カレンダー（月間）](http://www.mk-mode.com/rails/calendar/calendar "mk-mode SITE : カレンダー（月間）")

以上。

