---
layout   : single
title    : "Debian 8 (Jessie) - Python 3.4 インストール（ソースビルド）！"
published: true
date     : 2015-06-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Python
---

Debian GNU/Linux 8 (Jessie) に Python 3.4 をソースをビルドしてインストール方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* クライアント側は Linux Mint 17.1(64bit) を想定。
* デフォルトでインストールされている Python 2.7.9 はアンインストールせず、Python 3.4.3 をインストールし、 2.7.9 と 3.4.3 を共存させる。  
  （`python` コマンドと `python3.4` コマンドで使い分ける）
* 「デフォルトでインストールされている Python をアンインストールすることはサーバ管理上悪影響を与えるので危険である」ということを理解しておく。

### 1. Python のバージョン確認

インストール済み（現状）の Python のバージョンを確認してみる。

``` text
# python -V
Python 2.7.9
```

`--version` オプションでもよい。

### 2. 必要パッケージのインストール

``` text
# apt-get -y install zlib1g-dev libssl-dev libreadline-dev \
libsqlite3-dev libbz2-dev libncurses5-dev libgdbm-dev liblzma-dev \
tk-dev zlibc
```

更に必要なものがある場合、`make` 後に出力されるメッセージで確認可能。（再度 `make` する必要があるが）  
（開発に不要なものなら無視してもよいだろう）

### 3. アーカイブのダウンロード＆展開

"http://www.python.jp/" から最新安定版（当記事執筆時点では 3.4.3）のアーカイブ（今回は tgz 版）をダウンロード・展開する。

``` text
# cd /usr/local/src
# wget https://www.python.org/ftp/python/3.4.3/Python-3.4.3.tgz
# tar zxvf Python-3.4.3.tgz
```

### 4. ビルド＆インストール

複数系統インストールすることも考慮して `configure` オプションで `--prefix` を指定している。（複数系統インストールすることを考慮しないのなら `prefix` は指定しなくてもよい）  
また、あらゆるサイト等で紹介されている `--enable-shared` のオプションは、メリットがない（むしろ問題点がある）ので使用しない。

``` text
# cd  Python-3.4.3
# ./configure --prefix=/usr/local/python-3.4
# make
# make install
```

もし、ビルドソースに問題がないか等をテストしたければ、 `make` のあとで `make test` でチェックしてみるとよい。

また、ソースインストールで複数バージョン混在させるなら `make altinstall` でインストールするとよいらしい。

### 5. 環境変数 PATH の設定

パスを通すために `/etc/profile` に以下のような記述を追加する。

File: `/etc/profile`

{% highlight bash linenos %}
export PATH=/usr/local/python-3.4/bin:$PATH
{% endhighlight %}

そして、即時有効化。（再ログインでも可）

``` text
# source /etc/profile
```

root ユーザではなく一般ユーザに設定するなら "~/.bash_profile" に設定する。

もしくは、以下のようにシンボリックリンクを貼る方法でもよいだろう。

``` text
# ln -s /usr/local/python-3.4/bin/python3.4 /usr/local/bin/python-test
```

### 6. インストールの確認

``` text
# python3.4 -V
Python 3.4.3
```

### 7. 動作確認

対話形式で確認してみる。（ユークリッドの互除法で再帰的に最大公約数を求めてみる）  
（対話形式を終了するには `CTRL-D`）

``` text
# python3.4
Python 3.4.3 (default, May  6 2015, 11:22:57)
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

### 参考サイト

- [プログラミング言語 Python](http://www.python.jp/ "プログラミング言語 Python")

---

以上。

