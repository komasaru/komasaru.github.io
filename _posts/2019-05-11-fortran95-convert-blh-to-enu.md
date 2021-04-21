---
layout   : single
title    : "Fortran - WGS84 (BLH) 座標 -> ENU 座標 変換！"
published: true
date     : 2019-05-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
---

前々回と前回、 BLH 座標（WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)）から ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標への変換や、その逆の変換の処理を Fortran 95 で実装しました。

* [Fortran - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2019/05/05/fortran95-convert-blh-to-ecef "Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！")
* [Fortran - ECEF 座標 -> WGS84 (BLH) 座標 変換！]({{site.baseurl}}/2019/05/08/fortran95-convert-ecef-to-blh "Ruby - ECEF 座標 -> WGS84 (BLH) 座標 変換！")

今回は BLH 座標から ENU 座標（地平座標; EastNorthUp）への変換処理を Fortran 95 で実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。
* ここでは、 WGS84(World Geodetic System 1984) 測地系、 ECEF 座標（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）、 ENU 座標（地平座標）の詳細についての説明はしない。

### 1. ソースコードの作成

File: `blh2enu.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! BLH -> ENU 変換
! : WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)を
!   ENU (East/North/Up; 地平) 座標に変換する。
!   * 途中、 ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標
!     への変換を経由。
!
!   date          name            version
!   2019.02.22    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
! ---
! 引数 :  BETA_O LAMBDA_O HEIGHT_O BETA LAMBDA HEIGHT
!         (BETA: Latitude, LAMBDA: Longitude)
!         (前半3つは原点、後半3つは対象)
!*******************************************************************************
!
program blh2enu
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,      parameter :: SP = kind(1.0)
  integer(SP),  parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  character(*), parameter :: USAGE = "[USAGE] ./blh2enu BETA_O LAMBDA_O HEIGHT_O BETA LAMBDA HEIGHT"
  real(DP), parameter :: A      = 6378137.0_DP           ! a(地球楕円体長半径(赤道面平均半径))
  real(DP), parameter :: ONE_F  = 298.257223563_DP       ! 1 / f(地球楕円体扁平率=(a - b) / a)
  real(DP), parameter :: B      = A * (1.0_DP - 1.0_DP / ONE_F)  ! b(地球楕円体短半径)
  real(DP), parameter :: E2     = (1.0_DP / ONE_F) * (2.0_DP - (1.0_DP / ONE_F))
                                                         ! e^2 = 2 * f - f * f
                                                         !     = (a^2 - b^2) / a^2
  real(DP), parameter :: ED2    = E2 * A * A / (B * B)   ! e'^2= (a^2 - b^2) / b^2
  real(DP), parameter :: PI     = atan(1.0_DP) * 4.0_DP  ! 円周率
  real(DP), parameter :: PI_180 = PI / 180.0_DP          ! 0.0174532925199433
  real(DP) :: blh_o(3), blh(3), enu(3)  ! BLH 座標（原点、対象）, ENU 座標
  real(DP) :: az, el, dst               ! 方位角、仰角、距離
  real(DP) :: e_2, n_2, u_2             ! e^2, n^2, u^2 用

  ! コマンドライン引数取得
  call get_arg(blh_o, blh)
  if (blh_o(1) == 0) stop
  print '("BLH_O: LATITUDE(BETA) = ", F12.8, "°")', blh_o(1)
  print '("    LONGITUDE(LAMBDA) = ", F12.8, "°")', blh_o(2)
  print '("               HEIGHT = ", F12.3, "m" )', blh_o(3)
  print '("BLH:   LATITUDE(BETA) = ", F12.8, "°")', blh(1)
  print '("    LONGITUDE(LAMBDA) = ", F12.8, "°")', blh(2)
  print '("               HEIGHT = ", F12.3, "m" )', blh(3)

  ! BLH -> ENU
  call conv_blh2enu(blh_o, blh, enu)

  ! 方位角、仰角、距離
  az = atan2(enu(1), enu(2)) / PI_180
  if (az < 0.0_DP) az = az + 360.0_DP
  e_2 = enu(1) * enu(1)
  n_2 = enu(2) * enu(2)
  u_2 = enu(3) * enu(3)
  el = atan2(enu(3), sqrt(e_2 + n_2)) / PI_180
  dst = sqrt(e_2 + n_2 + u_2)

  ! 結果出力
  print '(A)', "--->"
  print '("ENU: E = ", F12.3, "m")',  enu(1)
  print '("     N = ", F12.3, "m")',  enu(2)
  print '("     U = ", F12.3, "m")',  enu(3)
  print '("方位角 = ", F12.3, "°")', az
  print '("  仰角 = ", F12.3, "°")', el
  print '("  距離 = ", F12.3, "°")', dst

  stop
contains
  ! コマンドライン引数取得
  !
  ! :param(out) real(8) blh_o(3): 原点 BLH 座標
  ! :param(out) real(8)   blh(3): 対象 BLH 座標
  subroutine get_arg(blh_o, blh)
    implicit none
    real(DP), intent(out) :: blh_o(3), blh(3)
    character(20) :: a

    blh_o = 0.0_DP
    blh   = 0.0_DP
    if (iargc() < 6) then
      print *, USAGE
      return
    end if
    call getarg(1, a)
    read (a, *) blh_o(1)
    call getarg(2, a)
    read (a, *) blh_o(2)
    call getarg(3, a)
    read (a, *) blh_o(3)
    call getarg(4, a)
    read (a, *) blh(1)
    call getarg(5, a)
    read (a, *) blh(2)
    call getarg(6, a)
    read (a, *) blh(3)
  end subroutine get_arg

  ! BLH -> ENU
  !
  ! :param(in)  real(8) blh_o(3): BLH 座標（原点）
  ! :param(in)  real(8)   blh(3): BLH 座標（対象）
  ! :param(out) real(8)   enu(3): ENU 座標
  subroutine conv_blh2enu(blh_o, blh, enu)
    implicit none
    real(DP), intent(in)  :: blh_o(3), blh(3)
    real(DP), intent(out) :: enu(3)
    real(DP) :: xyz_o(3), xyz(3)
    real(DP) :: mtx_0(3, 3), mtx_1(3, 3), mtx_2(3, 3), mtx_r(3, 3)

    call conv_blh2ecef(blh_o, xyz_o)
    call conv_blh2ecef(blh, xyz)
    call mtx_z(90.0_DP, mtx_0)
    call mtx_y(90.0_DP - blh_o(1), mtx_1)
    call mtx_z(blh_o(2), mtx_2)
    mtx_r = matmul(mtx_0, mtx_1)
    mtx_r = matmul(mtx_r, mtx_2)
    enu = matmul(mtx_r, xyz - xyz_o)
  end subroutine conv_blh2enu

  ! BLH -> ECEF
  !
  ! :param(in)  real(8) blh(3): BLH 座標
  ! :param(out) real(8) xyz(3): ECEF 座標
  subroutine conv_blh2ecef(blh, xyz)
    implicit none
    real(DP), intent(in)  :: blh(3)
    real(DP), intent(out) :: xyz(3)
    real(DP) :: c_lat, c_lon, s_lat, s_lon

    c_lat = cos(blh(1) * PI_180)
    c_lon = cos(blh(2) * PI_180)
    s_lat = sin(blh(1) * PI_180)
    s_lon = sin(blh(2) * PI_180)
    xyz = (/ &
      & (f(blh(1)) + blh(3)) * c_lat * c_lon,        &
      & (f(blh(1)) + blh(3)) * c_lat * s_lon,        &
      & (f(blh(1)) * (1.0_DP - E2) + blh(3)) * s_lat &
    & /)
  end subroutine conv_blh2ecef

  ! Function for blh2ecef
  !
  ! :param(in) real(8) x
  ! :return    real(8) f
  real(DP) function f(x)
    implicit none
    real(DP), intent(in) :: x
    real(DP) :: s

    s = sin(x * PI_180)
    f = A / sqrt(1.0_DP - E2 * s * s)
  end function f

  ! x 軸を軸とした回転行列
  !
  ! :param(in)  real(8)       ang: 回転量(°)
  ! :param(out) real(8) mtx(3, 3): 回転行列(3x3)
  subroutine mtx_x(ang, mtx)
    implicit none
    real(DP), intent(in) :: ang
    real(DP), intent(out) :: mtx(3, 3)
    real(DP) :: a, c, s

    a = ang * PI_180
    c = cos(a)
    s = sin(a)
    mtx= transpose(reshape( &
      & (/1.0_DP, 0.0_DP, 0.0_DP, 0.0_DP, c, s, 0.0_DP, -s, c/), &
      & (/3, 3/) &
    & ))
  end subroutine mtx_x

  ! y 軸を軸とした回転行列
  !
  ! :param(in)  real(8)       ang: 回転量(°)
  ! :param(out) real(8) mtx(3, 3): 回転行列(3x3)
  subroutine mtx_y(ang, mtx)
    implicit none
    real(DP), intent(in) :: ang
    real(DP), intent(out) :: mtx(3, 3)
    real(DP) :: a, c, s

    a = ang * PI_180
    c = cos(a)
    s = sin(a)
    mtx = transpose(reshape( &
      & (/c, 0.0_DP, -s, 0.0_DP, 1.0_DP, 0.0_DP, s, 0.0_DP, c/), &
      & (/3, 3/) &
    & ))
  end subroutine mtx_y

  ! z 軸を軸とした回転行列
  !
  ! :param(in)  real(8)       ang: 回転量(°)
  ! :param(out) real(8) mtx(3, 3): 回転行列(3x3)
  subroutine mtx_z(ang, mtx)
    implicit none
    real(DP), intent(in) :: ang
    real(DP), intent(out) :: mtx(3, 3)
    real(DP) :: a, c, s

    a = ang * PI_180
    c = cos(a)
    s = sin(a)
    mtx = transpose(reshape( &
      & (/c, s, 0.0_DP, -s, c, 0.0_DP, 0.0_DP, 0.0_DP, 1.0_DP/), &
      & (/3, 3/) &
    & ))
  end subroutine mtx_z
end program blh2enu
{% endhighlight %}

* [Gist - Fortran 95 source code to convert WGS84(BLH) to ENU coordinate.](https://gist.github.com/komasaru/38b4099919aea5f9d04eeb5297f154df "Gist - Fortran 95 source code to convert WGS84(BLH) to ENU coordinate.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o blh2enu blh2enu.f95
```

