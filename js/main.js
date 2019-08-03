// モバイルブラウザかどうか判定
var isMobile = !!(new MobileDetect(window.navigator.userAgent).mobile());

/**
 * 指定された名前のタブを表示する
 */
function showTab(tabName) {
  // すでに表示されている場合は何もせずに終了
  if ($("#" + tabName).is(":visible")) {
    return;
  }

  var tabsContainer = $("a[href='#" + tabName + "']").closest(".tabs");
  // .tabs__menu liのうちtabNameに該当するものにだけactiveクラスを付ける
  tabsContainer.find(".tabs__menu li").removeClass("active");
  tabsContainer.find(".tabs__menu a[href='#" + tabName + "']").parent("li").addClass("active");

  // .tabs__contentの直下の要素をすべて非表示
  tabsContainer.find(".tabs__content > *").css({ display: "none" });
  // #<tabName>と.tabs__content .<tabName>を表示
  tabsContainer.find("#" + tabName + ", .tabs__content ." + tabName).css({
    display: "block",
    opacity: 0.7,
  }).animate({
    opacity: 1,
  }, 400);
}


/**
 * パララックス関連
 */

// 背景画像のスクロール速度。数字が小さいほど速い。
var parallaxXSpeed = 12;
var parallaxYSpeed = 3;
var parallaxXSpeed_small = 5;
var parallaxYSpeed_small = 1;

// パララックスを適用する関数
function showParallax() {
  var scrollTop = $(window).scrollTop();

  // 背景画像の位置をスクロールに合わせて変える
  var offsetX = Math.round(scrollTop / parallaxXSpeed);
  var offsetY = Math.round(scrollTop / parallaxYSpeed);
  var offsetX_small = Math.round(scrollTop / parallaxXSpeed_small);
  var offsetY_small = Math.round(scrollTop / parallaxYSpeed_small);

  $(".puppies").css({
    "background-position":
      // 一番上
      -offsetX + "px " + -offsetY + "px, " +
      // 上から2番目
      offsetX_small + "px " + -offsetY_small + "px, " +
      // 一番下
      "0% 0%",
  });

  $(".kittens").css({
    "background-position":
      // 一番上
      offsetX + "px " + -offsetY + "px, " +
      // 上から2番目
      -offsetX_small + "px " + -offsetY_small + "px, " +
      // 一番下
      "0% 0%",
  });
}

// パララックスを初期化する
function initParallax() {
  $(window).off("scroll", showParallax);

  if (!isMobile) { // モバイルブラウザでなければパララックスを適用
    showParallax();

    // スクロールのたびにshowParallax関数を呼ぶ
    $(window).scroll(showParallax);
  }
}


/**
 * ウインドウリサイズ時に実行する処理
 */
$(window).resize(function() {
  // ウインドウがリサイズされるとここが実行される
  initParallax();
});

/**
 * Web API
 */
 
 // Flickr API key
var apiKey = "3c9ceb951c2f4e02e9f27587ea6cd7dc";
 
// photoオブジェクトから画像のURLを作成して返す
function getFlickrImageURL(photo, size) {
  var url = "https://farm" + photo.farm + ".staticflickr.com/"
    + photo.server + "/" + photo.id + "_" + photo.secret;
  if (size) { // サイズ指定ありの場合
    url += "_" + size;
  }
  url += ".jpg";
  return url;
}

// photoオブジェクトからページのURLを作成して返す
function getFlickrPageURL(photo) {
  return "https://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
}

// photoオブジェクトからaltテキストを生成して返す
function getFlickrText(photo) {
  var text = '"' + photo.title + '" by ' + photo.ownername;
  if (photo.license == "4") {
    // Creative Commons Attribution（CC BY）ライセンス
    text += ' / CC BY';
  }
  return text;
}

