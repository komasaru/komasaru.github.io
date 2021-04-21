---
layout   : single
title    : "Fortran - バイアス・歳差・章動の適用！"
published: true
date     : 2019-01-15 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

赤道直交座標にバイアス・歳差・章動の回転を適用する処理を Fortran 95 で実装してみました。

過去には Ruby のライブラリを作成たことがありましたが。（Python でも作成したことがあるが、ブログ記事にはしていない）

* [Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/20/ruby-bpn-rotation-by-my-gem "Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 前提知識

当ブログ過去記事を参照のこと。

* [Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！]({{site.baseurl}}/2016/09/20/ruby-bpn-rotation-by-my-gem "Ruby - バイアス・歳差・章動の適用（by 自作 gem ライブラリ）！")

### 2. ソースコードの作成

* 以下は実行部分。（距離の単位は AU（天文単位）固定としている）

File: `bpn_rotation.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! バイアス・歳差・章動適用
!
!   Date          Author          Version
!   2018.10.24    mk-mode.com     1.00 新規作成
!   2018.11.09    mk-mode.com     1.01 時刻の取扱変更(マイクロ秒 => ミリ秒)
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数 : X Y Z [TT]
!        * X, Y, Z は元の座標（各20桁以内）
!        * TT は 地球時（省略可）
!          書式：YYYYMMDD[HHMMSS[MMM]]
!                (最後の MMM はミリ秒)
!          無指定なら現在(システム日時)を TT とみなす。
!*******************************************************************************
!
program bpn_rotation
  use const
  use time
  use eph_bpn
  implicit none
  real(DP)     :: crd(3)
  type(t_time) :: tt     ! 地球時
  real(DP)     :: jd, t  ! TT に対する Julian Day, Julian Century Number
  real(DP)     :: eps, dpsi, deps  ! 平均黄道傾斜角(ε)、章動(Δψ, Δε)
  real(DP)     :: crd_b(3), crd_bp(3), crd_bpn(3)
  real(DP)     :: crd_p(3), crd_pn(3), crd_n(3)

  ! コマンドライン引数取得
  call get_arg(crd, tt)
  if (tt%year == 0) stop

  ! ユリウス世紀数、平均黄道傾斜角(ε)、章動(Δψ, Δε) 計算
  call gc2jd(tt, jd)
  call jd2jc(jd, t)
  call calc_obliquity(t, eps)
  call calc_nutation(t, dpsi, deps)

  ! バイアス・歳差・章動の適用
  call apply_bias(crd, crd_b)
  call apply_prec(crd_b, t, eps, crd_p)
  call apply_nut(crd_p, eps, dpsi, deps, crd_n)
  call apply_bias_prec(crd, t, eps, crd_bp)
  call apply_bias_prec_nut(crd, t, eps, dpsi, deps, crd_bpn)
  call apply_prec_nut(crd_b, t, eps, dpsi, deps, crd_pn)

  ! 結果出力
  print '("TDB: ", A)',           date_fmt(tt)
  print '(" JD: ", F18.10, " (days)")',     jd
  print '(" JC: ", F18.10, " (centuries)")', t
  print '("EPS: ", F21.18)',               eps
  print *
  print '("* 元の GCRS 座標:", /, "  [", 3F20.16, "]")', crd
  print '("  バイアス適用:",   /, "  [", 3F20.16, "]")', crd_b
  print '("  歳差適用:",       /, "  [", 3F20.16, "]")', crd_p
  print '("  章動適用:",       /, "  [", 3F20.16, "]")', crd_n
  print '("* 元の GCRS 座標にバイアス＆歳差同時適用:", /,' // &
      & ' "  [", 3F20.16, "]")', crd_bp
  print '("* 元の GCRS 座標にバイアス＆歳差＆章動同時適用:", /,' // &
      & ' "  [", 3F20.16, "]")', crd_bpn
  print '("* 元の GCRS 座標にバイアス適用後、歳差＆章動同時適用:", /,' // &
      & ' "  [", 3F20.16, "]")', crd_pn

  stop
contains
  ! コマンドライン引数取得
  ! * X, Y, Z は実数形式（必須、各20桁以内）
  ! * TT は YYYYMMDD[HHMMSS[MMM]] 形式（省略可）
  ! * TT が17桁超入力された場合は、18桁目以降の部分は切り捨てる
  ! * TT 無入力なら、システム日付を TT とみなす
  ! * 日時の整合性チェックは行わない
  !
  ! :param(inout) real(8)  crd(3)
  ! :param(inout) type(t_time) tt
  subroutine get_arg(crd, tt)
    implicit none
    real(DP),     intent(inout) :: crd(3)
    type(t_time), intent(inout) :: tt
    character(17) :: gc
    character(20) :: c(3)
    integer(SP)  :: i, dt(8), len_gc

    if (iargc() < 3) then
      crd = (/(0.0_DP, i=1,3)/)
      return
    end if
    do i = 1, 3
      call getarg(i, c(i))
      read (c(i), *) crd(i)
    end do
    if (iargc() == 3) then
      call date_and_time(values=dt)
      tt = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7), dt(8))
    else
      call getarg(4, gc)
      len_gc = len(trim(gc))
      if (len_gc /= 8 .and. len_gc /= 14 .and. len_gc /= 17) then
        print *, "Format: X Y Z YYYYMMDD[HHMMSS[MMM]]"
        return
      end if
      read (gc, FMT_DT_0) tt
    end if
  end subroutine get_arg
end program bpn_rotation
{% endhighlight %}

モジュールを含めた全てのファイルは GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている）

* [CalendarF95/bpn_rotation at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/bpn_rotation "CalendarF95/bpn_rotation at master · komasaru/CalendarF95")

### 3. ソースコードのビルド

``` text
$ make
```

* やり直す場合は、 `make clean` してから。

### 4. 実行方法

``` text
$ ./bpn_rotation X Y Z [YYYYMMDD[HHMMSS[MMM]]]
```

* `X`, `Y`, `Z` は GCRS 座標(x, y, z) を指定する。（省略不可）
* TT（地球時）は「年・月・日・時・分・秒・ミリ秒」を17桁で指定する。
* TT（地球時）を指定しない場合は、システム日時を TT とみなす。

以下、実行例。

``` text
$ ./bpn_rotation -1.0020195 0.066043 0.0286337 20190115123456123
TDB: 2019-01-15 12:34:56.123
 JD: 2458499.0242606830 (days)
 JC:       0.1903908080 (centuries)
EPS:  0.409049368392112922

* 元の GCRS 座標:
  [ -1.0020195000000001  0.0660430000000000  0.0286337000000000]
  バイアス適用:
  [ -1.0020194726238683  0.0660433782103665  0.0286337856750901]
  歳差適用:
  [ -1.0023428214227077  0.0617766288109586  0.0267798707998803]
  章動適用:
  [ -1.0023380061895195  0.0618429393479746  0.0268070364971746]
* 元の GCRS 座標にバイアス＆歳差同時適用:
  [ -1.0023428492451516  0.0617761804979216  0.0267798636131571]
* 元の GCRS 座標にバイアス＆歳差＆章動同時適用:
  [ -1.0023380340415684  0.0618424910366087  0.0268070293208848]
* 元の GCRS 座標にバイアス適用後、歳差＆章動同時適用:
  [ -1.0023380061895195  0.0618429393479746  0.0268070364971746]
```

---

以上、

