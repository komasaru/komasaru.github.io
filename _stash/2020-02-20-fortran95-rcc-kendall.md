---
layout   : single
title    : "Fortran - ケンドール順位相関係数の計算！"
published: true
date     : 2020-02-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でケンドールの順位相関係数(Kendall's Rank Correlation Coefficient)の計算をしてみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (GFortran 9.2.0) でのコンパイルを想定。

### 1. ケンドールの順位相関係数について

$$n$$ 対の順位データ $$(x_i, y_i) (i=1,2,\cdots,n)$$ があるとき、それの中から取り出した $$(x_s, y_s),\ (x_t, y_t)\ (1 \leq s \lt t \leq n)$$ において、

$$
\begin{eqnarray*}
P&:& x_s と x_t,\ y_s と y_t の大小関係が一致する組の数 \\
Q&:& x_s と x_t,\ y_s と y_t の大小関係が不一致の組の数 \\
N&:& 組の総数=\binom{n}{2}=\displaystyle _nC_2=\frac{n(n-1)}{2}
\end{eqnarray*}
$$

とおくと、 **ケンドールの順位相関係数(Kendall's Rank Correlation Coefficient)** $$\tau_a, \tau_b$$ は次式で表される。（ケンドールの $$\tau_a$$ (Kendall's tau a), ケンドールの $$\tau_b$$ (Kendall's tau b)とも呼ばれる）

(1)同順位（タイ）が存在しない場合、
$$
\begin{eqnarray*}
\tau_a = \frac{P - Q}{N}
\end{eqnarray*}
$$

(2)同順位（タイ）が存在する場合、
$$
\begin{eqnarray*}
\tau_b &=& \frac{P - Q}{\sqrt{N - T_x}\sqrt{N - T_y}} \\
但し、\ \ T_x &=& \displaystyle \sum_{i=1}^{n_x}\frac{t_i({t_i}^2 - 1)}{2} \\
T_y &=& \displaystyle \sum_{j=1}^{n_y}\frac{t_j({t_j}^2 - 1)}{2} \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

また、次式で表されるものを **グッドマン＝クラスカルの $$\gamma$$ (Goodman and Kruskal's gamma)** と呼ぶ。

$$
\begin{eqnarray*}
\gamma = \frac{P - Q}{P + Q}
\end{eqnarray*}
$$

（注1）同順位（タイ）がない場合、 $$T_x = T_y = 0,\ P + Q = N$$ となり、結果として、 $$\tau_a = \tau_b = \gamma$$ となる。  
（注2）$$\tau_c$$ なる式もあるが、 $$\tau_a,\ \tau_b,\ \gamma$$ とやや性質が異なるので今回は割愛。

### 2. Fortran ソースコードの作成

* 計算の本質は `comp` モジュール。
* 使用する2つの配列 `X`, `Y` を適宜変更する等する。（`calc_rcc_kendall` プログラム内）

File: `calc_rcc_kendall.f95`

{% highlight fortran linenos %}
!****************************************************
! ケンドールの順位相関係数の計算
!
! DATE          AUTHOR          VERSION
! 2019.12.13    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2019 mk-mode.com All Rights Reserved.
!****************************************************
!
module cst
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module cst

module comp
  use cst
  implicit none
  private
  public :: rcc_kendall

contains
  ! ケンドールの順位相関係数の計算
  !
  ! :param(in) real(8)  xs
  ! :param(in) real(8)  ys
  ! :return    real(8) rcc
  function rcc_kendall(xs, ys) result(rcc)
    use cst
    implicit none
    real(DP), intent(in) :: xs(:), ys(:)
    real(DP)    :: rcc
    integer(SP) :: n, p, q
    real(DP)    :: s_x, s_y, n2
    integer(SP), allocatable :: rank_x(:), rank_y(:)
    integer(SP), allocatable :: tai_x(:, :), tai_y(:, :)

    rcc = -1.0_DP
    n = size(xs)
    if (size(ys) /= n) return
    allocate(rank_x(n))
    allocate(rank_y(n))
    allocate(tai_x(n, 2))
    allocate(tai_y(n, 2))
    ! ランク付け
    call rank(xs, rank_x)
    call rank(ys, rank_y)
    ! P（x_s と x_t, y_s と y_t の大小関係が一致する組の数）
    ! Q（x_s と x_t, y_s と y_t の大小関係が不一致の組の数）
    ! （x_s = x_t or y_s = y_t は除く）
    call calc_pq(rank_x, rank_y, p, q)
    ! 同順位の数（インデックスが順位）
    call tai(rank_x, tai_x)
    call tai(rank_y, tai_y)
    ! Tx, Ty の sum 部分
    call sum_t(tai_x, s_x)
    call sum_t(tai_y, s_y)
    ! 相関係数
    n2 = (n * n - n) / 2.0_DP
    rcc = (p - q) / (sqrt(n2 - s_x) * sqrt(n2 - s_y))

    deallocate(rank_x)
    deallocate(rank_y)
    deallocate(tai_x)
    deallocate(tai_y)
  end function rcc_kendall

  ! ランク付け
  ! （同順位を中央（平均）順位(mid-rank)にする必要はない）
  !
  ! :param(in)  real(8)    src(:)
  ! :param(out) integer(4) res(:)
  subroutine rank(src, res)
    implicit none
    real(DP),    intent(in)  :: src(:)
    integer(SP), intent(out) :: res(:)
    integer(SP) :: c, i, j, s

    res = 0.0_DP
    s = size(src)
    do i = 1, s
      c = 0
      do j = 1, s
        if (src(i) < src(j)) c = c + 1
      end do
      res(i) = c + 1
    end do
  end subroutine rank

  ! P（x_s と x_t, y_s と y_t の大小関係が一致する組の数）
  ! Q（x_s と x_t, y_s と y_t の大小関係が不一致の組の数）
  ! （x_s = x_t or y_s = y_t は除く）
  subroutine calc_pq(rank_x, rank_y, p, q)
    implicit none
    integer(SP), intent(in)  :: rank_x(:), rank_y(:)
    integer(SP), intent(out) :: p, q
    integer(SP) :: i, j, n, w

    n = size(rank_x)
    p = 0
    q = 0
    do i = 1, n - 1
      do j = i + 1, n
        w = (rank_x(i) - rank_x(j)) * (rank_y(i) - rank_y(j))
        if (w > 0) then
          p = p + 1
        else if (w < 0) then
          q = q + 1
        end if
      end do
    end do
  end subroutine calc_pq

  ! 同順位の数
  !
  ! :param(in)  real(8)       src(:)
  ! :param(out) integer(r) res(:, 2)
  subroutine tai(src, res)
    implicit none
    integer(SP), intent(in)  :: src(:)
    integer(SP), intent(out) :: res(:, :)
    integer(SP) :: c, i, j, s
    integer(SP), allocatable :: wk(:)

    s = size(src)
    allocate(wk(s))
    wk = src
    res = 0
    do i = 1, s
      c = 0
      do j = i, s
        if (wk(j) == 0) cycle
        if (wk(i) == wk(j)) then
          c = c + 1
          if (i /= j) wk(j) = 0
        end if
      end do
      res(i, :) = (/wk(i), c/)
    end do
    deallocate(wk)
  end subroutine tai

  ! Tx, Ty の sum 部分
  !
  ! :param(in)  integer(4) src(:, 2)
  ! :param(out) real(8)          s_t
  subroutine sum_t(src, s_t)
    implicit none
    integer(SP), intent(in)  :: src(:, :)
    real(DP),    intent(out) :: s_t
    integer(SP) :: i, s
    integer(DP) :: t

    s = size(src) / 2
    s_t = 0.0_DP
    do i = 1, s
      t = src(i, 2)
      s_t = s_t + (t * t * t - t) / 2.0_DP
    end do
  endsubroutine sum_t
end module comp

program calc_rcc_kendall
  use cst
  use comp
  implicit none
  real(DP)    :: rcc
  ! === タイ（同順位）が存在しない例
  !real(DP), parameter :: X(10) = (/ &
  !  & 1.0_DP, 2.0_DP, 3.0_DP, 4.0_DP,  5.0_DP, &
  !  & 6.0_DP, 7.0_DP, 8.0_DP, 9.0_DP, 10.0_DP  &
  !& /)
  !real(DP), parameter :: Y(10) = (/ &
  !  & 1.0_DP, 3.0_DP, 5.0_DP, 7.0_DP,  9.0_DP, &
  !  & 2.0_DP, 4.0_DP, 6.0_DP, 8.0_DP, 10.0_DP  &
  !& /)

  ! === タイ（同順位）が存在する例
  real(DP), parameter :: X(10) = (/ &
    & 1.0_DP, 2.0_DP, 3.0_DP, 4.0_DP,  5.0_DP, &
    & 5.0_DP, 7.0_DP, 8.0_DP, 9.0_DP, 10.0_DP  &
  & /)
  real(DP), parameter :: Y(10) = (/ &
    & 1.0_DP, 3.0_DP, 5.0_DP, 6.0_DP,  9.0_DP, &
    & 2.0_DP, 4.0_DP, 6.0_DP, 8.0_DP, 10.0_DP  &
  & /)

  ! === サイズが異なる例 ( => 実行時にエラー )
  !real(DP), parameter :: X(10) = (/ &
  !  & 1.0_DP, 2.0_DP, 3.0_DP, 4.0_DP,  5.0_DP, &
  !  & 6.0_DP, 7.0_DP, 8.0_DP, 9.0_DP, 10.0_DP  &
  !& /)
  !real(DP), parameter :: Y(9) = (/ &
  !  & 1.0_DP, 3.0_DP, 5.0_DP, 7.0_DP,  9.0_DP, &
  !  & 2.0_DP, 4.0_DP, 6.0_DP, 8.0_DP           &
  !& /)

  ! === X のサイズがゼロの例（ => 当然、コンパイルエラー ）
  !real(DP), parameter :: X(0) = (//)
  !real(DP), parameter :: Y(9) = (/ &
  !  & 1.0_DP, 3.0_DP, 5.0_DP, 7.0_DP,  9.0_DP, &
  !  & 2.0_DP, 4.0_DP, 6.0_DP, 8.0_DP, 10.0_DP  &
  !& /)

  ! === 数値以外のものが存在する例（ => 当然、コンパイルエラー ）
  !real(DP), parameter :: X(10) = (/ &
  !  & 1.0_DP, 2.0_DP, 3.0_DP, 4.0_DP,  5.0_DP, &
  !  & 6.0_DP, 7.0_DP, 8.0_DP, 9.0_DP, 10.0_DP  &
  !& /)
  !real(DP), parameter :: Y(10) = (/ &
  !  & 1.0_DP, 3.0_DP, 5.0_DP, 7.0_DP,  9.0_DP, &
  !  & "ABC", 4.0_DP, 6.0_DP, 8.0_DP, 10.0_DP  &
  !& /)

  rcc = rcc_kendall(X, Y)
  print '("X = ", 10F5.1)', X
  print '("Y = ", 10F5.1)', Y
  if (rcc == -1.0_DP) then
    print *, "[ERROR]"
  else
    print '("Spearman''s RCC = ", F11.8)', rcc
  end if
end program calc_rcc_kendall
{% endhighlight %}

* [Gist - Fortran 95 source code to calculate a Kendall's Rank Correlation Coefficient.](https://gist.github.com/komasaru/4432eb4a4f0a9d0906cc5af1f9e791df "Gist - Fortran 95 source code to calculate a Kendall's Rank Correlation Coefficient.")

### 3. コンパイル＆リンク

``` text
$ gfortran -Wall -O2 -o calc_rcc_kendall calc_rcc_kendall.f95
```

### 4. プログラムの実行

``` text
$ ./calc_rcc_kendall
X =   1.0  2.0  3.0  4.0  5.0  5.0  7.0  8.0  9.0 10.0
Y =   1.0  3.0  5.0  6.0  9.0  2.0  4.0  6.0  8.0 10.0
Spearman's RCC =  0.64285714
```

---

以上。

