---
layout   : single
title    : "GCC - 最新版をソースビルドでインストール(on CentOS)！"
published: true
date     : 2014-10-02 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- GCC
- C言語
- Fortran
- CentOS
---

こんばんは。

パッケージでインストールされる GCC(GNU Compiler Collection) はバージョンが若干古く、新しいバージョンで搭載された機能を試す（使用する）ことができません。  
（例えば、旧バージョンでは boost ライブラリを使用しなければならなかった "regex" が標準で使用できるようになっている、等）

そこで、最新バージョンをソースをビルドしてインストールしてみました。（今回は CentOS 7.0(x86_64) へ）

<!--more-->

### 0. 前提条件

- CentOS 7.0(x86_64) サーバでの作業を想定しているが、 RedHat 系は同様と思われる。
- パッケージ版 GCC インストール済み。（バージョンは 4.8.2 を想定）
- 新たにインストールする GCC は 4.9.1 を想定。（当記事執筆時点で最新バージョン）
- インストール先は "/usr/local/gcc-4.9.1" を想定。
- コンパイルできるようにする言語は C, C++, Fortran とする。  
  （Linux Mint 環境ではこれらに加えて Objective-C もインストールしたが、当方サーバ環境では Objective-C を使用することもないし、 GNUstep Base の関連の導入が面倒であったので Objective-C はインストールしないこととした）
- インストール済みのパッケージ版 GCC は他のパッケージ管理等で影響が出ると面倒なのでアンインストールしない。
- 念の為、インストール済みパッケージをアップデートしておく。
- 全ての作業をスーパーユーザで行う。

### 1. アーカイブダウンロード

