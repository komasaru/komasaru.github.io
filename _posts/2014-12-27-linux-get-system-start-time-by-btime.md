---
layout   : single
title    : "Linux - システム稼働開始日時取得（btime 使用）！"
published: true
date     : 2014-12-27 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

以前、最近ログインしたユーザ情報を表示する `last` コマンドで `reboot` 行からシステム稼働開始日時を判別する方法を紹介しました。

* [Linux - システム稼働開始日時取得！]({{site.baseurl}}/2014/04/25/linux-getting-system-starttime/ "Linux - システム稼働開始日時取得！")

しかし、この方法は "wtmp" ファイルに依存するするため、 "wtmp" ファイルに "reboot" に関する情報が記録されてない場合は取得できません。（経験上、環境により記録されていたり記録されてなかったりした）

以下、プロセスの状態が記録されている "/proc/stat" ファイルから `btime` 値を取得して起動日時を判別する方法についての記録です。

<!--more-->

### 0. 前提条件

* Linux Mint 17.1(64bit), CentOS 6.6, 7.0 で動作確認済み。
* 以下では、説明のため順を追って説明している。

### 1. btime 行の取得

システムの起動日時が "/proc/stat" ファイルの `btime` 行に記録されているので、それを取得。

``` text
$ grep btime /proc/stat
btime 1413336664
```

もしくは、

``` text
$ cat /proc/stat | grep btime
btime 1413336664
```

### 2. btime 値の取得

前項で取得した行の値の部分だけを `cut` コマンドで切り出す。  
（取得した `btime` 行の 7 バイト目移行を切り出し）

``` text
$ grep btime /proc/stat | cut -b7-
1413336664
```

### 3. btime 値を日付時刻型に変換

取得した値は UNIX 時間（1970/01/01 からの秒数）であるので、 `date` コマンドで書式を変換する。

``` text
$ date +"%Y年%m月%d日 %H時%M分%S秒" --date=@`grep btime /proc/stat | cut -b7-`
2014年10月15日 10時31分04秒
```

---

"wtmp" ファイルに "reboot" ユーザの行が記録されてないことがあるために `last` コマンドで取得できないことがありましたが、今回の方法なら（おそらく）確実に取得可能です。

以上。