### 4. 動作確認

そして、コマンドライン引数に原点と対象の緯度、経度、楕円体高を指定して実行する。

次は、[参考文献](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")内の実行例（仙台空の滑走路の長さ）と同じパラメータで実行。

``` text
$ ./blh2enu 38.13877338 140.89872429 44.512 38.14227288 140.93265738 45.664
BLH_O: LATITUDE(BETA) =  38.13877338°
    LONGITUDE(LAMBDA) = 140.89872429°
               HEIGHT =       44.512m
BLH:   LATITUDE(BETA) =  38.14227288°
    LONGITUDE(LAMBDA) = 140.93265738°
               HEIGHT =       45.664m
--->
ENU: E =     2974.681m
     N =      388.988m
     U =        0.447m
方位角 =       82.550°
  仰角 =        0.009°
  距離 =     3000.006°
```

次は、島根県本庁舎から見た松江市本庁舎の位置の計算例。（但し、標高 0m と想定）

```
$ ./blh2enu 35.472222 133.050556 0 35.468056 133.048611 0
BLH_O: LATITUDE(BETA) =  35.47222200°
    LONGITUDE(LAMBDA) = 133.05055600°
               HEIGHT =        0.000m
BLH:   LATITUDE(BETA) =  35.46805600°
    LONGITUDE(LAMBDA) = 133.04861100°
               HEIGHT =        0.000m
--->
ENU: E =     -176.539m
     N =     -462.213m
     U =       -0.019m
方位角 =      200.904°
  仰角 =       -0.002°
  距離 =      494.779°
```

* U の値や仰角が負の値になっているのは、地球が球体であるため。誤りではない。
* 概ね、島根県本庁舎から西に 176.539m, 南に 462.213m の所に松江市本庁舎が位置しているということ。

### 3. 参考文献

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")

※上記の参考文献のソースコード内、方位角の計算に誤りがあるので、注意。

---

人工衛星の正確な軌道計算等に利用できるでしょう。

以上。

