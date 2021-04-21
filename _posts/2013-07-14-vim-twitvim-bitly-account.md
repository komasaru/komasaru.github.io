---
layout   : single
title    : "Vim - TwitVim における BitLy アカウント設定！"
published: true
date     : 2013-07-14 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Vim
---

普段、当方デスクトップマシンでは Vim エディタの "TwitVim" プラグインを使ってツイートしています。  
しかし、TwitVim の BitLy コマンドでは、デフォルトのユーザ名・APIキーで URL が短縮されてしまい、自分のアカウントで統計がとれません。

通常（それでも構わなければ）、それで良いのですが、自分で BitLy による URL 短縮を管理したいので、自分のユーザ名・APIキーを設定することにしました。

以下、作業記録です。

<!--more-->

#### 0. 前提条件

* OS は問わないはず。
* Vim（CUI 版）、GVim（GUI 版）どちらも同じ。
* Vim 7.3.547 で動作確認。
* Twitter 関連プラグイン "TwitVim" 導入済み。
* URL 短縮サービス "BitLy" のアカウント取得済み（API キーも作成済み）である。

#### 1. 事前調査

TwitVim プラグインのスクリプト "twitvim.vim" を眺めてみたところ、以下のようなコードがありました。

File: `twitvim.vim`

{% highlight bash linenos %}
" Get bit.ly username and api key if configured by the user. Otherwise, use a
" default username and api key.
function! s:get_bitly_key()
    if exists('g:twitvim_bitly_user') && exists('g:twitvim_bitly_key')
        return [ g:twitvim_bitly_user, g:twitvim_bitly_key ]
    endif
    return [ 'twitvim', 'R_a53414d2f36a90c3e189299c967e6efc' ]
endfunction
{% endhighlight %}

何を意味しているのかというと、`g:twitvim_bitly_user` と `g:twitvim_bitly_key` の両方が存在すればそれらを使用し、そうでなければデフォルトのユーザとAPI キーを使用するということ。  
この `g:twitvim_bitly_user` と `g:twitvim_bitly_key` はグローバル変数である。  
当方の環境で設定ファイル ".vimrc" 等を確認したところ、どこにも設定してる箇所は無かった。

====[ 2015-06-21 追記 ]===>

TwitVim 0.9.0 では、以下のようになっている。（API キーではなく OAuth Token を指定するようになっている）

File: `twitvim.vim`

{% highlight bash linenos %}
" Get bit.ly access token if configured by the user. Otherwise, use a default
" access token.
function! s:get_bitly_key()
    return get(g:, 'twitvim_bitly_key', 'da11381ea442aa466a301a28bb3dcd334448f83a')
endfunction
{% endhighlight %}

<===[ 2015-06-21 追記 ]====

#### 2. Vim 設定ファイル編集

Vim 設定ファイル ".vimrc" に以下のような記述（自分のユーザ名・APIキー）を追加する。

File: `~/.vimrc`

{% highlight bash linenos %}
[.vimrc]
let twitvim_bitly_user = "USERNAME"
let twitvim_bitly_key = "R_XXXXXXXXXX"
{% endhighlight %}

関数内ではないので、変数前の `g:` は不要。

====[ 2015-06-21 追記 ]===>

当方は、 TwitVim 0.9.0 では、以下のように "twitvim.vim" 内で OAuth Token（API キーではない）を直接指定するようにした。

``` text
" Get bit.ly access token if configured by the user. Otherwise, use a default
" access token.
function! s:get_bitly_key()
    "return get(g:, 'twitvim_bitly_key', 'da11381ea442aa466a301a28bb3dcd334448f83a')
    return get(g:, 'hoge', 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
endfunction
```

<===[ 2015-06-21 追記 ]====

#### 3. Vim 再起動

設定を有効化するため、Vim エディタを再起動する。

#### 4. 動作確認

Vim エディタのコマンドラインで `BitLy` コマンドを使って URL を短縮化してみる。  

![TWITVIM_BITLY_1]({{site.baseurl}}/images/2013/07/14/TWITVIM_BITLY_1.png "TWITVIM_BITLY_1")
![TWITVIM_BITLY_2]({{site.baseurl}}/images/2013/07/14/TWITVIM_BITLY_2.png "TWITVIM_BITLY_2")

これで、自分のアカウントで管理できるようになっているはずである。  
BitLy サイトにログインしてみて、一覧に正しく表示されていることを確認する。

![TWITVIM_BITLY_3]({{site.baseurl}}/images/2013/07/14/TWITVIM_BITLY_3.png "TWITVIM_BITLY_3")

#### 参考サイト

- [TwitVim - Twitter client for Vim : vim online](http://vim.sourceforge.net/scripts/script.php?script_id=2204 "TwitVim - Twitter client for Vim : vim online")
- [*twitvim.txt*  Twitter client for Vim](http://twitvim.googlecode.com/svn-history/r66/trunk/twitvim.txt "*twitvim.txt*  Twitter client for Vim")

検索の仕方が良くないのか、BitLy のアカウント設定について説明しているサイトは世界中で１件（TwitVim の公式ドキュメント）しか見当たりませんでした。

---

これで、TwitVim で短縮した URL も自分のアカウントで管理できるようになりました。

実は、随分前から BitLy の自分のアカウントで管理できる URL の数が少ないとは思っていましたが、あまり重要視していなかったので特に気に留めていませんでした。  
改めて調査してみて気付いた次第です。

また、今後 BitLy API を使用して色々操作してみたいとも考えています。

以上。

