---
layout   : single
title    : "Fortran - JPL 天文暦バイナリデータの読み込み！"
published: true
date     : 2019-01-09 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- Fortran
- カレンダー
---

NASA の機関である JPL(Jet Propulsion Laboratory) が惑星探査用に編纂・発行している月・惑星の暦の最新版 DE430 のバイナリ形式のデータを Fortran 95 で読み込んでみました。

過去には Ruby や Python でも行いましたが。

* [Ruby - JPL 天文暦バイナリデータの読み込み！]({{site.baseurl}}/2016/04/26/ruby-read-jpl-bin-data "Ruby - JPL 天文暦バイナリデータの読み込み！")
* [Python - JPL 天文暦バイナリデータの読み込み！]({{site.baseurl}}/2018/06/16/python-read-jpl-bin-data "Python - JPL 天文暦バイナリデータの読み込み！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 天文暦バイナリデータについて

当ブログ過去記事を参照のこと。

* [JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")

また、天文暦データには各種バージョンが存在するが、日本の国立天文台が現在使用している DE430 を当方も使用する。

### 2. ソースコードの作成

* 以下は実行部分。

File: `jpl_read_430.f95`

{% highlight fortran linenos %}
!*******************************************************************************
! JPLEPH(JPL の DE430 バイナリデータ)読み込み
! * 対象天体
!      1: 水星            (Mercury)
!      2: 金星            (Venus)
!      3: 地球 - 月の重心 (Earth-Moon barycenter)
!      4: 火星            (Mars)
!      5: 木星            (Jupiter)
!      6: 土星            (Saturn)
!      7: 天王星          (Uranus)
!      8: 海王星          (Neptune)
!      9: 冥王星          (Pluto)
!     10: 月（地心）      (Moon (geocentric))
!     11: 太陽            (Sun)
!     12: 地球の章動(1980年IAUモデル) (Earth Nutations in longitude and obliquity(IAU 1980 model))
!     13: 月の秤動        (Lunar mantle libration)

!   Date          Author          Version
!   2018.10.21    mk-mode.com     1.00 新規作成
!   2018.11.09    mk-mode.com     1.01 時刻の取扱変更(マイクロ秒 => ミリ秒)
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
! ---
! 引数
!   [第１] 天体番号（省略可）
!          * 1 〜 13
!          * 省略時は 11 を指定したとみなす
!   [第２] ユリウス日（省略可）
!          * 省略時は現在日時を UTC とみなしたユリウス日
! ---
! * 構造型 type(t_time) は time    モジュール内で定義
! * 構造型 type(t_bin)  は eph_jpl モジュール内で定義
!*******************************************************************************
!
program jpl_read_430
  use const
  use time
  use eph_jpl
  implicit none
  integer(SP) :: a = 11  ! 指定の天体番号（初期値： 11（太陽））
  real(DP)    :: jd      ! 指定のJulian Day
  type(t_bin) :: bin
  integer(SP) :: i, j, n
  real(DP)    :: jds(2)
  ! 対象係数配列
  real(DP), allocatable :: coeff_a(:, :, :)

  ! コマンドライン引数(天体番号、JD)取得
  call get_arg(a, jd)

  ! バイナリデータ取得
  ! * 1レコード目:     ttl - numde
  ! * 2レコード目:     cval
  ! * 3レコード目以降: 係数
  call get_bin(jd, bin)

  ! 対象インデックスの開始／終了 JD
  jds = bin%coeff(1:2)

  ! 対象係数配列のアロケート
  if (a == 12) then
    n = 2
  else
    n = 3
  end if
  allocate(coeff_a(bin%ipt(2, a), n, bin%ipt(3, a)))

  ! 対象係数配列
  coeff_a = reshape( &
    & bin%coeff(bin%ipt(1, a): &
    &   (bin%ipt(1, a)+bin%ipt(2, a)*n*bin%ipt(3, a)-1) &
    & ), shape(coeff_a))

  ! 結果出力
  print '("  Astro No: ", I2)',     a
  print '("Julian Day: ", F18.10)', jd
  print '(/A/)', "*** Header data ***"
  print *, "TTL:"
  do i = 1, 3
    print '(2XA)', trim(bin%ttl(i))
  end do
  print *, "CNAM:"
  print '(8(A8))', bin%cnam(1:bin%ncon)
  print *, "SS:"
  print '(3(F11.1))', bin%ss
  print *, "NCON:"
  print '(I5)', bin%ncon
  print *, "AU:"
  print *, bin%au
  print *, "EMRAT:"
  print *, bin%emrat
  print *, "IPT:"
  do i = 1, 13
    print '(3(I6))', bin%ipt(:, i)
  end do
  print *, "NUMDE:"
  print *, bin%numde
  print *, "NCON:"
  print '(3E24.16)', bin%cval(1:bin%ncon)
  print '(/A)', "*** Coefficients ***"
  print '("jds: ", F18.10XF18.10)', jds
  do i = 1, bin%ipt(3, a)
    do j = 1, n
      print *, ""
      print '(3E24.16)', coeff_a(:, j, i)
    end do
  end do

  ! 対象係数配列のデアロケート
  deallocate(coeff_a)

  stop
contains
  ! コマンドライン引数(天体番号、JD)取得
  ! * 天体番号: 1 〜 13
  ! * JD: 実数形式（整合性チェックは行わない）
  !
  ! :param(inout) integer  a
  ! :param(inout) real(8) jd
  subroutine get_arg(a, jd)
    implicit none
    integer(SP), intent(inout) :: a
    real(DP),    intent(inout) :: jd
    character(20) :: arg_j
    type(t_time)  :: utc
    character(2)  :: arg_a
    integer(SP)   :: dt(8)

    if (iargc() < 2) then
      call date_and_time(values=dt)
      utc = t_time(dt(1), dt(2), dt(3), dt(5), dt(6), dt(7), dt(8))
      call gc2jd(utc, jd)
    end if
    if (iargc() > 0) then
      call getarg(1, arg_a)
      read (arg_a, *) a
    end if
    if (iargc() > 1) then
      call getarg(2, arg_j)
      read (arg_j, *) jd
    end if
  end subroutine get_arg
end program jpl_read_430
{% endhighlight %}

モジュールを含めた全てのファイルは GitHub にアップしている。（当然ながら、モジュール部分の方が計算の本質となっている）

* [CalendarF95/jpl_read_430 at master · komasaru/CalendarF95](https://github.com/komasaru/CalendarF95/tree/master/jpl_read_430 "CalendarF95/jpl_read_430 at master · komasaru/CalendarF95")

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
$ ./jpl_read_430 [A [JD]]
```

* `A` は天体番号。(`1`〜`13`; 省略可）  
  （省略時は `11` とみなす)
   1. 水星            (Mercury)
   2. 金星            (Venus)
   3. 地球 - 月の重心 (Earth-Moon barycenter)
   4. 火星            (Mars)
   5. 木星            (Jupiter)
   6. 土星            (Saturn)
   7. 天王星          (Uranus)
   8. 海王星          (Neptune)
   9. 冥王星          (Pluto)
  10. 月（地心）      (Moon (geocentric))
  11. 太陽            (Sun)
  12. 地球の章動(1980年IAUモデル) (Earth Nutations in longitude and obliquity(IAU 1980 model))
  13. 月の秤動        (Lunar mantle libration)
* `JD` はユリウス日(Julian Day)。（省略可）  
  （省略時はシステム時刻を UTC とみなしたユリウス日）

以下、実行例。

``` text
$ ./jpl_read_430 11 2458493
  Astro No: 11
Julian Day: 2458493.0000000000

*** Header data ***

 TTL:
  JPL Planetary Ephemeris DE430/LE430
  Start Epoch: JED=  2287184.5 1549-DEC-21 00:00:00
  Final Epoch: JED=  2688976.5 2650-JAN-25 00:00:00
 CNAM:
  DENUM   LENUM   TDATEF  TDATEB  JDEPOC  CENTER  CLIGHT  BETA
  GAMMA   AU      EMRAT   GM1     GM2     GMB     GM4     GM5
  GM6     GM7     GM8     GM9     GMS     XS      YS      ZS
  XDS     YDS     ZDS     X1      Y1      Z1      XD1     YD1
  ZD1     X2      Y2      Z2      XD2     YD2     ZD2     XB
  YB      ZB      XDB     YDB     ZDB     X4      Y4      Z4
  XD4     YD4     ZD4     X5      Y5      Z5      XD5     YD5
  ZD5     X6      Y6      Z6      XD6     YD6     ZD6     X7
  Y7      Z7      XD7     YD7     ZD7     X8      Y8      Z8
  XD8     YD8     ZD8     X9      Y9      Z9      XD9     YD9
  ZD9     XM      YM      ZM      XDM     YDM     ZDM     XC
  YC      ZC      XDC     YDC     ZDC     PHI     THT     PSI
  OMEGAX  OMEGAY  OMEGAZ  PHIC    THTC    PSIC    OMGCX   OMGCY
  OMGCZ   ASUN    J2SUN   J3SUN   J4SUN   RE      J2E     J3E
  J4E     J5E     J2EDOT  K2E0    K2E1    K2E2    TAUE0   TAUE1
  TAUE2   TAUER1  TAUER2  ROTEX   ROTEY   DROTEX  DROTEY  AM
  K2M     TAUM    LBET    LGAM    IFAC    COBLAT  KVC     PSIDOT
  J2M     C22M    J3M     C31M    S31M    C32M    S32M    C33M
  S33M    J4M     C41M    S41M    C42M    S42M    C43M    S43M
  C44M    S44M    J5M     C51M    S51M    C52M    S52M    C53M
  S53M    C54M    S54M    C55M    S55M    J6M     C61M    S61M
  C62M    S62M    C63M    S63M    C64M    S64M    C65M    S65M
  C66M    S66M    J7M     J8M     J9M     C71M    S71M    C72M
  S72M    C73M    S73M    C74M    S74M    C75M    S75M    C76M
  S76M    C77M    S77M    C81M    S81M    C82M    S82M    C83M
  S83M    C84M    S84M    C85M    S85M    C86M    S86M    C87M
  S87M    C88M    S88M    C91M    S91M    C92M    S92M    C93M
  S93M    C94M    S94M    C95M    S95M    C96M    S96M    C97M
  S97M    C98M    S98M    C99M    S99M    MA0001  MA0002  MA0003
  MA0004  MA0005  MA0006  MA0007  MA0008  MA0009  MA0010  MA0011
  MA0012  MA0013  MA0014  MA0015  MA0016  MA0017  MA0018  MA0019

                         ===< 中略 >===

  MA0780  MA0784  MA0786  MA0788  MA0790  MA0791  MA0804  MA0814
  MA0849  MA0895  MA0909  MA0914  MA0980  MA1015  MA1021  MA1036
  MA1093  MA1107  MA1171  MA1467
 SS:
  2396752.5  2506352.5       32.0
 NCON:
  572
 AU:
   149597870.69999999
 EMRAT:
   81.300569074190619
 IPT:
     3    14     4
   171    10     2
   231    13     2
   309    11     1
   342     8     1
   366     7     1
   387     6     1
   405     6     1
   423     6     1
   441    13     8
   753    11     2
   819    10     4
   899    10     4
 NUMDE:
         430
 NCON:
  0.4300000000000000E+03  0.4300000000000000E+03  0.2013032920043800E+14
  0.2013032919100700E+14  0.2440400500000000E+07  0.0000000000000000E+00
  0.2997924580000000E+06  0.1000000000000000E+01  0.1000000000000000E+01
  0.1495978707000000E+09  0.8130056907419062E+02  0.4912480450364760E-10
  0.7243452332644120E-09  0.8997011390199871E-09  0.9549548695550771E-10
  0.2825345840833870E-06  0.8459706073245031E-07  0.1292024825782960E-07
  0.1524357347885110E-07  0.2178441051974180E-11  0.2959122082855911E-03
  0.4502508784640554E-02  0.7670764270910071E-03  0.2660579177669776E-03
 -0.3517495360755232E-06  0.5177626409833405E-05  0.2229102178912029E-05
  0.3617627165602820E+00 -0.9078197215676601E-01 -0.8571497256275117E-01

                         ===< 中略 >===

  0.2267103341459905E-15  0.4555959566377237E-15  0.1035497250152759E-15
  0.3786475033089484E-15  0.3362975492761039E-15  0.4117268268399542E-16
  0.1535297888556620E-15  0.1258376592645005E-15  0.7617140987284265E-16
  0.6467767213237461E-16  0.2871640482670196E-15  0.9549128215887647E-16
  0.6248568708463761E-16  0.1115280133034817E-15

*** Coefficients ***
jds: 2458480.5000000000 2458512.5000000000

 -0.1177986012389841E+06 -0.9430794319120352E+04 -0.1236365613634352E+02
 -0.4724680593816627E-01  0.2990757809890035E-02  0.9950084248609360E-04
  0.2499812803471349E-05 -0.4470399183813857E-06  0.4997540692957418E-07
 -0.4197206836554665E-08  0.2579924434695465E-09

  0.1024060918107703E+07  0.2041212735430680E+04 -0.1858802195146995E+02
 -0.1389053329215789E+00 -0.1408257089104788E-02 -0.1298400943581497E-04
  0.8938336294255079E-05 -0.3410927132222797E-06  0.1830373846378631E-07
  0.9413342843760557E-09 -0.1650189762338264E-09

  0.4347619365798723E+06  0.1148040381729479E+04 -0.7523394428141031E+01
 -0.6309040075177956E-01 -0.6838489071172099E-03 -0.1988654753299750E-04
  0.4363433839780426E-05 -0.1345486877521627E-06  0.4657414521404225E-08
  0.9380387045868675E-09 -0.1181839454085240E-09

 -0.1367602149889538E+06 -0.9530998082077735E+04 -0.1257396535540276E+02
  0.1748132890254096E-01  0.5081848857958471E-02  0.9488804346779973E-04
 -0.2400900652003507E-05 -0.3559516282088078E-06 -0.4988323833105262E-07
 -0.5568931362110481E-08 -0.4381078377720741E-09

  0.1027989118759424E+07  0.1885503462315278E+04 -0.2036646668091816E+02
 -0.1537233130638352E+00  0.1071537491935919E-03  0.1669951591113572E-03
  0.9766197364092997E-05  0.4741131851164967E-06  0.3260542618358565E-07
 -0.4517257042438716E-10 -0.1419224414094673E-09

  0.4369953021675221E+06  0.1084641346610625E+04 -0.8343063184833706E+01
 -0.7226446996323115E-01 -0.1763141594316544E-03  0.7370996486217237E-04
  0.5369685930442202E-05  0.2924780982769289E-06  0.2267154252734439E-07
  0.5642299154312489E-09 -0.3496620019513923E-10
```

---

以上、

