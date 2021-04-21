---
layout   : single
title    : "Ruby - 「ユリウス日 -> グレゴリオ暦」変換の検証！"
published: true
date     : 2016-07-25 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

前回は「グレゴリオ暦 -> ユリウス日」の変換を２種の計算式で行って相違について検証しましたが、今回は「ユリウス日 -> グレゴリオ暦」の変換を２種の計算式で行い、結果が同じになるかを検証してみました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 使用する２種の計算式は Web 上で見つけたもの。
* ここでの「ユリウス日」は JD(Julian Day) であり、JDN(Julian Day Number), CJD(Chronological Julian Day), MJD(Modified Julian Date) ではない。
* グレゴリオ暦は1582年10月15日からで、それ以前（1582年10月4日以前）はユリウス暦であるが、今回はそれは考慮しない。（ユリウス暦の1582年10月4日の翌日は、グレゴリオ暦の1582年10月15日）

### 1. 検証用 Ruby スクリプトの作成

以下のように作成してみた。（一旦フリーゲルの公式でグレゴリオ暦をユリウス日に変換後、そのユリウス日を２種の計算式でグレゴリオ暦に戻して相違をチェックするようにしている。チェックしたのは、年末年始、うるう年の２月末から３月への変わり目や、正午前後）

File: `verify_jd2gc.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#=ユリウス日 -> グレゴリオ暦 変換の検証(UTC ベース)
#
#   1. 一旦、グレゴリオ暦 -> ユリウス日 の変換。（by フリーゲルの公式
#   2. そのユリウス日を２種の計算式でグレゴリオ暦に変換。
#   3. ２種の計算式で算出した結果が等しいかチェック。
#
# date          name            version
# 2016.06.14    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------

class ExConvJdGc
  CHECKS = [
    [1999, 12, 31, 23, 59, 59],
    [2000,  1,  1,  0,  0,  0],
    [2016,  6, 14,  0,  0,  0],
    [2016,  6, 14, 11, 59, 59],
    [2016,  6, 14, 12,  0,  0],
    [2016,  6, 14, 23, 59, 59],
    [2016,  2, 28,  0,  0,  0],
    [2016,  2, 28, 11, 59, 59],
    [2016,  2, 28, 12,  0,  0],
    [2016,  2, 28, 23, 59, 59],
    [2016,  2, 29,  0,  0,  0],
    [2016,  2, 29, 11, 59, 59],
    [2016,  2, 29, 12,  0,  0],
    [2016,  2, 29, 23, 59, 59],
    [2016,  3,  1,  0,  0,  0]
  ]

  def run
    begin
      CHECKS.each do |dt|
        str = sprintf("* GC: %04d-%02d-%02d %02d:%02d:%02dUTC\n", *dt)
        jd = gc2jd(*dt)
        str << "  -> JD: #{jd}\n"
        gc_1, gc_2 = jd2gc1(jd), jd2gc2(jd)
        str << "  -> GC: #{gc_1}, #{gc_2}"
        str << " (NOT MATCH!)" unless gc_1 == gc_2
        puts str
      end
    rescue => e
    end
  end

  #=========================================================================
  # グレゴリオ暦 -> ユリウス日(JD)
  #
  # * フリーゲルの公式を使用する
  #     JD = int(365.25 * year)
  #        + int(year / 400)
  #        - int(year / 100)
  #        + int(30.59 * (month - 2))
  #        + day
  #        + 1721088.5
  #   ※上記の int(x) は厳密には、x を超えない最大の整数
  #   ※正子を整数とする JDN を求めるなら、 1721088.5 を 1721089 に置き換える
  #   ※修正ユリウス日 MJDを求めるなら + 1721088.5 を - 678912 に置き換える。
  #
  # @param:  year
  # @param:  month
  # @param:  day
  # @param:  hour
  # @param:  minute
  # @param:  second
  # @return: JD(Julian Day)
  #=========================================================================
  def gc2jd(year, month, day, hour = 0, min = 0, sec = 0)
    # 1月,2月は前年の13月,14月とする
    if month < 3
      year  -= 1
      month += 12
    end
    # 日付(整数)部分計算
    jd  = (365.25 * year).truncate \
        + (year / 400.0).truncate \
        - (year / 100.0).truncate \
        + (30.59 * (month - 2)).truncate \
        + day \
        + 1721088.5
    # 時間(小数)部分計算
    t  = (hour + min / 60.0 + sec / 3600.0) / 24.0
    return jd + t
  rescue => e
    raise
  end

  #=========================================================================
  # ユリウス日(JD) -> グレゴリオ暦 (Ver.1)
  #
  # * JD = JD + 0.5
  #   a = int(jd + 68569)
  #   b = int(a / 36524.25)
  #   c = a - int(36524.25 * b + 0.75)
  #   d = int((c + 1) / 365.2425)
  #   e = c - int(365.25 * d) + 31
  #   f = int(int(e) / 30.59)
  #   g = int(f.truncate / 11.0)
  #   year  = 100 * (b - 49) + d + g
  #   month = f - 12 * g + 2
  #   day   = e - (30.59 * f).truncate
  #   (hour, min, sec は 小数点以下の端数を処理するだけ)
  #
  # @param:  JD
  # @return: "YYYY-MM-DD HH:MM:SS"
  #=========================================================================
  def jd2gc1(jd)
    # 年月日
    jd += 0.5
    a = (jd + 68569).truncate
    b = (a / 36524.25).truncate
    c = a - (36524.25 * b + 0.75).truncate
    d = ((c + 1) / 365.2425).truncate
    e = c - (365.25 * d).truncate + 31
    f = (e.truncate / 30.59).truncate
    g = (f.truncate / 11.0).truncate
    year  = 100 * (b - 49) + d + g
    month = f - 12 * g + 2
    day   = e - (30.59 * f).truncate
    # 2月30日の補正
    if month == 2 && day > 28
      if year % 4 == 0 && year % 100 != 0 || year % 400 == 0
        day = 29
      else
        day = 28
      end
    end
    # 時分秒
    tm = 86400 * (jd - jd.truncate)
    hour = (tm / 3600.0).truncate
    min  = ((tm - 3600 * hour) / 60.0).truncate
    sec  = (tm - 3600 * hour - 60 * min).truncate
    return Time.new(year, month, day, hour, min, sec).strftime("%Y-%m-%d %H:%M:%SUTC")
  rescue => e
    raise
  end

  #=========================================================================
  # ユリウス日(JD) -> グレゴリオ暦 (Ver.2)
  #
  # * JD = JD + 0.5
  #   a = JD + 32044
  #   b = int((4 * a + 3) / 146097)
  #   c = a - int(146097 * b / 4)
  #   d = int((4 * c + 3) / 1461)
  #   e = c - int(1461 * d / 4)
  #   m = int((5 * e + 2) / 153)
  #   year  = 100 * b + d - 4800 + int(m / 10)
  #   month = m + 3 - 12 * int(m / 10)
  #   day   = e - int((153 * m + 2) / 5) + 1
  #   (hour, min, sec は 小数点以下の端数を処理するだけ)
  #
  # @param:  JD
  # @return: "YYYY-MM-DD HH:MM:SS"
  #=========================================================================
  def jd2gc2(jd)
    jd += 0.5
    # 年月日
    a = (jd + 32044).truncate
    b = ((4 * a + 3) / 146097.0).truncate
    c = a - (146097 * b / 4.0).truncate
    d = ((4 * c + 3) / 1461.0).truncate
    e = c - (1461 * d / 4.0).truncate
    m = ((5 * e + 2) / 153.0).truncate
    year  = 100 * b + d - 4800 + (m / 10.0).truncate
    month = m + 3 - 12 * (m / 10.0).truncate
    day   = e - ((153 * m + 2) / 5.0).truncate + 1
    # 2月30日の補正
    if month == 2 && day > 28
      if year % 4 == 0 && year % 100 != 0 || year % 400 == 0
        day = 29
      else
        day = 28
      end
    end
    # 時分秒
    t = 86400 * (jd - jd.truncate)
    hour = (t / 3600.0).truncate
    min  = ((t - 3600 * hour) / 60.0).truncate
    sec  = (t - 3600 * hour - 60 * min).truncate
    return Time.new(year, month, day, hour, min, sec).strftime("%Y-%m-%d %H:%M:%SUTC")
  rescue => e
    raise
  end
end

ExConvJdGc.new.run if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to verify of converting Julian Day to Gregorian Calendar.](https://gist.github.com/komasaru/e3532e2eabb9fdc724c4926e2b7eacd8 "Gist - Ruby script to verify of converting Julian Day to Gregorian Calendar.")

### 2. 検証用 Ruby スクリプトの実行

``` text
$ ./verify_jd2gc.rb
* GC: 1999-12-31 23:59:59UTC
  -> JD: 2451544.499988426
  -> GC: 1999-12-31 23:59:59UTC, 1999-12-31 23:59:59UTC
