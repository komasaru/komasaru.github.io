---
layout   : single
title    : "Ruby - 平均黄道傾斜角の計算！"
published: true
date     : 2016-06-18 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

当ブログの以前の記事「[黄道傾斜角について！]({{site.baseurl}}/2016/04/10/about-ecliptic-obliquity "黄道傾斜角について！")」を元に、平均黄道傾斜角の計算を Ruby で実装してみました。（ただそれだけ）

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 黄道傾斜角については過去記事「[黄道傾斜角について！]({{site.baseurl}}/2016/04/10/about-ecliptic-obliquity "黄道傾斜角について！")」を参照。
* 平均黄道傾斜角の計算には、「[暦象年表の改訂について（国立天文台）（PDF 1.7MB）](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について")」で紹介されている計算式を使用する。
* ここで扱う「ユリウス日」は、「世界時(UT)」を換算したものではなく「地球時(TT)」を換算したもの。

### 1. Ruby スクリプトの作成

File: `mean_obliquity_ecliptic.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 平均黄道傾斜角の計算
#
# date          name            version
# 2016.05.26    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : 日時(TT（地球時）)
#          書式：YYYYMMDD or YYYYMMDDHHMMSS
#          無指定なら現在(システム日時)を地球時とみなす。
#---------------------------------------------------------------------------------
#++
require 'date'

class MeanObliquityEcliptic
  def initialize
    get_now
    get_arg
  end

  def calc
    jd  = calc_jd(@tt)
    t   = calc_t(jd)
    moe = calc_eps_a(t)
    puts "           地球時(TT): #{@tt.strftime("%Y-%m-%d %H:%M:%S")}"
    puts "       ユリウス日(JD): #{jd}"
    puts "   ユリウス世紀数(JC): #{t}"
    puts "平均黄道傾斜角(eps_a): #{moe} °"
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each { |tr| $stderr.puts "\t#{tr}"}
    exit 1
  end

  private

  # 現在日時の取得
  def get_now
    t = Time.now
    @tt = Time.new(t.year, t.month, t.day, t.hour, t.min, t.sec)
  rescue => e
    raise
  end

  # コマンドライン引数の取得
  def get_arg
    return unless arg = ARGV.shift
    exit 0 unless arg =~ /^\d{8}$|^\d{14}$/
    year, month, day = arg[ 0, 4].to_i, arg[ 4, 2].to_i, arg[ 6, 2].to_i
    hour, min,   sec = arg[ 8, 2].to_i, arg[10, 2].to_i, arg[12, 2].to_i
    exit 0 unless Date.valid_date?(year, month, day)
    exit 0 if hour > 23 || min > 59 || sec > 59
    @tt = Time.new(year, month, day, hour, min, sec)
  rescue => e
    raise
  end

  # ユリウス日の計算
  def calc_jd(tt)
    year, month, day = tt.year, tt.month, tt.day
    hour, min, sec   = tt.hour, tt.min, tt.sec

    begin
      # 1月,2月は前年の13月,14月とする
      if month < 3
        year  -= 1
        month += 12
      end
      # 日付(整数)部分計算
      jd  = (365.25 * year).floor       \
          + (year / 400.0).floor        \
          - (year / 100.0).floor        \
          + (30.59 * (month - 2)).floor \
          + day                         \
          + 1721088.5
      # 時間(小数)部分計算
      t  = (sec / 3600.0 + min / 60.0 + hour) / 24.0
      return jd + t
    rescue => e
      raise
    end
  end

  # ユリウス世紀数の計算
  def calc_t(jd)
    return (jd - 2451545) / 36525.0
  rescue => e
    raise
  end

  # 黄道傾斜角(εA)の計算
  def calc_eps_a(t)
    return (84381.406           + \
           (  -46.836769        + \
           (   -0.0001831       + \
           (    0.00200340      + \
           (   -5.76 * 10 ** -7 + \
           (   -4.34 * 10 ** -8)  \
           * t) * t) * t) * t) * t) / 3600.0
  rescue => e
    raise
  end
end

MeanObliquityEcliptic.new.calc if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calc a Mean Obliquity of the Ecliptic.](https://gist.github.com/komasaru/cfdab2ecfe998661f771643504ac875f "Gist - Ruby script to calc a Mean Obliquity of the Ecliptic.")

calc_eps_a メソッド内の `t` のべき乗計算部分を特殊な記述にしているのは、演算コストのかかる乗算回数を減らして高速化を図るため。（例えば、`1 + 2 * t + 3 * t**2 + 4 * t**3` だと乗算回数が「6回」だが、`1 + (2 + (3 + 4 * t) * t) * t` と書き換えることで乗算回数が「3回」になる）

### 2. Ruby スクリプトの実行

`YYYYMMDD` or `YYYYMMDDHHMMSS` で地球時(TT) を指定して実行する。（引数なしでシステム時刻を地球時とみなす）

``` text
$ ./mean_obliquity_ecliptic.rb 20160526
           地球時(TT): 2016-05-26 00:00:00
       ユリウス日(JD): 2457534.5
   ユリウス世紀数(JC): 0.1639835728952772
平均黄道傾斜角(eps_a): 23.437145984218514 °
```

### 3. 計算結果の検証

国立天文台・暦象年表のツールで計算した値と比較してみたが、かなりの精度で一致することが確認できた。

* [章動](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/nutation.cgi "章動")

### 4. 参考サイト

* [暦象年表の改訂について（PDF 1.7MB）](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について")

---

高精度な結果が得られるので、天体位置や暦の正確な計算に利用できそうです。

以上。

