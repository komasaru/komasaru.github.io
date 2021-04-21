---
layout   : single
title    : "Ruby - RSpec でテスト！"
published: true
date     : 2013-02-21 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- テスト
- RSpec
---

Ruby でのテストについてですが、今回は RSpec でのテスト環境についてです。  
RSpec は gem パッケージ作成時のテスト環境として使用するつもりです。

ちなみに、以前 Test, Minitest について簡単に記録しています。

- [Ruby - Test::Unit, Minitest::Unit でユニットテスト！]({{site.baseurl}}/2012/06/24/24002005/ "Ruby - Test::Unit, Minitest::Unit でユニットテスト！")

<!--more-->

### 0. 前提条件

- OS は Linux Mint 14 Nadia(64bit) を想定。（OS やディストリビューションはこだわらないはず）
- Ruby 1.9.3-p385 を使用。
- RSpec の導入から簡単なテスト実行までを説明する。  
  RSpec については現在勉強中なので、詳細はここでは説明しない。（後述の参考サイトを参照）

### 1. RSpec インストール

gem パッケージ RSpec が未インストールならインストールする。

``` bash 
$ sudo gem install rspec

$ rspec -v
2.12.2
```

### 2. テストコード作成

テストコード（スペックファイル）を作成する。  
サフィックス（接尾辞）を `_spec` とするのが一般的のようだ。  
また、 `describe` や `it` に渡す文字列には日本語も使えるようだ。  
以下は一例で、未定義のクラス `Stack` について記述している。（日本を使用したり、 `it` の代わりに `specify` を使用したり）

File: `stack_spec.rb`

{% highlight ruby linenos %}
# -*- coding: utf-8 -*-
describe "Stack" do
  context "新しく生成した時" do
    before(:all) do
      # 振舞レベルで一度だけ実行される前処理
    end

    before(:each) do
      # 各exampleについての前処理
    end

    before do
      # 各exampleについての前処理
      # before(:each) と同義
      @stack = Stack.new
    end

    it "should be empty" do
      @stack.should be_empty
    end

    specify "サイズが0であること" do
      @stack.size.should == 0
    end

    after(:each) do
      # 各exampleについての後処理
    end

    after do
      # 各exampleについての後処理
      # after(:each) と同義
      @stack = nil
    end

    after(:all) do
      # 振舞レベルで一度だけ実行される後処理
    end
  end
end
{% endhighlight %}

### 3. RSpec 実行

作成してたスペックファイルを引数に指定して RSpec を実行する。  
以下の例では `-c` オプションでカラー表示するようにしている。（実際はカラー表示）

File: `lang.bash`

{% highlight text linenos %} 
$ spec -c stack_spec.rb
FF

Failures:

  1) Stack 新しく生成した時 should be empty
     Failure/Error: @stack = Stack.new
     NameError:
       uninitialized constant Stack
     # ./stack_spec.rb:15:in `block (3 levels) in <top (required)>'

  2) Stack 新しく生成した時 サイズが0であること
     Failure/Error: @stack = Stack.new
     NameError:
       uninitialized constant Stack
     # ./stack_spec.rb:15:in `block (3 levels) in <top (required)>'

Finished in 0.00157 seconds
2 examples, 2 failures

Failed examples:

rspec ./stack_spec.rb:18 # Stack 新しく生成した時 should be empty
rspec ./stack_spec.rb:22 # Stack 新しく生成した時 サイズが0であること
{% endhighlight %}

`-fd` オプションで仕様書形式で結果表示される。

File: `lang.bash`

{% highlight text linenos %} 

Stack
  新しく生成した時
    should be empty (FAILED - 1)
    サイズが0であること (FAILED - 2)

Failures:

  1) Stack 新しく生成した時 should be empty
     Failure/Error: @stack = Stack.new
     NameError:
       uninitialized constant Stack
     # ./stack_spec.rb:15:in `block (3 levels) in <top (required)>'

  2) Stack 新しく生成した時 サイズが0であること
     Failure/Error: @stack = Stack.new
     NameError:
       uninitialized constant Stack
     # ./stack_spec.rb:15:in `block (3 levels) in <top (required)>'

Finished in 0.00164 seconds
2 examples, 2 failures

Failed examples:

rspec ./stack_spec.rb:18 # Stack 新しく生成した時 should be empty
rspec ./stack_spec.rb:22 # Stack 新しく生成した時 サイズが0であること
{% endhighlight %}

その他、 `rspec` のオプションは `rspec -h` で確認可能。

### 4. プロダクトコード作成

テストで失敗した箇所を成功させるべく、プロダクトコードを作成する。  
（スペックファイル `stack_spec.rb` と同じディレクトリに配置している）

File: `stack.rb`

{% highlight ruby linenos %}
class Stack
  def initialize
    @stack = []
  end

  def empty?
    @stack.empty?
  end

  def size
    @stack.size
  end
end
{% endhighlight %}

### 5. スペックファイル再編集

作成したプロダクトコードを読み込むようスペックファイルを編集する。

File: `stack_spec.rb`

{% highlight ruby linenos %}
# -*- coding: utf-8 -*-
require './stack'  # <= 追記

describe "Stack" do
{% endhighlight %}

### 6. RSpec 再実行

プロダクトコードが正常かどうか再度 RSpec テストを実行してみる。

File: `lang.bash`

{% highlight text linenos %} 
$ spec -c stack_spec.rb
..

Finished in 0.00163 seconds
2 examples, 0 failures
{% endhighlight %}

テストに成功した。

### 7. 参考サイト

- [Rubyアソシエーション: テスト](http://www.ruby.or.jp/ja/tech/development/ruby/055_test.html "Rubyアソシエーション: テスト")
- [Rubyist Magazine - スはスペックのス 【第 1 回】 RSpec の概要と、RSpec on Rails (モデル編)](http://jp.rubyist.net/magazine/?0021-Rspec "Rubyist Magazine - スはスペックのス 【第 1 回】 RSpec の概要と、RSpec on Rails (モデル編)")

---

今回は簡単なテストの例でしたが、実際にはテストコードをバリバリと書いていくことになります。

また、 gem パッケージを作成する際などは、頻繁に作成した Ruby スクリプトを動かしてテストすることが困難なため、こういったテストユニットを利用することが重要になってきます。

以上。

