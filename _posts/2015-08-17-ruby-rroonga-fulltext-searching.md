---
layout   : single
title    : "Ruby - Rroonga で全文検索！"
published: true
date     : 2015-08-17 00:20:00 +0900
comments : true
categories:
- プログラミング
tags:
- Ruby
- Groonga
- Rroonga
---

Ruby でカラムストア機能付き全文検索エンジン Groonga の機能を容易に使用できる Rroonga を使用してみました。

<!--more-->

### 0. 前提条件

* Linux Mint 17.2(64bit) での作業を想定。
* Ruby 2.2.2-p95 での作業を想定。
* カラムストア機能付き全文検索エンジン Groonga がインストール済みであること。

### 1. Rroonga のインストール

以下のようにしてインストールする。  
（ちなみ、 Groonga 未インストールなら、ここでインストールされるはず。（当方 Groonga インストール済みなので、未確認））

``` text
$ sudo gem install rroonga
```

### 2. データベースの作成

簡単な都道府県名データベースを作成してみる。

取り急ぎ対話形式で作業を行いたいので、 pry(or irb) に入る。（プロンプトを簡易表示。 `groonga` を `require` して）

``` text
$ pry --simple-prompt -r groonga
```

まず、エンコーディングの設定を行う。（今回は Linux なので UTF-8 に設定）

``` text
>> Groonga::Context.default_options = {:encoding => :utf8}
=> {:encoding=>:utf8}
```

そして、データベースを作成する。（データベースファイル名を指定）

``` text
>> Groonga::Database.create(:path => "/path/to/prefs.db")
=> #<Groonga::Database id: <nil>, name: (anonymous), path: </path/to/prefs.db>, domain: (nil), range: (nil), flags: <>>
```

### 3. テーブルの作成

都道府県名テーブルを作成してみる。（テーブル名、テーブルタイプを指定）  
（テーブルタイプには `hash`, `patricia_trie`, `double_array_trie`, `array` が指定可能）

``` text
>> Groonga::Schema.create_table("Prefs", :type => :hash) do |tbl|
 |   tbl.text("pref_name")
 | end
=> [#<Groonga::Schema::TableDefinition:0x007f9fe62cef60
  @definitions=
   [#<Groonga::Schema::ColumnDefinition:0x007f9fe62ce1f0
     @name="pref_name",
     @options={:persistent=>true, :named_path=>nil},
     @type="Text">],
  @name="Prefs",
  @options=
   {:context=>
     #<Groonga::Context encoding: <:utf8>, database: <#<Groonga::Database id: <nil>, name: (anonymous), path: </path/to/prefs.db>, domain: (nil), range: (nil), flags: <>>>>,
    :type=>:hash},
  @table_type=Groonga::Hash>]
```

テーブルが作成されたか確認してみる。

``` text
>> prefs = Groonga["Prefs"]
=> #<Groonga::Hash id: <256>, name: <Prefs>, path: </path/to/prefs.db.0000100>, domain: <ShortText>, range: (nil), flags: <>, size: <0>, encoding: <:utf8>, default_tokenizer: (nil), token_filters: [], normalizer: (nil)>
>> prefs.size
=> 0
```

### 4. レコードの追加

以下のようにして、テーブルにレコードを追加していく。（47都道府県分。別途作成しておいた配列をループさせて登録するのがよいだろう）

``` text
>> prefs.add("Hokkaido", :pref_name => "北海道")
=> #<Groonga::Record:0x007f9fe69e4480 ..., attributes: {"_id"=>1, "_key"=>"Hokkaido", "pref_name"=>"北海道"}>
```

以下のような方法で追加することも可能。

``` text
>> prefs.add("Aomoriken")
=> #<Groonga::Record:0x007f9fe6755020 ..., attributes: {"_id"=>3, "_key"=>"Aomoriken", "pref_name"=>nil}>
>> prefs["Aomoriken"].pref_name = "青森県"
=> "青森県"
```

ちなみに、削除するには以下のようにする。

``` text
>> prefs.delete("Aomoriken")
=> nil
```

### 5. レコードの参照

登録したレコードを参照してみる。

``` text
>> prefs["Shimaneken"]
=> #<Groonga::Record:0x007f9fe671a1f0 ..., attributes: {"_id"=>32, "_key"=>"Shimaneken", "pref_name"=>"島根県"}>

>> prefs["Shimaneken"].id
=> 32

>> prefs["Shimaneken"].key
=> "Shimaneken"

>> prefs["Shimaneken"].pref_name
=> "島根県"

>> prefs.size
=> 47
```

### 6. 全文検索用語彙テーブルの作成

全文検索用語彙テーブルを作成する。（以下は、テーブルタイプを PatriciaTrie に、ノーマライザを大文字小文字の区別をしない NormalizerAuto に、デフォルトトークナイザを N-gram の一種バイグラムに設定する例）

``` text
>> Groonga::Schema.create_table("Terms",
 |   :type => :patricia_trie,
 |   :normalizer => :NormalizerAuto,
 | :default_tokenizer => "TokenBigram")
=> [#<Groonga::Schema::TableDefinition:0x007f9fe6bb9cb0
  @definitions=[],
  @name="Terms",
  @options=
   {:context=>
     #<Groonga::Context encoding: <:utf8>, database: <#<Groonga::Database id: <nil>, name: (anonymous), path: </path/to/prefs.db>, domain: (nil), range: (nil), flags: <>>>>,
    :type=>:patricia_trie,
    :normalizer=>:NormalizerAuto,
    :default_tokenizer=>"TokenBigram"},
  @table_type=Groonga::PatriciaTrie>]
```

### 7. 全文検索用語彙テーブルのインデックス定義

今回は都道府県名ローマ字で検索してみることにする。

``` text
>> Groonga::Schema.change_table("Terms") do |tbl|
 |   tbl.index("Prefs.pref_name")
 | end
=> [#<Groonga::Schema::TableDefinition:0x007f9fe6a823d8
  @definitions=
   [#<Groonga::Schema::IndexColumnDefinition:0x007f9fe6a81d48
     @name=nil,
     @options={:persistent=>true, :named_path=>nil},
     @target_columns=["pref_name"],
     @target_table="Prefs">],
  @name="Terms",
  @options=
   {:context=>
     #<Groonga::Context encoding: <:utf8>, database: <#<Groonga::Database id: <nil>, name: (anonymous), path: </path/to/prefs.db>, domain: (nil), range: (nil), flags: <>>>>,
    :change=>true},
  @table_type=Groonga::Array>]
```

### 8. 検索の確認

``` text
>> prefs_shimane = prefs.select { |rec| rec.pref_name =~ "島根県" }    => #<Groonga::Hash id: <2147483655>, name: (anonymous), path: (temporary), domain: <Prefs>, range: (nil), flags: <WITH_SUBREC>, size: <1>, encoding: <:utf8>, default_tokenizer: (nil), token_filters: [], normalizer: (nil)>

>> prefs_shimane.size
=> 1

>> prefs_shimane.collect { |rec| rec.key.key }
=> ["Shimaneken"]

>> prefs_shimane.collect { |rec| rec["_key"] }
=> ["Shimaneken"]
```

### 9. 参考サイト

* [Groonga - カラムストア機能付き全文検索エンジン](http://groonga.org/ja/ "Groonga - カラムストア機能付き全文検索エンジン")
* [RubyでGroonga使って全文検索 - ラングバ](http://ranguba.org/ja/ "RubyでGroonga使って全文検索 - ラングバ")

---

その他の詳細な使用方法は実際に Ruby コーディングしながら覚えることになるでしょう。

以上。

