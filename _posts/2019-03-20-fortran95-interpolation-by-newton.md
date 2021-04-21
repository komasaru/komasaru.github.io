---
layout   : single
title    : "Fortran - ニュートン補間！"
published: true
date     : 2019-03-20 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でニュートン補間を行う方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - ニュートン補間！]({{site.baseurl}}/2013/03/13/cpp-interpolate-newton "C++ - ニュートン補間！")
* [Ruby - ニュートン補間！]({{site.baseurl}}/2013/03/14/ruby-interpolate-newton "Ruby - ニュートン補間！")
* [Python - ニュートン補間！]({{site.baseurl}}/2018/02/16/python-interpolation-with-newton "Python - ニュートン補間！")

### 2. ソースコードの作成

File: `newton_interpolation.f95`

{% highlight fortran linenos %}
!****************************************************
! ニュートン補間
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

module newton
  use const
  implicit none
  private
  public :: interpolate

contains
  ! ニュートン補間
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
    real(DP)    :: c(num_pt), w(num_pt)

    ! 配列初期化
    c(:) = 0.0_DP  ! 係数用
    w(:) = 0.0_DP  ! 作業用

    ! 差分商
    do i = 1, num_pt
      w(i) = pts(2, i)
      do j = i - 1, 1, -1
        w(j) = (w(j + 1) - w(j)) / (pts(1, i) - pts(1, j))
      end do
      c(i) = w(1)
    end do
    ! 総和
    y = c(num_pt)
    do i = num_pt - 1, 1, -1
      y = y * (x - pts(1, i)) + c(i)
    end do
  end function interpolate
end module newton

program newton_interpolation
  use const
  use newton
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

  ! ニュートン補間
  ! (1行1点(x, y)で出力)
  do i = int(pts(1, 1)), int(pts(1, num_pt)) * 2
    x = real(i, DP) / 2
    y = interpolate(pts, num_pt, x)
    print '(F7.2, X, F7.2)', x, y
  end do

  ! 配列メモリ解放
  deallocate(pts)
end program newton_interpolation
{% endhighlight %}

* [Gist - Fortran 95 source code to interpolate by Newton's method.](https://gist.github.com/komasaru/fdcb8ad6e7ec7386ea7bcda4c3b7044d "Gist - Fortran 95 source code to interpolate by Newton's method.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o newton_interpolation newton_interpolation.f95
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
$ cat pts_src.txt | ./newton_interpolation
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

![NEWTON_INTERPOLATION]({{site.baseurl}}/images/2019/03/20/NEWTON_INTERPOLATION.png "NEWTON_INTERPOLATION")

---

以上。

