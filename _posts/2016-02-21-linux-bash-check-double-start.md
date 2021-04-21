---
layout   : single
title    : "Linux - bash スクリプト二重起動チェック！"
published: true
date     : 2016-02-21 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- bash
---

Linux で bash スクリプトを起動する際に既に起動されていたら起動しないようにするための方法、さらには cron で実行しても二重起動チェックが機能するかについての記録です。

<!--more-->

### 0. 前提条件

* CentOS 6.7 での作業を想定。（他の環境でも問題ないはず）

### 1. 作成例（その１）

自分自身のプロセスIDと起動済みのプロセスID（＝自分自身のプロセス名（相対パス）と同じプロセス名から取得）を比較する方法。

File: `test_1.sh`

{% highlight bash linenos %}
#!/bin/sh

# 二重起動チェック
if [ $$ != `pgrep -fo $0` ]; then
  echo "Already running!" >&2
  exit 9
fi

# メイン処理
echo "[`date '+%Y/%m/%d %T'`] Sleep 10 seconds..."
sleep 10

exit 0
{% endhighlight %}

* `$$` は、自分自身のプロセスID。
* `$0` は、自分自身のプロセス名（相対パス）。
* `pgrep -fo $0` は、自分自身のプロセスIDを取得。
* メリット・デメリットについて
  - **メリットは、cron 実行しないのであればこれで充分である。**
  - **デメリットは、cron で実行された場合にチェックが効かない。**  
    理由は、`pgrep -fo $0` が cron で実行した際のプロセスIDとなってしまう（子プロセス（`$0`）のプロセスIDにならない）ため。

### 2. 作成例（その２）

自分自身のプロセスIDと起動済みのプロセスID（＝自分自身のプロセス名（パスを除いたファイル名）と同じプロセス名から取得）を比較する方法。

File: `test_2.sh`

{% highlight bash linenos %}
#!/bin/sh

# 二重起動チェック
_pname=`basename $0`
if [ $$ != `pgrep -fo $_pname` ]; then
  echo "Already running!" >&2
  exit 9
fi

# メイン処理
echo "[`date '+%Y/%m/%d %T'`] Sleep 10 seconds..."
sleep 10

exit 0
{% endhighlight %}

* 作例例（その１）と似ているが、`$0` からパスを除いてプロセスIDを取得している。
* メリット・デメリットについて
  - **メリットは、cron 実行しないのであればこれで充分である。**
  - **デメリットは、cron で実行された場合にチェックが効かない。**  
    理由は、`pgrep -fo $0` が cron で実行した際のプロセスIDとなってしまう（子プロセス（`$0`）のプロセスIDにならない）ため。

### 3. 作成例（その３）

自分自身のプロセスIDと起動済みのプロセスID（＝自分自身のプロセス名（引数も含めたフルパス）と同じプロセス名から取得）を比較する方法。

File: `test_3.sh`

{% highlight bash linenos %}
#!/bin/sh

# 二重起動チェック
CMDLINE=$(cat /proc/$$/cmdline | xargs --null)
if [[ $$ -ne $(pgrep -oxf "${CMDLINE}") ]]; then
  echo "Already running!" >&2
  exit 9
fi

# メイン処理
echo "[`date '+%Y/%m/%d %T'`] Sleep 10 seconds..."
sleep 10

exit 0
{% endhighlight %}

* `$(cat /proc/$$/cmdline | xargs --null)` で起動時のコマンドラインを引数も含めてフルパスで取得。
* メリット・デメリットについて
  - **メリットは、cron で実行された場合にもチェックが効く。**
  - **デメリットは、初見では理解しにくいかもしれない。**

### 4. 作成例（その４）

ロックファイルが存在しない場合にロックファイル（実際にはシンボリックリンク）を作成して処理を行い、処理終了後にロックファイルを削除する方法。

File: `test_4.sh`

{% highlight bash linenos %}
#!/bin/sh

# 二重起動チェック
_lock="/tmp/`basename $0`.lock"
ln -s /dummy $_lock 2> /dev/null
if [ $? -ne 0 ]; then
  echo "Already running!" >&2
  exit 9;
fi
# 上記の `ln` と `if ... fi` は以下のように１行にまとめてもよい
# ln -s /dummy $_lock 2> /dev/null || { echo "Already running!" >&2; exit 9; }

# メイン処理
echo "[`date '+%Y/%m/%d %T'`] Sleep 10 seconds..."
sleep 10

rm -f $_lock
exit 0
{% endhighlight %}

* 上記ではシンボリックリンクを作成しているが、`touch` コマンでロックファイルを作成してもよいだろう。（但し、問題があるかも？（問題があると説明しているサイトを見かけたが、当方は未確認））
* メリット・デメリットについて
  - **メリットは、理解しやすいスクリプトである。**
  - **デメリットは、SIGKILL シグナルを受信して終了した場合にロックファイルが残ったままになり、次回起動時にロックファイルを削除する作業が必要になる。**  
    二重起動チェックの最後に `trap "rm $_lockfile; exit" 1 2 3 15` のように記述して SIGKILL シグナル`1`（HUP：再起動）、`2`（INT：割り込み）、`3`（QUIT：終了）、`15`（TERM：終了）を捕捉するような説明をしているページもあったが、シェルスクリプト内では `trap` できないはずなので無意味。

### 5. 作成例（その５）

cron 実行時に `flock` コマンドを使用する方法。（実際に実行する bash スクリプトは二重起動チェック機能を実装してないもの）

File: `/etc/cron.d/test`

{% highlight bash linenos %}
* * * * * root /usr/bin/flock -n /tmp/test_5.lock test_5.sh > /dev/null
{% endhighlight %}

* `flock` コマンドの `-n` は、ロック中だった場合にロック解放を待たずにエラーにするオプション。
* メリット・デメリットについて
  - **メリットは、cron で実行する際に既存の bash スクリプトを編集することなく二重起動の抑制が可能。**
  - **デメリットは、bash スクリプトを cron でなく手動で実行する場合に二重起動チェックが機能しない。**

### 6. その他

* `pidof` コマンドを使用する方法も考えられるだろうが、当方は未確認。
* 当方は、手動実行も cron 実行も行うことが多いので、 cron 実行時に問題がない（少ない）上記の「作成例（その３）」の方法を主に使用している。

---

今回調査したことで、プロセスIDの取得方法や cron 実行時には親プロセス・子プロセスのことを考慮する必要があることが勉強になりました。

以上。

