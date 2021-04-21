---
layout   : single
title    : "Octopress - HTML5 ソースを W3C で Valid に！"
published: true
date     : 2013-01-04 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- HTML
- W3C
---

[Octopress](http://octopress.org/ "Octopress") でデフォルトで使用できるテーマをそのままか自分でカスタマイズして使用していると、[The W3C Markup Validation Service](http://validator.w3.org/ "The W3C Markup Validation Service") でエラーや警告が多数発生します。  

普通にブラウザで見ている限りはほとんど不具合は感じませんが、ブラウザによってはデザインが崩れたりする可能性があります。  
ブラウザによって、対応できているタグや属性が異なるからです。

<!--more-->
時々見かける崩れたデザインのサイトも、標準化対応していない(作成者が自分の環境だけで満足している)からです。  
そういう不具合を解消させるために標準化されているのです。  
そういうことを気にしていない方が多すぎるのも気になりますが。。。  
(他のサイトをチェックしてみると、いかにサイト管理者が HTML に関して知識が薄いかがよくわかります)

今のところ、HTML5 は未だ「勧告」の扱いにはなっていません(実験的段階になっている)が、チェックは可能です。  
当ブログサイトもチェックし、エラーにならないよう(Valid になるよう)調整しました。

### 0. 前提条件

- Linux Mint 13 Maya (64bit) で確認しているが、OS・ディストリビューションは関係ない。
- Ruby 1.9.3-p194
- Octopress 2.0
- デフォルトのテーマ(Classic)をそのままかカスタマイズして使用している。

### 1. 対応内容

以下のような対応をしました。  
基本的に、自分の HTML5 に対する疎さや最初から不正な値が使用されていたりしたことから、不正になっていました、

#### 1. セクションタグ関連

【現象】HTML5 について不勉強だったため、自分で命名したセクションタグを配置してはいけないタグ内に配置していた。(自分のミス)  
【対応】削除したり、別タグに変更し `class` 指定した。

#### 2. `<time>` タグ内の `pubdate` 属性

【現象】`<time>` タグ内に HTML5 で廃止された `pubdate` 属性があった。(デフォルトのテーマに最初から存在)  
【対応】不要なので、`<time>` タグ内の `pubdate` 属性を削除した。

#### 3. `<a>` タグ内の `rel` 属性

【現象】`<a>` タグ内の `rel` 属性に規定外の値(`full-article`)が設定されている。(デフォルトのテーマに最初から存在)  
【対応】不要なので、`<a>` タグ内の `rel` 属性を削除した。

#### 4. `<a>` タグ内の `subscribe-rss` 属性

【現象】`a` タグ内の `rel` 属性に規定外の値(`subscribe-rss`)が指定されている。(デフォルトのテーマに最初から存在)  
【対応】不要なので、`<a>` タグ内の `subscribe-rss` が設定されている `rel` 属性を削除した。

#### 5. `<input>` タグ内の `results` 属性

【現象】`<input>` タグ内に Safari(Apple) 限定の属性 `results` (入力候補のために検索履歴を保存するため)がある。(デフォルトのテーマに最初から存在)  
【対応】不要なので、`<input>` タグ内の `results` 属性を削除した。

#### 6. Twitter Follow Me バッチ

【現象】自分で追加した Twitter の Follow Me バッチ(ページの右側のボタン)の JavaScript 内で、`src` 属性のない `<script>` タグに `charset` 属性が指定されていた。(提供元が原因)  
【対応】ここで、`charset` を指定しなくても問題ないので、`charset` 属性を削除した。

#### 7. アフィリエイト関連

【現象】アフィリエイト業者から提供されいている JavaScript コード内に不明な属性値がある。(提供元が原因)  
【対応】提供されたコードは勝手に変更できないので、提供されたコードを別の HTML ファイルに保存し `<object>` を使用して読み込む形式にした。

### 2. 構文チェック

[The W3C Markup Validation Service](http://validator.w3.org/ "The W3C Markup Validation Service") でチェックしたい URL を入力してチェックする。  
エラーがあれば、メッセージを見て修正する。  
最終的に、ワーニング１個で OK となります。  
この１個のワーニングは、「HTML5 は未勧告のため現在では実験段階である」というワーニングのはず。

![OP_HTML5_W3C]({{site.baseurl}}/images/2013/01/04/OP_HTML5_W3C_1.png "OP_HTML5_W3C")

### 3. Valid アイコン表示

通常、[The W3C Markup Validation Service](http://validator.w3.org/ "The W3C Markup Validation Service") でチェックしてエラーがなければ、提供される Valid アイコンをそのサイトに貼り付けることができますが、 HTML5 は未勧告なので、まだ公式な Valid アイコンは提供されていない。  
Web 上で広く出回っている Valid アイコンを使用してもよいかもしれまえんが、当方は単純に文字リンクとしました。(サイドバー参照)

### その他

本来なら、HTML5 のみならず CSS3 についても [W3C CSS 検証サービス](http://jigsaw.w3.org/css-validator/ "W3C CSS 検証サービス") でチェックすべきである。  
しかし、Octopress のテーマ CSS が [Compass](http://compass-style.org/ "Compass Home | Compass Documentation") で生成されるようになっていて、[Compass](http://compass-style.org/ "Compass Home | Compass Documentation") 自体が独自の変数・プロパティを多用していたりする。  
よって、当サイトでは可能な限り対応した以外は CSS3 が「勧告」されるまで待つことにしました。  
[Compass](http://compass-style.org/ "Compass Home | Compass Documentation") で生成された後の CSS をベースにして地道に対応させる方法も考えましたが・・・本末転倒に思えるので。

---

これで当ブログは HTML5 については現時点では [The W3C Markup Validation Service](http://validator.w3.org/ "The W3C Markup Validation Service") エラーは無くなりました。  
しかし、HTML5 が [The W3C Markup Validation Service](http://validator.w3.org/ "The W3C Markup Validation Service") 「勧告」されるまでは、Draft(実験的)段階なので、随時仕様変更があると思われます。

今回の当記録が参考になれば幸いだと思っている次第です。

以上。

