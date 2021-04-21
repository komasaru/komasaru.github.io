---
layout   : single
title    : "Ruby - 各種時刻体系の換算（by 自作 gem ライブラリ）！"
published: true
date     : 2016-09-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

以前、各種時刻体系や、 JST（日本標準時）から変換する Ruby スクリプトを紹介しました。

* [Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series/ "Ruby - 各種時刻系の換算！")

そこで使用したロジックを RubyGems ライブラリ化したので、そのライブラリを使用して JST から各種時刻体系へ換算してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した RubyGems ライブラリは "[mk_time](https://rubygems.org/gems/mk_time "mk_time - RubyGems.org")"
* 各種時刻体系については、過去記事「[Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series/ "Ruby - 各種時刻系の換算！")」を参照。
* ここでは自作ライブラリの詳細については説明しないが、 UTC を与えると以下の値を返すようにしている。
  - JST （日本標準時）
  - JD （ユリウス日）
  - T （ユリウス世紀数）
  - UTC - TAI （協定世界時と国際原子時の差 = うるう秒の総和）
  - LEAP_SEC （UTC - TAI と同じ）
  - DUT1 （UT1 と UTC の差 = ΔUT1）
  - UT1 （世界時1）
  - TAI （国際原子時）
  - ΔT （TT と UT1 の差）
  - TT （地球時）
  - TCG （地球重心座標時）
  - TCB （太陽系重心座標時）
  - TDB （太陽系力学時）
