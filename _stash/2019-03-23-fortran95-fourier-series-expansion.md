---
layout   : single
title    : "Fortran - フーリエ級数展開！"
published: true
date     : 2019-03-23 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でフーリエ級数展開を実装する方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - フーリエ級数展開！]({{site.baseurl}}/2013/05/16/cpp-expand-fourier-series "C++ - フーリエ級数展開！")
* [Ruby - フーリエ級数展開！]({{site.baseurl}}/2013/05/17/ruby-expand-fourier-series "Ruby - フーリエ級数展開！")
* [Python - フーリエ級数展開！]({{site.baseurl}}/2018/03/31/python-fourier-series-expansion "Python - フーリエ級数展開！")

### 2. ソースコードの作成

* 計算項数の取得は標準入力から。（コマンドライン引数ではない）

File: `fourier_series_expansion.f95`

{% highlight fortran linenos %}
!****************************************************
! フーリエ級数展開
!   f(t) = -1 (-PI < t <= 0 )
!           1 (  0 < t <= PI)
!
!   date          name            version
!   2018.12.14    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  real(DP),    parameter :: PI = 4.0_DP * atan(1.0_DP)
end module const

module fourier
  use const
  implicit none
  private
  public :: expand

contains
  ! フーリエ級数展開
  ! * 結果出力も行う
  !
  ! :param(in) integer(4) n: 計算項数
  subroutine expand(n)
    implicit none
    integer(SP), intent(in) :: n
    integer(SP) :: t, i
    real(DP)    :: y

    y = 0.0_DP
    do t = int(-1000.0_DP * PI), int(1000.0_DP * PI)
      do i = 1, n
        y = y + calc_term(i, t / 1.0e3_DP)
      end do
      print '(F6.3, X, F9.6)', t / 1.0e3_DP, 4.0_DP / PI * y
      y = 0.0_DP
    end do
  end subroutine expand

  ! 各項計算
  function calc_term(n, t) result(c)
    implicit none
    integer(SP), intent(in) :: n
    real(DP),    intent(in) :: t
    real(DP) :: c

    c = sin((2 * n - 1) * t) / (2 * n - 1)
  end function calc_term
end module fourier

program fourier_series_expansion
  use const
  use fourier
  implicit none
  integer(SP) :: n, t

  ! 計算項数の取得
  read (*, *) n

  ! フーリエ級数展開
  call expand(n)
end program fourier_series_expansion
{% endhighlight %}

* [Gist - Fortran 95 source code to expand Fourier's series.](https://gist.github.com/komasaru/368cefebfeb77fd2fcdf6d774ec4321a "Gist - Fortran 95 source code to expand Fourier's series.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o fourier_series_expansion fourier_series_expansion.f95
```

### 4. 動作確認

計算項数を 1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000, 10000, 100000 と変化させて実行し、それぞれテキストファイルに出力する。

``` text
$ echo 1 | ./fourier_series_expansion > n_1.txt
$ echo 2 | ./fourier_series_expansion > n_2.txt
$ echo 3 | ./fourier_series_expansion > n_3.txt
$ echo 5 | ./fourier_series_expansion > n_5.txt
$ echo 10 | ./fourier_series_expansion > n_10.txt
$ echo 20 | ./fourier_series_expansion > n_20.txt
$ echo 50 | ./fourier_series_expansion > n_50.txt
$ echo 100 | ./fourier_series_expansion > n_100.txt
$ echo 200 | ./fourier_series_expansion > n_200.txt
$ echo 500 | ./fourier_series_expansion > n_500.txt
$ echo 1000 | ./fourier_series_expansion > n_1000.txt
$ echo 10000 | ./fourier_series_expansion > n_10000.txt
$ echo 100000 | ./fourier_series_expansion > n_100000.txt
```

### 5. 結果確認

GNUPLOT で描画してみた。

![N_0]({{site.baseurl}}/images/2019/03/23/N_0.png "N_0")
![N_1]({{site.baseurl}}/images/2019/03/23/N_1.png "N_1")
![N_2]({{site.baseurl}}/images/2019/03/23/N_2.png "N_2")
![N_3]({{site.baseurl}}/images/2019/03/23/N_3.png "N_3")
![N_5]({{site.baseurl}}/images/2019/03/23/N_5.png "N_5")
![N_10]({{site.baseurl}}/images/2019/03/23/N_10.png "N_10")
![N_20]({{site.baseurl}}/images/2019/03/23/N_20.png "N_20")
![N_50]({{site.baseurl}}/images/2019/03/23/N_50.png "N_50")
![N_100]({{site.baseurl}}/images/2019/03/23/N_100.png "N_100")
![N_200]({{site.baseurl}}/images/2019/03/23/N_200.png "N_200")
![N_500]({{site.baseurl}}/images/2019/03/23/N_500.png "N_500")
![N_1000]({{site.baseurl}}/images/2019/03/23/N_1000.png "N_1000")
![N_10000]({{site.baseurl}}/images/2019/03/23/N_10000.png "N_10000")
![N_100000]({{site.baseurl}}/images/2019/03/23/N_100000.png "N_100000")

---

以上。

