---
layout   : single
title    : "Vim - Git 用プラグイン gitv のインストール！"
published: true
date     : 2013-08-12 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Vim
- Git
---

多機能エディタ Vim で Git の GUI ツールと同等のこと行えるプラグインに gitv というものがあります。

リビジョンの一覧が表示され、リビジョン選択でファイルの変更が表示されるといった機能があります。

当方も、この gitv をインストールしてみました。

以下、作業記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。
- Vim が使える状態である。
- Git が使える状態である。
- Vim に vim-fugitive がインストール済みである。（gitv は fugitive に依存しているため）  
  （fugitive のインストール方法等については「[Vim - Git 用プラグイン vim-fugitive のインストール！]({{site.baseurl}}/2013/08/11/vim-install-fugitive "Vim - Git 用プラグイン vim-fugitive のインストール！")」を参照）

#### 1. gitv インストール

以下のようにしてインストールする。  

``` bash 
$ cd ~/.vim/bundle
$ git clone git://github.com/gregsexton/gitv.git
```

ちなみに、Vundle（Vim プラグイン管理用プラグイン）を導入済みなら、".vimrc" に以下の記述を追加して `:BundleInstall` する。（「[過去記事]({{site.baseurl}}/2013/08/10/vim-install-vundle "Vim - Vundle インストール！")」参照）

``` vim 
Bundle 'gregsexton/gitv'
```

#### 2. 使用方法

ヘルプは `:help gitv` で確認できるが、よく使用するであろう主なコマンドについての簡単な説明を残しておく。  
（以下のキーマッピングの他にも、各種カスタマイズも可能のようだ）

- `:Gitv [args]`  
  gitv がブラウザモードで起動する
- `:Gitv! [args]`  
  gitv がファイルモードで起動する

ブラウザモード、ファイルモードで起動後のキーマップ。（ヘルプより）

<table class="common">
<tr>
  <th>キー</th><th>ブラウザモード</th><th>ファイルモード</th>
</tr>
<tr>
  <td>&lt;CR&gt;</td>
  <td>コミット情報を開く</td>
  <td>コミット時のファイルを開く</td>
</tr>
<tr>
  <td>o</td>
  <td>上下にウィンドウを分割してコミット情報を開く</td>
  <td>上下にウィンドウを分割してファイルを開く</td>
</tr>
<tr>
  <td>O</td>
  <td>新しいタブでコミット情報を開く</td>
  <td>新しいタブでファイルを開く</td>
</tr>
<tr>
  <td>s</td>
  <td>左右にウィンドウを分割してコミット情報を開く</td>
  <td>左右にウィンドウを分割してファイルを開く</td>
</tr>
<tr>
  <td>i</td>
  <td>&lt;CR&gt;と同じ</td>
  <td>ファイルモード：コミット情報を開く</td>
</tr>
<tr>
  <td>q</td>
  <td>gitv の終了</td>
  <td>gitv の終了</td>
</tr>
<tr>
  <td>a</td>
  <td>--all オプションを付けてウィンドウをリロードする</td>
  <td>--all オプションを付けてウィンドウをリロードする</td>
</tr>
<tr>
  <td>u</td>
  <td>最新の情報に更新</td>
  <td>最新の情報に更新</td>
</tr>
<tr>
  <td>co</td>
  <td>チェックアウト</td>
  <td>チェックアウト</td>
</tr>
<tr>
  <td>D</td>
  <td>----</td>
  <td>開いているファイルと選択ファイルの差分を表示する</td>
</tr>
<tr>
  <td>D (Visual mode)</td>
  <td>----</td>
  <td>選択されている先頭のコミットと末尾のコミットの差分を表示する</td>
</tr>
<tr>
  <td>S</td>
  <td>diff --stat を表示する</td>
  <td>diff --stat を表示する</td>
</tr>
<tr>
  <td>S (Visual mode)</td>
  <td>選択されている先頭のコミットと末尾のコミットの diff --stat を表示する</td>
  <td>選択されている先頭のコミットと末尾のコミットの diff --stat を表示する</td>
</tr>
<tr>
  <td>m (Visual mode)</td>
  <td>選択されている先頭のブランチと末尾のブランチをマージする</td>
  <td>----</td>
</tr>
<tr>
  <td>git</td>
  <td>:Git 入力される</td>
  <td>:Git 入力される</td>
</tr>
<tr>
  <td>yc</td>
  <td>選択行の SHA 値をコピーする</td>
  <td>選択行の SHA 値をコピーする</td>
</tr>
<tr>
  <td>x</td>
  <td>次のブランチ行へ移動する</td>
  <td>----</td>
</tr>
<tr>
  <td>X</td>
  <td>前のブランチ行へ移動する</td>
  <td>----</td>
</tr>
<tr>
  <td>r</td>
  <td>次の ref 行へ移動する</td>
  <td>----</td>
</tr>
<tr>
  <td>R</td>
  <td>前の ref 行へ移動する</td>
  <td>----</td>
</tr>
<tr>
  <td>P</td>
  <td>HEAD ref 行へ移動する</td>
  <td>----</td>
</tr>
</table>

以下の画像は、`:Gitv` での作業画面例。

![VIM_GITV_1]({{site.baseurl}}/images/2013/08/12/VIM_GITV_1.png "VIM_GITV_1")

![VIM_GITV_2]({{site.baseurl}}/images/2013/08/12/VIM_GITV_2.png "VIM_GITV_2")

#### 参考サイト

- [gregsexton/gitv](https://github.com/gregsexton/gitv "gregsexton/gitv")

---

Vim でこんなにグラフィカルな表示がされた上に、git が扱いやすくなるプラグインはもう手放せないと思います。

vim-fugitive 同様、gitv も慣れるまで時間がかかりそうですが、よく使用するコマンドから覚えていく所存です。

以上。

