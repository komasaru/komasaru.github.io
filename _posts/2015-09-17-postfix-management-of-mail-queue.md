---
layout   : single
title    : "Postfix - メールキューの管理！"
published: true
date     : 2015-09-17 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- Postfix
---

SMTP サーバ Postfix でのメールキュー管理についての備忘録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.0(64bit) 上の Postfix 2.11.3-1,  
  CentOS 6.7(32bit) 上の Postfix 2.6.6.-2  
  での作業を想定。

### 1. 各種コマンド

#### 1-1. メールキューの確認

配送されずに溜まっているメールキューは "/var/spool/postfix/deferred" ディレクトリ内にある。  
それらを確認するには以下のようにする。

``` text
$ postqueue -p
-Queue ID- --Size-- ----Arrival Time---- -Sender/Recipient-------
AF70A2C009D*    1504 Sat Aug 22 23:57:39 hoge@xxxxxxxxxx.com
                                         fuga@yyyyyyyyyy.com

-- 2 Kbytes in 1 Request.
```

もしくは、

``` text
$ mailq
```

#### 1-2. メール内容の確認

``` text
$ postcat -q <QueueID>
```

#### 1-3. メールキュー配送の停止

``` text
$ postsuper -h <QueueID>|ALL
```

#### 1-4. メールキューの削除

``` text
$ postsuper -d <QueueID>|ALL
```

配送が遅れいているキュー全てを削除する場合は、

``` text
$ postsuper -d ALL deferred
```

#### 1-5. メールキューの再送

``` text
$ postsuper -r <QueueID>|ALL
```

もしくは、

``` text
$ postfix flush
```

もしくは、

``` text
postqueue -f
```

もしくは、

``` text
sendmail -q
```

---

時々使用するコマンドなので、忘れたときのために記録しておいた次第です。

以上。

