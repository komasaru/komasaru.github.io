---
layout   : single
title    : "Ruby - JPL 天文暦 gem の作成！"
published: true
date     : 2016-08-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
- RubyGems
---

以前、「[Ruby - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2016/04/30/ruby-calc-jpl-icrs-coordinate "Ruby - JPL 天文暦データから ICRS 座標を計算！")」について紹介しました。

その際に使用した Ruby スクリプトを改変して gem ライブラリ化しました。  
対象となる天体の番号・中心となる天体の番号・ユリウス日を指定すると、そのユリウス日の中心天体から見た対象天体の位置（直交座標）と速度を計算して返します。（座標系は ICRS（国際地球基準座標系））

以下では、今回作成した gem の簡単な利用方法をご紹介します。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 自作した gem ライブラリの名称は `eph_jpl` で、使用するバイナリデータは DE430.
* JPL 天文暦とは何か？バイナリデータとは何か？等々は、過去記事「[Ruby - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2016/04/30/ruby-calc-jpl-icrs-coordinate "Ruby - JPL 天文暦データから ICRS 座標を計算！")」等をご参照ください。

### 1. インストール

``` text
$ sudo gem install eph_jpl
```

### 2. Ruby スクリプトの作成例

File: `ephemeris_jpl.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= JPLEPH(JPL の DE430 バイナリデータ)読み込み、座標（位置・速度）を計算する
#  : 自作の RubyGems ライブラリ eph_jpl を使用する
#
# date          name            version
# 2016.06.19    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 【引数】
#   [第１] 対象天体番号（必須）
#           1: 水星            (Mercury)
#           2: 金星            (Venus)
#           3: 地球            (Earth)
#           4: 火星            (Mars)
#           5: 木星            (Jupiter)
#           6: 土星            (Saturn)
#           7: 天王星          (Uranus)
#           8: 海王星          (Neptune)
#           9: 冥王星          (Pluto)
#          10: 月              (Moon)
#          11: 太陽            (Sun)
#          12: 太陽系重心      (Solar system Barycenter)
#          13: 地球 - 月の重心 (Earth-Moon Barycenter)
#          14: 地球の章動      (Earth Nutations)
#          15: 月の秤動        (Lunar mantle Librations)
#   [第２] 基準天体番号（必須。 0, 1 - 13）
#          （ 0 は、対象天体番号が 14, 15 のときのみ）
#   [第３] ユリウス日（省略可。省略時は現在日時のユリウス日を地球時とみなす）
#---------------------------------------------------------------------------------
# 【注意事項】
#   * 求める座標は「赤道直角座標(ICRS)」
#   * 時刻系は「太陽系力学時(TDB)」である。（≒地球時(TT)）
#   * 天体番号が 1 〜 13 の場合は、 x, y, z の位置・速度（6要素）、
#     天体番号が 14 の場合は、黄経における章動 Δψ, 黄道傾斜における章動 Δε の
#     角位置・角速度（4要素）、
#     天体番号が 15 の場合は、 φ, θ, ψ の角位置・角速度（6要素）。
#   * 対象天体番号 = 基準天体番号 は、無意味なので処理しない。
#---------------------------------------------------------------------------------
#++
require 'eph_jpl'

class EphemerisJpl
  FILE_BIN = "/home/masaru/src/ephemeris_jpl/JPLEPH"
  USAGE = <<-"EOS"
【使用方法】 ./ephemeris_jpl.rb 対象天体番号 基準天体番号 [ユリウス日]
【天体番号】（対象天体番号: 1 - 15, 基準天体番号: 0 - 13）
   1: 水星,  2: 金星,  3: 地球,  4: 火星,  5: 木星,
   6: 土星,  7: 天王星,  8: 海王星,  9: 冥王星, 10: 月,
  11: 太陽,  12: 太陽系重心,  13: 地球 - 月の重心,
  14: 地球の章動,  15: 月の秤動,
   0: 対象天体番号 14, 15 の場合に指定
  ※対象天体番号≠基準天体番号
EOS
  KM = false  # true: km, false: AU

  def initialize
    target, center, jd = get_args
    @eph = EphJpl.new(FILE_BIN, target, center, jd, KM)
  end

  def exec
    display(@eph.calc)
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.each { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end

  private

  #=========================================================================
  # コマンドライン引数取得
  #
  # @param:  <none>
  # @return: [target, center, jd]
  #=========================================================================
  def get_args
    # 対象、基準天体番号
    unless ARGV[0] && ARGV[1]
      puts USAGE
      exit 0
    end
    target = ARGV[0].to_i
    center = ARGV[1].to_i
    if (target < 1 || target > 15) ||
       (center < 0 || center > 13) ||
        target == center ||
       (target == 14 && center != 0) ||
       (target == 15 && center != 0) ||
       (target != 14 && target != 15 && center == 0)
      puts USAGE
      exit 0
    end

    # ユリウス日
    jd = ARGV[2]
    if jd
      jd = jd.to_f
    else
      now = Time.now
      jd = gc2jd({
        year: now.year, month: now.month, day: now.day,
        hour: now.hour, min: now.min, sec: now.sec
      })
    end
    return [target, center, jd]
  rescue => e
    raise
  end

  #=========================================================================
  # 年月日(グレゴリオ暦)からユリウス日(JD)を計算する
  #
  # * フリーゲルの公式を使用する
  #   JD = int(365.25 * year)
  #      + int(year / 400)
  #      - int(year / 100)
  #      + int(30.59 (month - 2))
  #      + day
  #      + 1721088
  # * 上記の int(x) は厳密には、 x を超えない最大の整数
  # * 「ユリウス日」でなく「準ユリウス日」を求めるなら、
  #   `+ 1721088` を `- 678912` とする。
  #
  # @params: hash = {
  #            year(int), month(int), day(int), hour(int), min(int), sec(int)
  #          }
  # @return: jd (ユリウス日)
  #=========================================================================
  def gc2jd(hash)
    year  = hash[:year]
    month = hash[:month]
    day   = hash[:day]
    hour  = hash[:hour]
    min   = hash[:min]
    sec   = hash[:sec]

    begin
      # 1月,2月は前年の13月,14月とする
      if month < 3
        year  -= 1
        month += 12
      end
      # 日付(整数)部分計算
      jd  = (365.25 * year).floor
      jd += (year / 400.0).floor
      jd -= (year / 100.0).floor
      jd += (30.59 * (month - 2)).floor
      jd += day
      jd += 1721088.5
      # 時間(小数)部分計算
      t  = sec / 3600.0
      t += min / 60.0
      t += hour
      t /= 24.0
      return jd + t
    rescue => e
      raise
    end
  end

  #=========================================================================
  # 結果出力
  #
  # @param:  pvs (= Position-Velocity array)
  # @return: <none>
  #=========================================================================
  def display(pvs)
    strs =  sprintf("  Target: %2d", @eph.target)
    strs << " (#{@eph.target_name})\n"
    strs << sprintf("  Center: %2d", @eph.center)
    strs << " (#{@eph.center_name})" unless @eph.center == 0
    strs << "\n"
    strs << sprintf("      JD: %16.8f day\n", @eph.jd)
    strs << sprintf("     1AU: %11.1f km\n", @eph.bin[:au])
    case @eph.target
    when 14
      strs << sprintf("  Position(Δψ) = %30.20f rad\n",     pvs[0])
      strs << sprintf("  Position(Δε) = %30.20f rad\n",     pvs[1])
      strs << sprintf("  Velocity(Δψ) = %30.20f rad/day\n", pvs[2])
      strs << sprintf("  Velocity(Δε) = %30.20f rad/day\n", pvs[3])
    when 15
      strs << sprintf("  Position(φ) = %30.20f rad\n",     pvs[0])
      strs << sprintf("  Position(θ) = %30.20f rad\n",     pvs[1])
      strs << sprintf("  Position(ψ) = %30.20f rad\n",     pvs[2])
      strs << sprintf("  Velocity(φ) = %30.20f rad/day\n", pvs[3])
      strs << sprintf("  Velocity(θ) = %30.20f rad/day\n", pvs[4])
      strs << sprintf("  Velocity(ψ) = %30.20f rad/day\n", pvs[5])
    else
      unit_p, unit_v = @eph.unit.split(", ")
      strs << sprintf("  Position(x) = %30.20f #{unit_p}\n", pvs[0])
      strs << sprintf("  Position(y) = %30.20f #{unit_p}\n", pvs[1])
      strs << sprintf("  Position(z) = %30.20f #{unit_p}\n", pvs[2])
      strs << sprintf("  Velocity(x) = %30.20f #{unit_v}\n", pvs[3])
      strs << sprintf("  Velocity(y) = %30.20f #{unit_v}\n", pvs[4])
      strs << sprintf("  Velocity(z) = %30.20f #{unit_v}\n", pvs[5])
    end
    puts strs
  rescue => e
    raise
  end
end

EphemerisJpl.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate JPL ephemeris with a selfmade gem library.](https://gist.github.com/komasaru/c6ee5de9146ae276ae3142297b0780fa "Gist - Ruby script to calculate JPL ephemeris phenomens with a selfmade gem library.")

### 3. サンプルスクリプトの実行

[ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/] からバイナリファイル "linux_p1550p2650.430" を取得後に適当なディレクトリに配置し、ファイル名を上記のスクリプト内 `FILE_BIN` と合わせる。（上記のスクリプトでは `JPLEPH` を想定）  
（このバイナリファイルはテキストファイルから生成することも可能。過去記事「[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data/ "JPL 天文暦データのバイナリ化！")」を参照）

``` text
$ ./ephemeris_jpl.rb 11 3 2457558.5
  Target: 11 (Sun)
  Center:  3 (Earth)
      JD: 2457558.50000000 day
     1AU: 149597870.7 km
  Position(x) =         0.03679229733787987150 AU
  Position(y) =         0.93165937859412728539 AU
  Position(z) =         0.40388562663893279314 AU
  Velocity(x) =        -0.01690604098444144221 AU/day
  Velocity(y) =         0.00062873365728935307 AU/day
  Velocity(z) =         0.00027267631528302664 AU/day
```

計算結果の検証は、[ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/testpo.430] の内容と比較して行う。（gem ライブラリ側で検証済みなので、問題ないはず）

### 4. gem ライブラリ

* [eph_jpl - RubyGems.org](https://rubygems.org/gems/eph_jpl "eph_jpl - RubyGems.org")
* [komasaru/eph_jpl: Ephemeris calculation tool by JPL method.](https://github.com/komasaru/eph_jpl "komasaru/eph_jpl: Ephemeris calculation tool by JPL method.")

---

以前作成した Ruby スクリプトを何かと応用（他の座標系への変換等）したかったので gem ライブラリ化した次第です。

以上。

