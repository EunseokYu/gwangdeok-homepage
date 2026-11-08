/**
 * 관리자 페이지 (admin.html)
 *
 * - 제품 추가·수정·삭제, 사진·평면도 올리기, 제품군 설명 수정
 * - ‘저장’을 누르면 GitHub 저장소(main)에 한 번의 기록(커밋)으로 저장되고, GitHub Pages 가 사이트를 다시 만듭니다.
 * - 서버가 없으므로 GitHub 토큰(저장용 열쇠)으로 GitHub 에 직접 저장합니다.
 *   토큰은 이 브라우저에만 보관되며 저장소나 다른 곳으로 보내지 않습니다. (GitHub API 에만 사용)
 */
(function () {
  "use strict";
  var GD = window.GD;
  var F = window.GDAdminFormat;
  var esc = GD.esc;

  var REPO = { owner: "EunseokYu", name: "gwangdeok-homepage", branch: "main" };
  var API = "https://api.github.com";
  var TOKEN_KEY = "gd-admin-token";
  var PRODUCTS_PATH = "data/products.js";
  var CATEGORIES_PATH = "data/categories.js";

  var state = {
    token: null,
    products: [],
    categories: [],
    loadedSha: {}, // 불러올 때의 파일 버전 (다른 곳에서 바뀌었는지 확인용)
    savedSlugs: {}, // 저장소에 이미 페이지 파일이 있는 제품
    loadedSlugs: {}, // 불러온(또는 이번에 저장한) 제품 목록
    pending: {}, // 아직 저장하지 않은 사진: 경로 → base64
    previews: {}, // 이번에 올린 사진의 미리보기: 경로 → dataURL
    selected: 0,
    dirtyProducts: false,
    dirtyCategories: false,
    saving: false,
    confirmDelete: false,
  };

  function $(sel) {
    return document.querySelector(sel);
  }
  function siteVersion() {
    var s = document.querySelector('script[src*="js/admin.js"]');
    var m = s && /[?&]v=([\w-]+)/.exec(s.getAttribute("src"));
    return m ? m[1] : "1";
  }
  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }
  function show(name) {
    document.querySelectorAll("[data-when]").forEach(function (el) {
      el.hidden = el.getAttribute("data-when") !== name;
    });
  }

  /* ───────── GitHub API ───────── */

  function utf8ToB64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function b64ToUtf8(b64) {
    var bin = atob(b64.replace(/\s/g, ""));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function gh(method, path, body) {
    var headers = {
      Authorization: "Bearer " + state.token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (body) headers["Content-Type"] = "application/json";
    return fetch(API + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined, cache: "no-store" }).then(
      function (r) {
        if (r.ok) return r.status === 204 ? null : r.json();
        return r
          .json()
          .catch(function () {
            return {};
          })
          .then(function (j) {
            var err = new Error(j.message || "HTTP " + r.status);
            err.status = r.status;
            throw err;
          });
      }
    );
  }
  function repoPath(p) {
    return "/repos/" + REPO.owner + "/" + REPO.name + p;
  }
  function friendly(err) {
    if (!err.status) return "인터넷 연결을 확인해 주세요. (" + err.message + ")";
    if (err.status === 401) return "토큰이 맞지 않거나 만료되었습니다. 토큰을 다시 확인해 주세요.";
    if (err.status === 403 || err.status === 404)
      return "이 저장소에 저장할 권한이 없습니다. 토큰의 저장소 선택(gwangdeok-homepage)과 권한(Contents: Read and write)을 확인해 주세요.";
    if (err.status === 409 || err.status === 422) return "다른 곳에서 먼저 바뀌었습니다. 페이지를 새로고침한 뒤 다시 저장해 주세요.";
    return "저장소와 통신하지 못했습니다. (" + err.status + " " + err.message + ")";
  }

  function readFile(path) {
    return gh("GET", repoPath("/contents/" + path + "?ref=" + REPO.branch)).then(function (j) {
      return { text: b64ToUtf8(j.content), sha: j.sha };
    });
  }

  /** 여러 파일을 한 번의 기록(커밋)으로 저장. files: [{ path, b64 } 또는 { path, remove: true }] */
  function commitFiles(files, message) {
    var base;
    return gh("GET", repoPath("/git/ref/heads/" + REPO.branch))
      .then(function (ref) {
        base = ref.object.sha;
        return gh("GET", repoPath("/git/commits/" + base));
      })
      .then(function (commit) {
        var entries = [];
        var chain = Promise.resolve();
        files.forEach(function (f) {
          chain = chain.then(function () {
            if (f.remove) {
              entries.push({ path: f.path, mode: "100644", type: "blob", sha: null });
              return null;
            }
            return gh("POST", repoPath("/git/blobs"), { content: f.b64, encoding: "base64" }).then(function (blob) {
              entries.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
            });
          });
        });
        return chain.then(function () {
          return gh("POST", repoPath("/git/trees"), { base_tree: commit.tree.sha, tree: entries });
        });
      })
      .then(function (tree) {
        return gh("POST", repoPath("/git/commits"), { message: message, tree: tree.sha, parents: [base] });
      })
      .then(function (c) {
        return gh("PATCH", repoPath("/git/refs/heads/" + REPO.branch), { sha: c.sha, force: false });
      });
  }

  /* ───────── 연결 ───────── */

  function connect(token, remember) {
    state.token = token;
    var msg = $("#login-msg");
    msg.textContent = "연결하는 중입니다…";
    return gh("GET", repoPath(""))
      .then(function (repo) {
        if (repo.permissions && repo.permissions.push === false) {
          var e = new Error("no push");
          e.status = 403;
          throw e;
        }
        return Promise.all([readFile(PRODUCTS_PATH), readFile(CATEGORIES_PATH), gh("GET", repoPath("/contents/products?ref=" + REPO.branch))]);
      })
      .then(function (res) {
        state.products = F.parse(res[0].text, "products");
        state.categories = F.parse(res[1].text, "categories");
        state.loadedSha[PRODUCTS_PATH] = res[0].sha;
        state.loadedSha[CATEGORIES_PATH] = res[1].sha;
        state.savedSlugs = {};
        state.loadedSlugs = {};
        state.products.forEach(function (p) {
          state.loadedSlugs[p.slug] = true;
        });
        res[2].forEach(function (f) {
          var m = /^(.+)\.html$/.exec(f.name);
          if (m) state.savedSlugs[m[1]] = true;
        });
        try {
          (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
        } catch (e) {
          /* 저장 공간을 쓸 수 없으면 이번 화면에서만 사용 */
        }
        msg.textContent = "";
        show("connected");
        state.selected = 0;
        renderAll();
      })
      .catch(function (err) {
        state.token = null;
        msg.textContent = friendly(err);
      });
  }

  function logout() {
    if ((state.dirtyProducts || state.dirtyCategories) && !window.confirmLeave) {
      setSaveMsg("저장하지 않은 변경이 있습니다. 그래도 끊으려면 ‘연결 끊기’를 한 번 더 누르세요.", true);
      window.confirmLeave = true;
      return;
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      /* 무시 */
    }
    window.location.reload();
  }

  /* ───────── 값 연결 도구 ───────── */

  var binds = [];
  var acts = [];
  function bind(get, set, opts) {
    binds.push({ get: get, set: set, opts: opts || {} });
    return binds.length - 1;
  }
  function act(fn) {
    acts.push(fn);
    return acts.length - 1;
  }
  function nn(v) {
    v = String(v == null ? "" : v).trim();
    return v === "" ? null : v;
  }
  function help(t) {
    return t ? '<span class="af__help">' + t + "</span>" : "";
  }

  /** 한 줄 글자 */
  function fText(label, get, set, o) {
    o = o || {};
    var id = bind(get, set, o);
    return (
      '<label class="af' + (o.cls ? " " + o.cls : "") + '"><span class="af__label">' + label + (o.required ? ' <em class="af__req">필수</em>' : "") + "</span>" +
      help(o.help) +
      '<input type="text" data-b="' + id + '" value="' + esc(get() == null ? "" : get()) + '"' +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + (o.disabled ? " disabled" : "") + (o.inputmode ? ' inputmode="' + o.inputmode + '"' : "") + "></label>"
    );
  }
  /** 여러 줄 글자 */
  function fArea(label, get, set, o) {
    o = o || {};
    var id = bind(get, set, o);
    return (
      '<label class="af' + (o.cls ? " " + o.cls : "") + '"><span class="af__label">' + label + "</span>" + help(o.help) +
      '<textarea rows="' + (o.rows || 3) + '" data-b="' + id + '"' + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + ">" +
      esc(get() == null ? "" : get()) + "</textarea></label>"
    );
  }
  /** 한 줄에 하나씩 쓰는 목록 */
  function fLines(label, getArr, setArr, o) {
    return fArea(
      label,
      function () {
        return (getArr() || []).join("\n");
      },
      function (v) {
        setArr(
          String(v)
            .split("\n")
            .map(function (s) {
              return s.trim();
            })
            .filter(Boolean)
        );
      },
      Object.assign({ rows: 4 }, o, { help: ((o && o.help) || "") + (o && o.help ? " " : "") + "한 줄에 하나씩 적습니다." })
    );
  }
  /** 고르기 */
  function fSelect(label, choices, get, set, o) {
    o = o || {};
    var id = bind(get, set, o);
    var cur = get();
    return (
      '<label class="af' + (o.cls ? " " + o.cls : "") + '"><span class="af__label">' + label + "</span>" + help(o.help) +
      '<select data-b="' + id + '">' +
      choices
        .map(function (c, i) {
          return '<option value="' + i + '"' + (c[0] === cur ? " selected" : "") + ">" + esc(c[1]) + "</option>";
        })
        .join("") +
      "</select></label>"
    ).replace('data-b="' + id + '"', 'data-b="' + id + '" data-choices="' + esc(JSON.stringify(choices.map(function (c) {
      return c[0];
    }))) + '"');
  }
  function fCheck(label, get, set) {
    var id = bind(get, set);
    return '<label class="af-check"><input type="checkbox" data-b="' + id + '"' + (get() ? " checked" : "") + "><span>" + label + "</span></label>";
  }
  function btn(label, fn, cls) {
    return '<button type="button" class="btn ' + (cls || "btn--outline btn--sm") + '" data-act="' + act(fn) + '">' + label + "</button>";
  }
  function fieldset(title, inner, desc) {
    return '<fieldset class="afs"><legend class="afs__title">' + title + "</legend>" + (desc ? '<p class="afs__desc">' + desc + "</p>" : "") + inner + "</fieldset>";
  }

  /** 줄 단위 반복 (예: 공간 구성 - 공간 이름·설명) */
  function rows(list, renderRow, makeNew, addLabel) {
    var html = '<div class="arows">';
    list.forEach(function (item, i) {
      html +=
        '<div class="arow"><div class="arow__fields">' + renderRow(item, i) + '</div><div class="arow__tools">' +
        (i > 0 ? btn("위로", function () {
          var t = list[i - 1];
          list[i - 1] = list[i];
          list[i] = t;
          changed(true);
        }) : "") +
        btn("삭제", function () {
          list.splice(i, 1);
          changed(true);
        }) +
        "</div></div>";
    });
    html += btn("+ " + addLabel, function () {
      list.push(makeNew());
      changed(true);
    }) + "</div>";
    return html;
  }

  /* ───────── 제품 편집 ───────── */

  var CAT_HINT = {
    "mobile-home": "이동식주택",
    shelter: "농촌체류형 쉼터",
    "farm-hut": "농막",
    container: "컨테이너",
  };
  function defaultSpecGroups() {
    return [
      { group: "구조·골조", items: [{ label: "구조", value: null }] },
      { group: "지붕·외장", items: [{ label: "지붕", value: null }, { label: "외장재", value: null }] },
      { group: "단열·방수", items: [{ label: "단열재", value: null }, { label: "방수", value: null }] },
      { group: "창호·현관", items: [{ label: "창호", value: null }, { label: "현관문", value: null }] },
      { group: "바닥·벽·천장", items: [{ label: "바닥", value: null }, { label: "벽·천장", value: null }] },
      { group: "주방·욕실", items: [{ label: "주방", value: null }, { label: "욕실", value: null }] },
      { group: "전기·급배수·냉난방", items: [{ label: "전기", value: null }, { label: "급배수", value: null }, { label: "냉난방", value: null }] },
    ];
  }
  function defaultCostScope() {
    return ["선택 옵션", "운송", "장비(크레인 등)", "현장 설치", "기초·토목 공사", "전기·급배수 연결"].map(function (i) {
      return { item: i, status: null };
    });
  }
  function newSlug(category) {
    var n = 1;
    var taken = {};
    state.products.forEach(function (p) {
      taken[p.slug] = true;
    });
    while (taken[category + "-" + n] || state.savedSlugs[category + "-" + n]) n++;
    return category + "-" + n;
  }
  function newProduct() {
    var cat = (state.categories[0] && state.categories[0].id) || "mobile-home";
    return {
      slug: newSlug(cat),
      category: cat,
      name: "",
      availability: null,
      summary: null,
      tagline: null,
      layoutSummary: null,
      images: [],
      lifestyle: { fitsFor: [], layoutPoints: [], otherPlanHint: null, intro: [] },
      floorPlan: null,
      size: { exterior: null, interior: null, loft: null, deck: null },
      rooms: [],
      keySpecs: [],
      specGroups: defaultSpecGroups(),
      options: [],
      customization: { base: [], custom: [] },
      price: { kind: "consult", amount: null, vat: null, appliesTo: null },
      costScope: defaultCostScope(),
      schedule: { productionNote: null, siteNote: null },
      relatedCaseSlugs: [],
      isExample: false,
    };
  }
  /** 비어 있는 칸을 채워 편집할 수 있게 */
  function normalize(p) {
    p.images = p.images || [];
    p.lifestyle = p.lifestyle || {};
    ["fitsFor", "layoutPoints", "intro"].forEach(function (k) {
      p.lifestyle[k] = p.lifestyle[k] || [];
    });
    p.size = p.size || {};
    p.rooms = p.rooms || [];
    p.keySpecs = p.keySpecs || [];
    p.specGroups = p.specGroups || [];
    p.options = p.options || [];
    p.customization = p.customization || { base: [], custom: [] };
    p.customization.base = p.customization.base || [];
    p.customization.custom = p.customization.custom || [];
    p.price = p.price || { kind: "consult", amount: null, vat: null, appliesTo: null };
    p.costScope = p.costScope || [];
    p.schedule = p.schedule || { productionNote: null, siteNote: null };
    p.relatedCaseSlugs = p.relatedCaseSlugs || [];
    return p;
  }

  function imgSrc(src) {
    return state.previews[src] || src;
  }

  /** 사진 파일을 가로·세로 최대 1800px JPG 로 줄여서 준비 */
  function prepareImage(file, slug, n) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = 1800;
        var scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * scale);
        var h = Math.round(img.naturalHeight * scale);
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        var path = "images/products/" + slug + "-" + Date.now().toString(36) + "-" + n + ".jpg";
        state.pending[path] = dataUrl.split(",")[1];
        state.previews[path] = dataUrl;
        resolve({ src: path, width: w, height: h });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error(file.name));
      };
      img.src = url;
    });
  }

  function photosHtml(p) {
    var optionNames = p.options.map(function (o) {
      return o.name;
    }).filter(Boolean);
    var list = p.images
      .map(function (img, i) {
        var opts = optionNames.length
          ? '<div class="af"><span class="af__label">사진에 들어간 선택 옵션</span><div class="af-checks">' +
            optionNames
              .map(function (name) {
                return fCheck(
                  esc(name),
                  function () {
                    return (img.optionsShown || []).indexOf(name) >= 0;
                  },
                  function (on) {
                    img.optionsShown = (img.optionsShown || []).filter(function (n) {
                      return n !== name;
                    });
                    if (on) img.optionsShown.push(name);
                  }
                );
              })
              .join("") +
            "</div></div>"
          : '<p class="af__help">선택 옵션을 먼저 등록하면 사진에 들어간 옵션을 표시할 수 있습니다.</p>';
        return (
          '<div class="aphoto"><div class="aphoto__img">' +
          '<img src="' + esc(imgSrc(img.src)) + '" alt="" data-placeholder="사진 없음">' +
          (i === 0 ? '<span class="aphoto__badge">대표 사진</span>' : "") +
          (img.isDesignExample ? '<span class="aphoto__badge aphoto__badge--warn">디자인 예시</span>' : "") +
          '</div><div class="aphoto__fields">' +
          fText("공간", function () {
            return img.space;
          }, function (v) {
            img.space = nn(v);
          }, { placeholder: "외관, 거실, 주방, 침실, 욕실, 수납, 출입구 등" }) +
          fArea("사진 설명", function () {
            return img.caption;
          }, function (v) {
            img.caption = nn(v);
          }, { rows: 2, placeholder: "예: 싱크대와 수납장을 한쪽 벽에 모아 동선이 짧습니다." }) +
          fText("사진에 보이는 것 (화면을 볼 수 없는 분께 읽어 주는 글)", function () {
            return img.alt;
          }, function (v) {
            img.alt = String(v).trim();
          }, { placeholder: "예: 흰 외벽과 나무 데크가 있는 단층 이동식주택 정면" }) +
          opts +
          (img.isDesignExample ? fCheck("디자인 예시 사진 (실제 제품 사진이 아님)", function () {
            return img.isDesignExample;
          }, function (on) {
            img.isDesignExample = on || undefined;
          }) : "") +
          '<div class="arow__tools">' +
          (i > 0 ? btn("대표 사진으로", function () {
            p.images.unshift(p.images.splice(i, 1)[0]);
            changed(true);
          }) : "") +
          (i > 0 ? btn("앞으로", function () {
            var t = p.images[i - 1];
            p.images[i - 1] = p.images[i];
            p.images[i] = t;
            changed(true);
          }) : "") +
          btn("사진 빼기", function () {
            p.images.splice(i, 1);
            changed(true);
          }) +
          "</div></div></div>"
        );
      })
      .join("");
    return (
      (list || '<p class="text-soft">아직 사진이 없습니다.</p>') +
      '<label class="btn btn--outline afile">사진 올리기 (여러 장 가능)<input type="file" accept="image/jpeg,image/png,image/webp" multiple data-upload="photos"></label>' +
      '<p class="af__help mt-2">JPG·PNG 사진을 고르면 자동으로 알맞은 크기로 줄여서 올립니다. 아이폰 사진(HEIC)은 ‘가장 호환성 높은’ 형식으로 바꾼 뒤 올려 주세요.</p>'
    );
  }

  function sizeField(label, key, p, placeholder, basisPh) {
    var s = p.size;
    function get(k) {
      return s[key] ? s[key][k] : null;
    }
    function set(k, v) {
      var cur = s[key] || { value: null, basis: null };
      cur[k] = nn(v);
      s[key] = cur.value || cur.basis ? cur : null;
    }
    return (
      '<div class="af-pair">' +
      fText(label, function () {
        return get("value");
      }, function (v) {
        set("value", v);
      }, { placeholder: placeholder }) +
      fText("기준", function () {
        return get("basis");
      }, function (v) {
        set("basis", v);
      }, { placeholder: basisPh }) +
      "</div>"
    );
  }

  function editorHtml(p) {
    binds = [];
    acts = [];
    var saved = !!state.savedSlugs[p.slug];
    var catChoices = state.categories.map(function (c) {
      return [c.id, c.fullLabel];
    });

    var basic =
      fSelect("제품군", catChoices, function () {
        return p.category;
      }, function (v) {
        p.category = v;
        if (!saved && /^[a-z-]+-\d+$/.test(p.slug)) p.slug = newSlug(v);
      }, { refresh: true, rerender: !saved }) +
      fText("제품 이름", function () {
        return p.name;
      }, function (v) {
        p.name = String(v).trim();
      }, { required: true, refresh: true, help: "정식 모델명이 없으면 구성으로 적습니다. 예: 방 1개와 거실형", placeholder: "예: 방 2개형" }) +
      fText("주소 이름 (영문)", function () {
        return p.slug;
      }, function (v) {
        p.slug = String(v).trim().toLowerCase();
      }, {
        disabled: saved,
        help: saved ? "이미 저장된 제품이라 바꿀 수 없습니다." : "영문 소문자·숫자·하이픈만. 페이지 주소가 됩니다: products/" + esc(p.slug) + ".html",
      }) +
      fSelect("판매 여부", [[null, "확인 전"], ["on-sale", "판매 중"], ["discontinued", "판매 종료"]], function () {
        return p.availability;
      }, function (v) {
        p.availability = v;
      }) +
      fText("카드 한 줄 설명", function () {
        return p.summary;
      }, function (v) {
        p.summary = nn(v);
      }, { help: "제품 목록 카드에 보이는 짧은 설명", placeholder: "예: 침실과 거실을 나눈 구성" }) +
      fArea("특징 한 문장", function () {
        return p.tagline;
      }, function (v) {
        p.tagline = nn(v);
      }, { rows: 2, help: "상세 페이지 첫 화면 제목 아래 문장" }) +
      fText("공간 구성 요약", function () {
        return p.layoutSummary;
      }, function (v) {
        p.layoutSummary = nn(v);
      }, { placeholder: "예: 방 1 · 거실 · 주방 · 욕실" }) +
      fCheck("개발용 예시 데이터 (실제 제품으로 채운 뒤 체크를 해제하세요)", function () {
        return p.isExample;
      }, function (on) {
        p.isExample = on;
      });

    var ls = p.lifestyle;
    var life =
      fLines("이렇게 쓰시기 좋습니다", function () {
        return ls.fitsFor;
      }, function (a) {
        ls.fitsFor = a;
      }, { placeholder: "주말마다 머무는 세컨하우스\n텃밭 가까이에서 지내는 공간" }) +
      '<div class="af"><span class="af__label">공간을 이렇게 나눴습니다</span><span class="af__help">공간 구성과, 그래서 생활이 어떻게 편한지를 짝지어 적습니다.</span>' +
      rows(ls.layoutPoints, function (lp) {
        return (
          fText("공간 구성", function () {
            return lp.layout;
          }, function (v) {
            lp.layout = String(v).trim();
          }, { placeholder: "예: 현관 바로 옆에 주방" }) +
          fText("생활상의 장점", function () {
            return lp.benefit;
          }, function (v) {
            lp.benefit = String(v).trim();
          }, { placeholder: "예: 장 본 짐을 바로 정리할 수 있습니다." })
        );
      }, function () {
        return { layout: "", benefit: "" };
      }, "구성 추가") +
      "</div>" +
      fArea("다른 평면이 더 맞을 수 있는 경우", function () {
        return ls.otherPlanHint;
      }, function (v) {
        ls.otherPlanHint = nn(v);
      }, { rows: 2 }) +
      fLines("일반 설명 문단", function () {
        return ls.intro;
      }, function (a) {
        ls.intro = a;
      }, { help: "위 칸이 비어 있을 때 대신 보이는 설명입니다." });

    var plan =
      '<div class="af"><span class="af__label">평면도</span>' +
      (p.floorPlan
        ? '<div class="aphoto__img aphoto__img--plan"><img src="' + esc(imgSrc(p.floorPlan.src)) + '" alt="" data-placeholder="평면도 없음"></div>' +
          '<div class="arow__tools">' + btn("평면도 빼기", function () {
            p.floorPlan = null;
            changed(true);
          }) + "</div>"
        : '<p class="text-soft">평면도가 없습니다. 실제 도면만 올려 주세요.</p>') +
      '<label class="btn btn--outline afile mt-2">' + (p.floorPlan ? "평면도 바꾸기" : "평면도 올리기") +
      '<input type="file" accept="image/jpeg,image/png,image/webp" data-upload="plan"></label></div>' +
      sizeField("외형 크기", "exterior", p, "예: 가로 9m × 세로 3.6m × 높이 3.4m", "예: 외벽 바깥, 지붕 포함") +
      sizeField("실내 사용 면적", "interior", p, "예: 약 30㎡", "예: 벽 안쪽 바닥 면적") +
      sizeField("다락 (없으면 비움)", "loft", p, "", "예: 실내 면적에 포함하지 않음") +
      sizeField("데크 (없으면 비움)", "deck", p, "", "예: 선택 옵션, 실내 면적에 포함하지 않음") +
      '<div class="af"><span class="af__label">공간별 구성</span>' +
      rows(p.rooms, function (r) {
        return (
          fText("공간", function () {
            return r.name;
          }, function (v) {
            r.name = String(v).trim();
          }) +
          fText("설명", function () {
            return r.note;
          }, function (v) {
            r.note = nn(v);
          })
        );
      }, function () {
        return { name: "", note: null };
      }, "공간 추가") +
      "</div>";

    var specs = p.specGroups
      .map(function (g, gi) {
        return (
          '<div class="agroup">' +
          '<div class="agroup__head">' +
          fText("묶음 이름", function () {
            return g.group;
          }, function (v) {
            g.group = String(v).trim();
          }) +
          btn("묶음 삭제", function () {
            p.specGroups.splice(gi, 1);
            changed(true);
          }) +
          "</div>" +
          rows(g.items, function (it) {
            return (
              fText("항목", function () {
                return it.label;
              }, function (v) {
                it.label = String(v).trim();
              }) +
              fText("기본 제공 내용", function () {
                return it.value;
              }, function (v) {
                it.value = nn(v);
              }, { placeholder: "비워 두면 ‘상담 시 안내’" }) +
              fText("용어 풀이 (선택)", function () {
                return it.hint;
              }, function (v) {
                it.hint = nn(v) || undefined;
              })
            );
          }, function () {
            return { label: "", value: null };
          }, "항목 추가") +
          "</div>"
        );
      })
      .join("") +
      btn("+ 사양 묶음 추가", function () {
        p.specGroups.push({ group: "", items: [{ label: "", value: null }] });
        changed(true);
      });

    var options =
      rows(p.options, function (o) {
        o.cost = o.cost || { type: null, amount: null };
        return (
          fText("옵션 이름", function () {
            return o.name;
          }, function (v) {
            o.name = String(v).trim();
          }, { placeholder: "예: 데크", help: "사진에 이 옵션을 표시하려면 이름을 적은 뒤 사진 칸에서 체크하세요.", rerenderOnChange: true }) +
          fText("선택 범위", function () {
            return o.range;
          }, function (v) {
            o.range = nn(v);
          }) +
          fText("기본과의 차이", function () {
            return o.vsBase;
          }, function (v) {
            o.vsBase = nn(v);
          }) +
          fSelect("비용", [[null, "확인 전 (상담 시 안내)"], ["extra", "추가금"], ["quote", "별도 견적"]], function () {
            return o.cost.type;
          }, function (v) {
            o.cost.type = v;
          }) +
          fText("추가금 (원, 숫자만)", function () {
            return o.cost.amount;
          }, function (v) {
            var n = String(v).replace(/[^0-9]/g, "");
            o.cost.amount = n ? Number(n) : null;
          }, { inputmode: "numeric", placeholder: "추가금일 때만" }) +
          fSelect("제작기간 영향", [[null, "확인 전"], ["affects", "늘어날 수 있음"], ["none", "영향 없음"]], function () {
            return o.schedule;
          }, function (v) {
            o.schedule = v;
          })
        );
      }, function () {
        return { name: "", range: null, vsBase: null, cost: { type: null, amount: null }, schedule: null };
      }, "옵션 추가");

    var cz = p.customization;
    var custom =
      fLines("기본으로 제공하는 구성", function () {
        return cz.base;
      }, function (a) {
        cz.base = a;
      }) +
      fLines("비용·기간 검토가 필요한 개별 변경", function () {
        return cz.custom;
      }, function (a) {
        cz.custom = a;
      }, { placeholder: "방 개수·벽 위치처럼 구조와 배치를 바꾸는 요청" });

    var pr = p.price;
    var price =
      fSelect("가격 표시", [["consult", "가격 상담"], ["fixed", "정해진 가격"], ["from", "~원부터"]], function () {
        return pr.kind;
      }, function (v) {
        pr.kind = v;
      }) +
      fText("금액 (원, 숫자만)", function () {
        return pr.amount;
      }, function (v) {
        var n = String(v).replace(/[^0-9]/g, "");
        pr.amount = n ? Number(n) : null;
      }, { inputmode: "numeric", help: "‘가격 상담’이면 비워 둡니다.", placeholder: "예: 32000000" }) +
      fSelect("부가세", [[null, "확인 전 (상담 시 안내)"], ["included", "부가세 포함"], ["excluded", "부가세 별도"]], function () {
        return pr.vat;
      }, function (v) {
        pr.vat = v;
      }) +
      fText("가격 기준 사양", function () {
        return pr.appliesTo;
      }, function (v) {
        pr.appliesTo = nn(v);
      }, { placeholder: "예: 기본 사양 기준, 선택 옵션 제외" }) +
      '<div class="af"><span class="af__label">가격에 포함되는 범위</span><span class="af__help">모르면 ‘확인 전’으로 두세요. 화면에 ‘상담 시 안내’로 보입니다.</span>' +
      rows(p.costScope, function (s) {
        return (
          fText("항목", function () {
            return s.item;
          }, function (v) {
            s.item = String(v).trim();
          }) +
          fSelect("포함 여부", [[null, "확인 전"], ["included", "제품 가격에 포함"], ["excluded", "별도"]], function () {
            return s.status;
          }, function (v) {
            s.status = v;
          })
        );
      }, function () {
        return { item: "", status: null };
      }, "항목 추가") +
      "</div>" +
      fArea("제작 기간 안내", function () {
        return p.schedule.productionNote;
      }, function (v) {
        p.schedule.productionNote = nn(v);
      }, { rows: 2, help: "회사에서 확인한 내용만. ‘빠르면 2주’ 같은 문구는 조건과 함께 적습니다." }) +
      fArea("설치 현장 안내", function () {
        return p.schedule.siteNote;
      }, function (v) {
        p.schedule.siteNote = nn(v);
      }, { rows: 2 });

    var caseChecks = (GD.cases || [])
      .map(function (c) {
        return fCheck(esc(c.title), function () {
          return p.relatedCaseSlugs.indexOf(c.slug) >= 0;
        }, function (on) {
          p.relatedCaseSlugs = p.relatedCaseSlugs.filter(function (s) {
            return s !== c.slug;
          });
          if (on) p.relatedCaseSlugs.push(c.slug);
        });
      })
      .join("");

    var del = state.confirmDelete
      ? '<div class="adanger"><p><strong>‘' + esc(p.name || "이름 없는 제품") + "’을 삭제할까요?</strong> 저장해야 사이트에서 사라집니다.</p>" +
        btn("정말 삭제", function () {
          state.products.splice(state.selected, 1);
          state.selected = Math.max(0, state.selected - 1);
          state.confirmDelete = false;
          markDirty("products");
          renderAll();
        }, "btn--danger btn--sm") +
        btn("취소", function () {
          state.confirmDelete = false;
          renderEditor();
        }) +
        "</div>"
      : btn("이 제품 삭제", function () {
          state.confirmDelete = true;
          renderEditor();
        }, "btn--line btn--sm");

    return (
      '<div class="aeditor__head"><h2 class="h-sub">' + esc(p.name || "새 제품") + '</h2><p class="text-soft">' +
      esc(CAT_HINT[p.category] || p.category) + " · products/" + esc(p.slug) + ".html" + (saved ? "" : ' <span class="tag-dev">저장 전</span>') + "</p></div>" +
      fieldset("기본 정보", basic) +
      fieldset("사진", photosHtml(p), "첫 번째 사진이 대표 사진입니다. 실제 제품 사진만 올려 주세요.") +
      fieldset("어떤 생활을 위한 집인가요", life) +
      fieldset("평면과 크기", plan, "외형 크기, 실내 면적, 다락·데크는 서로 합치지 말고 따로 적고, 기준을 함께 적어 주세요.") +
      fieldset("기본 사양", specs, "비워 둔 칸은 화면에 ‘상담 시 안내’로 보입니다. 재료 이름만으로 성능을 보장하는 표현은 쓰지 마세요.") +
      fieldset("선택 옵션", options, "회사에서 승인한 옵션만 적습니다.") +
      fieldset("바꿀 수 있는 부분", custom) +
      fieldset("가격과 일정", price) +
      fieldset("관련 시공 사례", caseChecks || '<p class="text-soft">등록된 사례가 없습니다.</p>') +
      '<div class="aeditor__foot">' + del + "</div>"
    );
  }

  /* ───────── 제품군 설명 편집 ───────── */

  function categoriesHtml() {
    binds = [];
    acts = [];
    return (
      '<h2 class="h-sub">제품군 설명</h2><p class="text-soft mt-2">제품 안내 페이지의 분류 카드와, 메뉴에서 제품군을 눌렀을 때 맨 위에 보이는 설명입니다.</p>' +
      state.categories
        .map(function (c) {
          return fieldset(
            esc(c.fullLabel) + ' <span class="text-soft">(' + esc(c.id) + ")</span>",
            '<div class="af-pair">' +
              fText("메뉴 이름 (짧게)", function () {
                return c.label;
              }, function (v) {
                c.label = String(v).trim();
              }) +
              fText("제목 이름", function () {
                return c.fullLabel;
              }, function (v) {
                c.fullLabel = String(v).trim();
              }) +
              "</div>" +
              fText("규모", function () {
                return c.size;
              }, function (v) {
                c.size = nn(v);
              }, { placeholder: "예: 20㎡(약 6평) 이하" }) +
              fText("소개 한 줄", function () {
                return c.headline;
              }, function (v) {
                c.headline = nn(v);
              }) +
              fArea("설명", function () {
                return c.description;
              }, function (v) {
                c.description = String(v).trim();
              }, { rows: 4 }) +
              fArea("작은 글씨 참고 안내 (선택)", function () {
                return c.note;
              }, function (v) {
                c.note = nn(v);
              }, { rows: 2 })
          );
        })
        .join("") +
      '<p class="af__help mt-4">메뉴 이름을 바꿔도 상단 메뉴 글자는 data/site.js 에 따로 있어 바뀌지 않습니다. 필요하면 요청해 주세요.</p>'
    );
  }

  /* ───────── 화면 그리기 ───────── */

  function renderList() {
    var ul = $("#product-list");
    ul.innerHTML = state.products
      .map(function (p, i) {
        var cat = state.categories.filter(function (c) {
          return c.id === p.category;
        })[0];
        return (
          '<li><button type="button" class="admin-list__item' + (i === state.selected ? " is-on" : "") + '" data-pick="' + i + '"' +
          (i === state.selected ? ' aria-current="true"' : "") + ">" +
          '<span class="admin-list__name">' + esc(p.name || "새 제품 (이름 없음)") + "</span>" +
          '<span class="admin-list__meta">' + esc(cat ? cat.fullLabel : p.category) + (p.isExample ? " · 예시" : "") +
          (state.savedSlugs[p.slug] ? "" : " · 저장 전") + "</span></button></li>"
        );
      })
      .join("");
  }
  function renderEditor() {
    var box = $("#editor");
    var p = state.products[state.selected];
    if (!p) {
      box.innerHTML = '<p class="text-lg">제품이 없습니다. ‘새 제품 추가’를 눌러 시작하세요.</p>';
      return;
    }
    normalize(p);
    var y = window.scrollY;
    box.innerHTML = editorHtml(p);
    GD.checkBrokenImages(box);
    window.scrollTo(0, y);
  }
  function renderCategories() {
    $("#category-editor").innerHTML = categoriesHtml();
  }
  function currentTab() {
    var on = document.querySelector(".admin-tabs__btn.is-on");
    return on ? on.getAttribute("data-tab") : "products";
  }
  function renderAll() {
    if (currentTab() === "products") {
      renderList();
      renderEditor();
    } else {
      renderCategories();
    }
    updateSaveBar();
  }

  function markDirty(which) {
    if (which === "categories") state.dirtyCategories = true;
    else state.dirtyProducts = true;
    window.confirmLeave = false;
    updateSaveBar();
  }
  function changed(rerender) {
    markDirty(currentTab());
    if (rerender) renderAll();
  }
  function setSaveMsg(text, warn) {
    var m = $("#save-msg");
    m.textContent = text;
    m.classList.toggle("is-warn", !!warn);
  }
  function updateSaveBar() {
    var dirty = state.dirtyProducts || state.dirtyCategories;
    $("#save-btn").disabled = !dirty || state.saving;
    if (!state.saving) setSaveMsg(dirty ? "저장하지 않은 변경이 있습니다." : "변경 사항이 없습니다.");
  }

  /* ───────── 저장 ───────── */

  function validate() {
    var seen = {};
    for (var i = 0; i < state.products.length; i++) {
      var p = state.products[i];
      var label = p.name || i + 1 + "번째 제품";
      if (!p.name) return { i: i, msg: i + 1 + "번째 제품의 이름을 적어 주세요." };
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) return { i: i, msg: "‘" + label + "’의 주소 이름은 영문 소문자·숫자·하이픈만 쓸 수 있습니다." };
      if (seen[p.slug]) return { i: i, msg: "주소 이름 ‘" + p.slug + "’이 두 제품에 겹칩니다." };
      seen[p.slug] = true;
      if (p.price.kind !== "consult" && p.price.amount == null) return { i: i, msg: "‘" + label + "’의 가격 금액을 적거나 ‘가격 상담’으로 바꿔 주세요." };
      for (var k = 0; k < p.images.length; k++) {
        if (!p.images[k].alt) return { i: i, msg: "‘" + label + "’의 " + (k + 1) + "번째 사진에 ‘사진에 보이는 것’을 적어 주세요." };
      }
    }
    return null;
  }

  /** 저장할 때 빈 값 정리 */
  function cleanProduct(p) {
    var c = normalize(clone(p));
    c.lifestyle.layoutPoints = c.lifestyle.layoutPoints.filter(function (lp) {
      return lp.layout || lp.benefit;
    });
    c.rooms = c.rooms.filter(function (r) {
      return r.name;
    });
    c.options = c.options.filter(function (o) {
      return o.name;
    });
    c.costScope = c.costScope.filter(function (s) {
      return s.item;
    });
    c.specGroups.forEach(function (g) {
      g.items = g.items.filter(function (it) {
        return it.label;
      });
    });
    c.specGroups = c.specGroups.filter(function (g) {
      return g.group && g.items.length;
    });
    c.images.forEach(function (img) {
      if (!img.optionsShown) img.optionsShown = [];
    });
    if (!c.customization.base.length && !c.customization.custom.length) c.customization = null;
    return c;
  }

  function save() {
    if (state.saving) return;
    var bad = validate();
    if (bad) {
      if (currentTab() !== "products") switchTab("products");
      state.selected = bad.i;
      renderAll();
      setSaveMsg(bad.msg, true);
      return;
    }
    state.saving = true;
    $("#save-btn").disabled = true;
    setSaveMsg("저장하는 중입니다… 창을 닫지 마세요.");

    var files = [];
    var names = [];
    var checks = [];
    if (state.dirtyProducts) checks.push(PRODUCTS_PATH);
    if (state.dirtyCategories) checks.push(CATEGORIES_PATH);

    // 다른 곳(다른 기기, 개발 작업)에서 먼저 바뀌었는지 확인
    Promise.all(
      checks.map(function (path) {
        return gh("GET", repoPath("/contents/" + path + "?ref=" + REPO.branch)).then(function (j) {
          if (j.sha !== state.loadedSha[path]) {
            var e = new Error("changed");
            e.status = 409;
            throw e;
          }
        });
      })
    )
      .then(function () {
        var used = {};
        if (state.dirtyProducts) {
          var cleaned = state.products.map(cleanProduct);
          files.push({ path: PRODUCTS_PATH, b64: utf8ToB64(F.productsFile(cleaned)) });
          var present = {};
          cleaned.forEach(function (p) {
            present[p.slug] = true;
            p.images.forEach(function (img) {
              used[img.src] = true;
            });
            if (p.floorPlan) used[p.floorPlan.src] = true;
            if (!state.savedSlugs[p.slug]) {
              var cat = state.categories.filter(function (c) {
                return c.id === p.category;
              })[0];
              files.push({ path: "products/" + p.slug + ".html", b64: utf8ToB64(F.productPage(p, cat ? cat.fullLabel : "", siteVersion())) });
            }
            names.push(p.name);
          });
          // 이번에 목록에서 지운 제품의 페이지 파일만 지웁니다 (직접 만든 다른 파일은 건드리지 않음)
          Object.keys(state.loadedSlugs).forEach(function (slug) {
            if (!present[slug] && state.savedSlugs[slug]) files.push({ path: "products/" + slug + ".html", remove: true });
          });
          Object.keys(state.pending).forEach(function (path) {
            if (used[path]) files.push({ path: path, b64: state.pending[path] });
          });
        }
        if (state.dirtyCategories) files.push({ path: CATEGORIES_PATH, b64: utf8ToB64(F.categoriesFile(state.categories)) });

        var what = [];
        if (state.dirtyProducts) what.push("제품");
        if (state.dirtyCategories) what.push("제품군 설명");
        var current = state.products[state.selected];
        var msg = "관리자: " + what.join("·") + " 수정" + (state.dirtyProducts && current && current.name ? " (" + current.name + ")" : "");
        return commitFiles(files, msg);
      })
      .then(function () {
        return Promise.all(
          checks.map(function (path) {
            return gh("GET", repoPath("/contents/" + path + "?ref=" + REPO.branch)).then(function (j) {
              state.loadedSha[path] = j.sha;
            });
          })
        );
      })
      .then(function () {
        files.forEach(function (f) {
          var m = /^products\/(.+)\.html$/.exec(f.path);
          if (m) {
            if (f.remove) delete state.savedSlugs[m[1]];
            else state.savedSlugs[m[1]] = true;
          }
        });
        state.pending = {};
        state.loadedSlugs = {};
        state.products.forEach(function (p) {
          state.loadedSlugs[p.slug] = true;
        });
        state.dirtyProducts = false;
        state.dirtyCategories = false;
        state.saving = false;
        renderAll();
        setSaveMsg("저장했습니다. 1~10분 뒤 사이트에 반영됩니다.");
      })
      .catch(function (err) {
        state.saving = false;
        updateSaveBar();
        setSaveMsg("저장하지 못했습니다. " + friendly(err), true);
      });
  }

  /* ───────── 미리보기 ───────── */

  function openPreview() {
    var p = state.products[state.selected];
    if (!p) return;
    var copy = cleanProduct(normalize(p));
    copy.images.forEach(function (img) {
      img.src = imgSrc(img.src);
    });
    if (copy.floorPlan) copy.floorPlan.src = imgSrc(copy.floorPlan.src);
    if (!copy.name) copy.name = "새 제품";
    var realProducts = GD.products;
    var realCats = GD.categories;
    GD.products = [copy];
    GD.categories = state.categories;
    var main = $("#preview-main");
    main.setAttribute("data-slug", copy.slug);
    GD.renderProductDetail(main);
    GD.products = realProducts;
    GD.categories = realCats;
    // 미리보기 안의 링크는 사이트로 이동하지 않게 막습니다
    main.querySelectorAll("a[href]").forEach(function (a) {
      if (!/^#|^tel:/.test(a.getAttribute("href"))) a.setAttribute("data-preview-link", "1");
    });
    $("#preview").hidden = false;
    document.body.classList.add("no-scroll");
    GD.checkBrokenImages(main);
    $("#preview").querySelector("button").focus();
  }
  function closePreview() {
    $("#preview").hidden = true;
    document.body.classList.remove("no-scroll");
  }

  /* ───────── 이벤트 ───────── */

  function switchTab(tab) {
    document.querySelectorAll(".admin-tabs__btn").forEach(function (b) {
      var on = b.getAttribute("data-tab") === tab;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    document.querySelectorAll("[data-panel]").forEach(function (p) {
      p.hidden = p.getAttribute("data-panel") !== tab;
    });
    document.querySelector('[data-act-global="preview"]').hidden = tab !== "products";
    renderAll();
  }

  function onInput(e) {
    var el = e.target;
    if (!el.hasAttribute || !el.hasAttribute("data-b")) return;
    var b = binds[Number(el.getAttribute("data-b"))];
    if (!b) return;
    var v;
    if (el.type === "checkbox") v = el.checked;
    else if (el.tagName === "SELECT") v = JSON.parse(el.getAttribute("data-choices"))[Number(el.value)];
    else v = el.value;
    b.set(v);
    markDirty(currentTab());
    if (b.opts.refresh) renderList();
    if (b.opts.rerender) renderEditor();
  }

  function init() {
    var saved = null;
    try {
      saved = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch (e) {
      saved = null;
    }
    show("login");
    if (saved) connect(saved, !!localStorage.getItem(TOKEN_KEY));

    $("#token-connect").addEventListener("click", function () {
      var t = $("#token-input").value.trim();
      if (!t) {
        $("#login-msg").textContent = "토큰을 붙여 넣어 주세요.";
        return;
      }
      connect(t, $("#token-remember").checked);
    });
    $("#token-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") $("#token-connect").click();
    });

    document.addEventListener("input", onInput);
    document.addEventListener("change", function (e) {
      var el = e.target;
      // 옵션 이름처럼 다른 칸에 영향을 주는 글자는 입력을 마쳤을 때 화면을 다시 그립니다
      if (el.hasAttribute && el.hasAttribute("data-b")) {
        var bd = binds[Number(el.getAttribute("data-b"))];
        if (bd && bd.opts.rerenderOnChange) renderEditor();
        return;
      }
      if (el.hasAttribute && el.hasAttribute("data-upload")) {
        var p = state.products[state.selected];
        var kind = el.getAttribute("data-upload");
        var files = Array.prototype.slice.call(el.files || []);
        if (!files.length) return;
        setSaveMsg("사진을 준비하는 중입니다…");
        var chain = Promise.resolve();
        var failed = [];
        files.forEach(function (f, i) {
          chain = chain.then(function () {
            return prepareImage(f, p.slug, i + 1)
              .then(function (r) {
                if (kind === "plan") p.floorPlan = { src: r.src, alt: (p.name || "제품") + " 평면도", width: r.width, height: r.height };
                else p.images.push({ src: r.src, alt: "", width: r.width, height: r.height, space: null, caption: null, optionsShown: [] });
              })
              .catch(function (err) {
                failed.push(err.message);
              });
          });
        });
        chain.then(function () {
          markDirty("products");
          renderEditor();
          if (failed.length) setSaveMsg("열지 못한 사진이 있습니다: " + failed.join(", ") + " (JPG·PNG로 바꿔 올려 주세요)", true);
          else setSaveMsg("사진을 추가했습니다. 각 사진의 공간과 설명을 적은 뒤 저장하세요.");
        });
      }
    });

    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-act],[data-act-global],[data-pick],[data-tab],[data-preview-link]") : null;
      if (!t) return;
      if (t.hasAttribute("data-preview-link")) {
        e.preventDefault();
        return;
      }
      if (t.hasAttribute("data-act")) {
        var fn = acts[Number(t.getAttribute("data-act"))];
        if (fn) fn();
        return;
      }
      if (t.hasAttribute("data-pick")) {
        state.selected = Number(t.getAttribute("data-pick"));
        state.confirmDelete = false;
        renderAll();
        var ed = $("#editor");
        if (ed.getBoundingClientRect().top < 0 || window.innerWidth < 1024) ed.scrollIntoView();
        return;
      }
      if (t.hasAttribute("data-tab")) {
        switchTab(t.getAttribute("data-tab"));
        return;
      }
      var g = t.getAttribute("data-act-global");
      if (g === "logout") logout();
      if (g === "save") save();
      if (g === "preview") openPreview();
      if (g === "close-preview") closePreview();
      if (g === "add-product") {
        state.products.push(newProduct());
        state.selected = state.products.length - 1;
        state.confirmDelete = false;
        markDirty("products");
        renderAll();
        $("#editor").scrollIntoView();
        var first = $("#editor input[type=text]:not([disabled])");
        if (first) first.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("#preview").hidden && !document.querySelector("dialog[open]")) closePreview();
    });

    window.addEventListener("beforeunload", function (e) {
      if (state.dirtyProducts || state.dirtyCategories) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
