---
layout   : single
title    : "Fortran - スピアマン順位相関係数の計算！"
published: true
date     : 2020-02-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でスピアマンの順位相関係数(Spearman's Rank Correlation Coefficient)の計算をしてみました。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.3 (64bit) での作業を想定。
* GCC 9.2.0 (GFortran 9.2.0) でのコンパイルを想定。

### 1. スピアマンの順位相関係数について

各変量を順位に変換してピアソンの積率相関係数（いわゆる相関係数）を求めたものを **スピアマンの順位相関係数(Spearman's Rank Correlation Coefficient)** と呼ぶ。

実際にはまず、 $$n$$ 対の変数 $$X, Y$$ のそれぞれに順位をつける。但し、同順位（タイ）がある場合は**中央（平均）順位(mid-rank)** で順位をつける。  
（e.g. 2位が3個ある場合、 $$(2+3+4)/3=3$$。3位が2個ある場合、 $$(3+4)/2=3.5$$）

そして、次の式によりスピアマンの順位相関係数 $$r_s$$（または $$\rho$$）を求める。

(1) 同順位（タイ）が存在しない場合、
$$
\begin{eqnarray*}
r_s = 1 - \frac{6}{n(n^{2} - 1)} \displaystyle \sum^{n}_{i=1}(X_i - Y_i)^2
\end{eqnarray*}
$$

(2) 同順位（タイ）が存在する場合、
$$
\begin{eqnarray*}
r_s &=& \frac{T_x + T_y - \displaystyle \sum_{i=1}^{n}(X_i - Y_i)^2}{2\sqrt{T_xT_y}} \\
但し、\ \ T_x &=& \left\{n(n^2 - 1) - \displaystyle \sum_{i=1}^{n_x}t_i({t_i}^2 - 1)\right\} /\ 12 \\
T_y &=& \left\{n(n^2 - 1) - \displaystyle \sum_{j=1}^{n_y}t_j({t_j}^2 - 1)\right\} /\ 12 \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

（注） 同順位が存在しない場合は (2) の $$\sum t_i({t_i}^2 - 1),\ \sum t_j({t_j}^2 - 1)$$ が $$0$$ となり、結局 (1) になる。よって、同順位（タイ）が存在しない場合と存在する場合で場合分けをせず、全て (2) で計算しても、結果は同じになる。

また、スピアマンの順位相関係数は、値を順位に置き換えたもの（同順位（タイ）は中央順位法）の相関係数（ピアソンの積率相関係数）であるので、当然、以下の計算式でも計算できる。

$$
\begin{eqnarray*}
r_s = \frac{\displaystyle \sum_{i=1}^{n}(X_i - \overline{X})(Y_i - \overline{Y})}{\sqrt{\displaystyle \sum_{i=1}^{n}(X_i - \overline{X})^2 \displaystyle \sum_{i=1}^{n}(Y_i - \overline{Y})^2}}
\end{eqnarray*}
$$

さらに、同順位（タイ）が存在する場合の計算式を以下のように説明している文献（特に海外の文献）も多い。（但し、前述の計算式で計算した結果と若干の差異がある）

$$
\begin{eqnarray*}
r_s &=& 1 - \frac{6}{n(n^2 - 1)}\left\{ \displaystyle\sum_{i=1}^{n}(X_i - Y_i)^2 + T_x + T_y \right\} \\
但し、\ \ T_x &=& \displaystyle \sum_{i=1}^{n_x}\frac{t_i({t_i}^2-1)}{12} \\
T_y &=& \displaystyle \sum_{j=1}^{n_y}\frac{t_j({t_j}^2-1)}{12} \\
&&（n_x,\ n_y\ は同順位の数、\ t_i,\ t_j\ は同順位となる順位の個数）
\end{eqnarray*}
$$

### 2. Fortran ソースコードの作成

* 計算の本質は `comp` モジュール。
* 使用する2つの配列 `X`, `Y` を適宜変更する。（`calc_rcc_spearman` モジュール内）

File: `calc_rcc_spearman.f95`

{% highlight fortran linenos %}
!****************************************************
! スピアマンの順位相関係数の計算
!
! DATE          AUTHOR          VERSION
! 2019.12.12    mk-mode.com     1.00 新規作成
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
  public :: rcc_spearman

contains
  ! スピアマンの順位相関係数の計算
  !
  ! :param(in) real(8)  xs
  ! :param(in) real(8)  ys
  ! :return    real(8) rcc
  function rcc_spearman(xs, ys) result(rcc)
    use cst
    implicit none
    real(DP), intent(in) :: xs(:), ys(:)
    real(DP)    :: rcc
    integer(SP) :: i, n, n3
    real(DP)    :: s_x, s_y, t_x, t_y, s
    real(DP), allocatable :: rank_x(:), rank_y(:)
    real(DP), allocatable :: tai_x(:, :), tai_y(:, :)

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
    ! 同順位の数（インデックスが順位）
    call tai(rank_x, tai_x)
    call tai(rank_y, tai_y)
    ! Tx, Ty の sum 部分
    call sum_t(tai_x, s_x)
    call sum_t(tai_y, s_y)
    ! 相関係数
    n3 = n * n * n - n
    t_x = (n3 - s_x) / 12.0_DP
    t_y = (n3 - s_y) / 12.0_DP
    s = 0.0_DP
    do i = 1, n
      s = s + (xs(i) - ys(i)) *  (xs(i) - ys(i))
    end do
    rcc = (t_x + t_y - s) / (2.0_DP * sqrt(t_x * t_y))

    deallocate(rank_x)
    deallocate(rank_y)
    deallocate(tai_x)
    deallocate(tai_y)
  end function rcc_spearman

  ! ランク付け
  !
  ! :param(in)  real(8) src(:)
  ! :param(out) real(8) res(:)
  subroutine rank(src, res)
    implicit none
    real(DP), intent(in)  :: src(:)
    real(DP), intent(out) :: res(:)
    integer(SP) :: c, i, j, s
    real(DP), allocatable :: wk(:)

    s = size(src)
    allocate(wk(s))
    wk = 0.0_DP
    do i = 1, s
      c = 0
      do j = 1, s
        if (src(i) < src(j)) c = c + 1
      end do
      wk(i) = real(c + 1, DP)
    end do
    ! 同順位を中央（平均）順位(mid-rank)に
    do i = 1, s
      c = 0
      do j = 1, s
        if (wk(i) == wk(j)) c = c + 1
      end do
      res(i) = sum((/(j, j=int(wk(i)),int(wk(i))+c-1)/)) / real(c, DP)
    end do
    deallocate(wk)
  end subroutine rank

  ! 同順位の数
  !
  ! :param(in)  real(8)    src(:)
  ! :param(out) real(8) res(:, 2)
  subroutine tai(src, res)
    implicit none
    real(DP), intent(in)  :: src(:)
    real(DP), intent(out) :: res(:, :)
    integer(SP) :: c, i, j, s
    real(DP), allocatable :: wk(:)

    s = size(src)
    allocate(wk(s))
    wk = src
    res = 0.0_DP
    do i = 1, s
      c = 0
      do j = i, s
        if (wk(j) == 0.0_DP) cycle
        if (wk(i) == wk(j)) then
          c = c + 1
          if (i /= j) wk(j) = 0.0_DP
        end if
      end do
      res(i, :) = (/wk(i), real(c, DP)/)
    end do
    deallocate(wk)
  end subroutine tai

  ! Tx, Ty の sum 部分
  !
  ! :param(in)  real(8) src(:, 2)
  ! :param(out) real(8)       s_t
  subroutine sum_t(src, s_t)
    implicit none
    real(DP), intent(in)  :: src(:, :)
    real(DP), intent(out) :: s_t
    integer(SP) :: i, s
    integer(DP) :: t

    s = size(src) / 2
    s_t = 0.0_DP
    do i = 1, s
      t = int(src(i, 2), DP)
      if (t < 2) cycle
      s_t = s_t + t * t * t - t
    end do
  endsubroutine sum_t
end module comp

program calc_rcc_spearman
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

  rcc = rcc_spearman(X, Y)
  print '("X = ", 10F5.1)', X
  print '("Y = ", 10F5.1)', Y
  if (rcc == -1.0_DP) then
    print *, "[ERROR]"
  else
    print '("Spearman''s RCC = ", F11.8)', rcc
  end if
end program calc_rcc_spearman
{% endhighlight %}

* [Gist - Fortran 95 source code to calculate a Spearman's Rank Correlation Coefficient.](https://gist.github.com/komasaru/4d6a37962eef8b350d9f3f53047d314c "Gist - Fortran 95 source code to calculate a Spearman's Rank Correlation Coefficient.")

### 3. コンパイル＆リンク

``` text
$ gfortran -Wall -O2 -o calc_rcc_spearman calc_rcc_spearman.f95
```

### 4. プログラムの実行

``` text
$ ./calc_rcc_spearman
X =   1.0  2.0  3.0  4.0  5.0  5.0  7.0  8.0  9.0 10.0
Y =   1.0  3.0  5.0  6.0  9.0  2.0  4.0  6.0  8.0 10.0
Spearman's RCC =  0.70731707
```

---

以上。

