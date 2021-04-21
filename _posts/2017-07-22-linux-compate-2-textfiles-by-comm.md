---
layout   : single
title: 'Linux - comm コマンドでテキストファイルの差異（行単位）の確認！'
published: true
date     : 2017-07-22 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LMDE2
---

Linux でソートされた２つのファイルを行単位に比較するのに diff コマンドを使用することもあると思いますが、今回は comm コマンドについての記録です。

<!--more-->

### 0. 前提条件

* LMDE2 (Linux Mint Debian Edition 2; 64bit) での作業を想定。（他の Linux ディストリビューションも同様のはず）

### 1. 準備

比較に使用するサンプルを以下のように作成する。（敢えて、ソートしていない）

File: `test_1.txt`

{% highlight text linenos %}
B
A
C
{% endhighlight %}

File: `test_2.txt`

{% highlight text linenos %}
C
D
A
{% endhighlight %}

### 2. 使用例

出力される結果には3列あり、左から次のようになっている。

* ファイル１にのみ存在する行
* ファイル２にのみ存在する行
* 両方のファイルに存在する行

コマンド実行時に `-1`, `-2`, `-3` のようにオプションを指定することで、1, 2, 3列目の出力が抑止される。

#### 2-1. ソートされているか明示的にチェックしない例（全列出力）

（元ファイルをソートしないまま）

``` text
$ comm --nocheck-order test-1.txt test-2.txt
B
A
                C
        D
        A
```

* `--nocheck-order` は、入力が正しくソートされているかどうかをチェックしないオプション
* ソートされてないと判定されてもエラーにせず、最後まで実行される。

#### 2-2. ソートされているか明示的にチェックする例（全列出力）

（元ファイルをソートしないまま）

``` text
$ comm --check-order test-1.txt test-2.txt
B
comm: ファイル 1 がソートされていません
```

* `--check-order` は、入力が正しくソートされているかどうかをチェックするオプション（全ての行の組み合わせが一致していても）
* ソートされてないと判定された時点で終了する。
* `--nocheck-order` も `--check-order` も指定しない場合は、ソートされてないと判定されても最後まで実行される。

#### 2-3. ソートした上で明示的にチェックする例（全列出力）

``` text
$ comm --check-order <(sort test-1.txt) <(sort test-2.txt)
                A
B
                C
        D
```

#### 2-4. ソートした上で明示的にチェックする例（１列のみ出力）

ファイル１にのみ存在する行を確認する場合は、

``` text
$ comm -23 --check-order <(sort test-1.txt) <(sort test-2.txt)
B
```

ファイル２にのみ存在する行を確認する場合は、

``` text
$ comm -13 --check-order <(sort test-1.txt) <(sort test-2.txt)
D
```

#### 2-5. その他

* 出力結果を区切る文字列を `--output-delimiter=STR` オプションで指定することもできる。  
  例えば、 `--output-delimiter=,` とすれば、列がカンマで区切られる。
* 詳細な使用方法は `comm --help` か `man comm` を参照のこと。

### 3. 参考サイト

* [GNU Coreutils: comm invocation](http://www.gnu.org/software/coreutils/manual/html_node/comm-invocation.html#comm-invocation "GNU Coreutils: comm invocation")

---

以上。

