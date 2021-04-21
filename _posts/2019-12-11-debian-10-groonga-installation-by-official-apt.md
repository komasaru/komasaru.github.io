---
layout   : single
title    : "Debian 10 (buster) - 全文検索エンジン Groonga インストール（by Groonga 公式リポジトリ）！"
published: true
date     : 2019-12-11 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- Groonga
---

Debian GNU/Linux 10 (buster) にカラムストア機能付き全文検索エンジン Groonga を Groonga の公式リポジトリを使用して導入する方法についての記録です。

以前古いバージョンでの作業時に残していた記録を参考に作業を行い、今回更新した作業記録を貼付する形式の内容となっています。  
（当然ながら、興味がなければスルーしてください）

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10 (buster) での作業を想定。
* 当記事執筆時点で最新の Groonga 9.0.7 をインストールする。
* トークナイザとして MeCab を使用することを想定。
* トークンフィルタとして TokenFilterStem を使用することを想定。
* ノーマライザとして MySQL 互換の `groonga-normalizer-mysql` を使用することを想定。（将来、 Mroonga を使用することを想定）
* ここでは、全文検索がどういうものかという説明はしない。
* root ユーザでの作業を想定。
* 以下の説明内で出力するデータは、可読性を考慮して整形している。

### 1. 日本語形態素解析器 MeCab のインストール

トークナイザとして MeCab を使用する予定なので、インストールしておく。

``` text
# apt -y install mecab
```

### 2. ソースリストの追加

File: `/etc/apt/sources.list.d/groonga.list`

{% highlight bash linenos %}
deb [signed-by=/usr/share/keyrings/groonga-archive-keyring.gpg] https://packages.groonga.org/debian/ buster main
deb-src [signed-by=/usr/share/keyrings/groonga-archive-keyring.gpg] https://packages.groonga.org/debian/ buster main
{% endhighlight %}

### 3. インストール

``` text
# wget -O /usr/share/keyrings/groonga-archive-keyring.gpg https://packages.groonga.org/debian/groonga-archive-keyring.gpg
# apt -y update
# apt -y -V install groonga
```

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

### 6. Munin プラグインのインストール

（Munin プラグインを使用しないのなら、この作業は不要）

``` text
# apt -y -V install groonga-munin-plugins
```

### 7. MySQL 互換ノーマライザのインストール

（ノーマライザとして groonga-normalizer-mysql を使用しないのなら、この作業は不要）

``` text
# apt -y -V install groonga-normalizer-mysql
```

### 8. インストール確認

``` text
$ groonga --version
Groonga 9.0.7 [linux-gnu,x86_64,utf8,match-escalation-threshold=0,nfkc,mecab,msgpack,mruby,onigmo,zlib,lz4,zstd,epoll,rapidjson]

configure options: <... （ここに configure オプションの一覧） ...>
```

### 9. 動作確認

（過去記事「[Linux Mint - Groonga インストール（by ソースビルド）！](/2015/08/09/linux-mint-groonga-installation-by-src/ "Linux Mint - Groonga インストール（by ソースビルド）！")」を参照）

### 10. 参考サイト

* [Groonga - カラムストア機能付き全文検索エンジン](http://groonga.org/ja/ "Groonga - カラムストア機能付き全文検索エンジン")

---

以上。

