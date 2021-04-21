---
layout   : single
title    : "ベンチマーク - C, C++, Objective-C, Java, Scala, Ruby, Python！"
published: true
date     : 2014-11-21 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- C言語
- Java
- Scala
- Ruby
- Python
---

各種プログラミング言語、 C, C++, Objective-C, Java, Scala, Ruby, Python でベンチマークテストを行ってみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。
* メソッド呼び出しを 2^31 - 1 (= 2,147,483,647) 回 行う。
* 使用した言語のバージョン
  - GCC 4.8.2 （パッケージインストール）
  - GCC 4.9.1 （ソースビルドインストール）
  - Oracle Java 1.8.0_05 （アーカイブインストール）
  - Scala 2.11.2 （アーカイブインストール）
  - Ruby 1.9.3-p484 （パッケージインストール）
  - Ruby 2.1.3-p242 （ソースビルドインストール）
  - Python 2.7.6 （パッケージインストール）
  - Python 3.4.0 （ソースビルドインストール）

### 1. 作成ソースコード・スクリプト

"[A benchmark to estimate time to invoke a method](http://dvcs.servehttp.com/op/Looping/file/dab1e83799e4?revcount=120 "A benchmark to estimate time to invoke a method")" のコード・スクリプトを参考にした。

#### 1-1. C 言語

File: `BenchC.c`

{% highlight c linenos %}
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <sys/time.h>

typedef struct {
    int n0;
} Bench;

int calc(Bench *s, int n){
    int n1 = s->n0 + (1 - 2 * (n % 2));
    s->n0 = n;
    return n1;
}

double gettimeofday_sec()
{
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec + (double)tv.tv_usec * 1e-6;
}

int main(){
    // Declaration
    unsigned int i;
    int          n = 1;
    double       t1, t2;

    // Instantiation
    Bench *objBench = (Bench *)malloc(sizeof(Bench));
    objBench->n0 = 0;

    // Main process
    t1 = gettimeofday_sec();
    for (i = 0; i < INT_MAX; i++) {
        n = calc(objBench, n);
    }
    t2 = gettimeofday_sec();
    printf("C\t-> %8.4f secs.\n", t2 - t1);

    // Finish
    free(objBench);
    return 0;
}
{% endhighlight %}

コンパイル。

``` text
$ gcc -Wall -O2 -o BenchC BenchC.c
```

#### 1-2. C++

File: `BenchCpp.cpp`

{% highlight c linenos %}
#include <stdio.h>
#include <iostream>
#include <limits.h>
#include <sys/time.h>

using namespace std;

class Bench {
public:
    Bench();
    int calc(int n);
private :
    int n0;
};

Bench::Bench(){
    n0 = 0;
}

int Bench::calc(int n){
    int n1 = n0 + (1 - 2 * (n % 2));
    n0 = n;
    return n1;
}

double gettimeofday_sec()
{
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec + (double)tv.tv_usec * 1e-6;
}

int main(){
    // Declaration
    unsigned int i;
    int          n = 1;
    double       t1, t2;

    // Instantiation
    Bench *objBench = new Bench();

    // Main process
    t1 = gettimeofday_sec();
    for (i = 0; i < INT_MAX; i++) {
        n = objBench->calc(n);
    }
    t2 = gettimeofday_sec();
    printf("C++\t-> %8.4f secs.\n", t2 - t1);

    // Finish
    delete objBench;
    return 0;
}
{% endhighlight %}

コンパイル。

``` text
$ g++ -Wall -O2 -o BenchCpp BenchCpp.cpp
```

#### 1-3. Objective-C

File: `BenchM.m`

{% highlight c linenos %}
#import <stdio.h>
#import <Foundation/NSObject.h>
#import <limits.h>
#import <sys/time.h>

@interface Bench : NSObject {
    int n0;
}
- (id)init;
- (int)calc:(int)n;
@end

@implementation Bench
- (id)init{
    [super init];
    n0 = 0;
    return self;
}
- (int)calc:(int)n {
    int n1 = n0 + (1 - 2 * (n % 2));
    n0 = n;
    return n1;
}
@end

double gettimeofday_sec()
{
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec + (double)tv.tv_usec * 1e-6;
}

int main(){
    // Declaration
    unsigned int i;
    int          n = 1;
    double       t1, t2;

    // Instantiation
    id objBench = [[Bench alloc] init];

    // Main process
    t1 = gettimeofday_sec();
    for(i = 0; i < INT_MAX; i++){
        n = [objBench calc:n];
    }
    t2 = gettimeofday_sec();
    printf("Obj-C\t-> %8.4f secs.\n", t2 - t1);

    // Finish
    return 0;
}
{% endhighlight %}

コンパイル。

``` text
$ gcc -Wall -O2 -o BenchM BenchM.m -lobjc -lgnustep-base -I/usr/include/GNUstep
```

#### 1-4. Java

File: `BenchJava.java`

{% highlight java linenos %}
class Bench {
    int n0;

    Bench() {
        n0 = 0;
    }

    int calc(int n) {
        int n1 = n0 + (1 - 2 * (n % 2));
        n0 = n;
        return n1;
    }
}

class BenchJava {
    public static void main(String[] args) {
        // Declaration
        int  n = 1;
        long t1, t2;

        // Instantiation
        Bench objBench = new Bench();

        // Main process
        t1 = System.currentTimeMillis();
        for(int i = 0; i < Integer.MAX_VALUE; i++) {
            n = objBench.calc(n);
        }
        t2 = System.currentTimeMillis();
        System.out.printf("Java\t-> %8.4f secs.\n", (float)(t2 - t1)/1000);
    }
}
{% endhighlight %}