* DUT1 は、「[日本標準時プロジェクト Announcement of DUT1](http://jjy.nict.go.jp/QandA/data/dut1.html)」の値を使用している。（但し、一覧の範囲外は 0 に固定）
* ΔT は、うるう秒の総和（「[日本標準時プロジェクト　Information of Leap second](http://jjy.nict.go.jp/QandA/data/leapsec.html "日本標準時プロジェクト　Information of Leap second")」）が明確な場合は 32.184 - (UTC - TAI) - DUT1 で計算し、うるう秒の総和が明確でない場合は 「[NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)」の計算式で計算している。

### 1. Ruby スクリプトの作成

File: `conv_time.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#= 各種時刻換算
#  : 自作 RubyGems ライブラリ mk_time 使用版
#
# date          name            version
# 2016.07.27    mk-mode         1.00 新規作成
# 2016.09.13    mk-mode         1.01 ミリ秒に対応
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : JST（日本標準時）
#          書式：YYYYMMDD or YYYYMMDDHHMMSS or YYYYMMDDHHMMSSU...
#          無指定なら現在(システム日時)と判断。（上記の U はミリ秒）
#---------------------------------------------------------------------------------
# * 定数 DUT1 (= UT1 - UTC) の値は以下を参照。
#     [日本標準時プロジェクト Announcement of DUT1](http://jjy.nict.go.jp/QandA/data/dut1.html)
#   但し、値は 1.0 秒以下なので、精度を問わないなら 0.0 固定でもよい(?)
# * UTC - TAI（協定世界時と国際原子時の差）は、以下のとおりとする。
#   - 1972年07月01日より古い場合は一律で 10
#   - 2019年07月01日以降は一律で 37
#   - その他は、指定の値
#     [日本標準時プロジェクト　Information of Leap second](http://jjy.nict.go.jp/QandA/data/leapsec.html)
# * ΔT = TT - UT1 は、以下のとおりとする。
#   - 1972-01-01 以降、うるう秒挿入済みの年+2までは、以下で算出
#       ΔT = 32.184 - (UTC - TAI) - DUT1
#     UTC - TAI は [うるう秒実施日一覧](http://jjy.nict.go.jp/QandA/data/leapsec.html) を参照
#   - その他の期間は NASA 提供の略算式により算出
#     [NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)
#---------------------------------------------------------------------------------
require 'date'
require 'mk_time'

class ConvTime
  MSG_ERR = "[ERROR] Format: YYYYMMDD or YYYYMMDDHHMMSS or YYYYMMDDHHMMSSU..."
  JST_UTC = 9

  def initialize
    @jst = get_arg
    @utc = jst2utc(@jst)
  end

  def exec
    t = MkTime.new(@utc.strftime("%Y%m%d%H%M%S%3N"))
    display(t)
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}\n"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
  end

  private

  #=========================================================================
  # 引数取得
  #
  #   * コマンドライン引数を取得して日時の妥当性チェックを行う
  #=========================================================================
  def get_arg
    return Time.now unless arg = ARGV.shift
    (puts MSG_ERR; exit 0) unless arg =~ /^\d{8}$|^\d{14,}$/
    year, month, day = arg[ 0, 4].to_i, arg[ 4, 2].to_i, arg[ 6, 2].to_i
    hour, min,   sec = arg[ 8, 2].to_i, arg[10, 2].to_i, arg[12, 2].to_i
    usec = arg.split(//).size > 14 ? arg[14..-1].to_s : "0"
    (puts MSG_ERR; exit 0) unless Date.valid_date?(year, month, day)
    (puts MSG_ERR; exit 0) if hour > 23 || min > 59 || sec > 59
    d = usec.split(//).size
    return Time.new(year, month, day, hour, min, sec + Rational(usec.to_i, 10 ** d))
  rescue => e
    raise
  end

  #=========================================================================
  # JST -> UTC
  #
  # * UTC = JST - 9
  #
  # @param:  jst  (Time Object)
  # @return: utc  (Time Object)
  #=========================================================================
  def jst2utc(jst)
    return Time.at(jst - JST_UTC * 60 * 60)
  rescue => e
    raise
  end

  #=========================================================================
  # 結果出力
  #
  # @param:  t  (MkTime Object)
  # @return: <none>
  #=========================================================================
  def display(t)
    puts "      JST: #{Time.at(t.jst).strftime('%Y-%m-%d %H:%M:%S.%3N')}"
    puts "      UTC: #{Time.at(t.utc).strftime('%Y-%m-%d %H:%M:%S.%3N')}"
    puts "JST - UTC: #{JST_UTC}"
    puts sprintf("       JD: %.10f day", t.jd)
    puts sprintf("        T: %.10f century (= Julian Century Number)", t.t)
    puts "UTC - TAI: #{t.utc_tai} sec (= amount of leap seconds)"
    puts sprintf("     DUT1: %.1f sec", t.dut1)
    puts sprintf("  delta T: %.3f sec", t.dt)
    puts "      TAI: #{t.tai.strftime('%Y-%m-%d %H:%M:%S.%3N')}"
    puts "      UT1: #{t.ut1.strftime('%Y-%m-%d %H:%M:%S.%3N')}"
    puts "       TT: #{t.tt .strftime('%Y-%m-%d %H:%M:%S.%3N')}"
    puts "      TCG: #{t.tcg.strftime('%Y-%m-%d %H:%M:%S.%3N')}"
    puts "      TCB: #{t.tcb.strftime('%Y-%m-%d %H:%M:%S.%3N')}"
    puts "      TDB: #{t.tdb.strftime('%Y-%m-%d %H:%M:%S.%3N')}"
  rescue => e
    raise
  end
end

ConvTime.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to convert time system.](https://gist.github.com/komasaru/8739234af8031e78d0feba9620433c42 "Gist - Ruby script to convert time system.")

### 2. Ruby スクリプトの実行

引数に JST（日本標準時; UTC + 9）で年月日 or 年月日時分秒を指定して実行。（引数無指定で、システム日時を JST と判断する）

``` text
./conv_time.rb 2016091323595912345
      JST: 2016-09-13 23:59:59.123
      UTC: 2016-09-13 14:59:59.123
JST - UTC: 9
       JD: 2457645.1249884260 day
        T: 0.1670123200 century (= Julian Century Number)
UTC - TAI: -36 sec (= amount of leap seconds)
     DUT1: -0.3 sec
  delta T: 68.484 sec
      TAI: 2016-09-13 15:00:35.123
      UT1: 2016-09-13 14:59:58.823
       TT: 2016-09-13 15:01:07.307
      TCG: 2016-09-13 15:01:08.180
      TCB: 2016-09-13 15:01:26.732
      TDB: 2016-09-13 15:01:07.306
```

---

当方、時刻変換を使用したツールを作成することが多いため、ライブラリ化した次第です。

取り急ぎ、自身が使用する可能性のある時刻体系へしか変換できるようにしていませんが、今後他の時刻体系への変換も可能にするかもしれません。

また、うるう秒が実施されたり、 DUT1 が変更されたりした際には RubyGems ライブラリの定数を編集する必要がありますが、可能な限り対応するつもりです。

以上。

