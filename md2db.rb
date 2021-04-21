#! /usr/local/bin/ruby
#=  Jekyll Markdown -> MySQL INSERT
# ：Jekyll の Markdown ファイルを読み込み、
#   MySQL へ INSERT する。
#
# date          name            version
# 2019.01.21    mk-mode.com     1.00 新規作成（op_md2mysql.rb を流用）
#
# Copyright(C) 2019 mk-mode.com All Rights Reserved.
#---------------------------------------------------------------------------------
#++
require 'mysql2'
require 'yaml'

class Md2Db
  # CONSTANT
  DIR_MD = "_posts/**/*"  # <- 再帰的に取得
  DATABASE = "mkmode"        # DB NAME
  #HOSTNAME = "127.0.0.1"    # DB HOST (for TEST)
  HOSTNAME = "192.168.11.2"  # DB HOST
  USERNAME = "masaru"        # DB USER
  PASSWORD = "MkMk*/6835"      # DB PASSWORD

  def initialize
    @mds  = []
    @data = []
  end

  # Markdown ファイルリスト取得
  def get_md_list
    Dir.glob(DIR_MD).each do |md|
      @mds << md unless File::ftype(md) == "directory"
    end
    @mds.sort!
  rescue => e
    $stderr.puts "[ERROR][#{self.class.name}.#{__method__}] #{e}"
    exit 1
  end

  # Markdown ファイル読み込み
  def read_md
    ary = []

    begin
      @mds.each do |md|
        puts "Read : #{md}"
        # ファイル名から投稿タイトル(英語)取得 (URL に使用)
        post_title_e = File.basename(md).sub(/^(\d{4})-(\d{2})-(\d{2})-(.*?)\.(.*?)$/, '\4')
        # YAML 取得
        data = YAML::load(File.open(md))
        published    = data["published"]           # Published (true:公開, false:下書き)
        post_date    = data["date"].to_s           # 投稿日時
        post_title_j = data["title"]               # 投稿タイトル(日本語)
        if data["categories"].instance_of?(Array)  # カテゴリ
          post_categories = data["categories"].join(",")
        else
          post_categories = data["categories"]
        end
        if data["tags"].instance_of?(Array)        # タグ
          post_tags = data["tags"].join(",")
        else
          post_tags = data["tags"]
        end
        # 配列へ格納
        ary << [post_date, post_title_e, post_title_j, post_categories, post_tags] if published
      end
      @data = ary.sort
    rescue => e
      $stderr.puts "[ERROR][#{self.class.name}.#{__method__}] #{e}"
      exit 1
    end
  end

  # DB INSERT
  def insert
    begin
      puts "Insert to #{DATABASE}.blog_lists. [HOST:#{HOSTNAME}]"
      # MySQL 接続
      my = Mysql2::Client.new(
        database: DATABASE,
        host:     HOSTNAME,
        username: USERNAME,
        password: PASSWORD
      )
      # Truncate
      sql = "TRUNCATE TABLE blog_lists "
      my.query(sql)
      # SQL
      sql_base = <<-EOS
        INSERT INTO blog_lists (
          post_date,
          post_title_e,
          post_title_j,
          post_categories,
          post_tags
        ) VALUES
      EOS
      ary_sql = Array.new
      @data.map do |row|
        <<-EOS
          (
            '#{row[0]}', '#{row[1]}', '#{my.escape(row[2])}',
            '#{row[3]}', '#{row[4]}'
          )
        EOS
      end.each_slice(100) do |v|
        my.query(sql_base + v.join(", "))
      end
    rescue => e
      $stderr.puts "[ERROR][#{self.class.name}.#{__method__}] #{e}"
      exit 1
    end
  end
end

if __FILE__ == $0
  puts "#### Octopress Markdown -> MySQL [ START ]"
  o = Md2Db.new  # インスタンス化
  o.get_md_list  # Markdown ファイルリスト取得
  o.read_md      # Markdown ファイル読み込み
  o.insert       # DB INSERT
  puts "#### Octopress Markdown -> MySQL [ E N D ]"
end

