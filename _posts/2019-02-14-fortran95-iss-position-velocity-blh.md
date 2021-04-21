---
layout   : single
title    : "Fortran - ISS 位置・速度（WGS84(BLH) 座標）の算出！"
published: true
date     : 2019-02-14 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Fortran
---

前回、 Fortran 95 で NASA 提供の最新の TLE（2行軌道要素形式）から任意の時刻（UT1; 世界時1）の ISS の位置・速度（TEME 座標）を、 SGP4 アルゴリズムを用いて計算しました。

今回は、これの応用として、取得した TEME 座標を WGS84 座標（いわゆる、緯度・経度・高度(BLH)という座標）に変換します。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linuz Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 でのビルド（コンパイル＆リンク）を想定。
* ここでは、各種座標系、 SGP4 アルゴリズム（Simplified General Perturbations Satellite Orbit Model 4; NASA, NORAD が使用している、近地球域の衛星の軌道計算用で、周回周期225分未満の衛星に使用すべきアルゴリズム）等についての詳細は説明しない。

### 1. 各種座標系について

* TEME 座標とは「真赤道面平均春分点」のことで、 "True Equator, Mean Equinox" の略。
* PEF 座標とは「擬地球固定座標系」のことで、 "Pseudo Earth Fixed" の略。
* ECEF 座標とは「地球中心・地球固定直交座標系」のことで、 "Earth Centered, Earth Fixed" の略。
* WGS84 座標とは「世界測地系1984」のことで、 "World Geodetic System 1984" の略。 GPS で使用する測地系。

### 2. ソースコードの作成

以下は、実行部分。

