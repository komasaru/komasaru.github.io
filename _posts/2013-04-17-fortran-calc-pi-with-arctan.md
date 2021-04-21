---
layout   : single
title    : "Fortran - 円周率計算（Arctan 系公式）"
published: true
date     : 2013-04-17 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
- 円周率
---

これまで、円周率を Arctan 系の公式で多桁計算する C++, Ruby アルゴリズムを紹介しました。

* [C++ - 円周率計算（Arctan 系公式（その２））！]({{site.baseurl}}/2013/04/14/cpp-calc-pi-with-arctan-2/ "C++ - 円周率計算（Arctan 系公式（その２））！")
* [Ruby - 円周率計算（Arctan 系公式（その２））！]({{site.baseurl}}/2013/04/15/ruby-calc-pi-with-arctan-2/ "Ruby - 円周率計算（Arctan 系公式（その２））！")

（上記のリンクの記事より以前にも同様な記事を紹介していますが、改良前のもので若干計算効率が悪いです）

今回は、科学技術計算用プログラミング言語 Fortran95 で同じアルゴリズムを実装してみました。  
Arctan 系公式による計算アルゴリズム等については、上記リンクの過去記事を参照してください。

<!--more-->

### 0. 前提条件

* Linux Mint 14 Nadia (64bit) での作業を想定。
* GNU Fortran (Ubuntu/Linaro 4.7.2-2ubuntu1) 4.7.2 を使用。

### 1. Fortran ソース作成

File: `calc_pi_arctan.f95`

{% highlight fortran linenos %}
!***********************************************************
! 円周率計算 by Arctan 系公式
! ( 各項の Arctan を個別に計算後に加減算する方法 )
!
!    1: Machin
!    2: Klingenstierna
!    3: Euler
!    4: Euler(2)
!    5: Gauss
!    6: Stormer
!    7: Stormer(2)
!    8: Takano
!
! コンパイル方法：
!   $ f95 calc_pi_arctan.f95 -o calc_pi_arctan
!***********************************************************
!
!***********************************************************
! 定数モジュール
!***********************************************************
module constants
  implicit none
  ! 公式名
  character(len=14), parameter :: FORMULA(8) = (/ &
    'Machin        ', 'Klingenstierna', 'Euler         ', 'Euler2        ', &
    'Gauss         ', 'Stormer       ', 'Stormer2      ', 'Takano        ' /)
  ! 公式の項数
  integer, parameter :: KOSU(8) = (/ 2, 3, 2, 3, 3, 3, 4, 4 /)
  ! 公式内係数
  integer, parameter :: KEISU(12, 8) = reshape(source = (/ &
     16, 1,  5,  -4, 1, 239,   0, 0,   0,  0, 0,      0,   &  ! 1: Machin
     32, 1, 10,  -4, 1, 239, -16, 1, 515,  0, 0,      0,   &  ! 2: Klingenstierna
     20, 1,  7,   8, 3,  79,   0, 0,   0,  0, 0,      0,   &  ! 3: Euler
     16, 1,  5,  -4, 1,  70,   4, 1,  99,  0, 0,      0,   &  ! 4: Euler(2)
     48, 1, 18,  32, 1,  57, -20, 1, 239,  0, 0,      0,   &  ! 5: Gauss
     24, 1,  8,   8, 1,  57,   4, 1, 239,  0, 0,      0,   &  ! 6: Stormer
    176, 1, 57,  28, 1, 239, -48, 1, 682, 96, 1,  12943,   &  ! 7: Stormer(2)
     48, 1, 49, 128, 1,  57, -20, 1, 239, 48, 1, 110443    &  ! 8: Takano
  /), shape =(/ 12, 8 /))
  ! 出力ファイル
  character(len=*), parameter :: FILE_PRE = 'PI_'   ! プリフィックス
  character(len=*), parameter :: FILE_EXT = '.txt'  ! 拡張子
  ! 入力メッセージ
  character(len=*), parameter :: STR_INF_1 = "1:Machin, 2:Klingenstierna, 3:Euler, 4:Euler(2),"
  character(len=*), parameter :: STR_INF_2 = "5:Gauss, 6:Stormer, 7:Stormer(2), 8:Takano : "
  character(len=*), parameter :: STR_INF_3 = "Please input number of Pi Decimal-Digits : "
  ! 出力文字列 ( コンソール、テキストファイル共通 )
  character(len=*), parameter :: STR_TITLE   = "** Pi Computation by Arctan method **"
  character(len=*), parameter :: STR_FORMULA = "   Formula = "
  character(len=*), parameter :: STR_DIGITS  = "   Digits  = "
  character(len=*), parameter :: STR_TIME    = "   Time(s) = "
  ! 多桁計算
  integer, parameter :: MAX_DIGITS = 100000000  ! １つの int で８桁扱う
