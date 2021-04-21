---
layout   : single
title    : "Fortran - 章動の計算（IAU2000A 理論）！"
published: true
date     : 2019-01-03 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

天体の回転に使用する章動の計算を Fortran 95 で行いました。（使用するのは IAU2000A 理論）

過去には Ruby や Python でも行いましたが。

* [Ruby - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2016/06/22/ruby-calc-nutation-by-iau2000a "Ruby - 章動の計算（IAU2000A 理論）！")
* [Python - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2018/07/14/python-calc-nutation-by-iau2000a "Python - 章動の計算（IAU2000A 理論）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 章動の計算について

当ブログ過去記事を参照のこと。

* [Ruby - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2016/06/22/ruby-calc-nutation-by-iau2000a "Ruby - 章動の計算（IAU2000A 理論）！")
* [Python - 章動の計算（IAU2000A 理論）！]({{site.baseurl}}/2018/07/14/python-calc-nutation-by-iau2000a "Python - 章動の計算（IAU2000A 理論）！")

### 2. ソースコードの作成

* 以下は実行部分。

File: `nutation_model.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! 章動の計算
! : IAU2000A 章動理論(MHB2000, IERS2003)による
!   黄経における章動(Δψ), 黄道傾斜における章動(Δε) の計算
!
! * IAU SOFA(International Astronomical Union, Standards of Fundamental Astronomy)
!   の提供する C ソースコード "nut00a.c" で実装されているアルゴリズムを使用する。
! * 参考サイト
!   - [SOFA Library Issue 2012-03-01 for ANSI C: Complete List](http://www.iausofa.org/2012_0301_C/sofa/)
!   - [USNO Circular 179](http://aa.usno.navy.mil/publications/docs/Circular_179.php)
!   - [IERS Conventions Center](http://62.161.69.131/iers/conv2003/conv2003_c5.html)
!
!   Date          Author          Version
!   2018.10.18    mk-mode.com     1.00 新規作成
!   2018.11.09    mk-mode.com     1.01 時刻の取扱変更(マイクロ秒 => ミリ秒)
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数 : 日時(TT（地球時）)
!        * 書式：YYYYMMDD[HHMMSS[MMM]]
!                (最後の MMM はミリ秒)
!        * 無指定なら現在(システム日時)を地球時とみなす。
!*******************************************************************************
!
program nutation_model
  use const
  use nutation
  use time
  implicit none
  type(t_time) :: tt
  real(DP)     :: jd, jc
  real(DP)     :: dpsi_ls, dpsi_pl, dpsi, dpsi_d, dpsi_s
  real(DP)     :: deps_ls, deps_pl, deps, deps_d, deps_s

  ! コマンドライン引数(TT)取得
  call get_arg(tt)
  if (tt%year == 0) stop

  ! 章動計算
  call gc2jd(tt, jd)
  call jd2jc(jd, jc)
  call calc_lunisolar(jc, dpsi_ls, deps_ls)
  call calc_planetary(jc, dpsi_pl, deps_pl)
  dpsi   = dpsi_ls + dpsi_pl
  deps   = deps_ls + deps_pl
  dpsi_d = dpsi   * R2D
  deps_d = deps   * R2D
  dpsi_s = dpsi_d * D2S
  deps_s = deps_d * D2S

  ! 結果出力
  print '("  [", A, " TT]")',           date_fmt(tt)
  print '("  DeltaPsi = ", E22.14e2, " rad")',  dpsi
  print '("           = ", E22.14e2, " °")', dpsi_d
  print '("           = ", E22.14e2, " ″")', dpsi_s
  print '("  DeltaEps = ", E22.14e2, " rad")',  deps
  print '("           = ", E22.14e2, " °")', deps_d
  print '("           = ", E22.14e2, " ″")', deps_s

  stop
contains
  ! コマンドライン引数取得
  ! * YYYYMMDD[HHMMSS[MMM]] 形式
  ! * 17桁超入力された場合は、21桁目以降の部分は切り捨てる
  ! * コマンドライン引数がなければ、システム日付を TT とする
  ! * 日時の整合性チェックは行わない
  !
  ! :param(inout) type(t_time) tt
  subroutine get_arg(tt)
    implicit none
    type(t_time), intent(inout) :: tt
    character(20) :: gc
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
end program nutation_model
{% endhighlight %}

モジュールを含めた全てのファイルは GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている。また、計算に必要な大量の係数は定数モジュール内に記述している）

* [CalendarF95/nutation_model at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/nutation_model "CalendarF95/nutation_model at master · komasaru/CalendarF95")

### 3. ソースコードのビルド

``` text
$ make
```

* やり直す場合は、 `make clean` してから。

### 4. 実行方法

``` text
$ ./nutation_model [YYYYMMDD[HHMMSS[MMM]]]
```

* TT（地球時）は「年・月・日・時・分・秒・ミリ秒」を17桁で指定する。
* TT（地球時）を指定しない場合は、システム日時を TT とみなす。

以下、実行例。

``` text
$ ./nutation_model 20190103123456123
  [2019-01-03 12:34:56.123 TT]
  DeltaPsi =  -0.71682419642422E-04 rad
           =  -0.41071001107965E-02 °
           =  -0.14785560398867E+02 ″
  DeltaEps =  -0.23095487295987E-04 rad
           =  -0.13232739478581E-02 °
           =  -0.47637862122890E+01 ″
```

---

以上、

