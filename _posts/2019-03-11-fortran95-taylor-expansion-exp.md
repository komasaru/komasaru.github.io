---
layout   : single
title    : "Fortran - テイラー展開 exp(x)！"
published: true
date     : 2019-03-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で $$e^x$$ のテイラー展開を計算する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - テイラー展開 exp(x)！]({{site.baseurl}}/2012/10/19/19002055 "C++ - テイラー展開 exp(x)！")
* [Ruby - テイラー展開 exp(x)！]({{site.baseurl}}/2012/10/20/20002000 "Ruby - テイラー展開 exp(x)！")
* [Python - テイラー展開 exp(x)！]({{site.baseurl}}/2018/01/31/python-taylor-expansion-exp "Python - テイラー展開 exp(x)！")

### 2. ソースコードの作成

File: `taylor_expansion_exp.f95`

{% highlight fortran linenos %}
!****************************************************
! テイラー展開 [ exp(x) ]
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
  real(DP),    parameter :: EPS = 1.0e-8_DP  ! 精度
end module const

module taylor_expansion
  use const
  implicit none
  private
  public :: my_exp

contains
  ! テイラー展開
  !
  ! :param(in)    real(8) x: X
  ! :param(inout) real(8) y: 展開後
  function my_exp(x) result(y)
    implicit none
    real(DP), intent(in) :: x
    real(DP)    :: y, d, s, e
    integer(SP) :: k

    ! 変数初期化
    d = 1.0_DP
    s = 1.0_DP
    e = 1.0_DP

    ! 最大200回ループ処理
    do k = 1, 200
      d = s               ! d 和
      e = e * abs(x) / k  ! e 値
      s = s + e           ! s 和
      ! 打ち切り誤差
      if (abs(s - d) / abs(d) < EPS) then
        if (x > 0.0_DP) then
          y = s
        else
          y = 1.0_DP / s
        end if
        return
      end if
    end do

    ! 収束しない時
    y = 0.0_DP
  end function my_exp
end module taylor_expansion

program taylor_expansion_exp
  use const, only : SP, DP
  use taylor_expansion
  implicit none
  integer(SP) :: x
  real(DP)    :: r_x

  ! x = -50 〜 50 を 10 刻みで計算
  print '(A)', "    x     my_exp(x)        exp(x)"
  do x = -50, 50, 10
    r_x = real(x, DP)
    print '(X, F5.1, 2X, E12.6, 2X, E12.6)', r_x, my_exp(r_x), exp(r_x)
  end do
end program taylor_expansion_exp
{% endhighlight %}

* [Gist - Fortran 95 source code to computer Taylor expansion(exp(x)).](https://gist.github.com/komasaru/409de4b03da295ef07a8301b0d502670 "Gist - Fortran 95 source code to computer Taylor expansion(exp(x)).")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o taylor_expansion_exp taylor_expansion_exp.f95
```

### 4. 動作確認

``` text
$ ./taylor_expansion_exp
    x     my_exp(x)        exp(x)
 -50.0  0.192875E-21  0.192875E-21
 -40.0  0.424835E-17  0.424835E-17
 -30.0  0.935762E-13  0.935762E-13
 -20.0  0.206115E-08  0.206115E-08
 -10.0  0.453999E-04  0.453999E-04
   0.0  0.100000E+01  0.100000E+01
  10.0  0.220265E+05  0.220265E+05
  20.0  0.485165E+09  0.485165E+09
  30.0  0.106865E+14  0.106865E+14
  40.0  0.235385E+18  0.235385E+18
  50.0  0.518471E+22  0.518471E+22
```

今回の結果出力の桁数では、組み込み関数と同じ値が得られた。（ちなみに（当然ながら）、出力桁数を増やすと若干の誤差があるのが分かる）

---

以上。

