---
layout   : single
title    : "Vim - URL からブラウザオープン！"
published: true
date     : 2014-11-13 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Vim
---

高機能テキストエディタ Vim に入力した URL 文字列からブラウザを開く方法についての記録です。

Vim に入力した URL を都度ヤンク後ブラウザに貼り付けて開くのが面倒な場合に有用かと思います。

今回は "[open-browser.vim](http://www.vim.org/scripts/script.php?script_id=3133 "open-browser.vim - Open URI with your favorite browser from your favorite editor : vim online")" というプラグインを使用します。

<!--more-->

### 0. 前提条件

* Linux Mint 17(64bit) での作業を想定。
* Vim 7.4(patch 1-273) での作業を想定。
* NeoBundle プラグインがインストール済み。（参照「[Vim - プラグイン管理を Vundle から NeoBundle へ移行！]({{site.baseurl}}/2013/08/25/vim-install-neobundle/ "Vim - プラグイン管理を Vundle から NeoBundle へ移行！")」）  
  （Vundle 等のプラグインを使う方法や個別にインストールする方法はここでは説明しない。適宜ご対応ください）

### 1. vim 設定ファイル編集

NeoBundle を使用して open-browser.vim をインストールするので、 ".vimrc" に以下の記述を追加。

File: `~/.vimrc`

{% highlight text linenos %}
NeoBundle 'open-browser.vim'
{% endhighlight %}

### 2. open-browser.vim インストール

Vim を再起動し、コマンドモードで以下のように実行。（もしくは、Vim 再起動時に自動でインストールが始まる）

``` text
:NeoBundleInstall
[neobundle/install] (1/1): |open-browser.vim| git clone --recursive https://github.com/vim-scripts/open-browser.vim.git "/home/masaru/.vim/bundle/open-browser.vim"
```

### 3. open-browser 設定

".vimrc" に以下の記述を追加。

File: `~/.vimrc`

{% highlight text linenos %}
let g:netrw_nogx = 1 " disable netrw's gx mapping.
nmap gx <Plug>(openbrowser-smart-search)
vmap gx <Plug>(openbrowser-smart-search)
{% endhighlight %}

`openbrowser-smart-search` はカーソル下が URL ならそのページそのものをブラウザで開き、カーソル下が URL でなければその文字列で検索した結果がブラウザで表示されるようだ。  
単純にブラウザで開くだけでよいのなら `openbrowser-open` と、検索するだけでよいのなら `openbrowser-search` とすればよい。

### 4. 動作確認

Vim を再起動し、コマンドモードで URL 上で `gx` と入力するとブラウザでその URL のページが開くはずである。

自身の経験上、URL の前後に半角スペースがない場合はうまく開けないようなので、その場合は、VISUAL モードで URL を選択後 `gx` と入力するとよい。

### 参考サイト

* [open-browser.vim - Open URI with your favorite browser from your favorite editor : vim online](http://www.vim.org/scripts/script.php?script_id=3133 "open-browser.vim - Open URI with your favorite browser from your favorite editor : vim online")

---

Vim メインの生活をしている者にとっては、 URL オープンのみならず検索もでき、便利すぎてもう手放せません。

以上。

