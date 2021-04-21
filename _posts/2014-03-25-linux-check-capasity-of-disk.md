---
layout   : single
title    : "Linux - ディスク使用量監視＆メール通知！"
published: true
date     : 2014-03-25 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
- シェル
- bash
---

Linux サーバで、ディスク使用量を監視しパーティションの残容量が少なくなった場合にメール通知する設定についてです。

そういうことは munin 等のサーバ監視ツールでもできますが、当方が以前から使用している方法（シェルスクリプト＆cronを使用する方法）を紹介します。

<!--more-->

### 0. 前提条件

- CentOS 6.5 での作業を想定。
- GNU bash, version 4.1.2(1)-release での動作を確認。
- パーティションを細かく分割していることを想定。
- 複数パーティションのうち１つでも設定した使用量を超えたらメール送信する。
- 警告検知時にメール送信するので、SMTP サーバ構築済みで `mail` コマンドも使用できるようになっている。

### 1. シェルスクリプト作成

以下のように Bash スクリプトを作成する。

- このスクリプトでは、複数あるパーティションの１つでも使用量が 90% を超えたらメール通知するようにしている。
- このスクリプトでは、root ユーザ宛てにメール送信するようにしているが、特定のメールアドレに設定してもよい。

File: `check_df.sh`

{% highlight bash linenos %}
#!/bin/bash

# 閾値(%)
LIMIT=90
# メール件名
SUBJECT="[WARN] The capacity of the disk has decreased! - `hostname`"

# df コマンドの結果を１行ずつチェック
while read LINE
do
    # パーセンテージ取得
    PER=`echo $LINE | sed 's/^.* \([0-9]*\)%.*$/\1/'`
    # 閾値を超えたら df コマンドの内容をメール送信
    if [ $PER -gt $LIMIT ]; then
        df -h | mail -s "$SUBJECT" root
        break
    fi
done < <(df | grep '[0-9]\{1,\}%')
{% endhighlight %}

- [Gist - Bash script to check the capacity of disk partitions.](https://gist.github.com/komasaru/9580138 "Gist - Bash script to check the capacity of disk partitions.")

### 2. シェルスクリプト権限設定

作成した Bash スクリプトに実行権限を付与する。

``` text
# chown 700 check_df.sh
```

### 3. シェルスクリプト実行

試しに、作成した Bash スクリプトを実行してみる。（試験的に閾値の設定を下げて）

``` text
# ./check_df.sh
```

成功すれば、件名が "[WARN] The capacity of the disk has decreased! - ＜サーバホスト名＞"、本文が以下のような `df` コマンドの実行結果のメールが指定の宛先に届くはずである。

``` text
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda3       2.0G  587M  1.3G  31% /
tmpfs           500M     0  500M   0% /dev/shm
/dev/sda1       194M  112M   73M  61% /boot
/dev/sda9       234G   25G  197G  12% /home
/dev/sda8       2.0G   74M  1.8G   4% /tmp
/dev/sda6       9.9G  2.0G  7.4G  22% /usr
/dev/sda7       5.0G  3.0G  1.7G  65% /usr/local
/dev/sda5        40G   14G   24G  37% /var
```

### 4. 定期実行設定

自動で定期的（毎時）に実行するために "/etc/crond.hourly/" ディレクトリへ移動する。

``` text
# mv check_df.sh /etc/crond.hourly/
```

これで、毎時チェックが行われ、容量が設定した閾値を超えたパーティションがあればメール送信される。

---

別の方法やサーバ監視ツール等を使用する方法もあるでしょうが、当方はこれで落ち着いています。

以上。

