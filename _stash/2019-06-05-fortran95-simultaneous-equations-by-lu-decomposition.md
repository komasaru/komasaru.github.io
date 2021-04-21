---
layout   : single
title    : "Fortran - LU 分解を用いた連立1次方程式の解法！"
published: true
date     : 2019-06-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

連立1次方程式を LU 分解を用いて解くアルゴリズムを Fortran 95 で実装してみました。  
（使用する LU 分解法は「外積形式ガウス法(outer-product form)」）

前回 Ruby で同じことをしました。

* [Ruby - LU 分解を用いた連立1次方程式の解法！]({{site.baseurl}}/2019/06/02/ruby-simultaneous-equations-by-lu-decomposition "Ruby - LU 分解を用いた連立1次方程式の解法！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. LU 分解（外積形式ガウス法）について

当ブログ過去記事を参照。

[Ruby - LU 分解（外積形式ガウス法(outer-product form)）！]({{site.baseurl}}/2019/05/14/ruby-lu-decomposition-by-outer-product "Ruby - LU 分解（外積形式ガウス法(outer-product form)）！")

### 2. Fortran ソースコードの作成

* 本来、 L と U の2つの行列に分けるものだが1つの行列にまとめている。（実際に LU 分解を使用する際に L と U を意識して取り扱えばよいだけなので）  
  また、 行列 L の対角成分が 1 であることを想定。

File: `sle_lu.f95`

{% highlight fortran linenos %}
!************************************************************
! 連立1次方程式の解法 ( LU 分解（外積形式ガウス法） )
!
!   date          name            version
!   2019.03.13    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
!************************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module const

module lu
  use const
  implicit none
  private
  public :: decompose, solve

contains
  ! LU 分解
  ! * 外積形式ガウス法(outer-product form)
  !
  ! :param(inout) real(8) a(:,:): 行列
  subroutine decompose(a)
    implicit none
    real(DP), intent(inout) :: a(:, :)
    integer(SP) :: i, j, k, n
    real(DP)    :: tmp

    n = int(sqrt(real(size(a))))
    do k = 1, n
      if (a(1, 1) == 0.0_DP) then
        print *, "Can't divide by 0 ..."
        stop
      end if
      tmp = 1.0_DP / a(k, k)
      a(k+1:n, k) = a(k+1:n, k) * tmp
      do j = k + 1, n
        tmp = a(k, j)
        a(k+1:n, j) = a(k+1:n, j) - a(k+1:n, k) * tmp
      end do
    end do
  end subroutine decompose

  ! 連立方程式を解く
  !
  ! :param(in)  real(8) a(n,n): 行列 A
  ! :param(in)  real(8)   b(n): ベクトル b
  ! :param(out) real(8)   x(n): 解ベクトル x
  subroutine solve(a, b, x)
    implicit none
    real(DP),    intent(in)  :: a(:, :), b(:)
    real(DP),    intent(out) :: x(:)
    integer(SP) :: n, i, j
    real(DP)    :: s
    real(DP), allocatable :: y(:)

    ! 元数
    n = size(x)

    ! 配列 y のメモリ確保
    allocate(y(n))

    ! 前進代入
    ! * Ly = b から y を計算
    do i = 1, n
      s = sum((/(a(i, j) * y(j), j=1,i)/))
      y(i) = b(i) - s
    end do

    ! 後退代入
    ! * Ux = y から x を計算
    do i = n, 1, -1
      s = sum((/(a(i, j) * x(j), j=i+1,n)/))
      x(i) = (y(i) - s) / a(i, i)
    end do

    ! 配列 y のメモリ解放
    deallocate(y)
  end subroutine solve
end module lu

program sle_lu
  use const
  use lu
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  integer(SP)   :: n, i                  ! 元数、ループインデックス
  real(DP), allocatable :: a(:,:), b(:)  ! 係数配列
  real(DP), allocatable :: x(:)          ! 解配列

  ! IN ファイル OPEN
  open(UID, file = F_INP, status = "old")

  ! 元数取得
  read(UID, *) n
  if (n < 1) stop
  print '("n = ", I0)', n

  ! 配列メモリ確保
  allocate(a(n, n))
  allocate(b(n))
  allocate(x(n))

  ! 行列 A 取得
  do i = 1, n
    read(UID, *) a(i,:)
  end do
  print '(A)', "A ="
  call display_mtx(a)

  ! ベクトル B 取得
  read(UID, *) b(:)
  print '(A)', "b ="
  call display_vec(b)

  ! IN ファイル CLOSE
  close (UID)

  ! 行列 A の LU 分解
  call decompose(a)
  !print '(A)', "(LU) ="
  !call display_mtx(a)

  ! 連立方程式を解く
  call solve(a, b, x)
  print '(A)', "x ="
  call display_vec(x)

  ! 配列メモリ解放
  deallocate(a)
  deallocate(b)
  deallocate(x)

contains
  subroutine display_mtx(m)
    implicit none
    real(DP), intent(in) :: m(:, :)
    integer(SP) :: n
    character(20) :: f  ! 書式文字列

    n = size(m(1, :))
    write (f, '("(", I0, "(F10.2)", ")")') n + 1
    do i = 1, n
      print f, m(i,:)
    end do
  end subroutine display_mtx

  subroutine display_vec(v)
    implicit none
    real(DP), intent(in) :: v(:)
    integer(SP) :: n
    character(20) :: f  ! 書式文字列

    n = size(v)
    write (f, '("(", I0, "(F10.2)", ")")') n
    print f, v(:)
  end subroutine display_vec
end program sle_lu
{% endhighlight %}

* [Gist - Fortran 95 source code to solve simultaneous equations by LU-decomposition(outer-product form).](https://gist.github.com/komasaru/60248ae7f79e03ef71898973ae109584 "Fortran 95 source code to solve simultaneous equations by LU-decomposition(outer-product form).")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o sle_lu sle_lu.f95
```

### 4. 動作確認

まず、以下のような入力ファイルを用意する。  
（先頭行：元の数、2行目〜最終行の前の行：行列 A、最終行：ベクトル b）

File: `input.txt`

{% highlight text linenos %}
4
3.0  1.0  1.0  1.0
1.0  2.0  1.0 -1.0
1.0  1.0 -4.0  1.0
1.0 -1.0  1.0  1.0
0.0  4.0 -4.0  2.0
{% endhighlight %}

そして、実行。

``` text
$ ./sle_lu
n = 4
A =
      3.00      1.00      1.00      1.00
      1.00      2.00      1.00     -1.00
      1.00      1.00     -4.00      1.00
      1.00     -1.00      1.00      1.00
b =
      0.00      4.00     -4.00      2.00
x =
     27.00    -28.00    -10.00    -43.00
```

検算してみると、正しいことが分かる。

---

以上。

