---
layout   : single
title    : "Fortran - 正規乱数（ボックス＝ミューラー法）！"
published: true
date     : 2019-02-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、 Box-Muller 法を使って正規乱数を生成してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - 正規乱数（ボックス＝ミューラー法）！]({{site.baseurl}}/2012/08/31/31002021 "C++ - 正規乱数（ボックス＝ミューラー法）！")
* [Ruby - 正規乱数（ボックス＝ミューラー法）！]({{site.baseurl}}/2012/09/02/02002000 "Ruby - 正規乱数（ボックス＝ミューラー法）！")
* [Python - 正規乱数（ボックス＝ミューラー法）！]({{site.baseurl}}/2018/01/19/python-random-number-generation-with-box-muller "Python - 正規乱数（ボックス＝ミューラー法）！")

### 2. ソースコードの作成

File: `rndnum_bm.f95`

{% highlight fortran linenos %}
!****************************************************
! 正規乱数生成（by ボックス＝ミューラー法）
! : 0 〜 20 の正規乱数をボックス＝ミューラー法により
!   計算し、ヒストグラムを出力する。
!
!   date          name            version
!   2018.12.03    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer(SP), parameter :: M  = 10                     ! 平均
  real(DP),    parameter :: S  = 2.5_DP                 ! 標準偏差
  integer(SP), parameter :: N  = 10000                  ! 発生させる乱数の個数
  real(DP),    parameter :: PI = 4.0_DP * atan(1.0_DP)  ! 円周率
  real(DP),    parameter :: SC = N / 100.0_DP           ! ヒストグラム用スケール
end module const

module box_muller
  use const, only : SP, DP, S, M, PI
  implicit none
  private
  public :: rnd_seed, rnd

contains
  ! 乱数の種の設定
  subroutine rnd_seed
    implicit none
    integer(SP) :: seed_size, clock
    integer(SP), allocatable :: seed(:)

    call system_clock(clock)
    call random_seed(size=seed_size)
    allocate(seed(seed_size))
    seed = clock
    call random_seed(put=seed)
    deallocate(seed)
  end subroutine rnd_seed

  ! 正規乱数生成
  !
  ! :param(out) integer(4) r(2)
  subroutine rnd(r)
    integer(SP), intent(out) :: r(2)
    real(DP) :: r_u(2)  ! [0, 1) の一様乱数 2 個

    call random_number(r_u(1))
    call random_number(r_u(2))
    r(1) = int(S * sqrt(-2 * log(r_u(1))) * cos(2 * PI * r_u(2)) + M)
    r(2) = int(S * sqrt(-2 * log(r_u(1))) * sin(2 * PI * r_u(2)) + M)
  end subroutine rnd
end module box_muller

program rndnum_bm
  use const, only : SP, N, M, SC
  use box_muller
  implicit none
  integer(SP) :: i, j, r(2), hist(0:M * 2)

  ! 乱数の種の設定
  ! (正規乱数生成に使用する一様乱数の種)
  call rnd_seed

  ! 正規乱数の生成
  hist(:) = 0
  do i = 1 , N
    call rnd(r)
    hist(r) = hist(r) + 1
  end do

  ! 結果出力
  do i = 0, M * 2
    write (*, '(I3, ":", I4, " | ", A)') &
      & i, hist(i), repeat("*", int(hist(i) / SC))
  end do
end program rndnum_bm
{% endhighlight %}

* [Gist - Fortran 95 source code to generate random numbers by box-muller's method.](https://gist.github.com/komasaru/bb3e38f19aa099ef950de70e5a1c377a "Gist - Fortran 95 source code to generate random numbers by box-muller's method.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o rndnum_bm rndnum_bm.f95
```

### 4. 動作確認

``` text
$ ./rndnum_bm
  0:   2 |
  1:  10 |
  2:  36 |
  3: 115 | *
  4: 282 | **
  5: 649 | ******
  6:1218 | ************
  7:1923 | *******************
  8:2599 | *************************
  9:3136 | *******************************
 10:3005 | ******************************
 11:2744 | ***************************
 12:1956 | *******************
 13:1253 | ************
 14: 653 | ******
 15: 267 | **
 16: 115 | *
 17:  27 |
 18:  10 |
 19:   0 |
 20:   0 |
```

ヒストグラムが概ねきれいな山になっているので、正規分布になっていると判断できる。

---

以上、

