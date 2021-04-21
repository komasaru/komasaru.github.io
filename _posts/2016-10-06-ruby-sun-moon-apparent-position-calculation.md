---
layout   : single
title    : "Ruby - JPL DE430 データから太陽・月の視位置を計算！"
published: true
date     : 2016-10-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Ruby
---

NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している太陽・月・惑星の暦の最新版 DE430 からデータを取得し、太陽と月の視位置を高精度で計算してみました。

> 【2016-10-10 追記】  
> 以下で紹介の Ruby スクリプトを gem ライブラリにしました。  
> [mk_apos - RubyGems.org](https://rubygems.org/gems/mk_apos "mk_apos - RubyGems.org") もご参照ください。  
> 【追記ここまで】

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* 以下の自作 RubyGems ライブラリをインストールしておく。
  - ICRS 座標取得には [eph_jpl](https://rubygems.org/gems/eph_jpl "RubyGems - eph_jpl") を使用する。
  - バイアス・歳差・章動適用には [eph_bpn](https://rubygems.org/gems/eph_bpn "RubyGems - eph_bpn") を使用する。
  - 時刻系変換には [mk_time](https://rubygems.org/gems/mk_time "RubyGems - mk_time") を使用する。
  - 座標系変換には [mk_coord](https://rubygems.org/gems/mk_coord "RubyGems - mk_coord") を使用する。

### 1. 事前準備

JPL DE430 のデータを使用するので、バイナリデータ "linux_p1550p2650.430" を[こちら](ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/)から取得し “JPLEPH” とリネームして適当なディレクトリに配置しておく。

ただし、このバイナリファイルはサイズが大きいので、必要な年代のテキストデータのみをマージ＆バイナリ化してもよい。（参考：[JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data/ "JPL 天文暦データのバイナリ化！")）

### 2. Ruby スクリプトの作成

* `FILE_BIN` の値は、 "JPLEPH" の配置場所に合わせて編集すること。
* 重力の大きい太陽・木星・土星・天王星・海王星の重力場による光の曲がりは考慮していない。（太陽や月の視位置計算には影響がないと判断したので）

File: `apparent_sun_moon_jpl.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#---------------------------------------------------------------------------------
#= 太陽・月の視位置計算
#
#  * JPLEPH(JPL の DE430 バイナリデータ)読み込み、視位置を計算する
#    - ICRS 座標取得には自作 RubyGems ライブラリ eph_jpl を使用する
#    - バイアス・歳差・章動適用には自作 RubyGems ライブラリ eph_bpn を使用する
#    - 時刻系変換には自作 RubyGems ライブラリ mk_time を使用する
#    - 座標系変換には自作 RubyGems ライブラリ mk_coord を使用する
#
# date          name            version
# 2016.08.23    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2016 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
# 引数 : 日時(JST)
#          書式：YYYYMMDD or YYYYMMDDHHMMSS
#          無指定なら現在(システム日時)と判断。
#---------------------------------------------------------------------------------
#++
require 'date'
require 'eph_bpn'   # 自作ライブラリ
require 'eph_jpl'   # 自作ライブラリ
require 'mk_coord'  # 自作ライブラリ
require 'mk_time'   # 自作ライブラリ

class ApparentSunMoon
  USAGE      = "[USAGE] ./apparent_sun_moon.rb [YYYYMMDD|YYYYMMDDHHMMSS]"
  MSG_ERR_1  = "[ERROR] Newton method error!"
  JST_OFFSET = 9             # JST - UTC
  FILE_BIN   = "JPLEPH"      # JPL バイナリデータ
  AU         = 149597870700  # 1天文単位 (m)
  C          = 299792458     # 光速 (m/s)
  DAYSEC     = 86400         # 1日の秒数
  BODIES     = {earth: 3, moon: 10, sun: 11}  # 天体名と JPL での天体番号
  DEBUG      = false

  #=========================================================================
  # 初期処理
  #
  # @param:  <none>
  # @return: <none>
  #=========================================================================
  def initialize
    # === t1(= TDB), t2(= TDB) における位置・速度（ICRS 座標）用Hash
    @icrs_1, @icrs_2 = Hash.new, Hash.new
    # === 視位置を求めたい時刻 t2 (= JST; 日本標準時) の決定
    @t_2_jst = get_arg
    # === 時刻 t2 の変換（JST（日本標準時） -> UTC（協定世界時））
    @t_2_utc = jst2utc(@t_2_jst)
    # === 時刻 t2 の変換（UTC（協定世界時） -> TDB（太陽系力学時））
    @t_2 = utc2tdb(@t_2_utc)
    # === 時刻 t2 のユリウス日
    @jd_2 = get_jd(@t_2)
    # === 時刻 t2(= TDB) におけるの位置・速度（ICRS 座標）の計算 (地球, 月, 太陽)
    BODIES.each { |k, v| @icrs_2[k] = get_icrs(v, @jd_2) }
    # === 時刻 t2(= TDB) における地球と太陽・月の距離
    @r_e = get_r_e
  end

  #=========================================================================
  # 主処理
  #
  # @param:  <none>
  # @return: <none>
  #=========================================================================
  def exec
    disp_init
    @eq_pol_s, @ec_pol_s = calc_sun
    @eq_pol_m, @ec_pol_m = calc_moon
    disp_result
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.each { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end

  private

  #=========================================================================
  # 視位置計算（太陽）
  #
  # @param:  <none>
  # @return: <none>
  #=========================================================================
  def calc_sun
    # === 太陽が光を発した時刻 t1(JD) の計算
    t_1_jd = calc_t1(:sun, @t_2)
    # === 時刻 t1(= TDB) におけるの位置・速度（ICRS 座標）の計算 (地球, 月, 太陽)
    BODIES.each { |k, v| @icrs_1[k] = get_icrs(v, t_1_jd) }
    # === 時刻 t2 における地球重心から時刻 t1 における太陽への方向ベクトルの計算
    v_12 = calc_unit_vector(@icrs_2[:earth][0,3], @icrs_1[:sun][0,3])
    # === GCRS 座標系: 光行差の補正（方向ベクトルの Lorentz 変換）
    dd = conv_lorentz(v_12)
    pos_sun = calc_pos(dd, @r_e[:sun])
    # === 瞬時の真座標系: GCRS への bias & precession（歳差） & nutation（章動）の適用
    bpn = EphBpn.new(@t_2.strftime("%Y%m%d%H%M%S"))
    pos_sun_bpn = bpn.apply_bpn(pos_sun)
if DEBUG
    puts "---"
    puts "* ICRS@t2 = #{@icrs_2}"
    puts "* 時刻 t2 における地球と太陽・月の距離 r_e\n  = #{@r_e}"
    puts "* 太陽が光を発した時刻 t1(JD)\n  = #{t_1_jd}"
    puts "* ICRS@t1\n  = #{@icrs_1}"
    puts "* 時刻 t2 における地球重心から時刻 t1 における太陽への方向ベクトル v_12\n  = #{v_12}"
    puts "* 光行差補正後（方向ベクトルの Lorentz 変換） dd\n  = #{dd}"
    puts "* 太陽位置（GCRS 座標系）"
    puts "  = #{pos_sun}"
    puts "* 太陽位置（瞬時の真座標系）"
    puts "  = #{pos_sun_bpn}"
end
    # === 座標変換
    eq_pol_s  = MkCoord.rect2pol(pos_sun_bpn)
    ec_rect_s = MkCoord.rect_eq2ec(pos_sun_bpn, bpn.eps)
    ec_pol_s  = MkCoord.rect2pol(ec_rect_s)
    return [eq_pol_s, ec_pol_s]
  rescue => e
    raise
  end

  #=========================================================================
  # 視位置計算（月）
  #
  # @param:  <none>
  # @return: <none>
  #=========================================================================
  def calc_moon
    # === 月が光を発した時刻 t1(jd) の計算
    t_1_jd = calc_t1(:moon, @t_2)
    # === 時刻 t1(= TDB) におけるの位置・速度（ICRS 座標）の計算 (地球, 月, 太陽)
    BODIES.each { |k, v| @icrs_1[k] = get_icrs(v, t_1_jd) }
    # === 時刻 t2 における地球重心から時刻 t1 における月への方向ベクトルの計算
    v_12 = calc_unit_vector(@icrs_2[:earth][0,3], @icrs_1[:moon][0,3])
    # === GCRS 座標系: 光行差の補正（方向ベクトルの Lorentz 変換）
    dd = conv_lorentz(v_12)
    pos_moon = calc_pos(dd, @r_e[:moon])
    # === 瞬時の真座標系: GCRS への bias & precession（歳差） & nutation（章動）の適用
    bpn = EphBpn.new(@t_2.strftime("%Y%m%d%H%M%S"))
    pos_moon_bpn = bpn.apply_bpn(pos_moon)
if DEBUG
    puts "---"
    puts "* ICRS@t2 = #{@icrs_2}"
    puts "* 時刻 t2 における地球と太陽・月との距離 r_e\n  = #{@r_e}"
    puts "* 月が光を発した時刻 t1(JD)\n  = #{t_1_jd}"
    puts "* ICRS@t1\n  = #{@icrs_1}"
    puts "* 時刻 t2 における地球重心から時刻 t1 における月への方向ベクトル v_12\n  = #{v_12}"
    puts "* 光行差補正後（方向ベクトルの Lorentz 変換） dd\n  = #{dd}"
    puts "* 月位置（GCRS 座標系）"
    puts "  = #{pos_moon}"
    puts "* 月位置（瞬時の真座標系）"
    puts "  = #{pos_moon_bpn}"
end
    # === 座標変換
    eq_pol_m  = MkCoord.rect2pol(pos_moon_bpn)
    ec_rect_m = MkCoord.rect_eq2ec(pos_moon_bpn, bpn.eps)
    ec_pol_m  = MkCoord.rect2pol(ec_rect_m)
    return [eq_pol_m, ec_pol_m]
  rescue => e
    raise
  end

  #=========================================================================
  # ICRS 座標取得
  #
  # * JPL DE430 データを自作 RubyGems ライブラリ eph_jpl を使用して取得。
  #
  # @param:  target  (対象天体(Symbol))
  # @param:  jd      (ユリウス日(Numeric))
  # @return: [
  #   pos_x, pos_y, pos_z,
  #   vel_x, vel_y, vel_z
  # ]                (位置・速度(Array), 単位: AU, AU/day)
  #=========================================================================
  def get_icrs(target, jd)
    return EphJpl.new(FILE_BIN, target, 12, jd).calc
  rescue => e
    raise
  end

  #=========================================================================
  # 引数取得
  #
  # @param:  <none>
  # @return: JST(Time Object)
  #=========================================================================
  def get_arg
    unless arg = ARGV.shift
      t = Time.now
      return Time.new(t.year, t.month, t.day, t.hour, t.min, t.sec)
    end
    (puts USAGE; exit 0) unless arg =~ /^\d{8}$|^\d{14}$/
    year, month, day = arg[ 0, 4].to_i, arg[ 4, 2].to_i, arg[ 6, 2].to_i
    hour, min,   sec = arg[ 8, 2].to_i, arg[10, 2].to_i, arg[12, 2].to_i
    (puts USAGE; exit 0) unless Date.valid_date?(year, month, day)
    (puts USAGE; exit 0) if hour > 23 || min > 59 || sec > 59
    return Time.new(year, month, day, hour, min, sec)
  rescue => e
    raise
  end

  #=========================================================================
  # JST -> UTC
  #
  # @param:  jst  (Time Object)
  # @return: utc  (Time Object)
  #=========================================================================
  def jst2utc(jst)
    return jst - JST_OFFSET * 60 * 60
  rescue => e
    raise
  end

  #=========================================================================
  # UTC -> TDB
  #
  # @param:  utc  (Time Object)
  # @return: tdb  (Time Object)
  #=========================================================================
  def utc2tdb(utc)
    return MkTime.new(utc.strftime("%Y%m%d%H%M%S")).tdb
  rescue => e
    raise
  end

  #=========================================================================
  # ユリウス日取得
  #
  # @param:  t   (Time Object)
  # @return: jd  (Julian Day(Numeric))
  #=========================================================================
  def get_jd(t)
    return MkTime.new(t.strftime("%Y%m%d%H%M%S")).jd
  rescue => e
    raise
  end

  #=========================================================================
  # t2(= TDB) における地球と太陽・月の距離
  #
  # @param:  <none>
  # @return: r_e  (地球と太陽・月の距離(Hash))
  #=========================================================================
  def get_r_e
    r_e = Hash.new

    begin
      @icrs_2.each do |k, v|
        next if k == :earth
        r_e[k] = calc_dist(@icrs_2[:earth][0, 3], v[0, 3])
      end
      return r_e
    rescue => e
      raise
    end
  end

  #=========================================================================
  # 天体Aを中心とした場合の天体Bの位置計算
  #
  # @param:  pos_a  (位置ベクトル(天体A))
  # @param:  pos_b  (位置ベクトル(天体B))
  # @return: pos    (位置ベクトル)
  #=========================================================================
  def calc_pos_ab(pos_a, pos_b)
    return (0..2).map { |i| pos_b[i] - pos_a[i] }
  rescue => e
    raise
  end

  #=========================================================================
  # 天体Aと天体Bの距離計算
  #
  # @param:   pos_a  (位置ベクトル)
  # @param:   pos_a  (位置ベクトル)
  # @return:  r      (距離)
  #=========================================================================
  def calc_dist(pos_a, pos_b)
    r =  (0..2).inject(0.0) { |sum, i| sum + (pos_b[i] -pos_a[i]) ** 2 }
    return Math.sqrt(r)
  rescue => e
    raise
  end

  #=========================================================================
  # 対象天体が光を発した時刻 t1 の計算（太陽・月専用）
  #
  # * 計算式： c * (t2 - t1) = r12  (但し、 c: 光の速度。 Newton 法で近似）
  # * 太陽・月専用なので、太陽・木星・土星・天王星・海王星の重力場による
  #   光の曲がりは非考慮。
  #
  # @param:  target  (対象天体(Symbol))
  # @param:  tdb     (Time Object(観測時刻;TDB))
  # @return: t_1     (Time Ojbect)
  #=========================================================================
  def calc_t1(target, tdb)
    t_1 = MkTime.new(tdb.strftime("%Y%m%d%H%M%S")).jd
    t_2 = t_1
    pv_1 = @icrs_2[target]
    df, m = 1.0, 0
    while df > 1.0e-10
      r_12 = (0..2).map { |i| pv_1[i] - @icrs_2[:earth][i] }
      r_12_d = calc_dist(pv_1, @icrs_2[:earth])
      df = (C * DAYSEC / AU) * (t_2 - t_1) - r_12_d
      df_wk = (0..2).inject(0.0) { |s, i| s + r_12[i] * @icrs_2[target][i + 3] }
      df /= ((C * DAYSEC / AU) + (df_wk) / r_12_d)
      t_1 += df
      m += 1
      raise MSG_ERR_1 if m > 10
      pv_1 = get_icrs(BODIES[target], t_1)
    end
    return t_1
  rescue => e
    raise
  end

  #=========================================================================
  # 天体Aから見た天体Bの方向ベクトル計算（太陽・月専用）
  #
  # * 太陽・月専用なので、太陽・木星・土星・天王星・海王星の重力場による
  #   光の曲がりは非考慮。
  #
  # @param:   pos_a  (位置ベクトル(天体A))
  # @param:   pos_b  (位置ベクトル(天体B))
  # @return:  vec    (方向(単位)ベクトル)
  #=========================================================================
  def calc_unit_vector(pos_a, pos_b)
    vec = [0.0, 0.0, 0.0]

    begin
      w = calc_dist(pos_a, pos_b)
      vec = (0..2).map { |i| pos_b[i] - pos_a[i] }
      return vec.map { |v| v / w } unless w == 0.0
    rescue => e
      raise
    end
  end

  #=========================================================================
  # 光行差の補正（方向ベクトルの Lorentz 変換）
  #
  # * vec_dd = f * vec_d + (1 + g / (1 + f)) * vec_v
  #   但し、 f = vec_v * vec_d  (ベクトル内積)
  #          g = sqrt(1 - v^2)  (v: 速度)
  #
  # @param:  v_d   (方向（単位）ベクトル)
  # @return: v_dd  (補正後ベクトル)
  #=========================================================================
  def conv_lorentz(vec_d)
    vec_v = @icrs_2[:earth][3,3].map { |v| (v / DAYSEC) / (C / AU.to_f) }
    g = inner_prod(vec_v, vec_d)
    f = Math.sqrt(1.0 - calc_velocity(vec_v))
    vec_dd_1 = vec_d.map { |d| d * f }
    vec_dd_2 = vec_v.map { |v| (1.0 + g / (1.0 + f)) * v }
    vec_dd = (0..2).map { |i| vec_dd_1[i] + vec_dd_2[i] }.map { |a| a / (1.0 + g) }
    return vec_dd
  rescue => e
    raise
  end

  #=========================================================================
  # 単位（方向）ベクトルと距離から位置ベクトルを計算
  #
  # @param:  d    (単位（方向）ベクトル)
  # @param:  r    (距離)
  # @return  pos  (位置ベクトル)
  #=========================================================================
  def calc_pos(d, r)
    return d.map { |a| a * r }
  rescue => e
    raise
  end

  #=========================================================================
  # ベクトルの外積
  #
  # @param:  a  (ベクトル)
  # @param:  b  (ベクトル)
  # @return: w  (ベクトル)
  #=========================================================================
  def cross_prod(a, b)
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ]
  rescue => e
    raise
  end

  #=========================================================================
  # ベクトルの内積
  #
  # @param:  a  (ベクトル)
  # @param:  b  (ベクトル)
  # @return: w  (スカラー(内積の値))
  #=========================================================================
  def inner_prod(a, b)
    return (0..2).inject(0.0) { |s, i| s + a[i] * b[i] }
  rescue => e
    raise
  end

  #=========================================================================
  # 天体の速度ベクトルから実際の速度を計算
  #
  # @param:   vec  (ベクトル)
  # @return:  v    (速度)
  #=========================================================================
  def calc_velocity(vec)
    v = vec.inject(0.0) { |s, i| s + i * i }
    return Math.sqrt(v)
  rescue => e
    raise
  end

  #=========================================================================
  # 結果出力（時刻パラメータ）
  #
  # @param:  <none>
  # @return: <none>
  #=========================================================================
  def disp_init
    print "* 計算対象時刻 t2(JST) = "
    puts @t_2_jst.instance_eval { '%s.%03d' % [strftime('%Y-%m-%d %H:%M:%S'), (usec / 1000.0).round] }
    print "                 (UTC) = "
    puts @t_2_utc.instance_eval { '%s.%03d' % [strftime('%Y-%m-%d %H:%M:%S'), (usec / 1000.0).round] }
    print "                 (TDB) = "
    puts @t_2.instance_eval { '%s.%03d' % [strftime('%Y-%m-%d %H:%M:%S'), (usec / 1000.0).round] }
    puts "                  (JD) = #{@jd_2}"
  rescue => e
    raise
  end

  #=========================================================================
  # 結果出力（計算結果）
  #
  # param:  <none>
  # return: <none>
  #=========================================================================
  def disp_result
    puts "* 視位置（太陽）"
    printf("  = [赤経: %14.10f rad, 赤緯: %14.10f rad]\n", @eq_pol_s[0], @eq_pol_s[1])
    printf("  = [赤経: %14.10f deg, 赤緯: %14.10f deg]\n", @eq_pol_s[0] * 180 / PI, @eq_pol_s[1] * 180 / PI)
    printf("  = [黄経: %14.10f rad, 黄緯: %14.10f rad]\n", @ec_pol_s[0], @ec_pol_s[1])
    printf("  = [黄経: %14.10f deg, 黄緯: %14.10f deg]\n", @ec_pol_s[0] * 180 / PI, @ec_pol_s[1] * 180 / PI)
    puts "* 視位置（月）"
    printf("  = [赤経: %14.10f rad, 赤緯: %14.10f rad]\n", @eq_pol_m[0], @eq_pol_m[1])
    printf("  = [赤経: %14.10f deg, 赤緯: %14.10f deg]\n", @eq_pol_m[0] * 180 / PI, @eq_pol_m[1] * 180 / PI)
    printf("  = [黄経: %14.10f rad, 黄緯: %14.10f rad]\n", @ec_pol_m[0], @ec_pol_m[1])
    printf("  = [黄経: %14.10f deg, 黄緯: %14.10f deg]\n", @ec_pol_m[0] * 180 / PI, @ec_pol_m[1] * 180 / PI)
    puts "* 視黄経差（太陽 - 月）"
    printf("  = %15.10f rad\n", @ec_pol_s[0] - @ec_pol_m[0])
    printf("  = %15.10f deg\n", @ec_pol_s[0] * 180 / PI - @ec_pol_m[0] * 180 / PI)
    puts "* 距離（太陽）"
    printf("  = %.10f AU = %.2f km\n", @ec_pol_s[2], @ec_pol_s[2] * AU / 1000.0)
    puts "* 距離（月）"
    printf("  = %.10f AU = %.2f km\n", @ec_pol_m[2], @ec_pol_m[2] * AU / 1000.0)
  rescue => e
    raise
  end
end

ApparentSunMoon.new.exec if __FILE__ == $0
{% endhighlight %}

（いつもなら GitHub Gist にソーススクリプトを掲載するが、今回のスクリプトは近いうちに RubyGems ライブラリ化する予定なので Gist には掲載しない）

### 3. Ruby スクリプトの実行

コマンドライン引数に日時(JST)を `YYYYMMDD` or `YYYYMMDDHHMMSS` の書式で指定指定実行する。（指定しない場合はシステム時刻を JST とみなす）  
以下は 2017年02月26日23時58分22秒（視黄経差が 0.0 に近づく日時） の例。

``` text
$ ./apparent_sun_moon_jpl.rb 20170226235822
* 計算対象時刻 t2(JST) = 2017-02-26 23:58:22.000
                 (UTC) = 2017-02-26 14:58:22.000
                 (TDB) = 2017-02-26 14:59:31.184
                  (JD) = 2457811.124664352
* 視位置（太陽）
  = [赤経:   5.9314958658 rad, 赤緯:  -0.1482278532 rad]
  = [赤経: 339.8496793121 deg, 赤緯:  -8.4928303972 deg]
  = [黄経:   5.9027352417 rad, 黄緯:   0.0000119199 rad]
  = [黄経: 338.2018169337 deg, 黄緯:   0.0006829627 deg]
* 視位置（月）
  = [赤経:   5.9344195445 rad, 赤緯:  -0.1554065421 rad]
  = [赤経: 340.0171937614 deg, 赤緯:  -8.9041389710 deg]
  = [黄経:   5.9027340610 rad, 黄緯:  -0.0077266797 rad]
  = [黄経: 338.2017492834 deg, 黄緯:  -0.4427061343 deg]
* 視黄経差（太陽 - 月）
  =    0.0000011807 rad
  =    0.0000676503 deg
* 距離（太陽）
  = 0.9902304257 AU = 148136363.19 km
* 距離（月）
  = 0.0025279553 AU = 378176.74 km
```

### 4. 計算結果の検証

太陽の視位置については「[太陽の地心座標 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/sun.cgi "太陽の地心座標 - 国立天文台暦計算室")」、月の視位置については「[月の地心座標 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/moon.cgi "月の地心座標 - 国立天文台暦計算室")」で計算した結果と比較してみる。

今回の例の場合、太陽の視黄緯以外は 1/1000〜1/100000 の精度で、太陽の視黄緯は 1/100 の精度で一致した。（単位：「度」）

そして、何よりも、視黄経差（太陽 - 月）が「2017年02月26日23時58分」に 0.0 に最も近づいたことで、精度が高いと判断できる。

なぜなら、視黄経差が 0.0 になる瞬間は「旧暦」を生成する際に非常に重要になるからで、「2017年の2月に訪れる旧暦の1日は、26日か27日か？」という問題も出てくるほど。  
実際、[国立天文台の計算](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_p.cgi)では、その頃の新月（朔）は 26日23時58分とされており、旧暦の1日は「26日」である。  
（精度の低いアルゴリズムで計算すると、新月の瞬間が「27日」になってしまう）

### 5. 参考サイト

* [暦象年表の改訂について（国立天文台）（PDF 1.7MB）](http://www.nao.ac.jp/contents/about-naoj/reports/report-naoj/11-34-2.pdf "暦象年表の改訂について - 国立天文台")
* [RubyGems - eph_jpl](https://rubygems.org/gems/eph_jpl "RubyGems - eph_jpl")
* [RubyGems - eph_bpn](https://rubygems.org/gems/eph_bpn "RubyGems - eph_bpn")
* [RubyGems - mk_time](https://rubygems.org/gems/mk_time "RubyGems - mk_time")
* [RubyGems - mk_coord](https://rubygems.org/gems/mk_coord "RubyGems - mk_coord")
* [太陽の地心座標 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/sun.cgi "太陽の地心座標 - 国立天文台暦計算室")
* [月の地心座標 - 国立天文台暦計算室](http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/moon.cgi "月の地心座標 - 国立天文台暦計算室")

---

これで、精度の高くないアルゴリズムで計算していた際に発生していた旧暦がズレて都度調整していた問題が解消されます。

近いうちに、今回のスクリプト自体も RubyGems ライブラリ化し、カレンダー計算に利用したいと考えております。

※当記事「執筆」時点では RubyGems ラリブラリ化は実現していませんでしたが、当記事「公開」時点では実現しています。次回、公開する予定。

以上。

