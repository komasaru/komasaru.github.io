---
layout   : single
title: 'Debian 8 (Jessie) - Postfix & Amavisd での "UNSOLICITED BULK EMAIL" 対策！'
published: true
date     : 2017-02-23 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- Debian
- Linux
- ウイルス対策
---

Debian GNU/Linux 8(Jessie) 上のメールサーバ（メール転送エージェント） Postfix に amavisd-new でウィルス対策を施した後に、 "Considered UNSOLICITED BULK EMAIL, apparently from you" というタイトルのメールが届くことがあるので、それを抑止するための設定についての備忘録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 8 (Jessie) での作業を想定。
* MTA（メール転送エージェント） Postfix 構築済み。
* ウイルス対策で Amavisd を導入済み。
* 当方、詳細については充分には理解していないが、以下のようにすればよいということだけ認識した。

### 1. 設定ファイルの編集

Amavisd の設定ファイルのうち、 "20-debian_defaults" を以下のように編集する。

File: `/etc/amavis/conf.d/20-debian_defaults`

{% highlight bash linenos %}
#$final_banned_destiny     = D_BOUNCE;   # <= コメントアウト
$final_banned_destiny     = D_PASS;     # <= 追加
{% endhighlight %}

`final_banned_destiny` は、禁止されたメールの最終処理の設定。

* `D_PASS` ... メールは受信者に配送される
* `D_REJECT` ... メールは配送されないが、送信者に配送されなかった事を伝える
* `D_BOUNCE` ... メールは配送されないが、送信者に配送されなかった事を伝える。例外で伝えない場合もある
* `D_DISCARD` ... メールは配送されず、送信者にも配送されなかった事を伝えない

### 2. Amavisd の再起動

``` text
# systemctl restart amavis
```

### 3. 注意

当然ながら、上記の設定にすると、禁止されたメールが配送されることになる。  
運用には十分に注意を払うこと。  
（「禁止されたメール」の定義がよく分からないが）

---

以上。

