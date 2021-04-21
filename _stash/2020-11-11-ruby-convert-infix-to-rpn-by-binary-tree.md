---
layout   : single
title: "Ruby - 数式文字列 => 逆ポーランド記法 変換＆計算（二分木使用）！"
published: true
date     : 2020-11-11 00:20:00 +0900
comments : true
categories:
- プログラミング
- 数学
tags:
- Ruby
---

Ruby で、入力した数式の文字列を逆ポーランド記法（RPN; 後置記法）に変換する処理を実装してみました。（ついでに、後置・中置・前置記法での計算も）  
前回・前々回はスタックを使用した処理についてでした。

* [Ruby - 数式文字列 => 逆ポーランド記法 変換（スタック使用）！]({{site.baseurl}}/2020/10/28/ruby-convert-infix-to-rpn-with-stack "Ruby - 数式文字列 => 逆ポーランド記法 変換（スタック使用）！")
* [Ruby - 逆ポーランド記法の評価（計算）！]({{site.baseurl}}/2020/11/04/ruby-calc-with-rpn-stack "Ruby - 逆ポーランド記法の評価（計算）！")

今回は二分木を使用した処理についてです。

<!--more-->

### 0. 前提条件

* Debian GNU/Linux 10.5 buster (64bit) での作業を想定。
* Ruby 2.7.2 での作業を想定。
* 演算子は `*`, `/`, `+`, `-` を想定。（単項演算子は非対応）
* 括弧は `(`, `)` のみに対応。

### 1. アルゴリズム

次のリンク先（分かりやすく、きれいにまとまっている）のとおり。（自分で説明しようとすると、煩雑化しそう）

