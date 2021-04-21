---
layout   : single
title    : "Fortran - 2つの配列から単回帰曲線（2次回帰）計算(Ver.2)！"
published: true
date     : 2019-06-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で、数値からなる同サイズの配列2つを説明変数・目的変数とみなして単回帰曲線（2次回帰）を計算する方法についての記録です。  
※今回は連立1次方程式を解くのに「ガウスの消去」を使用。

前回は連立1次方程式を解くのに分散／共分散を使用する方法（実際にはその変形版）を使用しました。

* [Fortran - 2つの配列から単回帰曲線（2次回帰）計算！]({{site.baseurl}}/2019/06/17/fortran95-regression-curve "Fortran - 2つの配列から単回帰曲線（2次回帰）計算！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [Ruby - Array クラス拡張で単回帰曲線計算(Ver.2)！]({{site.baseurl}}/2019/06/11/ruby-simple-linear-regression-curve-v2 "Ruby - Array クラス拡張で単回帰曲線計算(Ver.2)！")

### 2. ソースコードの作成

File: `regression_curve_2.f95`

{% highlight fortran linenos %}
!****************************************************
! 単回帰曲線（2次回帰）計算
! : y = a + b * x + c * x^2
! : 連立方程式を ガウスの消去法で解く方法
!
!   date          name            version
!   2019.03.17    mk-mode.com     1.00 新規作成
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
  public :: calc_reg_curve

contains
  ! 単回帰曲線（2次回帰）計算
  !
  ! :param(in)  real(8) x(:): 説明変数配列
  ! :param(in)  real(8) y(:): 目的変数配列
  ! :param(out) real(8)    a: 係数 a
  ! :param(out) real(8)    b: 係数 b
  ! :param(out) real(8)    b: 係数 c
  subroutine calc_reg_curve(x, y, a, b, c)
    implicit none
    real(DP), intent(in)  :: x(:), y(:)
    real(DP), intent(out) :: a, b, c
    integer(SP) :: size_x, size_y, i
    real(DP)    :: sum_x, sum_x2, sum_x3, sum_x4
    real(DP)    :: sum_y, sum_xy, sum_x2y
    real(DP)    :: mtx(3, 4)

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
    sum_y   = sum(y)
    sum_xy  = sum(x * y)
    sum_x2y = sum(x * x * y)
    mtx(1, :) = (/real(size_x, DP),  sum_x, sum_x2,   sum_y/)
    mtx(2, :) = (/           sum_x, sum_x2, sum_x3,  sum_xy/)
    mtx(3, :) = (/          sum_x2, sum_x3, sum_x4, sum_x2y/)
    call solve_ge(3, mtx)
    a = mtx(1, 4)
    b = mtx(2, 4)
    c = mtx(3, 4)
  end subroutine calc_reg_curve

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

program regression_curve
  use const
  use comp
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  real(DP)      :: a, b, c
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
  call calc_reg_curve(x, y, a, b, c)
  print '(A, F12.8)', "a = ", a
  print '(A, F12.8)', "b = ", b
  print '(A, F12.8)', "c = ", c

  ! 配列用メモリ解放
  deallocate(x)
  deallocate(y)
end program regression_curve
{% endhighlight %}

* [Gist - Fortran 95 source code to compute a simple regression curve(2d)(ver.2).](https://gist.github.com/komasaru/cbeb08b2b13854ea87b8bcc93998ec39 "Gist - Fortran 95 source code to compute a simple regression curve(2d)(ver.2).")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o regression_curve_2 regression_curve_2.f95
```

### 4. 動作確認

まず、以下のような入力ファイルを用意する。  
（先頭行：点の数、2行目以降：各点）

File: `input.txt`

{% highlight text linenos %}
14
83 183
71 168
64 171
69 178
69 176
64 172
68 165
59 158
81 183
91 182
57 163
65 175
58 164
62 175
{% endhighlight %}

そして、実行。

``` text
$ ./regression_curve_2
説明変数 X = (   83.00   71.00   64.00   69.00   69.00   64.00   68.00   59.00   81.00   91.00   57.00   65.00   58.00   62.00)
目的変数 Y = (  183.00  168.00  171.00  178.00  176.00  172.00  165.00  158.00  183.00  182.00  163.00  175.00  164.00  175.00)
---
a =  41.37453964
b =   3.08672320
c =  -0.01683565
```

[前回記事]({{site.baseurl}}/2019/06/20/fortran95-regression-curve "Fortran - 2つの配列から単回帰曲線（2次回帰）計算！")の結果と同じになることが確認できる。

参考までに、上記スクリプトで使用した2変量の各点と作成された回帰曲線を gnuplot で描画してみた。

![REGRESSION_CURVE_2]({{site.baseurl}}/images/2019/06/20/REGRESSION_CURVE_2.png "REGRESSION_CURVE_2")

---

以上。

