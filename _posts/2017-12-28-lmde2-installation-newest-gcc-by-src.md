---
layout   : single
title    : "GCC - 最新版をソースビルドでインストール(on LMDE 2)！"
published: true
date     : 2017-12-28 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- GCC
- C言語
- Fortran
- ObjectiveC
- LMDE2
---

LMDE 2 (Linux Mint Debian Edition 2) へ最新版 GCC をソースビルドでインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定しているが Debian 系はどれも同様と思われる。
* パッケージ版 GCC インストール済み。（バージョンは 4.9.2 を想定）
* 新たにインストールする GCC は 7.2.0 を想定。（当記事執筆時点で最新バージョン）
* インストール先は "/usr/local/gcc-7.2.0" を想定。
* コンパイルできるようにする言語は C, C++, Objective-C, Fortran とする。
* インストール済みのパッケージ版 GCC は他のパッケージ管理等で影響が出ると面倒なのでアンインストールしない。
* 念の為、インストール済みパッケージをアップデートしておく。

### 1. アーカイブダウンロード

ミラーサイト一覧「[GCC mirror sites - GNU Project - Free Software Foundation (FSF)](https://gcc.gnu.org/mirrors.html "GCC mirror sites - GNU Project - Free Software Foundation (FSF)")」から適当なサイトを選んでアーカイブ（サイズ：約110MB）をダウンロードする。  
そして、展開しておく。

``` text
$ wget http://ftp.tsukuba.wide.ad.jp/software/gcc/releases/gcc-7.2.0/gcc-7.2.0.tar.gz
$ tar zxvf gcc-7.2.0.tar.gz
```

### 2. 依存パッケージインストール

`download_prerequisites` を実行することで依存パッケージ(MPFR, GMP, MPC, ISL, CLOOG)がインストールされる。（シンボリックリンクが張られる）

``` text
$ cd gcc-7.2.0
$ ./contrib/download_prerequisites
```

<!--
必要なアーカイブが見つからない等のエラーになるようなら、以下のように `base_url` を変更する。

File: `contrib/download_prerequisites`

{% highlight bash linenos %}
#base_url='ftp://gcc.gnu.org/pub/gcc/infrastructure/'
base_url='http://ftp.tsukuba.wide.ad.jp/software/gcc/infrastructure/'
{% endhighlight %}
-->

### 3. ビルド＆インストール

ビルド用ディレクトリを作成し、 `configure`, `make`, `make install` を行う。  
C, C++, Objective-C, Objective-C++, Fortran, Java, Ada, Go がインストール可能であるが、今回は C, C++, Objective-C, Fortran をインストールする。  

``` text
$ cd ..
$ mkdir build
$ cd build
$ ../gcc-7.2.0/configure --prefix=/usr/local/gcc-7.2.0 --enable-languages=c,c++,objc,fortran --disable-multilib --disable-bootstrap
$ export LD_LIBRARY_PATH=/usr/local/gcc-7.2.0/lib64:$LD_LIBRARY_PATH
$ export LIBRARY_PATH=/usr/lib/x86_64-linux-gnu
$ export C_INCLUDE_PATH=/usr/include/x86_64-linux-gnu
$ export CPLUS_INCLUDE_PATH=/usr/include/x86_64-linux-gnu
$ make
$ sudo make install
```

* `configure` の `--enable-languages` でインストールする言語を指定する。  
  今回は `c,c++,objc,fortran` とした。他に指定可能の言語は `ada`, `go`, `java`, `obj-c++` で、全てインストールする場合は `all` を指定する。  
  （インストールする言語を明示しない場合は、 C, C++, Objective-C, Fortran, Java がデフォルトでインストールされる）
* `configure` の `--disable-multilib` オプションは 32bit ライブラリを探そうとしないようにするために付加する。  
  （現時点では 64bit のみの開発を想定しているため）  
* `configure` の `--disable-bootstrap` は bootstrap ビルドを行わないオプション。  
  コンパイルを３回繰り返して行い自分自身を完璧なものにするためのオプションらしいが、時間がかかるらしいので無効化（ビルド１回に）する。（それで問題ないようなので）
* `make` の直前の `export` コマンドはパスが通ってないことによるエラーを回避するため。
* `make -j 4` 等のように並列化して高速化を図っても良いだろう。

ちなみに、当方の非力な環境で `make` に約30分、 `make install` に約1分かかった。

### 4. シンボリックリンク設定

既にインストール済みの旧バージョンの GCC を共存させたいので、以下のようにパスの通っているディレクトリに名前を付けてシンボリックリンクを張る。

``` text
# sudo ln -s /usr/local/gcc-7.2.0/bin/gcc /usr/local/bin/gcc72
# sudo ln -s /usr/local/gcc-7.2.0/bin/g++ /usr/local/bin/g++72
# sudo ln -s /usr/local/gcc-7.2.0/bin/gfortran /usr/local/bin/gfortran72
```

### 5. ライブラリ PATH の設定

今回インストールした GCC 用のライブラリを使用するよう PATH を設定する。（シェル（bash, zsh 等）設定ファイルに記述を追加する）

File: `~/.profile`

{% highlight bash linenos %}
LD_LIBRARY_PATH="/usr/local/gcc-7.2.0/lib64:$LD_LIBRARY_PATH"
export LD_LIBRARY_PATH
{% endhighlight %}

そして、即反映

``` text
$ source ~/.profile
```

### 6. 動作確認

バージョンを表示させてインストールできているか確認してみる。（比較のために、既存のパッケージでインストールしたものと、今回ソースビルドでインストールしたもの）

``` text
$ gcc --version
gcc (Debian 4.9.2-10) 4.9.2
Copyright (C) 2014 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

$ g++ --version
g++ (Debian 4.9.2-10) 4.9.2
Copyright (C) 2014 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

$ gfortran --version
GNU Fortran (Debian 4.9.2-10) 4.9.2
Copyright (C) 2014 Free Software Foundation, Inc.

GNU Fortran comes with NO WARRANTY, to the extent permitted by law.
You may redistribute copies of GNU Fortran
under the terms of the GNU General Public License.
For more information about these matters, see the file named COPYING

$ gcc72 --version
gcc72 (GCC) 7.2.0
Copyright (C) 2017 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

$ g++72 --version
g++72 (GCC) 7.2.0
Copyright (C) 2017 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

$ gfortran72 --version
GNU Fortran (GCC) 7.2.0
Copyright (C) 2017 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

```

既存の GCC も今回ソースインストールした GCC も問題なくバージョン情報が表示されることを確認。

### 7. 動作確認・その２

実際に簡単なソースコードを作成し、ビルドして動作を確認してみる。  
例として、1 から 100 までの総和を求めるコードを作成した。（C++, Objective-C はオブジェクト指向コーディング）

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
$ gcc72 -o TestSumC TestSumC.c
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
$ g++72 -o TestSumCpp TestSumCpp.cpp
$ ./TestSumCPP
1 + ... + 100 = 5050
```

#### 7-3. Objective-C テスト

（LMDE 2 環境では、 Object でなく NSObject を継承するために libgnustep-base-dev がインストール済みであること）

File: `TestSumM.m`

{% highlight c linenos %}
#import <Foundation/NSObject.h>

@interface Proc: NSObject {
    int i;
    int iSum;
}
-init;
-calc :(int) m;
-(int) getSum;
@end

@implementation Proc
-init
{
    iSum = 0;
    return self;
}
-calc :(int) m
{
    for (i = 1; i <= m; i++) iSum += i;
    return self;
}
-(int) getSum { return iSum; }
@end

int main() {
    int iMax = 100;
    id objMain = [[Proc alloc] init];
    [objMain calc: iMax];
    printf("1 + ... + %d = %d\n", iMax, [objMain getSum]);
    return 0;
}
{% endhighlight %}

``` text
$ g++72 -o TestSumM TestSumM.m -lobjc -lgnustep-base -I/usr/include/GNUstep
$ ./TestSumM
1 + ... + 100 = 5050
```

#### 7-4. Fortran テスト

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
$ gfortran72 -o TestSumF TestSumF.f95
$ ./TestSumF
1 + ... + 100 = 5050
```

しかし、実際には以下のようなエラーになってしまう。（要精査）

``` text
./TestSumF: error while loading shared libraries: libgfortran.so.4: 
cannot open shared object file: No such file or directory
```

> 【2018-02-02 追記】  
> GNU Fortran (GCC) 7.3.0 では、エラーにならなかった。  
> 【追記ここまで】

### 8. 参考サイト

* [GCC, the GNU Compiler Collection - GNU Project - Free Software Foundation (FSF)](https://gcc.gnu.org/ "GCC, the GNU Compiler Collection - GNU Project - Free Software Foundation (FSF)")

インストールに関しては

* [Installing GCC - GCC Wiki](https://gcc.gnu.org/wiki/InstallingGCC "Installing GCC - GCC Wiki")

---

通常はパッケージでインストールできる GCC で十分でしょうが、新しい機能を標準で利用したかったらソースからインストールしてみるのもよいでしょう。

以上。

