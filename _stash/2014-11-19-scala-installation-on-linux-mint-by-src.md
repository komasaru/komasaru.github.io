---
layout   : single
title    : "Scala - Linux Mint へインストール（アーカイブファイル使用）！"
published: true
date     : 2014-11-19 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Scala
- LinuxMint
---

パッケージを使用すれば Scala のインストールが容易ですが、若干バージョンが古いです。

そこで、最新のアーカイブファイルをダウンロードしてインストールしてみました。（当方は普段は Scala を使用しませんが、ベンチマーク比較用として環境を用意しておく必要がでてきたため）

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。
* インストールする Scala は 2.11.2 （当記事執筆時点（数週間前）で最新）とする。

### 1. アーカイブファイル準備

"[Download - The Scala Programming Language](http://www.scala-lang.org/download/ "")" から最新版のアーカイブファイルをダウンロード。（以下は `wget` コマンドでのダウンロード）

``` text
$ wget http://downloads.typesafe.com/scala/2.11.2/scala-2.11.2.tgz
```

### 2. Scala インストール

アーカイブファイルを展開。

``` text
$ tar zxvf scala-2.11.2.tgz
```

そして、展開したディレクトリを適切な位置へ移動。（ここでは "/usr/local/share/" ディレクトリ配下へ移動）

``` text
$ sudo mv scala-2.11.2 /usr/local/share/
```

### 3. 環境変数設定

"~/.profile", "~/.bashrc" 等に以下の記述を追加。（以下は当方の記述例で、一旦シェル変数設定後に環境変数を設定する方法）

File: `~/.profile`

{% highlight bash linenos %}
SCALA_HOME=/usr/local/share/scala-2.11.2
PATH=$SCALA_HOME/bin:$PATH
export PATH SCALA_HOME
{% endhighlight %}

即時反映。（もしくは、再ログイン）（以下は "~/.profile" の例）

``` text
$ source ~/.profile
```

### 4. インストール確認

``` text
$ scala -version
Scala code runner version 2.11.2 -- Copyright 2002-2013, LAMP/EPFL
```

### 5. 動作確認用ソースコード作成

例として、単純に文字列をループしながら出力するソースコードを作成。

File: `Hello.scala`

{% highlight scala linenos %}
object Hello {
    def main(args: Array[String]) {
        for (i <- 0 to 4) {
            sayHello
        }
    }

    def sayHello() {
        println( "Hello Scala!" )
    }
}
{% endhighlight %}

### 6. 動作確認（インタプリタ形式）

コンパイルせず、インタプリタで実行。  
構文等に問題がなければ正常に実行されるはず。

``` text
$ scala Hello.scala
Hello Scala!
Hello Scala!
Hello Scala!
Hello Scala!
Hello Scala!
```

### 7. 動作確認（コンパイル形式）

ソースコードをコンパイル。

``` text
$ scalac Hello.scala
```

構文等に問題がなければ 各種 class ファイルが作成されるはず。

そして、実行。

``` text
$ scala -cp . Hello
Hello Scala!
Hello Scala!
Hello Scala!
Hello Scala!
Hello Scala!
```

### 9. 参考サイト

* [Scalaのインストール - プログラミング言語Scala 日本語情報サイト](https://sites.google.com/site/scalajp/home/installation "Scalaのインストール - プログラミング言語Scala 日本語情報サイト")

---

昔 Cygwin 環境で Scala を使用したことはありましたが、 Linux 環境で実行できる環境を用意していなかったので環境を整えてみた次第です。

以上。

