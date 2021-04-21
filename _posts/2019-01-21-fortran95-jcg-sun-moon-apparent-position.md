---
layout   : single
title    : "Fortran - 太陽・月の視位置計算（海保略算式版）！"
published: true
date     : 2019-01-21 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

Fortran 95 で、海上保安庁・海洋情報部の「[コンピュータによる天体の位置計算式](http://www1.kaiho.mlit.go.jp/KOHO/ "天文・暦情報")」を利用して、太陽や月の視位置等を計算してみました。

過去に Ruby や Python で行ったことはありましたが。

* [Ruby - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！]({{site.baseurl}}/2016/05/04/ruby-calc-ephemeris-by-kaiho "Ruby - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！")
* [Ruby - 太陽・月の視黄経・視黄緯の計算（海保略算式版）！]({{site.baseurl}}/2016/05/12/ruby-calc-ecliptic-ephemeris-by-kaiho "Ruby - 太陽・月の視黄経・視黄緯の計算（海保略算式版）！")
* [Python - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！]({{site.baseurl}}/2018/07/02/python-calc-ephemeris-by-kaiho "Python - 太陽・月の視赤経・視赤緯等の計算（海保略算式版）！")
* [Python - 太陽・月の視黄経・視黄緯等の計算（海保略算式版）！]({{site.baseurl}}/2018/07/05/python-calc-ecliptic-ephemeris-by-kaiho "Python - 太陽・月の視黄経・視黄緯等の計算（海保略算式版）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 海保略算式について

* 「[コンピュータによる天体の位置計算式](http://www1.kaiho.mlit.go.jp/KOHO/ "天文・暦情報")」内の PDF ドキュメントや、（当記事冒頭に記載の）当ブログ過去記事を参照のこと。
* 当然ながら、用意されている係数データファイルの年しか値を計算できない。

### 2. ソースコードの作成

* 1ファイルで全てをまかなえるようにしている。（モジュール化はしていない）

File: `apparent_sun_moon_jcg.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! 海上保安庁の天測暦より太陽・月の視位置を計算
! * 視黄経・視黄緯の計算を追加したもの
!
!   Date          Author          Version
!   2018.11.07    mk-mode.com     1.00 新規作成
!   2018.11.10    mk-mode.com     1.01 テキストファイル OPEN/READ 時のエラー処理
!                                      を変更
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数: UST（協定世界時）
!       * 書式：YYYYMMDDHHMMSS (年・月・日・時・分・秒)
!       * 無指定なら現在(システム日時)を UTC とみなす
!       * 対応範囲は計算用係数データの用意されている年のみ（2008年〜）
! ---
! * 係数ファイルは、扱いやすくするために1つのファイルにまとめた上、整形している
!   （1行は、年, a, b, 係数）
!*******************************************************************************
!
program jcg_ephemeris
  implicit none

  ! SP: 単精度(4), DP: 倍精度(8)
  integer,      parameter :: SP = kind(1.0)
  integer(SP),  parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  real(DP),     parameter :: PI         = atan(1.0_DP) * 4.0_DP  ! 円周率
  real(DP),     parameter :: PI_180     = PI / 180.0_DP          ! PI / 180
  character(*), parameter :: F_DELTA_T  = "DELTA_T.txt"          ! ΔT一覧ファイル
  character(*), parameter :: F_SUN_RA   = "SUN_RA.txt"           ! 係数ファイル
  character(*), parameter :: F_SUN_DEC  = "SUN_DEC.txt"          ! 係数ファイル
  character(*), parameter :: F_SUN_DIST = "SUN_DIST.txt"         ! 係数ファイル
  character(*), parameter :: F_MOON_RA  = "MOON_RA.txt"          ! 係数ファイル
  character(*), parameter :: F_MOON_DEC = "MOON_DEC.txt"         ! 係数ファイル
  character(*), parameter :: F_MOON_HP  = "MOON_HP.txt"          ! 係数ファイル
  character(*), parameter :: F_R        = "R.txt"                ! 係数ファイル
  character(*), parameter :: F_EPS      = "EPS.txt"              ! 係数ファイル
  integer(SP),  parameter :: UID_DT     = 10                     ! ΔT一覧ファイル読み込み用
  integer(SP),  parameter :: UID_C      = 11                     ! 係数ファイル読み込み用
  ! 構造型
  type :: t_time   ! 日時
    integer(SP) :: year   = 0
    integer(SP) :: month  = 0
    integer(SP) :: day    = 0
    integer(SP) :: hour   = 0
    integer(SP) :: minute = 0
    integer(SP) :: second = 0
  end type t_time
  type :: t_dt     ! ΔT
    integer(SP) :: year = 0
    integer(SP) :: dt   = 0
  end type t_dt
  type :: t_sun    ! 係数（太陽）
    integer(SP) :: year  = 0
    integer(SP) :: a     = 0
    integer(SP) :: b     = 0
    real(DP)    :: c(18) = 0.0_DP
  end type t_sun
  type :: t_moon   ! 係数（月）
    integer(SP) :: year  = 0
    integer(SP) :: a     = 0
    integer(SP) :: b     = 0
    real(DP)    :: c(30) = 0.0_DP
  end type t_moon
  type :: t_r      ! 係数（R, ε）
    integer(SP) :: year  = 0
    integer(SP) :: a     = 0
    integer(SP) :: b     = 0
    real(DP)    :: c(8)  = 0.0_DP
  end type t_r
  type(t_dt), allocatable :: dts(:)                 ! ΔT一覧
  type(t_dt)   :: tmp(20)                           ! ΔT一覧は最大20年分対応
  integer(SP)  :: len_d                             ! ΔT件数
  type(t_time) :: utc                               ! UTC（協定世界時）
  logical      :: stat                              ! コマンドライン引数取得ステータス
  integer(SP)  :: t, dt                             ! 通日 T, ΔT
  real(DP)     :: f                                 ! 世界時 UT(時・分・秒) の端数
  real(DP)     :: tm, tm_r                          ! 計算用時刻引数(tm_r は R 用)
  type(t_sun)  :: c_sun_ra, c_sun_dec, c_sun_dist   ! 該当区間係数配列
  type(t_moon) :: c_moon_ra, c_moon_dec, c_moon_hp  ! 該当区間係数配列
  type(t_r)    :: c_r, c_eps                        ! 該当区間係数配列
  real(DP)     :: sun_ra, sun_dec, sun_dist         ! 計算結果
  real(DP)     :: moon_ra, moon_dec, moon_hp        ! 計算結果
  real(DP)     :: r, eps                            ! 計算結果
  real(DP)     :: sun_h, moon_h, sun_sd, moon_sd    ! 計算結果
  real(DP)     :: sun_lmd, sun_bet                  ! 計算結果
  real(DP)     :: moon_lmd, moon_bet                ! 計算結果
  real(DP)     :: lmd_s_m                           ! 計算結果

  ! コマンドライン引数(UTC)取得
  call get_arg(utc, stat)
  if (.not. stat) stop

  ! ΔT一覧取得
  ! (+ΔT一覧配列用メモリ確保)
  call get_dt_list(tmp, len_d)
  allocate(dts(len_d))
  dts(1:len_d) = tmp(1:len_d)

  ! 計算対象年がΔT一覧に含まれなければ終了
  if (utc%year < dts(1)%year .or. utc%year > dts(len_d)%year) then
    print '("* Year must be between ", I0, " and ", I0, "!")', &
      & dts(1)%year, dts(len_d)%year
    stop
  end if

  ! 事前計算
  call calc_t(utc, t)               ! 通日 T
  call calc_f(utc, f)               ! 世界時 UT(時・分・秒) の端数
  call get_dt(dts, utc%year, dt)    ! ΔT
  call calc_tm(t, f, dt, tm, tm_r)  ! 計算用時刻引数

  ! 対象区間の係数データ取得
  call get_coeff_sun( F_SUN_RA,   utc%year, tm,   c_sun_ra  )
  call get_coeff_sun( F_SUN_DEC,  utc%year, tm,   c_sun_dec )
  call get_coeff_sun( F_SUN_DIST, utc%year, tm,   c_sun_dist)
  call get_coeff_moon(F_MOON_RA,  utc%year, tm,   c_moon_ra )
  call get_coeff_moon(F_MOON_DEC, utc%year, tm,   c_moon_dec)
  call get_coeff_moon(F_MOON_HP,  utc%year, tm,   c_moon_hp )
  call get_coeff_r(   F_R,        utc%year, tm_r, c_r       )
  call get_coeff_r(   F_EPS,      utc%year, tm,   c_eps     )

  ! 各種計算
  call calc_sun(tm, c_sun_ra,   sun_ra, .true.)
  call calc_sun(tm, c_sun_dec,  sun_dec)
  call calc_sun(tm, c_sun_dist, sun_dist)
  call calc_moon(tm, c_moon_ra,  moon_ra, .true.)
  call calc_moon(tm, c_moon_dec, moon_dec)
  call calc_moon(tm, c_moon_hp,  moon_hp)
  call calc_r(tm_r, c_r,   r,  .true.)
  call calc_r(tm,   c_eps, eps)
  call calc_h(f, sun_ra,  r, sun_h )
  call calc_h(f, moon_ra, r, moon_h)
  call calc_sd_sun(sun_dist, sun_sd)
  call calc_sd_moon(moon_hp, moon_sd)
  call calc_lmd(sun_ra,  sun_dec,  eps, sun_lmd)
  call calc_lmd(moon_ra, moon_dec, eps, moon_lmd)
  call calc_bet(sun_ra,  sun_dec,  eps, sun_bet)
  call calc_bet(moon_ra, moon_dec, eps, moon_bet)
  call calc_lmd_s_m(sun_lmd, moon_lmd, lmd_s_m)

  ! ΔT一覧配列用メモリ解放
  deallocate(dts)

  ! 結果出力
  call display

  stop
contains
  ! コマンドライン引数取得
  ! * YYYYMMDDHHMMSS 形式
  ! * 14桁超入力された場合は、15桁目以降の部分は切り捨てる
  ! * コマンドライン引数がなければ、システム日付を UTC とする
  ! * 日時の整合性チェックは行わない
  !
  ! :param(inout) type(t_date) utc: UTC（協定世界時）
  ! :param(out)   logical     stat: T: 正常, F: 異常
  subroutine get_arg(utc, stat)
    implicit none
    type(t_time), intent(inout) :: utc
    logical,      intent(out)   :: stat
    character(14) :: gc
    integer(SP)   :: dt(8)

    stat = .true.
    if (iargc() == 0) then
      call date_and_time(values=dt)
      utc = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7))
    else
      call getarg(1, gc)
      if (len(trim(gc)) /= 14) then
        print *, "*** Format must be 'YYYYMMDDHHMMSS'"
        stat = .false.
        return
      end if
      read (gc, '(I4(5I2))') utc
    end if
  end subroutine get_arg

  ! ΔT（UT1（世界時1） - TT（地球時））一覧の取得
  !
  ! :param(out) type(t_dt) dts(50): ΔT一覧
  ! :param(out) integer(4)   len_h: データ件数
  subroutine get_dt_list(dts, len_d)
    implicit none
    type(t_dt),  intent(out) :: dts(20)
    integer(SP), intent(out) :: len_d
    integer(SP)   :: ios, i, year, dt

    ! ΔT一覧 TXT ファイル OPEN
    open (unit   = UID_DT,      &
        & iostat = ios,         &
        & file   = F_DELTA_T,   &
        & action = "read",      &
        & form   = "formatted", &
        & status = "old")
    if (ios /= 0) then
      print '("[ERROR:", I0 ,"] Failed to open file: ", A)', ios, F_DELTA_T
      stop
    end if

    ! ΔT一覧 TXT ファイル READ
    i = 0
    do
      read (UID_DT, fmt=*, iostat = ios) year, dt
      if (ios < 0) then
        exit
      else if (ios > 0) then
        print '("[ERROR:", I0 ,"] Failed to read file: ", A)', ios, F_DELTA_T
      end if
      i = i + 1
      dts(i) = t_dt(year, dt)
    end do
    len_d = i

    ! ΔT一覧 TXT ファイル CLOSE
    close(UID_DT)
  end subroutine get_dt_list

  ! 対象年の ΔT（UT1（世界時1） - TT（地球時））取得
  !
  ! :param(in)  type(t_dt)  dts: ΔT一覧
  ! :param(in)  integer(4) year: 対象の西暦年
  ! :param(out) integer(4)   dt: 対象のΔT
  subroutine get_dt(dts, year, dt)
    implicit none
    type(t_dt),  intent(in)  :: dts(:)
    integer(SP), intent(in)  :: year
    integer(SP), intent(out) :: dt
    integer(SP) :: i

    dt = 0
    do i = 1, size(dts)
      if (dts(i)%year == year) then
        dt = dts(i)%dt
        exit
      end if
    end do
  end subroutine get_dt

  ! 通日 T の計算
  ! * 通日 T は2月0日を第0日とした通算日数で、次式により求める。
  !     T = 30 * P + Q * (S - Y) + P * (1 - Q) + 日
  !   但し、
  !     P = 月 - 1, Q = [(月 + 7) / 10]
  !     Y = [(年 / 4) - [(年 / 4)] + 0.77]
  !     S = [P * 0.55 - 0.33]
  !   で、[] は整数部のみを抜き出すことを意味する。
  !
  ! :param(in)  type(t_time) utc: UTC
  ! :param(out) integer(4)     t: 通日 T
  subroutine calc_t(utc, t)
    implicit none
    type(t_time), intent(in)  :: utc
    integer(SP),  intent(out) :: t
    integer(SP) :: p, q, y, s

    p = utc%month - 1
    q = int((utc%month + 7) / 10)
    y = int(utc%year / 4.0_DP - int(utc%year / 4.0_DP) + 0.77_DP)
    s = int(p * 0.55_DP - 0.33_DP)
    t = 30 * p + q * (s - y) + p * (1 - q) + utc%day
  end subroutine calc_t

  ! 世界時（時・分・秒）の端数計算
  ! * 次式により求める。
  !     F = 時 / 24 + 分 / 1440 + 秒 / 86400
  !
  ! :param(in)  type(t_time) utc: UTC
  ! :param(out) integer(4)     f: 世界時の端数
  subroutine calc_f(utc, f)
    implicit none
    type(t_time), intent(in)  :: utc
    real(DP),     intent(out) :: f

    f = utc%hour   /    24.0_DP &
    & + utc%minute /  1440.0_DP &
    & + utc%second / 86400.0_DP
  end subroutine calc_f

  ! 計算用時刻引数 tm の計算
  ! * 次式により求める。
  !   (R 計算用は tm_r, その他は tm)
  !     tm   = T + F + ΔT / 86400
  !     tm_r = T + F
  !
  ! :param(in)  integer(4)  t: 通日 T
  ! :param(in)  real(8)     f: 世界時の端数
  ! :param(in)  integer(4) dt: ΔT
  ! :param(out) real(4)    tm: 時刻引数
  ! :param(out) real(4)    tm: 時刻引数(R 用)
  subroutine calc_tm(t, f, dt, tm, tm_r)
    implicit none
    integer(SP), intent(in)  :: t, dt
    real(DP),    intent(in)  :: f
    real(DP),    intent(out) :: tm, tm_r

    tm_r = t + f
    tm   = tm_r + dt / 86400.0_DP
  end subroutine calc_tm

  ! 対象年の係数データ取得
  ! * SUN(R.A., Dec., Dist.) 用
  !
  ! :param(in)  character(*) f_name: 係数ファイルの名称
  ! :param(in)  integer(4)     year: 対象の西暦年
  ! :param(in)  real(8)          tm: 時刻引数
  ! :param(out) type(t_sun)    item: 係数一覧
  subroutine get_coeff_sun(f_name, year, tm, item)
    implicit none
    character(*), intent(in)  :: f_name
    integer(SP),  intent(in)  :: year
    real(DP),     intent(in)  :: tm
    type(t_sun),  intent(out) :: item
    integer(SP) :: ios, y, a, b
    real(DP)    :: c(18)

    ! 係数 TXT ファイル OPEN
    open (unit   = UID_C,        &
        & iostat = ios,          &
        & file   = trim(f_name), &
        & action = "read",       &
        & form   = "formatted",  &
        & status = "old")
    if (ios /= 0) then
      print '("[ERROR:", I0 ,"] Failed to open file: ", A)', ios, f_name
      stop
    end if

    ! 係数 TXT ファイル READ
    do
      read (UID_C, fmt=*, iostat = ios) y, a, b, c
      if (ios < 0) then
        exit
      else if (ios > 0) then
        print '("[ERROR:", I0 ,"] Failed to read file: ", A)', ios, f_name
      end if
      if (y /= year) cycle
      if (int(tm) < a .or. b < int(tm)) cycle
      item = t_sun(y, a, b, c)
      exit
    end do

    ! 係数 TXT ファイル CLOSE
    close(UID_C)
  end subroutine get_coeff_sun

  ! 対象年の係数データ取得
  ! * MOON(R.A., Dec., H.P..) 用
  !
  ! :param(in)  character(*) f_name: 係数ファイルの名称
  ! :param(in)  integer(4)     year: 対象の西暦年
  ! :param(in)  real(8)         tm: 時刻引数
  ! :param(out) type(t_moon)  item: 係数一覧
  subroutine get_coeff_moon(f_name, year, tm, item)
    implicit none
    character(*), intent(in)  :: f_name
    integer(SP),  intent(in)  :: year
    real(DP),     intent(in)  :: tm
    type(t_moon), intent(out) :: item
    integer(SP) :: ios, y, a, b
    real(DP)    :: c(30)

    ! 係数 TXT ファイル OPEN
    open (unit   = UID_C,        &
        & iostat = ios,          &
        & file   = trim(f_name), &
        & action = "read",       &
        & form   = "formatted",  &
        & status = "old")
    if (ios /= 0) then
      print '("[ERROR:", I0 ,"] Failed to open file: ", A)', ios, f_name
      stop
    end if

    ! 係数 TXT ファイル READ
    do
      read (UID_C, fmt=*, iostat = ios) y, a, b, c
      if (ios < 0) then
        exit
      else if (ios > 0) then
        print '("[ERROR:", I0 ,"] Failed to read file: ", A)', ios, f_name
      end if
      if (y /= year) cycle
      if (int(tm) < a .or. b < int(tm)) cycle
      item = t_moon(y, a, b, c)
      exit
    end do

    ! 係数 TXT ファイル CLOSE
    close(UID_C)
  end subroutine get_coeff_moon

  ! 対象年の係数データ取得
  ! * R, EPS 用
  !
  ! :param(in)  character(*) f_name: 係数ファイルの名称
  ! :param(in)  integer(4)     year: 対象の西暦年
  ! :param(in)  real(8)          tm: 時刻引数
  ! :param(out) type(t_r)      item: 係数一覧
  subroutine get_coeff_r(f_name, year, tm, item)
    implicit none
    character(*), intent(in)  :: f_name
    integer(SP),  intent(in)  :: year
    real(DP),     intent(in)  :: tm
    type(t_r),    intent(out) :: item
    integer(SP) :: ios, y, a, b
    real(DP)    :: c(8)

    ! 係数 TXT ファイル OPEN
    open (unit   = UID_C,        &
        & iostat = ios,          &
        & file   = trim(f_name), &
        & action = "read",       &
        & form   = "formatted",  &
        & status = "old")
    if (ios /= 0) then
      print '("[ERROR:", I0 ,"] Failed to open file: ", A)', ios, f_name
      stop
    end if

    ! 係数 TXT ファイル READ
    do
      read (UID_C, fmt=*, iostat = ios) y, a, b, c
      if (ios < 0) then
        exit
      else if (ios > 0) then
        print '("[ERROR:", I0 ,"] Failed to read file: ", A)', ios, f_name
      end if
      if (y /= year) cycle
      if (int(tm) < a .or. b < int(tm)) cycle
      item = t_r(y, a, b, c)
      exit
    end do

    ! 係数 TXT ファイル CLOSE
    close(UID_C)
  end subroutine get_coeff_r

  ! SUN(R.A., Dec., Dist.) の計算
  ! * θ, 係数配列から次式により所要値を計算する。
  !     f(t) = C_0 + C_1 * cos(θ) + C_2 * cos(2θ) + ... + C_N * cos(Nθ)
  !
  ! :param(in)  real(8)       tm: 時刻引数
  ! :param(in)  type(t_sun) coef: 係数
  ! :param(out) real(8)      val: 計算結果
  ! :param(in)  logical, optional is_ra: R.A. => T, その他 => F
  subroutine calc_sun(tm, coef, val, is_ra)
    implicit none
    real(DP),    intent(in)  :: tm
    type(t_sun), intent(in)  :: coef
    logical,     intent(in), optional :: is_ra
    real(DP),    intent(out) :: val
    integer(SP) :: i
    real(DP)    :: th

    val = 0.0
    do i = 1, size(coef%c)
      th = theta(real(coef%a, DP), real(coef%b, DP), tm) * (i - 1) * PI_180
      val = val + coef%c(i) * cos(th)
    end do
    if (.not. present(is_ra)) return
    do while (val >= 24.0_DP)
      val = val - 24.0_DP
    end do
    do while (val <= 0.0_DP)
      val = val + 24.0_DP
    end do
  end subroutine calc_sun

  ! MOON(R.A., Dec., H.P.) の計算
  ! * θ, 係数配列から次式により所要値を計算する。
  !     f(t) = C_0 + C_1 * cos(θ) + C_2 * cos(2θ) + ... + C_N * cos(Nθ)
  !
  ! :param(in)  real(8)        tm: 時刻引数
  ! :param(in)  type(t_moon) coef: 係数
  ! :param(out) real(8)       val: 計算結果
  ! :param(in)  logical, optional is_ra: R.A. => T, その他 => F
  subroutine calc_moon(tm, coef, val, is_ra)
    implicit none
    real(DP),     intent(in)  :: tm
    type(t_moon), intent(in)  :: coef
    logical,      intent(in), optional :: is_ra
    real(DP),     intent(out) :: val
    integer(SP) :: i
    real(DP)    :: th

    val = 0.0
    do i = 1, size(coef%c)
      th = theta(real(coef%a, DP), real(coef%b, DP), tm) * (i - 1) * PI_180
      val = val + coef%c(i) * cos(th)
    end do
    if (.not. present(is_ra)) return
    do while (val >= 24.0_DP)
      val = val - 24.0_DP
    end do
    do while (val <= 0.0_DP)
      val = val + 24.0_DP
    end do
  end subroutine calc_moon

  ! R, EPS の計算
  ! * θ, 係数配列から次式により所要値を計算する。
  !     f(t) = C_0 + C_1 * cos(θ) + C_2 * cos(2θ) + ... + C_N * cos(Nθ)
  !
  ! :param(in)  real(8)     tm: 時刻引数
  ! :param(in)  type(t_r) coef: 係数
  ! :param(out) real(8)    val: 計算結果
  ! :param(in)  logical, optional is_r: R => T, EPS => F
  subroutine calc_r(tm, coef, val, is_r)
    implicit none
    real(DP),  intent(in)  :: tm
    type(t_r), intent(in)  :: coef
    logical,   intent(in), optional :: is_r
    real(DP),  intent(out) :: val
    integer(SP) :: i
    real(DP)    :: th

    val = 0.0
    do i = 1, size(coef%c)
      th = theta(real(coef%a, DP), real(coef%b, DP), tm) * (i - 1) * PI_180
      val = val + coef%c(i) * cos(th)
    end do
    if (.not. present(is_r)) return
    do while (val >= 24.0_DP)
      val = val - 24.0_DP
    end do
    do while (val <= 0.0_DP)
      val = val + 24.0_DP
    end do
  end subroutine calc_r

  ! θ の計算
  ! * θ を次式により計算する。(単位: °)
  !     θ = cos^(-1)((2 * t - (a + b)) / (b - a))
  !   但し、0°<= θ <= 180°
  !
  ! :param(in)  real(8)   t_a: 区間 a
  ! :param(in)  real(8)   t_b: 区間 b
  ! :param(in)  real(8)     t: 時刻引数
  ! :return     real(8) theta: θ
  real(DP) function theta(t_a, t_b, t)
    implicit none
    real(DP), intent(in) :: t_a, t_b, t
    real(DP) :: a, b

    a = t_a
    b = t_b
    ! 年末のΔT秒分も計算可能とするための応急処置
    if (t_b < t) b = t
    theta = (2 * t - (a + b)) / (b - a)
    theta = acos(theta) * 180 / PI
  end function theta

  ! グリニジ時角の計算
  ! * 次式によりグリニジ時角を計算する。
  !     h = E + UT
  !   (但し、E = R - R.A.)
  !
  ! :param(in)  real(8)  f: 世界時 UT(時・分・秒) の端数
  ! :param(in)  real(8) ra: R.A.
  ! :param(in)  real(8)  r: R
  ! :param(out) real(8)  h: グリニジ時角
  subroutine calc_h(f, ra,  r, h)
    implicit none
    real(DP), intent(in)  :: f, ra, r
    real(DP), intent(out) :: h

    h = r - ra + f * 24.0_DP
  end subroutine calc_h

  ! 視半径（太陽）の計算
  ! * 次式により視半径を計算する。
  !     S.D.= 16.02 ′/ Dist.
  !
  ! :param(in)  real(8) dist: SUN(Dist.)
  ! :param(out) real(8)   sd: SUN(S.D.)
  subroutine calc_sd_sun(dist, sd)
    implicit none
    real(DP), intent(in)  :: dist
    real(DP), intent(out) :: sd

    sd = 16.02_DP / dist
  end subroutine calc_sd_sun

  ! 視半径（月）の計算
  ! * 次式により視半径を計算する。
  !     S.D.= sin^(-1) (0.2725 * sin(H.P.))
  !
  ! :param(in)  real(8) hp: MOON(H.P.)
  ! :param(out) real(8) sd: MOON(S.D.)
  subroutine calc_sd_moon(hp, sd)
    implicit none
    real(DP), intent(in)  :: hp
    real(DP), intent(out) :: sd

    sd = asin(0.2725_DP * sin(hp * PI_180)) * 60.0_DP * 180.0_DP / PI
  end subroutine calc_sd_moon

  ! 視黄経の計算
  ! * 次式により視黄経を計算する
  !     λ = arctan(sin δ sin ε + cos δ sin α cos ε / cos δ cos α)
  !   (α : 視赤経、δ : 視赤緯、 ε : 黄道傾斜角)
  !
  ! :param(in)  real(8)  ra: R.A.（視赤経）
  ! :param(in)  real(8) dec: Dec.（視赤緯）
  ! :param(in)  real(8) eps: ε（黄道傾角）
  ! :param(out) real(8) lmd: λ（視黄経）
  subroutine calc_lmd(ra, dec, eps, lmd)
    implicit none
    real(DP), intent(in)  :: ra, dec, eps
    real(DP), intent(out) :: lmd
    real(DP) :: a, d, e, l_a, l_b

    a = ra * 15.0_DP * PI_180
    d = dec * PI_180
    e = eps * PI_180
    l_a = sin(d) * sin(e) + cos(d) * sin(a) * cos(e)
    l_b = cos(d) * cos(a)
    lmd = atan2(l_a, l_b) * 180.0_DP / PI
    if (lmd < 0.0_DP) lmd = lmd + 360.0_DP
  end subroutine calc_lmd

  ! 視黄緯の計算
  ! * 次式により視黄経を計算する
  !     β  = arcsin(sin δ cos ε − cos δ sin α sin ε)
  !   (α : 視赤経、δ : 視赤緯、 ε : 黄道傾斜角)
  !
  ! :param(in)  real(8)  ra: R.A.（視赤経）
  ! :param(in)  real(8) dec: Dec.（視赤緯）
  ! :param(in)  real(8) eps: ε（黄道傾角）
  ! :param(out) real(8) bet: β（視黄緯）
  subroutine calc_bet(ra, dec, eps, bet)
    implicit none
    real(DP), intent(in)  :: ra, dec, eps
    real(DP), intent(out) :: bet
    real(DP) :: a, d, e

    a = ra * 15.0_DP * PI_180
    d = dec * PI_180
    e = eps * PI_180
    bet = sin(d) * cos(e) - cos(d) * sin(a) * sin(e)
    bet = asin(bet) * 180.0_DP / PI
  end subroutine calc_bet

  ! 視黄経差（太陽 - 月）の計算
  ! * SUN_LAMBDA - MOON_LAMBDA
  !
  ! :param(in)  real(8)  sun_lmd: 視黄経（太陽）
  ! :param(in)  real(8) moon_lmd: 視黄経（月）
  ! :param(out) real(8)  lmd_s_m: 視黄経差（太陽 - 月）
  subroutine calc_lmd_s_m(lmd_s, lmd_m, lmd_s_m)
    implicit none
    real(DP), intent(in)  :: lmd_s, lmd_m
    real(DP), intent(out) :: lmd_s_m

    lmd_s_m = lmd_s - lmd_m
  end subroutine calc_lmd_s_m

  ! 結果出力
  ! * param なし
  subroutine display
    implicit none

    print '("[ ", I4, "-", I0.2, "-", I0.2, " ", &
      & I0.2, ":", I0.2, ":", I0.2, " UTC ]")', utc
    print '("SUN    R.A. = ", F12.8, " h  (= ", A, ")")', &
        & sun_ra,   hour2hms(sun_ra)
    print '("SUN    DEC. = ", F12.8, " ° (= ", A, ")")', &
        & sun_dec,  deg2dms(sun_dec)
    print '("SUN   DIST. = ", F12.8, " AU")', sun_dist
    print '("SUN     hG. = ", F12.8, " h  (= ", A, ")")', &
        & sun_h,    hour2hms(sun_h)
    print '("SUN    S.D. = ", F12.8, " ′ (= ", A, ")")', &
        & sun_sd,   deg2dms(sun_sd / 60.0_DP)
    print '("MOON   R.A. = ", F12.8, " h  (= ", A, ")")', &
        & moon_ra,  hour2hms(moon_ra)
    print '("MOON   DEC. = ", F12.8, " ° (= ", A, ")")', &
        & moon_dec, deg2dms(moon_dec)
    print '("MOON   H.P. = ", F12.8, " ° (= ", A, ")")', &
        & moon_hp,  deg2dms(moon_hp)
    print '("MOON    hG. = ", F12.8, " h  (= ", A, ")")', &
        & moon_h,   hour2hms(moon_h)
    print '("MOON   S.D. = ", F12.8, " ′ (= ", A, ")")', &
        & moon_sd,  deg2dms(moon_sd / 60.0_DP)
    print '("         R  = ", F12.8, " h  (= ", A, ")")', &
        & r,        hour2hms(r)
    print '("       EPS. = ", F12.8, " ° (= ", A, ")")', &
        & eps,      deg2dms(eps)
    print '(A)', "---"
    print '("SUN  LAMBDA = ", F12.8, " ° (= ", A, ")")', &
        & sun_lmd,  deg2dms(sun_lmd)
    print '("SUN    BETA = ", F12.8, " ° (= ", A, ")")', &
        & sun_bet,  deg2dms(sun_bet)
    print '("MOON LAMBDA = ", F12.8, " ° (= ", A, ")")', &
        & moon_lmd, deg2dms(moon_lmd)
    print '("MOON   BETA = ", F12.8, " ° (= ", A, ")")', &
        & moon_bet, deg2dms(moon_bet)
    print '("DIFF LAMBDA = ", F12.8, " ° (= ", A, ")")', &
        & lmd_s_m,  deg2dms(lmd_s_m)
  end subroutine display

  ! 99.999h -> 99h99m99s 変換
  !
  ! :param(in) real(8)      hour: 時間
  ! :return    character(19) hms: "999 h 99 m 99.999 s" 形式
  function hour2hms(hour) result(hms)
    implicit none
    real(DP), intent(in) :: hour
    character(19) :: hms
    integer(SP)   :: h, m
    real(DP)      :: h_r, m_r, s

    h   = int(hour)
    h_r = hour - real(h, DP)
    m   = int(h_r * 60.0_DP)
    m_r = h_r * 60.0_DP - real(m, DP)
    s   = m_r * 60.0_DP
    if (m < 0) m = isign(m, 1)
    if (s < 0.0_DP) s = dsign(s, 1.0_DP)
    write (hms, '(I3, " h ", I2, " m ", F6.3, " s")') h, m, s
  end function hour2hms

  ! 99.999° -> 99°99′99″ 変換
  !
  ! :param(in) real(8)       deg: 角度
  ! :return    character(24) dms: "999 ° 99 ′ 99.999 ″" 形式
  function deg2dms(deg) result(dms)
    implicit none
    real(DP), intent(in) :: deg
    character(24) :: dms
    character(1)  :: pm
    integer(SP)   :: d, m
    real(DP)      :: d_0, d_r, m_r, s

    d_0 = deg
    pm = " "
    if (d_0 < 0.0_DP) pm = "-"
    if (d_0 < 0.0_DP) d_0 = dsign(d_0, 1.0_DP)
    d = int(d_0)
    d_r = d_0 - real(d, DP)
    m   = int(d_r * 60.0_DP)
    m_r = d_r * 60.0_DP - real(m, DP)
    s   = m_r * 60.0_DP
    if (m < 0) m = isign(m, 1)
    if (s < 0.0_DP) s = dsign(s, 1.0_DP)
    write (dms, '(A1, I3, " °", I3, " ′", F6.3, " ″")') pm, d, m, s
  end function deg2dms
end program jcg_ephemeris
{% endhighlight %}

定数ファイルや、定数ファイル生成用の Ruby スクリプトとともに GitHub にアップしている。

* [CalendarF95/apparent_sun_moon_jcg at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/apparent_sun_moon_jcg "CalendarF95/apparent_sun_moon_jcg at master · komasaru/CalendarF95")

### 3. ソースコードのビルド

（1ファイルなので Makefile は使用しない）

``` text
$ make -o apparent_sun_moon_jcg apparent_sun_moon_jcg.f95
```

### 4. 準備

まず、ΔT（地球時(TT)と世界時1(UT1)）の値を記述したファイル `DELTA_T.txt` が存在することを確認し、不足していれば、値を追加する。（隔年の値は、各年の解説ファイル(`na99-rei.pdf`)に記載されている）

次に、海保サイトからダウンロードした各年の係数ファイル(`na99-data.tx` という名称のファイル)を `text` ディレクトリに配置し、別途作成の Ruby スクリプトで整形し直す。（このスクリプトは、今回必要な太陽・月・R,黄道傾角(ε)にしか対応していない）

``` text
$ ./gen_coeffs_f95.rb
```

同じディレクトリ内に以下の8個のテキストファイルが生成されるはず。

* `SUN_RA.txt`
* `SUN_DEC.txt`
* `SUN_DIST.txt`
* `MOON_RA.txt`
* `MOON_DEC.txt`
* `MOON_HP.txt`
* `R.txt`
* `EPS.txt`

### 5. 実行方法

``` text
$ ./apparent_sun_moon_jcg [YYYYMMDDHHMMSS]
```

* UTC（協定世界時）は「年・月・日・時・分・秒」を14桁で指定する。
* UTC（協定世界時）を指定しない場合は、システム日時を UTC とみなす。

以下、実行例。

``` text
$ ./apparent_sun_moon_jcg 20190121000000
[ 2019-01-21 00:00:00 UTC ]
SUN    R.A. =  20.18948049 h  (=  20 h 11 m 22.130 s)
SUN    DEC. = -20.01113167 ° (= - 20 °  0 ′40.074 ″)
SUN   DIST. =   0.98398646 AU
SUN     hG. = -12.18482730 h  (= -12 h 11 m  5.378 s)
SUN    S.D. =  16.28071178 ′ (=    0 ° 16 ′16.843 ″)
MOON   R.A. =   7.97458715 h  (=   7 h 58 m 28.514 s)
MOON   DEC. =  20.71934023 ° (=   20 ° 43 ′ 9.625 ″)
MOON   H.P. =   1.02075727 ° (=    1 °  1 ′14.726 ″)
MOON    hG. =   0.03006605 h  (=   0 h  1 m 48.238 s)
MOON   S.D. =  16.68856406 ′ (=    0 ° 16 ′41.314 ″)
         R  =   8.00465319 h  (=   8 h  0 m 16.752 s)
       EPS. =  23.43561057 ° (=   23 ° 26 ′ 8.198 ″)
---
SUN  LAMBDA = 300.63618339 ° (=  300 ° 38 ′10.260 ″)
SUN    BETA =   0.00013479 ° (=    0 °  0 ′ 0.485 ″)
MOON LAMBDA = 117.53324938 ° (=  117 ° 31 ′59.698 ″)
MOON   BETA =   0.06976027 ° (=    0 °  4 ′11.137 ″)
DIFF LAMBDA = 183.10293401 ° (=  183 °  6 ′10.562 ″)
```

---

以上。

