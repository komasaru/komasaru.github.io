---
layout   : single
title    : "Ruby - 定数一覧取得！"
published: true
date     : 2013-08-18 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
---

Ruby でプログラミング中に、どのような定数がどのような値で定義されているのか確認したいことがあります。

以下、備忘録です。

<!--more-->

#### 0. 前提条件

- Ruby 2.0.0-p247 での作業・動作確認を想定。

#### 1. クラス内定義の定数をクラス内で確認

クラス（またはモジュール）内で定義した定数の一覧をそのクラス内で確認するには以下のようにする。

``` ruby 
class Hoge
  HOGE = "TEST_HOGE"
  constants.each do |c|
    puts "#{c} = #{const_get(c)}"
  end
end
```

File: `実行結果`

{% highlight bash linenos %}
HOGE = TEST_HOGE
{% endhighlight %}

#### 2. クラス内定義の定数をクラス外から確認

クラス（またはモジュール）内で定義した定数の一覧をそのクラスの外から確認するには以下のようにする。

``` ruby 
class Hoge
  HOGE = "TEST_HOGE"
end

Hoge.constants.each do |c|
  puts "#{c} = #{Hoge.const_get(c)}"
end
```

File: `実行結果`

{% highlight bash linenos %}
HOGE = TEST_HOGE
{% endhighlight %}

#### 3. 継承クラスと親クラスで定義された定数をクラス外から確認

継承クラスとその親クラスで定義された定数の一覧をそのクラスの外から確認するには以下のようにする。

``` ruby 
class Hoge
  HOGE = "TEST_HOGE"
end

class Fuga < Hoge
  FUGA = "TEST_FUGA"
end

Fuga.constants.each do |c|
  puts "#{c} = #{Fuga.const_get(c)}"
end
```

File: `実行結果`

{% highlight bash linenos %}
FUGA = TEST_FUGA
HOGE = TEST_HOGE
{% endhighlight %}

#### 4. 継承クラスで定義された定数のみをクラス外から確認

継承クラスで定義された定数のみをそのクラスの外から確認するには以下のようにする。（親クラスで定義された定数は含めない）  
`constants(false)` とする。（デフォルトは `constants(true)` となっている）

``` ruby 
class Hoge
  HOGE = "TEST_HOGE"
end

class Fuga < Hoge
  FUGA = "TEST_FUGA"
end

Fuga.constants(false).each do |c|
  puts "#{c} = #{Fuga.const_get(c)}"
end
```

File: `実行結果`

{% highlight bash linenos %}
FUGA = TEST_FUGA
{% endhighlight %}

#### 5. 参照可能な全ての定数

参照可能な全ての定数の一覧を確認するには以下のようにする。

``` ruby 
class Hoge
  HOGE = "TEST_HOGE"
end

class Fuga < Hoge
  FUGA = "TEST_FUGA"
end

Module.constants.sort.each do |c|
  puts "#{c} = #{Module.const_get(c)}"
end
```

この場合、`Hoge` クラス（`Module.constants` の外側で定義のクラス（またはモジュール））も定数となるが、`Hoge` クラス内で定義した定数 `HOGE` は参照不可能。

File: `実行結果`

{% highlight bash linenos %}
ARGF = ARGF
ARGV = []
ArgumentError = ArgumentError
Array = Array
BasicObject = BasicObject
Bignum = Bignum
Binding = Binding
CROSS_COMPILING =
Class = Class
Comparable = Comparable
Complex = Complex
get_constants_list.rb:38:in `const_get': Use RbConfig instead of obsolete and deprecated Config.
Config = RbConfig::Obsolete
Data = Data
Date = Date
Dir = Dir
ENV = ENV
EOFError = EOFError
Encoding = Encoding
EncodingError = EncodingError
Enumerable = Enumerable
Enumerator = Enumerator
Errno = Errno
Exception = Exception
FALSE = false
FalseClass = FalseClass
Fiber = Fiber
FiberError = FiberError
File = File
FileTest = FileTest
Fixnum = Fixnum
Float = Float
FloatDomainError = FloatDomainError
Fuga = Fuga
GC = GC
Gem = Gem
Hash = Hash
Hoge = Hoge
IO = IO
IOError = IOError
IndexError = IndexError
Integer = Integer
Interrupt = Interrupt
Kernel = Kernel
KeyError = KeyError
LoadError = LoadError
LocalJumpError = LocalJumpError
Marshal = Marshal
MatchData = MatchData
Math = Math
Method = Method
Module = Module
Mutex = Mutex
NIL =
NameError = NameError
NilClass = NilClass
NoMemoryError = NoMemoryError
NoMethodError = NoMethodError
NotImplementedError = NotImplementedError
Numeric = Numeric
Object = Object
ObjectSpace = ObjectSpace
Proc = Proc
Process = Process
RUBY_COPYRIGHT = ruby - Copyright (C) 1993-2013 Yukihiro Matsumoto
RUBY_DESCRIPTION = ruby 2.0.0p247 (2013-06-27 revision 41674) [x86_64-linux]
RUBY_ENGINE = ruby
RUBY_PATCHLEVEL = 247
RUBY_PLATFORM = x86_64-linux
RUBY_RELEASE_DATE = 2013-06-27
RUBY_REVISION = 41674
RUBY_VERSION = 2.0.0
Random = Random
Range = Range
RangeError = RangeError
Rational = Rational
RbConfig = RbConfig
Regexp = Regexp
RegexpError = RegexpError
RubyVM = RubyVM
RuntimeError = RuntimeError
STDERR = #<IO:0x007f81045b6148>
STDIN = #<IO:0x007f81045b6238>
STDOUT = #<IO:0x007f81045b61c0>
ScriptError = ScriptError
SecurityError = SecurityError
Signal = Signal
SignalException = SignalException
StandardError = StandardError
StopIteration = StopIteration
String = String
Struct = Struct
Symbol = Symbol
SyntaxError = SyntaxError
SystemCallError = SystemCallError
SystemExit = SystemExit
SystemStackError = SystemStackError
TOPLEVEL_BINDING = #<Binding:0x007f81045afc58>
TRUE = true
Thread = Thread
ThreadError = ThreadError
ThreadGroup = ThreadGroup
Time = Time
TracePoint = TracePoint
TrueClass = TrueClass
TypeError = TypeError
UnboundMethod = UnboundMethod
ZeroDivisionError = ZeroDivisionError
{% endhighlight %}

#### その他

- `Object.constants` とすると、トップレベルの組み込み定数とクラス（またはモジュール）名が返ってくる。  
  （上記 5 の `Module.constants` を `Object.constants` に置き換えた場合は、同じ結果になる）
- `const_get` で `Use RbConfig instead of obsolete and deprecated Config.` とメッセージが出力される部分（`Config` という定数）がある。  
  `Object.constants` では、このメッセージは出力されない。  
  （今は、Ruby インストール時の情報は `Config` より `RbConfig` で取得するようだが、`Module.const_get` と `Object.const_get` の振る舞いの違い等も含めて不勉強で疎いので、詳細は不明）

#### 参考サイト

- [instance method Module#constants](http://doc.ruby-lang.org/ja/2.0.0/method/Module/i/constants.html "instance method Module#constants")
- [singleton method Module.constants](http://doc.ruby-lang.org/ja/2.0.0/method/Module/s/constants.html "singleton method Module.constants")

---

ちょっとした記録のつもりでしたが、調べてみると意外と奥が深かったです。

以上。

