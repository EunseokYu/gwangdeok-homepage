/**
 * 관리자 페이지 (admin.html)
 *
 * - 제품 추가·수정·삭제, 사진·평면도 올리기, 제품군 설명 수정
 * - ‘저장’을 누르면 GitHub 저장소(main)에 한 번의 기록(커밋)으로 저장되고, GitHub Pages 가 사이트를 다시 만듭니다.
 * - 서버가 없으므로 GitHub 토큰(저장용 열쇠)으로 GitHub 에 직접 저장합니다.
 * - 토큰은 사용자가 정한 보안코드로 잠가(AES-GCM 암호화) data/admin-lock.json 에 저장합니다.
 *   보안코드는 어디에도 저장하지 않으며, 보안코드 없이는 토큰을 꺼낼 수 없습니다.
 *   토큰은 GitHub API 에만 사용하고 다른 곳으로 보내지 않습니다.
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
  var LOCK_PATH = "data/admin-lock.json";
  var KDF_ITERATIONS = 600000;

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
    if (!err.status && /ISO-8859-1|headers/i.test(err.message))
      return "토큰에 한글이나 다른 글자가 섞여 있습니다. GitHub 에서 복사한 github_pat_ 로 시작하는 글자만 다시 붙여 넣어 주세요.";
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

  /* ───────── 보안코드 잠금 (토큰 암호화) ───────── */

  function bytesToB64(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64ToBytes(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function deriveKey(code, salt, iterations) {
    return crypto.subtle
      .importKey("raw", new TextEncoder().encode(code.normalize("NFC")), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, [
          "encrypt",
          "decrypt",
        ]);
      });
  }
  function lockToken(token, code) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(code, salt, KDF_ITERATIONS)
      .then(function (key) {
        return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(token));
      })
      .then(function (buf) {
        return {
          v: 1,
          kdf: "PBKDF2-SHA256",
          iterations: KDF_ITERATIONS,
          salt: bytesToB64(salt),
          iv: bytesToB64(iv),
          data: bytesToB64(new Uint8Array(buf)),
          note: "광덕건업 관리자 페이지용 GitHub 토큰을 보안코드로 잠근 것입니다. 보안코드 없이는 풀 수 없습니다.",
        };
      });
  }
  function unlockToken(lock, code) {
    return deriveKey(code, b64ToBytes(lock.salt), lock.iterations)
      .then(function (key) {
        return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(lock.iv) }, key, b64ToBytes(lock.data));
      })
      .then(function (buf) {
        return new TextDecoder().decode(buf);
      });
  }
  /** GitHub 토큰 모양 확인 (영문·숫자·밑줄만, github_pat_ 또는 ghp_ 로 시작) */
  function checkToken(t) {
    if (/[^\x21-\x7E]/.test(t))
      return "토큰 칸에 한글이나 다른 글자가 들어 있습니다. 보안코드가 아니라, GitHub 에서 복사한 github_pat_ 로 시작하는 글자만 붙여 넣어 주세요.";
    if (!/^(github_pat_|ghp_)[A-Za-z0-9_]+$/.test(t))
      return "토큰 모양이 맞지 않습니다. GitHub 에서 복사한 github_pat_ 로 시작하는 글자 전체를 붙여 넣어 주세요.";
    return null;
  }

  /** 보안코드 규칙: 12자 이상, 숫자만으로 된 코드는 안 됨 */
  function checkNewCode(a, b) {
    if (!a || a.length < 12) return "보안코드는 12자 이상으로 만들어 주세요. (단어 4개 이상의 문장을 권합니다)";
    if (/^[0-9\s]+$/.test(a)) return "숫자만으로 된 보안코드는 쉽게 풀립니다. 글자를 섞어 주세요.";
    if (a !== b) return "두 번 입력한 보안코드가 서로 다릅니다.";
    return null;
  }
  function saveLock(code) {
    return lockToken(state.token, code).then(function (lock) {
      return commitFiles([{ path: LOCK_PATH, b64: utf8ToB64(JSON.stringify(lock, null, 2) + "\n") }], "관리자: 보안코드 설정");
    });
  }
  function loadLock() {
    return fetch(LOCK_PATH + "?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .catch(function () {
        return null;
      });
  }

  /* ───────── 연결 ───────── */

  function connect(token, msg) {
    state.token = token;
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
        // 이 탭을 닫기 전까지는 새로고침해도 다시 묻지 않습니다 (탭을 닫으면 지워짐)
        try {
          sessionStorage.setItem(TOKEN_KEY, token);
        } catch (e) {
          /* 저장 공간을 쓸 수 없으면 이번 화면에서만 사용 */
        }
        msg.textContent = "";
        show("connected");
        state.selected = 0;
        takeSnapshot();
        renderAll();
        return true;
      })
      .catch(function (err) {
        state.token = null;
        msg.textContent = friendly(err);
        return false;
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
  function filled(v) {
    return v != null && String(v).trim() !== "";
  }
  function help(t) {
    return t ? '<span class="af__help">' + t + "</span>" : "";
  }
  function num(v) {
    var n = String(v == null ? "" : v).replace(/[^0-9]/g, "");
    return n ? Number(n) : null;
  }
  function won(n) {
    return n == null ? "" : Number(n).toLocaleString("ko-KR") + "원";
  }
  /** "약 33㎡" → "약 10평" */
  function pyeong(text) {
    var m = /([\d.]+)\s*(㎡|m²|m2|제곱미터)/.exec(text || "");
    return m ? "약 " + Math.round((parseFloat(m[1]) / 3.3058) * 10) / 10 + "평" : "";
  }

  /** 한 줄 글자 */
  function fText(label, get, set, o) {
    o = o || {};
    var id = bind(get, set, o);
    return (
      '<label class="af' + (o.cls ? " " + o.cls : "") + '"><span class="af__label">' + label + (o.required ? ' <em class="af__req">필수</em>' : "") + "</span>" +
      help(o.help) +
      '<input type="text" data-b="' + id + '" value="' + esc(get() == null ? "" : get()) + '"' +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + (o.disabled ? " disabled" : "") +
      (o.inputmode ? ' inputmode="' + o.inputmode + '"' : "") + (o.list ? ' list="' + o.list + '"' : "") + ">" +
      (o.after || "") + "</label>"
    );
  }
  /** 여러 줄 글자 (count: 글자 수 표시 [최소, 최대]) */
  function fArea(label, get, set, o) {
    o = o || {};
    var id = bind(get, set, o);
    var v = get() == null ? "" : String(get());
    return (
      '<label class="af' + (o.cls ? " " + o.cls : "") + '"><span class="af__label">' + label + (o.required ? ' <em class="af__req">필수</em>' : "") + "</span>" + help(o.help) +
      '<textarea rows="' + (o.rows || 3) + '" data-b="' + id + '"' + (o.count ? ' data-count="' + o.count.join(",") + '"' : "") +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + ">" + esc(v) + "</textarea>" +
      (o.count ? '<span class="af__count" data-count-for="' + id + '">' + countText(v.length, o.count) + "</span>" : "") +
      "</label>"
    );
  }
  function countText(n, range) {
    var tip = n === 0 ? "" : n < range[0] ? " · 조금 더 적어도 좋아요" : n > range[1] ? " · 조금 줄여 주세요" : " · 알맞아요";
    return n + "자 (권장 " + range[0] + "~" + range[1] + "자)" + tip;
  }
  /** 한 줄에 하나씩 쓰는 목록 */
  function fLines(label, getArr, setArr, o) {
    o = o || {};
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
      Object.assign({ rows: 3 }, o, { help: (o.help ? o.help + " " : "") + "한 줄에 하나씩 적습니다." })
    );
  }
  /** 버튼처럼 생긴 하나 고르기 */
  function fRadio(label, choices, get, set, o) {
    o = o || {};
    var id = bind(get, set, o);
    var cur = get();
    var name = "r" + id + "-" + Math.random().toString(36).slice(2, 7);
    var values = esc(JSON.stringify(choices.map(function (c) {
      return c[0];
    })));
    return (
      '<fieldset class="af af-radio"><legend class="af__label">' + label + "</legend>" + help(o.help) +
      '<div class="af-radio__opts">' +
      choices
        .map(function (c, i) {
          return (
            '<label class="af-radio__opt"><input type="radio" name="' + name + '" value="' + i + '" data-b="' + id + '" data-choices="' + values + '"' +
            (c[0] === cur ? " checked" : "") + "><span>" + esc(c[1]) + "</span></label>"
          );
        })
        .join("") +
      "</div></fieldset>"
    );
  }
  /** 목록에서 고르기 */
  function fSelect(label, choices, get, set, o) {
    o = o || {};
    var id = bind(get, set, o);
    var cur = get();
    var values = esc(JSON.stringify(choices.map(function (c) {
      return c[0];
    })));
    return (
      '<label class="af' + (o.cls ? " " + o.cls : "") + '"><span class="af__label">' + label + "</span>" + help(o.help) +
      '<select data-b="' + id + '" data-choices="' + values + '">' +
      choices
        .map(function (c, i) {
          return '<option value="' + i + '"' + (c[0] === cur ? " selected" : "") + ">" + esc(c[1]) + "</option>";
        })
        .join("") +
      "</select></label>"
    );
  }
  function fCheck(label, get, set, o) {
    var id = bind(get, set, o);
    return '<label class="af-check"><input type="checkbox" data-b="' + id + '"' + (get() ? " checked" : "") + "><span>" + label + "</span></label>";
  }
  function btn(label, fn, cls, attrs) {
    return '<button type="button" class="btn ' + (cls || "btn--outline btn--sm") + '" data-act="' + act(fn) + '"' + (attrs || "") + ">" + label + "</button>";
  }

  /* ───────── 제품 기본값 ───────── */

  var SPACES = ["외관", "거실", "주방", "침실", "욕실", "다락", "데크", "현관", "수납", "창호", "디테일"];

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
  function newProduct(category) {
    var cat = category || (state.categories[0] && state.categories[0].id) || "mobile-home";
    return {
      slug: newSlug(cat),
      category: cat,
      name: "",
      availability: null,
      summary: null,
      tagline: null,
      shortDescription: null,
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
    p.options.forEach(function (o) {
      o.cost = o.cost || { type: null, amount: null };
    });
    p.customization = p.customization || { base: [], custom: [] };
    p.customization.base = p.customization.base || [];
    p.customization.custom = p.customization.custom || [];
    p.price = p.price || { kind: "consult", amount: null, vat: null, appliesTo: null };
    p.costScope = p.costScope || [];
    p.schedule = p.schedule || { productionNote: null, siteNote: null };
    p.relatedCaseSlugs = p.relatedCaseSlugs || [];
    if (!("shortDescription" in p)) p.shortDescription = null;
    return p;
  }
  function imgSrc(src) {
    return state.previews[src] || src;
  }
  function catOf(p) {
    return (
      state.categories.filter(function (c) {
        return c.id === p.category;
      })[0] || { id: p.category, label: p.category, fullLabel: p.category }
    );
  }

  /* ───────── 공개 준비도 (무엇이 비었는지) ───────── */

  function readiness(p) {
    normalize(p);
    var price = p.price;
    var priced = price.kind !== "consult";
    var realPhotos = p.images.filter(function (i) {
      return !i.isDesignExample;
    });
    var specCount = 0;
    p.specGroups.forEach(function (g) {
      (g.items || []).forEach(function (it) {
        if (filled(it.value) && !/예시/.test(it.value)) specCount++;
      });
    });
    var ex = function (v) {
      return filled(v) && !/예시|○/.test(v);
    };
    return [
      { sec: "basic", label: "제품 이름", ok: ex(p.name) },
      { sec: "basic", label: "판매 여부", ok: p.availability != null },
      { sec: "basic", label: "공간 구성 요약", ok: ex(p.layoutSummary) },
      { sec: "intro", label: "한 문장 소개", ok: ex(p.tagline) },
      { sec: "intro", label: "짧은 소개", ok: ex(p.shortDescription) },
      { sec: "photos", label: "실제 사진 1장 이상", ok: realPhotos.length > 0 },
      {
        sec: "photos",
        label: "모든 사진에 공간 이름",
        ok: p.images.length > 0 && p.images.every(function (i) {
          return filled(i.space);
        }),
      },
      { sec: "plan", label: "외형 크기", ok: !!(p.size.exterior && ex(p.size.exterior.value)) },
      { sec: "plan", label: "실내 면적", ok: !!(p.size.interior && ex(p.size.interior.value)) },
      { sec: "specs", label: "기본 사양 3개 이상", ok: specCount >= 3 },
      { sec: "price", label: priced ? "가격 금액" : "가격 (가격 상담)", ok: !priced || price.amount != null },
      { sec: "price", label: "부가세 포함 여부", ok: !priced || price.vat != null },
      {
        sec: "price",
        label: "가격 포함 범위 확인",
        ok: p.costScope.length > 0 && p.costScope.every(function (s) {
          return s.status != null;
        }),
      },
      { sec: "basic", label: "‘예시 데이터’ 체크 해제", ok: !p.isExample },
    ];
  }
  function readyScore(p) {
    var r = readiness(p);
    var ok = r.filter(function (x) {
      return x.ok;
    }).length;
    return { ok: ok, total: r.length, list: r };
  }

  /** 입력할 때마다 화면 전체를 다시 그리지 않고, 준비도·배지·목록만 고칩니다 */
  function updateStatus() {
    var p = state.products[state.selected];
    if (!p || currentTab() !== "products") return;
    var sc = readyScore(p);
    var box = $("#ready-box");
    if (box) {
      box.innerHTML =
        '<p class="aready__title">공개 준비 <strong>' + sc.ok + " / " + sc.total + "</strong>" +
        (sc.ok === sc.total ? ' <span class="aready__done">공개할 준비가 됐습니다</span>' : "") + "</p>" +
        '<div class="aready__bar"><span style-width="' + Math.round((sc.ok / sc.total) * 100) + '"></span></div>' +
        '<ul class="aready__list">' +
        sc.list
          .map(function (x) {
            return (
              '<li class="' + (x.ok ? "is-ok" : "is-todo") + '"><button type="button" class="aready__item" data-goto="' + x.sec + '">' +
              (x.ok ? "✓ " : "○ ") + esc(x.label) + "</button></li>"
            );
          })
          .join("") +
        "</ul>";
      var bar = box.querySelector(".aready__bar span");
      if (bar) bar.style.width = bar.getAttribute("style-width") + "%";
    }
    ["basic", "intro", "photos", "plan", "specs", "price"].forEach(function (sec) {
      var b = document.querySelector('[data-badge="' + sec + '"]');
      if (!b) return;
      var items = sc.list.filter(function (x) {
        return x.sec === sec;
      });
      var ok = items.filter(function (x) {
        return x.ok;
      }).length;
      b.textContent = ok + " / " + items.length;
      b.classList.toggle("is-done", ok === items.length);
    });
    renderList();
  }

  /* ───────── 사진 ───────── */

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

  function addFiles(files, kind) {
    var p = state.products[state.selected];
    if (!p || !files.length) return;
    setSaveMsg("사진을 준비하는 중입니다…");
    var chain = Promise.resolve();
    var failed = [];
    var added = 0;
    files.forEach(function (f, i) {
      chain = chain.then(function () {
        return prepareImage(f, p.slug, i + 1)
          .then(function (r) {
            added++;
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
      state.openSecs[kind === "plan" ? "plan" : "photos"] = true;
      renderEditor();
      if (failed.length) setSaveMsg("열지 못한 사진이 있습니다: " + failed.join(", ") + " (JPG·PNG로 바꿔 올려 주세요)", true);
      else setSaveMsg("사진 " + added + "장을 추가했습니다. 각 사진의 공간을 고른 뒤 저장하세요.");
    });
  }

  function dropZone(kind, label) {
    return (
      '<label class="adrop" data-drop="' + kind + '"><input type="file" accept="image/jpeg,image/png,image/webp"' + (kind === "plan" ? "" : " multiple") +
      ' data-upload="' + kind + '"><span class="adrop__big">' + label + '</span><span class="adrop__small">눌러서 고르거나, 사진 파일을 여기로 끌어다 놓으세요. 큰 사진은 자동으로 줄입니다.</span></label>'
    );
  }

  function photosHtml(p) {
    var optionNames = p.options
      .map(function (o) {
        return o.name;
      })
      .filter(Boolean);
    var cards = p.images
      .map(function (img, i) {
        var opts = optionNames.length
          ? '<div class="af"><span class="af__label">사진에 들어간 선택 옵션</span><span class="af__help">기본 가격에 없는 것이 사진에 보이면 체크하세요.</span><div class="af-checks">' +
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
          : "";
        return (
          '<li class="aphoto2">' +
          '<div class="aphoto2__img"><img src="' + esc(imgSrc(img.src)) + '" alt="" data-placeholder="사진 없음">' +
          (i === 0 ? '<span class="aphoto__badge">대표 사진</span>' : "") +
          (img.isDesignExample ? '<span class="aphoto__badge aphoto__badge--warn">디자인 예시</span>' : "") +
          "</div>" +
          '<div class="aphoto2__tools">' +
          (i > 0 ? btn("◀ 앞으로", function () {
            var t = p.images[i - 1];
            p.images[i - 1] = p.images[i];
            p.images[i] = t;
            changed(true);
          }) : "") +
          (i < p.images.length - 1 ? btn("뒤로 ▶", function () {
            var t = p.images[i + 1];
            p.images[i + 1] = p.images[i];
            p.images[i] = t;
            changed(true);
          }) : "") +
          (i > 0 ? btn("대표 사진으로", function () {
            p.images.unshift(p.images.splice(i, 1)[0]);
            changed(true);
          }) : "") +
          btn("빼기", function () {
            p.images.splice(i, 1);
            changed(true);
          }, "btn--line btn--sm") +
          "</div>" +
          fText("공간", function () {
            return img.space;
          }, function (v) {
            img.space = nn(v);
          }, { list: "space-list", placeholder: "외관, 거실, 주방…", help: "갤러리 사진 밑에 보이는 이름" }) +
          fArea("크게 볼 때 나오는 설명 (선택)", function () {
            return img.caption;
          }, function (v) {
            img.caption = nn(v);
          }, { rows: 2, placeholder: "예: 싱크대와 수납장을 한쪽 벽에 모아 동선이 짧습니다." }) +
          opts +
          (img.isDesignExample
            ? fCheck("디자인 예시 사진 (실제 제품 사진이 아님)", function () {
                return img.isDesignExample;
              }, function (on) {
                img.isDesignExample = on || undefined;
              })
            : "") +
          "</li>"
        );
      })
      .join("");
    return (
      (cards ? '<ul class="aphotos">' + cards + "</ul>" : '<p class="aempty">아직 사진이 없습니다.</p>') +
      dropZone("photos", "+ 사진 올리기 (여러 장 가능)") +
      '<p class="af__help mt-2">순서: 첫 사진이 대표 사진, 갤러리는 외관 → 거실 → 주방 → 침실 → 욕실 순으로 자동 정렬됩니다. 아이폰 사진(HEIC)은 ‘가장 호환성 높은’ 형식으로 바꿔 올려 주세요.</p>'
    );
  }

  /* ───────── 칸 묶음 ───────── */

  function section(id, title, desc, inner, badge) {
    var open = state.openSecs[id];
    return (
      '<details class="asec" id="sec-' + id + '" data-sec="' + id + '"' + (open ? " open" : "") + ">" +
      '<summary class="asec__head"><span class="asec__title">' + title + "</span>" +
      (badge ? '<span class="asec__badge" data-badge="' + id + '"></span>' : '<span class="asec__badge asec__badge--opt">선택</span>') +
      "</summary>" +
      '<div class="asec__body">' + (desc ? '<p class="asec__desc">' + desc + "</p>" : "") + inner + "</div></details>"
    );
  }

  function sizeRow(label, key, p, ph, basisPh, showPy) {
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
      '<div class="asize">' +
      fText(label, function () {
        return get("value");
      }, function (v) {
        set("value", v);
      }, { placeholder: ph, pyeong: showPy, after: showPy ? '<span class="af__py" data-py>' + esc(pyeong(get("value"))) + "</span>" : "" }) +
      fText("어떤 기준으로 잰 값인가요", function () {
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
    var cat = catOf(p);

    /* 1. 기본 정보 */
    var basic =
      '<div class="agrid">' +
      fSelect("제품군", state.categories.map(function (c) {
        return [c.id, c.fullLabel];
      }), function () {
        return p.category;
      }, function (v) {
        p.category = v;
        if (!saved && /^[a-z-]+-\d+$/.test(p.slug)) p.slug = newSlug(v);
      }, { rerender: true }) +
      fText("제품 이름", function () {
        return p.name;
      }, function (v) {
        p.name = String(v).trim();
      }, { required: true, placeholder: "예: 방 2개형", help: "모델명이 없으면 구성으로 적습니다." }) +
      fRadio("판매 여부", [[null, "확인 전"], ["on-sale", "판매 중"], ["discontinued", "판매 종료"]], function () {
        return p.availability;
      }, function (v) {
        p.availability = v;
      }) +
      fText("공간 구성 요약", function () {
        return p.layoutSummary;
      }, function (v) {
        p.layoutSummary = nn(v);
      }, { placeholder: "예: 방 1 · 거실 · 주방 · 욕실", help: "소개의 ‘구성’ 칸에 보입니다." }) +
      fText("제품 목록 카드의 한 줄 (선택)", function () {
        return p.summary;
      }, function (v) {
        p.summary = nn(v);
      }, { placeholder: "예: 침실과 거실을 나눈 구성" }) +
      fText("주소 이름 (영문)", function () {
        return p.slug;
      }, function (v) {
        p.slug = String(v).trim().toLowerCase();
      }, { disabled: saved, help: saved ? "저장된 제품이라 바꿀 수 없습니다." : "영문 소문자·숫자·하이픈. 저장 후에는 바꿀 수 없습니다." }) +
      "</div>" +
      fCheck("개발용 예시 데이터 — 실제 내용으로 채운 뒤 체크를 해제하세요", function () {
        return p.isExample;
      }, function (on) {
        p.isExample = on;
      });

    /* 2. 소개 문구 */
    var intro =
      fArea("한 문장 소개 (큰 글씨)", function () {
        return p.tagline;
      }, function (v) {
        p.tagline = nn(v);
      }, { rows: 2, required: true, count: [10, 40], placeholder: "예: 텃밭을 돌보고, 편히 쉬어 가는 작은 공간.", help: "어떤 생활에 어울리는 집인지 한 문장으로." }) +
      fArea("짧은 소개 (2~3문장)", function () {
        return p.shortDescription;
      }, function (v) {
        p.shortDescription = nn(v);
      }, { rows: 4, required: true, count: [80, 140], help: "누가 어떤 상황에 쓰기 좋은지 + 공간 구성의 장점 한두 가지. 농막은 숙박·주거 용도로 쓰지 마세요." });

    /* 4. 평면과 크기 */
    var plan =
      '<div class="af"><span class="af__label">평면도</span>' +
      (p.floorPlan
        ? '<div class="aphoto2__img aphoto2__img--plan"><img src="' + esc(imgSrc(p.floorPlan.src)) + '" alt="" data-placeholder="평면도 없음"></div>' +
          '<div class="aphoto2__tools">' + btn("평면도 빼기", function () {
            p.floorPlan = null;
            changed(true);
          }, "btn--line btn--sm") + "</div>"
        : "") +
      dropZone("plan", p.floorPlan ? "평면도 바꾸기" : "+ 평면도 올리기") +
      '<span class="af__help">실제 도면만 올려 주세요. 없으면 사이트에 ‘준비 중’ 한 줄만 보입니다.</span></div>' +
      sizeRow("외형 크기", "exterior", p, "예: 가로 9m × 세로 3.6m × 높이 3.4m", "예: 외벽 바깥, 지붕 포함") +
      sizeRow("실내 면적", "interior", p, "예: 약 30㎡", "예: 벽 안쪽 바닥 면적", true) +
      sizeRow("다락 (없으면 비움)", "loft", p, "예: 약 8㎡", "예: 실내 면적에 포함하지 않음", true) +
      sizeRow("데크 (없으면 비움)", "deck", p, "예: 약 10㎡", "예: 선택 옵션, 실내 면적에 포함하지 않음", true) +
      fText("공간 목록 (선택)", function () {
        return p.rooms
          .map(function (r) {
            return r.name;
          })
          .join(", ");
      }, function (v) {
        p.rooms = String(v)
          .split(/[,·]/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
          .map(function (name) {
            return { name: name, note: null };
          });
      }, { placeholder: "예: 거실, 주방, 침실, 욕실", help: "쉼표로 나눠 적습니다." });

    /* 5. 기본 사양 */
    var specs = p.specGroups
      .map(function (g, gi) {
        return (
          '<div class="aspec">' +
          '<div class="aspec__head"><input type="text" class="aspec__name" data-b="' + bind(function () {
            return g.group;
          }, function (v) {
            g.group = String(v).trim();
          }) + '" value="' + esc(g.group) + '" aria-label="사양 묶음 이름">' +
          btn("묶음 삭제", function () {
            p.specGroups.splice(gi, 1);
            changed(true);
          }, "btn--line btn--sm") + "</div>" +
          '<div class="aspec__rows">' +
          (g.items || [])
            .map(function (it, ii) {
              return (
                '<div class="aspec__row">' +
                fText("항목", function () {
                  return it.label;
                }, function (v) {
                  it.label = String(v).trim();
                }, { cls: "af--s" }) +
                fText("기본으로 들어가는 것", function () {
                  return it.value;
                }, function (v) {
                  it.value = nn(v);
                }, { cls: "af--l", placeholder: "비워 두면 사이트에 안 보임" }) +
                fText("쉬운 풀이 (선택)", function () {
                  return it.hint;
                }, function (v) {
                  it.hint = nn(v) || undefined;
                }, { cls: "af--m" }) +
                btn("✕", function () {
                  g.items.splice(ii, 1);
                  changed(true);
                }, "btn--line btn--sm aspec__del", ' aria-label="이 항목 삭제"') +
                "</div>"
              );
            })
            .join("") +
          "</div>" +
          btn("+ 항목 추가", function () {
            g.items.push({ label: "", value: null });
            changed(true);
          }) +
          "</div>"
        );
      })
      .join("") +
      btn("+ 사양 묶음 추가", function () {
        p.specGroups.push({ group: "새 묶음", items: [{ label: "", value: null }] });
        changed(true);
      });

    /* 6. 선택 옵션 */
    var options =
      (p.options.length
        ? '<ul class="aopts">' +
          p.options
            .map(function (o, i) {
              return (
                '<li class="aopt">' +
                '<div class="agrid">' +
                fText("옵션 이름", function () {
                  return o.name;
                }, function (v) {
                  o.name = String(v).trim();
                }, { placeholder: "예: 데크", rerenderOnChange: true }) +
                fText("선택할 수 있는 범위", function () {
                  return o.range;
                }, function (v) {
                  o.range = nn(v);
                }, { placeholder: "예: 현관 앞 크기 협의" }) +
                "</div>" +
                fRadio("비용", [[null, "상담 시 안내"], ["extra", "정해진 추가금"], ["quote", "별도 견적"]], function () {
                  return o.cost.type;
                }, function (v) {
                  o.cost.type = v;
                }, { rerender: true }) +
                (o.cost.type === "extra"
                  ? fText("추가금 (숫자만)", function () {
                      return o.cost.amount;
                    }, function (v) {
                      o.cost.amount = num(v);
                    }, { inputmode: "numeric", placeholder: "예: 1500000", after: '<span class="af__py" data-won>' + esc(won(o.cost.amount)) + "</span>" })
                  : "") +
                fRadio("제작 기간에 영향", [[null, "모름"], ["affects", "늘어날 수 있음"], ["none", "영향 없음"]], function () {
                  return o.schedule;
                }, function (v) {
                  o.schedule = v;
                }) +
                '<div class="aphoto2__tools">' +
                (i > 0 ? btn("위로", function () {
                  var t = p.options[i - 1];
                  p.options[i - 1] = p.options[i];
                  p.options[i] = t;
                  changed(true);
                }) : "") +
                btn("옵션 삭제", function () {
                  p.options.splice(i, 1);
                  changed(true);
                }, "btn--line btn--sm") +
                "</div></li>"
              );
            })
            .join("") +
          "</ul>"
        : '<p class="aempty">등록된 옵션이 없습니다. 없으면 사이트에 ‘상담 시 안내’로 보입니다.</p>') +
      btn("+ 옵션 추가", function () {
        p.options.push({ name: "", range: null, vsBase: null, cost: { type: null, amount: null }, schedule: null });
        changed(true);
      });

    /* 7. 가격·제작·설치 */
    var pr = p.price;
    var price =
      fRadio("가격 표시", [["consult", "가격 상담"], ["fixed", "정해진 가격"], ["from", "~원부터"]], function () {
        return pr.kind;
      }, function (v) {
        pr.kind = v;
      }, { rerender: true }) +
      (pr.kind !== "consult"
        ? '<div class="agrid">' +
          fText("금액 (숫자만)", function () {
            return pr.amount;
          }, function (v) {
            pr.amount = num(v);
          }, { inputmode: "numeric", placeholder: "예: 32000000", after: '<span class="af__py" data-won>' + esc(won(pr.amount)) + "</span>" }) +
          fText("어떤 사양 기준 가격인가요", function () {
            return pr.appliesTo;
          }, function (v) {
            pr.appliesTo = nn(v);
          }, { placeholder: "예: 기본 사양 기준, 선택 옵션 제외" }) +
          "</div>" +
          fRadio("부가세", [[null, "모름"], ["included", "포함"], ["excluded", "별도"]], function () {
            return pr.vat;
          }, function (v) {
            pr.vat = v;
          })
        : "") +
      '<div class="af"><span class="af__label">제품 가격에 들어가나요?</span><span class="af__help">모르면 ‘현장 확인’으로 두세요. 사이트에 ‘현장 확인 후 안내’로 보입니다.</span>' +
      '<div class="ascope">' +
      p.costScope
        .map(function (s, i) {
          return (
            '<div class="ascope__row">' +
            fText("항목", function () {
              return s.item;
            }, function (v) {
              s.item = String(v).trim();
            }, { cls: "af--s" }) +
            fRadio("포함 여부", [["included", "포함"], ["excluded", "별도"], [null, "현장 확인"]], function () {
              return s.status;
            }, function (v) {
              s.status = v;
            }) +
            btn("✕", function () {
              p.costScope.splice(i, 1);
              changed(true);
            }, "btn--line btn--sm", ' aria-label="이 항목 삭제"') +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      btn("+ 항목 추가", function () {
        p.costScope.push({ item: "", status: null });
        changed(true);
      }) +
      "</div>" +
      fArea("제작 기간 (확인된 것만, 선택)", function () {
        return p.schedule.productionNote;
      }, function (v) {
        p.schedule.productionNote = nn(v);
      }, { rows: 2, placeholder: "예: 보통 4~6주. 자재 상황에 따라 달라집니다.", help: "‘빠르면 2주’ 같은 문구는 조건과 함께 적어 주세요." }) +
      fArea("설치 현장 안내 (선택)", function () {
        return p.schedule.siteNote;
      }, function (v) {
        p.schedule.siteNote = nn(v);
      }, { rows: 2, placeholder: "예: 크레인 진입이 가능한 도로 폭이 필요합니다." });

    /* 8. 시공 사례 */
    var caseChecks = (GD.cases || [])
      .map(function (c) {
        return fCheck(esc(c.title) + (c.isExample ? ' <span class="text-soft">(예시 — 사이트에 안 보임)</span>' : ""), function () {
          return p.relatedCaseSlugs.indexOf(c.slug) >= 0;
        }, function (on) {
          p.relatedCaseSlugs = p.relatedCaseSlugs.filter(function (s) {
            return s !== c.slug;
          });
          if (on) p.relatedCaseSlugs.push(c.slug);
        });
      })
      .join("");

    /* 9. 보관용 (사이트에 지금은 안 보임) */
    var ls = p.lifestyle;
    var archive =
      fLines("이렇게 쓰시기 좋습니다", function () {
        return ls.fitsFor;
      }, function (a) {
        ls.fitsFor = a;
      }) +
      fArea("다른 평면이 더 맞는 경우", function () {
        return ls.otherPlanHint;
      }, function (v) {
        ls.otherPlanHint = nn(v);
      }, { rows: 2 }) +
      fLines("예전 설명 문단 (짧은 소개가 비었을 때 대신 보임)", function () {
        return ls.intro;
      }, function (a) {
        ls.intro = a;
      });

    var head =
      '<div class="aedit-head">' +
      '<div><p class="aedit-head__cat">' + esc(cat.fullLabel) + (saved ? "" : ' <span class="tag-dev">아직 저장 안 됨</span>') + (p.isExample ? ' <span class="tag-dev">예시 데이터</span>' : "") + "</p>" +
      '<h2 class="aedit-head__name">' + esc(p.name || "새 제품") + "</h2></div>" +
      '<div class="aedit-head__actions">' +
      '<button type="button" class="btn btn--outline btn--sm" data-act-global="preview">미리보기</button>' +
      (saved ? '<a class="btn btn--outline btn--sm" href="products/' + esc(p.slug) + '.html" target="_blank" rel="noopener">사이트에서 보기</a>' : "") +
      btn("복제", function () {
        var c = clone(p);
        c.slug = newSlug(c.category);
        c.name = (p.name || "제품") + " (복사본)";
        state.products.splice(state.selected + 1, 0, c);
        state.selected++;
        markDirty("products");
        renderAll();
        setSaveMsg("복사본을 만들었습니다. 이름과 내용을 고친 뒤 저장하세요.");
      }) +
      "</div></div>" +
      '<div class="aready" id="ready-box"></div>';

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
      head +
      section("basic", "1. 기본 정보", null, basic, true) +
      section("intro", "2. 소개 문구", "대표 사진 바로 아래 보이는 글입니다. 짧을수록 잘 읽힙니다.", intro, true) +
      section("photos", "3. 사진", "첫 사진이 대표 사진입니다. 실제 제품 사진만 올려 주세요.", photosHtml(p), true) +
      section("plan", "4. 평면과 크기", "외형·실내·다락·데크는 서로 합치지 말고 따로 적어 주세요. ㎡로 적으면 평은 자동으로 계산됩니다.", plan, true) +
      section("specs", "5. 기본 사양", "기본 가격에 들어가는 것만 적습니다. 비운 칸은 사이트에 보이지 않습니다. ‘단열 우수’ 같은 성능 표현은 근거가 있을 때만.", specs, true) +
      section("options", "6. 선택 옵션", "회사에서 정한 옵션만 적습니다.", options, false) +
      section("price", "7. 가격·제작·설치", null, price, true) +
      section("cases", "8. 관련 시공 사례", "실제 사례만 사이트에 보입니다.", caseChecks || '<p class="aempty">등록된 사례가 없습니다.</p>', false) +
      section("archive", "보관용 메모 (사이트에 지금은 안 보임)", "예전 상세 화면에서 쓰던 칸입니다. 지우지 않고 보관합니다.", archive, false) +
      '<div class="aedit-foot">' + del + "</div>"
    );
  }

  /* ───────── 제품군 설명 편집 ───────── */

  function categoriesHtml() {
    binds = [];
    acts = [];
    return (
      '<h2 class="h-sub">제품군 설명</h2><p class="text-soft mt-2">제품 안내 페이지의 분류 카드와, 메뉴에서 제품군을 눌렀을 때 맨 위에 보이는 글입니다.</p>' +
      state.categories
        .map(function (c) {
          return (
            '<div class="acat"><h3 class="acat__title">' + esc(c.fullLabel) + "</h3>" +
            '<div class="agrid">' +
            fText("제목 이름", function () {
              return c.fullLabel;
            }, function (v) {
              c.fullLabel = String(v).trim();
            }) +
            fText("규모", function () {
              return c.size;
            }, function (v) {
              c.size = nn(v);
            }, { placeholder: "예: 20㎡(약 6평) 이하" }) +
            "</div>" +
            fText("소개 한 줄 (굵은 글씨)", function () {
              return c.headline;
            }, function (v) {
              c.headline = nn(v);
            }) +
            fArea("설명", function () {
              return c.description;
            }, function (v) {
              c.description = String(v).trim();
            }, { rows: 3 }) +
            fArea("작은 글씨 참고 안내 (선택)", function () {
              return c.note;
            }, function (v) {
              c.note = nn(v);
            }, { rows: 2 }) +
            "</div>"
          );
        })
        .join("") +
      '<p class="af__help mt-4">상단 메뉴의 짧은 이름(예: 체류형 쉼터)은 별도 파일에 있어 여기서 바뀌지 않습니다. 바꿔야 하면 요청해 주세요.</p>'
    );
  }

  /* ───────── 화면 그리기 ───────── */

  function renderList() {
    var ul = $("#product-list");
    if (!ul) return;
    var q = ($("#list-search") ? $("#list-search").value : "").trim();
    var f = $("#list-filter") ? $("#list-filter").value : "";
    var shown = 0;
    ul.innerHTML = state.products
      .map(function (p, i) {
        if (f && p.category !== f) return "";
        if (q && (p.name || "").indexOf(q) < 0) return "";
        shown++;
        var sc = readyScore(p);
        var thumb = p.images[0] ? '<img src="' + esc(imgSrc(p.images[0].src)) + '" alt="">' : "";
        return (
          '<li><button type="button" class="alist' + (i === state.selected ? " is-on" : "") + '" data-pick="' + i + '"' + (i === state.selected ? ' aria-current="true"' : "") + ">" +
          '<span class="alist__thumb">' + thumb + "</span>" +
          '<span class="alist__text"><span class="alist__name">' + esc(p.name || "새 제품 (이름 없음)") + "</span>" +
          '<span class="alist__meta">' + esc(catOf(p).fullLabel) + " · 준비 " + sc.ok + "/" + sc.total +
          (p.isExample ? " · 예시" : "") + (state.savedSlugs[p.slug] ? "" : " · 저장 전") + "</span></span></button></li>"
        );
      })
      .join("");
    if (!shown) ul.innerHTML = '<li class="aempty">조건에 맞는 제품이 없습니다.</li>';
    var cnt = $("#list-count");
    if (cnt) cnt.textContent = "제품 " + state.products.length + "개";
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
    updateStatus();
  }
  function renderCategories() {
    $("#category-editor").innerHTML = categoriesHtml();
  }
  function currentTab() {
    var on = document.querySelector(".admin-tabs__btn.is-on");
    return on ? on.getAttribute("data-tab") : "products";
  }
  function renderFilter() {
    var sel = $("#list-filter");
    if (!sel || sel.options.length > 1) return;
    state.categories.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.fullLabel;
      sel.appendChild(o);
    });
  }
  function renderAll() {
    renderFilter();
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
    $("#revert-btn").disabled = !dirty || state.saving;
    if (!state.saving) setSaveMsg(dirty ? "저장하지 않은 변경이 있습니다." : "변경 사항이 없습니다. (저장: Ctrl+S)");
  }

  /** 마지막으로 불러오거나 저장한 상태로 되돌리기 */
  function takeSnapshot() {
    state.snapshot = { products: clone(state.products), categories: clone(state.categories) };
  }
  function revert() {
    if (!state.snapshot) return;
    if (!state.confirmRevert) {
      state.confirmRevert = true;
      setSaveMsg("저장하지 않은 변경을 모두 버립니다. 정말 되돌리려면 ‘변경 취소’를 한 번 더 누르세요.", true);
      return;
    }
    state.confirmRevert = false;
    state.products = clone(state.snapshot.products);
    state.categories = clone(state.snapshot.categories);
    state.pending = {};
    state.dirtyProducts = false;
    state.dirtyCategories = false;
    state.selected = Math.min(state.selected, Math.max(0, state.products.length - 1));
    renderAll();
    setSaveMsg("저장하지 않은 변경을 취소했습니다.");
  }

  /* ───────── 저장 ───────── */

  function validate() {
    var seen = {};
    for (var i = 0; i < state.products.length; i++) {
      var p = state.products[i];
      var label = p.name || i + 1 + "번째 제품";
      if (!filled(p.name)) return { i: i, sec: "basic", msg: i + 1 + "번째 제품의 이름을 적어 주세요." };
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) return { i: i, sec: "basic", msg: "‘" + label + "’의 주소 이름은 영문 소문자·숫자·하이픈만 쓸 수 있습니다." };
      if (seen[p.slug]) return { i: i, sec: "basic", msg: "주소 이름 ‘" + p.slug + "’이 두 제품에 겹칩니다." };
      seen[p.slug] = true;
      if (p.price && p.price.kind !== "consult" && p.price.amount == null)
        return { i: i, sec: "price", msg: "‘" + label + "’의 가격 금액을 적거나 ‘가격 상담’으로 바꿔 주세요." };
    }
    return null;
  }

  /** 저장할 때 빈 값 정리 (사진 설명이 비었으면 이름과 공간으로 채움) */
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
    c.options.forEach(function (o) {
      if (o.cost && o.cost.type !== "extra") o.cost.amount = null;
    });
    c.costScope = c.costScope.filter(function (s) {
      return s.item;
    });
    c.specGroups.forEach(function (g) {
      g.items = (g.items || []).filter(function (it) {
        return it.label;
      });
    });
    c.specGroups = c.specGroups.filter(function (g) {
      return g.group && g.items.length;
    });
    if (c.price.kind === "consult") c.price.amount = null;
    c.images.forEach(function (img) {
      if (!img.optionsShown) img.optionsShown = [];
      if (!filled(img.alt)) img.alt = (c.name || "제품") + " " + (img.space || "사진");
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
      state.openSecs[bad.sec] = true;
      renderAll();
      goSection(bad.sec);
      setSaveMsg(bad.msg, true);
      return;
    }
    state.saving = true;
    $("#save-btn").disabled = true;
    $("#revert-btn").disabled = true;
    setSaveMsg("저장하는 중입니다… 창을 닫지 마세요.");

    var files = [];
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
              files.push({ path: "products/" + p.slug + ".html", b64: utf8ToB64(F.productPage(p, catOf(p).fullLabel, siteVersion())) });
            }
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
        takeSnapshot();
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
    renderAll();
  }

  function goSection(sec) {
    state.openSecs[sec] = true;
    var el = document.getElementById("sec-" + sec);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ block: "start" });
    var first = el.querySelector(".asec__body input:not([type=hidden]):not([disabled]), .asec__body textarea, .asec__body select");
    if (first) first.focus({ preventScroll: true });
  }

  function onInput(e) {
    var el = e.target;
    if (!el.hasAttribute || !el.hasAttribute("data-b")) return;
    var b = binds[Number(el.getAttribute("data-b"))];
    if (!b) return;
    var v;
    if (el.type === "checkbox") v = el.checked;
    else if (el.type === "radio") {
      if (!el.checked) return;
      v = JSON.parse(el.getAttribute("data-choices"))[Number(el.value)];
    } else if (el.tagName === "SELECT") v = JSON.parse(el.getAttribute("data-choices"))[Number(el.value)];
    else v = el.value;
    b.set(v);
    markDirty(currentTab());
    // 글자 수, 평 환산, 금액 표시는 바로 고칩니다
    if (el.hasAttribute("data-count")) {
      var c = document.querySelector('[data-count-for="' + el.getAttribute("data-b") + '"]');
      if (c) c.textContent = countText(el.value.length, el.getAttribute("data-count").split(",").map(Number));
    }
    var label = el.closest("label");
    var py = label && label.querySelector("[data-py]");
    if (py) py.textContent = pyeong(el.value);
    var w = label && label.querySelector("[data-won]");
    if (w) w.textContent = won(num(el.value));
    if (b.opts.rerender) renderEditor();
    else if (el.type === "checkbox" || el.type === "radio" || el.tagName === "SELECT") updateStatus();
  }

  function init() {
    state.openSecs = { basic: true, intro: true, photos: true };
    var saved = null;
    try {
      saved = sessionStorage.getItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY); // 이전 방식(기기에 기억하기)으로 남은 토큰은 지웁니다
    } catch (e) {
      saved = null;
    }
    show("login");
    loadLock().then(function (lock) {
      state.lock = lock && lock.data ? lock : null;
      if (saved) {
        connect(saved, state.lock ? $("#unlock-msg") : $("#login-msg"));
      }
      showTokenBox(!state.lock);
    });

    // 보안코드로 들어가기
    function unlock() {
      var code = $("#code-input").value;
      var msg = $("#unlock-msg");
      if (!code) {
        msg.textContent = "보안코드를 입력해 주세요.";
        return;
      }
      msg.textContent = "확인하는 중입니다…";
      unlockToken(state.lock, code)
        .then(function (token) {
          $("#code-input").value = "";
          return connect(token, msg).then(function (ok) {
            if (!ok && /토큰이 맞지 않거나 만료/.test(msg.textContent))
              msg.textContent = "보안코드는 맞지만 GitHub 토큰이 만료되었습니다. 아래 ‘새 토큰으로 다시 설정하기’를 눌러 주세요.";
          });
        })
        .catch(function () {
          msg.textContent = "보안코드가 맞지 않습니다.";
        });
    }
    $("#code-connect").addEventListener("click", unlock);
    $("#code-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") unlock();
    });
    $("#show-token-box").addEventListener("click", function () {
      showTokenBox(true);
    });

    // 처음 설정: 토큰으로 연결하고 보안코드로 잠가 저장
    $("#token-connect").addEventListener("click", function () {
      // 복사할 때 함께 붙는 띄어쓰기·줄바꿈·눈에 안 보이는 글자는 지웁니다
      var t = $("#token-input").value.replace(/[\s​-‍⁠﻿]/g, "");
      var msg = $("#login-msg");
      if (!t) {
        msg.textContent = "토큰을 붙여 넣어 주세요.";
        return;
      }
      var tokenProblem = checkToken(t);
      if (tokenProblem) {
        msg.textContent = tokenProblem;
        $("#token-input").focus();
        return;
      }
      var bad = checkNewCode($("#code-new").value, $("#code-new2").value);
      if (bad) {
        msg.textContent = bad;
        return;
      }
      var code = $("#code-new").value;
      connect(t, msg).then(function (ok) {
        if (!ok) return;
        $("#token-input").value = "";
        $("#code-new").value = "";
        $("#code-new2").value = "";
        setSaveMsg("보안코드를 저장하는 중입니다…");
        saveLock(code)
          .then(function () {
            setSaveMsg("보안코드를 저장했습니다. 1~10분 뒤부터 다른 기기에서도 보안코드로 들어올 수 있습니다.");
          })
          .catch(function (err) {
            setSaveMsg("보안코드를 저장하지 못했습니다. ‘보안코드 바꾸기’로 다시 해 주세요. " + friendly(err), true);
          });
      });
    });

    document.addEventListener("input", function (e) {
      if (e.target.id === "list-search") {
        renderList();
        return;
      }
      onInput(e);
    });
    document.addEventListener("change", function (e) {
      var el = e.target;
      if (el.id === "list-filter") {
        renderList();
        return;
      }
      if (el.hasAttribute && el.hasAttribute("data-upload")) {
        addFiles(Array.prototype.slice.call(el.files || []), el.getAttribute("data-upload"));
        el.value = "";
        return;
      }
      // 글자 칸에서 나올 때: 옵션 이름처럼 다른 칸에 영향을 주면 다시 그리고, 아니면 준비도만 고칩니다
      if (el.hasAttribute && el.hasAttribute("data-b")) {
        var bd = binds[Number(el.getAttribute("data-b"))];
        if (bd && bd.opts.rerenderOnChange) renderEditor();
        else updateStatus();
      }
    });
    // 펼친 칸 기억 (다시 그려도 그대로)
    document.addEventListener(
      "toggle",
      function (e) {
        var d = e.target;
        if (d.classList && d.classList.contains("asec")) state.openSecs[d.getAttribute("data-sec")] = d.open;
      },
      true
    );
    // 사진 끌어다 놓기
    document.addEventListener("dragover", function (e) {
      var z = e.target.closest && e.target.closest("[data-drop]");
      if (z) {
        e.preventDefault();
        z.classList.add("is-over");
      }
    });
    document.addEventListener("dragleave", function (e) {
      var z = e.target.closest && e.target.closest("[data-drop]");
      if (z) z.classList.remove("is-over");
    });
    document.addEventListener("drop", function (e) {
      var z = e.target.closest && e.target.closest("[data-drop]");
      if (!z) return;
      e.preventDefault();
      z.classList.remove("is-over");
      var files = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []).filter(function (f) {
        return /^image\//.test(f.type);
      });
      addFiles(files, z.getAttribute("data-drop"));
    });

    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-act],[data-act-global],[data-pick],[data-tab],[data-preview-link],[data-goto]") : null;
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
      if (t.hasAttribute("data-goto")) {
        goSection(t.getAttribute("data-goto"));
        return;
      }
      if (t.hasAttribute("data-pick")) {
        state.selected = Number(t.getAttribute("data-pick"));
        state.confirmDelete = false;
        renderAll();
        var ed = $("#editor");
        if (window.innerWidth < 1024 || ed.getBoundingClientRect().top < 0) ed.scrollIntoView();
        return;
      }
      if (t.hasAttribute("data-tab")) {
        switchTab(t.getAttribute("data-tab"));
        return;
      }
      var g = t.getAttribute("data-act-global");
      if (g !== "revert") state.confirmRevert = false;
      if (g === "logout") logout();
      if (g === "save") save();
      if (g === "revert") revert();
      if (g === "preview") openPreview();
      if (g === "close-preview") closePreview();
      if (g === "change-code") {
        var box = $("#code-change");
        box.hidden = !box.hidden;
        $("#code-change-msg").textContent = "";
        if (!box.hidden) $("#code-change-1").focus();
      }
      if (g === "save-code") {
        var m = $("#code-change-msg");
        var bad = checkNewCode($("#code-change-1").value, $("#code-change-2").value);
        if (bad) {
          m.textContent = bad;
          return;
        }
        m.textContent = "저장하는 중입니다…";
        saveLock($("#code-change-1").value)
          .then(function () {
            $("#code-change-1").value = "";
            $("#code-change-2").value = "";
            m.textContent = "새 보안코드를 저장했습니다. 1~10분 뒤부터 새 코드로 들어올 수 있습니다.";
          })
          .catch(function (err) {
            m.textContent = "저장하지 못했습니다. " + friendly(err);
          });
      }
      if (g === "add-product") {
        var f = $("#list-filter") ? $("#list-filter").value : "";
        state.products.push(newProduct(f || null));
        state.selected = state.products.length - 1;
        state.confirmDelete = false;
        state.openSecs = { basic: true, intro: true, photos: true };
        if ($("#list-search")) $("#list-search").value = "";
        markDirty("products");
        renderAll();
        $("#editor").scrollIntoView();
        var first = $("#editor .asec__body input[type=text]:not([disabled])");
        if (first) first.focus({ preventScroll: true });
        setSaveMsg("새 제품을 만들었습니다. 이름부터 적어 주세요. (저장해야 사이트에 반영됩니다)");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("#preview").hidden && !document.querySelector("dialog[open]")) closePreview();
      // Ctrl+S (맥: Cmd+S) 로 저장
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S") && !$("#save-btn").hidden) {
        e.preventDefault();
        if (!$("#save-btn").disabled) save();
      }
    });

    window.addEventListener("beforeunload", function (e) {
      if (state.dirtyProducts || state.dirtyCategories) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  function showTokenBox(on) {
    $("#token-box").hidden = !on;
    $("#unlock-box").hidden = on;
    var f = on ? $("#token-input") : $("#code-input");
    if (f) f.focus();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
