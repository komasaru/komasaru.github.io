---
layout   : single
title    : "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！"
published: true
date     : 2016-08-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

グリニッジ視恒星時(GAST; Greenwich Apparent Sidereal Time)、グリニッジ平均恒星時(GMST; Greenwich Mean Sidereal Time)、分点均差(EE; Equation of Equinoxes
)の計算を Ruby で実装してみました。（使用するのは IAU2006 理論 etc.）

> 【2016-09-06 追記】  
> 以下で紹介の Ruby スクリプトを gem ライブラリにしました。  
> [mk_greenwich - RubyGems.org](https://rubygems.org/gems/mk_greenwich "mk_greenwich - RubyGems.org") もご参照ください。  
> 【追記ここまで】

<!--more-->

### 0. 前提条件、事前知識

* グリニッジ時刻の計算には、 IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy) の提供する C ソースコードに実装されている数々のアルゴリズムを使用する。
* IAU SOFA のソースコードには、 MHB2000(Mathews-Herring-Buffett, 2000) の理論や IERS2003(International Earth Rotation & Reference Systems service, 2003) の理論の使用が混在していることに留意。
* ここでは「グリニッジ時刻」そのものが何かについては詳細には説明しない。
* また、算出アルゴリズムについてもここでは詳細には説明しない。（と言うより、煩雑で自分には説明できない）  
  参考サイトやソーススクリプトを参照のこと。
* グリニッジ時刻の計算に使用する章動の計算は、過去記事「[Ruby - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2016/06/22/ruby-calc-nutation-by-iau2000a/ "Ruby - 章動の計算（IAU2000A 理論）！")」もご参照ください。（但し、IAU2000A 理論を若干補正した IAU2006 理論としている）

### 1. Ruby スクリプトの作成

