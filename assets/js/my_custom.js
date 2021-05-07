// ページロード時
(function ($) {
    $(function(){
        // キャッシュ無効化
        $.ajaxSetup({
            cache: false
        });

        // アクセスカウンター処理
        var referer = document.referrer;
        jQuery.ajax({
            type: 'GET',
            url: 'https://www.mk-mode.com/rails/json_blog?callback=?',
            dataType: 'json',
            data: {http_referer: referer},
            success: function(d){
                $("#uptime"      ).html(d.uptime);
                $("#pv-total"    ).text(insertComma(d.pv_total    ));
                $("#pv-today"    ).text(insertComma(d.pv_today    ));
                $("#pv-yesterday").text(insertComma(d.pv_yesterday));
            },
            error: function(d, s, t) {
                $("#uptime"      ).text('--d--h--m');
                $("#pv-total"    ).text('---');
                $("#pv-today"    ).text('---');
                $("#pv-yesterday").text('---');
            }
        });

        // Scroll Top Buton
        var topBtn = $('#page-top');
        topBtn.hide();
        // スクロールが100に達したらボタン表示
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                topBtn.fadeIn();
            } else {
                topBtn.fadeOut();
            }
        });
        // スクロールしてトップ
        topBtn.click(function () {
        $('body,html').animate({
            scrollTop: 0
            }, 500);
            return false;
        });

        // 外部リンクを別窓で開く
        $("a[href^='http']:not([href*='" + location.hostname + "'])").attr('target', '_blank');

        //// １年以上前の記事ならメッセージを表示
        $('article.page header time').each(function(){
            // 現在日付
            var today = new Date();
            var intToday = today.getFullYear() * 10000
                         + (today.getMonth() + 1) * 100
                         + today.getDate();
            // 該当記事の日付を取得
            var target = new Date($(this).attr('datetime'));
            var intTarget = target.getFullYear() * 10000
                          + (target.getMonth() + 1) * 100
                          + target.getDate();
            // 経過年数（年齢）計算
            var age = Math.floor((intToday - intTarget) / 10000);
            // メッセージ出力
            if (age >= 1) {
                $("section.page__content").before('<div style="color: #F06060; font-size: 80%;">※この記事は' + age + '年以上前に投稿されたもので、情報が古い可能性があります。</div><br />');
            }
        });
    });
})(jQuery);

