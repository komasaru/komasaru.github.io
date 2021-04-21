---
layout   : single
title    : "Fortran - 2つの配列から単回帰曲線（3次回帰モデル）計算！"
published: true
date     : 2019-08-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、数値からなる同サイズの配列2つを説明変数・目的変数とみなして3次の単回帰曲線を計算してみました。（連立方程式の解法にはガウスの消去法を使用）

過去には2次回帰モデルについて行なっています。

* [Fortran - 2つの配列から単回帰曲線（2次回帰）計算！]({{site.baseurl}}/2019/06/17/fortran95-regression-curve "Fortran - 2つの配列から単回帰曲線（2次回帰）計算！")
* [Fortran - 2つの配列から単回帰曲線（2次回帰）計算(Ver.2)！]({{site.baseurl}}/2019/06/20/fortran95-regression-curve-v2 "Fortran - 2つの配列から単回帰曲線（2次回帰）計算(Ver.2)！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 単回帰曲線（3次回帰モデル）の求め方

求める曲線を $$y=a+bx+cx^2+dx^3$$ とすると、残差の二乗和 $$S$$ は

$$
\begin{eqnarray*}
S = \sum_{i=1}^{N}(y_i - a - bx_i - cx_i^2 - dx_i^3)^2
\end{eqnarray*}
$$

となる。 $$a,b,c,d$$ それぞれで偏微分したものを $$0$$ とする。

$$
\begin{eqnarray*}
\frac{\partial S}{\partial a} &=& 2\sum_{i=1}^{N}(a+bx_i+cx_i^2+dx_i^3 - y_i) = 0 \\
\frac{\partial S}{\partial b} &=& 2\sum_{i=1}^{N}(ax_i+bx_i^2+cx_i^3+dx_i^4 - x_{i}y_i) = 0 \\
\frac{\partial S}{\partial c} &=& 2\sum_{i=1}^{N}(ax_i^2+bx_i^3+cx_i^4+dx_i^5 - x_{i}^{2}y_i) = 0 \\
\frac{\partial S}{\partial d} &=& 2\sum_{i=1}^{N}(ax_i^3+bx_i^4+cx_i^5+dx_i^6 - x_{i}^{3}y_i) = 0
\end{eqnarray*}
$$

これらを変形すると、

$$
\begin{eqnarray*}
aN + b\sum_{i=1}^{N}x_i + c\sum_{i=1}^{N}x_i^2 + d\sum_{i=1}^{N}x_i^3 &=& \sum_{i=1}^{N}y_i \\
a\sum_{i=1}^{N}x_i + b\sum_{i=1}^{N}x_i^2 + c\sum_{i=1}^{N}x_i^3 + d\sum_{i=1}^{N}x_i^4 &=& \sum_{i=1}^{N}x_{i}y_i \\
a\sum_{i=1}^{N}x_i^2 + b\sum_{i=1}^{N}x_i^3 + c\sum_{i=1}^{N}x_i^4 + d\sum_{i=1}^{N}x_i^5 &=& \sum_{i=1}^{N}x_{i}^{2}y_i \\
a\sum_{i=1}^{N}x_i^3 + b\sum_{i=1}^{N}x_i^4 + c\sum_{i=1}^{N}x_i^5 + d\sum_{i=1}^{N}x_i^6 &=& \sum_{i=1}^{N}x_{i}^{3}y_i
\end{eqnarray*}
$$

となる。これらの連立方程式を解けばよい。

### 2. ガウスの消去法による連立方程式の解法について

当ブログ過去記事を参照。

* [Ruby - 連立方程式解法（ガウスの消去法）！ ]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！ ")

### 3. ソースコードの作成

File: `regression_curve_3d.f95`

{% highlight fortran linenos %}
!****************************************************
! 単回帰曲線（3次回帰）計算
! : y = a + b * x + c * x^2 + d * x^3
! : 連立方程式を ガウスの消去法で解く方法

!   date          name            version
!   2019.04.15    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module const

module comp
  use const
  implicit none
  private
  public :: calc_reg_curve_3d

contains
  ! 単回帰曲線（3次回帰）計算
  !
  ! :param(in)  real(8) x(:): 説明変数配列
  ! :param(in)  real(8) y(:): 目的変数配列
  ! :param(out) real(8)    a: 係数 a
  ! :param(out) real(8)    b: 係数 b
  ! :param(out) real(8)    c: 係数 c
  ! :param(out) real(8)    d: 係数 d
  subroutine calc_reg_curve_3d(x, y, a, b, c, d)
    implicit none
    real(DP), intent(in)  :: x(:), y(:)
    real(DP), intent(out) :: a, b, c, d
    integer(SP) :: size_x, size_y, i
    real(DP)    :: sum_x, sum_x2, sum_x3, sum_x4, sum_x5, sum_x6
    real(DP)    :: sum_y, sum_xy, sum_x2y, sum_x3y
    real(DP)    :: mtx(4, 5)

    size_x = size(x)
    size_y = size(y)
    if (size_x == 0 .or. size_y == 0) then
      print *, "[ERROR] array size == 0"
      stop
    end if
    if (size_x /= size_y) then
      print *, "[ERROR] size(X) != size(Y)"
      stop
    end if

    sum_x   = sum(x)
    sum_x2  = sum(x * x)
    sum_x3  = sum(x * x * x)
    sum_x4  = sum(x * x * x * x)
    sum_x5  = sum(x * x * x * x * x)
    sum_x6  = sum(x * x * x * x * x * x)
    sum_y   = sum(y)
    sum_xy  = sum(x * y)
    sum_x2y = sum(x * x * y)
    sum_x3y = sum(x * x * x * y)
    mtx(1, :) = (/real(size_x, DP),  sum_x, sum_x2, sum_x3,   sum_y/)
    mtx(2, :) = (/           sum_x, sum_x2, sum_x3, sum_x4,  sum_xy/)
    mtx(3, :) = (/          sum_x2, sum_x3, sum_x4, sum_x5, sum_x2y/)
    mtx(4, :) = (/          sum_x3, sum_x4, sum_x5, sum_x6, sum_x3y/)
    call solve_ge(4, mtx)
    a = mtx(1, 5)
    b = mtx(2, 5)
    c = mtx(3, 5)
    d = mtx(4, 5)
  end subroutine calc_reg_curve_3d

  ! 連立方程式を解く（ガウスの消去法）
  !
  ! :param(in)    integer(4)     n: 元数
  ! :param(inout) real(8) a(n,n+1): 係数配列
  subroutine solve_ge(n, a)
    implicit none
    integer(SP), intent(in)    :: n
    real(DP),    intent(inout) :: a(n, n + 1)
    integer(SP) :: i, j
    real(DP)    :: d

    ! 前進消去
    do j = 1, n - 1
      do i = j + 1, n
        d = a(i, j) / a(j, j)
        a(i, j+1:n+1) = a(i, j+1:n+1) - a(j, j+1:n+1) * d
      end do
    end do

    ! 後退代入
    do i = n, 1, -1
      d = a(i, n + 1)
      do j = i + 1, n
        d = d - a(i, j) * a(j, n + 1)
      end do
      a(i, n + 1) = d / a(i, i)
    end do
  end subroutine solve_ge
end module comp

program regression_curve_3d
  use const
  use comp
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  real(DP)      :: a, b, c, d
  integer(SP)   :: n, i
  character(20) :: f
  real(DP), allocatable :: x(:), y(:)

  ! IN ファイル OPEN
  open (UID, file = F_INP, status = "old")

  ! データ数読み込み
  read (UID, *) n

  ! 配列用メモリ確保
  allocate(x(n))
  allocate(y(n))

  ! データ読み込み
  do i = 1, n
    read (UID, *) x(i), y(i)
  end do
  write (f, '("(A, ", I0, "F8.2, A)")') n
  print f, "説明変数 X = (", x, ")"
  print f, "目的変数 Y = (", y, ")"
  print '(A)', "---"

  ! IN ファイル CLOSE
  close (UID)

  ! 回帰曲線計算
  call calc_reg_curve_3d(x, y, a, b, c, d)
  print '(A, F12.8)', "a = ", a
  print '(A, F12.8)', "b = ", b
  print '(A, F12.8)', "c = ", c
  print '(A, F12.8)', "d = ", d

  ! 配列用メモリ解放
  deallocate(x)
  deallocate(y)
end program regression_curve_3d
{% endhighlight %}

* `x * x * x` を予め求めておいた `x * x` に `x` を乗じるようにするなど、乗算の効率化を図ってもよいだろう。（今回の程度なら、効率性はそれほど問題にならないだろうが）

* [Gist - Fortran 95 source code to calculate a simple regression curve.(3d)](https://gist.github.com/komasaru/ef3300e0649b2d921cb6c0c2fa9bc474 "Fortran 95 source code to calculate a simple regression curve.(3d)")

### 4. ソースコードのコンパイル

``` text
$ gfortran -o regression_curve_3d regression_curve_3d.f95
```

### 5. 動作確認

まず、以下のような入力ファイルを用意する。  
（先頭行：点の数、2行目以降：各点）

File: `input.txt`

{% highlight text linenos %}
10
107  286
336  851
233  589
 82  389
 61  158
378 1037
129  463
313  563
142  372
428 1020
{% endhighlight %}

そして、実行。

``` text
$ ./regression_curve_3d
説明変数 X = (  107.00  336.00  233.00   82.00   61.00  378.00  129.00  313.00  142.00  428.00)
目的変数 Y = (  286.00  851.00  589.00  389.00  158.00 1037.00  463.00  563.00  372.00 1020.00)
---
a =  37.38771427
b =   3.68116689
c =  -0.00953082
d =   0.00001548
```

### 6. 視覚的な確認

参考までに、上記スクリプトで使用した2変量の各点と作成された単回帰曲線を gnuplot で描画してみた。

![REGRESSION_CURVE_3D]({{site.baseurl}}/images/2019/08/11/REGRESSION_CURVE_3D.png "REGRESSION_CURVE_3D")

---

以上。

