/**
 * 페이지 시작 — 각 HTML 파일에서 data-component="..." 자리에 알맞은 내용을 채웁니다.
 *
 * 사용할 수 있는 자리 (HTML 에 <div data-component="이름"></div> 로 적습니다)
 *   product-browser   분류 버튼 + 제품 카드 목록  (data-url="true" 이면 주소의 ?category= 와 연결)
 *   case-list         시공 사례 카드 목록        (data-limit="3" 으로 개수 제한)
 *   faq               자주 묻는 질문             (data-ids="lead-time,site-preparation" 으로 일부만)
 *   steps             제작·설치 단계             (data-detailed="true" 이면 세부 내용 포함)
 *   cost-guide        비용 구성 안내
 *   contact           전화 상담 + 주소·지도
 *   call-banner       페이지 마지막 상담 안내 띠  (data-title="제목")
 *   categories        제품 분류 설명
 *   checklist         상담 전 준비물
 *   businesses        회사가 하는 일
 *   company-info      회사 정보 표
 *   notice-products / notice-cases / notice-faq   예시·초안 안내 (실제 자료로 바뀌면 자동으로 사라짐)
 * 전화번호 링크: <a data-tel="main"> (대표전화) / <a data-tel="mobile"> (휴대전화)
 */
(function () {
  "use strict";
  var GD = window.GD;
  var esc = GD.esc;

  /* ───── 제품 분류 버튼 + 카드 ───── */
  function productBrowser(el) {
    var useUrl = el.getAttribute("data-url") === "true";
    var heading = el.getAttribute("data-heading") || "h3";
    var filters = [{ id: "all", label: "전체" }].concat(
      GD.categories.map(function (c) {
        return { id: c.id, label: c.label };
      })
    );
    var active = "all";
    if (useUrl) {
      var param = new URLSearchParams(window.location.search).get("category");
      if (GD.isCategory(param)) active = param;
    }

    function draw() {
      var visible = GD.products.filter(function (p) {
        return active === "all" || p.category === active;
      });
      var activeLabel = filters.filter(function (f) {
        return f.id === active;
      })[0].label;
      el.innerHTML =
        '<div class="filters" role="group" aria-label="제품 분류 선택">' +
        GD.join(filters, function (f) {
          var on = f.id === active;
          return (
            '<button type="button" class="filters__btn' + (on ? " is-on" : "") + '" aria-pressed="' + on + '" data-filter="' + f.id + '">' +
            (on ? GD.icon("check", "icon--sm") : "") + esc(f.label) + "</button>"
          );
        }) +
        "</div>" +
        '<p class="filters__count" aria-live="polite"><strong>' + esc(activeLabel) + "</strong> 제품 " + visible.length + "개</p>" +
        (visible.length
          ? GD.cardGrid(visible, function (p) {
              return GD.productCard(p, heading);
            })
          : '<div class="empty-box mt-4"><p>이 분류에 등록된 제품이 아직 없습니다.</p><p class="mt-2">전화로 문의해 주시면 안내해 드립니다. <a class="link-strong text-brand" href="' +
            GD.telHref(GD.company.phone.main) + '">' + esc(GD.company.phone.main) + "</a></p></div>");
      GD.checkBrokenImages(el);
    }

    el.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      active = btn.getAttribute("data-filter");
      if (useUrl) {
        var url = new URL(window.location.href);
        if (active === "all") url.searchParams.delete("category");
        else url.searchParams.set("category", active);
        try {
          window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        } catch (err) {
          /* 내 컴퓨터에서 파일로 열었을 때 등 주소를 바꿀 수 없으면 화면만 바꿉니다 */
        }
      }
      draw();
      var again = el.querySelector('[data-filter="' + active + '"]');
      if (again) again.focus();
    });
    draw();
  }

  var components = {
    "product-browser": productBrowser,

    "case-list": function (el) {
      var limit = Number(el.getAttribute("data-limit") || 0);
      var heading = el.getAttribute("data-heading") || "h3";
      var list = limit ? GD.cases.slice(0, limit) : GD.cases;
      el.innerHTML = list.length
        ? GD.cardGrid(list, function (c) {
            return GD.caseCard(c, heading);
          })
        : '<p class="text-lg">시공 사례를 준비하고 있습니다.</p>';
    },

    faq: function (el) {
      var ids = el.getAttribute("data-ids");
      var items = ids
        ? GD.faqs.filter(function (f) {
            return ids.split(",").indexOf(f.id) >= 0;
          })
        : GD.faqs;
      el.innerHTML = GD.faqList(items);
    },

    steps: function (el) {
      el.innerHTML = GD.renderSteps(el.getAttribute("data-detailed") === "true");
    },

    "cost-guide": function (el) {
      el.innerHTML = GD.costGuide(el.getAttribute("data-heading") || "h3");
    },

    contact: function (el) {
      el.innerHTML = GD.contactPanel();
    },

    "call-banner": function (el) {
      el.outerHTML = GD.callBanner(el.getAttribute("data-title"));
    },

    categories: function (el) {
      el.innerHTML =
        '<dl class="grid-3">' +
        GD.join(GD.categories, function (c) {
          return '<div class="panel"><dt class="panel__title">' + esc(c.fullLabel) + '</dt><dd class="mt-3 text-lg">' + esc(c.description) + "</dd></div>";
        }) +
        "</dl>";
    },

    checklist: function (el) {
      el.innerHTML =
        '<ul class="grid-2 checklist">' +
        GD.join(GD.consultationChecklist, function (c) {
          return "<li>" + GD.icon("check", "icon--md text-brand") + "<span>" + esc(c) + "</span></li>";
        }) +
        "</ul>";
    },

    businesses: function (el) {
      el.innerHTML =
        '<ul class="grid-3">' +
        GD.join(GD.company.businesses, function (b) {
          return '<li class="panel"><h3 class="panel__title">' + esc(b.title) + '</h3><p class="mt-3 text-lg">' + esc(b.description) + "</p></li>";
        }) +
        "</ul>";
    },

    "company-info": function (el) {
      var c = GD.company;
      var rows = [["회사명", esc(c.name)]];
      if (c.representative) rows.push(["대표", esc(c.representative)]);
      if (c.businessRegistrationNumber) rows.push(["사업자등록번호", esc(c.businessRegistrationNumber)]);
      rows.push(["대표전화", '<a class="link-strong text-brand" href="' + GD.telHref(c.phone.main) + '">' + esc(c.phone.main) + "</a>"]);
      rows.push(["휴대전화", '<a class="link-strong" href="' + GD.telHref(c.phone.mobile) + '">' + esc(c.phone.mobile) + "</a>"]);
      rows.push(["주소", esc(c.address)]);
      if (c.hours) rows.push(["상담 시간", esc(c.hours)]);
      el.innerHTML =
        '<dl class="info-table">' +
        GD.join(rows, function (r) {
          return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>";
        }) +
        "</dl>";
    },

    "notice-products": function (el) {
      el.innerHTML = GD.products.some(function (p) {
        return p.isExample;
      })
        ? GD.notice("지금 보이는 제품은 <strong>개발용 예시 데이터</strong>입니다. 사진은 ‘디자인 예시’이며, 면적·사양·가격은 회사 확인 후 채워집니다.")
        : "";
    },

    "notice-cases": function (el) {
      el.innerHTML = GD.cases.some(function (c) {
        return c.isExample;
      })
        ? GD.notice("현재 보이는 사례는 화면 구성을 확인하기 위한 <strong>개발용 예시</strong>입니다. 실제 시공 사례가 아닙니다.")
        : "";
    },

    "notice-faq": function (el) {
      el.innerHTML = GD.faqs.some(function (f) {
        return f.needsReview;
      })
        ? GD.notice("아래 답변은 회사 확인 전 초안입니다. 정확한 내용은 전화로 문의해 주세요.")
        : "";
    },

    "notice-design-photos": function (el) {
      var any = GD.products.some(function (p) {
        return (p.images || []).some(function (i) {
          return i.isDesignExample;
        });
      });
      el.innerHTML = any
        ? '<p class="mt-6 text-base text-soft">‘디자인 예시’로 표시된 사진은 화면 구성을 보여 주기 위한 이미지이며 실제 제품 사진이 아닙니다.</p>'
        : "";
    },
  };

  /* ───── 시공 사례 상세 ───── */
  function renderCaseDetail(main) {
    var item = GD.getCase(main.getAttribute("data-slug"));
    if (!item) {
      main.innerHTML =
        '<div class="container section-y"><h1 class="h-page">사례를 찾을 수 없습니다</h1><p class="mt-6"><a class="btn btn--primary" href="' +
        GD.url("cases.html") + '">시공 사례 목록으로</a></p></div>';
      return;
    }
    var product = item.productSlug ? GD.getProduct(item.productSlug) : null;
    var rows = [];
    if (item.region) rows.push(["지역", esc(item.region)]);
    rows.push(["제품", product ? '<a class="link-strong text-brand" href="' + GD.productUrl(product.slug) + '">' + esc(item.productLabel) + "</a>" : esc(item.productLabel)]);
    if (item.work && item.work.length) rows.push(["시공 내용", esc(item.work.join(" · "))]);
    if (item.completedAt) rows.push(["완공", esc(item.completedAt)]);

    main.innerHTML =
      '<div class="container pt-crumb">' +
      GD.breadcrumb([{ label: "홈", href: "index.html" }, { label: "시공 사례", href: "cases.html" }, { label: item.title }]) +
      "</div>" +
      '<article class="container case-detail">' +
      '<h1 class="h-page">' + esc(item.title) + "</h1>" +
      (item.isExample ? GD.notice("이 사례는 화면 구성을 확인하기 위한 <strong>개발용 예시</strong>입니다. 실제 시공 사례가 아닙니다.", "mt-6 max-3xl") : "") +
      '<div class="split mt-8"><div class="split__main">' + GD.stripGallery("case", item.images, item.title) + "</div>" +
      '<div class="split__side"><h2 class="h-sub">사례 정보</h2><dl class="facts-list">' +
      GD.join(rows, function (r) {
        return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>";
      }) +
      '</dl><p class="mt-4 text-base text-soft">고객의 주소와 개인정보는 공개하지 않습니다.</p></div></div>' +
      '<section class="case-detail__text" aria-labelledby="case-description-title"><h2 id="case-description-title" class="h-section-sm">시공 내용</h2><div class="pd-text mt-5">' +
      GD.join(item.description, function (d) {
        return "<p>" + esc(d) + "</p>";
      }) +
      "</div></section>" +
      '<div class="btn-row mt-12">' +
      (product ? '<a class="btn btn--outline" href="' + GD.productUrl(product.slug) + '">이 제품 자세히 보기' + GD.icon("right") + "</a>" : "") +
      '<a class="btn btn--outline" href="' + GD.url("cases.html") + '">시공 사례 목록으로</a>' +
      "</div></article>" +
      GD.callBanner();
    GD.bindStrips(main);
  }

  function fillPhones() {
    document.querySelectorAll("[data-tel]").forEach(function (a) {
      var which = a.getAttribute("data-tel") === "mobile" ? "mobile" : "main";
      var num = GD.company.phone[which];
      a.setAttribute("href", GD.telHref(num));
      var target = a.querySelector("[data-tel-text]") || (a.children.length ? null : a);
      if (target) target.textContent = num;
    });
  }

  function start() {
    GD.renderLayout();
    var main = document.getElementById("main");
    var page = main.getAttribute("data-page");
    if (page === "product-detail") GD.renderProductDetail(main);
    if (page === "case-detail") renderCaseDetail(main);
    if (page === "check" && GD.renderChecks) GD.renderChecks(main);

    document.querySelectorAll("[data-component]").forEach(function (el) {
      var fn = components[el.getAttribute("data-component")];
      if (fn) fn(el);
    });
    fillPhones();
    GD.bindCopyButtons();
    GD.checkBrokenImages();

    // 다른 페이지에서 #위치 로 들어온 경우, 내용을 그린 뒤 그 위치로 이동합니다
    if (window.location.hash.length > 1) {
      var target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
