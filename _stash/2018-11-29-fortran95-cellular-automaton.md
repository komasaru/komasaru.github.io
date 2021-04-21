---
layout   : single
title    : "Fortran - セル・オートマトン！"
published: true
date     : 2018-11-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でセル・オートマトンの実装を試してみました。

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. セル・オートマトンとは

格子状のセル上で、周囲のセルとのやりとりを単純なルールで定め、そのルールに則って、次の世代（ステップ）を決めていくような離散的計算モデルのことである。(Cellular Automaton; CA)  
ライフゲームもセル・オートマトンの一種。

### 2. ソースコードの作成

File: `cell_atm.f95`

{% highlight fortran linenos %}
!****************************************************
! セル・オートマトン
!
! date          name            version
! 2018.09.14    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program CellAtm
  implicit none
  integer, parameter:: rule = 90         ! 遷移規則 (90, 30, 110, 184)
  real(8), parameter:: density = 0.04    ! 初期状態密度
  integer, parameter:: W = 78, H = 20    ! 横幅,縦長さ
  integer(1) :: a(1:W), s(1:W)           ! セル状態 a, 近傍状態 s
  integer    :: i

  call random_array(a, W, density)       ! 初期状態を a にセット
  print *, merge('X', ' ', a/=0)         ! 表示 1 -> X
  do i = 1, H                            ! H 回遷移を繰り返し
    s(1) = a(W) * 4 + a(1) * 2 + a(2)    ! 左端の近傍状態
    s(W) = a(W-1) * 4 + a(W) * 2 + a(1)  ! 右端の近傍状態
    s(2:W-1) = a(1:W-2) * 4 + a(2:W-1) * 2 + a(3:W) ! 他の近傍状態
    a = merge(1, 0, btest(rule, s))      ! 遷移実行
    print *, merge('X', ' ', a/=0)       ! 表示 1 -> X
  end do

  stop
contains
  subroutine random_array(a, n, densty )
    integer    :: n
    integer(1) :: a(1:n)
    real(8)    :: densty
    integer    :: ck, sz, i
    real(8)    :: rnd(1:n)

    call system_clock(ck)                    ! クロック値 ( 毎回違う ) を取得
    call random_seed(size=sz)                ! 乱数シードの数を取得
    call random_seed(put=(/(ck+i, i=1,sz)/)) ! 乱数初期値変更
    call random_number(rnd)                  ! rnd に n 個の乱数をセット
    a = merge(1, 0, rnd < densty)            ! a に密度 densty の 1 をセット
  end subroutine random_array
end program CellAtm
{% endhighlight %}

* [Gist - Fortran 95 source code to test cellular-automaton implementation.](https://gist.github.com/komasaru/8145f797c53fd17abe25743323d716e6 "Gist - Fortran 95 source code to test cellular-automaton implementation.")

### 3. ソースコードのコンパイル

``` text
$ gfortran -o cell_atm cell_atm.f95
```

### 4. 動作確認

``` text
$ ./cell_atm
                         X
                        X X
                       X   X
                      X X X X
                     X       X
                    X X     X X
                   X   X   X   X
                  X X X X X X X X
                 X               X
                X X             X X
               X   X           X   X
              X X X X         X X X X
             X       X       X       X
            X X     X X     X X     X X
           X   X   X   X   X   X   X   X
          X X X X X X X X X X X X X X X X
         X                               X
        X X                             X X
       X   X                           X   X
      X X X X                         X X X X
     X       X                       X       X
```

### 5. ソースコード（C 言語連携バージョン）の作成

C 言語と連携して PGM 画像を生成するようにしたバージョン。

File: `cell_atmt.f95`

{% highlight fortran linenos %}
!****************************************************
! セル・オートマトン（C 言語との連携バージョン）
!
! date          name            version
! 2018.09.14    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program CellAtm
  implicit none
  integer, parameter:: rule = 110           ! 遷移規則 (90, 30, 110, 184)
  real(8), parameter:: density = 0.01       ! 初期状態密度
  integer, parameter:: W = 800, H = 750     ! 横幅,縦長さ
  integer(1) :: a(1:W), s(1:W)              ! セル状態 a, 近傍状態 s
  integer    :: i

  call random_array(a, W, density)          ! 初期状態を a にセット
  call put_head(W, H + 1, 1)                ! 出力初期化ルーチン (C)
  call put_raw(a, W)                        ! 出力ルーチン (C)
  do i = 1, H                               ! H 回遷移を繰り返し
    s = cshift(a,-1)*4 + a*2 + cshift(a,1)  ! 近傍状態計算
    a = merge(1, 0, btest(rule, s))         ! 遷移実行
    call put_raw(a, W)                      ! 出力ルーチン (C)
  end do

  stop
contains
  subroutine random_array(a, n, densty )
    integer    :: n
    integer(1) :: a(1:n)
    real(8)    :: densty
    integer    :: ck, sz, i
    real(8)    :: rnd(1:n)

    call system_clock(ck)                    ! クロック値 ( 毎回違う ) を取得
    call random_seed(size=sz)                ! 乱数シードの数を取得
    call random_seed(put=(/(ck+i, i=1,sz)/)) ! 乱数初期値変更
    call random_number(rnd)                  ! rnd に n 個の乱数をセット
    a = merge(1, 0, rnd < densty)            ! a に密度 densty の 1 をセット
  end subroutine random_array
end program CellAtm
{% endhighlight %}

File: `pgmout.c`

{% highlight c linenos %}
/*
 * PGM 出力用
 */

#include <stdio.h>
int Width, Height, Max;

void put_head_(int *width, int *height, int *max){
    printf("P5\n%d %d\n%d\n", *width, *height, *max);
}

void put_raw_(char *a, int *width){
    fwrite(a, 1, *width, stdout);
}
{% endhighlight %}

* [Gist - Fortran 95 source code to test cellular-automaton implementation.(Ver.2)](https://gist.github.com/komasaru/013448f69b63dc8cfc578061bd9845d6 "Gist - Fortran 95 source code to test cellular-automaton implementation.(Ver.2)")

### 6. ソースコード（C 言語連携バージョン）のビルド

今回は Makefile を作成してビルド（コンパイル＋リンク＋実行可能ファイル作成）する。（以下は、当方の記述例）

まず、 Makefile の作成。

File: `Makefile`

{% highlight text linenos %}
FC = gfortran
CFLAGS = -c -O
TARGET = cell_atmt

.SUFFIXES:.f95 .o

.f95.o:
	$(FC) $(CFLAGS) $<

all:	$(TARGET)

OBJS = pgmout.o cell_atmt.o

$(TARGET):	$(OBJS)
	$(FC) -o $@ $(OBJS)

clean:
	@rm -f $(TARGET) $(OBJS)
{% endhighlight %}

* Makefile 内の行頭にあるインデントは「タブ」であること。

そして、ビルド。

``` text
$ make
```

### 7. 動作確認（C 言語連携バージョン）

``` text
$ ./cell_atmt | tee cell_atmt.pgm | display
```

PGM 画像 `cell_atmt.pgm` が作成＆表示される。

![CELL_ATMT]({{site.baseurl}}/images/2018/11/29/CELL_ATMT.png "CELL_ATMT")

---

以上、

