---
layout   : single
title    : "Linux - cron での locale の挙動！"
published: true
date     : 2013-11-26 00:20:00 +0900
comments : true
categories:
- サーバ構築
tags:
- サーバ構築
- Linux
- CentOS
---

Linux で、自分が作成したスクリプトがコンソール上では正常に動作するのに、 cron で定時起動させようとすると文字コードの関係でうまく日本語出力ができないことがあります。

以下、それについての備忘録です。

<!--more-->

#### 0. 前提条件

- CentOS 6.4 (32bit) での作業を想定。
- cron は `crontab -e` ではなく、 `/etc/cron.d/` ディレクトリ配下にファイルを設置する方法。
- 文字化けが起こるスクリプトは "UTF-8" でエンコードされていて、日本語出力を伴うことを想定。  
  （当然、日本語出力を伴わないのならロケールの心配もない）

### 1. cron 外（コンソール）でのロケール

普通にコンソールで `locale` コマンドでロケールを確認してみる。

``` text 
# locale
LANG=ja_JP.UTF-8
LC_CTYPE="ja_JP.UTF-8"
LC_NUMERIC="ja_JP.UTF-8"
LC_TIME="ja_JP.UTF-8"
LC_COLLATE="ja_JP.UTF-8"
LC_MONETARY="ja_JP.UTF-8"
LC_MESSAGES="ja_JP.UTF-8"
LC_PAPER="ja_JP.UTF-8"
LC_NAME="ja_JP.UTF-8"
LC_ADDRESS="ja_JP.UTF-8"
LC_TELEPHONE="ja_JP.UTF-8"
LC_MEASUREMENT="ja_JP.UTF-8"
LC_IDENTIFICATION="ja_JP.UTF-8"
LC_ALL=
```

### 2. cron 内でのロケール

次に cron 内で `locale` コマンドを実行させてみる。  
例えば、以下のようなファイル `/etc/cron.d/locale_test` を作成してみる。

File: `/etc/cron.d/locale_test`

{% highlight bash linenos %} 
* * * * * root locale > /home/hoge/work/locale.log
{% endhighlight %}

毎分 "/home/hoge/work/" ディレクトリ内に "locale.log" というファイルが作成されるので、内容を確認してみる。

File: `/home/hoge/work/locale.log`

{% highlight bash linenos %} 
LANG=
LC_CTYPE="POSIX"
LC_NUMERIC="POSIX"
LC_TIME="POSIX"
LC_COLLATE="POSIX"
LC_MONETARY="POSIX"
LC_MESSAGES="POSIX"
LC_PAPER="POSIX"
LC_NAME="POSIX"
LC_ADDRESS="POSIX"
LC_TELEPHONE="POSIX"
LC_MEASUREMENT="POSIX"
LC_IDENTIFICATION="POSIX"
LC_ALL=
{% endhighlight %}

"ja_JP.UTF-8" でなく "POSIX" となっている。  
これでは、UTF-8 でエンコードされているスクリプトは日本語表示で不具合を起こすでしょう。

### 3. 対処方法

cron 内で UTF-8 でデンコードされたスクリプトを実行させる場合は、以下のように `LC_CTYPE`, `LANG` を設定してやる。

File: `/etc/cron.d/locale_test`

{% highlight bash linenos %} 
LC_CTYPE="ja_JP.utf8"
LANG="ja_JP.utf8"

* * * * * root locale > /home/hoge/work/locale.log
{% endhighlight %}

再度 "/home/hoge/work/" ディレクトリ内の "locale.log" の内容を確認してみる。

File: `/home/hoge/work/locale.log`

{% highlight bash linenos %} 
LANG="ja_JP.utf8"
LC_CTYPE="ja_JP.utf8"
LC_NUMERIC="ja_JP.utf8"
LC_TIME="ja_JP.utf8"
LC_COLLATE="ja_JP.utf8"
LC_MONETARY="ja_JP.utf8"
LC_MESSAGES="ja_JP.utf8"
LC_PAPER="ja_JP.utf8"
LC_NAME="ja_JP.utf8"
LC_ADDRESS="ja_JP.utf8"
LC_TELEPHONE="ja_JP.utf8"
LC_MEASUREMENT="ja_JP.utf8"
LC_IDENTIFICATION="ja_JP.utf8"
LC_ALL=
{% endhighlight %}

"ja_JP.utf8" になりました。（`UTF-8` と `utf8` の違いはあるが問題ない）  
これで、日本語出力で文字化けすることがなくなります。

### 4. 参考

上記では任意のスクリプトについて話したが、UTF-8 エンコードの Ruby スクリプト（日本語出力を伴うもの）を cron 起動させるには以下のように `-Ku` オプションで文字コードを指定することでも対処可能である。

File: `/etc/cron.d/locale_test`

{% highlight bash linenos %} 
* * * * * root /usr/local/bin/ruby -Ku test_script.rb
{% endhighlight %}

### 5. 後始末

当然、テストで作成した cron スクリプトは不要なので削除しておく。

---

以上。

