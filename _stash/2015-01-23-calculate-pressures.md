---
layout   : single
title    : "海面校正気圧等の計算！"
published: true
date     : 2015-01-23 00:20:00 +0900
comments : true
categories:
- その他
- プログラミング
tags:
- Ruby
---
こんにちは。

天気図に表示される等圧線は標高 0m での気圧に校正した値を使用してます。当然、標高により気圧が変化するからです。  
（「海面校正」は「海面更正」と表現することもあるが、気象庁は「海面校正」を使用）

以下は、その計算式と計算するための簡単な Ruby スクリプトです。  
（「海面校正気圧」の他に、「標高から気圧」、「気圧から標高」、」目的地の気温」の計算式・Ruby スクリプトも掲載）

<!--more-->

### 1. 各種計算式

数式が多いので、$$\LaTeX$$で作成した文書のハードコピーを掲載。

![CALC_PRES_ETC]({{site.baseurl}}/images/2015/01/23/CALC_PRES_ETC.png "CALC_PRES_ETC")

### 2. Ruby スクリプト

File: `calc_pressure.rb`

{% highlight ruby linenos %}
#! /usr/local/bin/ruby
# coding: utf-8
#*********************************************
# Ruby script to calculate values about pressure.
#*********************************************
#
class CalcPressure
  # Constants
  C_1 = 0.0065
  C_2 = 273.15
  C_3 = 5.257

  # Calculate a sealevel pressure.
  def calc_sealevel(p, t, h)
    v   = 1 - (C_1 * h) / (t + C_1 * h + C_2)
    v **= C_3
    return p / v
  end

  # Calculate a pressure from a height above sea level.
  def calc_h2p(p, t, h)
    v   = 1 - (C_1 * h) / (t + C_1 * h + C_2)
    v **= C_3
    return p * v
  end

  # Calculate a height above sea level from a pressure.
  def calc_p2h(p_0, p, t)
    v  = (p_0 / p.to_f) ** (1 / C_3) - 1
    v *= t + C_2
    return v / C_1
  end

  # Calculate a temperature at the destination.
  def calc_temp_dest(t_a, h_a, h)
    return t_a - C_1 * (h - h_a)
  end
end

if __FILE__ == $0
  obj = CalcPressure.new

  # Calculate a sealevel pressure.
  p, t, h = 850, 15, 1729
  p_0 = obj.calc_sealevel(p, t, h)
  puts "P = #{p}, T = #{t}, h = #{h}"
  puts "P_0 = #{p_0}"
  puts "---"

  # Calculate a pressure from a height above sea level.
  p_0, t, h = 1015.25, 5, 1729
  p = obj.calc_h2p(p_0, t, h)
  puts "P_0 = #{p_0}, T = #{t}, h = #{h}"
  puts "P = #{p}"
  puts "---"

  # Calculate a height above sea level from a pressure.
  p_0, p, t = 1005.75, 900, 15
  h = obj.calc_p2h(p_0, p, t)
  puts "P_0 = #{p_0}, p = #{p}, T = #{t}"
  puts "h = #{h}"
  puts "---"

  # Calculate a temperature at the destination.
  t_a, h_a, h = 15, 1729, 0
  t = obj.calc_temp_dest(t_a, h_a, h)
  puts "T_a = #{t_a}, h_a = #{h_a}, h = #{h}"
  puts "T = #{t}"
end
{% endhighlight %}

* [Gist - Ruby script to calculate values about pressure.](https://gist.github.com/komasaru/d77a4d42ae10d15e4c9f "Gist - Ruby script to calculate values about pressure.")

### 3. Ruby スクリプト実行

``` text
$ ./calc_pressure
P = 850, T = 15, h = 1729
P_0 = 1039.3739217322998
---
P_0 = 1015.25, T = 5, h = 1729
P = 824.4057447728877
---
P_0 = 1005.75, p = 900, T = 15
h = 946.7930161358183
---
T_a = 15, h_a = 1729, h = 0
T = 26.238500000000002
```

---

簡単な計算式・スクリプトですが、何かときに役に立つでしょう。

ちなみに、例の標高 1,729m は中国地方の最高峰大山（剣ヶ峰）の標高です。  
標高 0m 地点の気圧が 1015.25hPa で気温が 5℃ の場合、大山頂上の気圧は 824hPa になるようです。気圧だけで見ると、いわゆるスーパー台風よりもはるかに低いです。

以上。

