---
layout   : single
title    : "Fortran - JPL 天文暦データから ICRS 座標を計算！"
published: true
date     : 2019-01-12 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

前回、NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 のバイナリ形式のデータを Fortran 95 で読み込みました。

* [Fortran - JPL 天文暦バイナリデータの読み込み！]({{site.baseurl}}/2019/01/09/fortran95-jpl-ephemeris-binary-reading "Fortran - JPL 天文暦バイナリデータの読み込み！")

今回は、読み込んだデータから ICRS 座標を計算してみました。 Fortran 95 で。（読み込んだデータは ICRS 座標の計算に必要なチェビシェフ多項式の係数データ）

過去には Ruby や Python でも行いましたが。

* [Ruby - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2016/04/30/ruby-calc-jpl-icrs-coordinate "Ruby - JPL 天文暦データから ICRS 座標を計算！")
* [Python - JPL 天文暦データから ICRS 座標を計算！]({{site.baseurl}}/2018/07/08/python-calc-jpl-icrs-coordinate "Python - JPL 天文暦データから ICRS 座標を計算！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 天文暦バイナリデータについて

当ブログ過去記事を参照のこと。

* [JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")

また、天文暦データには各種バージョンが存在するが、日本の国立天文台が現在使用している DE430 を当方も使用する。

### 2. ソースコードの作成

* 以下は実行部分。（距離の単位は AU（天文単位）固定としている）

File: `jpl_calc_430.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! JPLEPH(JPL の DE430 バイナリデータ)読み込み、座標（位置・速度）を計算
! * 対象天体
!    1: 水星            (Mercury)
!    2: 金星            (Venus)
!    3: 地球            (Earth)
!    4: 火星            (Mars)
!    5: 木星            (Jupiter)
!    6: 土星            (Saturn)
!    7: 天王星          (Uranus)
!    8: 海王星          (Neptune)
!    9: 冥王星          (Pluto)
!   10: 月              (Moon)
!   11: 太陽            (Sun)
!   12: 太陽系重心      (Solar system Barycenter)
!   13: 地球 - 月の重心 (Earth-Moon Barycenter)
!   14: 地球の章動      (Earth Nutations)
!   15: 月の秤動        (Lunar mantle Librations)
!
!   Date          Author          Version
!   2018.10.21    mk-mode.com     1.00 新規作成
!   2018.11.09    mk-mode.com     1.01 時刻の取扱変更(マイクロ秒 => ミリ秒)
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数
!   [第１] 対象天体番号（必須）
!          * 1 〜 15
!   [第２] 基準天体番号（必須）
!          * 0, 1 〜 13
!            (0 は、対象天体番号が 14, 15 のときのみ)
!   [第３] ユリウス日（省略可）
!          * 省略時は現在日時を UTC とみなしたユリウス日
! ---
! * 構造型 type(t_time) は time    モジュール内で定義
! * 構造型 type(t_bin)  は eph_jpl モジュール内で定義
!*******************************************************************************
!
program jpl_calc_430
  use const
  use time
  use eph_jpl
  implicit none
  integer(SP)   :: t, c  ! 指定の天体番号（対象、基準）
  real(DP)      :: jd    ! 指定のJulian Day
  type(t_bin)   :: bin   ! バイナリデータ用構造型
  integer(SP)   :: i
  real(DP)      :: jds(2)
  ! 計算対象フラグ
  integer(SP)   :: list(12) = (/(0, i=1,12)/)
  ! 算出データ（対象 - 基準）配列（位置(x, y, z)・速度(x, y, z)）
  real(DP)      :: rrd(6) = (/(0.0_DP, i=1,6)/)

  ! コマンドライン引数(天体番号（対象、基準）、JD)取得
  call get_arg(t, c, jd)
  if (t == 0) then
    do i = 1, size(USAGE)
      print *, USAGE(i)
    end do
    stop
  end if

  ! バイナリデータ取得
  ! * 1レコード目:     ttl - numde
  ! * 2レコード目:     cval
  ! * 3レコード目以降: 係数
  call get_bin(jd, bin)

  ! インデックスの開始／終了 JD
  jds = bin%coeff(1:2)

  ! 計算対象フラグ一覧取得
  call get_list(t, c, bin%ipt, list)

  ! 位置・速度計算
  call calc_rrd(t, c, jd, jds, bin, list, rrd)

  ! 結果出力
  print '("  TARGET: ", I2, " (", A, ")")', t, trim(ASTRS(t))
  print '("  CENTER: ", I2, " (", A, ")")', c, trim(ASTRS(c))
  print '("      JD: ", F16.8, " days")', jd
  print '("      AU: ", F11.1, " km" /)', bin%au
  if (t == 14) then
    print '("  Position(Δψ) = ", F32.20, " rad")',     rrd(1)
    print '("  Position(Δε) = ", F32.20, " rad")',     rrd(2)
    print '("  Velocity(Δψ) = ", F32.20, " rad/day")', rrd(4)
    print '("  Velocity(Δε) = ", F32.20, " rad/day")', rrd(5)
  else if (t == 15) then
    print '("  Position(φ) = ",   F32.20, " AU")',      rrd(1)
    print '("  Position(θ) = ",   F32.20, " AU")',      rrd(2)
    print '("  Position(ψ) = ",   F32.20, " AU")',      rrd(3)
    print '("  Velocity(φ) = ",   F32.20, " AU/day")',  rrd(4)
    print '("  Velocity(θ) = ",   F32.20, " AU/day")',  rrd(5)
    print '("  Velocity(ψ) = ",   F32.20, " AU/day")',  rrd(6)
  else
    print '("  Position(x) = ",    F32.20, " AU")',      rrd(1)
    print '("  Position(y) = ",    F32.20, " AU")',      rrd(2)
    print '("  Position(z) = ",    F32.20, " AU")',      rrd(3)
    print '("  Velocity(x) = ",    F32.20, " AU/day")',  rrd(4)
    print '("  Velocity(y) = ",    F32.20, " AU/day")',  rrd(5)
    print '("  Velocity(z) = ",    F32.20, " AU/day")',  rrd(6)
  end if

  stop
contains
  ! コマンドライン引数(天体番号（対象、基準）、JD)取得
  ! * 天体番号: 1 〜 15
  ! * JD: 実数形式（整合性チェックは行わない）
  !
  ! :param(inout) integer  t
  ! :param(inout) integer  c
  ! :param(inout) real(8) jd
  subroutine get_arg(t, c, jd)
    implicit none
    integer(SP), intent(inout) :: t, c
    real(DP),    intent(inout) :: jd
    character(20) :: arg_j
    type(t_time)  :: utc
    character(2)  :: arg_t, arg_c
    integer(SP)   :: dt(8)

    if (iargc() < 2) then
      t = 0
      c = 0
      jd = 0.0_DP
      return
    end if
    call getarg(1, arg_t)
    read (arg_t, *) t
    call getarg(2, arg_c)
    read (arg_c, *) c
    if (iargc() < 3) then
      call date_and_time(values=dt)
      utc = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7), dt(8))
      call gc2jd(utc, jd)
    else
      call getarg(3, arg_j)
      read (arg_j, *) jd
    end if
    if ((t < 1 .or. c < 0 .or. t > 15 .or. c > 13) .or. &
        (t > 13 .and. c /= 0) .or. (t < 14 .and. c == 0)) then
      t = 0
      c = 0
      jd = 0.0_DP
      return
    end if
  end subroutine get_arg
end program jpl_calc_430
{% endhighlight %}

モジュールを含めた全てのファイルは GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている）

* [CalendarF95/jpl_calc_430 at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/jpl_calc_430 "CalendarF95/jpl_calc_430 at master · komasaru/CalendarF95")

### 3. ソースコードのビルド

``` text
$ make
```

* やり直す場合は、 `make clean` してから。

### 4. 準備

* JPL 天文暦バイナリデータ `JPLEPH` を実行ファイルと同じディレクトリ内に配置。  
  （参照「[JPL 天文暦データのバイナリ化！](https://www.mk-mode.com/octopress/2016/04/18/merging-jpl-data/ "JPL 天文暦データのバイナリ化！")」）

### 5. 実行方法

``` text
$ ./jpl_calc_430 T C [JD]
```

* `T` は対象天体番号。（`1`〜`15`; 必須）
   1. 水星            (Mercury)
   2. 金星            (Venus)
   3. 地球            (Earth)
   4. 火星            (Mars)
   5. 木星            (Jupiter)
   6. 土星            (Saturn)
   7. 天王星          (Uranus)
   8. 海王星          (Neptune)
   9. 冥王星          (Pluto)
  10. 月              (Moon)
  11. 太陽            (Sun)
  12. 太陽系重心      (Solar system Barycenter)
  13. 地球 - 月の重心 (Earth-Moon Barycenter)
  14. 地球の章動      (Earth Nutations)
  15. 月の秤動        (Lunar mantle Librations)
* `C` は基準天体番号。（`0`, `1`〜`13`; 必須）  
  (`0` は、対象天体番号が `14`, `15` のときのみ)
* `JD` はユリウス日(Julian Day)。（省略可）  
  （省略時はシステム時刻を UTC とみなしたユリウス日）

以下、実行例。

``` text
$ ./jpl_calc_430 3 11 2458496
  TARGET:  3 (Earth)
  CENTER: 11 (Sun)
      JD: 2458496.00000000 days
      AU: 149597870.7 km

  Position(x) =          -0.36402347301846232908 AU
  Position(y) =           0.83824577267230659938 AU
  Position(z) =           0.36338292908824731953 AU
  Velocity(x) =          -0.01626279812137284078 AU/day
  Velocity(y) =          -0.00590802765559216014 AU/day
  Velocity(z) =          -0.00256080882136208417 AU/day
```

---

以上、

