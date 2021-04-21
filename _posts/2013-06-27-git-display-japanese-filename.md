---
layout   : single
title    : "Git - 日本語ファイル名表示！"
published: true
date     : 2013-06-27 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- MySQL
---

例えば、「git日本語テスト」というファイル名を作成後に `git status` すると、日本語部分がエンコードされて表示されます。  
これだと、ステージング（`git add`）ができません。

以下、対策方法についての備忘録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 Nadia(64bit) で動作確認済み。
- Git が使用出来る環境である。
- Git 管理下に「git日本語テスト」という名称のファイルが作成済み。

#### 1. 対策前の状況確認

対策前は、 `git status` で以下のように日本語部分がエンコードされて表示される。

``` bash 
$ git status
# On branch master
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#
#       "git\346\227\245\346\234\254\350\252\236\343\203\206\343\202\271\343\203\210"
nothing added to commit but untracked files present (use "git add" to track)
```

#### 2. 設定

以下のように `git config` で対策を施す。

``` bash 
$ git config --global core.quotepath false
```

当然、元に戻すには `false` を `true` にすればよい。

#### 3. 設定確認

設定ができているか以下のようにして確認する。

``` bash 
$ git config --list
       :
----< 省略 >----
       :
core.quotepath=false
       :
----< 省略 >----
       :
```

#### 4. 対策後の状況確認

対策後は、 `git status` で以下のように日本語部分がエンコードされずそのまま表示されるようになった。

``` bash 
git status
# On branch master
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#
#       git日本語テスト
nothing added to commit but untracked files present (use "git add" to track)
```

---

一度設定してしまえば以降は設定を編集することはありませんが、git 再インストール等した際に戸惑わなくてすむように記録しておいた次第です。

以上。

