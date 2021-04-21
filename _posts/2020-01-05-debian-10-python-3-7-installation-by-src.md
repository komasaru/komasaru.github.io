---
layout   : single
title    : "Debian 10 (buster) - Python 3.7 インストール（ソースビルド）！"
published: true
date     : 2020-01-05 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Python
---

Debian GNU/Linux 10 (buster) に Python 3.7 をソースをビルドしてインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* クライアント側は LMDE 3 (Linux Mint Debian Edition 3; 64bit) を想定。
* デフォルトでインストールされている Python 2.7.16, 3.7.3 のうち 3.7.3 をアンインストールし、 2.7.16 と 3.7.4 を共存させる。  
  （`python`, `python3.7` コマンドで使い分ける）

### 1. Python のバージョン確認

インストール済み（現状）の Python のバージョンを確認してみる。

``` text
# python -V
Python 2.7.13

# python3.7 -V
Python 3.7.3
```

* `--version` オプションでもよい。
* `python` は `python2` でもよい。
  （`python2` は `python` にシンボリックリンクが張られているので）
* `python3.7` は `python3` でもよい。
  （`python3` は `python3.7` にシンボリックリンクが張られているので）

### 2. 既存 Python 3.7 のアンインストール

既にインストール済みの Python 3.7.3 をアンインストールする。  
（アンインストールせずに残しておいて、 3.7.4 と共存させてもよいが）

``` text
# apt -y remove python3
```

### 3. 必要パッケージのインストール

``` text
# apt -y install zlib1g-dev libssl-dev libreadline-dev \
libsqlite3-dev libbz2-dev libncurses5-dev libgdbm-dev liblzma-dev \
tk-dev zlibc
```

更に必要なものがある場合、`make` 後に出力されるメッセージで確認可能。（再度 `make` する必要があるが）  
（開発に不要なものなら無視してもよいだろう）

### 4. アーカイブのダウンロード＆展開

[こちら](https://www.python.org/downloads/release/python-374/ "Python Release Python 3.7.4 - Python.org") から最新安定版（当記事執筆時点では 3.7.4）のアーカイブ（今回は tgz 版）をダウンロード・展開する。

``` text
# cd /usr/local/src
# wget https://www.python.org/ftp/python/3.7.4/Python-3.7.4.tgz
# tar zxvf Python-3.7.4.tgz
```

### 5. ビルド＆インストール

同じ 3.7 系でも複数のバージョンの Python インストールする場合は、 `configure` オプションで `--prefix` を指定する。（既存の 2.7 系とだけの共存なら、 `--prefix` は指定しなくてもよい）  
また、あらゆるサイト等で紹介されている `--enable-shared` のオプションは、メリットがない（むしろ問題点がある）ので使用しない。

``` text
# cd  Python-3.7.4
# ./configure
# make -j$(grep '^processor' /proc/cpuinfo | wc -l)
# make altinstall
```

`make install` でも問題ないかもしれない。（無確認）  
もし、ビルドソースに問題がないか等をテストしたければ、 `make` のあとで `make test` でチェックしてみるとよい。

### 6. シンボリックリンクの作成

`python3` で `python3.7` を利用できるようにするには以下のようにする。

``` text
# ln -fns /usr/local/bin/python3{.7,}
```

### 7. pip の更新

念の為、 pip を最新版に更新しておく。

``` text
# pip3.7 install --upgrade pip
```

### 8. インストールの確認

``` text
# python3.7 -V
Python 3.7.4

# pip3.7 -V
pip 19.2.3 from /usr/local/lib/python3.7/site-packages/pip (python 3.7)
```

### 9. 動作確認

対話形式で確認してみる。（ユークリッドの互除法で再帰的に最大公約数を求めてみる）  
（対話形式を終了するには `CTRL-D`）

``` text
# python3.7
Python 3.7.4 (default, Sep 30 2019, 12:05:04)
[GCC 8.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> def gcd(a, b):
...     if b == 0:
...         return a
...     else:
...         return gcd(b, a % b)
...
>>> print("TheGCD for (123, 45): {}".format(gcd(123, 45)))
TheGCD for (123, 45): 3
>>>
```

上記と同じことをファイルを作成して実行してみる。

File: `gcd.py`

{% highlight python %}
def gcd(a, b):
    if b == 0:
        return a
    else:
        return gcd(b, a % b)

print("TheGCD for (123, 45): {}".format(gcd(123, 45)))
{% endhighlight %}

``` text
# python3.7 gcd.py
The GCD for (123, 45): 3
```

### 10. 参考サイト

* [プログラミング言語 Python](http://www.python.jp/ "プログラミング言語 Python")

---

以上