ミラーサイト一覧「[GCC mirror sites - GNU Project - Free Software Foundation (FSF)](https://gcc.gnu.org/mirrors.html "GCC mirror sites - GNU Project - Free Software Foundation (FSF)")」から適当なサイトを選んでアーカイブ（サイズ：約110MB）をダウンロードする。  
そして、展開しておく。

``` text
# wget http://ftp.tsukuba.wide.ad.jp/software/gcc/releases/gcc-4.9.1/gcc-4.9.1.tar.gz
# tar zxvf gcc-4.9.1.tar.gz
```

### 2. 依存パッケージインストール

`download_prerequisites` を実行することで依存パッケージ(MPFR, GMP, MPC, ISL, CLOOG)がインストールされる（シンボリックリンクが張られる）。

``` text
# cd gcc-4.9.1
# ./contrib/download_prerequisites
```

ちなみに、CentOS(Redhat 系）の場合 `glibc-devel` パッケージをインストールしておく必要があるが、 CentOS 7.0 未満なら 32bit 版でも 64bit 版とも i686 版を、CentOS 7.0 なら x86_64 版となる。

### 3. ビルド＆インストール

ビルド用ディレクトリを作成し、 `configure`, `make`, `make install` を行う。  
C, C++, Objective-C, Objective-C++, Fortran, Java, Ada, Go がインストール可能であるが、今回は C, C++, Fortran をインストールする。  

``` text
# cd ..
# mkdir build
# cd build
# ../gcc-4.9.1/configure --prefix=/usr/local/gcc-4.9.1 --enable-languages=c,c++,fortran --disable-multilib --disable-bootstrap
# export LD_LIBRARY_PATH=/usr/local/gcc-4.9.1/lib:$LD_LIBRARY_PATH
# export LIBRARY_PATH=/usr/lib/x86_64-linux-gnu
# export C_INCLUDE_PATH=/usr/include/x86_64-linux-gnu
# export CPLUS_INCLUDE_PATH=/usr/include/x86_64-linux-gnu
# make
# make install
```

- `configure` の `--enable-languages` でインストールする言語を指定する。  
  今回は `c,c++,fortran` とした。他に指定可能の言語は `ada`, `go`, `java`, `objc`, `obj-c++` で、全てインストールする場合は `all` を指定する。  
  （インストールする言語を明示しない場合は、 C, C++, Objective-C, Fortran, Java がデフォルトでインストールされる）
- `configure` の `--disable-multilib` オプションは 32bit ライブラリを探そうとしないようにするために付加する。  
  （現時点では 64bit のみの開発を想定しているため）  
- `configure` の `--disable-bootstrap` は bootstrap ビルドを行わないオプション。  
  コンパイルを３回繰り返して行い自分自身を完璧なものにするためのオプションらしいが、時間がかかるらしいので無効化（ビルド１回に）する。（それで問題ないようなので）
- `make` の直前の `export` コマンドはパスが通ってないことによるエラーを回避するため。
- `make -j 4` 等のように並列化して高速化を図っても良いだろう。

ちなみに、当方の非力な環境で `make` に約2時間、 `make install` に約3分かかった。

### 4. シンボリックリンク設定

既にインストール済みの旧バージョンの GCC を共存させたいので、以下のようにパスの通っているディレクトリに名前を付けてシンボリックリンクを張る。

``` text
# ln -s /usr/local/gcc-4.9.1/bin/gcc /usr/local/bin/gcc49
# ln -s /usr/local/gcc-4.9.1/bin/g++ /usr/local/bin/g++49
# ln -s /usr/local/gcc-4.9.1/bin/gfortran /usr/local/bin/gfortran49
```

### 5. パス設定

bash 設定ファイルでライブラリパスの設定を行う。（以下は "/etc/profile" に設定する例）

File: `/etc/profile`

{% highlight bash linenos %}
LD_LIBRARY_PATH=/usr/local/lib:/usr/lib;
export LD_LIBRARY_PATH
{% endhighlight %}

### 6. 動作確認

バージョンを表示させてインストールできているか確認してみる。

``` text
# gcc --version
gcc (GCC) 4.8.2 20140120 (Red Hat 4.8.2-16)
Copyright (C) 2013 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# g++ --version
g++ (GCC) 4.8.2 20140120 (Red Hat 4.8.2-16)
Copyright (C) 2013 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# gfortran --version
GNU Fortran (GCC) 4.8.2 20140120 (Red Hat 4.8.2-16)
Copyright (C) 2013 Free Software Foundation, Inc.

GNU Fortran comes with NO WARRANTY, to the extent permitted by law.
You may redistribute copies of GNU Fortran
under the terms of the GNU General Public License.
For more information about these matters, see the file named COPYING

# gcc49 --version
gcc49 (GCC) 4.9.1
Copyright (C) 2014 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# g++49 --version
g++49 (GCC) 4.9.1
Copyright (C) 2014 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# gfortran49 --version
GNU Fortran (GCC) 4.9.1
Copyright (C) 2014 Free Software Foundation, Inc.

GNU Fortran comes with NO WARRANTY, to the extent permitted by law.
You may redistribute copies of GNU Fortran
under the terms of the GNU General Public License.
For more information about these matters, see the file named COPYING
```

既存の GCC も今回ソースインストールした GCC も問題なくバージョン情報が表示されることを確認。

### 7. 動作確認・その２

実際に簡単なソースコードを作成し、ビルドして動作を確認してみる。  
例として、1 から 100 までの総和を求めるコードを作成した。（C++ はオブジェクト指向コーディング）

#### 7-1. C テスト

File: `TestSumC.c`

{% highlight c linenos %}
#include <stdio.h>

void main()
{
    int iMax = 100;
    int i, iSum;
    for (i = 1; i <= iMax; i++) iSum += i;
    printf("1 + ... + %d = %d\n", iMax, iSum);
}
{% endhighlight %}

``` text
$ gcc49 -o TestSumC TestSumC.c
$ ./TestSumC
1 + ... + 100 = 5050
```

#### 7-2. C++ テスト

File: `TestSumCPP.cpp`

{% highlight c linenos %}
#include <iostream>

using namespace std;

class Proc
{
    int i;
    int iSum;
public:
    Proc();
    void calc(int);
    int  getSum();
};

Proc::Proc(){
    iSum = 0;
}

void Proc::calc(int m)
{
    for (i = 1; i <= m; i++) iSum += i;
}
int Proc::getSum() {
    return iSum;
}

int main()
{
    int iMax = 100;
    Proc objMain;
    objMain.calc(iMax);
    cout << "1 + ... + " << iMax << " = " << objMain.getSum() << endl;
    return 0;
}
{% endhighlight %}

``` text
$ g++49 -o TestSumCpp TestSumCpp.cpp
$ ./TestSumCPP
1 + ... + 100 = 5050
```

#### 7-3. Fortran テスト

File: `TestSumF.f95`

{% highlight fortran linenos %}
program TestSumF
  integer :: iMax = 100
  integer :: i, iSum = 0

  do i = 1, iMax
    iSum = iSum + i
  enddo
  write(*, "(a,i3,a,i4) ") "1 + ... + ", iMax, " = ", iSum
end program TestSumF
{% endhighlight %}

``` text
$ gfortran49 -o TestSumF TestSumF.f95
$ ./TestSumF
1 + ... + 100 = 5050
```

### 8. その他

新しいバージョンの GCC でコンパイルしたものがライブラリの関係で正常に動作しないこともあるかも知れない。（"libstdc++.so.6" 関連等）  
その場合は適切にライブラリパスの設定を行う必要があるだろう。（既存の "libstdc++.so.6" を 新しい "libstdc++.so.6" と置き換える等）

### 参考サイト

- [GCC, the GNU Compiler Collection - GNU Project - Free Software Foundation (FSF)](https://gcc.gnu.org/ "GCC, the GNU Compiler Collection - GNU Project - Free Software Foundation (FSF)")

インストールに関しては

- [Installing GCC - GCC Wiki](https://gcc.gnu.org/wiki/InstallingGCC "Installing GCC - GCC Wiki")

---

通常はパッケージでインストールできる GCC で十分でしょうが、新しい機能を標準で利用したかったらソースからインストールしてみるのもよいでしょう。

以上。

