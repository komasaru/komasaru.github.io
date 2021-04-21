---
layout   : single
title    : "Linux - ユーザ名、グループ名の変更等！"
published: true
date     : 2015-01-12 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
---

こんにちは。

Linux 上に作成済みのユーザやグループの名称・ID、作成済みのユーザホームディレクトリを変更する方法についての備忘録です。

<!--more-->

### 0. 前提条件

* Linux 上での作業を想定。（どのディストリビューションでも同じはず）
* root での作業を想定。（root 権限が必要）
* 詳細な説明は `man` コマンド等で確認。

### 1. ユーザ名の変更

ユーザ名を変更するだけであるため、ホームディレクトリ名の変更も必要となる。

``` text
# usermod -l user_name_new user_name_old
```

### 2. ユーザIDの変更

0 〜 999 はシステムアカウント用に予約されているため、 1000 以上の数字で指定する。  
ホームディレクトリ以下のユーザ ID も自動で変更される。

``` text
# usermod -u 9999 user_name
```

### 3. グループ名の変更

``` text
# groupmod -n group_name_new group_name_old
```

### 4. グループIDの変更

グループIDは既存のグループIDより大きい数値でなければならない。  
グループID変更後、変更前のグループIDのファイルは手作業で新しいグループIDに変更しなければならない。

``` text
# groupmod -g 9999 group_name
```

### 5. ホームディレクトリの変更

あるユーザのホームディレクトリを別のディレクトリへ変更する方法。

``` text
# usermod -d home_dir_new user_name
```

---

頻繁に使用するコマンドでもないため、有事に備えて記録しておいた次第です。

以上。

