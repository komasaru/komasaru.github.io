---
layout   : single
title    : "Ruby - RbConfig でインストール時の情報取得！"
published: true
date     : 2013-08-19 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

Ruby をインストール（インタープリタ作成）する際に設定した情報を確認する方法についての備忘録です。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 での作業・動作確認を想定。

#### 1. 設定値の確認

以下のようにすれば、設定値（キー、値）を確認できる。

``` ruby 
RbConfig::CONFIG.sort.each { |c| p c }
```

File: `実行結果`

{% highlight bash linenos %}
["ALLOCA", ""]
["AR", "ar"]
["ARCHFILE", ""]
["ARCH_FLAG", ""]
["AS", "as"]
["ASFLAGS", ""]
["BTESTRUBY", "$(MINIRUBY)"]
["BUILTIN_TRANSSRCS", " newline.c"]
["CAPITARGET", "nodoc"]
["CC", "gcc"]
        :
===< 途中省略 >===
        :
["target_os", "linux"]
["target_vendor", "unknown"]
["topdir", "/usr/local/lib/ruby/2.0.0/x86_64-linux"]
["try_header", ""]
["vendorarchdir", "/usr/local/lib/ruby/vendor_ruby/2.0.0/x86_64-linux"]
["vendorarchhdrdir", "/usr/local/include/ruby-2.0.0/vendor_ruby/x86_64-linux"]
["vendordir", "/usr/local/lib/ruby/vendor_ruby"]
["vendorhdrdir", "/usr/local/include/ruby-2.0.0/vendor_ruby"]
["vendorlibdir", "/usr/local/lib/ruby/vendor_ruby/2.0.0"]
["warnflags", "-Wall -Wextra -Wno-unused-parameter -Wno-parentheses -Wno-long-long -Wno-missing-field-initializers -Wunused-variable -Wpointer-arith -Wwrite-strings -Wdeclaration-after-statement -Wimplicit-function-declaration"]
{% endhighlight %}

#### 2. 設定値の確認（その２）

`RbConfig::CONFIG` と同じだが、他の変数への参照の形で確認できる。
（`CONFIG` 変数は、`MAKEFILE_CONFIG` の内容から `RbConfig.expand` を使って生成されている）

``` ruby 
RbConfig::MAKEFILE_CONFIG.sort.each { |c| p c }
```

File: `実行結果`

{% highlight bash linenos %}
["ALLOCA", ""]
["AR", "ar"]
["ARCHFILE", ""]
["ARCH_FLAG", ""]
["AS", "as"]
["ASFLAGS", ""]
["BTESTRUBY", "$(MINIRUBY)"]
["BUILTIN_TRANSSRCS", " newline.c"]
["CAPITARGET", "nodoc"]
["CC", "gcc"]
        :
===< 途中省略 >===
        :
["target_os", "linux"]
["target_vendor", "unknown"]
["topdir", "/usr/local/lib/ruby/2.0.0/x86_64-linux"]
["try_header", ""]
["vendorarchdir", "$(vendorlibdir)/$(sitearch)"]
["vendorarchhdrdir", "$(vendorhdrdir)/$(sitearch)"]
["vendordir", "$(rubylibprefix)/vendor_ruby"]
["vendorhdrdir", "$(rubyhdrdir)/vendor_ruby"]
["vendorlibdir", "$(vendordir)/$(ruby_version)"]
["warnflags", "-Wall -Wextra -Wno-unused-parameter -Wno-parentheses -Wno-long-long -Wno-missing-field-initializers -Wunused-variable -Wpointer-arith -Wwrite-strings -Wdeclaration-after-statement -Wimplicit-function-declaration"]
{% endhighlight %}

#### 3. DESTDIR の確認

`make install` 時に `DESTDIR` を指定していた場合は、その値を以下のようにして確認できる。（当方は指定していないので空）

File: `実行結果`

{% highlight ruby linenos %}
p RbConfig::DESTDIR
# => ""
{% endhighlight %}

#### 4. TOPDIRの確認

`TOPDIR`（Ruby がインストールされているディレクトリ）は、以下のようにして確認できる。

File: `実行結果`

{% highlight ruby linenos %}
p RbConfig::TOPDIR
# => "/usr/local"
{% endhighlight %}

実際には、Ruby がインストールされているディレクトリのあるディレクトリが取得できる。

#### 5. ruby コマンドフルパスの確認

`ruby` コマンドのフルパスは、以下のようにして確認できる。

File: `実行結果`

{% highlight ruby linenos %}
p RbConfig.ruby
# => "/usr/local/bin/ruby"
{% endhighlight %}

#### 6. パスの展開

指定のパスを展開して確認するには、以下のようにする。

File: `実行結果`

{% highlight ruby linenos %}
p RbConfig.expand("$(ruby_version)")
# => "2.0.0"
p RbConfig.expand("$(RUBY_VERSION_NAME)")
# => "ruby-2.0.0"
{% endhighlight %}

#### 参考サイト

- [module RbConfig](http://doc.ruby-lang.org/ja/2.0.0/class/RbConfig.html "module RbConfig")

---

インストール時の情報を確認したくなる局面はあまりないと思いますが、いざという時のために記録しておいた次第です。

以上。

