---
layout   : single
title    : "Ruby - gem ライブラリの作成(by Bundler, TDD)！"
published: true
date     : 2016-06-26 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- RubyGems
---

以前も Bundler による Ruby の gem パッケージを作成する方法について記事にしたことがありましたが、新たに記録し直しました。

<!--more-->

### 0. 前提条件

* Ruby 2.3.1-p112 での作業を想定。
* TDD（テスト駆動開発）を想定。
* テストに RSpec を使用することを想定。
* テスト自動化のために Guard を使用することを想定。
* 作成する gem の名称は "mk_test" を想定。
* 今回は [RubyGems.org](https://rubygems.org/ "RubyGems.org") への公開は非考慮。  
  （大量の自作 gem ライブラリのうち、取るに足りないものまで公開する気はないので（公開に値するもののみを公開したいので））

### 1. gem の雛形作成

``` text
$ bundle gem mk_test -b -t
Creating gem 'mk_test'...
      create  mk_test/Gemfile
      create  mk_test/.gitignore
      create  mk_test/lib/mk_test.rb
      create  mk_test/lib/mk_test/version.rb
      create  mk_test/mk_test.gemspec
      create  mk_test/Rakefile
      create  mk_test/README.md
      create  mk_test/bin/console
      create  mk_test/bin/setup
      create  mk_test/.travis.yml
      create  mk_test/.rspec
      create  mk_test/spec/spec_helper.rb
      create  mk_test/spec/mk_test_spec.rb
      create  mk_test/exe/mk_test
Initializing git repo in /home/masaru/src/rubygems/mk_test
```

* `-b` は、 exe ディレクトリ下に実行可能コマンドを生成するオプション（`--bin` も同じ）  
  （これまでの "bin" ディレクトリとは意味合いが若干異なることに留意 → [move gem bins to exe/ and add console and setup - bundler/bundler@ab3e217](https://github.com/bundler/bundler/commit/ab3e21784c6c18702869c771fbe7ae23c82cc7c0#commitcomment-9709004 "move gem bins to exe/ and add console and setup - bundler/bundler@ab3e217")）
* `-t` は、 RSpec テストの雛形を生成するオプション（`--test` も同じ）
* MIT ライセンスファイルを生成したければ、 `--mit` オプションを指定する
* Code of Conduct (CoC) ファイルを生成したければ、 `--coc` オプションを指定する

後の作業のために、ディレクトリを移動しておく。

``` text
$ cd mk_test
```

### 2. gemspec ファイルの編集

`spec.author`, `spec.email`, `spec.summary`, `spec.description` 等（特に `TODO` の部分）を編集する。（`TODO` が残っていると `rake build` できない）

File: `mk_test.gemspec`

{% highlight ruby linenos %}
# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'mk_test/version'

Gem::Specification.new do |spec|
  spec.name          = "mk_test"
  spec.version       = MkTest::VERSION
  spec.authors       = ["mk-mode"]
  spec.email         = ["postmaster@mk-mode.com"]

  spec.summary       = %q{My test gem.}
  spec.description   = %q{This is a gem library fot testing.}
  spec.homepage      = "http://www.mk-mode.com/"

  # Prevent pushing this gem to RubyGems.org by setting 'allowed_push_host', or
  # delete this section to allow pushing this gem to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against public gem pushes."
  end

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.11"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency "rspec", "~> 3.0"
end
{% endhighlight %}

* Git で作者やメールアドレスが設定済みなら、その情報で埋められているはず。
* [RubyGems.org](https://rubygems.org/ "RubyGems.org") 等で公開する予定があるのなら、漏れなく記入する。
* `# Prevent pushing this gem ...` からの７行は、RubyGems.org へのリリースを許可するホストの設定。  
  ホストの許可を設定しないのならコメントアウトする。（リリースしないのなら関係ないので、そのままでもよい）

### 3. 依存ライブラリのインストール

（先ほど作成した gem も含む）

``` text
$ bundle install
```

ちなみに、プロジェクトごとに依存ライブラリを管理したければ `--path vendor/bundle` オプションを指定する。

### 4. 最初のテスト

``` text
$ rake spec

MkTest
  has a version number
  does something useful (FAILED - 1)

Failures:

  1) MkTest does something useful
     Failure/Error: expect(false).to eq(true)

       expected: true
            got: false

       (compared using ==)
     # ./spec/mk_test_spec.rb:9:in `block (2 levels) in <top (required)>'

Finished in 0.03516 seconds (files took 0.09742 seconds to load)
2 examples, 1 failure

Failed examples:

rspec ./spec/mk_test_spec.rb:8 # MkTest does something useful

```

`bundle gem` で意図的に失敗するテストが生成されるので、これは削除しておく。

File: `spec/mk_test_spec.rb`

{% highlight ruby linenos %}
require 'spec_helper'

describe MkTest do
  it 'has a version number' do
    expect(MkTest::VERSION).not_to be nil
  end

  it 'does something useful' do  # <= 削除
    expect(false).to eq(true)    # <= 削除
  end                            # <= 削除
end
{% endhighlight %}

``` text
$ rake spec

MkTest
  has a version number

Finished in 0.00084 seconds (files took 0.08782 seconds to load)
1 example, 0 failures
```

(この項の `rake spec` は `bundle exec rspec` と置き換えてもよい）

### 5. Guard の導入

テスト自動化のために Guard を導入する。

まず、"Gemfile" に以下を記述する。（gem 自体の開発には関係ないので gemspec ファイルではない）

File: `Gemfile`

{% highlight ruby linenos %}
group :development do
  gem "guard"
  gem "guard-rspec", "~> 4.7.0"
end
{% endhighlight %}

そして、

``` text
$ bundle install
```

次に、以下を実行して "Guardfile" を生成する。

``` text
$ bundle exec guard init rspec
23:49:07 - INFO - Writing new Guardfile to /home/masaru/src/rubygems/mk_test/Guardfile
23:49:08 - INFO - rspec guard added to Guardfile, feel free to edit it
```

今回は Rails 系の開発ではないので "Guardfile" から Rails 関係の記述を削除する。

File: `Guardfile`

{% highlight ruby linenos %}
guard :rspec, cmd: "bundle exec rspec" do
  require "guard/rspec/dsl"
  dsl = Guard::RSpec::Dsl.new(self)

  # Feel free to open issues for suggestions and improvements

  # RSpec files
  rspec = dsl.rspec
  watch(rspec.spec_helper) { rspec.spec_dir }
  watch(rspec.spec_support) { rspec.spec_dir }
  watch(rspec.spec_files)

  # Ruby files
  ruby = dsl.ruby
  dsl.watch_spec_files_for(ruby.lib_files)

  # ====[ 以下を削除 ]===>
  # Rails files
  rails = dsl.rails(view_extensions: %w(erb haml slim))
  dsl.watch_spec_files_for(rails.app_files)
  dsl.watch_spec_files_for(rails.views)

  watch(rails.controllers) do |m|
    [
      rspec.spec.call("routing/#{m[1]}_routing"),
      rspec.spec.call("controllers/#{m[1]}_controller"),
      rspec.spec.call("acceptance/#{m[1]}")
    ]
  end

  # Rails config changes
  watch(rails.spec_helper)     { rspec.spec_dir }
  watch(rails.routes)          { "#{rspec.spec_dir}/routing" }
  watch(rails.app_controller)  { "#{rspec.spec_dir}/controllers" }

  # Capybara features specs
  watch(rails.view_dirs)     { |m| rspec.spec.call("features/#{m[1]}") }
  watch(rails.layouts)       { |m| rspec.spec.call("features/#{m[1]}") }

  # Turnip features and steps
  watch(%r{^spec/acceptance/(.+)\.feature$})
  watch(%r{^spec/acceptance/steps/(.+)_steps\.rb$}) do |m|
    Dir[File.join("**/#{m[1]}.feature")][0] || "spec/acceptance"
  end
  # <===[ ここまで ]====
end
{% endhighlight %}

以下を実行することで、"lib", "spec" ディレクトリ配下のファイルに変更があった際に自動でテストが走る。

``` text
$ bundle exec guard
```

ちなみに、 Guard を利用しない場合は、以下のコマンドで都度テストを走らせる。

``` text
$ rake spec
```

(`rake spec` は `bundle exec rspec` と置き換えてもよい）

### 6. テスト（テストコード）の作成

今回は TDD（狭義では、 RSpec は TDD（テスト駆動開発） でなく BDD（振る舞い駆動開発）であるが）なので、テストを記述していく。（言い換えれば、仕様を決めていく）

（RSpec については、ここでは説明しない）

### 7. gem ライブラリ（プロダクトコード）の作成

テストが通るように gem ライブラリを作成していく。

そして、テストコードの作成とプロダクトコードの作成を繰り返して、 gem ライブラリを作り上げていく。

### 8. 実行ファイルの編集

"bin" ディレクトリでなく "exe" ディレクトリであることに注意。（→ [move gem bins to exe/ and add console and setup - bundler/bundler@ab3e217](https://github.com/bundler/bundler/commit/ab3e21784c6c18702869c771fbe7ae23c82cc7c0#commitcomment-9709004 "move gem bins to exe/ and add console and setup - bundler/bundler@ab3e217")）

File: `exe/mk_test`

{% highlight ruby linenos %}
#!/usr/bin/env ruby

require "mk_test"

MkTest.run  # <= 追加（これは単なる一例。コマンドライン引数がある場合は MkTest.run(ARGV) etc...）
{% endhighlight %}

### 9. 実行確認

（以下は、コマンドライン引数のない場合の例）

``` text
$ bundle exec exe/mk_test
```

### 10. バージョンの編集

必要に応じてバージョンを編集する。（実際に [RubyGems.org](https://rubygems.org/ "RubyGems.org") 等へ公開する場合は必須）

File: `lib/mk_test/version.rb`

{% highlight ruby linenos %}
module MkTest
  VERSION = "0.1.0"
end
{% endhighlight %}

バージョンの考え方は以下を参照。

* [セマンティック バージョニング 2.0.0](http://semver.org/lang/ja/ "セマンティック バージョニング 2.0.0")

### 11. git コミット

git でコミットしておかないと綺麗に `gem install` できないので、コミットする。  
（必要なら、リモートリポジトリにプッシュするなどする）

``` text
$ git add .
$ git commit -m "ADD: First commit."
```

### 12. gem パッケージの作成

gem ライブラリが完成したら、パッケージを作成する。

``` text
$ rake build
mk_test 0.1.0 built to pkg/mk_test-0.1.0.gem.
```

(`rake ` は `bundle exec` と置き換えてもよい）

"pkg" ディレクトリに gem パッケージが作成される。

### 13. gem パッケージのインストール

作成された gem パッケージをインストールする。

``` text
$ cd pkg
$ sudo gem install -l mk_test-0.1.0.gem
Successfully installed mk_test-0.1.0
Parsing documentation for mk_test-0.1.0
Installing ri documentation for mk_test-0.1.0
Done installing documentation for mk_test after 1 seconds
1 gem installed
```

`-l` は、ローカルの gem ライブラリをインストールするオプション。  
また、 "pkg" ディレクトリに移動してから `gem install` を実行しないと、以下のようなエラーメッセージが出力されるかもしれない。（エラーは出ても、インストールはできる。当方だけ？）

``` text
ERROR:  Could not find a valid gem 'mk_test' (>= 0) in any repository
```

### 14. 動作確認

あとは、通常の gem ライブラリと同様に扱えばよい。

### 15. その他

ちなみに、ここでは詳細に説明しないが、[RubyGems.org](https://rubygems.org/ "RugyGems.org") へのリリースは、 GitHub への push, RugyGems アカウントの作成、 APIキーの取得後に `rake release` で行う。

### 16. 参考サイト

* [Bundler: The best way to manage a Ruby application's gems](http://bundler.io/ "Bundler: The best way to manage a Ruby application's gems")
* [move gem bins to exe/ and add console and setup - bundler/bundler@ab3e217](https://github.com/bundler/bundler/commit/ab3e21784c6c18702869c771fbe7ae23c82cc7c0#commitcomment-9709004 "move gem bins to exe/ and add console and setup - bundler/bundler@ab3e217")
* [若手エンジニア／初心者のためのRuby 2.1入門（13）：Rubyで逆ポーランド変換機を作りgem作成＆コマンドの使い方 - ＠IT](http://www.atmarkit.co.jp/ait/articles/1502/05/news041.html "若手エンジニア／初心者のためのRuby 2.1入門（13）：Rubyで逆ポーランド変換機を作りgem作成＆コマンドの使い方 - ＠IT")
* [RubyGems 開発速習会 - Qiita](http://qiita.com/dtan4/items/ea25b1c74346e330d5eb "RubyGems 開発速習会 - Qiita")

etc.

---

以上。

