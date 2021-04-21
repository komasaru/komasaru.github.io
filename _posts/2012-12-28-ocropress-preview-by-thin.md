---
layout   : single
title    : "Octopress - Preview 時の Web サーバを thin に変更！"
published: true
date     : 2012-12-28 00:20:00 +0900
comments : true
categories:
- ブログ
tags:
- Octopress
- Ruby
- thin
---

Octopress の `preview` 時に起動する Web サーバ WEBrick をより速度が速いと言われている(?) thin に変更する方法についての記録です。

<!--more-->

### 0. 前提条件

- 作業する環境(OS)は、Linux Mint 13 Maya (64bit)
- Ruby 1.9.3-p194
- Octopress 2.0

### 1. Gemfile 編集

`Gemfile` の `group :development do` 内に以下を追加する。

File: `Gemfile`

{% highlight ruby linenos %} 
gem "thin", "~> 1.5.0"
{% endhighlight %}

### 2. thin パッケージインストール

RubyGems パッケージの thin をインストールする。

``` bash 
$ bundle install
```

### 3. Rakefile 編集

今までどおり `rake preview` で thin が起動するように、`Rakefile` の `task :preview do` 部分を以下のように編集する。  
（念の為、変更前の状態をコメントアウトして残している）

File: `Gemfile`

{% highlight diff linenos %} 
diff --git a/Rakefile b/Rakefile
index fd7e611..0e566a2 100644
--- a/Rakefile
+++ b/Rakefile
@@ -79,18 +79,22 @@ end
 desc "preview the site in a web browser"
 task :preview do
   raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
-  puts "Starting to watch source with Jekyll and Compass. Starting Rack on port #{server_port}"
+  #puts "Starting to watch source with Jekyll and Compass. Starting Rack on port #{server_port}"
+  puts "Starting to watch source with Jekyll and Compass. Starting Thin on port #{server_port}"
   system "compass compile --css-dir #{source_dir}/stylesheets" unless File.exist?("#{source_dir}/stylesheets/screen.css")
   jekyllPid = Process.spawn({"OCTOPRESS_ENV"=>"preview"}, "jekyll --auto")
   compassPid = Process.spawn("compass watch")
-  rackupPid = Process.spawn("rackup --port #{server_port}")
+  #rackupPid = Process.spawn("rackup --port #{server_port}")
+  thinPid = Process.spawn("thin start --port #{server_port}")
 
   trap("INT") {
-    [jekyllPid, compassPid, rackupPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
+    #[jekyllPid, compassPid, rackupPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
+    [jekyllPid, compassPid, thinPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
     exit 0
   }
 
-  [jekyllPid, compassPid, rackupPid].each { |pid| Process.wait(pid) }
+  #[jekyllPid, compassPid, rackupPid].each { |pid| Process.wait(pid) }
+  [jekyllPid, compassPid, thinPid].each { |pid| Process.wait(pid) }
 end
 
 # usage rake new_post[my-new-post] or rake new_post['my new post'] or rake new_post (defaults to "new-post")
~
{% endhighlight %}

### 4. preview 起動

今までどおり、`preview` を起動してみる。

``` bash 
$ rake preview
Starting to watch source with Jekyll and Compass. Starting Thin on port 4000
>> Using rack adapter
Configuration from /home/masaru/octopress/_config.yml
/home/masaru/.rbenv/versions/1.9.3-p194/lib/ruby/gems/1.9.1/gems/blankslate-3.1.2/lib/blankslate.rb:51: warning: undefining `object_id' may cause serious problems
>> Thin web server (v1.5.0 codename Knife)
>> Maximum connections set to 1024
>> Listening on 0.0.0.0:4000, CTRL+C to stop

Dear developers making use of FSSM in your projects,
FSSM is essentially dead at this point. Further development will
be taking place in the new shared guard/listen project. Please
let us know if you need help transitioning! ^_^b
- Travis Tilley

>>> Compass is polling for changes. Press Ctrl-C to Stop.
Auto-regenerating enabled: source -> public/octopress
[2012-12-08 18:48:40] regeneration: 6817 files changed
```

thin で起動していることが分かる。

### 参考サイト

- [OctopressのRake Previewにthinを利用してプレビューを高速化する - Glide Note - グライドノート](http://blog.glidenote.com/blog/2012/10/31/thin-octopress/ "OctopressのRake Previewにthinを利用してプレビューを高速化する - Glide Note - グライドノート")
- [thin | RubyGems.org | your community gem host](https://rubygems.org/gems/thin "thin | RubyGems.org | your community gem host")

---

実際に、速度を測定してはいないのですが、若干早くなったようには感じます。

以上。