File: `iss_sgp4.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! Getting of ISS position.
!
!   date          name            version
!   2018.11.27    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数 : JST（日本標準時）
!          YYYYMMDD[HHMMSS[MMM]]
!          無指定なら現在(システム日時)を JST とみなす。
!          （上記最後の MMM はミリ秒）
! ---
! MEMO:
!   TEME: True Equator, Mean Equinox; 真赤道面平均春分点
!    PEF: Pseudo Earth Fixed; 擬地球固定座標系
!   ECEF: Earth Centered, Earth Fixed; 地球中心・地球固定直交座標系
!*******************************************************************************
!
program iss_sgp4
  use const,       only : SP, DP, JST_UTC, UID, F_TLE, SEC_D, TT_TAI, &
                        & DAY_JC, FMT_DT_0, FMT_DT_1, &
                        & getgravconst
  use propagation, only : propagate
  use io
  use model
  use ext
  use eph
  implicit none
  type(t_time)  :: jst, utc, ut1, tai, tt
  type(t_eop)   :: eop
  type(t_sat)   :: satrec
  type(t_cst)   :: gravconst
  character(69) :: tle(2)
  integer(SP)   :: dat
  real(DP)      :: jd_ut1, jd_tt, t_tt, gmst, om, gmst_g, r(3), v(3)
  real(DP)      :: mtx_z(3, 3), mtx_pm(3, 3)
  real(DP)      :: r_pef(3), r_ecef(3), om_e(3), v_pef(3), v_ecef(3)
  real(DP)      :: lat, lon, ht, vel_ecef

  ! コマンドライン引数（現在日時(JST)）取得
  call get_arg(jst)
  if (jst%year == 0) stop

  ! 初期処理
  call init
  print '(A)', "[初期データ]"
  print '(A, " JST")',            date_fmt(jst)
  print '(A, " UTC")',            date_fmt(utc)
  print '(A, " UT1")',            date_fmt(ut1)
  print '("TAI - UTC = ", I0)',             dat
  print '(A, " TAI")',            date_fmt(tai)
  print '(A, "  TT")',            date_fmt(tt )
  print '("JD(UT1) = ", F11.3, " day")', jd_ut1
  print '("JD(TT ) = ", F16.8, " day")',  jd_tt
  print '(" T(TT ) = ", F10.8)',           t_tt
  print '("TLE = ", A)',                 tle(1)
  print '("      ", A)',                 tle(2)

  ! ISS 位置・速度取得
  call get_iss
  print '(/A)', "[途中経過]"
  print '("TEME POS = ", 3F16.8)', r
  print '("     VEL = ", 3F16.8)', v

  ! TEME -> BLH 変換
  call teme2blh
  print '("  GMST = ", F10.8, " rad.")',                 gmst
  print '("    om = ", F10.8, " rad.")',                   om
  print '("GMST_G = ", F10.8, " rad.")',               gmst_g
  print '("ROTATE MATRIX(for GMST) =", 3(/3(E20.8)))',  mtx_z
  print '("ROTATE MATRIX(for PM) =",   3(/3(E20.8)))', mtx_pm
  print '("POSITION(PEF) = ",             /3(F16.8))',  r_pef
  print '("POSITION(ECEF) = ",            /3(F16.8))', r_ecef
  print '("om_earth =",                   /3(E20.8))',   om_e
  print '("VELOCITY(PEF) = ",             /3(F16.8))',  v_pef
  print '("VELOCITY(ECEF) = ",            /3(F16.8))', v_ecef

  ! 最終結果出力
  print '(/A)', "[計算結果]"
  print '(A)',  "WGS84(BLH):"
  print '("  POSITION  LAT = ", F9.4, " °"  )',      lat
  print '("            LON = ", F9.4, " °"  )',      lon
  print '("         HEIGHT = ", F9.4, " km"  )',       ht
  print '("  VELOCITY      = ", F9.4, " km/s")', vel_ecef

  stop
contains
  ! コマンドライン引数取得
  ! * YYYYMMDD[HHMMSS[MMM]] 形式
  ! * 17桁超入力された場合は、18桁目以降の部分は切り捨てる
  ! * コマンドライン引数がなければ、システム日時を JST とする
  ! * 日時の整合性チェックは行わない
  !
  ! :param(out) type(t_time) jst
  subroutine get_arg(jst)
    implicit none
    type(t_time), intent(out) :: jst
    character(17) :: gc
    integer(SP)   :: dt(8)
    integer(SP)   :: len_gc

    if (iargc() == 0) then
      call date_and_time(values=dt)
      jst = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7), dt(8))
    else
      call getarg(1, gc)
      len_gc = len(trim(gc))
      if (len_gc /= 8 .and. len_gc /= 14 .and. len_gc /= 17) then
        print *, "Format: YYYYMMDD[HHMMSS[MMM]"
        return
      end if
      read (gc, FMT_DT_0) jst
    end if
  end subroutine get_arg

  ! 初期処理
  subroutine init
    implicit none

    ! 各種時刻換算
    call add_day(jst, -JST_UTC / 24.0_DP, utc)
    call get_eop(utc, eop)
    call add_day(utc, eop%dut1/ SEC_D, ut1)
    call get_dat(utc, dat)
    call add_day(utc, dat / SEC_D, tai)
    call add_day(tai, TT_TAI / SEC_D, tt)
    call gc2jd(ut1, jd_ut1)
    call gc2jd(tt, jd_tt)
    t_tt = (jd_tt - 2451545.0_DP) / DAY_JC

    ! TLE 読み込み
    call get_tle(ut1, tle)
  end subroutine init

  ! ISS 位置・速度取得
  subroutine get_iss
    implicit none

    ! WGS84 用定数の取得
    gravconst = getgravconst("wgs84")

    ! ISS 初期位置・速度の取得
    call twoline2rv(tle, gravconst, satrec)

    ! 指定 UT1 の ISS 位置・速度の取得
    call propagate(gravconst, satrec, ut1, r, v)

    ! Error 時、終了
    !   1 - mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er
    !   2 - mean motion less than 0.0
    !   3 - pert elements, ecc < 0.0  or  ecc > 1.0
    !   4 - semi-latus rectum < 0.0
    !   5 - epoch elements are sub-orbital
    !   6 - satellite has decayed
    if (satrec%error /= 0) then
      print '(A, I0, A)', "ERROR! [", satrec%error, "]"
      stop
    end if
  end subroutine get_iss

  ! TEME -> BLH 変換
  subroutine teme2blh
    implicit none

    ! GMST（グリニッジ平均恒星時）計算
    gmst = calc_gmst(jd_ut1)
    ! Ω（月の平均昇交点黄経）計算（IAU1980章動理論）
    om = calc_om(t_tt)
    ! GMST に運動項を適用（1997年より新しい場合）
    gmst_g = apply_kinematic(gmst, jd_ut1, om)
    ! GMST 回転行列（z軸を中心とした回転）
    mtx_z = r_z(gmst_g)
    ! 極運動(Polar Motion)回転行列
    mtx_pm = r_pm(eop%pm_x, eop%pm_y, t_tt)
    ! PEF 座標の計算（GMST 回転行列の適用）
    r_pef = matmul(r, mtx_z)
    ! ECEF 座標（位置）の計算（極運動(Polar Motion)の適用）
    r_ecef = matmul(r_pef, mtx_pm)
    ! Ω_earth値の計算
    om_e = calc_om_e(eop%lod)
    ! PEF 座標（速度）の計算（GMST 回転行列の適用）
    v_pef = matmul(v, mtx_z) - v_cross(om_e, r_pef)
    ! ECEF 座標（速度）の計算（極運動(Polar Motion)の適用）
    v_ecef = matmul(v_pef, mtx_pm)
    ! ECEF 座標 => BLH(Beta, Lambda, Height) 変換
    call ecef2blh(r_ecef, lat, lon, ht)
    vel_ecef = sqrt(sum(v_ecef * v_ecef))
  end subroutine teme2blh

  ! TLE 取得
  !
  ! :param(in)  type(t_time)     ut1: UT1
  ! :param(out) character(69) tle(2): TLE(2行)
  subroutine get_tle(ut1, tle)
    implicit none
    type(t_time),  intent(in)  :: ut1
    character(69), intent(out) :: tle(2)
    character(69) :: buf, buf_p(2)
    integer(SP)   :: ios
    type(t_time)  :: utc  ! TLE 内の日時
    integer(SP)   :: i, l, y
    real(DP)      :: d
    character(17) :: s_ut1, s_utc

    write (s_ut1, FMT_DT_1) ut1

    ! ファイル OPEN
    open (unit   = UID,         &
        & iostat = ios,         &
        & file   = F_TLE,       &
        & action = "read",      &
        & form   = "formatted", &
        & status = "old")
    if (ios /= 0) then
      print '("[ERROR:", I0 ,"] Failed to open file: ", A)', ios, F_TLE
      stop
    end if

    tle   = ""
    buf_p = ""
    do
      read (UID, '(A)', iostat = ios) buf
      if (ios < 0) then
        exit
      else if (ios > 0) then
        print '("[ERROR:", I0 ,"] Failed to read file: ", A)', ios, F_TLE
      end if
      if (len(trim(buf)) == 0) cycle
      if (buf(1:1) /= "1" .and. buf(1:1) /= "2") cycle
      if (buf(1:1) == "1") then
        read (buf(19:20), '(I2)') y
        y = 2000 + y
        read (buf(21:32), '(F12.8)') d
        call add_day(t_time(y, 1, 1, 0, 0, 0, 0), d, utc)
        write (s_utc, FMT_DT_1) utc
        if (s_utc > s_ut1) then
          tle = buf_p
          exit
        end if
      end if
      read (buf(1:1), '(I1)') l
      buf_p(l) = buf
    end do

    ! 上記の処理で該当レコードが得られなかった場合は、最初の2行
    if (len(trim(tle(1))) == 0) then
      rewind(UID)
      do i = 1, 2
        read (UID, '(A)', iostat = ios) tle(i)
      end do
    end if

    ! ファイル CLOSE
    close(UID)
  end subroutine get_tle
end program iss_sgp4
{% endhighlight %}

モジュール等を含めた全てのファイルは GitHub リポジトリとして公開しているので、そちらを参照のこと。

* [iss/iss_sgp4 at master · komasaru/iss](https://github.com/komasaru/iss/tree/master/iss_sgp4 "iss/iss_sgp4 at master · komasaru/iss")

### 3. 準備

* GitHub リポジトリ [iss/tle2rv at master · komasaru/iss](https://github.com/komasaru/iss/tree/master/tle2rv "iss/tle2rv at master · komasaru/iss") から上記以外の全てのファイルを取得しておく。
* `tle_iss_nasa.txt`, `Leap_Second.dat`, `eop.csv` を最新のものにしておく。
  + `tle_iss_nasa.txt` の取得は「[Python - TLE（2行軌道要素形式）の取得(NASA)！]({{site.baseurl}}/2018/08/14/python-tle-getting-from-nasa "Python - TLE（2行軌道要素形式）の取得(NASA)！")」を参考に。
  + `Leap_Second.dat` は「[こちら](https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat "Leap_Second.dat")」を取得したものをそのまま配置する。
  + `eop.csv` の取得は「[Ruby, Python - EOP（地球姿勢パラメータ）CSV 生成！]({{site.baseurl}}/2018/08/29/ruby-python-eop-getting-from-iers "Ruby, Python - EOP（地球姿勢パラメータ）CSV 生成！")」

### 4. ビルド

Makefile を使用するので、以下のようにすればよい。

``` text
$ make
```

### 5. 実行

以下は、日本標準時(JST) 2019年1月1日（0時0分0.000秒）の ISS の位置・速度（WGS84(BLH) 座標）を計算する例。  
計算の流れが分かるよう、途中経過も出力するようにしている。

``` text
$ ./iss_sgp4 20190101
[初期データ]
2019-01-01 00:00:00.000 JST
2018-12-31 15:00:00.000 UTC
2018-12-31 14:59:59.963 UT1
TAI - UTC = 37
2018-12-31 15:00:37.000 TAI
2018-12-31 15:01:09.184  TT
JD(UT1) = 2458484.125 day
JD(TT ) = 2458484.12580074 day
 T(TT ) = 0.18998291