* GC: 2000-01-01 00:00:00UTC
  -> JD: 2451544.5
  -> GC: 2000-01-01 00:00:00UTC, 2000-01-01 00:00:00UTC
* GC: 2016-06-14 00:00:00UTC
  -> JD: 2457553.5
  -> GC: 2016-06-14 00:00:00UTC, 2016-06-14 00:00:00UTC
* GC: 2016-06-14 11:59:59UTC
  -> JD: 2457553.999988426
  -> GC: 2016-06-14 11:59:59UTC, 2016-06-14 11:59:59UTC
* GC: 2016-06-14 12:00:00UTC
  -> JD: 2457554.0
  -> GC: 2016-06-14 12:00:00UTC, 2016-06-14 12:00:00UTC
* GC: 2016-06-14 23:59:59UTC
  -> JD: 2457554.499988426
  -> GC: 2016-06-14 23:59:59UTC, 2016-06-14 23:59:59UTC
* GC: 2016-02-28 00:00:00UTC
  -> JD: 2457446.5
  -> GC: 2016-02-28 00:00:00UTC, 2016-02-28 00:00:00UTC
* GC: 2016-02-28 11:59:59UTC
  -> JD: 2457446.999988426
  -> GC: 2016-02-28 11:59:59UTC, 2016-02-28 11:59:59UTC
