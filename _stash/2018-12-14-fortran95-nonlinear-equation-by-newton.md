---
layout   : single
title    : "Fortran - 非線形方程式の解法（ニュートン法）！"
published: true
date     : 2018-12-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、非線形方程式をニュートン法を使って解いてみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ニュートン法による非線形方程式の解法とは？

当ブログ過去記事を参照のこと。

* [C++ - 非線形方程式の解法（ニュートン法）！]({{site.baseurl}}/2012/11/21/21002047 "C++ - 非線形方程式の解法（ニュートン法）！")

### 2. 想定する非線形方程式

想定する非線形方程式は $$y = x^{3} - x + 1$$

![NONLINEAR_EQUATION_NEWTON]({{site.baseurl}}/images/2018/12/14/NONLINEAR_EQUATION_NEWTON.png "NONLINEAR_EQUATION_NEWTON")

### 3. ソースコードの作成

* $$x$$の範囲内に解が1個だけ存在するケースに限定している。

File: `nonlinear_equation_newton.f95`

{% highlight fortran linenos %}
!****************************************************
! 非線形方程式の解法（ニュートン法）
! * 方程式： y = x**3 - x + 1
!
! date          name            version
! 2018.10.12    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program nonlinear_equation_newton
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,      parameter :: SP = kind(1.0)
  integer(SP),  parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer,      parameter :: NMAX = 20
  real(DP),     parameter :: EPS = 1.0e-6
  logical :: stat
  integer :: n
  real(DP) :: x, y, dx, dy

  write (*, "(a)", advance="no") "x : "
  read (*,*) x

  stat = .false.
  do n = 1, NMAX
     ! 次の値の推定
     y  = f(x)
     dy = df(x)
     dx = -y / dy
     x  = x + dx

     ! 収束判定
     if (abs(dx) < EPS) then
        stat = .true.
        write (*, '("収束 [", i4, "]")') n
        exit
     else
        write(*,fmt='("誤差 [", i4, "] = ", e20.8)') n, abs(y)
     end if
  end do

  ! 結果出力
  if (.not. stat) then
     write (*, *) "近似不可！"
  end if
  write (*, '("近似値 = ", e20.8)') x
  write (*, '("誤差   = ", e20.8)') abs(y)

  stop
contains
  ! 方程式
  ! * f = x**3 - x + 1
  !
  ! :param  real(8) x
  ! :return real(8) f
  real(DP) function f(x)
    implicit none
    real(DP), intent(in) :: x

    f = x**3 - x + 1
  end function f

  ! 方程式の導関数
  ! * f' = 3* x**2 - 1
  !
  ! :param  real(8)  x
  ! :return real(8) df
  real(DP) function df(x)
    implicit none
    real(DP), intent(in) :: x

    df = 3 * x**2 - 1
  end function df
end program nonlinear_equation_newton
{% endhighlight %}

* [Gist - Fortran 95 source code to solve nonlinear-equation with newton method.](https://gist.github.com/komasaru/30af36adf434d782d5dca4e099096d27 "Gist - Fortran 95 source code to solve nonlinear-equation with newton method.")

### 4. ソースコードのコンパイル

``` text
$ gfortran -o nonlinear_equation_newton nonlinear_equation_newton.f95
```

### 5. 動作確認

実行すると x の初期値を問われるので、入力する。（与える x 初期値によっては、最大ループ回数で収束しない場合がある）

``` text
$ ./nonlinear_equation_newton
x : -1
誤差 [   1] =       0.10000000E+01
誤差 [   2] =       0.87500000E+00
誤差 [   3] =       0.10068217E+00
誤差 [   4] =       0.20583619E-02
収束 [   5]
近似値 =      -0.13247180E+01
誤差   =       0.92437776E-06
```

グラフと比較してみると、正しく近似値が求められていることが分かる。

---

以上、

