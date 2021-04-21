---
layout   : single
title    : "Ruby - 太陽・月視位置計算 gem の作成（海保略算式版）！"
published: true
date     : 2016-07-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

以前、Ruby で、海上保安庁・海洋情報部の「[コンピュータによる天体の位置計算式](http://www1.kaiho.mlit.go.jp/KOHO/ "天文・暦情報")」を利用して、太陽や月の視黄経や視赤経等を計算しました。

* [Ruby - 太陽・月の視黄経・視黄緯の計算（海保略算式版）！]({{site.baseurl}}/2016/05/12/ruby-calc-ecliptic-ephemeris-by-kaiho "Ruby - 太陽・月の視黄経・視黄緯の計算（海保略算式版）！")

今回、そこで使用したロジックを gem ライブラリにしました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した gem ライブラリの名称は "[eph_jcg](https://rubygems.org/gems/eph_jcg "eph_jcg- RubyGems.org")" で、計算対象年は 2008 年〜 2016 年。  
  （2017 年以降も係数データが公開される度に対応する予定）
* 当ライブラリの計算可能項目
  + Sun
    - 視赤経, R.A.(= Right Ascension, Alpha)
    - 視黄緯, Dec.(= Declination, Delta)
    - 地心距離, Dist.(= Distance)
    - グリニッジ時角, hG.(= Greenwich hour angle)
    - 視半径, S.D.(= Apparent Semidiameter)
    - 視黄経, Lambda(= Ecliptic longitude)
    - 視黄緯, Beta(= Ecliptic latitude)
  + Moon
    - 視赤経, R.A.(= Right Ascension, Alpha)
    - 視黄緯, Dec.(= Declination, Delta)
    - 地平視差, H.P.(= Horizontal Parallax)
    - グリニッジ時角, hG.(= Greenwich hour angle)
    - 視半径, S.D.(= Apparent Semidiameter)
    - 視黄経, Lambda(= Ecliptic longitude)
    - 視黄緯, Beta(= Ecliptic latitude)
  + R (グリニッジ時角の計算に必要な値)
  + 平均黄道傾斜角, Epsilon(= Mean obliquity of the ecliptic)
  + 視黄経差, Lambda difference between Sun and Moon

### 1. インストール

``` text
$ sudo gem install eph_jcg
```

### 2. Ruby スクリプトの作成例

File: `ex_ephemeris_jcg.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
require 'eph_jcg'

obj = EphJcg.new("20160609")

# 一括計算、一括出力
obj.calc_all
obj.display_all
puts
# 個別計算、個別出力
obj.calc_sun_ra;      puts "    SUN    R.A. = #{obj.sun_ra}"
obj.calc_sun_dec;     puts "    SUN    DEC. = #{obj.sun_dec}"
obj.calc_sun_dist;    puts "    SUN   DIST. = #{obj.sun_dist}"
obj.calc_sun_h;       puts "    SUN     hG. = #{obj.sun_h}"
obj.calc_sun_sd;      puts "    SUN    S.D. = #{obj.sun_sd}"
obj.calc_moon_ra;     puts "    MOON   R.A. = #{obj.moon_ra}"
obj.calc_moon_dec;    puts "    MOON   DEC. = #{obj.moon_dec}"
obj.calc_moon_hp;     puts "    MOON   H.P. = #{obj.moon_hp}"
obj.calc_moon_h;      puts "    MOON    hG. = #{obj.moon_h}"
obj.calc_moon_sd;     puts "    MOON   S.D. = #{obj.moon_sd}"
obj.calc_r;           puts "              R = #{obj.r}"
obj.calc_eps;         puts "           EPS. = #{obj.eps}"
obj.calc_sun_lambda;  puts "    SUN  LAMBDA = #{obj.sun_lambda}"
obj.calc_sun_beta;    puts "    SUN    BETA = #{obj.sun_beta}"
obj.calc_moon_lambda; puts "    MOON LAMBDA = #{obj.moon_lambda}"
obj.calc_moon_beta;   puts "    MOON   BETA = #{obj.moon_beta}"
obj.calc_lambda_s_m;  puts "LABMDA SUN-MOON = #{obj.lambda_s_m}"
puts
puts "    SUN    R.A. = #{obj.hour2hms(obj.sun_ra     )}"
puts "    SUN    DEC. = #{obj.deg2dms( obj.sun_dec    )}"
puts "    SUN   DIST. = #{obj.deg2dms( obj.sun_dist   )}"
puts "    SUN     hG. = #{obj.hour2hms(obj.sun_h      )}"
puts "    SUN    S.D. = #{obj.deg2dms( obj.sun_sd     )}"
puts "    MOON   R.A. = #{obj.hour2hms(obj.moon_ra    )}"
puts "    MOON   DEC. = #{obj.deg2dms( obj.moon_dec   )}"
puts "    MOON   H.P. = #{obj.deg2dms( obj.moon_hp    )}"
puts "    MOON    hG. = #{obj.hour2hms(obj.moon_h     )}"
puts "    MOON   S.D. = #{obj.deg2dms( obj.moon_sd    )}"
puts "              R = #{obj.hour2hms(obj.r          )}"
puts "           EPS. = #{obj.deg2dms( obj.eps        )}"
puts "    SUN  LAMBDA = #{obj.deg2dms( obj.sun_lambda )}"
puts "    SUN    BETA = #{obj.deg2dms( obj.sun_beta   )}"
puts "    MOON LAMBDA = #{obj.deg2dms( obj.moon_lambda)}"
puts "    MOON   BETA = #{obj.deg2dms( obj.moon_beta  )}"
puts "LABMDA SUN-MOON = #{obj.deg2dms( obj.lambda_s_m )}"
{% endhighlight %}

### 3. サンプルスクリプトの実行

``` text
$ ./ex_ephemeris_jcg.rb
[ JST: 2016-06-09 00:00:00,  UTC: 2016-06-08 15:00:00 ]
  SUN    R.A. =   5.14759173 h  (=    5 h 08 m 51.330 s)
  SUN    DEC. =  22.91390281 °  (=   22 ° 54 ′ 50.050 ″)
  SUN   DIST. =   1.01514003 AU
  SUN     hG. =  27.01399780 h  (=   27 h 00 m 50.392 s)
  SUN    S.D. =  15.78107401 ′  (=    0 ° 15 ′ 46.864 ″)
  MOON   R.A. =   8.40863875 h  (=    8 h 24 m 31.099 s)
  MOON   DEC. =  15.80751986 °  (=   15 ° 48 ′ 27.072 ″)
  MOON   H.P. =   0.96198018 °  (=    0 ° 57 ′ 43.129 ″)
  MOON    hG. =  23.75295078 h  (=   23 h 45 m 10.623 s)
  MOON   S.D. =  15.72769188 ′  (=    0 ° 15 ′ 43.662 ″)
           R  =  17.16158953 h  (=   17 h 09 m 41.722 s)
         EPS. =  23.43446466 °  (=   23 ° 26 ′ 04.073 ″)
  ---
  SUN  LAMBDA =  78.23788375 °  (=  78 ° 14 ′ 16.381 ″)
  SUN    BETA =  -0.00010341 °  (=  -0 ° 00 ′ 00.372 ″)
  MOON LAMBDA = 124.63246155 °  (= 124 ° 37 ′ 56.862 ″)
  MOON   BETA =  -3.38996467 °  (=  -3 ° 23 ′ 23.873 ″)
  DIFF LAMBDA = -46.39457781 °

    SUN    R.A. = 5.147591732785325
    SUN    DEC. = 22.91390280958854
    SUN   DIST. = 1.0151400332768776
    SUN     hG. = 27.013997801148722
    SUN    S.D. = 15.781074014278948
    MOON   R.A. = 8.408638749052159
    MOON   DEC. = 15.807519861977596
    MOON   H.P. = 0.961980181276102
    MOON    hG. = 23.75295078488189
    MOON   S.D. = 15.727691881531724
              R = 17.16158953393405
           EPS. = 23.4344646577545
    SUN  LAMBDA = 78.23788374531598
    SUN    BETA = -0.0001034098752735779
    MOON LAMBDA = 124.63246155278357
    MOON   BETA = -3.389964665474966
LABMDA SUN-MOON = -46.394577807467584

    SUN    R.A. =    5 h 08 m 51.330 s
    SUN    DEC. =   22 ° 54 ′ 50.050 ″
    SUN   DIST. =    1 ° 00 ′ 54.504 ″
    SUN     hG. =   27 h 00 m 50.392 s
    SUN    S.D. =   15 ° 46 ′ 51.866 ″
    MOON   R.A. =    8 h 24 m 31.099 s
    MOON   DEC. =   15 ° 48 ′ 27.072 ″
    MOON   H.P. =    0 ° 57 ′ 43.129 ″
    MOON    hG. =   23 h 45 m 10.623 s
    MOON   S.D. =   15 ° 43 ′ 39.691 ″
              R =   17 h 09 m 41.722 s
           EPS. =   23 ° 26 ′ 04.073 ″
    SUN  LAMBDA =   78 ° 14 ′ 16.381 ″
    SUN    BETA =   -0 ° 00 ′ 00.372 ″
    MOON LAMBDA =  124 ° 37 ′ 56.862 ″
    MOON   BETA =   -3 ° 23 ′ 23.873 ″
LABMDA SUN-MOON =  -46 ° 23 ′ 40.480 ″
```

### 4. gem ライブラリ

* [eph_jcg - RubyGems.org](https://rubygems.org/gems/eph_jcg "eph_jcg - RubyGems.org")
* [komasaru/eph_jcg: Ephemeris calculation tool by JCG method.](https://github.com/komasaru/eph_jcg "komasaru/eph_jcg: Ephemeris calculation tool by JCG method.")

---

以前作成した Ruby スクリプトを何かと応用したかったので gem ライブラリ化した次第です。

以上。

