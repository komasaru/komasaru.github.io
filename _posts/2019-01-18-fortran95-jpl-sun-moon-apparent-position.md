---
layout   : single
title    : "Fortran - JPL DE430 データから太陽・月の視位置を計算！"
published: true
date     : 2019-01-18 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

Fortran 95 で、 NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している太陽・月・惑星の暦の最新版 DE430 からデータを取得し、太陽と月の視位置を高精度で計算してみました。

過去に Ruby で行ったことはありましたが。（Python でも行ったがブログ記事にはしていない）

* [Ruby - JPL DE430 データから太陽・月の視位置を計算！]({{site.baseurl}}/2016/10/06/ruby-sun-moon-apparent-position-calculation "Ruby - JPL DE430 データから太陽・月の視位置を計算！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ソースコードの作成

* 以下は実行部分。

File: `apparent_sun_moon_jpl.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! 太陽・月の視位置計算
! * JPLEPH(JPL の DE430 バイナリデータ)を読み込み、視位置を計算する
!
!   Date          Author          Version
!   2018.10.25    mk-mode.com     1.00 新規作成
!   2018.11.09    mk-mode.com     1.01 時刻の取扱変更(マイクロ秒 => ミリ秒)
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数 : JST
!        * JST は 日本標準時（省略可）
!          書式：YYYYMMDD[HHMMSS[MMM]]
!                (最後の MMM はミリ秒)
!          無指定なら現在(システム日時)を JST とみなす。
! ---
! * 構造型 type(t_time) は time    モジュール内で定義
! * 構造型 type(t_bin)  は eph_jpl モジュール内で定義
!*******************************************************************************
!
program apparent_sun_moon_jpl
  use const, only : SP, DP, PI, FMT_DT_0, FMT_DT_1
  use time
  use apos
  use eph_jpl
  implicit none
  type(t_time)  :: jst, utc, tdb
  real(DP)      :: jd_tdb
  type(t_bin)   :: bin  ! バイナリデータ用構造型
  integer(SP)   :: i
  real(DP)      :: jds(2)
  ! 時刻 t1(TDB), t2(TDB) における位置・速度(ICRS座標)用配列
  real(DP) :: icrs_1(6, 3), icrs_2(6, 3)
  real(DP) :: d_e_m, d_e_s                  ! 地球と月・太陽の距離
  real(DP) :: r_s, r_m, r_e                 ! 太陽・月・地球の半径
  real(DP) :: apos_eq(3, 2), apos_ec(3, 2)  ! 太陽・月の視位置
  real(DP) :: rad_para(2, 2)                ! 太陽・月の視半径・視差

  ! コマンドライン引数(JST)取得, UTC 計算
  call get_arg(jst)
  if (jst%year == 0) then
    stop
  else
    call jst2utc(jst, utc)
  end if

  ! === 時刻 t2 のユリウス日
  call utc2tdb(utc, tdb)
  call gc2jd(tdb, jd_tdb)

  ! === バイナリデータ読み込み
  call get_bin(jd_tdb, bin)

  ! === 時刻 t2(= TDB) における地球・月・太陽の位置・速度（ICRS 座標）の計算
  call get_icrs( 3, jd_tdb, icrs_2(1:6, 1))
  call get_icrs(10, jd_tdb, icrs_2(1:6, 2))
  call get_icrs(11, jd_tdb, icrs_2(1:6, 3))

  ! === 時刻 t2(= TDB) における地球と月・太陽の距離
  call get_dist_e(icrs_2, d_e_m, d_e_s)

  ! === 地球・月・太陽の半径取得
  call get_r(jd_tdb, bin%cnam, bin%cval, r_e, r_m, r_s)

  ! === 太陽・月の視位置計算
  call calc_sun(jd_tdb, icrs_2, d_e_s, r_e, r_s, bin%au, &
    & apos_eq(1:3, 1), apos_ec(1:3, 1), rad_para(1:2, 1))
  call calc_moon(jd_tdb, icrs_2, d_e_m, r_e, r_m, bin%au, &
    & apos_eq(1:3, 2), apos_ec(1:3, 2), rad_para(1:2, 2))

  ! 結果出力
  print '("* 計算対象時刻 (JST) = ", A)', date_fmt(jst)
  print '("               (UTC) = ", A)', date_fmt(utc)
  print '("               (TDB) = ", A)', date_fmt(tdb)
  print '("                (JD) = ", F18.10, " (days)")', jd_tdb
  print *
  print '(A)', "* 視位置：太陽"
  print '("  = [赤経: ", F14.10, " rad, 赤緯: ", F14.10, " rad]")', &
    & apos_eq(1:2, 1)
  print '("  = [赤経: ", F14.10, " deg, 赤緯: ", F14.10, " deg]")', &
    & apos_eq(1:2, 1) * 180.0_DP / PI
  print '("  = [黄経: ", F14.10, " rad, 黄緯: ", F14.10, " rad]")', &
    & apos_ec(1:2, 1)
  print '("  = [黄経: ", F14.10, " deg, 黄緯: ", F14.10, " deg]")', &
    & apos_ec(1:2, 1) * 180.0_DP / PI
  print '(A)', "* 視位置：月"
  print '("  = [赤経: ", F14.10, " rad, 赤緯: ", F14.10, " rad]")', &
    & apos_eq(1:2, 2)
  print '("  = [赤経: ", F14.10, " deg, 赤緯: ", F14.10, " deg]")', &
    & apos_eq(1:2, 2) * 180.0_DP / PI
  print '("  = [黄経: ", F14.10, " rad, 黄緯: ", F14.10, " rad]")', &
    & apos_ec(1:2, 2)
  print '("  = [黄経: ", F14.10, " deg, 黄緯: ", F14.10, " deg]")', &
    & apos_ec(1:2, 2) * 180.0_DP / PI
  print '(A)', "* 視黄経差：太陽 - 月"
  print '("  = ", F14.10, " rad")', &
    & apos_ec(1, 1) - apos_ec(1, 2)
  print '("  = ", F14.10, " deg")', &
    & (apos_ec(1, 1) - apos_ec(1, 2)) * 180.0 / PI
  print '(A)', "* 距離：太陽"
  print '("  = ", F12.10, " AU")', apos_ec(3, 1)
  print '("  = ", F12.2,  " km")', apos_ec(3, 1) * bin%au
  print '(A)', "* 距離：月"
  print '("  = ", F12.10, " AU")', apos_ec(3, 2)
  print '("  = ", F12.2,  " km")', apos_ec(3, 2) * bin%au
  print '(A)', "* 視半径：太陽"
  print '("  = ", F6.2,   " ″")', rad_para(1, 1)
  print '(A)', "* 視半径：月"
  print '("  = ", F6.2,   " ″")', rad_para(1, 2)
  print '(A)', "* （地平）視差：太陽"
  print '("  = ", F6.2,   " ″")', rad_para(2, 1)
  print '(A)', "* （地平）視差：月"
  print '("  = ", F7.2,   " ″")', rad_para(2, 2)

  stop
contains
  ! コマンドライン引数取得
  ! * YYYYMMDD[HHMMSS[MMM]] 形式
  ! * 17桁超入力された場合は、18桁目以降の部分は切り捨てる
  ! * コマンドライン引数がなければ、システム日付を JST とする
  ! * 日時の整合性チェックは行わない
  !
  ! :param(inout) type(t_time) jst
  subroutine get_arg(jst)
    implicit none
    type(t_time), intent(inout) :: jst
    character(17) :: gc
    integer(SP)   :: dt(8), len_gc

    if (iargc() == 0) then
      call date_and_time(values=dt)
      jst = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7), dt(8))
    else
      call getarg(1, gc)
      len_gc = len(trim(gc))
      if (len_gc /= 8 .and. len_gc /= 14 .and. len_gc /= 17) then
        print *, "Format: YYYYMMDD[HHMMSS[MMM]]"
        return
      end if
      read (gc, FMT_DT_0) jst
    end if
  end subroutine get_arg

  ! UTC -> TDB
  !
  ! :param(in)  type(t_time) utc
  ! :param(out) type(t_time) tdb
  subroutine utc2tdb(utc, tdb)
    implicit none
    type(t_time), intent(in)  :: utc
    type(t_time), intent(out) :: tdb
    type(t_time) :: tai, tt, tcb
    integer(SP)  :: utc_tai
    real(DP)     :: jd, jd_tcb

    call utc2utc_tai(utc, utc_tai)
    call utc2tai(utc, utc_tai, tai)
    call tai2tt(tai, tt)
    call gc2jd(utc, jd)
    call tt2tcb(tt, jd, tcb)
    call gc2jd(tcb, jd_tcb)
    call tcb2tdb(tcb, jd_tcb, tdb)
  end subroutine utc2tdb

  ! 地球／月／太陽の半径取得
  !
  ! :param(in)  real(8)              jd
  ! :param(in)  character(6) cnam(1000)
  ! :param(in)  real(8)      cval(1000)
  ! :param(out) real(8)             r_e
  ! :param(out) real(8)             r_m
  ! :param(out) real(8)             r_s
  subroutine get_r(jd, cnam, cval, r_e, r_m, r_s)
    implicit none
    character(*), intent(in)  :: cnam(1000)
    real(DP),     intent(in)  :: jd, cval(1000)
    real(DP),     intent(out) :: r_e, r_m, r_s

    do i = 1, 1000
      select case (trim(cnam(i)))
      case("ASUN")
        r_s = cval(i)
      case("AM")
        r_m = cval(i)
      case("RE")
        r_e = cval(i)
      end select
    end do
  end subroutine get_r
end program apparent_sun_moon_jpl
{% endhighlight %}

モジュールや定数ファイルを含めた全てのファイルは GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている）

* [CalendarF95/apparent_sun_moon_jpl at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/apparent_sun_moon_jpl "CalendarF95/apparent_sun_moon_jpl at master · komasaru/CalendarF95")

### 2. ソースコードのビルド

``` text
$ make
```

* やり直す場合は、 `make clean` してから。

### 3. 準備

* JPL 天文暦バイナリデータ `JPLEPH` を実行ファイルと同じディレクトリ内に配置。  
  （参照「[JPL 天文暦データのバイナリ化！](https://www.mk-mode.com/octopress/2016/04/18/merging-jpl-data/ "JPL 天文暦データのバイナリ化！")」）
* うるう年ファイル `LEAP_SEC.txt` は適宜最新のものに更新すること。

### 4. 実行方法

``` text
$ ./apparent_sun_moon_jpl [YYYYMMDD[HHMMSS[MMM]]]
```

* JST（日本標準時）は「年・月・日・時・分・秒・ミリ秒」を17桁で指定する。
* JST（日本標準時）を指定しない場合は、システム日時を JST とみなす。

以下、実行例。

``` text
$ ./apparent_sun_moon_jpl 20190118123456123
* 計算対象時刻 (JST) = 2019-01-18 12:34:56.123
               (UTC) = 2019-01-18 03:34:56.123
               (TDB) = 2019-01-18 03:35:28.307
                (JD) = 2458501.6496331827 (days)

* 視位置：太陽
  = [赤経:   5.2327604549 rad, 赤緯:  -0.3597329969 rad]
  = [赤経: 299.8150892684 deg, 赤緯: -20.6111824751 deg]
  = [黄経:   5.1964494421 rad, 黄緯:   0.0000195578 rad]
  = [黄経: 297.7346214828 deg, 黄緯:   0.0011205780 deg]
* 視位置：月
  = [赤経:   1.3024318757 rad, 赤緯:   0.3343675536 rad]
  = [赤経:  74.6238495823 deg, 赤緯:  19.1578496276 deg]
  = [黄経:   1.3171453007 rad, 黄緯:  -0.0612023871 rad]
  = [黄経:  75.4668667361 deg, 黄緯:  -3.5066384764 deg]
* 視黄経差：太陽 - 月
  =   3.8793041413 rad
  = 222.2677547467 deg
* 距離：太陽
  = 0.9837157641 AU
  = 147161783.68 km
* 距離：月
  = 0.0024693984 AU
  =    369416.75 km
* 視半径：太陽
  = 975.53 ″
* 視半径：月
  = 970.42 ″
* （地平）視差：太陽
  =   8.94 ″
* （地平）視差：月
  = 3561.43 ″
```

---

以上、

