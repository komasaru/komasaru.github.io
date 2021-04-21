---
layout   : single
title    : "Fortran - 重回帰分析・自由度調整済み決定係数の計算！"
published: true
date     : 2020-03-03 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

重回帰分析における自由度調整済み決定係数の計算を Fortran 95 で行ってみました。

前回、同じことを Ruby で Array クラスを拡張する方法で実装しています。

* [Ruby - 重回帰分析・自由度調整済み決定係数の計算！]({{site.baseurl}}/2020/02/29/ruby-adjusted-coefficient-of-determination "Ruby - 重回帰分析・自由度調整済み決定係数の計算！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (GFortran 9.2.0) でのコンパイルを想定。

### 1. 自由度調整済み決定係数について

決定係数は説明変数（独立変数）の数が増えるほど 1 に近づくという性質を持っている。そのため、説明変数の数が多い（重回帰分析）場合には、補正した**自由度調整済み決定係数（自由度修正済み決定係数）**を使う。

計算式は次のとおり。

$$
\begin{eqnarray*}
自由度調整済み決定係数 R^2_f = 1 - \frac{\frac{S_E}{N-p-1}}{\frac{S_{y^2}}{N-1}}
\end{eqnarray*}
$$

但し、

$$
\begin{eqnarray*}
標本値の変動 &=& \sum_{i=1}^{N}(y_i - \bar{y})^2 = S_{y^2} \\
残差の変動 &=& \sum_{i=1}^{N}(y_i - Y_i)^2 = S_E \\
p &:& 説明（独立）変数の個数 \\
N &:& データ数
\end{eqnarray*}
$$

* 通常（単回帰分析）の**決定係数**については、「[Ruby - 単回帰分析（線形回帰）の決定係数計算！ ]({{site.baseurl}}/2019/06/23/ruby-regression-coefficient-of-determination "Ruby - 単回帰分析（線形回帰）の決定係数計算！ ")」を参照。

### 2. ソースコードの作成

File: `adjusted_coefficient_of_determination.f95`

{% highlight fortran linenos %}
!****************************************************
! 重回帰分析（説明変数2個）決定係数計算
!
!   DATE          AUTHOR          VERSION
!   2019.12.18    mk-mode.com     1.00 新規作成
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
  public :: calc_reg_multi

contains
  ! 重回帰式計算
  ! * 説明変数2個限定
  !
  ! :param(in)  real(8) x(:, 2): 説明変数配列
  ! :param(in)  real(8)    y(:): 目的変数配列
  ! :param(out) real(8)       c: 定数
  ! :param(out) real(8)    v(2): 係数
  subroutine calc_reg_multi(x, y, c, v)
    implicit none
    real(DP), intent(in)  :: x(:, :), y(:)
    real(DP), intent(out) :: c, v(2)
    integer(SP) :: s_x1, s_x2, s_y
    real(DP)    :: sum_x1, sum_x1x1, sum_x1x2
    real(DP)    :: sum_x2, sum_x2x1, sum_x2x2
    real(DP)    :: sum_y, sum_x1y, sum_x2y
    real(DP)    :: mtx(3, 4)

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

    sum_x1   = sum(x(:, 1))
    sum_x2   = sum(x(:, 2))
    sum_x1x1 = sum(x(:, 1) * x(:, 1))
    sum_x1x2 = sum(x(:, 1) * x(:, 2))
    sum_x2x1 = sum_x1x2
    sum_x2x2 = sum(x(:, 2) * x(:, 2))
    sum_y    = sum(y)
    sum_x1y  = sum(x(:, 1) * y)
    sum_x2y  = sum(x(:, 2) * y)
    mtx(1, :) = (/real(s_x1, DP),   sum_x1,   sum_x2,   sum_y/)
    mtx(2, :) = (/        sum_x1, sum_x1x1, sum_x1x2, sum_x1y/)
    mtx(3, :) = (/        sum_x2, sum_x2x1, sum_x2x2, sum_x2y/)
    call gauss_e(3, mtx)
    c = mtx(1, 4)
    v = mtx(2:3, 4)
  end subroutine calc_reg_multi

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

program adjusted_coefficient_of_determination
  use const
  use comp
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  real(DP)      :: c, v(2)
  real(DP)      :: y_b, s_r, s_e, r_2
  integer(SP)   :: n, p, i
  character(20) :: f
  real(DP), allocatable :: x(:, :), y(:), y_e(:)

  ! IN ファイル OPEN
  open (UID, file = F_INP, status = "old")

  ! データ数読み込み
  read (UID, *) n

  ! 配列メモリ確保
  allocate(x(n, 2))
  allocate(y(n))
  allocate(y_e(n))

  ! データ読み込み
  do i = 1, n
    read (UID, *) x(i, :), y(i)
  end do
  write (f, '("(A, ", I0, "F8.2, A)")') n
  print f, "説明変数 X(1) = (", x(:, 1), ")"
  print f, "説明変数 X(2) = (", x(:, 2), ")"
  print f, "目的変数 Y    = (", y, ")"
  print '(A)', "---"

  ! IN ファイル CLOSE
  close (UID)

  ! 重回帰式
  call calc_reg_multi(x, y, c, v)
  print '(A, F12.8)', "    定数項 = ", c
  print '(A, F12.8)', "    係数-1 = ", v(1)
  print '(A, F12.8)', "    係数-2 = ", v(2)

  ! 自由度調整済み決定係数
  y_e = c + v(1) * x(:, 1) + v(2) * x(:, 2)   ! 推定値配列
  y_b = sum(y) / size(y)   ! 標本値 Y （目的変数）の平均
  p = size(x(1, :))
  n = size(y)
  s_r = sum((y - y_b)**2)  ! 推定値の変動
  s_e = sum((y - y_e)**2)  ! 残差の変動
  r_2 = 1.0_DP - (s_e / (n - p - 1)) / (s_r / (n - 1))
  print '(A)', "自由度調整済み決定係数"
  print '(A, F20.16)', "       R2f = ", r_2

  ! 配列メモリ解放
  deallocate(x)
  deallocate(y)
  deallocate(y_e)
end program adjusted_coefficient_of_determination
{% endhighlight %}

* [Gist - Fortran 95 source code to calculate an adjusted coefficent of determination for multiple regression.](https://gist.github.com/komasaru/8eb0f66097a0bbcd2dc4c0bad7d034b3 "Gist - Fortran 95 source code to calculate an adjusted coefficent of determination for multiple regression.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -Wall -O2 -o adjusted_coefficient_of_determination adjusted_coefficient_of_determination.f95
```

### 4. 動作確認

まず、以下のような入力ファイルを用意する。  
（先頭行：要素数、2行目以降：各要素(x1, x2, y）

File: `input.txt`

{% highlight text linenos %}
10
17.5 30 45
17.0 25 38
18.5 20 41
16.0 30 34
19.0 45 59
19.5 35 47
16.0 25 35
18.0 35 43
19.0 35 54
19.5 40 52
{% endhighlight %}

そして、実行。

``` text
$ ./adjusted_coefficient_of_determination
説明変数 X(1) = (   17.50   17.00   18.50   16.00   19.00   19.50   16.00   18.00   19.00   19.50)
説明変数 X(2) = (   30.00   25.00   20.00   30.00   45.00   35.00   25.00   35.00   35.00   40.00)
目的変数 Y    = (   45.00   38.00   41.00   34.00   59.00   47.00   35.00   43.00   54.00   52.00)
---
    定数項 = -34.71293084
    係数-1 =   3.46981263
    係数-2 =   0.53300948
自由度調整済み決定係数
       R2f =   0.8176337138681722
```

---

以上。

