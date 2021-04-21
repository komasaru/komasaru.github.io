---
layout   : single
title    : "Fortran - テイラー展開 cos(x)！"
published: true
date     : 2019-03-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で $$\cos(x)$$ のテイラー展開を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - テイラー展開 cos(x)！]( "C++ - テイラー展開 cos(x)！")
* [Ruby - テイラー展開 cos(x)！]( "Ruby - テイラー展開 cos(x)！")
* [Python - テイラー展開 cos(x)！]( "Python - テイラー展開 cos(x)！")

### 2. ソースコードの作成

File: `taylor_expansion_cos.f95`

{% highlight fortran linenos %}
!****************************************************
! テイラー展開 [ cos(x) ]
!
! * 自作関数と組込関数の計算結果を比較
!
!   date          name            version
!   2018.12.12    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  real(DP),    parameter :: PI = 4.0_DP * atan(1.0_DP)  ! 円周率
  real(DP),    parameter :: D2R = PI / 180.0_DP         ! 度 => ラジアン
  real(DP),    parameter :: EPS = 1.0e-8_DP             ! 精度
end module const

module taylor_expansion
  use const
  implicit none
  private
  public :: my_cos

contains
  ! テイラー展開
  !
  ! :param(in)    real(8) x: X
  ! :param(inout) real(8) y: 展開後
  function my_cos(x) result(y)
    implicit none
    real(DP), intent(in) :: x
    real(DP)    :: y, d, s, e, x_tmp
    integer(SP) :: k

    ! 変数初期化
    d = 1.0_DP
    s = 1.0_DP
    e = 1.0_DP

    ! x の値が 0 から 2π の範囲外の場合、0 から 2π に収める
    x_tmp = mod(x, 2.0_DP * PI)

    ! 最大200回ループ処理
    ! ( ただし、偶数項は 0 なので除外 )
    do k = 1, 200, 2
      d = s                                   ! d 和
      e = -e * x_tmp * x_tmp / (k * (k + 1))  ! 各項の値
      s = s + e                               ! s 和
      ! 打ち切り誤差
      if (abs(s - d) / abs(d) < EPS) then
        y = s
        return
      end if
    end do

    ! 収束しない時
    y = 9999.0_DP
  end function my_cos
end module taylor_expansion

program taylor_expansion_cos
  use const, only : SP, DP, D2R
  use taylor_expansion
  implicit none
  integer(SP) :: x
  real(DP)    :: r_x

  ! x = 0 〜 180 を 10 刻みで計算
  print '(A)', "    x   my_cos(x)     cos(x)"
  do x = 0, 180, 10
    r_x = real(x, DP)
    print '(X, F5.1, 2X, F9.6, 2X, F9.6)', &
        & r_x, my_cos(r_x * D2R), cos(r_x * D2R)
  end do
end program taylor_expansion_cos
{% endhighlight %}

* [Gist - Fortran 95 source code to computer Taylor expansion(cos(x)).](https://gist.github.com/komasaru/8a11eb403c78caf5282fafe548386571 "Gist - Fortran 95 source code to computer Taylor expansion(cos(x)).")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o taylor_expansion_cos taylor_expansion_cos.f95
```

### 4. 動作確認

``` text
$ ./taylor_expansion_cos
    x   my_cos(x)     cos(x)
   0.0   1.000000   1.000000
  10.0   0.984808   0.984808
  20.0   0.939693   0.939693
  30.0   0.866025   0.866025
  40.0   0.766044   0.766044
  50.0   0.642788   0.642788
  60.0   0.500000   0.500000
  70.0   0.342020   0.342020
  80.0   0.173648   0.173648
  90.0   0.000000   0.000000
 100.0  -0.173648  -0.173648
 110.0  -0.342020  -0.342020
 120.0  -0.500000  -0.500000
 130.0  -0.642788  -0.642788
 140.0  -0.766044  -0.766044
 150.0  -0.866025  -0.866025
 160.0  -0.939693  -0.939693
 170.0  -0.984808  -0.984808
 180.0  -1.000000  -1.000000
```

今回の結果出力の桁数では、組み込み関数と同じ値が得られた。（ちなみに（当然ながら）、出力桁数を増やすと誤差が生じるのが分かる）

---

以上。

