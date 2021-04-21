---
layout   : single
title    : "Debian 9 Stretch - Python 3.6 インストール（ソースビルド）！"
published: true
date     : 2017-12-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Python
---

Debian GNU/Linux 9 Stretch に Python 3.6 をソースをビルドしてインストールする方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* クライアント側は LMDE2(Linux Mint Debian Edition 2)(64bit) を想定。
* デフォルトでインストールされている Python 2.7.13, 3.5.3 はアンインストールせず、Python 3.6.3 をインストールし、 2.7.13 や 3.5.3 と共存させる。  
  （`python`, `python3.5`, `python3.6` コマンドで使い分ける）
* 「デフォルトでインストールされている Python をアンインストールすることはサーバ管理上悪影響を与えるので危険である」ということを理解しておく。

### 1. Python のバージョン確認

インストール済み（現状）の Python のバージョンを確認してみる。

``` text
# python -V
Python 2.7.13

# python3.5 -V
Python 3.5.3
```

* `--version` オプションでもよい。
* `python` は `python2` でもよい。
  （`python2` は `python` にシンボリックリンクが張られているので）
* `python3.5` は `python3` でもよい。
  （`python3` は `python3.5` にシンボリックリンクが張られているので）

### 2. 必要パッケージのインストール

``` text
# apt install -y zlib1g-dev libssl-dev libreadline-dev \
libsqlite3-dev libbz2-dev libncurses5-dev libgdbm-dev liblzma-dev \
tk-dev zlibc
```

更に必要なものがある場合、`make` 後に出力されるメッセージで確認可能。（再度 `make` する必要があるが）  
（開発に不要なものなら無視してもよいだろう）

### 3. アーカイブのダウンロード＆展開

[こちら](https://www.python.org/downloads/release/python-363/ "Python Release Python 3.6.3 - Python.org") から最新安定版（当記事執筆時点では 3.6.3）のアーカイブ（今回は tgz 版）をダウンロード・展開する。

``` text
# cd /usr/local/src
# wget https://www.python.org/ftp/python/3.6.3/Python-3.6.3.tgz
# tar zxvf Python-3.6.3.tgz
```

### 4. ビルド＆インストール

インストールを指定するなら、 `configure` オプションで `--prefix` を使用する。（例：`./configure --prefix=/usr/local/python-3.6`）  
また、あらゆるサイト等で紹介されている `--enable-shared` のオプションは、メリットがない（むしろ問題点がある）ので使用しない。

``` text
# cd  Python-3.6.3
# ./configure
# make
# make altinstall
```

`make install` だと既存の `python3` を破壊してしまうかもしれないため、 `make altinstall` で `python3.6` のみ生成するようにしている。

もし、ビルドソースに問題がないか等をテストしたければ、 `make` のあとで `make test` でチェックしてみるとよい。

### 5. 環境変数 PATH の設定

インストール先をデフォルト以外の場所にした場合、パスを通すために `/etc/profile` に以下のような記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %}
PATH=/usr/local/python-3.6/bin:$PATH
export PATH
{% endhighlight %}

そして、即時有効化。（再ログインでも可）

``` text
# source /etc/profile
```

root ユーザではなく一般ユーザに設定するなら "~/.bash_profile" に設定する。

もしくは、以下のようにシンボリックリンクを貼る方法でもよいだろう。

``` text
# ln -s /usr/local/python-3.6/bin/python3.6 /usr/local/bin/python3.6
```

### 6. pip の更新

念の為、 pip を最新版に更新しておく。

``` text
# pip3.6 install --upgrade pip
Requirement already up-to-date: pip in /usr/local/lib/python3.6/site-packages
```

### 7. pip.conf の作成

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

### 8 インストールの確認

``` text
# python3.6 -V
Python 3.6.3

# pip3.6 -V
pip 9.0.1 from /usr/local/lib/python3.6/site-packages (python 3.6)
```

### 9. 動作確認

対話形式で確認してみる。（ユークリッドの互除法で再帰的に最大公約数を求めてみる）  
（対話形式を終了するには `CTRL-D`）

``` text
# python3.6
Python 3.6.4 (default, Dec 20 2017, 11:22:19)
[GCC 6.3.0 20170516] on linux
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

{% highlight python linenos %}
def gcd(a, b):
    if b == 0:
        return a
    else:
        return gcd(b, a % b)

print("TheGCD for (123, 45): {}".format(gcd(123, 45)))
{% endhighlight %}

``` text
# python3.6 gcd.py
The GCD for (123, 45): 3
```

### 10. 参考サイト

* [プログラミング言語 Python](http://www.python.jp/ "プログラミング言語 Python")
* [User Guide — pip 9.0.1 documentation](https://pip.pypa.io/en/stable/user_guide/#config-file "User Guide — pip 9.0.1 documentation")

---

以上

