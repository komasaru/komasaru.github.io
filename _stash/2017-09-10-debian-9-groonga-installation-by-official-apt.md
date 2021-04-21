---
layout   : single
title    : "Debian 9 (Stretch) - 全文検索エンジン Groonga インストール（by Groonga 公式リポジトリ）！"
published: true
date     : 2017-09-10 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Groonga
---

Debian GNU/Linux 9 (Stretch) にカラムストア機能付き全文検索エンジン Groonga を Groonga の公式リポジトリを使用して導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 9 (Stretch) での作業を想定。
* 当記事執筆時点で最新の Groonga 7.0.4 をインストールする。
* トークナイザとして MeCab を使用することを想定。
* トークンフィルタとして TokenFilterStem を使用することを想定。
* ノーマライザとして MySQL 互換の groonga-normalizer-mysql を使用することを想定。（将来、 Mroonga を使用することを想定）
* ここでは、全文検索がどういうものかという説明はしない。
* root ユーザでの作業を想定。
* 以下の説明内で出力するデータは、可読性を考慮して整形している。

### 1. 日本語形態素解析器 MeCab のインストール

トークナイザとして MeCab を使用するので、インストールしておく。

``` text
# apt -y install mecab
```

### 2. ソースリストの追加

File: `/etc/apt/sources.list.d/groonga.list`

{% highlight bash linenos %}
deb https://packages.groonga.org/debian/ stretch main
deb-src https://packages.groonga.org/debian/ stretch main
{% endhighlight %}

### 3. インストール

``` text
# apt -y install apt-transport-https
# apt -y update
# apt -y install --allow-unauthenticated groonga-keyring
# apt -y update
# apt -y -V install groonga
```

* `apt-transport-https` は、 "/etc/apt/sources.list.d/groonga.list" 内の `https` を扱うために必要なパッケージ。

`apt update` 時に GPG 公開鍵に関するエラーが出力される場合は、以下のようにした後に再試行する。（`--keyserver` で指定するキーサーバは `keyring.debian.org` でなくとも、キーが存在するなら別のキーサーバでもよい（`keyring.debian.org`, `wwwkeys.pgp.net` 等でもよいだろうが、現時点ではキーが存在しない））

``` text
# apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 72A7496B45499429
```

GPG キー取得時に `dirmngr` が存在しない旨のエラーが出る場合は `apt -y install dirmngr` で dirmngr をインストールする。

**但し、170629 時点では、 最初の `apt -y update` で別の GPG エラーが出る**  
**170703 時点では、 "https://packages.groonga.org/debian/" の stretch が改修され、問題は解消した**

### 4. トークナイザ MeCab のインストール

（トクーナイザとして MeCab を使用しないのなら、この作業は不要）

``` text
# apt -y -V install groonga-tokenizer-mecab
```

### 5. トークンフィルタ TokeFilterStem のインストール

（トークンフィルタとして TokeFilterStem を使用しないのなら、この作業は不要）

``` text
# apt -y -V install groonga-token-filter-stem
```

### 6. MySQL 互換ノーマライザのインストール

（ノーマライザとして groonga-normalizer-mysql を使用しないのなら、この作業は不要）

``` text
# apt -y -V install groonga-normalizer-mysql
```

### 7. インストール確認

``` text
$ groonga --version
Groonga 7.0.4 [linux-gnu,x86_64,utf8,match-escalation-threshold=0,nfkc,mecab,msgpack,mruby,onigmo,zlib,lz4,zstd,epoll]

configure options: < ... （ここに configure オプションの一覧） ...>
```

### 8. 動作確認

（過去記事「[Linux Mint - Groonga インストール（by ソースビルド）！]({{site.baseurl}}/2015/08/09/linux-mint-groonga-installation-by-src/ "Linux Mint - Groonga インストール（by ソースビルド）！")」を参照）

### 9. 参考サイト

* [Groonga - カラムストア機能付き全文検索エンジン](http://groonga.org/ja/ "Groonga - カラムストア機能付き全文検索エンジン")

---

以上。

