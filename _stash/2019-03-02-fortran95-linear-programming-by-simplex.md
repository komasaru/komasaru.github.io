---
layout   : single
title    : "Fortran - 線形計画法（シンプレックス法）！"
published: true
date     : 2019-03-02 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で線形計画法を「シンプレックス法」で解くアルゴリズムを実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2014/02/21/cpp-linear-programming-by-simplex "C++ - 線形計画法（シンプレックス法）！")
* [Ruby - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2014/02/22/ruby-linear-programming-simplex "Ruby - 線形計画法（シンプレックス法）！")
* [Python - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2018/04/16/python-linear-programming-with-simplex "Python - 線形計画法（シンプレックス法）！")

### 2. ソースコードの作成

File: `simplex.f95`

{% highlight fortran linenos %}
!****************************************************
! 線形計画法（シンプレックス法）
!
! * 入力はテキストファイルをパイプ処理
!     1行目:     行数  列数  変数の数
!     2行目以降: 1行に列数分の係数 * 行数
!
!   date          name            version
!   2018.12.05    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module const

module simplex
  use const
  implicit none
  private
  public :: solve

contains
  ! 線形計画法
  !
  ! :param(in)    integer(4)       n_row: 元数
  ! :param(in)    integer(4)       n_col: 元数
  ! :param(inout) real(8) a(n_row,n_col): 係数配列
  subroutine solve(n_row, n_col, a)
    implicit none
    integer(SP), intent(in)    :: n_row, n_col
    real(DP),    intent(inout) :: a(n_row, n_col)
    integer(SP) :: x, y              ! 最小値の行・列インデックス
    real(DP)    :: c_min             ! 最小値
    real(DP)    :: a_tmp(n_row - 1)  ! 作業用配列
    integer(SP) :: i, j
    real(DP)    :: d

    do
      ! 列選択
      c_min = minval(a(n_row, :))
      y = minloc(a(n_row, :), 1)
      if (c_min >= 0.0_DP) exit

      ! 行選択
      a_tmp = a(1:n_row-1,n_col) / a(1:n_row-1, y)
      x = minloc(a_tmp, 1)

      ! ピボット係数を p で除算
      a(x, :) = a(x, :) / a(x, y)

      ! ピボット列の掃き出し
      do i = 1, n_row
        if (i == x) cycle
        d = a(i, y)
        a(i, :) = a(i, :) - d * a(x, :)
      end do
    end do
  end subroutine solve
end module simplex

program linear_programming
  use const
  use simplex
  implicit none
  integer(SP) :: n_row, n_col, n_var  ! 行数、列数、変数の数
  real(DP), allocatable :: a(:, :)    ! 係数行列
  character(20) :: f                  ! 書式文字列
  integer(SP)   :: i, j, flag
  real(DP)      :: v

  ! 行数、列数、変数の数の取得
  read (*, *) n_row, n_col, n_var
  print '(A)', "Number:"
  print '("  rows      = ", I0)', n_row
  print '("  colmuns   = ", I0)', n_col
  print '("  variables = ", I0)', n_var

  ! 係数行列メモリ確保
  allocate(a(n_row, n_col))

  ! 係数行列読み込み
  do i = 1, n_row
    read (*, *) a(i, :)
  end do
  print '(A)', "Coefficients:"
  write (f, '("(", I0, "(F8.4, 2X)", ")")') n_col
  print f, a(1:n_row, :)

  ! 線形計画法で解く
  call solve(n_row, n_col, a)

  ! 結果出力
  print '(A)', "Answer:"
  do j = 1, n_var
    flag = -1
    do i = 1, n_row
      if (a(i, j) == 1.0_DP) flag = i
    end do
    if (flag == -1) then
      v = 0.0_DP
    else
      v = a(flag, n_col)
    end if
    print '("  x", I0, " = ", F8.4)', j, v
  end do
  print '("  z  = ", F8.4)', a(n_row, n_col)

  ! 係数行列メモリ解放
  deallocate(a)
end program linear_programming
{% endhighlight %}

* [Gist - Fortran 95 source code to solve a linear programming by simplex method.](https://gist.github.com/komasaru/bd25c819ee408906d2f8b7f47d9a5eeb "Gist - Fortran 95 source code to solve a linear programming by simplex method.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o simplex simplex.f95
```

### 4. 動作確認

今回のプログラムはデータファイルを読み込んで実行する形式としているので、あらかじめデータファイルを作成しておく。（実行後に手入力してもよいが）  
※1行目：行数、列数、変数の数、2行目以降：係数・定数（「[C++ - 線形計画法（シンプレックス法）！]({{site.baseurl}}/2014/02/21/cpp-linear-programming-by-simplex "C++ - 線形計画法（シンプレックス法）！")」参照）

File: `data.txt`

{% highlight text linenos %}
4 6 2
 1.0  2.0  1.0  0.0  0.0 14.0
 1.0  1.0  0.0  1.0  0.0  8.0
 3.0  1.0  0.0  0.0  1.0 18.0
-2.0 -3.0  0.0  0.0  0.0  0.0
{% endhighlight %}

そして、実行。

``` text
$ cat data.txt | ./simplex
Number:
  rows      = 4
  colmuns   = 6
  variables = 2
Coefficients:
  1.0000    2.0000    1.0000    0.0000    0.0000   14.0000
  1.0000    1.0000    0.0000    1.0000    0.0000    8.0000
  3.0000    1.0000    0.0000    0.0000    1.0000   18.0000
 -2.0000   -3.0000    0.0000    0.0000    0.0000    0.0000
Answer:
  x1 =   2.0000
  x2 =   6.0000
  z  =  22.0000
```

以下のように実行しても同じ。

``` text
$ ./simplex < data.txt
```

---

以上。

