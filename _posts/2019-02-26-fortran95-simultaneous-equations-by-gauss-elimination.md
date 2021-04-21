---
layout   : single
title    : "Fortran - 連立方程式解法（ガウスの消去法）！"
published: true
date     : 2019-02-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で「ガウスの消去法」による連立方程式の解法を実装する方法についてです。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/24/cpp-simultaneous-equation-by-gauss-elimination "C++ - 連立方程式解法（ガウスの消去法）！")
* [Ruby - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2013/09/25/ruby-simultaneous-equation-by-gauss-elimination "Ruby - 連立方程式解法（ガウスの消去法）！")
* [Python - 連立方程式解法（ガウスの消去法）！]({{site.baseurl}}/2018/04/13/python-simultaneous-equations-with-gauss-elimination "Python - 連立方程式解法（ガウスの消去法）！")

### 2. ソースコードの作成

File: `gauss_elimination.f95`

{% highlight fortran linenos %}
!************************************************************
! Simultaneous equations solving by Gauss-Elimination method
!
!   date          name            version
!   2018.12.05    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!************************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module const

module gauss_elimination
  use const
  implicit none
  private
  public :: solve

contains
  ! 連立方程式を解く
  !
  ! :param(in)    integer(4)     n: 元数
  ! :param(inout) real(8) a(n,n+1): 係数配列
  subroutine solve(n, a)
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
  end subroutine solve
end module gauss_elimination

program simultaneous_equations
  use const
  use gauss_elimination
  implicit none
  integer(SP)   :: n, i            ! 元数、ループインデックス
  character(20) :: f               ! 書式文字列
  real(DP), allocatable :: a(:,:)  ! 係数配列

  ! 元数取得
  write (*, '(A)', advance="no") "n ? "
  read (*, *) n

  ! 配列メモリ確保
  allocate(a(n, n + 1))

  ! 係数取得
  do i = 1, n
    write (*, '("row(", I0, ",1:", I0, ") ? ")', advance="no") i, n + 1
    read (*, *) a(i,:)
  end do
  write (*, '(/A)') "Coefficients:"
  write (f, '("(", I0, "(F8.2, 2X)", ")")') n + 1
  do i = 1, n
    write (*, f) a(i,:)
  end do

  ! 連立方程式を解く
  ! (計算後 a の最右列が解)
  call solve(n, a)

  ! 結果出力
  write (*, '(A)') "Answer:"
  write (f, '("(", I0, "(F8.2, 2X)", ")")') n
  write (*, f) a(:, n + 1)

  ! 配列メモリ解放
  deallocate(a)
end program simultaneous_equations
{% endhighlight %}

* [Gist - Fortran 95 source code to solve simultaneous equations by Gauss elimination method.](https://gist.github.com/komasaru/2d1b700b7dec4087736f8dfee348d347 "Gist - Fortran 95 source code to solve simultaneous equations by Gauss elimination method.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o gauss_elimination gauss_elimination.f95
```

### 4. 動作確認

実行すると、元の数を問われるので入力し、エンター。  
そして、1行ずつ係数（元数分）＋定数をスペースで区切って入力してエンター。

``` text
$ ./gauss_elimination
n ? 3
row(1,1:4) ? 2 -3 1 5
row(2,1:4) ? 1 1 -1 2
row(3,1:4) ? 3 5 -7 0

Coefficients:
    2.00     -3.00      1.00      5.00
    1.00      1.00     -1.00      2.00
    3.00      5.00     -7.00      0.00
Answer:
    3.00      1.00      2.00
```

---

以上、

