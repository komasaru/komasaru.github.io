---
layout   : single
title    : "Ruby - rbenv のアップデート！"
published: true
date     : 2013-07-22 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

当方、普段は Ruby はソースをビルドしてインストールして使用していますが、一部では Ruby のバージョン管理システム rbenv を使用しています。

時々、rbenv で新しいバージョンの Ruby をインストールしようとして、インストール可能な一覧に該当の Ruby が存在しないことがあります。  
rbenv のバージョンが古いからです。

普段から rbenv を使っていれば、いちいち記録しておくことでもないでしょうが、当方にとっては時々の作業なので、後学のために記録しておきます。

<!--more-->

#### 0. 前提条件

- ruby-build を "https://github.com/sstephenson/ruby-build" から `git clone` でインストールしている。
- ruby-build のインストール先は "~/ruby-build" にしている。

#### 1. 一覧確認

以下のコマンドで新しいバージョンの Ruby が表示されるか確認する。

``` bash 
$ rbenv install -l

# or

$ ruby-build --definitions
```

インストール可能な Ruby の一覧に表示されてなければ、インストールしても以下のようになる。

``` bash 
$ rbenv install 2.0.0-p247
ruby-build: definition not found: 2.0.0-p247
```

#### 2. リモートリポジトリ確認

以下のコマンドのようにコマンドを実行すると、今までにどのリモートサーバを設定したのか表示されるので、`(fetch)` が ruby-build をインストールした時の URL になっているか確認する。

``` bash 
$ cd ~/ruby-build
$ git remote -v
origin  git://github.com/sstephenson/ruby-build.git (fetch)
origin  git://github.com/sstephenson/ruby-build.git (push)
```

#### 3. Git Pull 実行

"ruby-build" ディレクトリに移動し `git pull` を行う（ソースをコピーする）。

``` bash 
$ git pull origin master
```

#### 4. ruby-build インストール

ソースをコピーしただけではダメなので、インストール作業を行う。

``` bash 
$ ./install.sh
Installed ruby-build at /usr/local
```

#### 5. 再度、一覧確認

以下のコマンドで新しいバージョンの Ruby が表示されるか確認する。

``` bash 
$ rbenv install -l

# or

$ ruby-build --definitions
```

これで、新しいバージョンの Ruby も一覧に表示されるはずだ。  
後は普通に、 `rbenv install XXXXXXXXX` でインストールすればよい。

---

あるアプリを rbenv を使ってインストールした少し古いバージョンの Ruby で動かしていました。  
今回、その Ruby をバージョンアップしようとした際に気付いた事案でした。

以上。

