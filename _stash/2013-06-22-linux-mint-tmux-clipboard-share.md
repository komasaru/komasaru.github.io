---
layout   : single
title    : "Linux Mint - tmux でクリップボード共有！"
published: true
date     : 2013-06-22 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
- 端末
- tmux
---

仮想端末管理ソフト [tmux](http://tmux.github.io/ "tmux") は、デフォルトでは文字列を選択してコピーした内容がクリップボードに格納されません。（プライマリセレクションというバッファには格納されてはいますが）  
tmux 外で起動させているテキストエディタ等に貼り付けたい場合などに不便です。

以下、コピー内容をクリップボードに格納する方法についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。（Unix 系なら同じだと思う）
- 仮想端末管理ソフト tmux がインストール済み。（バージョンは 1.6）
- コマンドラインでクリップボード操作が可能な `xsel` がインストール済み。  
  （`xsel` コマンドについては「[Linux Mint - xsel でクリップボード使用！]({{site.baseurl}}/2013/06/21/linux-mint-install-xsel "Linux Mint - xsel でクリップボード使用！")」を参照）

#### 1. tmux 設定ファイル編集

tmux 設定ファイルに以下の記述を追加する。  
プリフィックス＋ `>` で選択文字列（`.tmux-buffer`）をクリップボードに格納し、`<` でクリップボードの文字列を貼り付けるようにしている。

File: `~/.tmux.conf`

{% highlight bash linenos %}
# ==== Shared clipboard
bind-key > save-buffer ~/.tmux-buffer \; run-shell 'xsel -b -i < ~/.tmux-buffer' \; display-message "Copied to clipboard."
bind-key < if-shell 'xsel -b -o > ~/.tmux-buffer' 'load-buffer ~/.tmux-buffer ; paste-buffer'
{% endhighlight %}

#### 2. 動作確認

以下のようなことができるか確認してみる。

1. tmux で文字列をコピー後、vi エディタ等へペーストしてみる。
2. tmux で文字列をコピー後、tmux 内でペーストしてみる。
3. tmux 外の vi エディタ等で文字列コピー後、tmux 内でペーストしてみる。

tmux での文字列選択方法は tmux デフォルトのキー操作による方法の他、マウスでドラッグする方法も使用可能。（確認済み）

---

これで、tmux からテキストエディタ等へのコピペができるようになり、格段に便利になりました。

以上。

