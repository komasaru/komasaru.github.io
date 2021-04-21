---
layout   : single
title    : "Fortran 2003 - Vincenty 法による地球楕円体上の距離／位置計算！"
published: true
date     : 2019-09-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
- GIS
---

地球楕円体上の任意の2地点間の距離やそれぞれから見た方位角、また、1地点から見た方位角・距離にある地点の位置等を計算するために Vincenty 法なるアルゴリズムが存在します。

前回、 Ruby で実装してみました。

* [Ruby - Vincenty 法による地球楕円体上の距離／位置計算！]({{site.baseurl}}/2019/09/26/ruby-geodesical-calculation-by-vincenty "Ruby - Vincenty 法による地球楕円体上の距離／位置計算！")

今回は、 Fortran 2003 で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

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

### 2. Fortran 2003 ソースコードの作成

File: `calc_vincenty.f03`

{% highlight fortran linenos %}
!*******************************************************************************
!= Vincenty 法で、楕円体上の2点間の距離を計算したり、1点から指定の方位角・距離に
!  ある点を求めたりする
!  * programu calc_vincenty が実行プログラム。
!  * module vincenty が計算の本質部分。
!    + 前提とする地球楕円体は GRS-80, WGS-84, Bessel を想定。
!      使用する地球楕円体は、インスタンス化時に指定可能(default: "GRS80")。
!  * 地点1の緯度・経度(°)で Vincenty クラスのオブジェクトを生成後、
!    + calc_dist メソッドを、地点2の緯度・経度を引数にして実行すれば、地点1と地
!      点2の距離と、地点1,2における方位角(°)を計算
!      する。
!      (by Vincenty 法の Inverse formula (逆解法))
!    + calc_dest メソッドを、地点1からの方位角・距離を引数にして実行すれば、地点
!      2の緯度・経度(°)と地点1,2における方位角
!      (°)を計算する。
!      (by Vincenty 法の Direct formula (順解法))
!
!   date          name            version
!   2019.08.23    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
!*******************************************************************************
!
! 定数モジュール（共通）
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  ! 地点1, 2
  real(DP), parameter :: POINT_1(2) = (/35.4681_DP,   133.0486_DP  /)  ! 松江市役所
  !real(DP), parameter :: POINT_1(2) = (/35.5382_DP,   132.9998_DP  /)  ! 島根原発1号機
  real(DP), parameter :: POINT_2(2) = (/35.472222_DP, 133.050556_DP/)  ! 島根県庁
  !real(DP), parameter :: POINT_1(2) = (/0.0_DP,   0.0_DP/)  ! 収束しない例
  !real(DP), parameter :: POINT_2(2) = (/0.5_DP, 179.7_DP/)  ! 収束しない例
end module const

! Vincenty クラス用モジュール
module vincenty
  use const
  implicit none
  ! 定数
  real(DP), parameter :: GRS80(2)  = (/6378137.0_DP  , 298.257222101_DP/)
  real(DP), parameter :: WGS84(2)  = (/6378137.0_DP  , 298.257223563_DP/)
  real(DP), parameter :: BESSEL(2) = (/6377397.155_DP, 299.152813000_DP/)
  real(DP), parameter :: PI         = atan(1.0_DP) * 4.0_DP
  real(DP), parameter :: PI2        = PI * 2.0_DP
  real(DP), parameter :: PI_180     = PI / 180.0_DP
  real(DP), parameter :: PI_180_INV = 1.0_DP / PI_180
  real(DP), parameter :: EPS        = 1.0e-11_DP  ! 1^(-11) = 10^(-12) で 0.06mm の精度

  ! クラス comp の宣言
  type comp
    private
    real(DP) :: a       = 0.0_DP
    real(DP) :: b       = 0.0_DP
    real(DP) :: f       = 0.0_DP
    real(DP) :: phi_1   = 0.0_DP
    real(DP) :: l_1     = 0.0_DP
    real(DP) :: tan_u_1 = 0.0_DP
    real(DP) :: u_1     = 0.0_DP
  contains
    private
    procedure, public :: calc_dist, calc_dest
  end type comp

  ! コンストラクタの宣言
  interface comp
    module procedure init
  end interface comp

