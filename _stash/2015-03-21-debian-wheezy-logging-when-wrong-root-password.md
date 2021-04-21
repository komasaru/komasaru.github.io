---
layout   : single
title    : "Debian Wheezy - su(root) パスワード誤入力時のログ！"
published: true
date     : 2015-03-21 00:20:00 +0900
comments : true
categories:
- PC_Tips
tags:
- Linux
- Debian
---
こんにちは。

Debian GNU/Linux Wheezy 7.8.0 で、`su -` コマンドで root のパスワードを誤入力した場合についての単なる備忘録です。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux Wheezy 7.8.0 で確認。

### 1. ログの確認

一般ユーザから root になるためには `su -` を実行して root のパスワードを入力するが、その際にパスワードを誤った場合は "/var/log/auth.log" に以下のようなログが出力される。（`foo` は一般ユーザ名）

File: `/var/log/auth.log`

{% highlight bash linenos %}
Feb  1 23:52:57 noah su[3756]: pam_unix(su:auth): authentication failure; logname=foo uid=1000 euid=0 tty=/dev/pts/1 ruser=foo rhost=  user=root
Feb  1 23:52:59 noah su[3756]: pam_authenticate: Authentication failure
Feb  1 23:52:59 noah su[3756]: FAILED su for root by foo
Feb  1 23:52:59 noah su[3756]: - /dev/pts/1 foo:root
{% endhighlight %}

また、一般ユーザで `sudo` コマンドで su 権限の必要なコマンド実行する際には一般ユーザのパスワードを入力するが、その際にパスワードを誤った場合は "/var/log/auth.log" に以下のようなログが出力される。（`foo` は一般ユーザ名）

File: `/var/log/auth.log`

{% highlight bash linenos %}
Feb  1 23:55:25 noah sudo: pam_unix(sudo:auth): authentication failure; logname=foo uid=1000 euid=0 tty=/dev/pts/1 ruser=foo rhost=  user=foo
{% endhighlight %}

### 2. 対策

単純にパスワードの誤入力であるので、パスワードを正しく入力すればよいだけ。

---

たまたまログを閲覧していて気付いただけであり、今後また目にした際に慌てないために記録しておいた次第です。

以上。

