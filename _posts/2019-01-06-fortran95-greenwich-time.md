---
layout   : single
title    : "Fortran - グリニッジ恒星時の計算（IAU2006 理論）！"
published: true
date     : 2019-01-06 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

グリニッジ視恒星時(GAST; Greenwich Apparent Sidereal Time)、グリニッジ平均恒星時(GMST; Greenwich Mean Sidereal Time)、分点均差(EE; Equation of Equinoxes )の計算を Fortran 95 で行いました。（使用するのは IAU2006 理論）

過去には Ruby や Python でも行いましたが。

* [Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")
* [Python - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2018/07/20/python-calc-greenwich-sidereal-time "Python - グリニッジ恒星時の計算（IAU2006 理論）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 章動の計算について

当ブログ過去記事を参照のこと。

* [Ruby - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2016/08/06/ruby-calc-greenwich-sidereal-time "Ruby - グリニッジ恒星時の計算（IAU2006 理論）！")
* [Python - グリニッジ恒星時の計算（IAU2006 理論）！]({{site.baseurl}}/2018/07/20/python-calc-greenwich-sidereal-time "Python - グリニッジ恒星時の計算（IAU2006 理論）！")

### 2. ソースコードの作成

* 以下は実行部分。

File: `greenwich_time.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! グリニジ視恒星時 GAST(= Greenwich Apparent Sidereal Time)等の計算
! : IAU2006 による計算
!
!   * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
!     の提供する C ソースコード "gst06.c" 等で実装されているアルゴリズムを使用する。
!   * 参考サイト
!     - [SOFA Library Issue 2016-05-03 for ANSI C: Complete List]
!       (http://www.iausofa.org/2016_0503_C/CompleteList.html)
!     - [USNO Circular 179]
!       (http://aa.usno.navy.mil/publications/docs/Circular_179.php)
!     - [IERS Conventions Center]
!       (http://62.161.69.131/iers/conv2003/conv2003_c5.html)
!   * うるう秒の判定は UTC でなく TT で行っている
!
!   Date          Author          Version
!   2018.10.18    mk-mode.com     1.00 新規作成
!   2018.11.09    mk-mode.com     1.01 時刻の取扱変更(マイクロ秒 => ミリ秒)
!   2018.11.11    mk-mode.com     1.02 ΔT計算に DUT1 を加味
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数 : 日時(TT（地球時）)
!        * 書式：YYYYMMDD[HHMMSS[MMM]]
!        * 無指定なら現在(システム日時)を地球時とみなす。
!*******************************************************************************
!
program greenwich_time
  use const
  use delta_t
  use time
  use precession
  use nutation
  use rotation_fw
  use cip_cio
  use greenwich
  implicit none
  type(t_time) :: tt, ut1
  integer(SP)  :: utc_tai, i
  real(DP)     :: jd, jc, dut1, dt, jd_ut1
  real(DP)     :: gam_b, phi_b, psi_b, eps_a, fj2
  real(DP)     :: d_psi_ls, d_eps_ls, d_psi_pl, d_eps_pl, d_psi, d_eps
  real(DP)     :: mtx(3, 3), xy(2), s
  real(DP)     :: era, eo, gast, gast_deg, gmst, gmst_deg, ee, ee_deg

  ! コマンドライン引数(TT)取得
  call get_arg(tt)
  if (tt%year == 0) stop

  ! === Time calculation
  call gc2jd(tt, jd)
  call jd2jc(jd, jc)
  call utc2utc_tai(tt, utc_tai)
  call utc2dut1(tt, dut1)
  call utc2dt(tt, utc_tai, dut1, dt)
  call tt2ut1(tt, dt, ut1)
  call gc2jd(ut1, jd_ut1)
  ! === Fukushima-Williams angles for frame bias and precession.
  !     Ref: iauPfw06(date1, date2, &gamb, &phib, &psib, &epsa)
  call pfw_06(jc, gam_b, phi_b, psi_b)
  call obl_06(jc, eps_a)
  ! === Nutation components.
  !     Ref: iauNut06a(date1, date2, &dp, &de)
  ! * Factor correcting for secular variation of J2.
  fj2 = -2.7774e-6_DP * jc
  ! Calculation
  call calc_lunisolar(jc, d_psi_ls, d_eps_ls)
  call calc_planetary(jc, d_psi_pl, d_eps_pl)
  d_psi = d_psi_ls + d_psi_pl
  d_eps = d_eps_ls + d_eps_pl
  ! * Apply P03 adjustments (Wallace & Capitaine, 2006, Eqs.5).
  d_psi = d_psi + d_psi * (0.4697e-6_DP + fj2)
  d_eps = d_eps + d_eps * fj2
  ! === Equinox based nutation x precession x bias matrix.
  !     Ref: iauFw2m(gamb, phib, psib + dp, epsa + de, rnpb)
  call fw2m(gam_b, phi_b, psi_b + d_psi, eps_a + d_eps, mtx)
  ! === Extract CIP coordinates.
  !       Ref: iauBpn2xy(rnpb, &x, &y)
  call bpn2xy(mtx, xy)
  ! === The CIO locator, s.
  !       Ref: iauS06(tta, ttb, x, y)
  call s_06(jc, xy, s)
  !# Greenwich time
  ! === Greenwich apparent sidereal time.
  !     Ref: iauEra00(uta, utb), iauEors(rnpb, s)
  call gw_era(jd_ut1, era)
  call gw_eors(mtx, s, eo)
  call gw_gast(era, eo, gast)
  gast_deg = gast / PI_180
  ! === Greenwich mean sidereal time, IAU 2006.
  !       Ref: iauGmst06(uta, utb, tta, ttb)
  call gw_gmst(era, jc, gmst)
  gmst_deg = gmst / PI_180
  ! === Equation of Equinoxes
  call gw_ee(gast, gmst, ee)
  ee_deg = ee / PI_180

  ! 結果出力
  print '("     TT = ", A)',            date_fmt(tt)
  print '("    UT1 = ", A)',           date_fmt(ut1)
  print '(" JD(TT) = ", F18.10, " (days)")',      jd
  print '("JD(UT1) = ", F18.10, " (days)")',  jd_ut1
  print '("     JC = ", F18.16, " (centuries)")', jc
  print '("     DT = ", F6.3,   " (seconds)")',   dt
  print '(" GAMMA_ = ", F21.18)',              gam_b
  print '("   PHI_ = ", F21.18)',              phi_b
  print '("   PSI_ = ", F21.18)',              psi_b
  print '("  EPS_A = ", F21.18)',              eps_a
  print '("  D_PSI = ", F21.18)',              d_psi
  print '("  D_EPS = ", F21.18)',              d_eps
  print '("  r_mtx = ")'
  do i = 1, 3
    print '(2X3(XF21.18))', mtx(i, :)
  end do
  print '("   x, y = ", (F21.18, X, F21.18))',     xy
  print '("      s = ", F21.18)',                  s
  print '("    ERA = ", F23.18, " (rad)")',      era
  print '("     EO = ", F23.18, " (rad)")',       eo
  print '("   GAST = ", F23.18, " (rad)")',     gast
  print '("        = ", F23.18, " (°)")' , gast_deg
  print '("        = ", A)' ,      deg2hms(gast_deg)
  print '("   GMST = ", F23.18, " (rad)")',     gmst
  print '("        = ", F23.18, " (°)")',  gmst_deg
  print '("        = ", A)' ,      deg2hms(gmst_deg)
  print '("     EE = ", F23.18, " (rad)")',       ee
  print '("        = ", F23.18, " (°)")',    ee_deg
  print '("        = ", A)' ,        deg2hms(ee_deg)

  stop
contains
  ! コマンドライン引数取得
  ! * YYYYMMDD[HHMMSS[MMM]] 形式
  ! * 17桁超入力された場合は、18桁目以降の部分は切り捨てる
  ! * コマンドライン引数がなければ、システム日付を TT とする
  ! * 日時の整合性チェックは行わない
  !
  ! :param(inout) type(t_time) tt
  subroutine get_arg(tt)
    implicit none
    type(t_time), intent(inout) :: tt
    character(17) :: gc
    integer(SP)   :: dt(8), len_gc

    if (iargc() == 0) then
      call date_and_time(values=dt)
      tt = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7), dt(8))
    else
      call getarg(1, gc)
      len_gc = len(trim(gc))
      if (len_gc /= 8 .and. len_gc /= 14 .and. len_gc /= 17) then
        print *, "Format: YYYYMMDD[HHMMSS[MMM]]"
        return
      end if
      read (gc, FMT_DT_0) tt
    end if
  end subroutine get_arg
end program greenwich_time
{% endhighlight %}

モジュールや定数ファイルを含めた全てのファイルは GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている）

* [CalendarF95/greenwich_time at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/greenwich_time "CalendarF95/greenwich_time at master · komasaru/CalendarF95")

### 3. ソースコードのビルド

``` text
$ make
```

* やり直す場合は、 `make clean` してから。

### 4. 準備

* うるう年ファイル `LEAP_SEC.txt`, DUT1 ファイル `DUT1.txt` は適宜最新のものに更新すること。

### 5. 実行方法

``` text
$ ./greenwich_time [YYYYMMDD[HHMMSS[MMM]]]
```

* TT（地球時）は「年・月・日・時・分・秒・ミリ秒」を最大17桁で指定する。
* TT（地球時）を指定しない場合は、システム日時を TT とみなす。

以下、実行例。

``` text
$ ./greenwich_time 20190106123456123
     TT = 2019-01-06 12:34:56.123
    UT1 = 2019-01-06 12:33:45.042
 JD(TT) = 2458490.0242606830 (days)
JD(UT1) = 2458490.0234379862 (days)
     JC = 0.1901444013876245 (centuries)
     DT = 71.081 (seconds)
 GAMMA_ =  0.000009561193753159
   PHI_ =  0.409049490088273016
   PSI_ =  0.004644774992010763
  EPS_A =  0.409049424343738532
  D_PSI = -0.000070858824994223
  D_EPS = -0.000022910476246079
  r_mtx =
    0.999989579742006973 -0.004186989111982383 -0.001819211252307724
    0.004187030893655816  0.999991234164195109  0.000019158957116627
    0.001819115087055748 -0.000026775851190874  0.999998345050307602
   x, y =  0.001819115087055748 -0.000026775851190874
      s =  0.000000014817885464
    ERA =    5.131245921135885624 (rad)
     EO =   -0.004187010883491056 (rad)
   GAST =    5.135432932019377006 (rad)
        =  294.238632977204076724 (°)
        =  19 h 36 m 57.271914 s
   GMST =    5.135497933767932288 (rad)
        =  294.242357303057303852 (°)
        =  19 h 36 m 58.165752 s
     EE =   -0.000065001748555282 (rad)
        =   -0.003724325853188271 (°)
        = - 0 h 00 m 00.893838 s
```

---

以上、

