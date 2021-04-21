---
layout   : single
title    : "Ruby - Vincenty 法による地球楕円体上の距離／位置計算！"
published: true
date     : 2019-09-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
- GIS
---

地球楕円体上の任意の2地点間の距離やそれぞれから見た方位角、また、1地点から見た方位角・距離にある地点の位置等を計算するために Vincenty 法なるアルゴリズムが存在します。

今回、 Ruby で実装してみました。

ちなみに、過去には2地点間の距離を「ヒュベニの公式」を使って計算しています。（精度は Vincenty 法で計算した方が高い）

* [Ruby - 地球上の2点間の距離をほぼ正確に計算！ ]({{site.baseurl}}/2011/10/28/28002050 "Ruby - 地球上の2点間の距離をほぼ正確に計算！ ")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* Ruby 2.6.4 での作業を想定。

### 1. Vincenty法 (Vincenty's formulae) について

#### 1-1. Introduction（紹介）

Vincenty 法(Vincenty's formulae)とは、T.Vincenty が考案した、楕円体上の2点間の距離を計算したり、1点から指定の方角・距離にある点を求めたりするのに使用する反復計算アルゴリズムである、

#### 1-2. Notation（表記法）

以下のように定義する。

$$
\begin{eqnarray*}
a &:& 赤道半径（長半径） \\
b &:& 極半径（短半径） \\
f &:& 扁平率 \\
&& = \frac{a - b}{a} \\
\phi_1, \phi_2 &:& 地点1,2の緯度（北緯:+, 南緯:-） \\
L_1, L_2 &:& 地点1,2の経度（東経:+, 西経:-） \\
L &:& 地点1と2の経度の差 \\
&& = L_1 - L_2 \\
s &:& 地点1と2の楕円体上の距離 \\
\alpha_1, \alpha_2 &:& 地点1,2における方位角（北を基点に時計回り） \\
\alpha &:& 赤道上での方位角 \\
U_1 &:& 地点1の更成緯度 \\
&& = \tan^{-1} \{(1 - f)\tan \phi_1\}  \\
&& (\because \tan U_1 = (1 - f)\tan \phi_1) \\
U_2 &:& 地点2の更成緯度 \\
&& = \tan^{-1} \{(1 - f)\tan \phi_2\}  \\
&& (\because \tan U_2 = (1 - f)\tan \phi_2) \\
\lambda_1, \lambda_2 &:& 補助球上の地点1,2の経度 \\
\lambda &:& 補助球上の地点1,2の経度の差 \\
\sigma &:& 補助球上の地点1から2までの距離（弧の長さ） \\
\sigma_1 &:& 補助球上の赤道から地点1までの距離（孤の長さ） \\
\sigma_m &:& 補助球上の赤道から\sigma_1の中点までの距離（孤の長さ） \\
\end{eqnarray*}
$$

#### 1-3. Direct formula （順解法）

地点1 $$(\phi_1, L_1)$$ と地点1における方位角 $$\alpha_1$$, 距離 $$s$$ が与えられたとき、地点2 $$(\phi_2, L_2)$$ と方位角 $$\alpha_2$$ を求める。

$$
\begin{eqnarray*}
\tan U_1 &=& (1 - f)\tan \phi_1 \\
U_1 &=& \tan^{-1} \{(1 - f)\tan \phi_1\} \ (= \tan^{-1} (\tan U_1)) \\
\sigma_1 &=& \tan^{-1} \frac{\tan U_1}{\cos \alpha_1} \\
\sin \alpha &=& \cos U_1 \sin \alpha_1 \\
u^2 &=& \cos^2 \alpha \left(\frac{a^2 - b^2}{b^2}\right) = (1 - \sin^2 \alpha)\left(\frac{a^2 - b^2}{b^2}\right) \\
A &=& 1 + \frac{u^2}{16384}[4096 + u^2 \{-768 + u^2 (320 - 175 u^2)\}] \\
B &=& \frac{u^2}{1024}[256 + u^2 \{-128 + u^2 (74 - 47 u^2)\}]
\end{eqnarray*}
$$

$$\displaystyle \sigma = \frac{s}{bA}$$ で初期化後、 $$\sigma$$ の値が収束する（無視できるレベルになる）まで、以下をループ処理する。

$$
\begin{eqnarray*}
2\sigma_m &=& 2\sigma_1 + \sigma \\
\Delta\sigma &=& B\sin\sigma[\cos2\sigma_m + \frac{1}{4}B\{\cos\sigma(-1 + 2\cos^2 2\sigma_m) \\
&& - \frac{1}{6}B\cos2\sigma_m(-3 + 4\sin^2\sigma)(-3 + 4\cos^2 2\sigma_m)\}] \\
\sigma &=& \frac{s}{bA} + \Delta\sigma
\end{eqnarray*}
$$

$$\sigma$$収束後、以下の処理を行なう。

$$
\begin{eqnarray*}
\phi_2 &=& \tan^{-1}\frac{\sin U_1\cos \sigma + \cos U_1 \sin \sigma \cos \alpha_1}{(1 - f)\sqrt{\sin^2\alpha + (\sin U_1 \sin \sigma - \cos U_1 \cos \sigma \cos \alpha_1)^2}} \\
\lambda &=& \tan^{-1}\frac{\sin \sigma \sin \alpha_1}{\cos U_1 \cos \sigma - \sin U_1 \sin \sigma \cos \alpha_1} \\
C &=& \frac{f}{16} \cos^2\alpha \{4 + f(4 - 3\cos^2\alpha)\} \\
L &=& \lambda - (1 - C)f\sin\alpha [\sigma + C\sin\sigma\{\cos 2\sigma_m + C\cos\sigma (-1 + 2\cos^2 2\sigma_m)\}] \\
L_2 &=& L + L_1 \\
\alpha_2 &=& \tan^{-1}\frac{\sin\alpha}{-\sin U_1 \sin\sigma + \cos U_1 \cos\sigma \cos\alpha_1}
\end{eqnarray*}
$$

#### 1-4. Inverse formula （逆解法）

楕円体上の2地点、地点1 $$(\phi_1, L_1)$$, 地点2 $$(\phi_2, L_2)$$ が与えられたとき、地点1, 2における方位角 $$\alpha_1, \alpha_2$$ と距離 $$s$$ を求める。

$$
\begin{eqnarray*}
U_1 &=& \tan^{-1} \{(1 - f)\tan \phi_1\}  \\
U_2 &=& \tan^{-1} \{(1 - f)\tan \phi_2\}  \\
L &=& L_1 - L_2
\end{eqnarray*}
$$

$$\lambda = L$$ で初期化後、 $$\lambda$$ の値が収束する（無視できるレベルになる）まで、以下をループ処理する。

$$
\begin{eqnarray*}
\sin\sigma &=& \sqrt{(\cos U_2 \sin\lambda)^2 + (\cos U_1 \sin U_2 - \sin U_1 \cos U_2 \cos\lambda)^2} \\
\cos\sigma &=& \sin U_1 \sin U_2 + \cos U_1 \cos U_2 \cos\lambda \\
\sigma &=& \tan^{-1}\frac{\sin\sigma}{\cos\sigma} \\
\sin\alpha &=& \frac{\cos U_1 \cos U_2 \sin\lambda}{\sin\sigma} \\
\cos^2\alpha &=& 1 - \sin^2\alpha \\
\cos2\sigma_m &=& \cos\sigma - \frac{2\sin U_1 \sin U_2}{\cos^2\alpha} \\
C &=& \frac{f}{16} \cos^2\alpha \{4 + f(4 - 3\cos^2\alpha)\} \\
L &=& \lambda - (1 - C)f\sin\alpha [\sigma + C\sin\sigma\{\cos 2\sigma_m + C\cos\sigma (-1 + 2\cos^2 2\sigma_m)\}]
\end{eqnarray*}
$$

$$\lambda$$ 収束後、以下の処理を行なう。

$$
\begin{eqnarray*}
u^2 &=& \cos^2 \alpha \left(\frac{a^2 - b^2}{b^2}\right) \\
A &=& 1 + \frac{u^2}{16384}[4096 + u^2 \{-768 + u^2 (320 - 175 u^2)\}] \\
B &=& \frac{u^2}{1024}[256 + u^2 \{-128 + u^2 (74 - 47 u^2)\}] \\
\Delta\sigma &=& B\sin\sigma[\cos2\sigma_m + \frac{1}{4}B\{\cos\sigma(-1 + 2\cos^2 2\sigma_m) \\
&& - \frac{1}{6}B\cos2\sigma_m(-3 + 4\sin^2\sigma)(-3 + 4\cos^2 2\sigma_m)\}] \\
s &=& bA(\sigma - \Delta\sigma) \\
\alpha_1 &=& \tan^{-1}\frac{\cos U_2 \sin\lambda}{\cos U_1 \sin U_2 - \sin U_1 \cos U_2 \cos\lambda} \\
\alpha_2 &=& \tan^{-1}\frac{\cos U_1 \sin\lambda}{-\sin U_1 \cos U_2 + \cos U_1 \sin U_2 \cos\lambda}
\end{eqnarray*}
$$

### 2. Ruby スクリプトの作成

* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `calc_vincenty.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#---------------------------------------------------------------------------------
#= Vincenty 法で、楕円体上の2点間の距離を計算したり、1点から指定の方位角・距離に
#  ある点を求めたりする
#  * CalcVincenty クラスは実行クラス。
#  * Vincenty クラスが計算の本質部分。
#    + 前提とする地球楕円体は GRS-80, WGS-84, Bessel を想定。
#      使用する地球楕円体は、インスタンス化時に指定可能(default: "GRS80")。
#  * 地点1の緯度・経度(°)で Vincenty クラスのオブジェクトを生成後、
#    + calc_dist(calc_distance, calc_inverse) メソッドを、地点2の緯度・経度を引数
#      にして実行すれば、地点1と地点2の距離と、地点1,2における方位角(°)を計算する。
#      (by Vincenty 法の Inverse formula (逆解法))
#    + calc_dest(calc_destination, calc_direct) メソッドを、地点1からの方位角・距
#      離を引数にして実行すれば、地点2の緯度・経度(°)と地点1,2における方位角(°)
#      を計算する。
#      (by Vincenty 法の Direct formula (順解法))
#
#   date          name            version
#   2019.08.13    mk-mode.com     1.00 新規作成
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#
# 例として、
#
#   1.松江市役所 35.4681  (35°28′05″)N, 133.0486  (133°02′55″)E
#     と
#     島根県庁   35.472222(35°28′20″)N, 133.050556(133°03′02″)E
#     の距離、それぞれの方位角を計算
#
#   2.松江市役所の、1で求めた松江市役所から見た方位角の、1で求めた距離
#     にある地点を計算
#     （元の島根県庁の位置が求まるはず）
#
class CalcVincenty
  POINT_1 = [35.4681,   133.0486  ]  # 松江市役所
  #POINT_1 = [35.5382,   132.9998  ]  # 島根原発1号機
  POINT_2 = [35.472222, 133.050556]  # 島根県庁
  #POINT_1 = [0.0,   0.0]  # 収束しない例
  #POINT_2 = [0.5, 179.7]  # 収束しない例

  def initialize
    @v = Vincenty.new(*POINT_1)
  end

  def exec
    begin
      # 地点1,2が与えられたとき、
      # 2地点間の距離と、地点1,2における方位角を計算
      puts "  POINT-1: %13.8f°, %13.8f°" % POINT_1
      puts "  POINT-2: %13.8f°, %13.8f°" % POINT_2
      puts "-->"
      s, az_1, az_2 = @v.calc_dist(*POINT_2)
      puts "   LENGTH: %17.8f m"  % s
      puts "AZIMUTH-1: %17.8f °" % az_1
      puts "AZIMUTH-2: %17.8f °" % az_2
      puts "==="
      # 地点1と地点1における方位角、距離が与えられたとき、
      # 地点2の位置と地点2における方位角を計算
      puts "  POINT-1: %13.8f°, %13.8f°" % POINT_1
      puts "AZIMUTH-1: %17.8f °"          % az_1
      puts "   LENGTH: %17.8f m"           % s
      puts "-->"
      pt_2, az_2 = @v.calc_dest(az_1, s)
      puts "  POINT-2: %13.8f°, %13.8f°" % pt_2
      puts "AZIMUTH-2: %17.8f °"          % az_2
    rescue => e
      $stderr.puts "[#{e.class}] #{e.message}\n"
      e.backtrace.each { |tr| $stderr.puts "\t#{tr}" }
      exit 1
    end
  end
end

class Vincenty
  # 地球楕円体(長半径, 扁平率の逆数)
  ELLIPSOID = {
    "GRS80"  => [6_378_137.0  , 298.257_222_101],
    "WGS84"  => [6_378_137.0  , 298.257_223_563],
    "BESSEL" => [6_377_397.155, 299.152_813_000]
  }
  # その他定数
  PI2        = Math::PI * 2
  PI_180     = Math::PI / 180
  PI_180_INV = 1 / PI_180
  EPS        = 1e-11  # 1^(-11) = 10^(-12) で 0.06mm の精度

  # 初期化
  #
  # @param  latitude: 緯度(°); 北緯+, 南緯-
  # @param longitude: 経度(°); 東経+, 西経-
  # @param ellipsoid(optional): 地球楕円体("GRS80" or "WGS80" or "BESSEL")
  def initialize(lat, lng, ellipsoid="GRS80")
    el       = ELLIPSOID[ellipsoid]
    @a       = el[0]
    @f       = 1 / el[1]
    @b       = @a * (1 - @f)
    @phi_1   = deg2rad(lat)
    @l_1     = deg2rad(lng)
    @tan_u_1 = (1 - @f) * Math.tan(@phi_1)
    @u_1     = Math.atan(@tan_u_1)
  end

  # 距離と方位角1,2を計算
  # * Vincenty 法の逆解法
  #
  # @param  lat: 緯度(°); φ_1; 北緯+, 南緯-
  # @param  lng: 経度(°);  L_1; 東経+, 西経-
  # @return [
  #           s(距離(m)),
  #           az_1(方位角1(°); α_1(rad)),
  #           az_2(方位角2(°); α_2(rad))
  #         ]
  def calc_inverse(lat, lng)
    begin
      phi_2   = deg2rad(lat)
      l_2     = deg2rad(lng)
      u_2     = Math.atan((1 - @f) * Math.tan(phi_2))
      cos_u_1 = Math.cos(@u_1)
      cos_u_2 = Math.cos(u_2)
      sin_u_1 = Math.sin(@u_1)
      sin_u_2 = Math.sin(u_2)
      su1_su2 = sin_u_1 * sin_u_2
      su1_cu2 = sin_u_1 * cos_u_2
      cu1_su2 = cos_u_1 * sin_u_2
      cu1_cu2 = cos_u_1 * cos_u_2
      l = norm_lng(l_2 - @l_1)
      lmd = l
      lmd_prev = PI2
      cos_lmd = Math.cos(lmd)
      sin_lmd = Math.sin(lmd)
      begin
        t_0 = cos_u_2 * sin_lmd
        t_1 = cu1_su2 - su1_cu2 * cos_lmd
        sin_sgm = Math.sqrt(t_0 * t_0 + t_1 * t_1)
        cos_sgm = su1_su2 + cu1_cu2 * cos_lmd
        sgm = Math.atan2(sin_sgm, cos_sgm)
        sin_alp = cu1_cu2 * sin_lmd / sin_sgm
        cos2_alp = 1 - sin_alp * sin_alp
        cos_2_sgm_m = cos_sgm - 2 * su1_su2 / cos2_alp
        c = calc_c(cos2_alp)
        lmd_prev = lmd
        lmd = l + (1 - c) * @f * sin_alp \
            * (sgm + c * sin_sgm \
            * (cos_2_sgm_m + c * cos_sgm \
            * (-1 + 2 * cos_2_sgm_m * cos_2_sgm_m)))
        cos_lmd = Math.cos(lmd)
        sin_lmd = Math.sin(lmd)
        if lmd > Math::PI
          lmd = Math::PI
          break
        end
      end while (lmd - lmd_prev).abs > EPS
      u2 = cos2_alp * (@a * @a - @b * @b) / (@b * @b)
      a, b = calc_a_b(u2)
      d_sgm = calc_dlt_sgm(b, cos_sgm, sin_sgm, cos_2_sgm_m)
      s = @b * a * (sgm - d_sgm)
      alp_1 = Math.atan2(cos_u_2 * sin_lmd,  cu1_su2 - su1_cu2 * cos_lmd)
      alp_2 = Math.atan2(cos_u_1 * sin_lmd, -su1_cu2 + cu1_su2 * cos_lmd) \
            + Math::PI
      return [s, rad2deg(norm_az(alp_1)), rad2deg(norm_az(alp_2))]
    rescue => e
      raise
    end
  end
  alias_method :calc_distance, :calc_inverse
  alias_method :calc_dist,     :calc_distance

  # 位置2と方位角2を計算
  # * Vincenty 法の順解法
  #
  # @param  az_1: 方位角1(°); α_1(rad)
  # @param     s: 距離(m)
  # @return [
  #           [
  #             lat(緯度(°); φ_2(rad)),
  #             lng(経度(°); L_2(rad))
  #           ],
  #           az_2(方位角2(°); α_2(rad))
  #         ]
  def calc_direct(az_1, s)
    begin
      alp_1 = deg2rad(az_1)
      cos_alp_1 = Math.cos(alp_1)
      sin_alp_1 = Math.sin(alp_1)
      sgm_1     = Math.atan2(@tan_u_1, cos_alp_1)
      sin_alp   = Math.cos(@u_1) * Math.sin(alp_1)
      sin2_alp  = sin_alp * sin_alp
      cos2_alp  = 1 - sin2_alp
      u2        = cos2_alp * (@a * @a - @b * @b) / (@b * @b)
      a, b      = calc_a_b(u2)
      sgm = s / (@b * a)
      sgm_prev = PI2
      begin
        cos_sgm = Math.cos(sgm)
        sin_sgm = Math.sin(sgm)
        cos_2_sgm_m = Math.cos(2 * sgm_1 + sgm)
        d_sgm = calc_dlt_sgm(b, cos_sgm, sin_sgm, cos_2_sgm_m)
        sgm_prev = sgm
        sgm = s / (@b * a) + d_sgm
      end while (sgm - sgm_prev).abs > EPS
      cos_u_1 = Math.cos(@u_1)
      sin_u_1 = Math.sin(@u_1)
      cu1_cs  = cos_u_1 * cos_sgm
      cu1_ss  = cos_u_1 * sin_sgm
      su1_cs  = sin_u_1 * cos_sgm
      su1_ss  = sin_u_1 * sin_sgm
      tmp     = su1_ss - cu1_cs * cos_alp_1
      phi_2 = Math.atan2(
        su1_cs + cu1_ss * cos_alp_1,
        (1 - @f) * Math.sqrt(sin_alp * sin_alp + tmp * tmp)
      )
      lmd = Math.atan2(sin_sgm * sin_alp_1, cu1_cs - su1_ss * cos_alp_1)
      c = calc_c(cos2_alp)
      l = lmd - (1 - c) * @f * sin_alp \
          * (sgm + c * sin_sgm \
          * (cos_2_sgm_m + c * cos_sgm \
          * (-1 + 2 * cos_2_sgm_m * cos_2_sgm_m)))
      l_2 = l + @l_1
      alp_2 = Math.atan2(sin_alp, -su1_ss + cu1_cs * cos_alp_1) + Math::PI
      return [
        [rad2deg(phi_2), rad2deg(norm_lng(l_2))],
        rad2deg(norm_az(alp_2))
      ]
    rescue => e
      raise
    end
  end
  alias_method :calc_destination, :calc_direct
  alias_method :calc_dest,        :calc_destination

private
  # 度 => ラジアン
  #
  # @param  deg: 度(°)
  # @return rad: ラジアン
  def deg2rad(deg)
    return deg * PI_180
  rescue => e
    raise
  end

  # ラジアン => 度
  #
  # @param  rad: ラジアン
  # @return deg: 度(°)
  def rad2deg(rad)
    return rad * PI_180_INV
  rescue => e
    raise
  end

  # A, B 計算
  #
  # @param      u2: u^2 の値
  # @return [a, b]: [A の値, B の値]
  def calc_a_b(u2)
    # 以下、 Vincenty の 1975 年の論文による計算式
    return [
      1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2))),
      u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)))
    ]
    # 以下、 Vincenty による修正(1979)
    #tmp = Math.sqrt(1 + u2)
    #k  = (tmp - 1) / (tmp + 1)
    #k2 = k * k
    #return [(1 + k2 / 4) / (1 - k), k * (1 - 3 / 8 * k2)]
  rescue => e
    raise
  end

  # C 計算
  #
  # @param cos2_alp: cos^2(α) の値
  # @return       c: C の値
  def calc_c(cos2_alp)
    return @f * cos2_alp * (4 + @f * (4 - 3 * cos2_alp)) / 16
  rescue => e
    raise
  end

  # Δσ 計算
  #
  # @param           b: B の値
  # @param     cos_sgm: cos(σ) の値
  # @param     sin_sgm: sin(σ) の値
  # @param cos_2_sgm_m: cos(2σ_m) の値
  # @return    dlt_sgm: Δσ の値
  def calc_dlt_sgm(b, cos_sgm, sin_sgm, cos_2_sgm_m)
    return b * sin_sgm * (cos_2_sgm_m \
           + b / 4 * (cos_sgm * (-1 + 2 * cos_2_sgm_m * cos_2_sgm_m) \
           - b / 6 * cos_2_sgm_m * (-3 + 4 * sin_sgm * sin_sgm) \
           * (-3 + 4 * cos_2_sgm_m * cos_2_sgm_m)))
  rescue => e
    raise
  end

  # 経度正規化
  #
  # @param  lng: 正規化前の経度(rad)
  # @return lng: 正規化後の経度(rad)
  def norm_lng(lng)
    while lng < -Math::PI; lng += PI2; end
    while lng >  Math::PI; lng -= PI2; end
    return lng
  rescue => e
    raise
  end

  # 方位角正規化
  #
  # @param  alp: 正規化前の方位角(rad)
  # @return alp: 正規化後の方位角(rad)
  def norm_az(alp)
    case
    when alp < 0.0; alp += PI2
    when alp > PI2; alp -= PI2
    end
    return alp
  rescue => e
    raise
  end
end

CalcVincenty.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to calculate geodesical values by Vincenty's formulae.](https://gist.github.com/komasaru/1b6c207c2b9e3d8b39f75b4857ed2a2e "Gist - Ruby script to calculate geodesical values by Vincenty's formulae.")

### 3. Ruby スクリプトの実行

* 前半で、2地点間の距離とそれぞれにおける方位角を計算。
* 後半で、地点1の位置に、前半で求めた地点1における方位角と2地点間の距離を適用して、地点2の位置を計算。

``` text
$ ./calc_vincenty.rb
  POINT-1:   35.46810000°,  133.04860000°
  POINT-2:   35.47222200°,  133.05055600°
-->
   LENGTH:      490.58216516 m
AZIMUTH-1:       21.21518366 °
AZIMUTH-2:      201.21631869 °
===
  POINT-1:   35.46810000°,  133.04860000°
AZIMUTH-1:       21.21518366 °
   LENGTH:      490.58216516 m
-->
  POINT-2:   35.47222200°,  133.05055600°
AZIMUTH-2:      201.21631869 °
```

### 4. 参考

* [Direct and Inverse solutions of geodesics on the ellipsoid with application of nested equations - inverse.pdf](https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf "Direct and Inverse solutions of geodesics on the ellipsoid with application of nested equations - inverse.pdf")

---

以上。

