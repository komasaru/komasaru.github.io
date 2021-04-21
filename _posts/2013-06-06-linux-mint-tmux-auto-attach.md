---
layout   : single
title    : "Linux Mint - tmux 起動時に自動でアタッチ！"
published: true
date     : 2013-06-06 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- LinuxMint
- 端末
- tmux
---

前回は、仮想端末管理ソフト [tmux](http://tmux.github.io/ "tmux") を Linux Mint へインストールしました。

- [Linux Mint - tmux インストール！]({{site.baseurl}}/2013/06/05/linux-mint-install-tmux "Linux Mint - tmux インストール！")

今回は、tmux 起動時にセッションが存在すれば（デタッチしたものあれば）、自動でアタッチする方法についての記録です。

<!--more-->

#### 0. 前提条件

- Linux Mint 14 (64bit) での作業を想定。（Unix 系なら同じだと思う）
- インストールする tmux のバージョンは 1.6
- シェルは bash.

#### 1. シェルスクリプト作成

以下の内容でシェルスクリプトを作成する。  

File: `~/tmux.sh`

{% highlight bash linenos %}
if [ -z $TMUX ]; then
  if $(tmux has-session 2> /dev/null); then
    tmux -2 attach
  else
    tmux -2
  fi
fi
{% endhighlight %}

- `$TMUX` は、tmux のセッションの中にいる場合にセットされる。
- `-z` で文字列の長さの有無をチェック。
- `tmux` の `has-session` というオプションでセッションが存在するか否かを確認できる。
- `2> /dev/null` はセッションが存在しない場合に出力されるエラーを表示しない。
- `tmux` のオプション `-2` は、256色対応のため。（環境によっては不要）

#### 2. シェルスクリプト実行権限付与

作成したシェルスクリプトに実行権限を付与する。

``` text 
$ sudo chmod +x tmux.sh
```

#### 3. .bashrc 編集

".bashrc" に以下の記述を追加する。  
（`tmux` を実行すると、`tmux.sh` が起動するということ）

File: `~/.bashrc`

{% highlight bash linenos %}
alias tmux='~/tmux.sh'
{% endhighlight %}

#### 4. .bashrc 反映

".bashrc" の変更を反映する。

``` text 
$ source .bashrc
```

#### 5. 動作確認

実際に確認してみる。  
デタッチしたもの（セッション）が存在しなければ新しいセッションで起動し、デタッチしたもの（セッション）が存在すれば直近のセッションで起動する、ことを確認する。

#### 6. 参考サイト

* [tmux](http://tmux.github.io/ "tmux")
* [tmuxで自動的にセッションを張る、あるいはアタッチ #tmux - Qiita [キータ]](http://qiita.com/items/1e1d3053c33f528363d9 "tmuxで自動的にセッションを張る、あるいはアタッチ #tmux - Qiita [キータ]")

---

これで、少し楽になりました。

以上。

