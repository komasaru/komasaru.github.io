---
layout   : single
title    : "Fortran - 各種時刻系の換算！"
published: true
date     : 2018-12-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

暦計算や天文計算を行う際に必要な各種時刻系換算を Fortran 95 で行いました。

過去には Ruby や Python でも行いましたが。

* [Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series "Ruby - 各種時刻系の換算！")
* [Python - 各種時刻系の変換！]({{site.baseurl}}/2018/07/23/python-calc-time-series "Python - 各種時刻系の変換！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 各種時刻系について

当ブログ過去記事を参照のこと。

* [Ruby - 各種時刻系の換算！]({{site.baseurl}}/2016/04/02/ruby-calc-time-series "Ruby - 各種時刻系の換算！")
* [Python - 各種時刻系の変換！]({{site.baseurl}}/2018/07/23/python-calc-time-series "Python - 各種時刻系の変換！")

また、過去に Ruby や Python で作成したスクリプトでは、ΔTの計算に DUT1 の値を加味していなかった（最大で1秒弱の誤差があった）が、今回は加味するようにした。

### 2. ソースコードの作成

* 以下は実行部分。

File: `conv_time.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! 各種時刻換算
!
!   date          name            version
!   2018.10.14    mk-mode.com     1.00 新規作成
!   2018.11.09    mk-mode.com     1.01 時刻の取扱変更(マイクロ秒 => ミリ秒)
!   2018.11.11    mk-mode.com     1.02 ΔT計算に DUT1 を加味
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数 : JST（日本標準時）
!          YYYYMMDD[HHMMSS[MMM]]
!          無指定なら現在(システム日時)と判断。（上記最後の MMM はミリ秒）
! ---
! * 定数 DUT1 (= UT1 - UTC) の値は以下を参照。
!     [日本標準時プロジェクト Announcement of DUT1]
!     (http://jjy.nict.go.jp/QandA/data/dut1.html)
!   但し、値は 1.0 秒以下なので、精度を問わないなら 0.0 固定でもよい(?)
! * UTC - TAI（協定世界時と国際原子時の差）は、以下のとおりとする。
!   - 1972年07月01日より古い場合は一律で 10
!   - 2019年07月01日以降は一律で 37
!   - その他は、指定の値
!     [日本標準時プロジェクト　Information of Leap second]
!     (http://jjy.nict.go.jp/QandA/data/leapsec.html)
! * ΔT = TT - UT1 は、以下のとおりとする。
!   - 1972-01-01 以降、うるう秒挿入済みの年+2までは、以下で算出
!       ΔT = 32.184 - (UTC - TAI) - DUT1
!     UTC - TAI は
!     [うるう秒実施日一覧](http://jjy.nict.go.jp/QandA/data/leapsec.html)
!     を参照
!   - その他の期間は NASA 提供の略算式により算出
!     [NASA - Polynomial Expressions for Delta T]
!     (http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)
! * 構造型 type(t_time) は time モジュール内で定義
!*******************************************************************************
!
program conv_time
  use const, only : SP, DP, JST_UTC, FMT_DT_0
  use time
  use delta_t
  implicit none
  type(t_time) :: jst, utc, tai, ut1, tt, tcg, tcb, tdb
  integer(SP)  :: utc_tai
  real(DP)     :: jd, jd_tcb, t, dut1, dt

  ! コマンドライン引数（現在日時(JST)）, UTC 取得
  call get_arg(jst, utc)
  if (jst%year == 0) stop

  ! 各種時刻換算
  call gc2jd(utc, jd)                  ! UTC -> JD
  call jd2jc(jd, t)                    ! JD  -> JC
  call utc2utc_tai(utc, utc_tai)       ! UTC -> UTC - TAI
  call utc2dut1(utc, dut1)             ! UTC -> DUT1
  call utc2dt(utc, utc_tai, dut1, dt)  ! UTC -> delta T
  call utc2tai(utc, utc_tai, tai)      ! UTC -> TAI
  call utc2ut1(utc, dut1, ut1)         ! UTC -> UT1
  call tai2tt(tai, tt)                 ! TAI -> TT
  call tt2tcg(tt, jd, tcg)             ! TT  -> TCG
  call tt2tcb(tt, jd, tcb)             ! TT  -> TCB
  call gc2jd(tcb, jd_tcb)              ! TCB -> JD(TCB)
  call tcb2tdb(tcb, jd_tcb, tdb)       ! TCB -> TDB

  ! 結果出力
  print '("      JST: ", A)',                date_fmt(jst)
  print '("      UTC: ", A)',                date_fmt(utc)
  print '("JST - UTC: ", I7, 12X,   "(hours)")',   JST_UTC
  print '("       JD: ", F18.10, X, "(days)")',         jd
  print '("        T: ", F18.10, X, "(centuries)")',     t
  print '("UTC - TAI: ", I7, 12X,   "(seconds)")', utc_tai
  print '("     DUT1: ", F9.1, 10X, "(seconds)")',    dut1
  print '("  delta T: ", F11.3, 8X, "(seconds)")',      dt
  print '("      TAI: ", A)',                date_fmt(tai)
  print '("      UT1: ", A)',                date_fmt(ut1)
  print '("       TT: ", A)',                date_fmt(tt )
  print '("      TCG: ", A)',                date_fmt(tcg)
  print '("      TCB: ", A)',                date_fmt(tcb)
  print '("   JD_TCB: ", F18.10, X, "(days)")',     jd_tcb
  print '("      TDB: ", A)',                date_fmt(tdb)

  stop
contains
  ! コマンドライン引数取得
  ! * YYYYMMDD[HHMMSS[MMM]] 形式
  ! * 17桁超入力された場合は、18桁目以降の部分は切り捨てる
  ! * コマンドライン引数がなければ、システム日付を JST とする
  ! * 日時の整合性チェックは行わない
  !
  ! :param(out) type(t_time) jst
  ! :param(out) type(t_time) utc
  subroutine get_arg(jst, utc)
    implicit none
    type(t_time), intent(out) :: jst, utc
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
    if (jst%year /= 0) call jst2utc(jst, utc)
  end subroutine get_arg
end program conv_time
{% endhighlight %}

モジュールや定数ファイルを含めた全てのファイル（バイナリファイルを除く）は GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている）

* [CalendarF95/conv_time at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/conv_time "CalendarF95/conv_time at master · komasaru/CalendarF95")

### 3. ソースコードのビルド

``` text
$ make
```

* やり直す場合は、 `make clean` してから。

### 4. 準備

* JPL 天文暦バイナリデータ `JPLEPH` を実行ファイルと同じディレクトリ内に配置。  
  （参照「[JPL 天文暦データのバイナリ化！](https://www.mk-mode.com/octopress/2016/04/18/merging-jpl-data/ "JPL 天文暦データのバイナリ化！")」）
* うるう年ファイル `LEAP_SEC.txt`, DUT1 ファイル `DUT1.txt` は適宜最新のものに更新すること。

### 5. 実行方法

``` text
$ ./conv_time [YYYYMMDDHHMMSSMMM]
```

* JST（日本標準時）は「年・月・日・時・分・秒・ミリ秒」を17桁で指定する。
* JST（日本標準時）を指定しない場合は、システム日時を JST とみなす。

以下、実行例。

``` text
$ ./conv_time 20181226123456123
      JST: 2018-12-26 12:34:56.123
      UTC: 2018-12-26 03:34:56.123
JST - UTC:       9            (hours)
       JD: 2458478.6492606830 (days)
        T:       0.1898329709 (centuries)
UTC - TAI:     -37            (seconds)
     DUT1:       0.0          (seconds)
  delta T:      69.184        (seconds)
      TAI: 2018-12-26 03:35:33.123
      UT1: 2018-12-26 03:34:56.123
       TT: 2018-12-26 03:36:05.307
      TCG: 2018-12-26 03:36:06.230
      TCB: 2018-12-26 03:36:25.849
   JD_TCB: 2458478.6502991784 (days)
      TDB: 2018-12-26 03:36:05.307
```

---

以上、