contains
  ! コンストラクタ
  !
  ! :param(in) real(8)            lat: 緯度(°)
  ! :param(in) real(8)            lng: 経度(°)
  ! :param(in) real(8) optional el(2): 地球楕円体(長半径, 扁平率の逆数)
  ! :return                type(comp): インスタンス
  type(comp) function init(lat, lng, el) result(this)
    implicit none
    real(DP), intent(in)           :: lat, lng
    real(DP), intent(in), optional :: el(2)
    real(DP) :: tmp_el(2)

    if (present(el)) then
      tmp_el = el
    else
      tmp_el = GRS80
    end if
    this%a       = tmp_el(1)
    this%f       = 1.0_DP / tmp_el(2)
    this%b       = this%a * (1.0_DP - this%f)
    this%phi_1   = deg2rad(lat)
    this%l_1     = deg2rad(lng)
    this%tan_u_1 = (1 - this%f) * tan(this%phi_1)
    this%u_1     = atan(this%tan_u_1)
  end function init

  ! 距離と方位角1,2を計算
  ! * Vincenty 法の逆解法
  !
  ! :param(in)  real(8)  lat: 緯度(°); φ_1(rad; 北緯+, 南緯-)
  ! :param(in)  real(8)  lng: 経度(°);  L_1(rad; 東経+, 西経-)
  ! :param(out) real(8)    s: 距離(m)
  ! :param(out) real(8) az_1: 方位角1(°); α_1(rad)
  ! :param(out) real(8) az_2: 方位角2(°); α_2(rad)
  subroutine calc_dist(self, lat, lng, s, az_1, az_2)
    implicit none
    class(comp) :: self
    real(DP), intent(in)  :: lat, lng
    real(DP), intent(out) :: s, az_1, az_2
    real(DP) :: phi_2, l_2, u_2, l, lmd, lmd_prev, sgm, d_sgm
    real(DP) :: t_0, t_1, c, u2, a, b, alp_1, alp_2
    real(DP) :: cos_u_1, cos_u_2, sin_u_1, sin_u_2
    real(DP) :: su1_su2, su1_cu2, cu1_su2, cu1_cu2
    real(DP) :: cos_lmd, sin_lmd, cos_sgm, sin_sgm
    real(DP) :: sin_alp, cos2_alp, cos_2_sgm_m

    phi_2 = deg2rad(lat)
    l_2   = deg2rad(lng)
    u_2   = atan((1 - self%f) * tan(phi_2))
    cos_u_1 = cos(self%u_1)
    cos_u_2 = cos(u_2)
    sin_u_1 = sin(self%u_1)
    sin_u_2 = sin(u_2)
    su1_su2 = sin_u_1 * sin_u_2
    su1_cu2 = sin_u_1 * cos_u_2
    cu1_su2 = cos_u_1 * sin_u_2
    cu1_cu2 = cos_u_1 * cos_u_2
    l = norm_lng(l_2 - self%l_1)
    lmd = l
    lmd_prev = PI2
    cos_lmd = cos(lmd)
    sin_lmd = sin(lmd)
    do while (.true.)
      t_0 = cos_u_2 * sin_lmd
      t_1 = cu1_su2 - su1_cu2 * cos_lmd
      sin_sgm = sqrt(t_0 * t_0 + t_1 * t_1)
      cos_sgm = su1_su2 + cu1_cu2 * cos_lmd
      sgm = atan2(sin_sgm, cos_sgm)
      sin_alp = cu1_cu2 * sin_lmd / sin_sgm
      cos2_alp = 1.0_DP - sin_alp * sin_alp
      cos_2_sgm_m = cos_sgm - 2.0_DP * su1_su2 / cos2_alp
      c = calc_c(self%f, cos2_alp)
      lmd_prev = lmd
      lmd = l + (1.0_DP - c) * self%f * sin_alp &
          & * (sgm + c * sin_sgm &
          & * (cos_2_sgm_m + c * cos_sgm &
          & * (-1.0_DP + 2.0_DP * cos_2_sgm_m * cos_2_sgm_m)))
      cos_lmd = cos(lmd)
      sin_lmd = sin(lmd)
      if (lmd > PI) then
        lmd = PI
        exit
      end if
      if (abs(lmd - lmd_prev) <= EPS) exit
    end do
    u2 = cos2_alp * (self%a * self%a - self%b * self%b) / (self%b * self%b)
    call calc_a_b(u2, a, b)
    d_sgm = calc_dlt_sgm(b, cos_sgm, sin_sgm, cos_2_sgm_m)
    s = self%b * a * (sgm - d_sgm)
    alp_1 = atan2(cos_u_2 * sin_lmd,  cu1_su2 - su1_cu2 * cos_lmd)
    alp_2 = atan2(cos_u_1 * sin_lmd, -su1_cu2 + cu1_su2 * cos_lmd) + PI
    az_1 = rad2deg(norm_az(alp_1))
    az_2 = rad2deg(norm_az(alp_2))
  end subroutine calc_dist

  ! 位置2と方位角2を計算
  ! * Vincenty 法の順解法
  !
  ! :param(in)  real(8)  az_1: 方位角1(°); α_1(rad)
  ! :param(in)  real(8)     s: 距離(m)
  ! :param(out) real(8) lat_2: 緯度(°); φ_2(rad),
  ! :param(out) real(8) lng_2: 経度(°); L_2(rad))
  ! :param(out) real(8)  az_2: 方位角2(°); α_2(rad)
  subroutine calc_dest(self, az_1, s, lat_2, lng_2, az_2)
    implicit none
    class(comp) :: self
    real(DP), intent(in)  :: az_1, s
    real(DP), intent(out) :: lat_2, lng_2, az_2
    real(DP) :: alp_1, alp_2, sgm_1, u2, a, b, c, l, l_2, sgm, sgm_prev
    real(DP) :: d_sgm, tmp, phi_2, lmd
    real(DP) :: cos_alp_1, sin_alp_1, sin_alp, cos2_alp, sin2_alp
    real(DP) :: cos_sgm, sin_sgm, cos_2_sgm_m, cos_u_1, sin_u_1
    real(DP) :: cu1_cs, cu1_ss, su1_cs, su1_ss

    alp_1 = deg2rad(az_1)
    cos_alp_1 = cos(alp_1)
    sin_alp_1 = sin(alp_1)
    sgm_1     = atan2(self%tan_u_1, cos_alp_1)
    sin_alp   = cos(self%u_1) * sin(alp_1)
    sin2_alp  = sin_alp * sin_alp
    cos2_alp  = 1.0_DP - sin2_alp
    u2 = cos2_alp * (self%a * self%a - self%b * self%b) / (self%b * self%b)
    call calc_a_b(u2, a, b)
    sgm = s / (self%b * a)
    sgm_prev = PI2
    do while (.true.)
      cos_sgm = cos(sgm)
      sin_sgm = sin(sgm)
      cos_2_sgm_m = cos(2.0_DP * sgm_1 + sgm)
      d_sgm = calc_dlt_sgm(b, cos_sgm, sin_sgm, cos_2_sgm_m)
      sgm_prev = sgm
      sgm = s / (self%b * a) + d_sgm
      if (abs(sgm - sgm_prev) <= EPS) exit
    end do
    cos_u_1 = cos(self%u_1)
    sin_u_1 = sin(self%u_1)
    cu1_cs  = cos_u_1 * cos_sgm
    cu1_ss  = cos_u_1 * sin_sgm
    su1_cs  = sin_u_1 * cos_sgm
    su1_ss  = sin_u_1 * sin_sgm
    tmp     = su1_ss - cu1_cs * cos_alp_1
    phi_2 = atan2(su1_cs + cu1_ss * cos_alp_1, &
          & (1.0_DP - self%f) * sqrt(sin_alp * sin_alp + tmp * tmp))
    lmd = atan2(sin_sgm * sin_alp_1, cu1_cs - su1_ss * cos_alp_1)
    c = calc_c(self%f, cos2_alp)
    l = lmd - (1.0_DP - c) * self%f * sin_alp * (sgm &
      & + c * sin_sgm * (cos_2_sgm_m + c * cos_sgm * (-1.0_DP &
      & + 2.0_DP * cos_2_sgm_m * cos_2_sgm_m)))
    l_2 = l + self%l_1
    alp_2 = atan2(sin_alp, -su1_ss + cu1_cs * cos_alp_1) + PI
    lat_2 = rad2deg(phi_2)
    lng_2 = rad2deg(norm_lng(l_2))
    az_2  = rad2deg(norm_az(alp_2))
  end subroutine calc_dest

  ! A, B 計算
  !
  ! :param(in)  real(8) u2: u^2 の値
  ! :param(out) real(8)  a: A の値
  ! :param(out) real(8)  b: B の値
  subroutine calc_a_b(u2, a, b)
    implicit none
    real(DP), intent(in)  :: u2
    real(DP), intent(out) :: a, b

    a = 1.0_DP + u2 / 16384.0_DP * (4096.0_DP + u2 * (-768.0_DP &
      & + u2 * (320.0_DP - 175.0_DP * u2)))
    b = u2 / 1024.0_DP * (256.0_DP + u2 * (-128.0_DP &
      & + u2 * (74.0_DP - 47.0_DP * u2)))
  end subroutine calc_a_b

  ! C 計算
  !
  ! :param(in) real(8) cos2_alp: cos^2(α) の値
  ! :return    real(8)        c: C の値
  function calc_c(f, cos2_alp) result(c)
    implicit none
    real(DP), intent(in) :: f, cos2_alp
    real(DP) :: c

    c = f * cos2_alp * (4.0_DP + f &
      & * (4.0_DP - 3.0_DP * cos2_alp)) / 16.0_DP
  end function calc_c

  ! Δσ 計算
  !
  ! :param(in) real(8)           b: B の値
  ! :param(in) real(8)     cos_sgm: cos(σ) の値
  ! :param(in) real(8)     sin_sgm: sin(σ) の値
  ! :param(in) real(8) cos_2_sgm_m: cos(2σ_m) の値
  ! :return    real(8)     dlt_sgm: Δσ の値
  function calc_dlt_sgm(b, cos_sgm, sin_sgm, cos_2_sgm_m) result(d_sgm)
    implicit none
    real(DP), intent(in)  :: b, cos_sgm, sin_sgm, cos_2_sgm_m
    real(DP) :: d_sgm

    d_sgm = b * sin_sgm * (cos_2_sgm_m &
          & + b / 4.0_DP * (cos_sgm * (-1.0_DP &
          & + 2.0_DP * cos_2_sgm_m * cos_2_sgm_m) &
          & - b / 6.0_DP * cos_2_sgm_m * (-3.0_DP &
          & + 4.0_DP * sin_sgm * sin_sgm) &
          & * (-3.0_DP + 4.0_DP * cos_2_sgm_m * cos_2_sgm_m)))
  end function calc_dlt_sgm

  ! 度 => ラジアン
  !
  ! :param(in) real(8) deg: 度(°)
  ! :return    real(8) rad: ラジアン
  function deg2rad(deg) result(rad)
    implicit none
    real(DP), intent(in) :: deg
    real(DP) :: rad

    rad = deg * PI_180
  end function deg2rad

  ! ラジアン => 度
  !
  ! :param(in) real(8) rad: ラジアン
  ! :return    real(8) deg: 度(°)
  function rad2deg(rad) result(deg)
    implicit none
    real(DP), intent(in) :: rad
    real(DP) :: deg

    deg = rad * PI_180_INV
  end function rad2deg

  ! 経度正規化
  !
  ! :param(in) real(8) lng: 正規化前の経度(rad)
  ! :return    real(8) lng: 正規化後の経度(rad)
  real(DP) function norm_lng(lng)
    implicit none
    real(DP) :: lng

    do while (lng < -PI)
      lng = lng + PI2
    end do
    do while (lng > PI)
      lng = lng - PI2
    end do
  end function norm_lng

  ! 方位角正規化
  !
  ! :param(in) real(8) alp: 正規化前の方位角(rad)
  ! :return    real(8) alp: 正規化後の方位角(rad)
  real(DP) function norm_az(alp)
    implicit none
    real(DP) :: alp

    do while (alp < 0.0_DP)
      alp = alp + PI2
    end do
    do while (alp > PI2)
      alp = alp - PI2
    end do
  end function norm_az
