---
layout   : single
title    : "Fortran - 各種ソート処理！"
published: true
date     : 2019-03-08 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Fortran
---

Fortran 95 で各種ソート処理のアルゴリズムを実装してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. アルゴリズムについて

当ブログ過去記事を参照のこと。

* [C++ - ソート処理各種テスト！]({{site.baseurl}}/2014/04/10/cpp-sort-test "C++ - ソート処理各種テスト！")
* [Ruby - ソート処理各種テスト！]({{site.baseurl}}/2014/04/11/ruby-sort-test "Ruby - ソート処理各種テスト！")
* [Python - ソート処理各種テスト！]({{site.baseurl}}/2018/04/25/python-sorting-test "Python - ソート処理各種テスト！")

### 2. ソースコードの作成

* ソート結果も確認したければ、コメントアウトしている結果出力コードをコメント解除する。

File: `sort_test.f95`

{% highlight fortran linenos %}
!****************************************************
! ソート処理各種テスト
!
!   date          name            version
!   2018.12.07    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module const
  implicit none
  ! SP: 単精度(4), DP: 倍精度(8)
  integer,     parameter :: SP = kind(1.0)
  integer(SP), parameter :: DP = selected_real_kind(2 * precision(1.0_SP))
  integer(SP), parameter :: N = 1000   ! データ個数
  integer(SP), parameter :: M = 10000  ! 値 MAX ( M 未満 )
  integer(SP), parameter :: L = 10000  ! ソート試行回数
end module const

module sort
  use const, only : SP, DP
  implicit none
  private
  public :: sort_bubble, sort_selection, sort_insertion, sort_quick, &
          & sort_heap_up, sort_heap_down, sort_shell

