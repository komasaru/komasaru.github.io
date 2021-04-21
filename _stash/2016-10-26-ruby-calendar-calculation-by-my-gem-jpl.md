---
layout   : single
title    : "Ruby - カレンダー計算 gem の作成（JPL DE430 使用の高精度版）！"
published: true
date     : 2016-10-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

以前、 [旧暦計算サンプルプログラム](http://www.vector.co.jp/soft/dos/personal/se016093.html) を参考に作成したカレンダー計算 RubyGems ライブラリを作成しました。（但し、実際には多くの部分で微調整している）

* [Ruby - カレンダー計算 gem の作成！]({{site.baseurl}}/2016/07/12/ruby-calendar-calculation-by-my-gem/ "Ruby - カレンダー計算 gem の作成！")

但し、微調整はしているものの、このアルゴリズムは略算式を使用しているため、当然ながら若干の誤差が発生します。

そこで、 NASA の機関 JPL(Jet Propulsion Laboratory) の提供する太陽・月・惑星の正確な位置データ DE430 などを使用して計算する RubyGems ライブラリを作成しました。

以下では、作成した RubyGems ライブラリの簡単な利用方法をご紹介します。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した gem ライブラリの名称は "[mk_cal_jpl](https://rubygems.org/gems/mk_cal_jpl "mk_cal_jpl - RubyGems.org")" で、計算対象年月日は 1549-12-21 〜 2650-01-25（但し、使用する JPL DE430 バイナリデータを別途作成し直している場合は、そこで設定した期間）。
* 但し、祝日は当記事執筆時点の「[国民の祝日に関する法律](http://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)」によるもの。
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

> 【2017-03-13 追記】  
> 当初、月齢計算が正しくないこと（直近の朔でなく2回前の朔からの経過日数を計算してしまうこと）があったが、直近の朔を取得するアルゴリズムを見直し、正しく計算できるように改修した。  
> また、計算に時間のかかる部分をあらかじめ計算しておき、それらを定数として取り込むよう処理を変更した。それにより、計算にかかる時間は1秒程度になった。  
> 【追記ここまで】

### 1. 事前準備

JPL DE430 のデータを使用するので、バイナリデータ "linux_p1550p2650.430" を[こちら](ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/)から取得し “JPLEPH” とリネームして適当なディレクトリに配置しておく。

ただし、このバイナリファイルはサイズが大きいので、必要な年代のテキストデータのみをマージ＆バイナリ化してもよい。（参考：[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data/ "JPL 天文暦データのバイナリ化！")）

### 2. RubyGems ライブラリのインストール

``` text
$ sudo gem install mk_cal_jpl
```

### 3. Ruby スクリプトの作成例

File: `cal_jpl.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= カレンダー
#  : 自作 RubyGems ライブラリ MkCalJpl を使用
#  ( 高野氏のプログラムを改良した MkCalendar を、 JPL DE430 から正確な位置データを
#    取得して計算するよう改良したもの )
#
# date          name            version
# 2016.09.17    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : JST（日本標準時）
#          書式：YYYYMMDD
#          無指定なら現在(システム日時)と判断。
#---------------------------------------------------------------------------------
#++
require 'date'
require 'mk_cal_jpl'

class CalJpl
  USAGE   = "[USAGE] .cal_jpl.rb [YYYYMMDD]"
  MSG_ERR = "[ERROR] Invalid date!"
  BIN_PATH = "/path/to/JPLEPH"

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
    @obj = MkCalJpl.new(BIN_PATH, @date)
    oc = @obj.oc
    str =  sprintf("%04d-%02d-%02d", @obj.year, @obj.month, @obj.day)
    str << " #{@obj.yobi}曜日"
    str << " #{@obj.holiday}" unless @obj.holiday == ""
    str << " #{@obj.jd}UTC(#{@obj.jd_jst}JST) #{@obj.kanshi} "
    str << sprintf("%04d-%02d-%02d", oc[0], oc[2], oc[3])
    str << "(閏)" if oc[1] == 1
    str << " #{oc[4]}"
    str << " #{@obj.sekki_24}" unless @obj.sekki_24 == ""
    str << " #{@obj.zassetsu}" unless @obj.zassetsu == ""
    str << " #{@obj.sekku}" unless @obj.sekku == ""
    str << " #{@obj.lambda} #{@obj.alpha} #{@obj.moonage}"
    puts str
    # ついでに、黄経（月、太陽）から月相を計算
    # diff = @obj.alpha - @obj.lambda
    # diff += 360 if diff < 0
    # moonphase = (diff / 360.0 * 28).round
    # puts "\n月相: #{moonphase}"
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
    exit 1
  end
end

CalJpl.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate a Japan's calendar with a selfmade gem library, using JPL DE430.](https://gist.github.com/komasaru/5d2d3790cf511b719af675211901ae06 "Gist - Ruby script to calculate a Japan's calendar with a selfmade gem library, using JPL DE430.")

### 4. サンプルスクリプトの実行

※高精度＆高コストな計算を行っているので、非力なマシンだと計算終了まで20秒くらいかかる。

``` text
$ ./cal_jpl.rb 20161001
2016-10-01 土曜日 2457662.125UTC(2457662.5JST) 丙辰 2016-09-01 先負 
187.87444572124207 183.61161088402608 29.747843803837895
```

（実際には1行で出力）

### 5. gem ライブラリ

* [mk_cal_jpl - RubyGems.org](https://rubygems.org/gems/mk_cal_jpl"mk_cal_jpl - RubyGems.org")
* [komasaru/mk_calendar: Calendar library including Japan's old-calendar, using JPL DE430.](https://github.com/komasaru/mk_cal_jpl "komasaru/mk_calendar: Calendar library including Japan's old-calendar, using JPL DE430.")

---

以前作成した Ruby スクリプトを何かと応用したかったので gem ライブラリ化した次第です。

以上。