* 以下はメインのスクリプト。
* ライブラリも多数作成しているが、紙面の都合上割愛する。
  GitHub リポジトリとして公開しているので、「[komasaru/greenwich_time: Greenwich Time calculator.](https://github.com/komasaru/greenwich_time "komasaru/greenwich_time: Greenwich Time calculator.")」をご参照ください。
* あらゆるメソッドは IAU SOFA の提供する C ソースコードに実装されているアルゴリズムに則って作成している。
* 当スクリプトでは計算の途中経過も出力するようにしている。
* 元々、スニペット的に作り始めたスクリプトなので、 RSpec 等のテストは実装しておりません。  
  （今後別途 RubyGems ライブラリ化する予定（あらゆる準備が整ったら））

File: `calc_greenwich_time_old.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= グリニジ視恒星時 GAST(= Greenwich Apparent Sidereal Time)等の計算
#  : IAU2006 による計算
#
#  * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
#    の提供する C ソースコード "gst06.c" 等で実装されているアルゴリズムを使用する。
#  * 参考サイト
#    - [SOFA Library Issue 2016-05-03 for ANSI C: Complete List](http://www.iausofa.org/2016_0503_C/CompleteList.html)
#    - [USNO Circular 179](http://aa.usno.navy.mil/publications/docs/Circular_179.php)
#    - [IERS Conventions Center](http://62.161.69.131/iers/conv2003/conv2003_c5.html)
#
# Date          Author          Version
# 2016.06.21    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : 日時(TT（地球時）)
#          書式：YYYYMMDD or YYYYMMDDHHMMSS
#          無指定なら現在(システム日時)を地球時とみなす。
#---------------------------------------------------------------------------------
#++
$: << File.dirname(__FILE__)
require 'date'
require 'lib/greenwich'
include Greenwich

class CalcGreenwichTime
  def initialize
    @tt = get_arg
  end

  def calc
    begin
      # Time calculation
      jd     = calc_jd(@tt)
      jc     = calc_jc(jd)
      dt     = calc_dt(@tt)
      ut1    = tt2ut1(@tt, dt)
      jd_ut1 = calc_jd(ut1)
      puts @tt.strftime("     TT = %Y-%m-%d %H:%M:%S.%L")
      puts ut1.strftime("    UT1 = %Y-%m-%d %H:%M:%S.%L")
      puts " JD(TT) = #{jd}"
      puts "JD(UT1) = #{jd_ut1}"
      puts "     JC = #{jc}"
      puts "     DT = #{dt}"

      # Fukushima-Williams angles for frame bias and precession.
      #   Ref: iauPfw06(date1, date2, &gamb, &phib, &psib, &epsa)
      prec = Precession.new(jc)
      gam_b, phi_b, psi_b = prec.calc_pfw_06
      eps_a               = prec.calc_obl_06
      puts " GAMMA_ = #{gam_b}"
      puts "   PHI_ = #{phi_b}"
      puts "   PSI_ = #{psi_b}"
      puts "  EPS_A = #{eps_a}"

      # Nutation components.
      #   Ref: iauNut06a(date1, date2, &dp, &de)
      d_psi, d_eps = Nutation.new(jc).calc_nut_06_a
      puts "  D_PSI = #{d_psi}"
      puts "  D_EPS = #{d_eps}"

      # Equinox based nutation x precession x bias matrix.
      #   Ref: iauFw2m(gamb, phib, psib + dp, epsa + de, rnpb)
      r_mtx = RotationFw.new.fw2m(gam_b, phi_b, psi_b + d_psi, eps_a + d_eps)
      puts "  r_mtx = #{r_mtx}"

      # Extract CIP coordinates.
      #   Ref: iauBpn2xy(rnpb, &x, &y)
      cc = CipCio.new(jc)
      x, y = cc.bpn2xy(r_mtx)
      puts "      x = #{x}"
      puts "      y = #{y}"

      # The CIO locator, s.
      #   Ref: iauS06(tta, ttb, x, y)
      s = cc.calc_s_06(x, y)
      puts "      s = #{s}"

      # Greenwich time
      gt = GreenwichTime.new(jd_ut1)

      # Greenwich apparent sidereal time.
      #   Ref: iauEra00(uta, utb), iauEors(rnpb, s)
      era = gt.calc_era_00
      puts "    ERA = #{era} rad"
      eo = gt.calc_eors(r_mtx, s)
      puts "     EO = #{eo} rad"
      gast = gt.calc_gast(era, eo)
      gast_deg = gast / PI_180
      puts "   GAST = #{gast} rad"
      puts "        = #{gast_deg} °"
      puts "        = #{deg2hms(gast_deg)}"

      # Greenwich mean sidereal time, IAU 2006.
      #   Ref: iauGmst06(uta, utb, tta, ttb)
      gmst = gt.calc_gmst(era, jc)
      gmst_deg = gmst / PI_180
      puts "   GMST = #{gmst} rad"
      puts "        = #{gmst_deg} °"
      puts "        = #{deg2hms(gmst_deg)}"

      # Equation of Equinoxes
      ee = gt.calc_ee(gast, gmst)
      ee_deg = ee / PI_180
      puts "     EE = #{ee} rad"
      puts "        = #{ee_deg} °"
      puts "        = #{deg2hms(ee_deg)}"
    rescue => e
      msg = "[#{e.class}] #{e.message}\n"
      msg << e.backtrace.map { |tr| "\t#{tr}"}.join("\n")
      $stderr.puts msg
      exit 1
    end
  end

  private

  # コマンドライン引数の取得
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
end

exit 0 unless __FILE__ == $0
g = CalcGreenwichTime.new.calc
{% endhighlight %}

※上記のスクリプトのファイル名を `calc_greenwich_time_old.rb` としているのは、後に作成した RubyGem ライブラリを使用したスクリプトを `calc_greenwich_time.rb` としたため。

* [komasaru/greenwich_time: Greenwich Time calculator.](https://github.com/komasaru/greenwich_time "komasaru/greenwich_time: Greenwich Time calculator.")


### 2. Ruby スクリプトの実行

`YYYYMMDD` or `YYYYMMDDHHMMSS` で地球時(TT) を指定して実行する。（引数なしでシステム時刻を地球時とみなす）

以下は、地球時 TT 2016-06-23 00:01:08 のグリニッジ恒星時を計算する例。（= 世界時 UT1 2016-06-22 23:59:59.816）  
（検証に使用する国立天文台のツールでは「世界時」で計算するようになっているため、当スクリプトでは地球時で指定する場合は +ΔT 秒する必要がある。（但し、1秒未満には対応していない））

``` text
$ ./calc_greenwich_time.rb 20160623000108
     TT = 2016-06-23 00:01:08.000
    UT1 = 2016-06-22 23:59:59.816
 JD(TT) = 2457562.500787037
JD(UT1) = 2457562.499988426
     JC = 0.16475019266357177
     DT = 68.184
 GAMMA_ = 8.240003730537752e-06
   PHI_ = 0.40905525096761974
   PSI_ = 0.004024396279809388
  EPS_A = 0.4090551906183934
  D_PSI = -1.8968440409561198e-05
  D_EPS = -4.671382897902791e-05
  r_mtx = [[0.999992008532357, -0.00366671825908081, -0.0015931254284802185], [0.0036667927617467307, 0.9999932763315477, 4.3846772416533675e-05], [0.001592953943072013, -4.968808280619852e-05, 0.9999987300136084]]
      x = 0.001592953943072013
      y = -4.968808280619852e-05
      s = 3.8623193718563546e-08
    ERA = 4.736446317633735 rad
     EO = -0.0036667274322983215 rad
   GAST = 4.740113045066034 rad
        = 271.5884718971887 °
        = 18 h 06 m 21.233 s
   GMST = 4.740130445665826 rad
        = 271.58946887811777 °
        = 18 h 06 m 21.473 s
     EE = -1.740059979216113e-05 rad
        = -0.0009969809290870503 °
        = - 0 h 00 m 00.239 s
```

### 3. 計算結果の検証

国立天文台・暦象年表のツールで計算した値と比較してみた。

グリニッジ視恒星時・平均恒星時は時角で約1秒(1/100°未満)の誤差に、分点均差は時角で1/1000秒未満の誤差に収まることが確認できた。

* [グリニジ恒星時](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/gst.cgi "グリニジ恒星時")

### 4. 参考サイト

* [SOFA Library Issue 2016-05-03 for ANSI C: Complete List](http://www.iausofa.org/2016_0503_C/CompleteList.html "SOFA Library Issue 2016-05-03 for ANSI C: Complete List")

---

今回のグリニッジ視恒星時の計算も、天体位置やこよみを正確に計算する際に必要になってきます。

当方、今後挑戦してみようと考えております。（可能ならば）

以上。

