---
layout   : single
title    : "Vim - Git 用プラグイン vim-fugitive のインストール！"
published: true
date     : 2013-08-11 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Vim
- Git
---

Vim エディタで作業しながら Git でも作業を行う場合、エディタとターミナルと行き来するのが意外と苦になるようになりました。

そこで、Vim で Git の操作ができるプラグイン "vim-fugitive" をインストールしてみました。

以下、作業記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Vim が使える状態である。
- Git が使える状態である。

#### 1. vim-fugitive インストール

「[tpope/vim-fugitive](https://github.com/tpope/vim-fugitive "tpope/vim-fugitive")」の README の説明通り、以下のようにする。  

``` bash 
$ cd ~/.vim/bundle
$ git clone git://github.com/tpope/vim-fugitive.git
```

ちなみに、Vundle（Vim プラグイン管理用プラグイン）を導入済みなら、".vimrc" に以下の記述を追加して `:BundleInstall` する。（「[過去記事]({{site.baseurl}}/2013/08/10/vim-install-vundle "Vim - Vundle インストール！")」参照）

``` vim 
Bundle 'tpope/vim-fugitive'
```

#### 2. 使用方法

ヘルプは `:help fugitive` で確認できるが、よく使用するであろう主なコマンドについての簡単な説明を残しておく。

- `:Git [args]`  
  任意の git コマンドを実行可能。 `:Git status` は `:!git status` と同義。
- `:Gstatus`  
  Git コマンドの `git status` と同じ内容が表示される。
  * `<CR>` ... ファイルが表示される。
  * `-` ... `git add`, `git reset` したい行で押下すると、`git add`, `git reset` される（交互に切り替わる）
  * `p` ... パッチを表示したい行でを押下すると、パッチが表示される。
  * `cc` ... `git commit` される。
  * `ca` ... `git commit --amend` される。
  * `R` ... status がリロードされる。
  * `q` ... status を閉じる。
- `:Gcommit [args]`  
  `git commit [args]` が実行される。
- `:Glog [args]`  
  開いているファイルのログが表示される。
- `:Gread [revesion]`  
  開いているファイルの直前のコミット時の内容が表示される。  
  `revision` を指定すればそのリビジョンの内容が表示される。
- `:Gwrite`  
  開いているファイルが `git add` される。
- `:Gdiff [revision]`  
  `:Gvdiff` と同じ。開いているファイルの変更箇所が表示される。（左右２ウィンドウで）  
  `revision` を指定すればそのリビジョンと比較した変更箇所が表示される。
- `:Gsdiff [revision]`  
  開いているファイルの変更箇所が表示される。（上下２ウィンドウで）  
  `revision` を指定すればそのリビジョンと比較した変更箇所が表示される。
- `:Gmove {destination}`  
  開いているファイルを `{destination}` にリネーム（移動）する。  
  `git mv {開いているファイル名} {desination}` と同じ。
- `:Gremove`  
  開いているファイルを Git から削除する。  
  `git rm {開いているファイル名}` と同じ。
- `:Gblame [flags]`  
  開いているファイルが `git blame` される（行毎のコミット情報が表示される）。  
  さらに、各種キーマップがある。`A`, `C`, `o`, `q` 等。

以下の画像は、`:Gblame` を開き、変更行で `o` を押下した時の画面例。

![VIM_FUGITIVE]({{site.baseurl}}/images/2013/08/11/VIM_FUGITIVE.png "VIM_FUGITIVE")

#### 参考サイト

- [tpope/vim-fugitive](https://github.com/tpope/vim-fugitive "tpope/vim-fugitive")

---

Vim からターミナルへ移動せずに作業できるので、かなり便利に感じます。

慣れるまで多少時間がかかりそうですが、よく使用するコマンドから覚えていこうと考えています。

あと、今回の vim-fugitive とは別に gitv も導入すると良さそうなので、その辺についても検討してみます。

以上。

