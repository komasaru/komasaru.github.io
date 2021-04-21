---
layout   : single
title    : "Fortran - WGS84 (BLH) 座標 -> ECEF 座標 変換！"
published: true
date     : 2019-05-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
---

WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)を ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標に変換する処理を Fortran 95 で実装してみました。

過去には Python, Ruby で実装しています。

* [Python - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2018/09/02/python-convert-blh-to-ecef "Python - WGS84 (BLH) 座標 -> ECEF 座標 変換！")
* [Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！]({{site.baseurl}}/2019/04/26/ruby-convert-blh-to-ecef "Ruby - WGS84 (BLH) 座標 -> ECEF 座標 変換！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。
* ここでは、 WGS84(World Geodetic System 1984) 測地系や ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）の詳細についての説明はしない。

### 1. ソースコードの作成

File: `blh2ecef.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! BLH -> ECEF 変換
! : WGS84 の緯度(Beta)／経度(Lambda)／楕円体高(Height)を
!   ECEF（Earth Centered Earth Fixed; 地球中心・地球固定直交座標系）座標に
!   変換する。
!
!   date          name            version
!   2019.02.21    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
! ---
! 引数 :  BETA LAMBDA HEIGHT
!         (BETA: Latitude, LAMBDA: Longitude)
!*******************************************************************************
!
program blh2ecef
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,      parameter :: SP = kind(1.0)
  integer(SP),  parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  character(*), parameter :: USAGE = "[USAGE] ./blh2ecef LATITUDE(BETA) LONGITUDE(LAMBDA) HEIGHT"
  real(DP), parameter :: A      = 6378137.0_DP           ! a(地球楕円体長半径(赤道面平均半径))
  real(DP), parameter :: ONE_F  = 298.257223563_DP       ! 1 / f(地球楕円体扁平率=(a - b) / a)
  real(DP), parameter :: B      = A * (1.0_DP - 1.0_DP / ONE_F)  ! b(地球楕円体短半径)
  real(DP), parameter :: E2     = (1.0_DP / ONE_F) * (2.0_DP - (1.0_DP / ONE_F))
                                                         ! e^2 = 2 * f - f * f
                                                         !     = (a^2 - b^2) / a^2
  real(DP), parameter :: ED2    = E2 * A * A / (B * B)   ! e'^2= (a^2 - b^2) / b^2
  real(DP), parameter :: PI     = atan(1.0_DP) * 4.0_DP  ! 円周率
  real(DP), parameter :: PI_180 = PI / 180.0_DP          ! 0.0174532925199433
  real(DP) :: lat, lon, ht  ! BLH  座標
  real(DP) :: x, y, z       ! ECEF 座標

  ! コマンドライン引数(Beta, Lambda, Height)取得
  call get_arg(lat, lon, ht)
  if (lat == 0) stop
  print '("BLH: LATITUDE(BETA) = ", F12.8, "°")', lat
  print '("  LONGITUDE(LAMBDA) = ", F12.8, "°")', lon
  print '("             HEIGHT = ", F12.3, "m"  )', ht

  ! BLH -> ECEF
  call conv_blh2ecef(lat, lon, ht, x, y, z)

  ! 結果出力
  print '(A)', "--->"
  print '("ECEF: X = ", F12.3, "m")', x
  print '("      Y = ", F12.3, "m")', y
  print '("      Z = ", F12.3, "m")', z

  stop
contains
  ! コマンドライン引数(Beta, Lambda, Height)取得
  !
  ! :param(out) real(8) lat: Beta(Latitude)
  ! :param(out) real(8) lon: Lambda(Longitude)
  ! :param(out) real(8)  ht: Height
  subroutine get_arg(lat, lon, ht)
    implicit none
    real(DP), intent(out) :: lat, lon, ht
    character(20) :: a

    lat = 0.0_DP
    lon = 0.0_DP
    ht  = 0.0_DP
    if (iargc() < 3) then
      print *, USAGE
      return
    end if
    call getarg(1, a)
    read (a, *) lat
    call getarg(2, a)
    read (a, *) lon
    call getarg(3, a)
    read (a, *) ht
  end subroutine get_arg

  ! BLH -> ECEF
  !
  ! :param(in)  real(8) lat: BLH  座標 Beta(Latitude)
  ! :param(in)  real(8) lon: BLH  座標 Lambda(Longitude)
  ! :param(in)  real(8)  ht: BLH  座標 Height
  ! :param(out) real(8)   x: ECEF 座標 X
  ! :param(out) real(8)   y: ECEF 座標 Y
  ! :param(out) real(8)   z: ECEF 座標 Z
  subroutine conv_blh2ecef(lat, lon, ht, x, y, z)
    implicit none
    real(DP), intent(in)  :: lat, lon, ht
    real(DP), intent(out) :: x, y, z
    real(DP) :: c_lat, c_lon, s_lat, s_lon

    c_lat = cos(lat * PI_180)
    c_lon = cos(lon * PI_180)
    s_lat = sin(lat * PI_180)
    s_lon = sin(lon * PI_180)
    x = (f(lat) + ht) * c_lat * c_lon
    y = (f(lat) + ht) * c_lat * s_lon
    z = (f(lat) * (1.0_DP - E2) + ht) * s_lat
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
end program blh2ecef
{% endhighlight %}

* [Gist - Fortran 95 source code to convert WGS84(BLH) to ECEF coordinate.](https://gist.github.com/komasaru/b2a58ff7cef9bc2865b8a4820d2de89e "Gist - Fortran 95 source code to convert WGS84(BLH) to ECEF coordinate.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o blh2ecef blh2ecef.f95
```

### 4. 動作確認

``` text
$ ./blh2ecef 38.13579617 140.91581617 41.940
BLH: LATITUDE(BETA) =  38.13579617°
  LONGITUDE(LAMBDA) = 140.91581617°
             HEIGHT =       41.940m
--->
ECEF: X = -3899086.094m
      Y =  3166914.545m
      Z =  3917336.601m
```

### 5. 参考文献

* [理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf](https://www.enri.go.jp/~fks442/K_MUSEN/1st/1st060428rev2.pdf "理解するための　ＧＰＳ測位計算入門 - 1st060428rev2.pdf")

---

人工衛星の正確な軌道計算等に利用できるでしょう。

以上。