end module constants

!***********************************************************
! 計算モジュール
!***********************************************************
module calc
  use constants
  implicit none
  private              ! モジュール外非公開
  public :: calc_pi    ! calc_pi のみモジュール外公開
  integer :: ary_size  ! 配列サイズ

contains

  !********************
  ! 円周率計算
  !********************
  subroutine calc_pi(f, n)
    integer, intent(in) :: f, n    ! 公式番号、計算桁数
    integer :: nn(KOSU(f))         ! 計算項数
    ! 計算用配列 ( サイズは後に再設定 )
    ! ( 各項の(2k-1)部分を除いた部分、各項の(2k-1)部分含む部分、各項の総和、総和 )
    integer, allocatable :: a(:,:), q(:,:), sk(:,:), s(:)
    integer :: i, k                ! ループインデックス
    integer t1, t2, t_rate, t_max  ! 時間計測
    real :: tt                     ! 総時間

    ! ==== 計算開始時刻
    call system_clock(t1)

    ! ==== 初期設定
    ary_size = (n / 8) + 1  ! 配列サイズ
    do i = 1, KOSU(f)       ! 計算項数
      nn(i) = (n / (log10(real(KEISU((i - 1) * 3 + 3, f))) - &
              log10(real(KEISU((i - 1) * 3 + 2, f)))) + 1) / 2 + 1
    end do

    ! ==== 配列再宣言・初期化
    allocate(a( ary_size + 2, KOSU(f)))  ! 各項の(2k-1)部分を除いた部分
    allocate(q( ary_size + 2, KOSU(f)))  ! 各項の(2k-1)部分含む部分
    allocate(sk(ary_size + 2, KOSU(f)))  ! 各項の総和
    allocate(s( ary_size + 2))           ! 総和
    a = 0; q = 0; sk = 0; s = 0

    ! ==== 計算初期値
    do i = 1, KOSU(f)
      if (KEISU((i - 1) * 3 + 1, f) >= 0) then
        a(1, i) = KEISU((i - 1) * 3 + 1, f) * KEISU((i - 1) * 3 + 3, f)
      else
        a(1, i) = -(KEISU((i - 1) * 3 + 1, f) * KEISU((i - 1) * 3 + 3, f))
      end if
      ! 分子が 1 で無ければ、さらに分子の値で除算しておく
      if (KEISU((i - 1) * 3 + 2, f) /= 1) then
        call long_div(a(:, i), KEISU((i - 1) * 3 + 2, f), a(:, i))
      end if
    end do

    ! ==== 計算
    do i = 1, KOSU(f)
      do k = 1, nn(i)
        ! 各項の分数の部分
        call long_div(a(:, i), KEISU((i - 1) * 3 + 3, f), a(:, i))
        call long_div(a(:, i), KEISU((i - 1) * 3 + 3, f), a(:, i))
        ! 分子が 1 でない時
        if (KEISU((i - 1) * 3 + 2, f) /= 1) then
          call long_mul(a(:, i), KEISU((i - 1) * 3 + 2, f), a(:, i))
          call long_mul(a(:, i), KEISU((i - 1) * 3 + 2, f), a(:, i))
        end if

        ! 各項の 1 / (2 * k - 1) の部分
        call long_div(a(:, i), 2 * k - 1, q(:, i));

        ! 各項の総和に加減算
        if (mod(k, 2) /= 0) then
          call long_add(sk(:, i), q(:, i), sk(:, i))
        else
          call long_sub(sk(:, i), q(:, i), sk(:, i))
        end if
      end do
    end do

    ! ==== 各項の総和の加減算
    do i = 1, KOSU(f)
      if (KEISU((i - 1) * 3 + 1, f) >= 0) then
        call long_add(s, sk(:, i), s)
      else
        call long_sub(s, sk(:, i), s)
      end if
    end do

    ! ==== 計算終了時刻
    call system_clock(t2, t_rate, t_max)

    ! ==== 計算時間
    if ( t2 < t1 ) then
      tt = (t_max - t1 + t2) / dble(t_rate)
    else
      tt = (t2 - t1) / dble(t_rate)
    endif

    ! ==== 結果出力
    call display(f, n, tt, s);
  end subroutine calc_pi

  !********************
  ! ロング + ロング
  !********************
  subroutine long_add(a, b, q)
    integer, intent(in) :: a(:)  ! 引数(被加数配列)
    integer, intent(in) :: b(:)  ! 引数(加数配列)
    integer :: q(:)              ! 引数(計算後配列)(参照渡し)
    integer :: i                 ! ループインデックス
    integer :: cr                ! 繰り上がり

    cr = 0
    do i = ary_size + 2, 1, -1
      q(i) = a(i) + b(i) + cr
      if (a(i) < MAX_DIGITS) then
        cr = 0
      else
         q(i) = a(i) - MAX_DIGITS
         cr = 1
      end if
    end do
  end subroutine long_add

  !********************
  ! ロング - ロング
  !********************
  subroutine long_sub(a, b, q)
    integer, intent(in) :: a(:)  ! 引数(被減数配列)
    integer, intent(in) :: b(:)  ! 引数(減数配列)
    integer :: q(:)              ! 引数(計算後配列)(参照渡し)
    integer :: i                 ! ループインデックス
    integer :: br                ! 借り

    do i = ary_size + 2, 1, -1
      q(i) = a(i) - b(i) - br
      if (a(i) >= 0) then
        br = 0
      else
        q(i) = a(i) + MAX_DIGITS
        br = 1
      end if
    end do
  end subroutine long_sub

  !********************
  ! ロング * ショート
  !********************
  subroutine long_mul(a, b, q)
    integer, intent(in) :: a(:)  ! 引数(被乗数配列)
    integer, intent(in) :: b     ! 引数(乗数)
    integer :: q(:)              ! 引数(計算後配列)(参照渡し)
    integer :: i                 ! ループインデックス
    integer :: cr                ! 繰り上がり
    integer :: w                 ! 被乗数ワーク

    cr = 0
    do i = ary_size + 2, 1, -1
      w = a(i)
      q(i) = mod(w * b + cr, MAX_DIGITS)
      cr = (w * b + cr) / MAX_DIGITS
    end do
  end subroutine long_mul

  !********************
  ! ロング / ショート
  !********************
  subroutine long_div(a, b, q)
    integer, intent(in) :: a(:)  ! 引数(被除数配列)
    integer, intent(in) :: b     ! 引数(除数)
    integer :: q(:)              ! 引数(計算後)(参照渡し)
    integer :: i                 ! ループインデックス
    integer(8) :: r              ! 剰余ワーク
    integer :: w                 ! 被除数ワーク

    r = 0
    do i = 1, ary_size + 2
      w = a(i)
      q(i) = (w + r) / b
      r = mod(w + r, b) * MAX_DIGITS
    end do
  end subroutine long_div

  !********************
  ! 結果出力
  !********************
  subroutine display(f, n, tt, s)
    integer, intent(in) :: f           ! 公式番号
    integer, intent(in) :: n           ! 計算桁数
    real,    intent(in) :: tt          ! 総時間
    integer, intent(in) :: s(:)        ! 計算結果配列
    character(len=14) :: formula_name  ! 公式名
    character(len=21) :: out_file      ! 出力ファイル名
    integer :: i                       ! ループインデックス

    ! ==== 公式名・出力ファイル名設定
    formula_name = FORMULA(f)
    out_file = FILE_PRE // trim(FORMULA(f)) // FILE_EXT

    ! ==== コンソール出力
    print '(/a)',      STR_TITLE
    print '(a,a)',     STR_FORMULA, trim(formula_name)
    print '(a,i10)',   STR_DIGITS,  n
    print '(a,f10.3)', STR_TIME,    tt

    ! ==== ファイル出力
    open (10, file=out_file, status='replace')
    write (10, '(a)')       STR_TITLE
    write (10, '(a,a)')     STR_FORMULA, trim(formula_name)
    write (10, '(a,i10)')   STR_DIGITS,  n
    write (10, '(a,f10.3)') STR_TIME,    tt
    write (10, *)
    write (10, '(i11,".")') s(1)
    do i = 2, ary_size
      if (mod(i, 10) == 2) then
        write (10, '(i8.8,":")', advance='no') (i - 2) * 8 + 1
      end if
      write (10, '(i9.8)', advance='no') s(i)
      if (mod(i, 10) == 1) then
        write (10, *)
      end if
    end do
    close (10)
  end subroutine display