// ギャラリーに表示
function showgallely(searchword) {
  var parameters =  $.param({
    method: "flickr.photos.search",
    api_key: apiKey,
    text: searchword, // 検索テキスト
    sort: "interestingness-desc", // 興味深さ順
    per_page: 4, // 取得件数
    license: "4", // Creative Commons Attributionのみ
    extras: "owner_name,license", // 追加で取得する情報
    format: "json", // レスポンスをJSON形式に
    nojsoncallback: 1, // レスポンスの先頭に関数呼び出しを含めない
  });
  
  var flickr_url = "https://api.flickr.com/services/rest/?" + parameters;
  console.log(flickr_url);
  // 画像を検索して表示
  $.getJSON(flickr_url, function(data){
    console.log(data);
    if (data.stat == "ok") {

      for (var i = 0; i < data.photos.photo.length; i++) {
        var photo = data.photos.photo[i];
        var photoText = getFlickrText(photo);
        
        // <div class="..."></div>を作る
        var $div = $("<div>", {"class": "image-gallery__item",});
        
        // $divに <a href="..." ...><img src="..." ...></a> を追加する
        $div.append(
          $("<a>", {
            href: getFlickrPageURL(photo),
            "class": "popup",
            "target": "_blank",     // リンクを新規タブで開く
            "data-toggle": "tooltip",
            "data-placement": "bottom",
            title: photoText,
          }).append($("<img>", {
            src: getFlickrImageURL(photo, "q"),
            "class": "image-gallery__img",
            width: 160,
            height: 160,
            alt: photoText,
          }))
        );
        // $divを.image-gallery animatedに追加する
        $div.appendTo("#"+searchword);
        console.log($div);
      }
      // BootstrapのTooltipを適用
      $("[data-toggle='tooltip']").tooltip();
    }
  });
  
}

/**
 * ページロード時に実行する処理
 */
$(document).ready(function() {
  
  // 初期状態としてギャラリーに表示する写真をFlickr APIから取得
  showgallely("cat");
  showgallely("dog");
  
  // 初期状態として1番目のタブを表示
  showTab("puppies-1");
  showTab("kittens-1");

  // タブがクリックされたらコンテンツを表示
  $(".tabs__menu a").click(function() {
    var tabName = $(this).attr("href");
    if (tabName[0] === "#") {
      // hrefの先頭の#を除いたものをshowTab()関数に渡す
      showTab(tabName.substring(1));

      // hrefにページ遷移しない
      return false;
    }
  });

  // animatedクラスを持つ要素が画面内に入ったら
  // Animate.cssのfadeInUpエフェクトを適用
  $(".animated").waypoint(function(direction) {
    if (direction === "down") {
      $(this.element).addClass("fadeInUp");
      this.destroy();
    }
  }, { offset: "100%" });

  if (isMobile) {
    // モバイルブラウザでは静止画を表示
    $(".top__bg").css({
      "background-image": "url(video/top-video-still.jpg)",
    });
  } else {
    // モバイル以外のブラウザでは動画を表示
    $(".top__video").css({
      display: "block",
    });
  }

  // popupクラスを持つ要素にMagnific Popupを適用
  $(".popup").magnificPopup({
    type: "image",
    gallery: {
      enabled: true,
    },

    // ポップアップが非表示になるまでの待ち時間
    removalDelay: 300,

    // ポップアップに適用されるクラス。
    // ここではフェードイン・アウト用のmfp-fadeクラスを適用。
    mainClass: "mfp-fade",
  });

  // ナビゲーションバーのリンクをクリックしたら
  // スムーズにスクロールしながら対象位置に移動
  $("#navbar a").click(function() {
    var destination = $(this).attr("href");
    $("html, body").animate({
      scrollTop: $(destination).offset().top,
    }, 1400);

    // ハンバーガーメニューが開いている場合は閉じる
    $(".navbar-toggle:visible").click();

    // 本来のクリックイベントは処理しない
    return false;
  });
  
  initParallax();
});
