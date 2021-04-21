---
layout   : single
title    : "Ruby - GMST（グリニッジ平均恒星時）の計算（IAU1982理論）！"
published: true
date     : 2018-08-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

以前、 Ruby でグリニッジ恒星時（視恒星時、平均恒星時等）を IAU2006 理論を使用して計算しました。

* [Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")

今回は、グリニッジ平均恒星時(GMST; Greenwich Mean Sidereal Time)を IAU1982 理論（David Vallado 氏による計算式）を使用して計算してみました。（人工衛星の軌道計算に使用する GMST が IAU1982 理論で計算したもののようなので）

<!--more-->

### 0. 前提条件

* Ruby 2.5.1-p57 での動作を想定。
* ここでは GMST についての説明はしない。
* 天文学的な計算については疎いため、誤りがあるかもしれない。

### 1. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `calc_gmst_iau_82.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= グリニジ平均恒星時 GMST(= Greenwich Mean Sidereal Time)の計算
#  : IAU1982 版
#
#
# Date          Author          Version
# 2018.06.15    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2018 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : 日時(UT1（世界時1）)
#          書式：YYYYMMDD or YYYYMMDDHHMMSS
#          無指定なら現在(システム日時)を UT1 とみなす。
#---------------------------------------------------------------------------------
#++
require 'date'

class CalcGmstIau82
  PI2 = Math::PI * 2    # => 6.283185307179586
  D2R = Math::PI / 180  # => 0.017453292519943295

  def initialize
    @ut1 = get_arg
  end

  #===========================================================================
  # Execution
  #===========================================================================
  def exec
    begin
      puts @ut1.strftime("%Y-%m-%d %H:%M:%S UT1")
      jd_ut1 = gc2jd(@ut1)
      puts "JD(UT1): #{jd_ut1}"
      gmst = calc_gmst(jd_ut1)
      gmst_d = gmst * 180 / Math::PI
      gmst_h = deg2hms(gmst_d)
      puts "GMST = #{gmst} rad.\n" +
           "     = #{gmst_d} deg.\n" +
           "     = #{gmst_h}"
    rescue => e
      msg = "[#{e.class}] #{e.message}\n"
      msg << e.backtrace.map { |tr| "\t#{tr}"}.join("\n")
      $stderr.puts msg
      exit 1
    end
  end

  private

  #===========================================================================
  # コマンドライン引数の取得
  # * コマンドライン引数無指定なら現在日時
  #
  # @return: Time オプジェクト
  #===========================================================================
  def get_arg
    unless arg = ARGV.shift
      t = Time.now
      return Time.new(t.year, t.month, t.day, t.hour, t.min, t.sec)
    end
    exit 0 unless arg =~ /^\d{8}$|^\d{14}$/
    year, month, day = arg[ 0, 4].to_i, arg[ 4, 2].to_i, arg[ 6, 2].to_i
    exit 0 unless Date.valid_date?(year, month, day)
    hour, min,   sec = arg[ 8, 2].to_i, arg[10, 2].to_i, arg[12, 2].to_i
    exit 0 if hour > 23 || min > 59 || sec > 59
    return Time.new(year, month, day, hour, min, sec)
  rescue => e
    raise
  end

  #===========================================================================
  # 年月日(グレゴリオ暦) -> ユリウス日(JD) 変換
  # : フリーゲルの公式を使用
  #     JD = int(365.25 * year)
  #        + int(year / 400)
  #        - int(year / 100)
  #        + int(30.59 * (month - 2))
  #        + day
  #        + 1721088
  #   ※上記の int(x) は厳密には、x を超えない最大の整数
  #     (ちなみに、準JDを求めるなら `+ 1721088` が `- 678912` となる)
  #
  # @param:  ut1 (UT1)
  # @return: jd (Julian Day)
  #===========================================================================
  def gc2jd(ut1)
    year, month, day = ut1.year, ut1.month, ut1.day
    hour, min, sec   = ut1.hour, ut1.min, ut1.sec
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
    t  = (sec / 3600.0 \
       + min / 60.0 \
       + hour) / 24.0
    return jd + t
  rescue => e
    raise
  end

  #===========================================================================
  # GMST（グリニッジ平均恒星時）計算
  # : IAU1982理論(by David Vallado)によるもの
  #     GMST = 18h 41m 50.54841s
  #          + 8640184.812866s T + 0.093104s T^2 - 0.0000062s T^3 
  #     (但し、 T = 2000年1月1日12時(UT1)からのユリウス世紀単位)
  #
  # @param:  jd_ut1 (UT1 に対するユリウス日
  # @return: gmst (グリニッジ平均恒星時(単位:radian))
  #===========================================================================
  def calc_gmst(jd_ut1)
    t_ut1= (jd_ut1 - 2451545.0) / 36525.0
    gmst =  67310.54841 \
         + (876600.0 * 3600.0 + 8640184.812866 \
         + (0.093104 \
         -  6.2e-6 * t_ut1) * t_ut1) * t_ut1
    gmst = (gmst * D2R / 240.0) % PI2
    gmst += PI2 if gmst < 0.0
    return gmst
  rescue => e
    raise
  end

  #===========================================================================
  # 99.999° -> 99h99m99s 変換
  #
  # @param:  deg  (Degree)
  # @return: "99 h 99 m 99.999 s"
  #===========================================================================
  def deg2hms(deg)
    sign = ""

    begin
      h = (deg / 15.0).truncate
      _m = (deg - h * 15.0) * 4.0
      m = _m.truncate
      s = (_m - m) * 60.0
      if s < 0
        s *= -1
        sign = "-"
      end
      return "%s%2d h %02d m %06.3f s" % [sign, h, m, s]
    rescue => e
      raise
    end
  end
end

CalcGmstIau82.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate GMST with IAU1982 theory.](https://gist.github.com/komasaru/9df64afd56fce51dfff1d0a03678f7ae "Gist - Ruby script to calculate GMST with IAU1982 theory.")

### 2. Ruby スクリプトの実行

まず、実行権限を付与。

``` text
$ chmod +x calc_gmst_iau_82.rb
```

そして、コマンドライン引数に UT1（世界時1）を `YYYYMMDD[HHMMSS]` の書式で指定して実行する。（引数無指定なら、現在時刻を UT1 とみなす）

``` text
$ ./calc_gmst_iau_82.rb 20180616
2018-06-16 00:00:00 UT1
JD(UT1): 2458285.5
GMST = 4.611451424267976 rad.
     = 264.2167040401474 deg.
     = 17 h 36 m 52.009 s
```

### 3. 計算結果の検証

まず、「[Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")」のスクリプトで計算した結果と比較してみる。  
このスクリプトは地球時(TT)を指定して計算するようにしているので正確に比較はできないが、UT1 が近似するように TT を指定して実行して結果を得ると、高い精度で一致することが分かる。

次に、国立天文台・暦象年表のツール「[グリニジ恒星時](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/gst.cgi "グリニジ恒星時")」で計算した値と比較してみる。  
時角で2/1000秒の誤差に収まることが確認できた。

---

以上。

