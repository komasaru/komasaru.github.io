---
layout   : single
title    : "Fortran - ECEF 座標 -> WGS84 (BLH) 座標 変換！"
published: true
date     : 2019-05-08 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
---

先日、 WGS84(World Geodetic System 1984) 測地系の緯度(Beta)／経度(Lambda)／楕円体高(Height)を ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標に変換する方法を Fortran 95 で実装しました。

* [Fortran - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2019/05/05/fortran95-convert-blh-to-ecef "Fortran - WGS84 (BLH) 座標 -> ECEF 座標 変換！")

今回は、逆に、 ECEF 座標を WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)に変換する方法を Fortran 95 で実装してみました。

過去には Python, Ruby で実装しています。

* [Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！]({{site.baseurl}}/2018/09/05/python-convert-ecef-to-blh "Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！")
* [Ruby - ECEF 座標 -> WGS84 (BLH) 座標 変換！]({{site.baseurl}}/2019/04/29/ruby-convert-ecef-to-blh "Python - ECEF 座標 -> WGS84 (BLH) 座標 変換！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。
* ここでは、 WGS84(World Geodetic System 1984) 測地系や ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）の詳細についての説明はしない。

### 1. ソースコードの作成

File: `ecef2blh.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! ECEF -> BLH 変換
! : ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標を
!   WGS84 の緯度(Latitude)／経度(Longitude)／楕円体高(Height)に変換する。
!
!   date          name            version
!   2019.02.21    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
! ---
! 引数 :  X Y Z
!         (ECEF 座標)
!*******************************************************************************
!
program ecef2blh
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,      parameter :: SP = kind(1.0)
  integer(SP),  parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  character(*), parameter :: USAGE = "[USAGE] ./ecef2blh X Y Z"
  real(DP), parameter :: A      = 6378137.0_DP           ! a(地球楕円体長半径(赤道面平均半径))
  real(DP), parameter :: ONE_F  = 298.257223563_DP       ! 1 / f(地球楕円体扁平率=(a - b) / a)
  real(DP), parameter :: B      = A * (1.0_DP - 1.0_DP / ONE_F)  ! b(地球楕円体短半径)
  real(DP), parameter :: E2     = (1.0_DP / ONE_F) * (2.0_DP - (1.0_DP / ONE_F))
                                                         ! e^2 = 2 * f - f * f
                                                         !     = (a^2 - b^2) / a^2
  real(DP), parameter :: ED2    = E2 * A * A / (B * B)   ! e'^2= (a^2 - b^2) / b^2
  real(DP), parameter :: PI     = atan(1.0_DP) * 4.0_DP  ! 円周率
  real(DP), parameter :: PI_180 = PI / 180.0_DP          ! 0.0174532925199433
  real(DP) :: x, y, z       ! ECEF 座標
  real(DP) :: lat, lon, ht  ! BLH  座標

  ! コマンドライン引数(X, Y, Z)取得
  call get_arg(x, y, z)
  if (x == 0) stop
  print '("ECEF: X = ", F12.3, "m")', x
  print '("      Y = ", F12.3, "m")', y
  print '("      Z = ", F12.3, "m")', z

  ! ECEF -> BLH
  call conv_ecef2blh(x, y, z, lat, lon, ht)

  ! 結果出力
  print '(A)', "--->"
  print '("BLH: LATITUDE(BETA) = ", F12.8, "°")', lat
  print '("  LONGITUDE(LAMBDA) = ", F12.8, "°")', lon
  print '("             HEIGHT = ", F12.3, "m" )', ht

  stop
contains
  ! コマンドライン引数(X, Y, Z)取得
  !
  ! :param(out) real(8) x: X
  ! :param(out) real(8) y: Y
  ! :param(out) real(8) z: Z
  subroutine get_arg(x, y, z)
    implicit none
    real(DP), intent(out) :: x, y, z
    character(20) :: a

    x = 0.0_DP
    y = 0.0_DP
    z = 0.0_DP
    if (iargc() < 3) then
      print *, USAGE
      return
    end if
    call getarg(1, a)
    read (a, *) x
    call getarg(2, a)
    read (a, *) y
    call getarg(3, a)
    read (a, *) z
  end subroutine get_arg

  ! ECEF -> BLH
  !
  ! :param(in)  real(8)   x: ECEF 座標 X
  ! :param(in)  real(8)   y: ECEF 座標 Y
  ! :param(in)  real(8)   z: ECEF 座標 Z
  ! :param(out) real(8) lat: BLH  座標 Beta(Latitude)
  ! :param(out) real(8) lon: BLH  座標 Lambda(Longitude)
  ! :param(out) real(8)  ht: BLH  座標 Height
  subroutine conv_ecef2blh(x, y, z, lat, lon, ht)
    implicit none
    real(DP), intent(in)  :: x, y, z
    real(DP), intent(out) :: lat, lon, ht
    real(DP) :: p, theta, s, c

    p = sqrt(x * x + y * y)
    theta = atan2(z * A, p * B) / PI_180
    s = sin(theta * PI_180)
    c = cos(theta * PI_180)
    lat = atan2(z + ED2 * B * s * s * s, p - E2  * A * c * c * c) &
      & / PI_180
    lon = atan2(y, x) / PI_180
    ht = (p / cos(lat * PI_180)) - f(lat)
  end subroutine conv_ecef2blh

  ! Function for ecef2blh
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
end program ecef2blh
{% endhighlight %}

* [Gist - Fortran 95 source code to convert ECEF  to WGS84(BLH) coordinate.](https://gist.github.com/komasaru/2ea79f190fd0737b0f26f107366b1763 "Gist - Fortran 95 source code to convert ECEF to WGS84(BLH) coordinate.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o ecef2blh ecef2blh.f95
```

### 4. 動作確認

ECEF の X, Y, Z 座標を m（メートル）で指定して実行する。

``` text
$ ./ecef2blh -3899086.094 3166914.545 3917336.601
ECEF: X = -3899086.094m
      Y =  3166914.545m
      Z =  3917336.601m
--->
BLH: LATITUDE(BETA) =  38.13579617°
  LONGITUDE(LAMBDA) = 140.91581617°
             HEIGHT =       41.940m
```

### 5. 参考文献

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")

---

人工衛星の正確な軌道計算等に利用できるでしょう。

以上。

