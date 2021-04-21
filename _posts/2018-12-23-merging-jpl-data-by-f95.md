---
layout   : single
title    : "JPL 天文暦データのバイナリ化(Fortran 95 Ver.)！"
published: true
date     : 2018-12-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Fortran
---

以前、複数存在する DE430 のテキスト形式データファイルを１つのバイナリ形式のファイルにコンバートする方法についての記録しました。

* [JPL 天文暦データのバイナリ化！]({{site.baseurl}}/2016/04/18/merging-jpl-data "JPL 天文暦データのバイナリ化！")

但し、 FORTRAN 77 のソースコードでした。

今回、 Fortran 95 に移植しました。以下、その記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GNU Fortran (GCC) 6.3.0 でのコンパイル作業を想定。（GCC でなくてもよいだろう）
* 今回移植するのは、テキストファイルをバイナリ化する `asc2eph.f` のみ。

### 1. 使用するデータファイル

[ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de430/](ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de430/) 内の以下のファイル。

* ヘッダファイル： `header.430_572`
* テキスト形式データファイル： `ascp1550.430` 〜 `ascp2550.430`
* 検証用ファイル： `testpo.430`

### 2. 元の FORTRAN 77 ソースコード

[ftp://ssd.jpl.nasa.gov/pub/eph/planets/fortran/](ftp://ssd.jpl.nasa.gov/pub/eph/planets/fortran/) 内の以下のファイル。

* コンバートプログラム： `asc2eph.f` （<= 今回の移植対象）
* データ検証プログラム： `testeph.f`

### 3. コンバートプログラムの作成

元の FORTRAN 77 製コンバートプログラム `asc2eph.f` を文法等に注意しながら Fortran 95 用に書き換える。

File: `asc2eph.f95`

{% highlight fortran linenos %}
!***********************************************************************
! ASC2EPH creates a binary format JPL Planetary Ephemeris file from
! one or more ascii text files.
!
! date          name            version
! 2018.08.22    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!***********************************************************************
!
program main
  implicit none
  ! Unix プラットフォームでなければ nrecl = 1
  integer, parameter :: nrecl  = 4
  integer, parameter :: oldmax = 400
  integer, parameter :: nmax   = 1000
  character(len= 6) :: cnam(nmax)
  character(len= 6) :: ttl(14, 3)
  character(len=12) :: header
  real(8) :: au, cval(nmax), db(3000), db2z
  real(8) :: emrat, ss(3), t1, t2
  integer :: i, j, irecsz, in, out
  integer :: k, kk, kp2, ksize
  integer :: ipt(3, 12)  ! Pointers to number of coefficients for bodies
  integer :: lpt(3)      ! Pointer to number of coefficients for lunar librations
  integer :: rpt(3)      ! Pointer to number of coefficients for lunar euler angel rates
  integer :: tpt(3)      ! Pointer to number of coefficients for TT-TDB
  integer :: n, ncon, nrout, ncoeff, nrw, numde
  logical :: first = .true.


  ! By default, the output ephemeris will span the same interval as the
  ! input ascii data file(s).  The user may reset these to other JED's.
  !
  db2z = -99999999_8
  t1   = -99999999_8
  t2   =  99999999_8
  if (nrecl /= 1 .and. nrecl /= 4) then
    write (*,*) '*** ERROR: User did not set NRECL ***'
    stop
  end if

  ! Write a fingerprint to the screen.
  !
  write (*,*) ' JPL ASCII-TO-DIRECT-I/O program. ' // &
            & ' Last modified 15-Aug-2013.'

  ! Read the size and number of main ephemeris records.
  ! (from header.xxx)
  !
  read (*,'(6X,I6)') ksize
  write (*,'(/(A,I6))') 'KSIZE = ', ksize
  irecsz = nrecl * ksize

  ! Now for the alphameric heading records (GROUP 1010)
  !
  call nxtgrp(header)
  if (header /= 'GROUP   1010') then
    call errprt(1010, 'NOT HEADER')
  end if
  read (*,'(14A6)') ttl
  write (*,'(/(14A6))') ttl

  ! Read start, end and record span  (GROUP 1030)
  !
  call nxtgrp(header)
  if (header /= 'GROUP   1030') then
    call errprt(1030, 'NOT HEADER')
  end if
  read (*,'(3D12.0)') ss

  ! Read number of constants and names of constants (GROUP 1040/4).
  !
  call nxtgrp(header)
  if (header /= 'GROUP   1040 ') then
    call errprt(1040, 'NOT HEADER')
  end if
  read (*,'(I6)') n
  read (*,'(10A8)') (cnam(i), i=1,n)
  ncon = n

  ! Read number of values and values (GROUP 1041/4)
  !
  call nxtgrp(header)
  if (header /= 'GROUP   1041') then
    call errprt(1041, 'NOT HEADER')
  end if
  read (*,'(I6)') n
  read (*,*) (cval(i), i=1,n)
  do i = 1, n
    if (cnam(i) == 'AU    ') au    = cval(i)
    if (cnam(i) == 'EMRAT ') emrat = cval(i)
    if (cnam(i) == 'DENUM ') numde = cval(i)
  end do
  write (*,'(500(/2(A8,D24.16)))') (cnam(i), cval(i), i=1,n)

  ! Zero out pointer arrays
  !
  do i = 1, 3
    do j = 1, 12
      ipt(i, j) = 0
    end do
    lpt(i) = 0
    rpt(i) = 0
    tpt(i) = 0
  end do

  ! Read pointers needed by INTERP (GROUP 1050)
  !
  call nxtgrp(header)
  if (header /= 'GROUP   1050') then
    call errprt(1050, 'NOT HEADER')
  end if
  write (*,'(/)')
  do i = 1, 3
    read  (*,'(15I6)') (ipt(i, j), j=1,12), lpt(i), rpt(i), tpt(i)
    write (*,'(15I5)') (ipt(i, j), j=1,12), lpt(i), rpt(i), tpt(i)
  end do

  ! Open direct-access output file ('JPLEPH')

  open (unit   = 12,             &
      & file   = 'JPLEPH',       &
      & access = 'DIRECT',       &
      & form   = 'UNFORMATTED',  &
      & recl   = irecsz,         &
      & status = 'NEW')

  ! Read and write the ephemeris data records (GROUP 1070).
  !
  call nxtgrp(header)
  if (header /= 'GROUP   1070') then
    call errprt(1070, 'NOT HEADER')
  end if
  nrout = 0
  in    = 0
  out   = 0
  do
    read (*,'(2I6)') nrw, ncoeff
    if (nrw /= 0) exit
  end do
  do k = 1, ncoeff, 3
    kp2 = min(k + 2, ncoeff)
    read (*,*, iostat = in) (db(kk), kk=k,kp2)
    if (IN /= 0) stop ' Error reading 1st set of coeffs'
  end do

  do
    if ((in /= 0) .or. (db(2) >= t2)) exit
    if (2 * ncoeff /= ksize) then
      call errprt(ncoeff, ' 2*NCOEFF not equal to KSIZE')
    end if

    ! Skip this data block if the end of the interval is less
    ! than the specified start time or if the it does not begin
    ! where the previous block ended.
    !
    if  ((db(2) >= t1) .and. (db(1) >= db2z)) then
      if (first) then
        ! Don't worry about the intervals overlapping
        ! or abutting if this is the first applicable
        ! interval.
        !
        db2z  = db(1)
        first = .false.
      end if
      if (db(1) /= db2z) then
        ! Beginning of current interval is past the end
        ! of the previous one.
        !
        call errprt(nrw, 'Records do not overlap or abut')
      end if
      db2z  = db(2)
      nrout = nrout + 1
      write (12, rec=nrout+2, iostat=out) (db(k), k=1,ncoeff)
      if (out /= 0) then
        call errprt(nrout, 'th record not written because of error')
      end if

      ! Save this block's starting date, its interval span, and its end 
      ! date.
      !
      if (nrout == 1) then
        ss(1) = db(1)
        ss(3) = db(2) - db(1)
      end if
      ss(2) = db(2)

      ! Update the user as to our progress every 100th block.
      !
      if (mod(nrout, 100) == 1) then
        if (db(1) >= t1) then
          write (*,'(I6,A,F12.2)') &
            & nrout, ' EPHEMERIS RECORDS WRITTEN.  LAST JED = ', db(2)
        else
          write (*,*) ' Searching for first requested record...'
        end if
      end if
    end if
    read (*,'(2I6)', iostat=in) nrw, ncoeff
    if (in == 0)then
      do K = 1, ncoeff, 3
        kp2 = min(k + 2, ncoeff)
        read (*,*, iostat=in) (db(kk), kk=k,kp2)
        if (in /= 0) stop ' Error reading nth set of coeffs'
      end do
    end if
  end do
  write (*,'(I6,A,F12.2)') &
    & nrout, ' EPHEMERIS RECORDS WRITTEN.  LAST JED = ', db(2)

  ! Write header records onto output file.
  nrout = 1
  if (ncon <= oldmax) then
    write (12, rec=1, iostat=out) &
      & ttl, (cnam(i), i=1,oldmax), &
      & ss, ncon, au, emrat, ipt, numde, lpt, rpt, tpt
  else
    k = oldmax + 1
    write (12, rec=1, iostat=out) &
      & ttl, (cnam(i), i=1,oldmax), &
      & ss, ncon, au, emrat, ipt, numde, lpt, (cnam(j), j=k,ncon), rpt, tpt
  end if
  if (out /= 0 ) then
    call errprt(nrout, 'st record not written because of error')
  end if
  nrout = 2
  if (ncon <= oldmax) then
    write (12, rec=2, iostat=out) (cval(i), i=1,oldmax)
  else
    write (12, rec=2, iostat=out) (cval(i), i=1,ncon)
  end if
  if (out /= 0) then
    call errprt(nrout, 'nd record not written because of error')
  end if

  ! We're through.  Wrap it up.
  close (12)
  stop ' OK'

contains

  subroutine errprt(i, msg)
    implicit none
    integer, intent(IN) :: i
    character(len=*), intent(IN) :: msg

    write (*,'(A,I8,2X,A50)') 'ERROR #', i, msg

    stop ' ERROR '
  end subroutine errprt

  subroutine nxtgrp(header)
    implicit none
    character(len=*), intent(OUT) :: header
    character(len=12) :: blank

    ! Start with nothing.
    !
    header = ' '

    ! The next non-blank line we encounter is a header record.
    ! The group header and data are seperated by a blank line.
    !
    do
      if (header /= ' ') exit
      read (*,'(A)') header
    end do

    ! Found the header.  Read the blank line so we can get at the data.
    !
    if (header /= 'GROUP   1070') read (*,'(A)') blank

    return
  end subroutine nxtgrp
end program main
{% endhighlight %}

* [Gist - Fortran 95 source code to convert JPL source cord from ascii to binary.](https://gist.github.com/komasaru/447a920345e1579102d6f0ff712d45cd "Gist - Fortran 95 source code to convert JPL source cord from ascii to binary.")

### 4. コンバートプログラムのコンパイル

``` text
$ gfortran -o asc2eph asc2eph.f95
```

データ検証プログラムもコンパイルしておく。（こちらは FORTRAN 77 のまま）

``` text
$ gfortran -o testeph testeph.f
```

### 5. テキスト形式データのマージ＆コンバート

`asc2eph` をヘッダファイル・テキスト形式データファイルと同じディレクトリに配置して以下のように実行する。（必要なテキスト形式データファイルだけをマージするようにしてもよいし、全てのテキスト形式データファイルをマージするようにしてもよい）

``` text
$ cat header.430_572 ascp1950.430 ascp2050.430 | ./asc2eph
  JPL ASCII-TO-DIRECT-I/O program.  Last modified 15-Aug-2013.

KSIZE =   2036

JPL Planetary Ephemeris DE430/LE430
Start Epoch: JED=  2287184.5 1549-DEC-21 00:00:00
Final Epoch: JED=  2688976.5 2650-JAN-25 00:00:00

  DENUM   0.4300000000000000D+03  LENUM   0.4300000000000000D+03
  TDATEF  0.2013032920043800D+14  TDATEB  0.2013032919100700D+14
  JDEPOC  0.2440400500000000D+07  CENTER  0.0000000000000000D+00
  CLIGHT  0.2997924580000000D+06  BETA    0.1000000000000000D+01
  GAMMA   0.1000000000000000D+01  AU      0.1495978707000000D+09
  EMRAT   0.8130056907419062D+02  GM1     0.4912480450364760D-10
  GM2     0.7243452332644120D-09  GMB     0.8997011390199871D-09
  GM4     0.9549548695550771D-10  GM5     0.2825345840833870D-06

          ===< 中略 >===

  MA1093  0.2871640482670196D-15  MA1107  0.9549128215887647D-16
  MA1171  0.6248568708463761D-16  MA1467  0.1115280133034817D-15



    3  171  231  309  342  366  387  405  423  441  753  819  899    00
   14   10   13   11    8    7    6    6    6   13   11   10   10    00
    4    2    2    1    1    1    1    1    1    8    2    4    4    00
     1 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2396784.50
   101 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2399984.50

       ===< 中略 >===

  3401 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2505584.50
  3425 EPHEMERIS RECORDS WRITTEN.  LAST JED =   2506352.50
STOP  OK
```

* 成功すると、同じディレクトリ内に `JPLEPH` というバイナリファイルが作成される。（全てのテキスト形式データファイルをマージ＆コンバートした場合は [ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/linux_p1550p2650.430](ftp://ssd.jpl.nasa.gov/pub/eph/planets/Linux/de430/linux_p1550p2650.430) と同じサイズになるはず）
* `JPLEPH` が既に存在している場合はコンパイルエラーになるので、コンパイルし直す際は `JPLEPH` ファイルを削除してから。

### 6. バイナリ形式データの検証

`testeph` を `JPLEPH` や `testpo.430` と同じディレクトリに配置して以下のように実行する。

``` text
$ ./testeph < testpo.430
  JPL TEST-EPHEMERIS program.  Last modified March 2013.

    2433264.50    2506352.50         32.00
  DENUM   0.4300000000000000D+03
  LENUM   0.4300000000000000D+03
  TDATEF  0.2013032920043800D+14
  TDATEB  0.2013032919100700D+14

===< 中略 >===

   line -- jed --   t#   c#   x#   --- jpl value ---   --- user value --    -- difference --

   100 2436294.5    4    9    3        -13.1973964533829        -13.1973964533829  0.17764E-14
   200 2439338.5    7    6    1        -27.5380053144894        -27.5380053144894  0.71054E-14
   300 2442382.5    4   11    6         -0.0039421481584         -0.0039421481584  0.26021E-17

===< 中略 >===

  2200 2500212.5    5    3    1         -1.9119755198047         -1.9119755198047  0.00000E+00
  2300 2503256.5   15    0    4          0.0003062237721          0.0003062237721  0.00000E+00
  2400 2506300.5    6    5    3          5.3862187413309          5.3862187413309  0.88818E-15
```

`difference` の列が `0.00000E+00` もしくは `0.88818E-15` のように限りなく小さい値になっていれば、データに誤りがない（テキストデータが正常にバイナリデータにコンバートされている）ということではないでしょうか。（本来は全ての `difference` 値が `0.00000E+00` になるべきであろう。この誤差は `testpo.430` 読み込み時の誤差によるもの（浮動小数点数が受ける影響によるもの））

また、全てのテキスト形式データファイルをマージ＆コンバートした場合は、当方の環境では `testeph` 実行後に「浮動小数点」に関する例外が発生した。（原因は不明。これも浮動小数点数が受ける影響によるものかもしれない）

検証用フィル `testpo.430` の仕様については、当ブログ過去記事「[月・惑星の暦 JPL DE430 について！]({{site.baseurl}}/2016/04/14/about-jpl-de430 "月・惑星の暦 JPL DE430 について！ - mk-mode BLOG")」を参照のこと。

### 7. 参考サイト

JPL 本家サイトと FTP サイト。

* [JPL Planetary and Lunar Ephemerides](http://ssd.jpl.nasa.gov/?planet_eph_export "JPL Planetary and Lunar Ephemerides")
* [ftp://ssd.jpl.nasa.gov/pub/eph/planets/](ftp://ssd.jpl.nasa.gov/pub/eph/planets/ "")

---

以上。

