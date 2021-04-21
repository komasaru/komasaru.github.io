---
layout   : single
title    : "Fortran - 2 つの配列から重回帰分析（2次多項式モデル）！"
published: true
date     : 2019-09-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

過去に、説明（独立）変数2個、目的（従属）変数１個の「重回帰式」の計算を Fortran 95 で実装しました。

* [Fortran - 2 つの配列から重回帰式計算！]({{site.baseurl}}/2019/04/05/fortran95-multiple-regression-equation "Fortran - 2 つの配列から重回帰式計算！")

今回は、重回帰式を2次多項式にしてみました。

前回、同じことを Ruby で Array クラスを拡張する方法で実装しています。

* [Ruby - Array クラスを拡張して重回帰分析（2次多項式モデル）！]({{site.baseurl}}/2019/09/14/ruby-multiple-regression-function-2d "Ruby - Array クラスを拡張して重回帰分析（2次多項式モデル）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. 重回帰式（2次多項式モデル）の求め方

求める重回帰式を $$y=b_0+b_1x_1+b_2x_2+b_3x_1x_2+b_4{x_1}^2+b_5{x_2}^2$$ （説明変数が2個）とする場合、 $$x_3=x_1x_2,\  x_4={x_1}^2,\ x_5={x_2}^2$$ と置くと、 $$y=b_0+b_1x_1+b_2x_2+b_3x_3+b_4x_4+b_5x_5$$ （説明変数が5個）となるので、残差の二乗和 $$S$$ は

$$
\begin{eqnarray*}
S = \sum(y_i - b_0 - b_1x_{1i} - b_2x_{2i} - b_3x_{3i} - b_4x_{4i} - b_5x_{5i})^2
\end{eqnarray*}
$$

となる。 $$\displaystyle \left(\sum は \sum_{i=1}^{N}\right)$$

$$b_0,\cdots,b_5$$ それぞれで偏微分したものを $$0$$ とする。

$$
\begin{eqnarray*}
\frac{\partial S}{\partial b_0} &=& 2\sum(b_0+b_1x_{1i}+b_2x_{2i}+b_3x_{3i}+b_4x_{4i}+b_5x_{5i} - y_i) = 0 \\
\frac{\partial S}{\partial b_1} &=& 2\sum(b_0x_{1i}+b_1{x_{1i}}^2+b_2x_{1i}x_{2i}+b_3x_{1i}x_{3i}+b_4x_{1i}x_{4i}+b_5x_{1i}x_{5i} - x_{1i}y_i) = 0 \\
\frac{\partial S}{\partial b_2} &=& 2\sum(b_0x_{2i}+b_1x_{1i}x_{2i}+b_2{x_{2i}}^2+b_3x_{2i}x_{3i}+b_4x_{2i}x_{4i}+b_5x_{2i}x_{5i} - x_{2i}y_i) = 0 \\
\frac{\partial S}{\partial b_3} &=& 2\sum(b_0x_{3i}+b_1x_{1i}x_{3i}+b_2x_{2i}x_{3i}+b_3{x_{3i}}^2+b_4x_{3i}x_{4i}+b_5x_{3i}x_{5i} - x_{3i}y_i) = 0 \\
\frac{\partial S}{\partial b_4} &=& 2\sum(b_0x_{4i}+b_1x_{1i}x_{4i}+b_2x_{2i}x_{4i}+b_3x_{3i}x_{4i}+b_4{x_{4i}}^2+b_5x_{4i}x_{5i} - x_{4i}y_i) = 0 \\
\frac{\partial S}{\partial b_5} &=& 2\sum(b_0x_{5i}+b_1x_{1i}x_{5i}+b_2x_{2i}x_{5i}+b_3x_{3i}x_{5i}+b_4x_{4i}x_{5i}+b_5{x_{5i}}^2 - x_{5i}y_i) = 0
\end{eqnarray*}
$$

これらを変形すると、

$$
\begin{eqnarray*}
b_0N + b_1\sum x_{1i} + b_2\sum x_{2i} + b_3\sum x_{3i} + b_4\sum x_{4i} + b_5\sum x_{5i} &=& \sum y_i \\
b_0\sum x_{1i}+b_1\sum {x_{1i}}^2+b_2\sum x_{1i}x_{2i}+b_3\sum x_{1i}x_{3i}+b_4\sum x_{1i}x_{4i}+b_5\sum x_{1i}x_{5i} &=& \sum x_{1i}y_i \\
b_0\sum x_{2i}+b_1\sum x_{1i}x_{2i}+b_2\sum {x_{2i}}^2+b_3\sum x_{2i}x_{3i}+b_4\sum x_{2i}x_{4i}+b_5\sum x_{2i}x_{5i} &=& \sum x_{2i}y_i \\
b_0\sum x_{3i}+b_1\sum x_{1i}x_{3i}+b_2\sum x_{2i}x_{3i}+b_3\sum {x_{3i}}^2+b_4\sum x_{3i}x_{4i}+b_5\sum x_{3i}x_{5i} &=& \sum x_{3i}y_i \\
b_0\sum x_{4i}+b_1\sum x_{1i}x_{4i}+b_2\sum x_{2i}x_{4i}+b_3\sum x_{3i}x_{4i}+b_4\sum {x_{4i}}^2+b_5\sum x_{4i}x_{5i} &=& \sum x_{4i}y_i \\
b_0\sum x_{5i}+b_1\sum x_{1i}x_{5i}+b_2\sum x_{2i}x_{5i}+b_3\sum x_{3i}x_{5i}+b_4\sum x_{4i}x_{5i}+b_5\sum {x_{5i}}^2 &=& \sum x_{5i}y_i \\
(但し、x_3=x_1x_2,\  x_4={x_1}^2,\ x_5={x_2}^2)
\end{eqnarray*}
$$

となる。これらの $$b_0,\cdots,b_5$$ の連立1次方程式を解けばよい。  
※$$x_3=x_1x_2,\  x_4={x_1}^2,\ x_5={x_2}^2$$ と置かず、直接計算してもよいが、偏微分や連立方程式が分かりにくくなる。

### 2. ガウスの消去法による連立方程式の解法について

当ブログ過去記事を参照。

* [Ruby - 連立方程式解法（ガウスの消去法）！ ]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！ ")

### 3. ソースコードの作成

File: `regression_multi_2d.f95`

{% highlight fortran linenos %}
!****************************************************
! 重回帰式計算（説明（独立）変数2個、2次多項式モデル）
! * y = b0 + b1x1 + b2x2 + b3x1x2 + b4x1^2 + b5x2^2
! * y = b0 + b1x1 + b2x2 + b3x3 + b4x4 + b5x5
!   (x3 = x1x2, x4 = x1^2, x5 = x2^2)
!   ということ。
!
!   date          name            version
!   2019.06.27    mk-mode.com     1.00 新規作成
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
  public :: calc_reg_multi_2d

contains
  ! 重回帰式計算
  ! * 説明変数2個、2次多項式モデル
  ! * y = b0 + b1x1 + b2x2 + b3x1x2 + b4x1^2 + b5x2^2
  ! * y = b0 + b1x1 + b2x2 + b3x3 + b4x4 + b5x5
  !   (x3 = x1x2, x4 = x1^2, x5 = x2^2)
  !
  ! :param(in)  real(8) x(:, 2): 説明変数配列
  ! :param(in)  real(8)    y(:): 目的変数配列
  ! :param(out) real(8)       c: 定数
  ! :param(out) real(8)    v(5): 係数
  subroutine calc_reg_multi_2d(x, y, c, v)
    implicit none
    real(DP), intent(in)  :: x(:, :), y(:)
    real(DP), intent(out) :: c, v(5)
    integer(SP) :: s_x1, s_x2, s_y
    real(DP)    :: mtx(6, 7)
    real(DP), allocatable :: x1(:), x2(:), x3(:), x4(:), x5(:)

    s_x1 = size(x(:, 1))
    s_x2 = size(x(:, 2))
    s_y  = size(y)
    if (s_x1 == 0 .or. s_x2 == 0 .or. s_y == 0) then
      print *, "[ERROR] array size == 0"
      stop
    end if
    if (s_x1 /= s_y .or. s_x2 /= s_y) then
      print *, "[ERROR] size(X) != size(Y)"
      stop
    end if
    allocate(x1(s_x1))
    allocate(x2(s_x1))
    allocate(x3(s_x1))
    allocate(x4(s_x1))
    allocate(x5(s_x1))

    x1 = x(:, 1)
    x2 = x(:, 2)
    x3 = x1 * x2
    x4 = x1 * x1
    x5 = x2 * x2
    ! 左辺・対角成分
    mtx(1, 1) = s_x1
    mtx(2, 2) = sum(x1 * x1)
    mtx(3, 3) = sum(x2 * x2)
    mtx(4, 4) = sum(x3 * x3)
    mtx(5, 5) = sum(x4 * x4)
    mtx(6, 6) = sum(x5 * x5)
    ! 左辺・右上成分
    mtx(1, 2) = sum(x1)
    mtx(1, 3) = sum(x2)
    mtx(1, 4) = sum(x3)
    mtx(1, 5) = sum(x4)
    mtx(1, 6) = sum(x5)
    mtx(2, 3) = sum(x1 * x2)
    mtx(2, 4) = sum(x1 * x3)
    mtx(2, 5) = sum(x1 * x4)
    mtx(2, 6) = sum(x1 * x5)
    mtx(3, 4) = sum(x2 * x3)
    mtx(3, 5) = sum(x2 * x4)
    mtx(3, 6) = sum(x2 * x5)
    mtx(4, 5) = sum(x3 * x4)
    mtx(4, 6) = sum(x3 * x5)
    mtx(5, 6) = sum(x4 * x5)
    ! 左辺・左下成分
    mtx(2, 1) = mtx(1, 2)
    mtx(3, 1) = mtx(1, 3)
    mtx(3, 2) = mtx(2, 3)
    mtx(4, 1) = mtx(1, 4)
    mtx(4, 2) = mtx(2, 4)
    mtx(4, 3) = mtx(3, 4)
    mtx(5, 1) = mtx(1, 5)
    mtx(5, 2) = mtx(2, 5)
    mtx(5, 3) = mtx(3, 5)
    mtx(5, 4) = mtx(4, 5)
    mtx(6, 1) = mtx(1, 6)
    mtx(6, 2) = mtx(2, 6)
    mtx(6, 3) = mtx(3, 6)
    mtx(6, 4) = mtx(4, 6)
    mtx(6, 5) = mtx(5, 6)
    ! 右辺
    mtx(1, 7) = sum(     y)
    mtx(2, 7) = sum(x1 * y)
    mtx(3, 7) = sum(x2 * y)
    mtx(4, 7) = sum(x3 * y)
    mtx(5, 7) = sum(x4 * y)
    mtx(6, 7) = sum(x5 * y)
    deallocate(x1)
    deallocate(x2)
    deallocate(x3)
    deallocate(x4)
    deallocate(x5)
    call gauss_e(6, mtx)
    c = mtx(1, 7)
    v = mtx(2:6, 7)
  end subroutine calc_reg_multi_2d

  ! Gaussian elimination
  !
  ! :param(in)    integer(4)     n: 元数
  ! :param(inout) real(8) a(n,n+1): 係数配列
  subroutine gauss_e(n, a)
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
  end subroutine gauss_e
end module comp

program regression_multi_2d
  use const
  use comp
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  real(DP)    :: c, v(5)
  integer(SP) :: n, i
  character(20) :: f
  real(DP), allocatable :: x(:, :), y(:)

  ! IN ファイル OPEN
  open (UID, file = F_INP, status = "old")

  ! データ数読み込み
  read (UID, *) n

  ! 配列用メモリ確保
  allocate(x(n, 2))
  allocate(y(n))

  ! データ読み込み
  do i = 1, n
    read (UID, *) x(i, :), y(i)
  end do
  write (f, '("(A, ", I0, "F8.2, A)")') n
  print f, "説明変数 X(1) = (", x(:, 1), ")"
  print f, "説明変数 X(2) = (", x(:, 2), ")"
  print f, "目的変数    Y = (", y, ")"
  print '(A)', "---"

  ! IN ファイル CLOSE
  close (UID)

  call calc_reg_multi_2d(x, y, c, v)
  print '(A, F14.8)', "定数項 = ", c
  print '(A, F14.8)', "係数-1 = ", v(1)
  print '(A, F14.8)', "係数-2 = ", v(2)
  print '(A, F14.8)', "係数-3 = ", v(3)
  print '(A, F14.8)', "係数-4 = ", v(4)
  print '(A, F14.8)', "係数-5 = ", v(5)

  ! 配列用メモリ解放
  deallocate(x)
  deallocate(y)
end program regression_multi_2d
{% endhighlight %}

* [Gist - Fortran 95 source code to compute multiple regression equations.(2d)](https://gist.github.com/komasaru/1a21421eaf0502c096940819295ee1e0 "Fortran 95 source code to compute multiple regression equations.(2d)")

### 4. ソースコードのコンパイル

$ gfortran -o regression_multi_2d regression_multi_2d.f95

### 5. 動作確認

まず、以下のような入力ファイルを用意する。  
（先頭行：点の数、2行目以降：各点）

File: `input.txt`

{% highlight text linenos %}
10
17.50 30.00 45.00
17.00 25.00 38.00
18.50 20.00 41.00
16.00 30.00 34.00
19.00 45.00 59.00
19.50 35.00 47.00
16.00 25.00 35.00
18.00 35.00 43.00
19.00 35.00 54.00
19.50 40.00 52.00
{% endhighlight %}

そして、実行。

``` text
$ ./regression_multi_2d
説明変数 X(1) = (   17.50   17.00   18.50   16.00   19.00   19.50   16.00  18.00   19.00   19.50)
説明変数 X(2) = (   30.00   25.00   20.00   30.00   45.00   35.00   25.00  35.00   35.00   40.00)
目的変数    Y = (   45.00   38.00   41.00   34.00   59.00   47.00   35.00  43.00   54.00   52.00)
---
定数項 =  -333.90329860
係数-1 =    45.88441700
係数-2 =    -4.17606547
係数-3 =     0.21073633
係数-4 =    -1.38455510
係数-5 =     0.01371027
```

* [Ruby 版]({{site.baseurl}}/2019/09/14/ruby-multiple-regression-function-2d "Ruby - Array クラスを拡張して重回帰分析（2次多項式モデル）！")と答えが一致することも確認。

### 6. 視覚的な確認

参考までに、上記スクリプトで使用した2変量の各点と作成された単回帰曲線を gnuplot で描画してみた。

![REGRESSION_MULTI_2D]({{site.baseurl}}/images/2019/09/17/REGRESSION_MULTI_2D.png "REGRESSION_MULTI_2D")

* [Ruby 版]({{site.baseurl}}/2019/09/14/ruby-multiple-regression-function-2d "Ruby - Array クラスを拡張して重回帰分析（2次多項式モデル）！")とグラフが一致することも確認。

---

以上。