コンパイル。

``` text
$ javac BenchJava.java
```

#### 1-5. Scala

File: `BenchScala.scala`

{% highlight scala linenos %}
class Bench {
    def calc(n:Int): Int = {
        var n1 = n0 + (1 - 2 * (n % 2))
        n0 = n;
        return n1;
    }
    private var n0:Int = 0
}

object BenchScala {
    def main(args :Array[String]):Unit = {
        // Declaration
        var n = 1

        // Instantiation
        var o = new Bench

        // Main process
        var t1 = System.currentTimeMillis
        for(i <- 0 to Integer.MAX_VALUE - 1){
            n = o.calc(n);
        }
        var t2 = System.currentTimeMillis
        printf("scala\t-> %8.4f secs.\n", (t2 - t1) / 1000.0)
    }
}
{% endhighlight %}

コンパイル。

``` text
$ scalac BenchScala.scala
```

#### 1-6. Ruby

以下は `ruby` が "/usr/bin/ruby" にある場合の例。（インストール状況によりパスを変更すること。 "/usr/bin/env ruby" にしたり、シェバングを使用せずに `ruby` コマンドで当スクリプトを指定して実行してもよい）

File: `bench_ruby.rb`

{% highlight ruby linenos %}
#!/usr/bin/ruby
class Bench
  def initialize
    @n0 = 0
  end

  def calc(n)
    n1 = @n0 + (1 - 2 * (n % 2))
    @n0 = n
    n1
  end
end

if __FILE__ == $0
  # Declaretion
  i = 0
  n = 1

  # Instantiation
  obj_bench = Bench.new

  # Main Process
  t1 = Time.now
  while i < 2147483647
    n = obj_bench.calc(n)
    i += 1
  end
  t2 = Time.now
  printf("Ruby\t-> %8.4f secs.\n", t2 - t1)
end
{% endhighlight %}

#### 1-7. Python

以下は `python` が "/usr/bin/pyhon" にある場合の例。（インストール状況によりパスを変更すること。 "/usr/bin/env python" にしたり、シェバングを使用せずに `python` コマンドで当スクリプトを指定して実行してもよい）

File: `bench_python.py`

{% highlight python linenos %}
#!/usr/bin/python
import time

class Bench:
  def __init__(self):
    self.n0 = 0

  def calc(self, n):
    n1 = self.n0 + (1 - 2 * (n % 2))
    self.n0 = n
    return n1

if __name__ == "__main__":
  # Declaration
  i = 0
  n = 1

  # Instantiation
  obj_bench = Bench()

  # Main Process
  t1 = time.time()
  while i < 2147483647
    n = obj_bench.calc(n)
    i += 1
  t2 = time.time()
  print("Python\t-> %8.4f secs." %(t2 - t1))
{% endhighlight %}

### 2. 実行

それぞれ何回か実行した平均的な値。

``` text
$ ./BenchC
C       ->   4.9577 secs.        # <= GCC 4.8.2

$ ./BenchC
C       ->   0.7050 secs.        # <= GCC 4.9.1

$ ./BenchCpp
C++     ->   5.0470 secs.        # <= G++ 4.8.2

$ ./BenchCpp
C++     ->   4.9888 secs.        # <= G++ 4.9.1

$ ./BenchM
Obj-C   ->  14.9532 secs.        # <= GCC 4.8.2

$ ./BenchM
Obj-C   ->  14.8954 secs.        # <= GCC 4.9.1

$ java BenchJava
Java    ->   6.8070 secs.        # <= Java 1.8.0_05

$ scala -cp . BenchScala
scala   ->  10.0480 secs.        # <= Scala 2.11.2

-> % ./bench_ruby.rb
Ruby    -> 309.2438 secs.        # <= Ruby 1.9.3-p484

$ ./bench_ruby.rb
Ruby    -> 255.8539 secs.        # <= Ruby 2.1.3-p242

$ ./bench_python.py
Python  -> 920.2962 secs.        # <= Python 2.7.6

$ ./bench_python.py
Python  -> 1070.3830 secs.       # <= Python 3.4.0
```

### 3. 所感等

* C < C++ < Java < Scala < Objective-C <<< Ruby < Python という結果となった。
* GCC(G++) は 4.8.2 より 4.9.1 の方が高速である。（C に関しては大幅に高速化される）
* Objective-C は C, C++ に比べるとかなり遅い。
* Objective-C は Java, Scala よりも遅い。
* 当然ながら、Ruby, Python のスクリプト言語はかなり遅い。（特に Python はかなり遅い）
* Python はパッケージでインストールした 2.7.6 の方が、ソースをビルドしてインストールした 3.4.0 より若干高速。
* 例えば、Ruby は C++ の約50倍遅いわけだが、言い換えれば C++ で 1ms で終わる処理が Ruby では 50ms かかるということであり、日常生活ではそれほど困ることはないだろう。（大きな処理でなければ）
* 今回はあくまでも単純なメソッド呼び出しだったが、処理よっては速度も異なるだろう。  
  言語により得手不得手があるので、一概に評価はできない、ということ。

### 参考サイト

* [A benchmark to estimate time to invoke a method](http://dvcs.servehttp.com/op/Looping/file/dab1e83799e4?revcount=120 "A benchmark to estimate time to invoke a method")

---

機会があれば他の言語でもベンチマークテストを行ってみてもよいかも知れない。

以上。

