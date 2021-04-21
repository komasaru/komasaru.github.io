---
layout   : single
title    : "Fortran - 2つの配列から単回帰直線計算(Ver.2)！"
published: true
date     : 2019-06-14 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、数値からなる同サイズの配列2つを説明変数・目的変数とみなして単回帰直線を計算する方法についての記録です。

今回は連立1次方程式を解くのに「ガウスの消去」を使用します。  
過去にも行いましたが、その際は連立1次方程式を解くのに分散／共分散を使用する方法（実際にはその変形版）を使用しました。

* [Fortran - 2 つの配列から単回帰直線計算！]({{site.baseurl}}/2019/04/02/fortran95-regression-line "Fortran - 2 つの配列から単回帰直線計算！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. ガウスの消去法による連立1次方程式の解法について

当ブログ過去記事を参照。

* [C++ - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/24/cpp-simultaneous-equation-by-gauss-elimination "C++ - 連立方程式解法（ガウスの消去法）！")
* [Ruby - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！")
* [Python - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2018/04/13/python-simultaneous-equations-with-gauss-elimination "Python - 連立方程式解法（ガウスの消去法）！")
* [Fortran - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2019/02/26/fortran95/simultaneous-equations-by-gauss-elimination "Fortran - 連立方程式解法（ガウスの消去法）！")

### 2. ソースコードの作成

File: `regression_line_2.f95`

{% highlight fortran linenos %}
!****************************************************
! 単回帰直線計算
! : y = a + b * x
! : 連立方程式を ガウスの消去法で解く方法
!
!   date          name            version
!   2018.12.18    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
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
  public :: calc_reg_line

contains
  ! 単回帰直線計算
  !
  ! :param(in)  real(8) x(:): 説明変数配列
  ! :param(in)  real(8) y(:): 目的変数配列
  ! :param(out) real(8)    a: 切片
  ! :param(out) real(8)    b: 傾き
  subroutine calc_reg_line(x, y, a, b)
    implicit none
    real(DP), intent(in)  :: x(:), y(:)
    real(DP), intent(out) :: a, b
    integer(SP) :: size_x, size_y, i, n
    real(DP)    :: sum_x, sum_y, sum_xx, sum_xy
    real(DP)    :: mtx(2, 3)

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

    sum_x  = sum(x)
    sum_y  = sum(y)
    sum_xx = sum(x * x)
    sum_xy = sum(x * y)
    mtx(1, :) = (/real(size_x, DP),  sum_x,  sum_y/)
    mtx(2, :) = (/           sum_x, sum_xx, sum_xy/)
    call solve_ge(2, mtx)
    a = mtx(1, 3)
    b = mtx(2, 3)
  end subroutine calc_reg_line

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

program regression_line
  use const
  use comp
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  real(DP)      :: a, b
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

  ! 回帰直線計算
  call calc_reg_line(x, y, a, b)
  print '(A, F12.8)', "切片 a = ", a
  print '(A, F12.8)', "傾き b = ", b

  ! 配列用メモリ解放
  deallocate(x)
  deallocate(y)
end program regression_line
{% endhighlight %}

* [Gist - Fortran 95 source code to calculate a simple linear regression line.(Ver.2)](https://gist.github.com/komasaru/48ec60d2baeb8bcdbf4c6da2cebe5590 "Fortran 95 source code to calculate a simple linear regression line.(Ver.2)")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o regression_line_2 regression_line_2.f95
```

### 4. 動作確認

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
$ ./regression_line_2
説明変数 X = (  107.00  336.00  233.00   82.00   61.00  378.00  129.00  313.00  142.00  428.00)
目的変数 Y = (  286.00  851.00  589.00  389.00  158.00 1037.00  463.00  563.00  372.00 1020.00)
---
切片 a =  99.07475877
傾き b =   2.14452350
```

参考までに、上記で使用した2変量の各点と作成された単回帰直線を gnuplot で描画してみた。

![REGRESSION_LINE_2]({{site.baseurl}}/images/2019/06/14/REGRESSION_LINE_2.png "REGRESSION_LINE_2")

---

以上。

