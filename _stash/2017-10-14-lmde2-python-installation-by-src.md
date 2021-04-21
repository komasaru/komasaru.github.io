---
layout   : single
title    : "LMDE 2 - Python 3.6 インストール（ソースビルド）！"
published: true
date     : 2017-10-14 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- LMDE2
- Linux
- Python
---

汎用プログラミング言語 Python を LIME 2 へソースをビルドしてインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* LMDE 2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。
* デフォルトでインストールされている Python 2.7.9, 3.4.2 はアンインストールせず、Python 3.6.2 をインストールし、それらと共存させる。  
  （`python`, `python3.4`, `python3.6` コマンドで使い分ける）
* 「デフォルトでインストールされている Python をアンインストールすることはサーバ管理上悪影響を与えるので危険である」ということを理解しておく。

### 1. Python のバージョン確認

インストール済み（現状）の Python のバージョンを確認してみる。

``` text
$ python -V
Python 2.7.9

$ python3.4 -V
Python 3.4.2
```

* オプションは `--version` でもよい。
* `python` は `python2` でもよい。  
  （`python2` は `python` にシンボリックリンクが張られているので）
* `python3.4` は `python3` でもよい。  
  （`python3` は `python3.4` にシンボリックリンクが張られているので）

### 2. アーカイブのダウンロード＆展開

[こちら](https://www.python.org/downloads/release/python-362/ "Python Release Python 3.6.2 - Python.org") から最新安定版（当記事執筆時点では 3.6.2）のアーカイブ（今回は tgz 版）をダウンロード・展開する。

``` text
$ wget https://www.python.org/ftp/python/3.6.2/Python-3.6.2.tgz
$ tar zxvf Python-3.6.2.tgz
```

### 3. ビルド＆インストール

``` text
$ cd Python-3.6.2
$ ./configure
$ make -j$(grep '^processor' /proc/cpuinfo | wc -l)
$ sudo make altinstall
```

`make install` だと既存の `python3` を破壊してしまうかもしれないため、 `make altinstall` で `python3.6` のみ生成するようにしている。

### 4. pip の更新

念の為、 pip を最新版に更新しておく。

``` text
# pip3.6 install --upgrade pip
Requirement already up-to-date: pip in /usr/local/lib/python3.6/site-packages
```

### 5. pip.conf の作成

``` text
# pip3.6 list
```

を実行した際に、

``` text
DEPRECATION: The default format will switch to columns in the future. 
You can use --format=(legacy|columns) (or define a format=(legacy|columns) 
in your pip.conf under the [list] section) to disable this warning.
```

と非推奨の警告が出力されるので、以下の内容で "pip.conf" を作成する。（全ユーザ共通で設定したい場合）

File: `/etc/pip.conf`

{% highlight bash linenos %}
[list]
format=columns
{% endhighlight %}

* `columns` は `legacy` でもよい。（自分の好みに合わせる）
* ユーザ別に設定したい場合、ファイルは `$HOME/.config/pip/pip.conf`

### 6. インストールの確認

``` text
# python3.6 -V
Python 3.6.2

# pip3.6 -V
pip 9.0.1 from /usr/local/lib/python3.6/site-packages (python 3.6)
```

### 7. 動作確認

対話形式で確認してみる。（ユークリッドの互除法で再帰的に最大公約数を求めてみる）  
（対話形式を終了するには `CTRL-D`）

``` text
# python3.6
Python 3.6.2 (default, Aug 29 2017, 23:23:38)
[GCC 4.9.2] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> def gcd(a, b):
...     if b == 0:
...         return a
...     else:
...         return gcd(b, a % b)
...
>>> print("TheGCD for (123, 45): %d" %(gcd(123, 45)))
TheGCD for (123, 45): 3
>>>
```

上記と同じことをファイルを作成して実行してみる。

File: `gcd.py`

{% highlight python linenos %}
#!/usr/local/bin/python3.6

def gcd(a, b):
    if b == 0:
        return a
    else:
        return gcd(b, a % b)

print("The GCD for (123, 45): %d" %(gcd(123, 45)))
{% endhighlight %}

* Python 3 系では、デフォルトでエンコードが UTF-8 になっているので、 `coding: utf-8` は不要。

``` text
$ chmod +x gcd.py
$ ./gcd.py
The GCD for (123, 45): 3
```

### 8. 参考サイト

* [プログラミング言語 Python](http://www.python.jp/ "プログラミング言語 Python")
* [User Guide — pip 9.0.1 documentation](https://pip.pypa.io/en/stable/user_guide/#config-file "User Guide — pip 9.0.1 documentation")

---

以上。