$(window).on('load', function(){
    // Google Adsense (mk-mode BLOG Body-1)
    var str = new String();
    //str += '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    //str += '<ins class="adsbygoogle"';
    ////str += '     style="display:inline-block;min-width:400px;max-width:970px;width:100%;height:16px"';
    //str += '     style="display:inline-block;min-width:320px;max-width:970px;width:100%;height:16px"';
    //str += '     data-ad-client="ca-pub-7320193476057758"';
    //str += '     data-ad-slot="6380715028"';
    //str += '     data-ad-format="link"></ins>';
    //str += '<script>';
    //str += '(adsbygoogle = window.adsbygoogle || []).push({});';
    //str += '</script>';
    str += '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    str += '<!-- mk-mode BLOG Body-1 -->';
    str += '<ins class="adsbygoogle"';
    str += '     style="display:block"';
    str += '     data-ad-client="ca-pub-7320193476057758"';
    str += '     data-ad-slot="6380715028"';
    str += '     data-ad-format="auto"';
    str += '     data-full-width-responsive="true"></ins>';
    str += '<script>';
    str += '     (adsbygoogle = window.adsbygoogle || []).push({});';
    str += '</script>';
    $("#google-ad-1").html(str);

    // Google Adsense (mk-mode BLOG Body-2)
    var str = new String();
    //str += '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    //str += '<ins class="adsbygoogle"';
    //str += '     style="display:block"';
    //str += '     data-ad-client="ca-pub-7320193476057758"';
    //str += '     data-ad-slot="3869746533"';
    //str += '     data-ad-format="auto"></ins>';
    //str += '<script>';
    //str += '(adsbygoogle = window.adsbygoogle || []).push({});';
    //str += '</script>';
    str += '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    str += '<!-- mk-mode BLOG Body-2 -->';
    str += '<ins class="adsbygoogle"';
    str += '     style="display:block"';
    str += '     data-ad-client="ca-pub-7320193476057758"';
    str += '     data-ad-slot="3869746533"';
    str += '     data-ad-format="auto"';
    str += '     data-full-width-responsive="true"></ins>';
    str += '<script>';
    str += '     (adsbygoogle = window.adsbygoogle || []).push({});';
    str += '</script>';
    $("#google-ad-2").html(str);

    // Google Adsense (mk-mode BLOG Body-3)
    var str = new String();
    //str += '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    //str += '<ins class="adsbygoogle"';
    ////str += '     style="display:inline-block;min-width:400px;max-width:970px;width:100%;height:16px"';
    //str += '     style="display:inline-block;min-width:320px;max-width:970px;width:100%;height:16px"';
    //str += '     data-ad-client="ca-pub-7320193476057758"';
    //str += '     data-ad-slot="2957433198"';
    //str += '     data-ad-format="link"></ins>';
    //str += '<script>';
    //str += '(adsbygoogle = window.adsbygoogle || []).push({});';
    //str += '</script>';
    str += '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    str += '<!-- mk-mode BLOG Body-3 -->';
    str += '<ins class="adsbygoogle"';
    str += '     style="display:block"';
    str += '     data-ad-client="ca-pub-7320193476057758"';
    str += '     data-ad-slot="2957433198"';
    str += '     data-ad-format="auto"';
    str += '     data-full-width-responsive="true"></ins>';
    str += '<script>';
    str += '     (adsbygoogle = window.adsbygoogle || []).push({});';
    str += '</script>';
    $("#google-ad-3").html(str);

    // Google Adsense (mk-mode BLOG Body-4)
    var str = new String();
    //str += '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    //str += '<ins class="adsbygoogle"';
    //str += '     style="display:block"';
    //str += '     data-ad-client="ca-pub-7320193476057758"';
    //str += '     data-ad-slot="6353752720"';
    //str += '     data-ad-format="auto"></ins>';
    //str += '<script>';
    //str += '(adsbygoogle = window.adsbygoogle || []).push({});';
    //str += '</script>';
    str += '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    str += '<!-- mk-mode BLOG Body-4 -->';
    str += '<ins class="adsbygoogle"';
    str += '     style="display:block"';
    str += '     data-ad-client="ca-pub-7320193476057758"';
    str += '     data-ad-slot="6353752720"';
    str += '     data-ad-format="auto"';
    str += '     data-full-width-responsive="true"></ins>';
    str += '<script>';
    str += '     (adsbygoogle = window.adsbygoogle || []).push({});';
    str += '</script>';
    $("#google-ad-4").html(str);

    // Google Adsense (mk-mode Sidebar-1) (footer に)
    //var str = new String();
    //str += '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    //str += '<ins class="adsbygoogle"';
    //str += '     style="display:inline-block;width:200px;height:90px"';
    //str += '     data-ad-client="ca-pub-7320193476057758"';
    //str += '     data-ad-slot="9601859305"></ins>';
    //str += '<script>';
    //str += '(adsbygoogle = window.adsbygoogle || []).push({});';
    //str += '</script>';
    str += '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
    str += '<!-- mk-mode Sidebar-1 -->';
    str += '<ins class="adsbygoogle"';
    str += '     style="display:block"';
    str += '     data-ad-client="ca-pub-7320193476057758"';
    str += '     data-ad-slot="1858392505"';
    str += '     data-ad-format="auto"';
    str += '     data-full-width-responsive="true"></ins>';
    str += '<script>';
    str += '     (adsbygoogle = window.adsbygoogle || []).push({});';
    str += '</script>';
    $("#google-ad-5").html(str);

    // Amazon Associate - link banner
    var str = new String();
    str += '<iframe src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=12&l=ur1&category=amazonrotate&f=ifr&linkID=1504b9e99fd3c4d2ab827d90b471bc49&t=komasaru-22&tracking_id=komasaru-22" width="300" height="250" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0"></iframe>';
    $("#amazon-ad-1").html(str);

    ////$("#amazon-wd").delay(3500).queue(function(){
    //    var str = new String();
    //    str += '<script type="text/javascript">amzn_assoc_ad_type ="responsive_search_widget"; ';
    //    str += 'amzn_assoc_tracking_id ="komasaru-22"; amzn_assoc_marketplace ="amazon"; ';
    //    str += 'amzn_assoc_region ="JP"; amzn_assoc_placement =""; ';
    //    str += 'amzn_assoc_search_type = "search_widget";amzn_assoc_width ="auto"; ';
    //    str += 'amzn_assoc_height ="auto"; amzn_assoc_default_search_category =""; ';
    //    str += 'amzn_assoc_default_search_key ="";amzn_assoc_theme ="dark"; ';
    //    str += 'amzn_assoc_bg_color ="000000"; </script>';
    //    str += '<script src="//z-fe.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&Operation=GetScript&ID=OneJS&WS=1&Marketplace=JP"></script>';
    ////    $(this).html(str);
    ////});
    //    $("#amazon-wd").html(str);

    // 楽天アフィリエイト
    var str = new String();
    str += '<a href="https://hb.afl.rakuten.co.jp/hsc/0caa64ea.5bb02685.15425709.47a7ce0d/?link_type=pict&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJwaWN0IiwiY29sIjowLCJjYXQiOiI0NCIsImJhbiI6IjQ2MDEzNyJ9" target="_blank" rel="nofollow" style="word-wrap:break-word;"  ><img src="https://hbb.afl.rakuten.co.jp/hsb/0caa64ea.5bb02685.15425709.47a7ce0d/?me_id=1&me_adv_id=460137&t=pict" border="0" style="margin:2px" alt="" title=""></a>';
    str += '<a href="https://hb.afl.rakuten.co.jp/hsc/0caa527f.1b9bae91.15425709.47a7ce0d/?link_type=pict&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJwaWN0IiwiY29sIjowLCJjYXQiOiIxNyIsImJhbiI6IjQzODczNSJ9" target="_blank" rel="nofollow" style="word-wrap:break-word;"  ><img src="https://hbb.afl.rakuten.co.jp/hsb/0caa527f.1b9bae91.15425709.47a7ce0d/?me_id=1&me_adv_id=438735&t=pict" border="0" style="margin:2px" alt="" title=""></a>';
    $("#rakuten-ad").html(str);
});

// 右クリック禁止
$(document).on('contextmenu', function(e) {
    alert('当Webサイトでは右クリックの使用を制限しております。\n（mk-mode BLOG 管理者）');
    return false;
});

// カンマ挿入
function insertComma( str ) {
    var num = new String( str ).replace( /,/g, "" );
    while ( num != ( num = num.replace( /^(-?\d+)(\d{3})/, "$1,$2" ) ) );
    return num;
}

