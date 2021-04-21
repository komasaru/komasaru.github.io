---
layout   : single
title    : "Fortran - 行列式の計算（余因子展開による）！"
published: true
date     : 2020-03-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で余因子展開による行列式の計算を行ってみました。

少し前に、同じことを Ruby で Array クラスを拡張する方法で実装しています。

* [Ruby - 行列式の計算（余因子展開による）！]({{site.baseurl}}/2020/03/06/ruby-determinant-by-cofactor-expansion "Ruby - 行列式の計算（余因子展開による）！")

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (GFortran 9.2.0) でのコンパイルを想定。

### 1. 行列式の余因子展開について

$$n(>1)$$ 次正方行列 $$A=(a _ {ij})$$ から第 $$i$$ 行と第 $$j$$ 列の成分をすべて取り除いて得られる $$n-1$$ 次行列の行列式に、 $$(-1)^{i+j}$$ を掛けたものを $$a _ {ij}$$ の **余因子** といい、 $$\tilde{A} _ {ij}$$ で表す。すなわち、

$$
\begin{eqnarray}
\tilde{A}_{ij}=(-1)^{i+j}\left|
\begin{array}{cccccc}
a_{11} & \cdots & a_{1\ j-1} & a_{1\ j+1} & \cdots & a_{1n} \\
\vdots & & \vdots & \vdots & & \vdots \\
a_{i-1\ 1} & \cdots & a_{i-1\ j-1} & a_{i-1\ j+1} & \cdots & a_{i-1\ n} \\
a_{i+1\ 1} & \cdots & a_{i+1\ j-1} & a_{i+1\ j+1} & \cdots & a_{i+1\ n} \\
\vdots & & \vdots & \vdots & & \vdots \\
a_{n1} & \cdots & a_{n\ j-1} & a_{n\ j+1} & \cdots & a_{nn} \\
\end{array}
\right|
\end{eqnarray}
$$

そして、次の定理が成り立つ。（証明略）

【定理】 $$n$$ 次正方行列 $$A=(a _ {ij})$$ に対して、

$$
\begin{eqnarray}
|A| &=& a_{i1}\tilde{A}_{i1} + a_{i2}\tilde{A}_{i2} + \cdots + a_{in}\tilde{A}_{in}\ \ (1<i\le n) \\
|A| &=& a_{1j}\tilde{A}_{1j} + a_{2j}\tilde{A}_{2j} + \cdots + a_{nj}\tilde{A}_{nj}\ \ (1<j\le n)
\end{eqnarray}
$$

(2)を行列式｜A｜の $$i$$ 行についての **余因子展開**、(3)を行列式｜A｜の $$j$$ 列についての **余因子展開** という。（余因子展開は、ラプラス展開や単に展開と呼ばれることもある）

### 2. ソースコードの作成

File: `determinant.f95`

{% highlight fortran linenos %}
!****************************************************
! 行列式の計算（余因子展開）
!
!   DATE          AUTHOR          VERSION
!   2019.12.23    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2013 mk-mode.com All Rights Reserved.
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
  public :: det

contains
  ! 行列式計算
  ! * 再帰的
  !
  ! :param(in) real(8) m(:, :): 行列
  ! :return    real(8)       d: 行列式
  recursive real(DP) function det(m)
    implicit none
    real(DP), intent(in) :: m(:, :)
    integer(SP) :: j, n

    det = 0.0_DP
    n = size(m(1, :))
    select case(n)
    case (1)
      det = m(1, 1)
    case (2)
      det = m(1, 1) * m(2, 2) &
        & - m(1, 2) * m(2, 1)
    case (3)
      det = m(1, 1) * m(2, 2) * m(3, 3) &
        & + m(1, 2) * m(2, 3) * m(3, 1) &
        & + m(1, 3) * m(2, 1) * m(3, 2) &
        & - m(1, 1) * m(2, 3) * m(3, 2) &
        & - m(1, 2) * m(2, 1) * m(3, 3) &
        & - m(1, 3) * m(2, 2) * m(3, 1)
    case (4:)
      det = 0
      do j = 1, n
        det = det + m(1, j) * cof(m, 1, j)
      end do
    end select
  end function det

  ! 余因子（正方行列 A の (i, j) に対する）
  !
  ! :param(in)   m: 行列配列
  ! :param(in)   i: 行インデックス
  ! :param(in)   j: 列インデックス
  ! :param(out)  c: 余因子
  real(DP) function cof(m, i, j)
    implicit none
    real(DP),    intent(in) :: m(:, :)
    integer(SP), intent(in) :: i, j
    integer(SP) :: n
    real(DP), allocatable :: m2(:, :)

    n = size(m(1, :))
    allocate(m2(n - 1, n - 1))
    m2(1:i-1, 1:j-1) = m(1:i-1, 1:j-1)
    m2(1:i-1, j:n  ) = m(1:i-1, j+1:n)
    m2(i:n  , 1:j-1) = m(i+1:n, 1:j-1)
    m2(i:n  , j:n  ) = m(i+1:n, j+1:n)
    cof = (-1)**(i+j) * det(m2)
    deallocate(m2)
  end function cof
end module comp

program determinant
  use const
  use comp
  implicit none
  integer(SP) :: n, i
  real(DP)    :: d
  real(DP), allocatable :: m(:, :)

  ! データ数読み込み
  read (*, *) n

  ! 配列用メモリ確保
  allocate(m(n, n))

  ! データ読み込み
  do i = 1, n
    read (*, *) m(i, :)
  end do
  print *, "Matrix A ="
  do i = 1, n
    print *, m(i, :)
  end do

  ! 行列式計算
  d = det(m)
  print *, "det(A) =", d

  ! 配列用メモリ解放
  deallocate(m)
end program determinant
{% endhighlight %}

* [Gist - Fortran 95 source code to calculate a determinant by cofactor expansion.](https://gist.github.com/komasaru/3fcb6d5ded8393ae6557229f6d3f0511 "Gist - Fortran 95 source code to calculate a determinant by cofactor expansion.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -Wall -O2 -o determinant determinant.f95
```

### 4. 動作確認

まず、以下のような入力ファイルを用意する。  
（先頭行：行数、2行目以降：行列の各要素）

File: `input.txt`

{% highlight text linenos %}
5
1 3 5 7 9
4 2 8 6 0
9 3 7 5 1
4 0 6 8 2
3 6 9 2 5
{% endhighlight %}

そして、実行。

``` text
$ ./determinant < input.txt
 Matrix A =
   1.0000000000000000        3.0000000000000000        5.0000000000000000        7.0000000000000000        9.0000000000000000
   4.0000000000000000        2.0000000000000000        8.0000000000000000        6.0000000000000000        0.0000000000000000
   9.0000000000000000        3.0000000000000000        7.0000000000000000        5.0000000000000000        1.0000000000000000
   4.0000000000000000        0.0000000000000000        6.0000000000000000        8.0000000000000000        2.0000000000000000
   3.0000000000000000        6.0000000000000000        9.0000000000000000        2.0000000000000000        5.0000000000000000
 det(A) =   2320.0000000000000
```

当然、以下のように実行してもよいし、

``` text
$ cat input.txt | ./determinant
```

以下のように実行してもよい。

``` text
$ ./determinant <<_EOF_
5
1 3 5 7 9
4 2 8 6 0
9 3 7 5 1
4 0 6 8 2
3 6 9 2 5
_EOF_
```

---

以上。

