---
layout   : single
title    : "Python - カレンダ計算ライブラリの作成！"
published: true
date     : 2018-07-29 00:20:00 +0900
comments : true
categories:
- プログラミング
- 暦・カレンダー
tags:
- カレンダー
- Python
---

Python でカレンダー（旧暦等）を計算するためのライブラリを作成しました。

過去に Ruby で同様のライブラリを作成したこともありましたが。

* [Category: 暦・カレンダー - mk-mode BLOG](https://www.mk-mode.com/octopress/categories/%E6%9A%A6-%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC/ "Category: 暦・カレンダー - mk-mode BLOG")

内容が濃いので、作成したという紹介のみに留める。

<!--more-->

### 0. 前提条件

* Python 3.6.5 での動作を想定。
* 天文学的な計算については疎いため、誤りがあるかもしれない。
* 数値計算ライブラリ NumPy を使用するのでインストールしておく。

### 1. ライブラリについて

GitHub で公開しているので、以下のリンク先の README.txt を参照。

* [komasaru/CalendarPy: Python scripts to calculate calendar.](https://github.com/komasaru/CalendarPy "komasaru/CalendarPy: Python scripts to calculate calendar.")

* README.txt でも説明しているとおり、ライブラリの本質は lib ディレクトリ配下のスクリプトである。

### 2. その他

* うるう秒、 DUT1 の情報は、随時最新のものに更新する予定。（Ruby 版ライブラリ同様に）

---

これまで Rails(Ruby) で公開していたカレンダ関連のツールも Python 版に入れ替えました。（Rails 側から、 Ruby スクリプトでなく Python スクリプトを実行するようにしただけ）

以上。

