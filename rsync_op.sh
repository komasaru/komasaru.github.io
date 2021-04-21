#!/bin/bash

# Rsync to octopress (GitHub Pages)
rsync -av --delete _posts/ ../octopress_gh/source/_posts/
rsync -av          images/ ../octopress_gh/source/images/

cd ../octopress_gh/source

# Layout: single => post
find _posts -name "*.md" | xargs sed -i -e 's/^layout *: *single/layout   : post/'

# 記事間リンク {{site.baseurl}} を削除
#find _posts -name "*.md" | xargs sed -i -e 's/\]({{site.baseurl}}\/\([0-9]\{4\}\)\//](\/\1\//g'
find _posts -name "*.md" | xargs sed -i -e 's/\]({{site.baseurl}}\/\([0-9]\{4\}\)\//](\/blog\/\1\//g'

# 画像リンク {{site.baseurl}} を削除
find _posts -name "*.md" | xargs sed -i -e 's/\]({{site.baseurl}}\/images\//](\/images\//g'

# 複数行のシンタックス／ハイライト File: `file_name` 〜 {% highlight lang linenos %} 〜 {% endhighlight %} を ``` lang file_name 〜 ``` に変更
find _posts -name "*.md" | xargs sed -i -e ':lbl1;N;s/File: *`\([^ \n]\+\)`\n\n{% *highlight \+\([^ \n]\+\) \+linenos *%}\n\(.\+\)\n{% *endhighlight *%}/``` \2 \1\n\3\n```/;b lbl1;'

# 複数行のシンタックス／ハイライト File: `file_name` 〜 {% highlight lang %} 〜 {% endhighlight %} を ``` lang file_name 〜 ``` に変更
find _posts -name "*.md" | xargs sed -i -e ':lbl1;N;s/File: *`\([^ \n]\+\)`\n\n{% *highlight \+\([^ \n]\+\) *%}\n\(.\+\)\n{% *endhighlight *%}/``` \2 \1\n\3\n```/;b lbl1;'

# 複数行のシンタックス／ハイライト File: `file_name` 〜 ``` lang 〜 ``` を ``` lang file_name 〜 ``` に変更
find _posts -name "*.md" | xargs sed -i -e ':lbl1;N;s/File: *`\([^ \n]\+\)`\n\n``` \+\([^ \n]\+\) *\n\(.\+\)\n```/``` \2 \1\n\3\n```/;b lbl1;'

# 複数行のシンタックス／ハイライト {% highlight lang %} 〜 {% endhighlight %} を ``` lang 〜 ``` に変更
find _posts -name "*.md" | xargs sed -i -e ':lbl1;N;s/{% *highlight \+\([^ \n]\+\) *%}\n\(.\+\)\n{% *endhighlight *%}/``` \1\n\2\n```/;b lbl1;'

# エスケープしていたコードブロック内の {{ "[" }} 〜 {{ "]" }} を [ 〜 ] に変更
find _posts -name "*.md" | xargs sed -i -e 's/{{ "\[" }}\(.\+\?\){{ "\]" }}/[\1]/g'

# 1行の MathJax $$ 〜 $$ を {% m %} 〜 {% em %} に変更
find _posts -name "*.md" | xargs sed -i -e 's/\$\$ *\([^$]\+\?\) *\$\$/{% m %} \1 {% em %}/g'

# 複数行の MathJax $$ 〜 $$ を {% math %} 〜 {% endmath %} に変更
find _posts -name "*.md" | xargs sed -i -e ':lbl1;N;s/\$\$\n\(.\+\?\)\n\$\$/{% math %}\n\1\n{% endmath %}/;b lbl1;'

# table の明細とフッタの区切りを削除
find _posts -name "*.md" | xargs sed -i -e '/^[=|]\+$/d'

