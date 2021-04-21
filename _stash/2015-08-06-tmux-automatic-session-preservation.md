---
layout   : single
title    : "tmux - Window, Pane, Session 自動保存プラグイン！"
published: true
date     : 2015-08-06 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- tmux
---

ターミナルマルチプレクサ（仮想端末マネージャ） [tmux](http://tmux.github.io/ "tmux") の Window, Pane, Session 等を保存（自動保存）するプラグインをインストールする方法についての記録です。

Window, Pane, Session 等を保存するプラグインは tmux-resurrect で、それを自動化するプラグインは tmux-continuum です。  
また、プラグインの管理には tpm(Tmux Plugin Manager)を使用します。  
（以前は tmux-resurrect を自動化するプラグインは tmux-resurrect-auto でしたが、現在は tmux-continuum に改名されています。tmux-resurrect-auto も使用できますが）

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* tmux 2.1 での作業を想定。
* Git がインストール済みであること。
* tpm(Tmux Plugin Manager) で tmux プラグインを管理することを想定。  
  （tpm を使用せず手動でインストールすることも可能）

### 1. tpm のインストール

tmux プラグインの管理に tpm(Tmux Plugin Manager) を使用するのでインストールする。

``` text
$ git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

### 2. tmux.conf の編集

"~/.tmux.conf" に以下の記述を追記する。

File: `~/.tmux.conf`

{% highlight bash linenos %}
set-option -g @tpm_plugins '  \
  tmux-plugins/tpm            \
  tmux-plugins/tmux-resurrect \
  tmux-plugins/tmux-continuum \
'
set-option -g @continuum-save-interval '60'
set-option -g @resurrect-processes 'ssh -p 9999 hoge'
set-option -g @resurrect-strategy-vim 'session'

run-shell '~/.tmux/plugins/tpm/tpm'
{% endhighlight %}

* `set-option` は `set` で代用可。
* `set-option -g @continuum-save-interval` でセッションを自動保存する間隔を指定する。  
   非指定時のデフォルトは `15` 分。 `0` で自動保存の無効化。
* `set-option -g @resurrect-processes` で保存したいセッションを指定する。  
  （上記の例は "hoge" ホストへポート 9999 で SSH 接続したセッションを保存する例）
* `set-option -g @resurrect-strategy-vim 'session'` で Vim のセッションを保存する。

### 3. プラグインのインストール

tmux 上で Prefix 押下後に `I` を押下する。（`i` ではなく `I`）

### 4. 動作確認

Prefix + CTRL-s で Window, Pane, Session 等の状態を保存、Prefix + CTLR-r でWindow, Pane, Session 等の状態を復元できるので、「保存→マシン再行動→復元」と試してみる。

tmux-continuum はデフォルトでは 60 分間隔で状態を保存するようなので、その辺りの動作も確認しておく。

ちなみに、状態は "~/.tmux/resurrect" ディレクトリ配下にテキストファイルで保存される。

---

これで、マシンを起動する度に Window, Pane, Session 等を手動で復元する手間が省けます。

以上。

