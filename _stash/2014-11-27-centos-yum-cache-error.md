---
layout   : single
title    : "CentOS - yum の 'Not using downloaded repomd.xml because it is older than what we have' エラー対策！"
published: true
date     : 2014-11-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- CentOS
---
CentOS サーバで、いつの頃から `yum update` 関係のエラーが出力されるようになりました。

実際には `cron.hourly` がエラーメールを送ってくるようになりました。

以下、原因と対策についての備忘録です。

<!--more-->

### 0. 前提条件

* CentOS 7.0.1406 での作業を想定。

### 1. 現象

`cron.hourly` が以下のようなメールを送信するようになった。

``` text
/etc/cron.hourly/0yum-hourly.cron:

Not using downloaded repomd.xml because it is older than what we have:
  Current   : Tue Nov 11 03:09:16 2014
  Downloaded: Fri Nov  7 03:59:46 2014
```

### 2. 原因

色々調べてみると、 `yum` のキャッシュが残っているかららしい。

### 3. 対策

キャッシュを削除すればよいので、以下のように実行する。

``` text
# yum clean all
読み込んだプラグイン:fastestmirror, langpacks, priorities
リポジトリーを清掃しています: base epel-source extras rpmforge updates
Cleaning up everything
Cleaning up list of fastest mirrors
```

もしくは、ディレクトリを指定して直接キャッシュを削除（ `rm /var/cache/yum/x86_64/7/*` ?）してもよいらしい。（こちらは未確認）

### 4. その他

普段から `yum clean all` を実行していれば、今回のような現象は発生しないであろう。

---

これで、エラーが発生しなくなりました。

以上。