* [二分木を使った数式の逆ポーランド記法化と計算 - Programming/Tips - 総武ソフトウェア推進所](https://smdn.jp/programming/tips/polish/ "二分木を使った数式の逆ポーランド記法化と計算 - Programming/Tips - 総武ソフトウェア推進所")

### 2. Ruby スクリプトの作成

* 括弧の開きと閉じの対応のチェックも行なう。
* Shebang ストリング（1行目）では、フルパスでコマンド指定している。（[当方の慣習]({{site.baseurl}}/2015/04/30/ruby-script-running-by-shebang/ "Ruby - Shebang ストリングによるスクリプト実行！")）

File: `infix2rpn_bt.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
#*********************************************************
# Ruby script to convert string to RPN (by binary tree).
# (Unary operators are not supported)
#*********************************************************

class Node
  attr_reader :expr

  def initialize(expr)
    # ノードを構成するデータ構造
    @expr  = expr  # このノードが表す式
    @left  = nil   # 左の子ノード
    @right = nil   # 右の子ノード
  end

  # 丸カッコ対応数チェック
  #
  # @return bool res: true(OK)|false(NG)
  def valid_bracket
    res = true
    nest = 0  # 丸カッコのネスト数

    begin
      @expr.split(//).each do |e|
        nest += 1 if e == "("
        if e == ")"
          nest -= 1
          break if nest < 0
        end
      end
      res = false unless nest == 0
      return res
    rescue => e
      raise
    end
  end

  # 解析（二分木に分割）
  def parse
    # 数式の最も外側のカッコを除去
    @expr = rm_most_outer_bracket(@expr)
    # 演算子の位置
    pos_operator = get_operator_pos(@expr)
    # 演算子が存在しない場合、項とみなす
    return if pos_operator < 0
    # 子ノード（左）
    @left = Node.new(rm_most_outer_bracket(@expr[0, pos_operator]))
    @left.parse
    # 子ノード（右）
    @right = Node.new(rm_most_outer_bracket(@expr[pos_operator + 1, @expr.size]))
    @right.parse
    # 演算子
    @expr = @expr[pos_operator]
  rescue => e
    raise
  end

  # 文字列生成（後置記法（逆ポーランド記法; RPN））
  def gen_post
    @left .gen_post if @left
    @right.gen_post if @right
    print "#{@expr} "
  rescue => e
    raise
  end

  # 文字列生成（中置記法（挿入記法））
  def gen_in
    print '(' if @left && @right
    @left .gen_in if @left
    print @expr
    @right.gen_in if @right
    print ')' if @left && @right
  rescue => e
    raise
  end

  # 文字列生成（前置記法（ポーランド記法））
  def gen_pre
    print "#{@expr} "
    @left .gen_pre if @left
    @right.gen_pre if @right
  rescue => e
    raise
  end

  # 値の計算
  #
  # @return float res: 計算結果
  def calc
    return @expr.to_f unless @left && @right
    res = 0

    begin
      operand_l = @left.calc
      operand_r = @right.calc
      case @expr
      when '+'; res = operand_l + operand_r
      when '-'; res = operand_l - operand_r
      when '*'; res = operand_l * operand_r
      when '/'; res = operand_l / operand_r
      end
      return res
    rescue => e
      raise
    end
  end

private
  # 数式の最も外側のカッコを除去
  #
  # @param  string expr: 数式文字列（カッコ除去前）
  # @return string expr: 数式文字列（カッコ除去後）
  def rm_most_outer_bracket(expr)
    res  = false  # true: 数式の最も外側にカッコあり, false: なし
    nest = 0      # カッコのネスト数

    begin
      # 最初の文字が "(" の場合、最も外側にカッコがあると仮定
      if expr[0] == "("
        res  = true
        nest = 1
      end
      # 2文字目以降、チェック
      expr[1..].split(//).each_with_index do |e, i|
        case e
        when "("
          nest += 1
        when ")"
          nest -= 1
          # 最後以外でカッコが全て閉じられた場合、最も外側にカッコはないと判断
          # 例:"(1+2)+(3+4)"などの場合
          if nest == 0 && i < expr.size - 2
            res = false
            break
          end
        end
      end
      # 最も外側にカッコがない場合、元の文字列をそのまま返す
      return expr unless res
      # カッコ内がからの場合、エラー
      puts "[ERROR] Empty bracket! #{expr}" if expr =~ /^\(\)$/
      # 最も外側のカッコを除去
      expr = expr[1..-2]
      # 更に最も外側にカッコが残っている場合、再帰的に処理
      expr = rm_most_outer_bracket(expr) if expr =~ /^\(.*?\)$/
      return expr
    rescue => e
      raise
    end
  end

  # 演算子の位置を取得
  #
  # @param string expr: 数式文字列
  # @return    int pos: 演算子の位置
  #                     （演算子が存在しない場合は -1 を返す）
  def get_operator_pos(expr)
    return -1 if expr.to_s.empty?
    pos     = -1  # 演算子の位置初期化
    nest    = 0   # カッコのネスト数
    pri_min = 4   # 演算子のこれまでで最も低い優先度
                  # （値が大きいほど優先度高）

    begin
      expr.split(//).each_with_index do |e, i|
        pri = 0  # 演算子の優先度
        case e
        when "="; pri = 1
        when "+"; pri = 2
        when "-"; pri = 2
        when "*"; pri = 3
        when "/"; pri = 3
        when "("; nest += 1; next
        when ")"; nest -= 1; next
        else; next
        end
        if nest == 0 && pri <= pri_min
          pri_min = pri
          pos = i
        end
      end
      return pos
    rescue => e
      raise
    end
  end
end

class Str2RpnBt
  def exec
    # 数式入力＆空白除去
    print 'Formula? '
    f = gets.chomp.gsub(/ /, "")
    # Node クラスのインスタンス化
    root = Node.new(f)
    # 丸カッコ対応数チェック
    unless root.valid_bracket
      puts "[ERROR] Brackets are unbalanced!"
      exit
    end
    # 解析（二分木分割）
    puts "---"
    puts "                Formula: #{root.expr}"
    root.parse
    # 文字列生成（後置記法（逆ポーランド記法; RPN））
    print "Reverse Polish Notation: "
    root.gen_post
    puts
    # 文字列生成（中置記法（挿入記法））
    print "         Infix Notation: "
    root.gen_in
    puts
    # 文字列生成（前置記法（ポーランド記法））
    print "        Polish Notation: "
    root.gen_pre
    puts
    # 値の計算
    print "                Answer = "
    print root.calc
    puts
  rescue => e
    $stderr.puts "[#{e.class}] #{e.message}"
    e.backtrace.each{ |tr| $stderr.puts "\t#{tr}" }
    exit 1
  end
end

Str2RpnBt.new.exec if __FILE__ == $0
{% endhighlight %}

* [Gist - Ruby script to convert a formula string to a RPN with a binary tree.](https://gist.github.com/komasaru/79a98c252629a6a74c99769d511898ef "Gist - Ruby script to convert a formula string to a RPN with a binary tree.")

### 3. 動作確認

まず、実行権限を付与。

``` text
$ chmod +x infix2rpn_bt.rb
```

そして、実行。  
元の数式（中置記法）を入力してエンターを押下すると、逆ポーランド記法(RPN)・中置記法・前置記法、そして、計算結果が出力される。

``` text
$ ./infix2rpn_bt.rb
Formula? 2 * (3 + (12 - 8)) / 7
---
                Formula: 2*(3+(12-8))/7
Reverse Polish Notation: 2 3 12 8 - + * 7 /
         Infix Notation: ((2*(3+(12-8)))/7)
        Polish Notation: / * 2 + 3 - 12 8 7
                Answer = 2.0
```

---

以上。

