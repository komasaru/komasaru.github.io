---
layout   : single
title    : "Ruby - 地球自転速度補正値 ΔT の計算！"
published: true
date     : 2016-07-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Ruby
---

地球自転速度補正値 delta T (ΔT) の計算式が [NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html "NASA - Polynomial Expressions for Delta T") に掲載されていますので、 Ruby で実装してみました。(-1900年〜3000年対応）

さらに、1972年から2018年までは、[うるう秒実施日一覧: NICT - 日本標準時プロジェクト](http://jjy.nict.go.jp/QandA/data/leapsec.html "うるう秒実施日一覧: NICT - 日本標準時プロジェクト")で公開されている「うるう秒」に 32.184(= TT（地球時） - TAI（国際原子時）) を加算した値とも比較できるようにしてみました。

各種時刻系については、当ブログ過去記事等をご参照ください。

* [Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series "Ruby - 各種時刻系の換算！")

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* NASA の計算式で計算できる西暦は -1900年から3000年。  
  （AD元年の前年はBC元年なので、今回の計算上の 0年 は BC1年、 -1900年 は BC1901年）
* うるう秒が実際されたのは1972年から2017年（当記事執筆時点）。（[うるう秒実施日一覧: NICT - 日本標準時プロジェクト](http://jjy.nict.go.jp/QandA/data/leapsec.html "うるう秒実施日一覧: NICT - 日本標準時プロジェクト")）  
  次回、いつ「うるう秒」が挿入（or 削除）されるかは不明なので、以下のスクリプト内の NICT 版メソッドでの対応は2019年直前までとする。
* 「ΔT = TT - UT1 = TAI - UTC - DUT1 + 32.184 = 32.184 - (UTC - TAI) - DUT1 = 32.184 - うるう秒総和 - DUT1」であることから、本来は DUT1(= UT1 - UTC) も考慮すべきであるが、今回は考慮しない。（誤差は大きくても 1 秒未満。参照「[日本標準時プロジェクト　Announcement of DUT1](http://jjy.nict.go.jp/QandA/data/dut1.html "日本標準時プロジェクト　Announcement of DUT1")」）

### 1. Ruby スクリプトの作成

File: `calc_delta_t.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 地球自転速度の補正値 delta T(ΔT)の計算
#  : [NASA - Polynomial Expressions for Delta T](http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)
#    の計算式を使用する。
#   1972年 - 2018年は、比較対象として「うるう年総和 + 32.184(TT - TAI)」の値も計算する。
#
# date          name            version
# 2016.06.15    mk-mode.com     1.00 新規作成
# 2016.07.20    mk-mode.com     1.01 第27回うるう秒調整に関する判定を追加
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : YYYYMM
#        * YYYYMM は UTC
#        * 無指定なら現在年月を UTC とみなす。
#---------------------------------------------------------------------------------
#++
require 'date'

class CalcDeltaT
  USAGE     = "[USAGE] ./calc_delta_t.rb [[+-]YYYYMM]"
  MSG_ERR_1 = "[ERROR] Year must be between -1999 and 3000!"
  MSG_ERR_2 = "[ERROR] Month must be between 1 and 12!"
  TT_TAI    = 32.184

  def initialize
    ym = ARGV.shift
    ym ||= Time.now.strftime("%Y%m")
    unless ym =~ /^[+-]?\d{6}$/
      puts USAGE
      exit 0
    end
    @year, @month = ym.scan(/([+-]?\d{4})(\d{2})/)[0].map(&:to_i)
    if @year < -1999 || @year > 3000
      puts MSG_ERR_1
      exit 0
    end
    if @month < 1 || @month > 12
      puts MSG_ERR_2
      exit 0
    end
    @y = @year + (@month - 0.5) / 12
  end

  def calc
    # NASA Ver. (-1999 - 3000)
    case
    when                  @year <  -500; dt = calc_before_m500
    when -500 <= @year && @year <   500; dt = calc_before_500
    when  500 <= @year && @year <  1600; dt = calc_before_1600
    when 1600 <= @year && @year <  1700; dt = calc_before_1700
    when 1700 <= @year && @year <  1800; dt = calc_before_1800
    when 1800 <= @year && @year <  1860; dt = calc_before_1860
    when 1860 <= @year && @year <  1900; dt = calc_before_1900
    when 1900 <= @year && @year <  1920; dt = calc_before_1920
    when 1920 <= @year && @year <  1941; dt = calc_before_1941
    when 1941 <= @year && @year <  1961; dt = calc_before_1961
    when 1961 <= @year && @year <  1986; dt = calc_before_1986
    when 1986 <= @year && @year <  2005; dt = calc_before_2005
    when 2005 <= @year && @year <  2050; dt = calc_before_2050
    when 2050 <= @year && @year <= 2150; dt = calc_until_2150
    when 2150 <  @year                 ; dt = calc_after_2150
    end
    str = sprintf("[%04d-%02d]", @year, @month)
    str << " delta T = #{dt}"

    # NICT Ver.  (1972-01-01 - 2018-12-31)
    if 1972 <= @year && @year <= 2018
      str << " (NICT: #{calc_nict})"
    end
    puts str
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
    exit 1
  end

  private

  # year < -500
  def calc_before_m500
    t = (@y - 1820) / 100.0
    dt = -20 + 32 * t ** 2
    return dt
  rescue => e
    raise
  end

  # -500 <= year && year < 500
  def calc_before_500
    t = @y / 100.0
    dt  = 10583.6         + \
         (-1014.41        + \
         (   33.78311     + \
         (   -5.952053    + \
         (   -0.1798452   + \
         (    0.022174192 + \
         (    0.0090316521) \
         * t) * t) * t) * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 500 <= year && year < 1600
  def calc_before_1600
    t = (@y - 1000) / 100.0
    dt  = 1574.2         + \
         (-556.01        + \
         (  71.23472     + \
         (   0.319781    + \
         (  -0.8503463   + \
         (  -0.005050998 + \
         (   0.0083572073) \
         * t) * t) * t) * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1600 <= year && year < 1700
  def calc_before_1700
    t = @y - 1600
    dt  = 120           + \
         ( -0.9808      + \
         ( -0.01532     + \
         (  1.0 / 7129.0) \
         * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1700 <= year && year < 1800
  def calc_before_1800
    t = @y - 1700
    dt  =  8.83           + \
         ( 0.1603         + \
         (-0.0059285      + \
         ( 0.00013336     + \
         (-1.0 / 1174000.0) \
         * t) * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1800 <= year && year < 1860
  def calc_before_1860
    t = @y - 1800
    dt  = 13.72          + \
         (-0.332447      + \
         ( 0.0068612     + \
         ( 0.0041116     + \
         (-0.00037436    + \
         ( 0.0000121272  + \
         (-0.0000001699  + \
         ( 0.000000000875) \
         * t) * t) * t) * t) * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1860 <= year && year < 1900
  def calc_before_1900
    t = @y - 1860
    dt  =  7.62          + \
         ( 0.5737        + \
         (-0.251754      + \
         ( 0.01680668    + \
         (-0.0004473624  + \
         ( 1.0 / 233174.0) \
         * t) * t) * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1900 <= year && year < 1920
  def calc_before_1920
    t = @y - 1900
    dt  = -2.79      + \
         ( 1.494119  + \
         (-0.0598939 + \
         ( 0.0061966 + \
         (-0.000197  ) \
         * t) * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1920 <= year && year < 1941
  def calc_before_1941
    t = @y - 1920
    dt  = 21.20     + \
         ( 0.84493  + \
         (-0.076100 + \
         ( 0.0020936) \
         * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1941 <= year && year < 1961
  def calc_before_1961
    t = @y - 1950
    dt  = 29.07      + \
         ( 0.407     + \
         (-1 / 233.0 + \
         ( 1 / 2547.0) \
         * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1961 <= year && year < 1986
  def calc_before_1986
    t = @y - 1975
    dt = 45.45      + \
        ( 1.067     + \
        (-1 / 260.0 + \
        (-1 / 718.0)  \
        * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 1986 <= year && year < 2005
  def calc_before_2005
    t = @y - 2000
    dt  = 63.86         + \
         ( 0.3345       + \
         (-0.060374     + \
         ( 0.0017275    + \
         ( 0.000651814  + \
         ( 0.00002373599) \
         * t) * t) * t) * t) * t
    return dt
  rescue => e
    raise
  end

  # 2005 <= year && year < 2050
  def calc_before_2050
    t = @y - 2000
    dt  = 62.92    + \
         ( 0.32217 + \
         ( 0.005589) \
         * t) * t
    return dt
  rescue => e
    raise
  end

  # 2050 <= year && year <= 2150
  def calc_until_2150
    dt  = -20 \
        + 32 * ((@y - 1820) / 100.0) ** 2
        - 0.5628 * (2150 - @y)
    return dt
  rescue => e
    raise
  end

  # 2150 < year
  def calc_after_2150
    t = (@y - 1820) / 100.0
    dt  = -20 + 32 * t ** 2
    return dt
  rescue => e
    raise
  end

  # NICT Ver.  (1972-01-01 - 2017-12-31)
  def calc_nict
    ym = sprintf("%04d%02d", @year, @month)
    case
    when ym < "197207"; dt = TT_TAI + 10
    when ym < "197301"; dt = TT_TAI + 11
    when ym < "197401"; dt = TT_TAI + 12
    when ym < "197501"; dt = TT_TAI + 13
    when ym < "197601"; dt = TT_TAI + 14
    when ym < "197701"; dt = TT_TAI + 15
    when ym < "197801"; dt = TT_TAI + 16
    when ym < "197901"; dt = TT_TAI + 17
    when ym < "198001"; dt = TT_TAI + 18
    when ym < "198107"; dt = TT_TAI + 19
    when ym < "198207"; dt = TT_TAI + 20
    when ym < "198307"; dt = TT_TAI + 21
    when ym < "198507"; dt = TT_TAI + 22
    when ym < "198801"; dt = TT_TAI + 23
    when ym < "199001"; dt = TT_TAI + 24
    when ym < "199101"; dt = TT_TAI + 25
    when ym < "199207"; dt = TT_TAI + 26
    when ym < "199307"; dt = TT_TAI + 27
    when ym < "199407"; dt = TT_TAI + 28
    when ym < "199601"; dt = TT_TAI + 29
    when ym < "199707"; dt = TT_TAI + 30
    when ym < "199901"; dt = TT_TAI + 31
    when ym < "200601"; dt = TT_TAI + 32
    when ym < "200901"; dt = TT_TAI + 33
    when ym < "201207"; dt = TT_TAI + 34
    when ym < "201507"; dt = TT_TAI + 35
    when ym < "201701"; dt = TT_TAI + 36
    when ym < "201901"; dt = TT_TAI + 37  # <= 第28回うるう秒実施までの暫定措置
    end
    return dt
  rescue => e
    raise
  end
end

CalcDeltaT.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate deltaT by NASA method.](https://gist.github.com/komasaru/c1d98d3abba16361f144ff1463f3dcf2 "Gist - Ruby script to calculate deltaT by NASA method.")

`t` のべき乗計算部分を特殊な記述に変更しているのは、乗算回数を減らして高速化するため。  
（例えば、`1 + 2 * t + 3 * t**2 + 4 * t**3` だと乗算回数が「6回」だが、`1 + (2 + (3 + 4*t)*t)*t` と書き換えることで乗算回数が「3回」になる）

### 2. Ruby スクリプトの実行

``` text
$ ./calc_delta_t.rb 000112
[0001-12] delta T = 10563.74738216227

$ ./calc_delta_t.rb 190007
[1900-07] delta T = -1.997290733102346

$ ./calc_delta_t.rb 200007
[2000-07] delta T = 64.02380536456008 (NICT: 64.184)

$ ./calc_delta_t.rb 201607
[2016-07] delta T = 69.77852857812505 (NICT: 68.184)

$ ./calc_delta_t.rb 300007
[3000-07] delta T = 4439.771605555555
```

---

NASA 版の計算式では細かい補正が行われてはいますが、当方は、うるう秒挿入（or 削除）が確実な場合は「うるう秒挿入（or 削除）総和 + 32.184(TT - TAI)」を ΔT とするようにしています。

以上。

