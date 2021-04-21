---
layout   : single
title    : "LMDE2 - Groonga インストール（by Groonga 公式リポジトリ）！"
published: true
date     : 2017-01-06 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LMDE2
- Groonga
---

オープンソースのカラムストア機能付き全文検索エンジン Groonga を LMDE2 (Linux Mint Debian Edition 2) に公式リポジトリを使用してインストールする方法についての記録です。

<!--more-->

### 0. 前提条件

* 当記事執筆時点で最新の Groonga 6.1.1 を Groonga 公式リポジトリを使用してインストールする。
* LMDE2 は Debian(Jessie) ベースの Linux ディストリビューションなので、 Debian(Jessie) 上でのインストール方法と同じである。
* トークナイザとして MeCab を使用することを想定。
* トークンフィルタとして TokenFilterStem を使用することを想定。
* ノーマライザとして MySQL 互換の groonga-normalizer-mysql を使用することを想定。（将来、 Mroonga を使用することを想定）
* Apt パッケージのインストールには `apt-get` や `aptitude` コマンドでなく `apt` コマンドを使用する。

### 1. ソースリストの追加

File: `/etc/apt/sources.list.d/groonga.list`

{% highlight bash linenos %}
deb http://packages.groonga.org/debian/ jessie main
deb-src http://packages.groonga.org/debian/ jessie main
{% endhighlight %}

### 2. インストール

``` text
$ sudo apt update
$ sudo apt install -y --allow-unauthenticated groonga-keyring
$ sudo apt update
$ sudo apt install -y -V groonga
```

### 3. トークナイザ MeCab のインストール

（トクーナイザとして MeCab を使用しないのなら、この作業は不要）

``` text
$ sudo apt install -y -V groonga-tokenizer-mecab
```

### 4. トークンフィルタ TokeFilterStem のインストール

（トークンフィルタとして TokeFilterStem を使用しないのなら、この作業は不要）

``` text
$ sudo apt install -y -V groonga-token-filter-stem
```

### 5. MySQL 互換ノーマライザのインストール

（ノーマライザとして groonga-normalizer-mysql を使用しないのなら、この作業は不要）

``` text
$ sudo apt install -y -V groonga-normalizer-mysql
```

### 6. インストール確認

``` text
$ groonga --version
Groonga 6.1.1 [linux-gnu,x86_64,utf8,match-escalation-threshold=0,nfkc,mecab,msgpack,mruby,onigmo,zlib,lz4,epoll]

configure options: < ... （ここに configure オプションの一覧） ...>
```

### 7. 動作確認

（過去記事「[Linux Mint - Groonga インストール（by ソースビルド）！]({{site.baseurl}}/2015/08/09/linux-mint-groonga-installation-by-src/ "Linux Mint - Groonga インストール（by ソースビルド）！")」を参照）

---

以上。