contains
  ! =============================
  ! public subroutines/functions
  ! =============================

  ! 基本交換法（バブル・ソート）
  !
  ! :param(in)  integer(4)    num: 配列サイズ
  ! :param(in)  integer(4) a(num): 元の配列
  ! :param(out) integer(4) b(num): ソート後の配列
  subroutine sort_bubble(num, a, b)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: b(num)
    integer(SP) :: i, j, w

    ! 配列コピー
    b(:) = a(:)

    ! ソート処理
    do i = 1, num - 1
      do j = num, i + 1, -1
        if (b(j) >= b(j - 1)) cycle
        w        = b(j - 1)
        b(j - 1) = b(j)
        b(j)     = w
      end do
    end do
  end subroutine sort_bubble

  ! 基本交換法（直接選択法）
  !
  ! :param(in)  integer(4)    num: 配列サイズ
  ! :param(in)  integer(4) a(num): 元の配列
  ! :param(out) integer(4) b(num): ソート後の配列
  subroutine sort_selection(num, a, b)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: b(num)
    integer(SP) :: i, j, s, min, w

    ! 配列コピー
    b(:) = a(:)

    ! ソート処理
    do i = 1, num - 1
      min = b(i)
      s   = i
      do j = i + 1, num
        if (b(j) >= min) cycle
        min = b(j)
        s   = j
      end do
      w    = b(i)
      b(i) = b(s)
      b(s) = w
    end do
  end subroutine sort_selection

  ! 基本挿入法
  !
  ! :param(in)  integer(4)    num: 配列サイズ
  ! :param(in)  integer(4) a(num): 元の配列
  ! :param(out) integer(4) b(num): ソート後の配列
  subroutine sort_insertion(num, a, b)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: b(num)
    integer(SP) :: i, j, w

    ! 配列コピー
    b(:) = a(:)

    ! ソート処理
    do i = 2, num
      do j = i - 1, 1, -1
        if (b(j) <= b(j + 1)) exit
        w        = b(j)
        b(j)     = b(j + 1)
        b(j + 1) = w
      end do
    end do
  end subroutine sort_insertion

  ! 改良交換法 (クイック・ソート)
  !
  ! :param(in)  integer(4)    num: 配列サイズ
  ! :param(in)  integer(4) b(num): 元の配列
  ! :param(out) integer(4) a(num): ソート後の配列
  subroutine sort_quick(num, a, b)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: b(num)
    integer(SP) :: i, j, w

    ! 配列コピー
    b(:) = a(:)

    ! ソート処理
    call quick(1, num, num, b)
  end subroutine sort_quick

  ! 改良選択法 (ヒープ・ソート)(上方移動)
  !
  ! :param(in)  integer(4)    num: 配列サイズ
  ! :param(in)  integer(4) a(num): 元の配列
  ! :param(out) integer(4) b(num): ソート後の配列
  subroutine sort_heap_up(num, a, b)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: b(num)
    integer(SP) :: h(0:num), nn, m, w, p, s

    ! 初期ヒープ作成(上方移動、昇順)
    call gen_heap_up(num, a, h)

    ! ソート処理
    nn = num  ! データ個数
    m  = num  ! N の保存
    do while (nn > 1)
      ! スワップ
      w     = h(1)
      h(1)  = h(nn)
      h(nn) = w
      nn = nn - 1  ! 木の終端切り離し
      p = 1
      s = 2 * p
      do while (s <= nn)
        if (s < nn .and. h(s + 1) > h(s)) s = s + 1
        if (h(p) >= h(s)) exit
        ! スワップ
        w    = h(p)
        h(p) = h(s)
        h(s) = w
        p = s
        s = 2 * p
      end do
    end do
    b(:) = h(1:num)
  end subroutine sort_heap_up

  ! 改良選択法 (ヒープ・ソート)(下方移動)
  !
  ! :param(in)  integer(4)    num: 配列サイズ
  ! :param(in)  integer(4) a(num): 元の配列
  ! :param(out) integer(4) b(num): ソート後の配列
  subroutine sort_heap_down(num, a, b)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: b(num)
    integer(SP) :: h(0:num), nn, m, w, p, s

    ! 元の配列を元の木としてコピー
    h(1:num) = a(:)
    ! 初期ヒープ作成(下方移動、昇順)
    call gen_heap_down(num, h)
    ! ソート処理
    nn = num  ! データ個数
    m  = num  ! N の保存
    do while (nn > 1)
      ! スワップ
      w     = h(1)
      h(1)  = h(nn)
      h(nn) = w
      nn = nn - 1  ! 木の終端切り離し
      p = 1
      s = 2 * p
      do while (s <= nn)
        if (s < nn .and. h(s + 1) > h(s)) s = s + 1
        if (h(p) >= h(s)) exit
        ! スワップ
        w    = h(p)
        h(p) = h(s)
        h(s) = w
        p = s
        s = 2 * p
      end do
    end do
    b(:) = h(1:num)
  end subroutine sort_heap_down

  ! 改良挿入法（シェル・ソート）
  !
  ! :param(in)  integer(4)    num: 配列サイズ
  ! :param(in)  integer(4) a(num): 元の配列
  ! :param(out) integer(4) b(num): ソート後の配列
  subroutine sort_shell(num, a, b)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: b(num)
    integer(SP) :: gap, i, j, k, w

    ! 配列コピー
    b(:) = a(:)

    ! ソート処理
    gap = num / 2
    do while (gap > 0)
      do k = 1, gap
        i = k + gap
        do while (i <= num)
          j = i - gap
          do while (j >= k)
            if (b(j) <= b(j + gap)) exit
            ! スワップ
            w          = b(j)
            b(j)       = b(j + gap)
            b(j + gap) = w
            j = j - gap
          end do
          i = i + gap
        end do
      end do
      gap = gap / 2
    end do
  end subroutine sort_shell

  ! =============================
  ! Private subroutines/functions
  ! =============================

  ! クイック・ソート用再帰関数
  !
  ! :param(in)    integer(4)     left: 左インデックス
  ! :param(in)    integer(4)    right: 右インデックス
  ! :param(in)    integer(4)      num: 配列サイズ
  ! :param(inout) integer(4)   a(num): 配列
  recursive subroutine quick(left, right, num, a)
    implicit none
    integer(SP), intent(in)    :: left, right, num
    integer(SP), intent(inout) :: a(num)
    integer(SP) :: i, j, s, w

    if (left >= right) return

    ! 最左項を軸に. 軸より小さいグループ. 軸より大きいグループ.
    s = a(left)
    i = left
    j = right + 1
    do
      i = i + 1
      do while (a(i) < s)
        i = i + 1
      end do
      j = j - 1
      do while (a(j) > s)
        j = j - 1
      end do
      if (i >= j) exit
      ! スワップ
      w    = a(i)
      a(i) = a(j)
      a(j) = w
    end do

    ! 軸を正しい位置に挿入
    a(left) = a(j)
    a(j)    = s
    call quick(left,  j - 1, num, a)  ! 左部分列に対する再帰呼び出し
    call quick(j + 1, right, num, a)  ! 右部分列に対する再帰呼び出し
  end subroutine quick

  ! ヒープ生成(上方移動、昇順)
  !
  ! :param(in)  integer(4) num: データ個数
  ! :param(in)  integer(4)   a: 元の配列
  ! :param(out) integer(4)   h: ヒープ配列
  subroutine gen_heap_up(num, a, h)
    implicit none
    integer(SP), intent(in)  :: num, a(num)
    integer(SP), intent(out) :: h(0:num)
    integer(SP) :: i, s, p, w

    h(:) = 0  ! ヒープ配列初期化
    do i = 1, num
      ! 元データ配列から１つヒープ要素として追加
      h(i) = a(i)
      s = i        ! 追加要素の位置
      p = s / 2    ! 親要素の位置
      do while (s >= 2 .and. h(p) < h(s))
        ! スワップ
        w    = h(p)
        h(p) = h(s)
        h(s) = w
        s = p      ! 追加要素の位置
        p = s / 2  ! 親要素の位置
      end do
    end do
  end subroutine gen_heap_up

  ! ヒープ生成(下方移動)
  !
  ! :param(in)    integer(4) num: データ個数
  ! :param(inout) integer(4)   h: ヒープ配列
  subroutine gen_heap_down(num, h)
    implicit none
    integer(SP), intent(in)    :: num
    integer(SP), intent(inout) :: h(0:num)
    integer(SP) :: i, s, p, w

    do i = num / 2, 1, -1
      p = i         ! 親要素の位置
      s = 2 * p     ! 左の子要素の位置
      do while (s <= num)
        ! 左右子要素の大きい方
        if (s < num .and. h(s + 1) > h(s)) s = s + 1
        if (h(p) >= h(s)) exit
        ! スワップ
        w    = h(p)
        h(p) = h(s)
        h(s) = w
        p = s       ! 親要素の位置
        s = 2 * p   ! 左の子要素の位置
      end do
    end do
  end subroutine gen_heap_down
