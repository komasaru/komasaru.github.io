---
layout   : single
title    : "Fortran - 逆行列の計算（余因子行列を使用）！"
published: true
date     : 2020-03-28 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

前回、 Fortran 95 で余因子展開による行列式の計算を行いましたが、今回は、それを応用して、逆行列の計算を行ってみました。

少し前に、同じことを Ruby で Array クラスを拡張する方法で実装しています。

* [Ruby - 逆行列の計算（余因子行列を使用）！！]({{site.baseurl}}/2020/03/09/ruby-inverse-matrix-by-cofacor-matrix "Ruby - 逆行列の計算（余因子行列を使用）！！")

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

(2)を行列式 ｜A｜ の $$i$$ 行についての **余因子展開**、(3)を行列式 ｜A｜ の $$j$$ 列についての **余因子展開** という。（余因子展開は、ラプラス展開や単に展開と呼ばれることもある）

### 2. 余因子行列と逆行列について

 $$n(>1)$$ 次正方行列 $$A=(a _ {ij})$$ に対して、 $$a _ {ij}$$ の余因子 $$\tilde{A} _ {ij}$$ を $$(j,i)$$ 成分とするような行列を $$A$$ の **余因子行列** といい、 $$\tilde{A}$$ で表す。すなわち、

$$
\begin{eqnarray}
\tilde{A}=\left(
\begin{array}{cccc}
\tilde{A}_{11} & \tilde{A}_{21} & \cdots & \tilde{A}_{n1} \\
\tilde{A}_{12} & \tilde{A}_{22} & \cdots & \tilde{A}_{n2} \\
\vdots & \vdots & & \vdots \\
\tilde{A}_{1n} & \tilde{A}_{2n} & \cdots & \tilde{A}_{nn} \\
\end{array}
\right)\ \ (n>1,\ \tilde{A}_{ij}の並び方に注意)
\end{eqnarray}
$$

そして、次の定理が成り立つ。（証明略）

【定理】 $$n$$ 次正方行列 $$A$$ の逆行列は次式で求められる。

$$
\begin{eqnarray}
A^{-1}=\frac{1}{|A|}\tilde{A}
\end{eqnarray}
$$

### 3. ソースコードの作成

File: `inverse_matrix.f95`

{% highlight fortran linenos %}
!****************************************************
! 逆行列の計算（余因子行列）
!
!   DATE          AUTHOR          VERSION
!   2019.12.24    mk-mode.com     1.00 新規作成
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
  public :: det, cof_mtx, inv_mtx

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

  ! 余因子行列
  !
  ! :param(in)   m: 行列配列
  ! :param(out) cm: 余因子行列配列
  subroutine cof_mtx(m, cm)
    implicit none
    real(DP), intent(in)  ::  m(:, :)
    real(DP), intent(out) :: cm(:, :)
    integer(SP) :: i, j, n

    n = size(m(1, :))
    do i = 1, n
      do j = 1, n
        cm(i, j) = cof(m, j, i)
      end do
    end do
  end subroutine cof_mtx

  ! 逆行列
  !
  ! :param(in)   m: 行列配列
  ! :param(out) im: 逆行列配列
  subroutine inv_mtx(m, im)
    implicit none
    real(DP), intent(in)  ::  m(:, :)
    real(DP), intent(out) :: im(:, :)
    integer(SP) :: n
    real(DP), allocatable :: cm(:, :)

    n = size(m(1, :))
    if (n == 1) then
      im = 1.0_DP / m
      return
    end if
    allocate(cm(n, n))
    call cof_mtx(m, cm)
    im = cm / det(m)
    deallocate(cm)
  end subroutine inv_mtx

  ! 余因子（正方行列 A の (i, j) に対する）
  !
  ! :param(in)   m: 行列配列
  ! :param(in)   i: 行インデックス
  ! :param(in)   j: 列インデックス
  ! :param(out)  c: 余因子
  real(DP) function cof(m, i, j)
    implicit none
    real(DP),    intent(in)  :: m(:, :)
    integer(SP), intent(in)  :: i, j
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

program inverse_matrix
  use const
  use comp
  implicit none
  integer(SP) :: n, i
  real(DP)    :: d
  real(DP), allocatable :: m(:, :), cm(:, :), im(:, :)

  ! データ数読み込み
  read (*, *) n

  ! 配列用メモリ確保
  allocate(m(n, n))
  allocate(cm(n, n))
  allocate(im(n, n))

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

  ! 余因子行列計算
  call cof_mtx(m, cm)
  print *, "Cofactor Matrix of A ="
  do i = 1, n
    print *, cm(i, :)
  end do

  ! 逆行列計算
  call inv_mtx(m, im)
  print *, "Inverse Matrix of A ="
  do i = 1, n
    print *, im(i, :)
  end do

  ! 配列用メモリ解放
  deallocate(m)
  deallocate(cm)
  deallocate(im)
end program inverse_matrix
{% endhighlight %}

* [Gist - Fortran 95 source code to calculate an inverse matrix by cofactor matrix.](https://gist.github.com/komasaru/61d81f170bf61031c6070ef778990813 "Gist - Fortran 95 source code to calculate an inverse matrix by cofactor matrix.")

### 4. ソースコードのコンパイル

``` text
$ gfortran -Wall -O2 -o inverse_matrix inverse_matrix.f95
```

### 5. 動作確認

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
$ ./inverse_matrix < input.txt
 Matrix A =
   1.0000000000000000        3.0000000000000000        5.0000000000000000        7.0000000000000000        9.0000000000000000
   4.0000000000000000        2.0000000000000000        8.0000000000000000        6.0000000000000000        0.0000000000000000
   9.0000000000000000        3.0000000000000000        7.0000000000000000        5.0000000000000000        1.0000000000000000
   4.0000000000000000        0.0000000000000000        6.0000000000000000        8.0000000000000000        2.0000000000000000
   3.0000000000000000        6.0000000000000000        9.0000000000000000        2.0000000000000000        5.0000000000000000
 det(A) =   2320.0000000000000
 Cofactor Matrix of A =
  -192.00000000000000       -600.00000000000000        336.00000000000000        376.00000000000000        128.00000000000000
   1208.0000000000000        2180.0000000000000        496.00000000000000       -2704.0000000000000       -1192.0000000000000
  -752.00000000000000       -900.00000000000000       -424.00000000000000        1376.0000000000000        888.00000000000000
   728.00000000000000        1260.0000000000000        176.00000000000000       -1184.0000000000000       -872.00000000000000
  -272.00000000000000       -1140.0000000000000       -104.00000000000000        1016.0000000000000        568.00000000000000
 Inverse Matrix of A =
  -8.2758620689655171E-002 -0.25862068965517243       0.14482758620689656       0.16206896551724137        5.5172413793103448E-002
  0.52068965517241383       0.93965517241379315       0.21379310344827587       -1.1655172413793105      -0.51379310344827589
 -0.32413793103448274      -0.38793103448275862      -0.18275862068965518       0.59310344827586203       0.38275862068965516
  0.31379310344827588       0.54310344827586210        7.5862068965517240E-002 -0.51034482758620692      -0.37586206896551722
 -0.11724137931034483      -0.49137931034482757       -4.4827586206896551E-002  0.43793103448275861       0.24482758620689654
```

当然、以下のように実行してもよいし、

``` text
$ cat input.txt | ./inverse_matrix
```

以下のように実行してもよい。

``` text
$ ./inverse_matrix <<_EOF_
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

