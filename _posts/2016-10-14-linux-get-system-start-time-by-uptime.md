---
layout   : single
title    : "Linux - システム稼働開始日時取得（uptime 使用）！"
published: true
date     : 2016-10-14 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

以前、 btime からシステム稼働開始日時を取得する方法を紹介しました。

* [Linux - システム稼働開始日時取得（btime 使用）！]({{site.baseurl}}/2014/12/27/linux-get-system-start-time-by-btime "Linux - システム稼働開始日時取得（btime 使用）！")

今回は uptime から取得する方法についての記録です。

> 【2017-06-16 追記】  
> Debian であれば、以下のようにわざわざ計算しなくとも、 `uptime -s` で容易に取得できる。  
> 【追記ここまで】

<!--more-->

### 0. 前提条件

* CentOS 6.8(32bit) での作業を想定。

### 1. 事前確認

"/proc/uptime" に「システムが起動してから経過した合計秒数」と「各コアがアイドル状態で経過した合計時間の秒数」が記録されているので、それを確認してみる。。

``` bash
$ cat /proc/uptime
20400382.35 1448976.68
```

### 2. コマンド実行例

``` bash
$ date +"%Y-%m-%d %I:%M:%S" --date=@$(expr `date +%s` - `cut -d "." -f 1 /proc/uptime`)
2016-01-24 08:39:40
```

* `+"%Y-%m-%d %H:%M:%S"` は、結果出力の書式。
* `date +%s` は、現在時刻の UNIX 時間。
* `cut -d "." -f 1 /proc/uptime` は、 "/proc/uptime" を "." で区切ってその1つ目を抽出。（1秒未満を切り捨て）
* `expr A - B` は、 A - B の計算。
* `--date=@...` は、日付を UNIX 時間で指定。
* `$(....)` は、コマンド置換。 `｀...｀` と同じ意味だが、 `｀...｀` はネストできないので。

### 3. 参考サイト

* [E.2.28. /proc/uptime](https://access.redhat.com/documentation/ja-JP/Red_Hat_Enterprise_Linux/6/html/Deployment_Guide/s2-proc-uptime.html "E.2.28. /proc/uptime")

---

システム起動日時（Unix 時間）が直接取得できた "/proc/stat" の btime とは異なり、 "/proc/uptime" では現在日時との差を計算しなければなりませんが、取得できる日時は btime と同じく正確（誤差1秒未満の精度）です。

以上。