TLE = 1 25544U 98067A   18332.51648093  .00016717  00000-0  10270-3 0  9000
      2 25544  51.6394 279.8120 0005142  90.0655 270.1087 15.54020670 24063

[途中経過]
TEME POS =    -923.64052601   6327.37451246  -2273.32176709
     VEL =      -5.27233259      1.18198845      5.43472644
  GMST = 5.67215877 rad.
    om = 2.05236340 rad.
GMST_G = 5.67215878 rad.
ROTATE MATRIX(for GMST) =
      0.81905952E+00     -0.57370855E+00      0.00000000E+00
      0.57370855E+00      0.81905952E+00      0.00000000E+00
      0.00000000E+00      0.00000000E+00      0.10000000E+01
ROTATE MATRIX(for PM) =
      0.10000000E+01     -0.43289968E-10      0.48424645E-09
      0.43289968E-10      0.10000000E+01     -0.13400880E-08
     -0.48424645E-09      0.13400880E-08      0.10000000E+01
POSITION(PEF) =
  -4386.58540889   4652.59588753  -2273.32176709
POSITION(ECEF) =
  -4386.58541019   4652.59589039  -2273.32175873
om_earth =
      0.00000000E+00      0.00000000E+00      0.72921151E-04
VELOCITY(PEF) =
     -4.65719844     -1.73678852      5.43472644
VELOCITY(ECEF) =
     -4.65719844     -1.73678852      5.43472644

[計算結果]
WGS84(BLH):
  POSITION  LAT =  -19.6855 °
            LON =  133.3144 °
         HEIGHT =  410.7864 km
  VELOCITY      =    7.3649 km/s
```

* JST（日本標準時）は「年・月・日・時・分・秒・ミリ秒」を最大17桁（時・分・秒（ミリ秒）は省略可）で指定する。
* JST（日本標準時）を指定しない場合は、システム日時を JST とみなす。

---

当方、このプログラムを応用して 10秒間隔2日分の JSON データを作成するプログラムも作成しています。

* [iss/iss_sgp4_json at master · komasaru/iss](https://github.com/komasaru/iss/tree/master/iss_sgp4_json "iss/iss_sgp4_json at master · komasaru/iss")

さらに、 Python や GMT と連携し、 ISS が特定の地点に近付いたら自動でツイートするようにもしております。

以上。

