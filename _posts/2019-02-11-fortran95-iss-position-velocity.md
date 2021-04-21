---
layout   : single
title    : "Fortran - ISS 位置・速度（TEME 座標）の算出！"
published: true
date     : 2019-02-11 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Fortran
---

Fortran 95 で、 NASA 提供の最新の TLE（2行軌道要素形式）から任意の時刻（UT1; 世界時1）の ISS の位置・速度（TEME 座標）を、 SGP4 アルゴリズムを用いて計算してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linuz Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 でのビルド（コンパイル＆リンク）を想定。
* ここでは、各種座標系、 SGP4 アルゴリズム（Simplified General Perturbations Satellite Orbit Model 4; NASA, NORAD が使用している、近地球域の衛星の軌道計算用で、周回周期225分未満の衛星に使用すべきアルゴリズム）等についての詳細は説明しない。

### 1.  TEME 座標について

* TEME 座標とは「真赤道面平均春分点」を基準にした座標のことで、 "True Equator, Mean Equinox" の略。
* 今回算出する座標が TEME 座標なのは、参考にした SGP4 アルゴリズムのソースコードが TEME 座標を算出するようになっていて、それをほぼそのまま参考にしたため。

### 2. ソースコードの作成

以下は、実行部分。

File: `tle2rv.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! TLE から ISS の位置・速度を計算
! : 但し、座標系は TEME(True Equator, Mean Equinox; 真赤道面平均春分点)
!
!   date          name            version
!   2018.11.21    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数 : UT1（世界時1）
!          YYYYMMDD[HHMMSS[MMM]]
!          無指定なら現在(システム日時)を UT1 とみなす。
!          （上記最後の MMM はミリ秒）
!*******************************************************************************
!
program get_iss_pv
  use const,       only : SP, DP, UID, F_TLE, FMT_DT_0, FMT_DT_1, &
                        & t_cst, getgravconst
  use ext,         only : t_time, add_day, date_fmt
  use model,       only : t_sat
  use propagation, only : propagate
  use io
  implicit none
  type(t_time)  :: ut1
  type(t_sat)   :: satrec
  type(t_cst)   :: gravconst
  character(69) :: tle(2)
  real(DP)      :: r(3), v(3)

  ! コマンドライン引数（現在日時(UT1)）取得
  call get_arg(ut1)
  if (ut1%year == 0) stop

  ! TLE 読み込み
  call get_tle(ut1, tle)

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

  ! 結果出力
  print '("[", A, " UT1]")',  date_fmt(ut1)
  print '("TLE:", A)',               tle(1)
  print '("    ", A)',               tle(2)
  print '("TEME POS:[", 3F16.8"]")', r(1:3)
  print '("     VEL:[", 3F16.8"]")', v(1:3)

  stop
contains
  ! コマンドライン引数取得
  ! * YYYYMMDD[HHMMSS[MMM]] 形式
  ! * 17桁超入力された場合は、18桁目以降の部分は切り捨てる
  ! * コマンドライン引数がなければ、システム日時を UT1 とする
  ! * 日時の整合性チェックは行わない
  !
  ! :param(out) type(t_time) ut1
  subroutine get_arg(ut1)
    implicit none
    type(t_time), intent(out) :: ut1
    character(17) :: gc
    integer(SP)   :: dt(8)
    integer(SP)   :: len_gc

    if (iargc() == 0) then
      call date_and_time(values=dt)
      ut1 = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7), dt(8))
    else
      call getarg(1, gc)
      len_gc = len(trim(gc))
      if (len_gc /= 8 .and. len_gc /= 14 .and. len_gc /= 17) then
        print *, "Format: YYYYMMDD[HHMMSS[MMM]"
        return
      end if
      read (gc, FMT_DT_0) ut1
    end if
  end subroutine get_arg

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
end program get_iss_pv
{% endhighlight %}

モジュール等を含めた全てのファイルは GitHub リポジトリとして公開しているので、そちらを参照のこと。

* [iss/tle2rv at master · komasaru/iss](https://github.com/komasaru/iss/tree/master/tle2rv "iss/tle2rv at master · komasaru/iss")

### 3. 準備

* GitHub リポジトリ [iss/tle2rv at master · komasaru/iss](https://github.com/komasaru/iss/tree/master/tle2rv "iss/tle2rv at master · komasaru/iss") から上記以外の全てのファイルを取得しておく。
* `tle_iss_nasa.txt` を最新のものにしておく。（`tle_iss_nasa.txt` の取得は「[Python - TLE（2行軌道要素形式）の取得(NASA)！]({{site.baseurl}}/2018/08/14/python-tle-getting-from-nasa "Python - TLE（2行軌道要素形式）の取得(NASA)！")」を参考に）

### 4. ビルド

Makefile を使用するので、以下のようにすればよい。

``` text
$ make
```

### 5. 実行

以下は、世界時1(UT1) 2019年1月1日（0時0分0.000秒）の ISS の位置・速度（TEME 座標）を計算する例。

``` text
$ ./get_iss_pv 20190101
[2019-01-01 00:00:00.000 UT1]
TLE:1 25544U 98067A   18332.51648093  .00016717  00000-0  10270-3 0  9000
    2 25544  51.6394 279.8120 0005142  90.0655 270.1087 15.54020670 24063
TEME POS:[   3654.00994957   2141.32653133  -5300.47067891]
     VEL:[     -3.31607446      6.88762457      0.49238676]
```

* UT1（世界時1）は「年・月・日・時・分・秒・ミリ秒」を最大17桁（時・分・秒（ミリ秒）は省略可）で指定する。
* UT1（世界時1）を指定しない場合は、システム日時を UT1 とみなす。

---

以上。