* GC: 2016-02-28 12:00:00UTC
  -> JD: 2457447.0
  -> GC: 2016-02-28 12:00:00UTC, 2016-02-28 12:00:00UTC
* GC: 2016-02-28 23:59:59UTC
  -> JD: 2457447.499988426
  -> GC: 2016-02-28 23:59:59UTC, 2016-02-28 23:59:59UTC
* GC: 2016-02-29 00:00:00UTC
  -> JD: 2457447.5
  -> GC: 2016-02-29 00:00:00UTC, 2016-02-29 00:00:00UTC
* GC: 2016-02-29 11:59:59UTC
  -> JD: 2457447.999988426
  -> GC: 2016-02-29 11:59:59UTC, 2016-02-29 11:59:59UTC
* GC: 2016-02-29 12:00:00UTC
  -> JD: 2457448.0
  -> GC: 2016-02-29 12:00:00UTC, 2016-02-29 12:00:00UTC
* GC: 2016-02-29 23:59:59UTC
  -> JD: 2457448.499988426
  -> GC: 2016-02-29 23:59:59UTC, 2016-02-29 23:59:59UTC
* GC: 2016-03-01 00:00:00UTC
  -> JD: 2457448.5
  -> GC: 2016-03-01 00:00:00UTC, 2016-03-01 00:00:00UTC
```

結果として、一致した。

---

Web 上で検索すると他にも計算式がヒットしますが、「グレゴリオ暦 -> ユリウス日」同様どれも同じでしょうね。（単に計算式をどう変形させるかだけの違い）

以上。

