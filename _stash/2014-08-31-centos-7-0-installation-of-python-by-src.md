---
layout   : single
title    : "CentOS 7.0 - Python 3.4.1 インストール（ソースビルド）！"
published: true
date     : 2014-08-31 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- Python
---

「CentOS 7.0 - Python 3.4.1 インストール（ソースビルド）」についての記録です。

（旧バージョンでの作業記録を更新しました。興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

- CentOS 7.0-1406(x86_64) を NetInstall で最小限インストールしている。
- サーバ用途なので、作業は基本的に全て一般ユーザから root になって行う。
- クライアント側は Linux Mint 17 を想定。
- デフォルトでインストールされている Python 2.7.5 はアンインストールせず、Python 3.3.3 をインストールし、 2.7.5 と 3.3.3 を共存させる。  
  （`python` コマンドと `python3.4` コマンドで使い分ける）
- 「デフォルトでインストールされている Python をアンインストールすることはサーバ管理上悪影響を与えるので危険である」ということを理解しておく。

### 1. Python バージョン確認

インストール済み（現状）の Python のバージョンを確認してみる。

``` text
# python -V
Python 2.7.5
```

`--version` オプションでもよい。

### 2. 必要パッケージインストール

``` text
# yum -y install zlib-devel openssl-devel readline-devel \
ncurses-devel sqlite-devel expat-devel bzip2-devel \
tcl-devel tk-devel gdbm-devel
```

### 3. アーカイブダウンロード＆展開

`http://www.python.jp/` から最新安定版（当記事執筆時点では 3.4.1）のアーカイブ（今回は tgz 版）をダウンロード・展開する。

``` text
# cd /usr/local/src
# wget https://www.python.org/ftp/python/3.4.1/Python-3.4.1.tgz
# tar zxvf Python-3.4.1.tgz
```

### 4. ビルド＆インストール

複数系統インストールすることも考慮して `configure` オプションで `--prefix` を指定している。（複数系統インストールすることを考慮しないのなら `prefix` は指定しなくてもよい）  
また、あらゆるサイト等で紹介されている `--enable-shared` のオプションは、メリットがない（むしろ問題点がある）ので使用しない。

``` text
# cd  Python-3.4.1
# ./configure --prefix=/usr/local/python-3.4
# make
# make install
```

もし、ビルドソースに問題がないか等をテストしたければ、 `make` のあとで `make test` でチェックしてみるとよいでしょう。

また、ソースインストールで複数バージョン混在させるなら `make altinstall` でインストールするとよいらしい。

### 5. 環境変数 PATH 設定

パスを通すために `/etc/profile` に以下のような記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %}
export PATH=/usr/local/python-3.4/bin:$PATH
{% endhighlight %}

root ユーザではなく一般ユーザに設定するなら "~/.bash_profile" に設定する。

もしくは、以下のようにシンボリックリンクを貼る方法でもよいだろう。

``` text
# ln -s /usr/local/python-3.3/bin/python3.3 /usr/local/bin/python-test
```

### 6. インストール確認

``` text
# python3.4 -V
Python 3.4.1
```

### 7. 動作確認

対話形式で確認してみる。（ユークリッドの互除法で再帰的に最大公約数を求めてみる）  
（対話形式を終了するには `CTRL-D`）

``` text
# python3.4
Python 3.4.1 (default, Aug  1 2014, 20:05:07)
[GCC 4.8.2 20140120 (Red Hat 4.8.2-16)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> def gcd(a, b):
...     if b == 0:
...         return a
...     else:
...         return gcd(b, a % b)
...
>>> print("The GCD for (123, 45): %d" % (gcd(123, 45)))
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

print("The GCD for (123, 45): %d" %(gcd(123, 45)))
{% endhighlight %}

``` text
# python3.4 gcd.py
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

以上。

