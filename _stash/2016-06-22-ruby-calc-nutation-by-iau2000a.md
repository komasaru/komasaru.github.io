---
layout   : single
title    : "Ruby - 章動の計算（IAU2000A 理論）！"
published: true
date     : 2016-06-22 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

天体位置の回転に使用する章動を Ruby で実装して計算してみました。（使用するのは IAU2000A 理論）

歳差・章動の変換については、過去記事をご参照ください。

* [歳差・章動の変換行列について！]({{site.baseurl}}/2016/06/14/about-transformation-matrix-of-precession-nutation "歳差・章動の変換行列について！")

<!--more-->

### 0. 前提条件、事前知識

* 章動の計算には、 IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy) の提供する C ソースコードに実装されているアルゴリズム "nut00a.c" を使用する。
* IAU SOFA のソースコードには、 MHB2000(Mathews-Herring-Buffett, 2000) の理論や IERS2003(International Earth Rotation & Reference Systems service, 2003) の理論の使用が混在していることに留意。
* ここでは「章動（しょうどう）」そのものが何かについては詳細には説明しないが、簡単に説明すると、章動には
  - 黄経における章動($$\Delta\psi$$)
  - 黄道傾斜における章動($$\Delta\varepsilon$$)

  があり、それぞれが
  - 日月章動(luni-solar nutation)
  - 惑星章動(planetary nutation)

  で構成されている。
* また、算出アルゴリズムについてもここでは詳細には説明しない。（と言うより、煩雑で自分には説明できない）  
  参考サイトやソーススクリプトを参照のこと。
* 今回は IAU2000A 理論に基づいて計算しているが、簡略版の IAU2000B 理論 "nut00b.c" も存在する。
* IAU2000A 理論に若干の補正を加えた IAU2006 理論も存在するが、今回は非考慮。

### 1. 係数データの準備

計算に使用する係数データを用意する。

