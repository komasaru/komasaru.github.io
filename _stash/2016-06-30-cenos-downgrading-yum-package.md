---
layout   : single
title    : "CentOS - Yum パッケージのダウングレード！"
published: true
date     : 2016-06-30 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- CentOS
---

CentOS で、アップデートされてしまった Yum パッケージをダウングレードする方法についての記録です。

（「アップグレード」の反意ではなく「アップデート」の反意なので「ダウンデート」と呼びたいところ。しかし、「ダウンデート」などという言葉は存在しないので「ダウングレード」と表現しています。（単に「バージョンダウン」でもいいかもしれないが））

<!--more-->

### 0. 前提条件

* 当方、 CentOS 6.8(32bit) で動作確認済み。

### 1. 利用可能なパッケージの一覧

（以下は一例）

``` text
# yum --showduplicate list groonga

===< 中略 >===

groonga.i686                    6.0.0-1.el6                     groonga
groonga.i686                    6.0.2-1.el6                     groonga
groonga.i686                    6.0.3-1.el6                     groonga
```

出力される一覧にあるものにダウングレードすることが可能。  
（今回の例では、 "6.0.3-1.el6" がインストール済みの最新）

### 2. ダウングレードの実行

バージョン番号を指定してダウングレードを行う。（以下は一例）

``` text
# yum downgrade groonga-6.0.2-1.el6 groonga-libs-6.0.2-1.el6 groonga-plugin-suggest-6.0.2-1.el6 groonga-tokenizer-mecab-6.0.2-1.el6
```

以下のようにバージョンを指定せずに実行すると１つ前のバージョンにダウングレードされる。

``` text
# yum downgrade groonga
```

（実際には、依存性の関係で他のパッケージも同時にダウングレードしている）

### 3. 自動更新の抑制

せっかくダウングレードしても、 yum パッケージが自動更新するように設定されていれば、またアップデートされてしまう。

自動更新させないよう "/etc/yum.conf" の `[main]` セクションで自動更新の対象から除外するような設定をしておく。（以下は一例）

File: `/etc/yum.conf`

{% highlight bash linenos %}
[main]

# ===< 中略 >===

exclude=hoge*,fuga,groonga
{% endhighlight %}

（ワイルドカード `*` も使用可）

### 4. その他

RPM パッケージをローカルに用意しておいてから、以下のように `rpm` コマンドでダウングレードすることも可能のようだ。（未確認）

``` text
rpm -Uvh --oldpackage [pakage名]
```

---

依存性を無視して勝手にアップデートされてしまった場合などに役立つでしょう。

以上。

