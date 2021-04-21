---
layout   : single
title    : "CentOS - Clam AntiVirus でパーミッションエラー！"
published: true
date     : 2013-06-14 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- CentOS
- ウイルス対策
---

当方、以前から CentOS サーバで運用しています。  
ウイルス対策として "Clam AntiVirus" を導入しているのですが、いつの頃からかエラーメールが届くようになっていました。

以下、現象と原因と対策についての記録です。

<!--more-->

#### 0. 前提条件

* CentOS 6.4 サーバでの作業を想定。
* アンチウイルスソフト Clam AntiVirus がインストール済み。

#### 1. 現象

実際に発生した現象は、サーバの cron.daily でウイルス定義ファイル更新 `freshclam` が起動した際に以下のようなエラーが発生し、root 宛にメールが届く。

``` bash
/etc/cron.daily/freshclam:

ERROR: Can't create temporary directory /var/lib/clamav/clamav-9441201be3d642a23bcf27bf0a2f4fde
```

また、`/var/log/clamav/freshclam.log` に以下のようなエラーメッセージが出力される。

File: `/var/log/clamav/freshclam.log`

{% highlight bash linenos %}
ERROR: Can't create temporary directory /var/lib/clamav/clamav-9441201be3d642a23bcf27bf0a2f4fde
Hint: The database directory must be writable for UID 498 or GID 499
{% endhighlight %}

実際、手動で `freshclam` コマンドを実行すると上記エラーが発生する。

#### 2. 原因

`clamav-db` が `yum` でアップデートされると、パーミッションが `clamav` から `clamd` に変更されることが原因のようだ。

#### 3. 対策

エラーメッセージにもあるようにパーミッションを設定する。  
以下は当方の例であり、ユーザID・グループIDは環境により異なる。

``` text
chown -R 498:499 /var/lib/clamav
```

もしくは

``` text
chown -R clamav:clamav /var/lib/clamav
```

また、現時点ではエラーになっていないが、ログローテーション時にエラーにならないようにログローテーションの設定も修正しておくと良いだろう。

File: `/etc/logrotate.d/freshclam`

{% highlight bash linenos %}
/var/log/clamav/freshclam.log {
    missingok
    notifempty
    create 644 clamav clamav  # <= "clam clam" になってたら "clamav clamav" に修正
}
{% endhighlight %}

#### 4. 確認

`freshclam` コマンドを実行してエラーが発生しなければ OK.  
また、`cron.daily` による毎日の起動時エラーメールが届かないことも確認する。

---

ちなみに、少し前まで CentOS 6.2 から 6.3, 6.4 へと順次アップグレードしてきた環境で運用していましたが、先日 CentOS 6.4 をクリーンインストールしてから今回のようなエラーに見舞われるようになっていました。（因果関係は不明）

しかし、原因と対策は判明したので、今後は慌てなくてすみます。

以上。

