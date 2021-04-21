---
layout   : single
title    : "Fortran - LU 分解（外積形式ガウス法(outer-product form)）！"
published: true
date     : 2019-05-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 で正方行列の LU 分解アルゴリズムを実装してみました。

今回使用する分解法は「外積形式ガウス法(outer-product form)」

過去には Ruby で同じことをしました。

* [Ruby - LU 分解（外積形式ガウス法(outer-product form)）！]({{site.baseurl}}/2019/05/14/ruby-lu-decomposition-by-outer-product "Ruby - LU 分解（外積形式ガウス法(outer-product form)）！")

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. LU 分解について

![LU_DECOMPOSITION_1]({{site.baseurl}}/images/2019/05/23/LU_DECOMPOSITION_1.png "LU_DECOMPOSITION_1")
![LU_DECOMPOSITION_2]({{site.baseurl}}/images/2019/05/23/LU_DECOMPOSITION_2.png "LU_DECOMPOSITION_2")
![LU_DECOMPOSITION_3]({{site.baseurl}}/images/2019/05/23/LU_DECOMPOSITION_3.png "LU_DECOMPOSITION_3")

分解する方法には以下のようなものがある。（最初の3つがよく知られているもの）

* 外積形式ガウス法
* 内積形式ガウス法
* クラウト法
* ブロック形式ガウス法
* 縦ブロックガウス法
* 前進・後退代入
* ...

### 2. LU 分解（外積形式ガウス法(outer-product form)）について

* ガウス消去法と同等の操作で LU 分解する方法。
* 分解列の右側の領域が更新される方法で、 "right-looking" アルゴリズムと呼ばれる。
* 処理の中心の更新領域が多く、更新処理が分解行と分解列という少ないデータを所有するだけで要素ごとに独立して行えるため、並列化に向いている。

### 3. Fortran ソースコードの作成

* 本来、 L と U の2つの行列に分けるものだが1つの行列にまとめている。（実際に LU 分解を使用する際に L と U を意識して取り扱えばよいだけなので）

File: `lu_decomposition.f95`

{% highlight fortran linenos %}
!************************************************************
! LU 分解（外積形式ガウス法(outer-product form)）
!
!   date          name            version
!   2019.03.08    mk-mode.com     1.00 新規作成
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
  public :: decompose

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
end module lu

program lu_decomposition
  use const
  use lu
  implicit none
  character(9), parameter :: F_INP = "input.txt"
  integer(SP),  parameter :: UID   = 10
  integer(SP) :: n_row, n_col, i, j, k, n
  real(DP)    :: tmp
  real(DP), allocatable :: a(:, :)

  ! ファイル OPEN
  open (UID, file = F_INP, status = 'old')

  ! 行数・列数取得
  read (UID, *) n_row, n_col

  ! 配列用メモリ確保
  allocate(a(n_row, n_col))

  ! 行列取得
  do i = 1, n_row
    read (UID, *) a(i, :)
  end do
  call display(a)

  ! ファイル CLOSE
  close (UID)

  ! LU 分解
  call decompose(a)
  print *, "-->"
  call display(a)

  ! 配列用メモリ解放
  deallocate(a)

  stop

contains
  subroutine display(a)
    implicit none
    real(DP), intent(in) :: a(:, :)
    integer(SP)  :: i, j, n
    character(8) :: f

    n = int(sqrt(real(size(a))))
    f = "(IF8.2)"
    write (f(2:2), '(I1)') n
    do i = 1, n
      write (*, f) a(i, :)
    end do
  endsubroutine display
end program lu_decomposition
{% endhighlight %}

* [Gist - Fortran 95 source code to do LU-decomposition by outer-product form.](https://gist.github.com/komasaru/306a3231e4c0466ce12d84cd22231795 "Fortran 95 source code to do LU-decomposition by outer-product form.")

### 4. ソースコードのコンパイル

``` text
$ gfortran -o lu_decomposition lu_decomposition.f95
```

### 5. 動作確認

元の行列はテキストファイルから取り込むようにしているので、まず、テキストファイルを作成する。（1行目：行・列の数、2行目以降：1行ずつの値）

File: `input.txt`

{% highlight text linenos %}
3 3
2 -3  1
1  1 -1
3  5 -7
{% endhighlight %}

そして、実行。

``` text
$ ./lu_decomposition
    2.00   -3.00    1.00
    1.00    1.00   -1.00
    3.00    5.00   -7.00
 -->
    2.00   -3.00    1.00
    0.50    2.50   -1.50
    1.50    3.80   -2.80
```

行列 L の対角成分を 1 として L と U に分けて LU を計算してみると、 A になるだろう。

---

以上。