end module sort

program sort_test
  use const
  use sort
  implicit none
  integer(SP) :: a(N), b(N)  ! 元の配列、ソート後配列
  integer(SP) :: seed_size, clock, i
  real(DP)    :: r, t_0, t_1
  integer(SP), allocatable :: seed(:)

  ! 乱数の種の設定
  ! (元の配列を毎回異なる内容にするため)
  call system_clock(clock)
  call random_seed(size=seed_size)
  allocate(seed(seed_size))
  seed = clock
  call random_seed(put=seed)
  deallocate(seed)

  ! 元の配列生成（[0, M) の値の配列）
  do i = 1, N
    call random_number(r)
    a(i) = int(r * M) + 1
  end do
  print '(A)', "#### Source"
  call display(a)

  ! 基本交換法（バブル・ソート）
  write (*, '(A)', advance="no") "  1  : Bubble Sort    "
  call cpu_time(t_0)
  do i = 1, L
    call sort_bubble(N, a, b)
  end do
  call cpu_time(t_1)
  print '(" : ", F6.2, " sec.")', t_1 - t_0
  !call display(b)  ! 結果出力

  ! 基本選択法（直接選択法）
  write (*, '(A)', advance="no") "  2  : Selection Sort "
  call cpu_time(t_0)
  do i = 1, L
    call sort_selection(N, a, b)
  end do
  call cpu_time(t_1)
  print '(" : ", F6.2, " sec.")', t_1 - t_0
  !call display(b)  ! 結果出力

  ! 基本挿入法
  write (*, '(A)', advance="no") "  3  : Insertion Sort "
  call cpu_time(t_0)
  do i = 1, L
    call sort_insertion(N, a, b)
  end do
  call cpu_time(t_1)
  print '(" : ", F6.2, " sec.")', t_1 - t_0
  !call display(b)  ! 結果出力

  ! 改良交換法（クイック・ソート）
  write (*, '(A)', advance="no") "  4  : Quick Sort     "
  call cpu_time(t_0)
  do i = 1, L
    call sort_quick(N, a, b)
  end do
  call cpu_time(t_1)
  print '(" : ", F6.2, " sec.")', t_1 - t_0
  !call display(b)  ! 結果出力

  ! 改良選択法（ヒープ・ソート）（上方移動）
  write (*, '(A)', advance="no") "  5-1: Heap Sort(Up)  "
  call cpu_time(t_0)
  do i = 1, L
    call sort_heap_up(N, a, b)
  end do
  call cpu_time(t_1)
  print '(" : ", F6.2, " sec.")', t_1 - t_0
  !call display(b)  ! 結果出力

  ! 改良選択法（ヒープ・ソート）（下方移動）
  write (*, '(A)', advance="no") "  5-2: Heap Sort(Down)"
  call cpu_time(t_0)
  do i = 1, L
    call sort_heap_down(N, a, b)
  end do
  call cpu_time(t_1)
  print '(" : ", F6.2, " sec.")', t_1 - t_0
  !call display(b)  ! 結果出力

  ! 改良挿入法（シェル・ソート）
  write (*, '(A)', advance="no") "  6  : Shell Sort     "
  call cpu_time(t_0)
  do i = 1, L
    call sort_shell(N, a, b)
  end do
  call cpu_time(t_1)
  print '(" : ", F6.2, " sec.")', t_1 - t_0
  !call display(b)  ! 結果出力

