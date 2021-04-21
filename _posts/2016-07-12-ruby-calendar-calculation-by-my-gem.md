---
layout   : single
title    : "Ruby - カレンダー計算 gem の作成！"
published: true
date     : 2016-07-12 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

当方、 [旧暦計算サンプルプログラム](http://www.vector.co.jp/soft/dos/personal/se016093.html) を参考にカレンダーを計算する Ruby スクリプトを作成しておりました（実際には多くの部分を微調整した）が、あらゆる面で流用したくなったために、今回 RubyGems ライブラリにし公開することとしました。

**但し、微調整はしているもののこのアルゴリズムでは若干の誤差が発生します。また、計算する日によっては月齢が不正になることもあります。  
2008年以降でしたら、海上保安庁海洋情報部提供の[コンピュータによる天体の位置計算式](http://www1.kaiho.mlit.go.jp/KOHO/index.html "天文・暦情報 - 海上保安庁・海洋情報部")で計算したほうが精度が高いです。**

* [Ruby - 太陽・月視位置計算 gem の作成（海保略算式版）！]({{site.baseurl}}/2016/07/08/ruby-calc-sun-moon-location-by-eph-jcg-gem "Ruby - 太陽・月視位置計算 gem の作成（海保略算式版）！")

**さらには、 NASA の機関 JPL(Jet Propulsion Laboratory) の提供する DE430 などのデータを使用して計算するほうがより高精度です。**

* [Ruby - カレンダー計算 gem の作成（JPL DE430 使用の高精度版）！]({{site.baseurl}}/2016/10/26/ruby-calendar-calculation-by-my-gem-jpl/ "Ruby - カレンダー計算 gem の作成（JPL DE430 使用の高精度版）！")

以下では、[旧暦計算サンプルプログラム](http://www.vector.co.jp/soft/dos/personal/se016093.html)を元に作成した gem の簡単な利用方法をご紹介します。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した gem ライブラリの名称は "[mk_calendar](https://rubygems.org/gems/mk_calendar "mk_calendar - RubyGems.org")" で、計算対象年月日は 0000-01-01 〜 9999-01-01。  
  （但し、祝日は当記事執筆時点の「[国民の祝日に関する法律](http://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)」によるもの）
* 当ライブラリの計算可能項目
  + ユリウス日(UTC), ユリウス日(JST)
  + 曜日
  + 祝日
  + 二十四節気
  + 雑節
  + 干支（日）
  + 節句
  + 視黄経（太陽）
  + 視黄経（月）
  + 月齢（正午）
  + 旧暦
    - 年
    - 閏月フラグ
    - 月
    - 日

### 1. インストール

``` text
$ sudo gem install mk_calendar
```

### 2. Ruby スクリプトの作成例

File: `calendar.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
require 'date'
require 'mk_calendar'

class Calendar
  USAGE   = "[USAGE] .calendar.rb [YYYYMMDD]"
  MSG_ERR = "[ERROR] Invalid date!"

  def initialize
    @date = ARGV.shift
    @date ||= Time.now.strftime("%Y%m%d")
    unless @date =~ /\d{8}/
      puts USAGE
      exit 0
    end
    unless Date.valid_date?(@date[0,4].to_i, @date[4,2].to_i, @date[6,2].to_i)
      puts MSG_ERR
      exit 0
    end
  end

  def calc
    @obj = MkCalendar.new(@date)
    str =  sprintf("%04d-%02d-%02d", @obj.year, @obj.month, @obj.day)
    str << " #{@obj.yobi}曜日"
    str << " #{@obj.holiday}" unless @obj.holiday == ""
    str << " #{@obj.jd}UTC(#{@obj.jd_jst}JST) #{@obj.kanshi} "
    str << sprintf("%04d-%02d-%02d", @obj.oc[0], @obj.oc[2], @obj.oc[3])
    str << "(閏)" if @obj.oc[1] == 1
    str << " #{@obj.oc[4]}"
    str << " #{@obj.sekki_24}" unless @obj.sekki_24 == ""
    str << " #{@obj.zassetsu}" unless @obj.zassetsu == ""
    str << " #{@obj.sekku}" unless @obj.sekku == ""
    str << " #{@obj.lambda_sun} #{@obj.lambda_moon} #{@obj.moonage}"
    puts str
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
    exit 1
  end
end

Calendar.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate a Japan's calendar with a selfmade gem library.](https://gist.github.com/komasaru/2d5e95a70bf6accb42e6f1140a746177 "Gist - Ruby script to calculate a Japan's calendar with a selfmade gem library.")

### 3. サンプルスクリプトの実行

``` text
$ ./ex_calendar.rb 20160320
2016-03-20 日曜日 春分の日 2457467.125UTC(2457467.5JST) 辛丑 2016-02-12 先勝
 春分 彼岸(春) 359.44136890287837 136.31180004624142 11.045331036671996
```

（実際には1行で出力）

### 4. gem ライブラリ

* [mk_calendar - RubyGems.org](https://rubygems.org/gems/mk_calendar "mk_calendar - RubyGems.org")
* [komasaru/mk_calendar: Calendar library including Japan's old-calendar.](https://github.com/komasaru/mk_calendar "komasaru/mk_calendar: Calendar library including Japan's old-calendar.")

---

以前作成した Ruby スクリプトを何かと応用したかったので gem ライブラリ化した次第です。

以上。

