/**
 * 사진 갤러리와 ‘크게 보기’ 창
 *
 * - 자동으로 넘어가지 않습니다.
 * - 크게 보기 창: ‘닫기’ 버튼, ESC, 좌우 방향키, ‘이전/다음 사진’ 버튼을 지원합니다.
 * - 브라우저 기본 <dialog> 를 사용해 창 밖으로 포커스가 나가지 않고, 닫으면 원래 버튼으로 포커스가 돌아갑니다.
 * - 사진마다 공간 이름·설명·‘선택 옵션 적용’ 표시를 함께 보여 줍니다.
 */
(function () {
  "use strict";
  var GD = window.GD;

  /** 화면에 있는 사진 묶음 (예: 제품 사진, 평면도). 크게 보기 창이 이 목록을 넘겨 봅니다. */
  var sets = {};
  GD.registerImageSet = function (id, images, title) {
    sets[id] = { images: images || [], title: title || "" };
  };

  /** 사진 한 장에 붙는 ‘선택 옵션 적용’ 표시 */
  GD.optionBadge = function (image) {
    var opts = (image && image.optionsShown) || [];
    if (!opts.length) return "";
    return (
      '<p class="option-badge"><strong>선택 옵션 적용</strong> ' +
      GD.esc(opts.join(", ")) +
      ' <span class="option-badge__note">(기본 가격 미포함)</span></p>'
    );
  };

  /* ───── 크게 보기 창 ───── */

  var dialog, state = { set: null, index: 0, returnFocus: null };

  function buildDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "lightbox on-dark";
    dialog.innerHTML =
      '<div class="lightbox__inner">' +
      '<div class="lightbox__top"><p class="lightbox__count" aria-live="polite"></p>' +
      '<button type="button" class="lightbox__btn" data-lb-close>' + GD.icon("close", "icon--sm") + "닫기</button></div>" +
      '<div class="lightbox__stage"></div>' +
      '<div class="lightbox__caption"></div>' +
      '<div class="lightbox__nav">' +
      '<button type="button" class="lightbox__btn" data-lb-prev>' + GD.icon("left", "icon--sm") + "이전 사진</button>" +
      '<button type="button" class="lightbox__btn" data-lb-next>다음 사진' + GD.icon("right", "icon--sm") + "</button>" +
      "</div></div>";
    document.body.appendChild(dialog);

    dialog.querySelector("[data-lb-close]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.querySelector("[data-lb-prev]").addEventListener("click", function () {
      go(-1);
    });
    dialog.querySelector("[data-lb-next]").addEventListener("click", function () {
      go(1);
    });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });
    dialog.addEventListener("close", function () {
      document.body.classList.remove("no-scroll");
      if (state.returnFocus) state.returnFocus.focus();
    });
  }

  function go(delta) {
    var n = state.set.images.length;
    if (n < 2) return;
    state.index = (state.index + delta + n) % n;
    render();
  }

  function render() {
    var set = state.set;
    var img = set.images[state.index];
    var n = set.images.length;
    dialog.setAttribute("aria-label", set.title + " 크게 보기");
    dialog.querySelector(".lightbox__count").textContent =
      set.title + " " + (state.index + 1) + " / " + n + (img.space ? " · " + img.space : "");

    var stage = dialog.querySelector(".lightbox__stage");
    stage.innerHTML = img.src
      ? '<img src="' + GD.esc(GD.url(img.src)) + '" alt="' + GD.esc(img.alt) + '" data-placeholder="사진 준비 중">' +
        (img.isDesignExample ? '<span class="design-label design-label--lg">디자인 예시</span>' : "")
      : GD.placeholder("사진 준비 중");
    GD.checkBrokenImages(stage);

    var cap = "";
    if (img.caption) cap += "<p>" + GD.esc(img.caption) + "</p>";
    else if (img.alt) cap += "<p>" + GD.esc(img.alt) + "</p>";
    cap += GD.optionBadge(img);
    dialog.querySelector(".lightbox__caption").innerHTML = cap;

    var single = n < 2;
    dialog.querySelector("[data-lb-prev]").disabled = single;
    dialog.querySelector("[data-lb-next]").disabled = single;
  }

  GD.openLightbox = function (setId, index, trigger) {
    var set = sets[setId];
    if (!set || !set.images.length) return;
    if (!dialog) buildDialog();
    state.set = set;
    state.index = Math.max(0, Math.min(index || 0, set.images.length - 1));
    state.returnFocus = trigger || document.activeElement;
    render();
    dialog.showModal();
    document.body.classList.add("no-scroll");
    dialog.querySelector("[data-lb-close]").focus();
  };

  /** data-lightbox="묶음이름" data-index="번호" 가 붙은 버튼을 누르면 크게 보기 창을 엽니다 */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-lightbox]") : null;
    if (!t) return;
    e.preventDefault();
    GD.openLightbox(t.getAttribute("data-lightbox"), Number(t.getAttribute("data-index") || 0), t);
  });

  /* ───── 큰 사진 + 작은 사진 목록 (시공 사례 상세에서 사용) ───── */

  GD.stripGallery = function (setId, images, title) {
    GD.registerImageSet(setId, images, title);
    if (!images || !images.length) {
      return '<span class="frame frame--16x10 frame--rounded">' + GD.placeholder(title + " 사진 준비 중") + "</span>";
    }
    var thumbs =
      images.length > 1
        ? '<ul class="thumbs" aria-label="사진 목록">' +
          GD.join(images, function (img, i) {
            return (
              '<li><button type="button" class="thumbs__btn' + (i === 0 ? " is-current" : "") + '" data-thumb="' + i + '"' +
              (i === 0 ? ' aria-current="true"' : "") + ' aria-label="' + (i + 1) + '번째 사진 보기">' +
              GD.imageFrame({ src: img.src, alt: "", width: img.width, height: img.height }, { aspect: "frame--4x3" }) +
              "</button></li>"
            );
          }) +
          "</ul>"
        : "";
    return (
      '<div class="strip" data-strip="' + GD.esc(setId) + '">' +
      '<button type="button" class="strip__main" data-lightbox="' + GD.esc(setId) + '" data-index="0" aria-label="사진 크게 보기 (1/' +
      images.length + "번째): " + GD.esc(images[0].alt) + '">' +
      GD.imageFrame(images[0], { eager: true, aspect: "frame--16x10" }) +
      "</button>" +
      '<div class="strip__bar"><p class="text-base text-soft" aria-live="polite" data-strip-count>사진 1 / ' + images.length + "</p>" +
      '<button type="button" class="btn btn--outline btn--sm" data-lightbox="' + GD.esc(setId) + '" data-index="0" data-strip-zoom>' +
      GD.icon("expand", "icon--sm") + "사진 크게 보기</button></div>" +
      thumbs +
      "</div>"
    );
  };

  GD.bindStrips = function (scope) {
    (scope || document).querySelectorAll("[data-strip]").forEach(function (strip) {
      var id = strip.getAttribute("data-strip");
      var set = sets[id];
      strip.querySelectorAll("[data-thumb]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var i = Number(btn.getAttribute("data-thumb"));
          var img = set.images[i];
          var main = strip.querySelector(".strip__main");
          main.setAttribute("data-index", String(i));
          main.setAttribute("aria-label", "사진 크게 보기 (" + (i + 1) + "/" + set.images.length + "번째): " + img.alt);
          main.innerHTML = GD.imageFrame(img, { aspect: "frame--16x10" });
          strip.querySelector("[data-strip-zoom]").setAttribute("data-index", String(i));
          strip.querySelector("[data-strip-count]").textContent = "사진 " + (i + 1) + " / " + set.images.length;
          strip.querySelectorAll("[data-thumb]").forEach(function (b) {
            var on = b === btn;
            b.classList.toggle("is-current", on);
            if (on) b.setAttribute("aria-current", "true");
            else b.removeAttribute("aria-current");
          });
          GD.checkBrokenImages(main);
        });
      });
    });
  };
})();
