---
layout   : single
title    : "Fortran - ラグランジュ補間！"
published: true
date     : 2019-03-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でラグランジュ補間を行う方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - ラグランジュ補間！]({{site.baseurl}}/2013/03/10/cpp-interpolate-lagrange "C++ - ラグランジュ補間！")
* [Ruby - ラグランジュ補間！]({{site.baseurl}}/2013/03/11/ruby-interpolate-lagrange "Ruby - ラグランジュ補間！")
* [Python - ラグランジュ補間！]({{site.baseurl}}/2018/02/13/python-interpolation-with-lagrange "Python - ラグランジュ補間！")

### 2. ソースコードの作成

File: `lagrange_interpolation.f95`

{% highlight fortran linenos %}
!****************************************************
! ラグランジュ補間
!
! * 入力はテキストファイルをパイプ処理
!     1行目:     点の数
!     2行目以降: x, y
!
!   date          name            version
!   2018.12.13    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
end module const

module lagrange
  use const
  implicit none
  private
  public :: interpolate

contains
  ! ラグランジュ補間
  !
  ! :param(in) real(8) pts(2, num_pt): あらかじめ与えられた点の配列
  ! :param(in) integer(4)      num_pt: あらかじめ与えられた点の数
  ! :param(in) real(8)              x: 補間する x 値
  ! :return    real(8)              y: 補間後の y 値
  function interpolate(pts, num_pt, x) result(y)
    implicit none
    real(DP),    intent(in) :: pts(2, num_pt), x
    integer(SP), intent(in) :: num_pt
    real(DP)    :: y
    integer(SP) :: i, j
    real(DP)    :: p

    ! 総和初期化
    y = 0.0_DP

    ! 総和
    do i = 1, num_pt
      p = pts(2, i)
      ! 総積
      do j = 1, num_pt
        if (i /= j) p = p * (x - pts(1, j)) / (pts(1, i) - pts(1, j))
      end do
      y = y + p
    end do
  end function interpolate
end module lagrange

program lagrange_interpolation
  use const
  use lagrange
  implicit none
  real(DP),allocatable :: pts(:, :)  ! あらかじめ与える点
  integer(SP) :: num_pt, i
  real(DP)    :: x, y

  ! 点の数の取得
  read (*, *) num_pt

  ! 配列メモリ確保
  allocate(pts(2, num_pt))

  ! あらかじめ与えられた点の読み込み
  do i = 1, num_pt
    read (*, *) pts(:, i)
  end do

  ! ラグランジュ補間
  ! (1行1点(x, y)で出力)
  do i = int(pts(1, 1)), int(pts(1, num_pt)) * 2
    x = real(i, DP) / 2
    y = interpolate(pts, num_pt, x)
    print '(F7.2, X, F7.2)', x, y
  end do

  ! 配列メモリ解放
  deallocate(pts)
end program lagrange_interpolation
{% endhighlight %}

* [Gist - Fortran 95 source code to interpolate by Lagrange's method.](https://gist.github.com/komasaru/5916b24f6e226d2f139deeee81a9787f "Gist - Fortran 95 source code to interpolate by Lagrange's method.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o lagrange_interpolation lagrange_interpolation.f95
```

### 4. 動作確認

今回のプログラムはデータファイルを読み込んで実行する形式としているので、あらかじめデータファイルを作成しておく。（実行後に手入力してもよいが）  
※1行目：点の数、2行目以降：x, y

File: `pts_src.txt`

{% highlight text linenos %}
5
0.0 0.8
2.0 3.2
3.0 2.8
5.0 4.5
8.0 1.9
{% endhighlight %}

そして、実行。

``` text
$ cat pts_src.txt | ./lagrange_interpolation
   0.00    0.80
   0.50    2.49
   1.00    3.23
   1.50    3.37
   2.00    3.20
   2.50    2.95
   3.00    2.80
   3.50    2.85
   4.00    3.17
   4.50    3.74
   5.00    4.50
   5.50    5.32
   6.00    6.03
   6.50    6.37
   7.00    6.05
   7.50    4.70
   8.00    1.90
```

### 5. 結果確認

GNUPLOT で描画してみた。

![LAGRANGE_INTERPOLATION]({{site.baseurl}}/images/2019/03/17/LAGRANGE_INTERPOLATION.png "LAGRANGE_INTERPOLATION")

---

以上。