[IERS Conventions Center (2003)](http://iers-conventions.obspm.fr/conventions_archive/2003conventions.php "IERS Conventions Center") の [FTP archive](ftp://maia.usno.navy.mil/conventions/archive/2003 "FTP archive") ページから、日月章動用の係数データ [Lunisolar components](ftp://maia.usno.navy.mil/conventions/archive/2003/chapter5/tab5.3a.txt) と惑星章動用の係数データ [Planetary components](ftp://maia.usno.navy.mil/conventions/archive/2003/chapter5/tab5.3b.txt) を取得して、扱いやすいように整形する。

整形したものは以下にアップしている。

* [Calendar/nut_ls.txt at master - komasaru/Calendar](https://github.com/komasaru/Calendar/blob/master/nut_ls.txt "Calendar/nut_ls.txt at master - komasaru/Calendar")
* [Calendar/nut_pl.txt at master - komasaru/Calendar](https://github.com/komasaru/Calendar/blob/master/nut_pl.txt "Calendar/nut_pl.txt at master - komasaru/Calendar")

### 2. Ruby スクリプトの作成

IAU SOFA の提供する C ソースコードに実装されているアルゴリズム "nut00a.c" に則って作成している。

File: `nutation_model.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 章動の計算
#  : IAU2000A 章動理論(MHB2000, IERS2003)による
#    黄経における章動(Δψ), 黄道傾斜における章動(Δε) の計算
#
#  * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
#    の提供する C ソースコード "nut00a.c" で実装されているアルゴリズムを使用する。
#  * 係数データファイルの項目について
#    - 日月章動(luni-solar nutation, "dat_ls.txt")
#      (左から) L L' F D Om PS PST PC EC ECT ES
#    - 惑星章動(planetary nutation, "dat_pl.txt)
#      (左から) L L' F D Om Lm Lv Le LM Lj Ls Lu Ln Pa PS PC ES EC
#  * 参考サイト
#    - [SOFA Library Issue 2012-03-01 for ANSI C: Complete List](http://www.iausofa.org/2012_0301_C/sofa/)
#    - [USNO Circular 179](http://aa.usno.navy.mil/publications/docs/Circular_179.php)
#    - [IERS Conventions Center](http://62.161.69.131/iers/conv2003/conv2003_c5.html)
#
# Date          Author          Version
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

class NutationModel
  DAT_LS = "nut_ls.txt"
  DAT_PL = "nut_pl.txt"
  PI     = 3.141592653589793238462643     # PI
  PI2    = 6.283185307179586476925287     # 2 * PI
  AS2R   = 4.848136811095359935899141e-6  # Arcseconds to radians
  TURNAS = 1296000.0                      # Arcseconds in a full circle
  U2R    = AS2R / 1e7                     # Units of 0.1 microarcsecond to radians
  R2D    = 57.29577951308232087679815     # Radians to degrees
  D2S    = 3600.0                         # Degrees to seconds

  def initialize
    get_now
    get_arg
    @dat_ls = get_data(DAT_LS)
    @dat_pl = get_data(DAT_PL)
  end

  def calc
    begin
      jd  = calc_jd(@tt)
      t   = calc_t(jd)
      dpsi_ls, deps_ls = calc_lunisolar(t)
      dpsi_pl, deps_pl = calc_planetary(t)
      dpsi, deps = dpsi_ls + dpsi_pl, deps_ls + deps_pl
      dpsi_d, deps_d = dpsi * R2D, deps * R2D
      dpsi_s, deps_s = dpsi_d * D2S, deps_d * D2S
      # Results
      puts @tt.strftime("  [%Y-%m-%d %H:%M:%S TT]")
      puts "  DeltaPsi = #{dpsi} rad"
      puts "           = #{dpsi_d} °"
      puts "           = #{dpsi_s} ″"
      puts "  DeltaEps = #{deps} rad"
      puts "           = #{deps_d} °"
      puts "           = #{deps_s} ″"
    rescue => e
      msg = "[#{e.class}] #{e.message}\n"
      msg << e.backtrace.map { |tr| "\t#{tr}"}.join("\n")
      $stderr.puts msg
      exit 1
    end
  end

  private

  # Getting a current time
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

  # テキストファイルからデータ取得
  # * luni-solar の最初の5列、planetary の最初の14列は整数に、
  #   残りの列は浮動小数点*10000にする
  def get_data(file)
    c = file == DAT_LS ? 5 : 14
    return File.open(file, "r").read.split("\n")[1..-1].map do |l|
      l = l.sub(/^\s+/, "").split(/\s+/)
      l[0, c].map(&:to_i) + l[c..-1].map { |a| a.sub(/\./, "").to_i }
    end
  rescue => e
    raise
  end

  # 日月章動(luni-solar nutation)の計算
  def calc_lunisolar(t)
    dp, de = 0.0, 0.0

    begin
      l  = calc_l_iers2003(t)
      lp = calc_lp_mhb2000(t)
      f  = calc_f_iers2003(t)
      d  = calc_d_mhb2000(t)
      om = calc_om_iers2003(t)
      @dat_ls.reverse.each do |x|
        arg = (x[0] * l + x[1] * lp + x[2] * f +
               x[3] * d + x[4] * om) % PI2
        sarg, carg = Math.sin(arg), Math.cos(arg)
        dp += (x[5] + x[6] * t) * sarg + x[ 7] * carg
        de += (x[8] + x[9] * t) * carg + x[10] * sarg
      end
      return [dp * U2R, de * U2R]
    rescue => e
      raise
    end
  end

  # 惑星章動(planetary nutation)
  def calc_planetary(t)
    dp, de = 0.0, 0.0

    begin
      l   = calc_l_mhb2000(t)
      f   = calc_f_mhb2000(t)
      d   = calc_d_mhb2000_2(t)
      om  = calc_om_mhb2000(t)
      pa  = calc_pa_iers2003(t)
      lme = calc_lme_iers2003(t)
      lve = calc_lve_iers2003(t)
      lea = calc_lea_iers2003(t)
      lma = calc_lma_iers2003(t)
      lju = calc_lju_iers2003(t)
      lsa = calc_lsa_iers2003(t)
      lur = calc_lur_iers2003(t)
      lne = calc_lne_mhb2000(t)
      @dat_pl.reverse.each do |x|
        arg = (x[ 0] * l   + x[ 2] * f   + x[ 3] * d   + x[ 4] * om  +
               x[ 5] * lme + x[ 6] * lve + x[ 7] * lea + x[ 8] * lma +
               x[ 9] * lju + x[10] * lsa + x[11] * lur + x[12] * lne +
               x[13] * pa) % PI2
        sarg, carg = Math.sin(arg), Math.cos(arg)
        dp += x[14] * sarg + x[15] * carg
        de += x[16] * sarg + x[17] * carg
      end
      return [dp * U2R, de * U2R]
    rescue => e
      raise
    end
  end

  # Mean anomaly of the Moon (IERS 2003)
  def calc_l_iers2003(t)
    return ((    485868.249036  + \
            (1717915923.2178    + \
            (        31.8792    + \
            (         0.051635  + \
            (        -0.00024470) \
            * t) * t) * t) * t) % TURNAS) * AS2R
  rescue => e
    raise
  end

  # Mean anomaly of the Sun (MHB2000)
  def calc_lp_mhb2000(t)
    return ((  1287104.79305   + \
            (129596581.0481    + \
            (       -0.5532    + \
            (        0.000136  + \
            (       -0.00001149) \
            * t) * t) * t) * t) % TURNAS) * AS2R
  rescue => e
    raise
  end

  # Mean longitude of the Moon minus that of the ascending node (IERS 2003)
  def calc_f_iers2003(t)
    return ((     335779.526232 + \
            (1739527262.8478    + \
            (       -12.7512    + \
            (        -0.001037  + \
            (         0.00000417) \
            * t) * t) * t) * t) % TURNAS) * AS2R
  rescue => e
    raise
  end

  # Mean elongation of the Moon from the Sun (MHB2000)
  def calc_d_mhb2000(t)
    return ((   1072260.70369   + \
            (1602961601.2090    + \
            (        -6.3706    + \
            (         0.006593  + \
            (        -0.00003169) \
            * t) * t) * t) * t) % TURNAS) * AS2R
  rescue => e
    raise
  end

  # Mean longitude of the ascending node of the Moon (IERS 2003)
  def calc_om_iers2003(t)
   return ((    450160.398036  + \
           (  -6962890.5431    + \
           (         7.4722    + \
           (         0.007702  + \
           (        -0.00005939) \
           * t) * t) * t) * t) % TURNAS) * AS2R
  rescue => e
    raise
  end

  # Mean anomaly of the Moon (MHB2000)
  def calc_l_mhb2000(t)
    return (2.35555598 + 8328.6914269554 * t) % PI2
  rescue => e
    raise
  end

  # Mean longitude of the Moon minus that of the ascending node (MHB2000)
  def calc_f_mhb2000(t)
    return (1.627905234 + 8433.466158131 * t) % PI2
  rescue => e
    raise
  end

  # Mean elongation of the Moon from the Sun (MHB2000)
  def calc_d_mhb2000_2(t)
    return (5.198466741 + 7771.3771468121 * t) % PI2
  rescue => e
    raise
  end

  # Mean longitude of the ascending node of the Moon (MHB2000)
  def calc_om_mhb2000(t)
    return (2.18243920 - 33.757045 * t) % PI2
  rescue => e
    raise
  end

  # General accumulated precession in longitude (IERS 2003)
  def calc_pa_iers2003(t)
    return (0.024381750 + 0.00000538691 * t) * t
  rescue => e
    raise
  end

  # Mercury longitudes (IERS 2003)
  def calc_lme_iers2003(t)
    return (4.402608842 + 2608.7903141574 * t) % PI2
  rescue => e
    raise
  end

  # Venus longitudes (IERS 2003)
  def calc_lve_iers2003(t)
    return (3.176146697 + 1021.3285546211 * t) % PI2
  rescue => e
    raise
  end

  # Earth longitudes (IERS 2003)
  def calc_lea_iers2003(t)
    return (1.753470314 + 628.3075849991 * t) % PI2
  rescue => e
    raise
  end

  # Mars longitudes (IERS 2003)
  def calc_lma_iers2003(t)
    return (6.203480913 + 334.0612426700 * t) % PI2
  rescue => e
    raise
  end

  # Jupiter longitudes (IERS 2003)
  def calc_lju_iers2003(t)
    return (0.599546497 + 52.9690962641 * t) % PI2
  rescue => e
    raise
  end

  # Saturn longitudes (IERS 2003)
  def calc_lsa_iers2003(t)
    return (0.874016757 + 21.3299104960 * t) % PI2
  rescue => e
    raise
  end

  # Uranus longitudes (IERS 2003)
  def calc_lur_iers2003(t)
    return (5.481293872 + 7.4781598567 * t) % PI2
  rescue => e
    raise
  end

  # Neptune longitude (MHB2000)
  def calc_lne_mhb2000(t)
    return (5.321159000 + 3.8127774000 * t) % PI2
  rescue => e
    raise
  end
end

nm = NutationModel.new
nm.calc
{% endhighlight %}

* [GitHub - komasaru/Calendar](https://github.com/komasaru/Calendar "GitHub - komasaru/Calendar")

参考までに、スクリプト中に出現する用語の意味は以下のとおり。

``` text
* Mean anomaly of the Moon                                    （平均近点角：月）
* Mean longitude of the Moon minus that of the ascending node （平均黄経：月（昇交点を引いたもの））
* Mean longitude of the Moon's ascending node                 （平均黄経：月の昇交点）
* Mean longitude of Mercury                                   （平均黄経：水星）
* Mean longitude of Venus                                     （平均黄経：金星）
* Mean longitude of Earth                                     （平均黄経：地球）
* Mean longitude of Mars                                      （平均黄経：火星）
* Mean longitude of Jupiter                                   （平均黄経：木星）
* Mean longitude of Saturn                                    （平均黄経：土星）
* Mean longitude of Uranus                                    （平均黄経：天王星）
* General accumulated precession in longitude                 （一般歳差：J2000.0 からの蓄積）
```

### 3. Ruby スクリプトの実行

`YYYYMMDD` or `YYYYMMDDHHMMSS` で地球時(TT) を指定して実行する。（引数なしでシステム時刻を地球時とみなす）

``` text
./nutation_model.rb 20160528000000
  [2016-05-28 00:00:00 TT]
  DeltaPsi = -2.1633261603237626e-05 rad
           = -0.0012394945869679329 °
           = -4.462180513084558 ″
  DeltaEps = -4.591610134570194e-05 rad
           = -0.002630798818803681 °
           = -9.47087574769325 ″
```

### 4. 計算結果の検証

国立天文台・暦象年表のツールで計算した値と比較してみたが、一致することが確認できた。

* [章動](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/nutation.cgi "章動")

### 5. 参考サイト

* [SOFA Library Issue 2016-05-03 for ANSI C: Complete List](http://www.iausofa.org/2016_0503_C/CompleteList.html "SOFA Library Issue 2016-05-03 for ANSI C: Complete List")
* [USNO Circular 179](http://aa.usno.navy.mil/publications/docs/Circular_179.php "USNO Circular 179")
* [IERS Conventions Center (2003)](http://iers-conventions.obspm.fr/conventions_archive/2003conventions.php "IERS Conventions Center")

（USNO（米・海軍天文台）のサイトは、環境（プロキシ設定）によっては閲覧不可）

---

今回の章動の計算も、天体位置やこよみを正確に計算する際に必要になってきます。

当方、今後挑戦してみようと考えております。（可能ならば）

以上。

