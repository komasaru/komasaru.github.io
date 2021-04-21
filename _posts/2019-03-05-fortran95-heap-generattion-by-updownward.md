---
layout   : single
title    : "Fortran - ヒープ生成（上方・下方移動）！"
published: true
date     : 2019-03-05 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でヒープ（上方移動・下方移動）のアルゴリズムを実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - ヒープ生成（上方移動）！]({{site.baseurl}}/2014/04/04/cpp-generation-heap-upward "C++ - ヒープ生成（上方移動）！")
* [C++ - ヒープ生成（下方移動）！]({{site.baseurl}}/2014/04/06/cpp-generation-heap-downward "C++ - ヒープ生成（下方移動）！")
* [Ruby - ヒープ生成（上方・下方移動）！]({{site.baseurl}}/2014/04/07/ruby-generation-heap "Ruby - ヒープ生成（上方・下方移動）！")
* [Python - ヒープ生成（上方・下方移動）！]({{site.baseurl}}/2018/04/22/python-heap-generation-with-upward-downward-method "Python - ヒープ生成（上方・下方移動）！")

### 2. ソースコードの作成

以下は上方移動。

File: `heap_upward.f95`

{% highlight fortran linenos %}
!****************************************************
! ヒープ作成（上方移動）
!
!   date          name            version
!   2018.12.06    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer(SP), parameter :: N = 100  ! データ個数
end module const

module heap
  use const, only : SP, DP
  implicit none
  private
  public :: gen_heap

contains
  ! ヒープ生成
  !
  ! :param(in)  integer(4) num: データ個数
  ! :param(in)  integer(4)   b: 元の配列
  ! :param(out) integer(4)   h: ヒープ配列
  subroutine gen_heap(num, b, h)
    implicit none
    integer(SP), intent(in)  :: num, b(num)
    integer(SP), intent(out) :: h(0:num)
    integer(SP) :: i, s, p, w

    h(:) = 0  ! ヒープ配列初期化
    do i = 1, num
      ! 元データ配列から１つヒープ要素として追加
      h(i) = b(i)
      s = i        ! 追加要素の位置
      p = s / 2    ! 親要素の位置
      do while (s >= 2 .and. h(p) > h(s))
        w    = h(p)
        h(p) = h(s)
        h(s) = w
        s = p      ! 追加要素の位置
        p = s / 2  ! 親要素の位置
      end do
    end do
  end subroutine gen_heap
end module heap

program heap_upward
  use const
  use heap
  implicit none
  integer(SP) :: b(N), h(0:N)  ! 元の配列、ヒープ配列
  integer(SP) :: seed_size, clock, i
  real(DP)    :: r
  integer(SP), allocatable :: seed(:)

  ! 乱数の種の設定
  ! (元の配列を毎回異なる内容にするため)
  call system_clock(clock)
  call random_seed(size=seed_size)
  allocate(seed(seed_size))
  seed = clock
  call random_seed(put=seed)
  deallocate(seed)

  ! 元の配列生成（(0, N] の値の配列）
  do i = 1, N
    call random_number(r)
    b(i) = int(r * N) + 1
  end do
  print '(A)', "#### Base"
  print '(10(X, I4))', b

  ! ヒープ配列生成
  call gen_heap(N, b, h)
  print '(A)', "#### Heap"
  print '(10(X, I4))', h(1:)
end program heap_upward
{% endhighlight %}

