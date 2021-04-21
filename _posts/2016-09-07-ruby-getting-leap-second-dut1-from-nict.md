---
layout   : single
title    : "Ruby - うるう秒実施一覧・DUT1一覧の取得（NICT 版）！"
published: true
date     : 2016-09-07 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

[NICT - 日本標準時プロジェクト](http://jjy.nict.go.jp/ "NICT - 日本標準時プロジェクト")で公開されている「うるう秒実施一覧」と「DUT1 一覧」を Ruby で取得してみました。

単純に HTML を取得して Nokogiri で解析しているだけです。

うるう秒や DUT1 に変更があった際に自作カレンダー関連のツールに容易に組み込めるように、と作成した次第です。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* DUT1 等の時刻系に関することは、過去記事「[Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series "Ruby - 各種時刻系の換算！")」を参照のこと。

### 1. Ruby スクリプトの作成

File: `get_leapsec_nict.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= Ruby script to get a list of leap-second adjustment.
#
#  date          name            version
#  2016.07.25    mk-mode         1.00 新規作成
#
#  Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#
require 'kconv'
require 'nokogiri'
require 'open-uri'

class GetLeapcecNict
  URL = "http://jjy.nict.go.jp/QandA/data/leapsec.html"
  UA  = "mk-mode Bot (by Ruby/#{RUBY_VERSION}, Administrator: postmaster@mk-mode.com)"

  def exec
    leapsecs = [[0, 1972, 1, 1, -10]]

    begin
      html = open(URL, "r:sjis", {"User-Agent" => UA}) { |f| f.read }.toutf8
      doc = Nokogiri::HTML.parse(html)
      doc.xpath("//pre").text.split("\n").each do |line|
        l = line.scan(/[\s　]+(.+?)[\s　]+(.+?)[\s　]*年[\s　]*(.+?)[\s　]*月[\s　]*(.+?)[\s　]*日.+?秒[\s　]*(.+?)[\s　]*秒$/)[0]
        next unless l
        leapsecs << l.map { |a| NKF::nkf("-WwZ1", a).to_i }
      end
      p leapsecs.sort
    rescue => e
      msg = "[#{e.class}] #{e.message}\n"
      msg << e.backtrace.map { |tr| "\t#{tr}\n" }.join("\n")
      $stderr.puts msg
    end
  end
end

GetLeapcecNict.new.exec if __FILE__ == $0
{% endhighlight %}

File: `get_dut1_nict.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= Ruby script to get a list of DUT1 adjustment.
#
#  date          name            version
#  2016.07.25    mk-mode         1.00 新規作成
#
#  Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#
require 'kconv'
require 'nokogiri'
require 'open-uri'

class GetDut1Nict
  URL = "http://jjy.nict.go.jp/QandA/data/dut1.html"
  UA  = "mk-mode Bot (by Ruby/#{RUBY_VERSION}, Administrator: postmaster@mk-mode.com)"

  def exec
    dut1s = Array.new

    begin
      html = open(URL, "r:sjis", {"User-Agent" => UA}) { |f| f.read }.toutf8
      doc = Nokogiri::HTML.parse(html)
      doc.xpath("//pre").text.split("\n").each do |line|
        l = line.scan(/(.+?)年　?(.+?)月(.+?)日　０９００　ＪＳＴ　から(.+?)秒$/)[0]
        next unless l
        dut1s << (l[0,3].map { |a| NKF::nkf("-WwZ1", a).to_i } << NKF::nkf("-WwZ1", l[-1]).to_f)
      end
      p dut1s.sort
    rescue => e
      msg = "[#{e.class}] #{e.message}\n"
      msg << e.backtrace.map { |tr| "\t#{tr}\n" }.join("\n")
      $stderr.puts msg
    end
  end
end

GetDut1Nict.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to get a list of leap-second adjustment.](https://gist.github.com/komasaru/027516ea3fe4f09878e7446f0f23444f "Gist - Ruby script to get a list of leap-second adjustment.")
* [Gist - Ruby script to get a list of DUT1 adjustment.](https://gist.github.com/komasaru/ac9a9fffcb43072e90c133b6968500d7 "Gist - Ruby script to get a list of DUT1 adjustment.")

### 2. Ruby スクリプトの実行

``` text
$ ./get_leapsec_nict.rb
[[0, 1972, 1, 1, -10],
 [1, 1972, 7, 1, -11],
 [2, 1973, 1, 1, -12],
 [3, 1974, 1, 1, -13],
 [4, 1975, 1, 1, -14],
 [5, 1976, 1, 1, -15],
 [6, 1977, 1, 1, -16],
 [7, 1978, 1, 1, -17],
 [8, 1979, 1, 1, -18],
 [9, 1980, 1, 1, -19],
 [10, 1981, 7, 1, -20],
 [11, 1982, 7, 1, -21],
 [12, 1983, 7, 1, -22],
 [13, 1985, 7, 1, -23],
 [14, 1988, 1, 1, -24],
 [15, 1990, 1, 1, -25],
 [16, 1991, 1, 1, -26],
 [17, 1992, 7, 1, -27],
 [18, 1993, 7, 1, -28],
 [19, 1994, 7, 1, -29],
 [20, 1996, 1, 1, -30],
 [21, 1997, 7, 1, -31],
 [22, 1999, 1, 1, -32],
 [23, 2006, 1, 1, -33],
 [24, 2009, 1, 1, -34],
 [25, 2012, 7, 1, -35],
 [26, 2015, 7, 1, -36],
 [27, 2017, 1, 1, -37]]

$ ./get_dut1_nict.rb
[[1988, 3, 17, 0.2],
 [1988, 5, 12, 0.1],
 [1988, 8, 25, 0.0],
 [1988, 11, 10, -0.1],
 [1989, 1, 19, -0.2],
 [1989, 4, 6, -0.3],
 [1989, 6, 8, -0.4],
 [1989, 9, 21, -0.5],
 [1989, 11, 16, -0.6],
 [1990, 1, 1, 0.3],
 [1990, 3, 1, 0.2],
 [1990, 4, 12, 0.1],
 [1990, 5, 10, 0.0],
 [1990, 7, 26, -0.1],
 [1990, 9, 20, -0.2],
 [1990, 11, 1, -0.3],
       :
 ===< 中略 >===
       :
 [2013, 4, 11, 0.1],
 [2013, 8, 22, 0.0],
 [2013, 11, 21, -0.1],
 [2014, 2, 20, -0.2],
 [2014, 5, 8, -0.3],
 [2014, 9, 25, -0.4],
 [2014, 12, 25, -0.5],
 [2015, 3, 19, -0.6],
 [2015, 5, 28, -0.7],
 [2015, 7, 1, 0.3],
 [2015, 9, 17, 0.2],
 [2015, 11, 26, 0.1],
 [2016, 1, 31, 0.0],
 [2016, 3, 24, -0.1],
 [2016, 5, 19, -0.2]]
```

### 3. 参考サイト

* [日本標準時プロジェクト　Information of Leap second](http://jjy.nict.go.jp/QandA/data/leapsec.html "日本標準時プロジェクト　Information of Leap second")
* [日本標準時プロジェクト　Announcement of DUT1](http://jjy.nict.go.jp/QandA/data/dut1.html "日本標準時プロジェクト　Announcement of DUT1")

---

NASA 版の計算式では細かい補正が行われてはいますが、当方は、うるう秒挿入（or 削除）が確実な場合は「うるう秒挿入（or 削除）総和 + 32.184(TT - TAI)」を $$\Delta T$$ とするようにしています。

以上。

