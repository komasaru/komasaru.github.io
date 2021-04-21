---
layout   : single
title    : "Ruby - Bundler で gem パッケージ作成！"
published: true
date     : 2013-02-19 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

Ruby で gem パッケージを作成するには、 NewGem や Jeweler を使用する方法もあるようですが、今回は Bundler を使用する方法について記録してみました。

<!--more-->

### 0. 前提条件

- OS は Linux Mint 14 Nadia(64bit) を想定
- Ruby 1.9.3-p385 を使用。
- Git がインストール済みである。
- 試験的に作成する gem パッケージ名は `test_gem` とする。
- 今回は、テストについては考えない。（gem パッケージを作成することが今回の目的なので）

### 1. gem パッケージ Bundler インストール

gem パッケージ Bundler が未インストールならインストールする。（大抵はインストール済みのはず）

``` bash 
$ sudo gem install bundler
```

### 2. gem プロジェクト作成

次のようにして、適当なディレクトリで gem パッケージのプロジェクト（要は gem パッケージの雛形）を作成する。

``` bash 
$ bundle gem test_gem
      create  test_gem/Gemfile
      create  test_gem/Rakefile
      create  test_gem/LICENSE.txt
      create  test_gem/README.md
      create  test_gem/.gitignore
      create  test_gem/test_gem.gemspec
      create  test_gem/lib/test_gem.rb
      create  test_gem/lib/test_gem/version.rb
Initializating git repo in /home/masaru/test_gem
```

### 3. gemspec 編集

使用するマシンに Git がインストール済みなら、 `authors`, `email` には Git に設定している値が格納されているはず。  
また、 `TODO` という文字列があるとビルドできないので、適切な文言に変更する。（`summary` にはタイトルを、 `description` には説明を）  
`homepage` に公開する場合の URL を設定する。  
作成する gem 自体に依存するパッケージがある場合は `add_runtime_devendency` で、gem の開発に必要なパッケージがある場合は、 `add_development_dependency` で設定する。

File: `test_gem/test_gem.gemspec`

{% highlight ruby linenos %}
# -*- encoding: utf-8 -*-
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'test_gem/version'

Gem::Specification.new do |gem|
  gem.name          = "test_gem"
  gem.version       = TestGem::VERSION
  gem.authors       = ["foo"]
  gem.email         = ["foo@bar"]
  gem.description   = %q{A first test script for RubyGem.}
  gem.summary       = %q{Test gem}
  gem.homepage      = ""

  gem.files         = `git ls-files`.split($/)
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.require_paths = ["lib"]
end
{% endhighlight %}

### 4. 実装

「gem は `require` 時に `lib/test_gem.rb` を読み込む」という事を理解した上で、実際にコーディング作業を行う。  
場合によりサブディレクトリを利用し `lib/test_gem.rb` から `require` するようにしたりする。  
以下は当方の例で、文字列を出力するだけのもの（別ファイルを `require` する形にしている）。

File: `test_gem/lib/test_gem.rb`

{% highlight ruby linenos %}
require "test_gem/version"
require "test_gem/disp"

module TestGem
  # Your code goes here...
end
{% endhighlight %}

File: `test_gem/lib/test_gem/disp.rb`

{% highlight ruby linenos %}
# -*- coding: utf-8 -*-
class Disp
  def display
    "作成した gem は正常に動作しました！"
  end
end
{% endhighlight %}

### 5. バージョン管理

gem のバージョン管理は `test_gem/lib/test_gem/version.rb` で行う。  
特に、公開する際には数字を上げてから公開するようにする。

File: `test_gem/lib/test_gem/version.rb`

{% highlight ruby linenos %}
module TestGem
  VERSION = "0.0.1"
end
{% endhighlight %}

### 6. コミット

パッケージ化する前に Git コミットをしておく。  
これは、 `gemspec` 内の `git ls-files` によりパッケージ化するファイル（コミット済みのファイル）の一覧を取得するため。  
（ファイルを複数に分割していないのであれば、コミットしてなくても大丈夫（多分））

``` bash 
$ cd test_gem
$ git add .
$ git commit -m "First commit."
```

### 7. パッケージ化

ビルドして gem パッケージ化する。  
`test_gem-0.0.1.gem` というファイルが作成されるはずである。

``` bash 
$ rake build
test_gem 0.0.1 built to pkg/test_gem-0.0.1.gem
```

もしくは、以下のようにしてもよい。

``` bash 
$ gem build test_gem.gemspec
```

### 8. インストール

作成した gem パッケージをインストールする。

``` bash 
$ sudo gem install pkg/test_gem-0.0.1.gem
Successfully installed test_gem-0.0.1
1 gem installed
Installing ri documentation for test_gem-0.0.1...
Installing RDoc documentation for test_gem-0.0.1...
```

`gem build` でビルドしている場合は、上記の `pkg/` の部分は不要。  
（ちなみに、 `rake install` でインストールしようとすると 「`gem install` でインストールせよ」という旨のエラーになる。）

そして、インストールできているか確認する。

``` bash 
$ gem list | grep test_gem
test_gem (0.0.1)
```

### 9. 動作確認

実際に作成された gem パッケージを `require` して使用してみる。  
`require` ができて、正常に機能することを確認する。

``` bash 
$ irb
irb(main):001:0> require 'test_gem'
=> true
irb(main):002:0> obj = Disp.new
=> #<Disp:0x00000001d5f678>
irb(main):003:0> obj.display
=> "作成した gem は正常に動作しました！"
```

### 10. 参考サイト

- [Bundler: The best way to manage Ruby applications](http://gembundler.com/ "Bundler: The best way to manage Ruby applications")
- [Specification Reference - RubyGems Guides](http://guides.rubygems.org/specification-reference/ "Specification Reference - RubyGems Guides")
- [guides/gem-development.md at master · radar/guides · GitHub](https://github.com/radar/guides/blob/master/gem-development.md "guides/gem-development.md at master · radar/guides · GitHub")

---

これで、 Bundler による gem 作成が可能になりました。

当初、 Git は GitHub に公開する際にだけ使用するものだと思っていましたが、実際はビルド前にコミットしておく必要があるということに気付くまで少々時間がかかってしまいました。

また、当方は自前のサーバに Git サーバを構築しているので、普段は Git サーバで開発作業（Git 管理）し、公開できるようになった時点で GitHub にアップするようにします。

以上。

