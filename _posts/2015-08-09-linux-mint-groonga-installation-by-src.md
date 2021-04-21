---
layout   : single
title    : "Linux Mint - Groonga インストール（by ソースビルド）！"
published: true
date     : 2015-08-09 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- LinuxMint
- Groonga
---

オープンソースのカラムストア機能付き全文検索エンジン [Groonga](http://groonga.org/ja/ "Groonga - カラムストア機能付き全文検索エンジン") を、ソースをビルドしてインストールする方法についての記録です。（最後に簡単な使用例も紹介）

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* 当記事執筆時点で最新の Groonga 5.0.5 をインストールする。
* トークナイザは、デフォルトの N-gram 方式ではなく形態素解析器 MeCab を使用することを想定。
* ここでは、全文検索がどういうものかという説明はしない。
* 以下の説明内で出力するデータは、可読性を考慮して整形している。

### 1. 依存パッケージのインストール

``` text
$ sudo apt-get -y install wget tar build-essential \
> zlib1g-dev liblzo2-dev libmsgpack-dev \
> libzmq-dev libevent-dev libmecab-dev
```

### 2. アーカーブソースの取得

アーカイブファイルをダウンロード後、展開する。

``` text
$ wget http://packages.groonga.org/source/groonga/groonga-5.0.5.tar.gz
$ tar zxvf groonga-5.0.5.tar.gz
```

### 3. ビルド＆インストール

`configure`, `make`, `make install` する。

``` text
$ cd groonga-5.0.5
$ ./configure
$ make -j$(grep '^processor' /proc/cpuinfo | wc -l)
$ sudo make install
```

* `make` の `-j$(grep '^processor' /proc/cpuinfo | wc -l)` の部分はプロセッサ数が明確なら `-j4` のように指定してもよいし、速度を気にしないのなら単に `make` のみでもよい。
* `configure` オプションについては [configure](http://groonga.org/ja/docs/install/others.html#source-configure) を参照。

そして、インストールされたかバージョンを表示して確認してみる。

``` text
$ groonga --version
groonga 5.0.5 [linux-gnu,x86_64,utf8,match-escalation-threshold=0,nfkc,mecab,msgpack,onigmo,zlib,epoll]

configure options: <>
```

### 4. 動作確認

簡単に動作確認してみる。（パスは適宜変更）  
以下は、都道府県名のローマ字表記を `_key`、都道府県名の漢字表記を `name` として登録する例。（簡易都道府県名データベース）

#### 4-1. データベースの作成

``` text
$ mkdir ~/groonga-db
$ groonga -n ~/groonga-db/test.db
```

データベース作成後は自動で対話モードに入るが、手動で対話モードへ入るには以下のようにする。

``` text
$ groonga ~/groonga-db/test.db
```

#### 4-2. テーブルの作成

``` text
> table_create --name Prefs --flags TABLE_HASH_KEY --key_type ShortText
[
  [0,1436411689.75983,0.0292973518371582],
  true
]
```

#### 4-3. テーブルの表示

```

> select --table Prefs
[
  [0,1436411701.50367,0.000922203063964844],
  [
    [
      [0],
      [
        ["_id","UInt32"],
        ["_key","ShortText"]
      ]
    ]
  ]
]
```

#### 4-4. カラムの作成

``` text
> column_create --table Prefs --name name --type ShortText
[
  [0,1436411764.36768,0.0517301559448242],
  true
]

> select --table Prefs
[
  [0,1436411783.16738,0.000133037567138672],
  [
    [
      [0],
      [
        ["_id","UInt32"],
        ["_key","ShortText"],
        ["name","ShortText"]
      ]
    ]
  ]
]
```

#### 4-5. データのロード

``` text
> load --table Prefs
[
  {"_key":"Hokkaido","name":"北海道"},
  {"_key":"Aomoriken","name":"青森県"},
           :
  ====< 途中省略 >====
           :
  {"_key":"Kagoshimaken","name":"鹿児島県"},
  {"_key":"Okinawaken","name":"沖縄県"},
]
```

もしくは、以下のようにコマンドラインから JSON 形式で作成したファイルを取り込んでもよい。

File: `load.grn`

{% highlight text linenos %}
load --table Prefs
[
  {"_key":"Hokkaido","name":"北海道"},
  {"_key":"Aomoriken","name":"青森県"},
           :
  ====< 途中省略 >====
           :
  {"_key":"Kagoshimaken","name":"鹿児島県"},
  {"_key":"Okinawaken","name":"沖縄県"},
]
{% endhighlight %}

``` text
$ groonga ~/groonga-db/test.db < load.grn
[[0,1436415458.66362,0.00340938568115234],47]
```

#### 4-6. レコードの取得

File: `"全レコードを取得（但し、先頭10件）"`

{% highlight text linenos %}
select --table Prefs
[
  [0,1436415521.50463,0.00343823432922363],
  [
    [
      [47],
      [
        ["_id","UInt32"],
        ["_key","ShortText"],
        ["name","ShortText"]
      ],
      [1,"Hokkaido","北海道"],
      [2,"Aomoriken","青森県"],
      [3,"Iwateken","岩手県"],
      [4,"Miyagiken","宮城県"],
      [5,"Akitaken","秋田県"],
      [6,"Yamagataken","山形県"],
      [7,"Fukushimaken","福島県"],
      [8,"Ibarakiken","茨城県"],
      [9,"Tochigiken","栃木県"],
      [10,"Gunmaken","群馬県"]
    ]
  ]
]
{% endhighlight %}

File: `"ID`

{% highlight text linenos %} が 32 のレコードを取得"
> select --table Prefs --query _id:32
[
  [0,1436415572.03281,0.0471560955047607],
  [
    [
      [1],
      [
        ["_id","UInt32"],
        ["_key","ShortText"],
        ["name","ShortText"]
      ],
      [32,"Shimaneken","島根県"]
    ]
  ]
]
{% endhighlight %}

File: `"KEY`

{% highlight text linenos %} が shimaneken のレコードを取得"
> select --table Prefs --query '_key:"Shimaneken"'
[
  [0,1436415572.03281,0.0471560955047607],
  [
    [
      [1],
      [
        ["_id","UInt32"],
        ["_key","ShortText"],
        ["name","ShortText"]
      ],
      [32,"Shimaneken","島根県"]
    ]
  ]
{% endhighlight %}

#### 4-7. 全文検索用の語彙表の作成

高速な全文検索を実現するためには転置インデックスが必要であるので、転置インデックスとして使用するテーブルを作成する。（トークナイザとして MeCab を使用する）

辞書テーブルの作成は以下のようにする。

File: `辞書テーブルの作成`

{% highlight text linenos %}
> table_create --name Terms --flags TABLE_PAT_KEY|KEY_NORMALIZE --key_type ShortText --default_tokenizer TokenMecab
[[0,1436416480.43314,0.0687055587768555],true]
{% endhighlight %}

辞書テーブルへのカラムの作成は以下のようにする。

File: `辞書テーブルへのカラムの作成`

{% highlight text linenos %}
> column_create --table Terms --name pref_name --flags COLUMN_INDEX|WITH_POSITION --type Prefs --source name
[[0,1436416570.78517,0.964933156967163],true]
{% endhighlight %}

辞書テーブルの確認は以下のようにする。

File: `辞書テーブルの確認`

{% highlight text linenos %}
> select --table Terms
[
  [0,1436416592.4811,0.000155210494995117],
  [
    [
      [50],
      [
        ["_id","UInt32"],
        ["_key","ShortText"],
        ["pref_name","UInt32"]
      ],
      [1,"三重",1],
      [2,"京都",1],
      [3,"佐賀",1],
      [4,"兵庫",1],
      [5,"北海道",1],
      [6,"千葉",1],
      [7,"和歌山",1],
      [8,"埼玉",1],
      [9,"大分",1],
      [10,"大阪",1]
    ]
  ]
]
{% endhighlight %}

テーブルの検索は以下のようにする。

File: `テーブルの検索`

{% highlight text linenos %}
> select --table Prefs --query name:@府
[
  [0,1436416671.28152,0.000936269760131836],
  [
    [
      [2],
      [
        ["_id","UInt32"],
        ["_key","ShortText"],
        ["name","ShortText"]
      ],
      [26,"Kyotofu","京都府"],
      [27,"Osakafu","大阪府"]
    ]
  ]
]
{% endhighlight %}

#### 4-8. 対話モードの終了

``` text
> quit
```

### 5. 参考サイト

* [Groonga - カラムストア機能付き全文検索エンジン](http://groonga.org/ja/ "Groonga - カラムストア機能付き全文検索エンジン")

---

慣れないうちは Groonga を単体で扱うのは若干面倒に感じます。

当方は、Rroonga（Groonga の機能を Ruby から利用するためのライブラリ）や Mroonga（Groonga をベースとした MySQL のストレージエンジン）を使用することも考えています。

以上。