end module calc

!***********************************************************
! 主処理
!***********************************************************
program calc_pi_arctan
  use constants    ! 定数モジュール
  use calc         ! 計算モジュール
  implicit none    ! 暗黙の型指定を使用しない
  integer :: f, n  ! 公式番号、計算桁数

  ! ==== 公式番号入力
  write (*, '(a)')               STR_INF_1
  write (*, '(a)', advance='no') STR_INF_2
  read *, f
  ! ==== 計算桁数入力
  write (*, '(a)', advance='no') STR_INF_3
  read *, n

  ! ==== 円周率計算
  call calc_pi(f, n)
end program calc_pi_arctan
{% endhighlight %}

* [Gist - Fortran source code to compute Pi with arctan's formula.](https://gist.github.com/komasaru/a7f35ec5b0c5853ea16d6947058f7759 "Gist - Fortran source code to compute Pi with arctan's formula.")

### 2. Fortran ソースコンパイル

``` text
$ f95 calc_pi_arctan.f95 -o calc_pi_arctan
```

### 3. 実行

以下では、「マチンの公式」を使用して小数点以下 10,000 桁を計算している。

``` text
$ ./calc_pi_arctan
1:Machin, 2:Klingenstierna, 3:Euler, 4:Euler(2),
5:Gauss, 6:Stormer, 7:Stormer(2), 8:Takano : 1
Please input number of Pi Decimal-Digits : 10000

** Pi Computation by Arctan method **
   Formula = Machin
   Digits  =      10000
   Time(s) =      1.084
```

"PI_Machin.txt" というファイルが作成されているはずである。

File: `PI_Machin.txt`

{% highlight text linenos %}
** Pi Computation by Arctan method **
   Formula = Machin
   Digits  =      10000
   Time(s) =      1.084

          3.
00000001: 14159265 35897932 38462643 38327950 28841971 69399375 10582097 49445923 07816406 28620899
00000081: 86280348 25342117 06798214 80865132 82306647 09384460 95505822 31725359 40812848 11174502
00000161: 84102701 93852110 55596446 22948954 93038196 44288109 75665933 44612847 56482337 86783165
00000241: 27120190 91456485 66923460 34861045 43266482 13393607 26024914 12737245 87006606 31558817
00000321: 48815209 20962829 25409171 53643678 92590360 01133053 05488204 66521384 14695194 15116094
00000401: 33057270 36575959 19530921 86117381 93261179 31051185 48074462 37996274 95673518 85752724
00000481: 89122793 81830119 49129833 67336244 06566430 86021394 94639522 47371907 02179860 94370277
00000561: 05392171 76293176 75238467 48184676 69405132 00056812 71452635 60827785 77134275 77896091
00000641: 73637178 72146844 09012249 53430146 54958537 10507922 79689258 92354201 99561121 29021960
00000721: 86403441 81598136 29774771 30996051 87072113 49999998 37297804 99510597 31732816 09631859
00000801: 50244594 55346908 30264252 23082533 44685035 26193118 81710100 03137838 75288658 75332083
00000881: 81420617 17766914 73035982 53490428 75546873 11595628 63882353 78759375 19577818 57780532
00000961: 17122680 66130019 27876611 19590921 64201989 38095257 20106548 58632788 65936153 38182796
        :
===< 途中省略 >===
        :
00009121: 37800297 41207665 14793942 59029896 95946995 56576121 86561967 33786236 25612521 63208628
00009201: 69222103 27488921 86543648 02296780 70576561 51446320 46927906 82120738 83778142 33562823
00009281: 60896320 80682224 68012248 26117718 58963814 09183903 67367222 08883215 13755600 37279839
00009361: 40041529 70028783 07667094 44745601 34556417 25437090 69793961 22571429 89467154 35784687
00009441: 88614445 81231459 35719849 22528471 60504922 12424701 41214780 57345510 50080190 86996033
00009521: 02763478 70810817 54501193 07141223 39086639 38339529 42578690 50764310 06383519 83438934
00009601: 15961318 54347546 49556978 10382930 97164651 43840700 70736041 12373599 84345225 16105070
00009681: 27056235 26601276 48483084 07611830 13052793 20542746 28654036 03674532 86510570 65874882
00009761: 25698157 93678976 69742205 75059683 44086973 50201410 20672358 50200724 52256326 51341055
00009841: 92401902 74216248 43914035 99895353 94590944 07046912 09140938 70012645 60016237 42880210
00009921: 92764579 31065792 29552498 87275846 10126483 69998922 56959688 15920560 01016552 56375678
{% endhighlight %}

全ての公式による計算結果が一致することを確認する。

### 4. 検証

今回のプログラムで利用可能にしている８つの公式を使用して、どれがどの程度高速に計算できているのかを検証してみた。  
想像していたとおり、C++ 版と同等の計算スピード（高速）だった。  
以下は、C++ 版でのテスト結果と Fortran 版でのテスト結果。

【C++ 版】

![PI_ARCTAN_1]({{site.baseurl}}/images/2013/04/17/PI_ARCTAN_1.png "PI_ARCTAN_1")

【Fortran 版】

![PI_ARCTAN_2]({{site.baseurl}}/images/2013/04/17/PI_ARCTAN_2.png "PI_ARCTAN_2")

### 5. 参考サイト

* [円周率を求める公式・アルゴリズム - 円周率.jp -](http://xn--w6q13e505b.jp/formula/ "円周率を求める公式・アルゴリズム - 円周率.jp -")
* [πのArctan公式集](http://www5f.biglobe.ne.jp/~tsuushin/sub1d.html "πのArctan公式集")

---

ちなみに、結果が何万桁以上になる場合は、多桁（多倍長）乗算に上記の方法ではなく「Karatsuba法」や「Toom-Cook法」や「FFT（高速フーリエ変換）」を使うのが一般的なようです。  

計算アルゴリズム・ロジックは複雑なものではないので、この部分を改良しての高速化はそれほど望めないと考えています。  
やはり、多桁計算アルゴリズム・ロジック部分の改良が必要であると考えている次第です。

以上。