* [Gist - Fortran 95 source code to generate a heap by upward method.](https://gist.github.com/komasaru/d445453f3bb6243b6232ee5b3cf11ca0 "Gist - Fortran 95 source code to generate a heap by upward method.")

以下は下方移動。

File: `heap_downward.f95`

{% highlight fortran linenos %}
!****************************************************
! ヒープ作成（下方移動）
!
!   date          name            version
!   2018.12.06    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer(SP), parameter :: N = 100  ! データ個数
end module const

module heap
  use const, only : SP, DP
  implicit none
  private
  public :: gen_heap

contains
  ! ヒープ生成
  !
  ! :param(in)    integer(4) num: データ個数
  ! :param(inout) integer(4)   h: ヒープ配列
  subroutine gen_heap(num, h)
    implicit none
    integer(SP), intent(in)    :: num
    integer(SP), intent(inout) :: h(0:num)
    integer(SP) :: i, s, p, w

    do i = num / 2, 1, -1
      p = i         ! 親要素の位置
      s = 2 * p     ! 左の子要素の位置
      do while (s <= num)
        ! 左右子要素の小さい方
        if (s < num .and. h(s + 1) < h(s)) s = s + 1
        if (h(p) <= h(s)) exit
        w    = h(p)
        h(p) = h(s)
        h(s) = w
        p = s       ! 親要素の位置
        s = 2 * p   ! 左の子要素の位置
      end do
    end do
  end subroutine gen_heap
end module heap

program heap_downward
  use const
  use heap
  implicit none
  integer(SP) :: h(0:N)  ! ヒープ配列
  integer(SP) :: seed_size, clock, i
  real(DP)    :: r
  integer(SP), allocatable :: seed(:)

  ! 乱数の種の設定
  ! (元の配列を毎回異なる内容にするため)
  call system_clock(clock)
  call random_seed(size=seed_size)
  allocate(seed(seed_size))
  seed = clock
  call random_seed(put=seed)
  deallocate(seed)

  ! 元の配列生成（(0, N] の値の配列）
  do i = 1, N
    call random_number(r)
    h(i) = int(r * N) + 1
  end do
  print '(A)', "#### Base"
  print '(10(X, I4))', h(1:)

  ! ヒープ配列生成
  call gen_heap(N, h)
  print '(A)', "#### Heap"
  print '(10(X, I4))', h(1:)
end program heap_downward
{% endhighlight %}

* [Gist - Fortran 95 source code to generate a heap by downward method.](https://gist.github.com/komasaru/989d6523916f05f243214802935bbb03 "Gist - Fortran 95 source code to generate a heap by downward method.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o heap_upward heap_upward.f95
$ gfortran -o heap_downward heap_downward.f95
```

### 4. 動作確認

``` text
$ ./heap_upward
#### Base
   94   92   48   47   28    1   82   88   80  100
   12   22   72    8   98   21   74   27    3   39
   49   94    7    7   32   60   11   58   56   96
   37   13   74   77   90   93   91   90   42   68
   30   25   55   89   72   69   84   67   60   79
   44    7   69   43    8   33   15   36  100   66
   55   58    5   42   30   12   97   43   23    8
   63    3    7   56   24   68   21   73   81   83
   72   22   68    9   29   65   58   76   83   69
   91   24    4   47   12   80   35   47   28   11
#### Heap
    1    3    5    3    4    7    7   12    7    9
    7   11    8   22   15   13   12    8   21   25
   22   69   12   28   28   11    8   33   36   55
   37   42   30   43   23   21   24   27   42   72
   47   29   55   76   72   39   24   60   35   32
   44   72   69   60   43   82   56   58  100   98
   66   96   58   94   74   74   97   80   77   90
   63   93   88   91   56   90   68   73   81  100
   83   68   68   49   30   65   58   94   83   89
   91   69   48   84   47   92   80   67   47   79

$ ./heap_downward
#### Base
   60   39   81   52   25   17   69   24   34   69
   26   14   32   85   31   17    7   14   63   44
   60   97   88   65   96    8   52   11   68    2
   69   70   24   34   71   90   11   66   80   56
   43   65   15   21   40   20   20    2   24   24
   22   19   53   44    2   95   27   86   94   84
   80    5   40   81   49   51   54   38   55   22
   30   30   29   65   10   43   63   60   31   28
   99   91   33   50   59   58   57   34   70   56
   28    8   14   52   96    4    7   68   84   22
#### Heap
    2    7    2   10    8    4    2   17   11   15
   14    7    8   11    5   24   22   14   31   28
   50   21   20   14   22   19   32   27   68   31
   40   49   51   34   24   29   34   43   60   44
   33   59   57   34   28   25   20   17   24   24
   22   81   53   44   52   95   85   86   94   84
   80   69   69   81   70   52   54   38   55   71
   30   30   90   65   39   66   63   63   80   56
   99   91   43   65   69   58   60   97   70   56
   40   26   88   52   96   65   60   68   84   96
```

生成後の数列を上位からピラミッド状に並べてみると、ヒープになっているのが分かる。

---

以上。