end module vincenty

program calc_vincenty
  use const
  use vincenty
  implicit none
  type(comp) :: obj
  real(DP)   :: s, az_1, az_2, lat_2, lng_2

  obj = comp(POINT_1(1), POINT_1(2))
  ! 地点1,2が与えられたとき、
  ! 2地点間の距離と、地点1,2における方位角を計算
  print '(A, F13.8, A, F13.8, A)', &
      & "  POINT-1: ", POINT_1(1), "°, ", POINT_1(2), "°"
  print '(A, F13.8, A, F13.8, A)', &
      & "  POINT-2: ", POINT_2(1), "°, ", POINT_2(2), "°"
  print '(A)', "-->"
  call obj%calc_dist(POINT_2(1), POINT_2(2), s, az_1, az_2)
  print '(A, F17.8, A)', "   LENGTH: ",    s, " m"
  print '(A, F17.8, A)', "AZIMUTH-1: ", az_1, " °"
  print '(A, F17.8, A)', "AZIMUTH-2: ", az_2, " °"
  print '(A)', "==="
  ! 地点1と地点1における方位角、距離が与えられたとき、
  ! 地点2の位置と地点2における方位角を計算
  print '(A, F13.8, A, F13.8, A)', &
      & "  POINT-1: ", POINT_1(1), "°, ", POINT_1(2), "°"
  print '(A, F17.8, A)', "AZIMUTH-1: ", az_1, " °"
  print '(A, F17.8, A)', "   LENGTH: ",    s, " m"
  print '(A)', "-->"
  call obj%calc_dest(az_1, s, lat_2, lng_2, az_2)
  print '(A, F13.8, A, F13.8, A)', &
      & "  POINT-2: ", lat_2, "°, ", lng_2, "°"
  print '(A, F17.8, A)', "AZIMUTH-2: ", az_2, " °"
end program calc_vincenty
{% endhighlight %}

* [Gist - Fortran 2003 source code to calculate geodesical values by Vincenty's formulae.](https://gist.github.com/komasaru/ "Gist - Fortran 2003 source code to calculate geodesical values by Vincenty's formulae.")

### 3. ソースコードのコンパイル

$ gfortran -O -Wall -o calc_vincenty calc_vincenty.f03

### 4. 動作確認

* 前半で、2地点間の距離とそれぞれにおける方位角を計算。
* 後半で、前半で求めた地点1における方位角と2地点間の距離を地点1の位置に適用して、地点2の位置を計算。

``` text
$ ./calc_vincenty
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

[Ruby 版]({{site.baseurl}}/2019/09/26/ruby-geodesical-calculation-by-vincenty "Ruby - Vincenty 法による地球楕円体上の距離／位置計算！")と結果が同じになった。

---

以上。

