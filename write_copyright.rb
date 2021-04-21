#! /usr/local/bin/ruby
# coding: utf-8
require 'rmagick'

class RmagickWatermark
  TEXT = "©#{Time.now.year} mk-mode.com"  # 描画文字

  def initialize
    exit unless check_arg
    @img      = Magick::Image.read(@file_in).first          # 元の画像オブジェクト
    @img_wm   = Magick::Image.new(@img.columns, @img.rows)  # ウォーターマークの画像オブジェクト
    @gc_wm    = Magick::Draw.new                            # ウォーターマーク画像の描画オブジェクト
    @file_out = @file_in.sub(/(.+)\.(.+?)$/, "#{'\1'}-wm.#{'\2'}")  # 保存ファイル名
  end

  def write_wm
    # 元画像と同じサイズの画像オブジェクトに文字を描画
    @gc_wm.annotate(@img_wm, 0, 0, 10, 0, TEXT) do
      self.gravity     = Magick::SouthEastGravity
      self.pointsize   = 32
      self.font_family = "Courier"
      self.font_weight = Magick::BoldWeight
      self.stroke      = "none"
    end
    # 影描画（光源315度）
    @img_wm = @img_wm.shade(true, 315)
    # 画像の重ね合わせ
    @img.composite!(@img_wm, Magick::CenterGravity, Magick::HardLightCompositeOp)
    # 画像の保存
    @img.write(@file_out)
    puts "Wrote #{@file_out}!"
  rescue => e
    msg = "[#{e.class}] #{e.message}\n"
    msg << e.backtrace.map { |tr| "\t#{tr}"}.join("\n")
    $stderr.puts msg
    exit 1
  end

  private

  def check_arg
    ret = true

    begin
      unless ARGV[0]
        puts "Usage: ./rmagick_watermark.rb /path/to/target_image"
        ret = false
      end
      @file_in = ARGV[0]
      return ret
    rescue => e
      raise
    end
  end
end

exit unless __FILE__ == $0
RmagickWatermark.new.write_wm

