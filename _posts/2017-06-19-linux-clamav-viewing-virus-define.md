---
layout   : single
title: 'Linux - ClamAV でウイルス定義ファイル閲覧！'
published: true
date     : 2017-06-19 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Linux
- ウイルス対策
---

Linux のウイルス対策ソフトの定番 ClamAV のウイルス定義ファイルを閲覧する方法についての記録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8.6(32bit), LMDE2(Linux Mint Debian Edition 2; 64bit) での作業を想定。
* ClamAV 0.99.2/23421 での作業を想定。

### 1. 閲覧方法

コマンドラインで以下のように実行すると、ウイルス定義ファイルの内容が表示されるので、閲覧／検索等する。

`less` コマンドでの閲覧なので、 `/pattern` で末尾方向への検索、 `?pattern` で先頭方向への検索が可能。**※但し、膨大な情報量なので、検索に若干時間がかかる。**

``` text
$ sigtool --list-sig | less
```

直接検索したければ、以下のようにすればよい。

``` text
$ sigtool --list-sig | grep WannaCry
Win.Ransomware.WannaCry-6313053-0
Win.Ransomware.WannaCry-6313055-0
Win.Ransomware.WannaCry-6313787-0
```

もしくは、一旦全てをテキストファイルに出力後に検索をかけてもよい。**※但し、膨大な情報量なので、ファイル容量が約150MiBもある。**

``` text
$ sigtool --list-sig > clamav_cvd.txt
$ find clamav_cvd.txt | xargs grep WannaCry
```

---

どのようなウイルスが存在するのかを確認するのによいでしょう。

以上。