contains
  ! 配列出力
  ! * 1行10件 で出力
  !
  ! :param(in) integer(4) a(:)
  subroutine display(a)
    implicit none
    integer(SP), intent(in) :: a(:)
    character(20) :: f  ! 書式文字列
    integer(SP)   :: d  ! 桁数

    d = int(log10(real(M, DP)))
    write (f, '("(/, 10(2X, I", I0, "))")') d
    print f, a
    print *
  end subroutine display
end program sort_test
{% endhighlight %}

* [Gist - Fortran 95 source code to test sorting algorithms.](https://gist.github.com/komasaru/bcc9a57c0b9261cbd5c585f28834c25b "Gist - Fortran 95 source code to test sorting algorithms.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o sort_test sort_test.f95
```

### 4. 動作確認

``` text
$ ./sort_test
#### Source

  5989  3703  2324  5074  5009  5232  2520  1236  3446  7323
   217   883  8646   429  4449   342  9808  6633  5390  7217
  8005  4804  9033  6803  6410  6825  4618  9102  7027  3668
  7994  5718   155  7167  5939  3444  9316  6557  2755  1179
  2158  2360  6975  7237  6210  8274   802  2733  4787  1084

       ====< 中略 >====

  8747  7219  3975  7142  8992  4493  3974  6620  3852  2245
  9210  2577   452  5804  5077  1544   266  2320   973  4521
  5422  8393  7606  6196  4471  2066  7148  4673  5032  8692
  8631   546  3311  3633  4190  3781  2993  4449  9876  9147
  2185  6107  4074  5959  2896  8053   592   335  6737  1858

  1  : Bubble Sort     :  36.44 sec.
  2  : Selection Sort  :  15.67 sec.
  3  : Insertion Sort  :  17.61 sec.
  4  : Quick Sort      :   0.86 sec.
  5-1: Heap Sort(Up)   :   1.43 sec.
  5-2: Heap Sort(Down) :   1.36 sec.
  6  : Shell Sort      :   1.73 sec.
```

### 5. 結果

何回か実行してみた結果、処理の早い順は大体以下のようになった。

1. 改良交換法（クイック・ソート）
2. 改良選択法（ヒープ・ソート（下方移動））
3. 改良選択法（ヒープ・ソート（上方移動））
4. 改良挿入法（シェル・ソート）
5. 基本選択法（直接選択法）
6. 基本挿入法
7. 基本交換法（バブル・ソート）

同じアルゴリズムでも、プログラミング言語によって速度の順位が異なる（C++ / Ruby / Python 版とは結果が異なる）。

---

以上。

