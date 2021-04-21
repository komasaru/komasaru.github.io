---
layout   : single
title    : "Fortran - スタックの実装（逆ポーランド記法による電卓）！"
published: true
date     : 2018-11-26 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Fortran
---

Fortran 95 でスタックの実装を試してみました。  
（応用で、逆ポーランド記法による電卓も作成）

<!--more-->

### 0. 前提条件

* LMDE 3 (Linux Mint Debian Edition 3; 64bit) での作業を想定。
* GCC 6.3.0 (GFortran 6.3.0) でのコンパイルを想定。

### 1. テスト用ソースコードの作成

* モジュール部分と実行部分を別ファイルに分けている。

まず、モジュール部分。

File: `stack.f95`

{% highlight fortran linenos %}
!****************************************************
! Stack モジュール
!
! date          name            version
! 2018.08.21    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
module stack
  implicit none
  private                           ! デフォルトを private に設定
  public :: pop, push               ! pop, push のみ public とする
  ! 以下の変数は private となる。
  integer, parameter :: pmax = 256  ! スタックの最大長
  integer, save :: buf(1:pmax)      ! スタック配列
  integer, save :: p = 0            ! 最後（トップ）の要素の位置
contains
  ! Pop from a stack
  ! : スタックからトップノードを取り出す
  integer function pop()
    implicit none

    if (p > 0) then
      pop = buf(p)                  ! 最後の要素を取り出す
      p = p - 1                     ! 最後の要素の位置を左に 1 つずらす
    else
      print *, "Stack underflow!"
      pop = - huge(p)
    end if
  end function pop

  ! Push into a stack
  ! : スタックに n をトップノードとして付け加える
  !
  ! :param  integer n
  subroutine push(n)
    implicit none
    integer, intent(IN) :: n

    if (p < pmax) then
      p = p + 1                     ! 最後の要素の位置を右に 1 つずらす
      buf(p) = n                    ! 要素を付け加える
    else
      print * "Stack overflow!"
    end if
  end subroutine push
end module stack
{% endhighlight %}

そして、実行部分。

File: `test_stack.f95`

{% highlight fortran linenos %}
!****************************************************
! テスト (Stack モジュール)
!
! date          name            version
! 2018.08.21    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program main
  use stack
  implicit none
  integer :: i

  ! 1, 2, 3 を push
  do i = 1, 3
    call push(i)
  enddo

  ! 3 回 pop
  do i = 1, 3
    print *, pop()
  enddo

  stop
end program main
{% endhighlight %}

* [Gist - Fortran 95 source code to test stack implementation.](https://gist.github.com/komasaru/6b8639f96bce5ad101ea2226f2c74e54 "Gist - Fortran 95 source code to test stack implementation.")

### 2. ソースコードのコンパイル

``` text
$ gfortran -o test_stack stack.f95 test_stack.f95
```

ちなみに、上の1行の方法ではなく `make` でビルドするなら、以下のように Makefile を作成する。（当方の例。行頭のインデントはタブ）

File: `Makefile`

{% highlight text linenos %}
FC = gfortran
CFLAGS = -c -O
TARGET = test_stack
OBJS = stack.o test_stack.o
MODS = stack.mod

.SUFFIXES: .f95

all: $(TARGET)

$(TARGET): $(OBJS)
	$(FC) -o $@ $(OBJS)

.f95.mod:
	$(FC) $(CFLAGS) $<

.f95.o:
	$(FC) $(CFLAGS) $<

clean:
	@rm -f $(TARGET) $(OBJS) $(MODS)
{% endhighlight %}

### 3. 動作確認

``` text
$ ./test_stack
           3
           2
           1
```

### 4. 応用

同じスタックモジュールを使用して、逆ポーランド記法による電卓を作成してみた。

File: `rpn.f95`

{% highlight fortran linenos %}
!****************************************************
! 逆ポーランド記法 (Stack モジュール使用)
!
! date          name            version
! 2018.08.21    mk-mode.com     1.00 新規作成
!
! Copyright(C) 2018 mk-mode.com All Rights Reserved.
!****************************************************
!
program main
  use stack
  implicit none
  character(len=80) :: buf
  integer :: i

  print '(A)', "Calculator by Reverse Polish Notation."
  do
    read (*,'(A80)') buf
    if (len(trim(buf)) == 0) exit

    do i = 1, len(trim(buf))
      select case (buf(i:i))
      case (" ")
        cycle
      case ("0":"9")
        call push(ichar(buf(i:i)) - ichar('0'))
      case ("+")
        call push(pop() + pop())
      case ("-")
        call push(- pop() + pop())
      case ("*")
        call push(pop() * pop())
      case ("=")
        exit
      case default
        print *, "Unknown operator."
        exit
      end select
    enddo

    print '(A,I15)', "Ans: ", pop()
  enddo

  stop
end program main
{% endhighlight %}

（モジュール部分は前項のものと同じ）

* [Gist - Fortran 95 source code to compute with Reverse Polish Notation method.](https://gist.github.com/komasaru/ec30b23db60226d89bec58b5a5daddb0 "Gist - Fortran 95 source code to compute with Reverse Polish Notation method.")

コンパイル。

``` text
$ gfortran -o rpn stack.f95 rpn.f95
```

ちなみに、上の1行の方法ではなく `make` でビルドするなら、以下のように Makefile を作成する。（当方の例）

File: `Makefile`

{% highlight text linenos %}
FC = gfortran
CFLAGS = -c -O
TARGET = rpn
OBJS = stack.o rpn.o
MODS = stack.mod

.SUFFIXES: .f95

all: $(TARGET)

$(TARGET): $(OBJS)
	$(FC) -o $@ $(OBJS)

.f95.mod:
	$(FC) $(CFLAGS) $<

.f95.o:
	$(FC) $(CFLAGS) $<

clean:
	@rm -f $(TARGET) $(OBJS) $(MODS)
{% endhighlight %}

そして、実行。（空 ENTER で終了）

``` text
$ ./rpn
Calculator by Reverse Polish Notation.
1 3 4 * + 5 + =
Ans:              18
1 2 + 4 5 + * =
Ans:              27

```

---

以上、

