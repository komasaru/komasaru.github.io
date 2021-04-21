---
layout   : single
title    : "CentOS 6.5 - Python インストール（ソースビルド）！"
published: true
date     : 2014-01-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Python
---

前回は CentOS 6.5 サーバ上でログ監視ツール SWATCH の導入を行いました。  
今回はプログラミング言語 Python をソースをビルドしてインストールします。

<!--more-->

### 0. 前提条件

- CentOS 6.5(x86_64) を Minimal で最小インストールしている。
- クライントマシンは Linux Mint 14(64bit) を想定。
- デフォルトでインストールされている Python 2.6.6 はアンインストールせず、Python 3.3.3 をインストールし、 2.6.6 と 3.3.3 を共存させる。  
  （`python` コマンドと `python3.3` コマンドで使い分ける）
- 「デフォルトでインストールされている Python をアンインストールすることはサーバ管理上悪影響を与えるので危険である」ということを理解しておく。
- 過去にこのサイトを参考にして作業した際に記録していたものを参照している。

### 1. Python バージョン確認

インストール済み（現状）の Python のバージョンを確認してみる。

``` text
# python -V
Python 2.6.6
```

`--version` オプションでもよい。

### 2. 必要パッケージインストール

``` text
# yum install zlib-devel \
openssl-devel \
readline-devel \
ncurses-devel \
sqlite-devel \
expat-devel \
bzip2-devel \
tcl-devel \
tk-devel \
gdbm-devel \
libbsd-devel
```

### 3. アーカイブダウンロード＆展開

`http://www.python.jp/download/` から最新安定版（当記事執筆時点では 3.3.3）のアーカイブ（今回は tgz 版）をダウンロード・展開する。

``` text
# cd /usr/local/src
# wget http://www.python.org/ftp/python/3.3.3/Python-3.3.3.tgz
# tar zxvf Python-3.3.3.tgz
```

### 4. ビルド＆インストール

複数系統インストールすることも考慮して `configure` オプションで `--prefix` を指定している。（複数系統インストールすることを考慮しないのなら `prefix` は指定しなくてもよい）  
また、あらゆるサイト等で紹介されている `--enable-shared` のオプションは、メリットがない（むしろ問題点がある）ので使用しない。

``` text
# cd  Python-3.3.3
# ./configure --prefix=/usr/local/python-3.3
# make
# make install
```

もし、ビルドソースに問題がないか等をテストしたければ、 `make` のあとで `make test` でチェックしてみるとよいでしょう。

また、複数バージョン混在させるなら `make altinstall` でインストールするとよいらしい。

### 5. 環境変数 PATH 設定

パスを通すために ` .bash_profile` に以下のような記述を追加する。

File: `~/.bash_profile`

{% highlight bash linenos %}
export PATH=/usr/local/python-3.3/bin:$PATH
{% endhighlight %}

もしくは、以下のようにシンボリックリンクを貼る方法でもよいだろう。

``` text
# ln -s /usr/local/python-3.3/bin/python3.3 /usr/local/bin/python-test
```

### 6. インストール確認

``` text
# python3.3 -V
Python 3.3.3
```

### 7. 動作確認

対話形式で確認してみる。（ユークリッドの互除法で再帰的に最大公約数を求めてみる）  
（対話形式を終了するには `CTRL-D`）

``` text
# python3.3
Python 3.3.3 (default, Jan 22 2014, 09:48:06)
[GCC 4.4.7 20120313 (Red Hat 4.4.7-4)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> def gcd(a, b):
...     if b == 0:
...             return a
...     else:
...             return gcd(b, a % b)
...
>>> print "The GCD for (123, 45): %d" %(gcd(123, 45))
The GCD for (123, 45): 3
>>>
```

上記と同じことをファイルを作成して実行してみる。

File: `gcd.py`

{% highlight python linenos %}
def gcd(a, b):
    if b == 0:
        return a
    else:
        return gcd(b, a % b)

print "The GCD for (123, 45): %d" %(gcd(123, 45))
{% endhighlight %}

``` text
# python3.3 gcd.py
The GCD for (123, 45): 3
```

ちなみに、Ruby だと以下のようになる。（基本的には Python と同様（インデントとその全行行末のコロン以外同様）に書けるけど、より簡素に書き換えてみた）

File: `gcd.rb`

{% highlight ruby linenos %}
def gcd(a, b) return b == 0 ? a : gcd(b, a % b) end
puts "The GCD for (123, 45): #{gcd(123, 45)}"
{% endhighlight %}

### 参考サイト

- [プログラミング言語 Python](http://www.python.jp/ "プログラミング言語 Python")

---

次回は、Web カメラを構築（USB カメラによる静止画自動保存）する方法について紹介する予定です。

以上。

