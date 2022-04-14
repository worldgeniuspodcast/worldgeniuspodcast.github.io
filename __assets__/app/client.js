
// node_modules/imba/src/imba/utils.imba
var $23 = Symbol.for("#__initor__");
var $24 = Symbol.for("#__inited__");
var $1 = Symbol.for("#__hooks__");
var $2 = Symbol.for("#type");
var $21 = Symbol.for("#__listeners__");
function getDeepPropertyDescriptor(item, key, stop) {
  if (!item) {
    return void 0;
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc || item == stop) {
    return desc || void 0;
  }
  ;
  return getDeepPropertyDescriptor(Reflect.getPrototypeOf(item), key, stop);
}
var emit__ = function(event, args, node) {
  let prev;
  let cb;
  let ret;
  while ((prev = node) && (node = node.next)) {
    if (cb = node.listener) {
      if (node.path && cb[node.path]) {
        ret = args ? cb[node.path].apply(cb, args) : cb[node.path]();
      } else {
        ret = args ? cb.apply(node, args) : cb.call(node);
      }
      ;
    }
    ;
    if (node.times && --node.times <= 0) {
      prev.next = node.next;
      node.listener = null;
    }
    ;
  }
  ;
  return;
};
function emit(obj, event, params) {
  let cb;
  if (cb = obj[$21]) {
    if (cb[event]) {
      emit__(event, params, cb[event]);
    }
    ;
    if (cb.all) {
      emit__(event, [event, params], cb.all);
    }
    ;
  }
  ;
  return;
}

// node_modules/imba/src/imba/scheduler.imba
function iter$__(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $12 = Symbol.for("#__init__");
var $22 = Symbol.for("#__patch__");
var $19 = Symbol.for("#__initor__");
var $20 = Symbol.for("#__inited__");
var $3 = Symbol.for("#__hooks__");
var $4 = Symbol.for("#schedule");
var $7 = Symbol.for("#frames");
var $8 = Symbol.for("#interval");
var $9 = Symbol.for("#stage");
var $10 = Symbol.for("#scheduled");
var $11 = Symbol.for("#version");
var $122 = Symbol.for("#fps");
var $13 = Symbol.for("#ticker");
var rAF = globalThis.requestAnimationFrame || function(blk) {
  return globalThis.setTimeout(blk, 1e3 / 60);
};
var SPF = 1 / 60;
var Scheduled = class {
  [$22]($$ = {}) {
    var $56;
    ($56 = $$.owner) !== void 0 && (this.owner = $56);
    ($56 = $$.target) !== void 0 && (this.target = $56);
    ($56 = $$.active) !== void 0 && (this.active = $56);
    ($56 = $$.value) !== void 0 && (this.value = $56);
    ($56 = $$.skip) !== void 0 && (this.skip = $56);
    ($56 = $$.last) !== void 0 && (this.last = $56);
  }
  constructor($$ = null) {
    this[$12]($$);
  }
  [$12]($$ = null) {
    var $68;
    this.owner = $$ && ($68 = $$.owner) !== void 0 ? $68 : null;
    this.target = $$ && ($68 = $$.target) !== void 0 ? $68 : null;
    this.active = $$ && ($68 = $$.active) !== void 0 ? $68 : false;
    this.value = $$ && ($68 = $$.value) !== void 0 ? $68 : void 0;
    this.skip = $$ && ($68 = $$.skip) !== void 0 ? $68 : 0;
    this.last = $$ && ($68 = $$.last) !== void 0 ? $68 : 0;
  }
  tick(scheduler2, source) {
    this.last = this.owner[$7];
    this.target.tick(this, source);
    return 1;
  }
  update(o, activate\u03A6) {
    let on = this.active;
    let val = o.value;
    let changed = this.value != val;
    if (changed) {
      this.deactivate();
      this.value = val;
    }
    ;
    if (this.value || on || activate\u03A6) {
      this.activate();
    }
    ;
    return this;
  }
  queue() {
    this.owner.add(this);
    return;
  }
  activate() {
    if (this.value === true) {
      this.owner.on("commit", this);
    } else if (this.value === false) {
      true;
    } else if (typeof this.value == "number") {
      let tock = this.value / (1e3 / 60);
      if (tock <= 2) {
        this.owner.on("raf", this);
      } else {
        this[$8] = globalThis.setInterval(this.queue.bind(this), this.value);
      }
      ;
    }
    ;
    this.active = true;
    return this;
  }
  deactivate() {
    if (this.value === true) {
      this.owner.un("commit", this);
    }
    ;
    this.owner.un("raf", this);
    if (this[$8]) {
      globalThis.clearInterval(this[$8]);
      this[$8] = null;
    }
    ;
    this.active = false;
    return this;
  }
};
var Scheduler = class {
  constructor() {
    var self = this;
    this.id = Symbol();
    this.queue = [];
    this.stage = -1;
    this[$9] = -1;
    this[$7] = 0;
    this[$10] = false;
    this[$11] = 0;
    this.listeners = {};
    this.intervals = {};
    self.commit = function() {
      self.add("commit");
      return self;
    };
    this[$122] = 0;
    self.$promise = null;
    self.$resolve = null;
    this[$13] = function(e) {
      self[$10] = false;
      return self.tick(e);
    };
    self;
  }
  touch() {
    return this[$11]++;
  }
  get version() {
    return this[$11];
  }
  add(item, force) {
    if (force || this.queue.indexOf(item) == -1) {
      this.queue.push(item);
    }
    ;
    if (!this[$10]) {
      this[$4]();
    }
    ;
    return this;
  }
  get committing\u03A6() {
    return this.queue.indexOf("commit") >= 0;
  }
  get syncing\u03A6() {
    return this[$9] == 1;
  }
  listen(ns, item) {
    let set = this.listeners[ns];
    let first = !set;
    set || (set = this.listeners[ns] = new Set());
    set.add(item);
    if (ns == "raf" && first) {
      this.add("raf");
    }
    ;
    return this;
  }
  unlisten(ns, item) {
    var $145;
    let set = this.listeners[ns];
    set && set.delete(item);
    if (ns == "raf" && set && set.size == 0) {
      $145 = this.listeners.raf, delete this.listeners.raf, $145;
    }
    ;
    return this;
  }
  on(ns, item) {
    return this.listen(ns, item);
  }
  un(ns, item) {
    return this.unlisten(ns, item);
  }
  get promise() {
    var self = this;
    return self.$promise || (self.$promise = new Promise(function(resolve) {
      return self.$resolve = resolve;
    }));
  }
  tick(timestamp) {
    var self = this;
    let items = this.queue;
    let frame = this[$7]++;
    if (!this.ts) {
      this.ts = timestamp;
    }
    ;
    this.dt = timestamp - this.ts;
    this.ts = timestamp;
    this.queue = [];
    this[$9] = 1;
    this[$11]++;
    if (items.length) {
      for (let i = 0, $155 = iter$__(items), $165 = $155.length; i < $165; i++) {
        let item = $155[i];
        if (typeof item === "string" && this.listeners[item]) {
          self.listeners[item].forEach(function(listener) {
            if (listener.tick instanceof Function) {
              return listener.tick(self, item);
            } else if (listener instanceof Function) {
              return listener(self, item);
            }
            ;
          });
        } else if (item instanceof Function) {
          item(self.dt, self);
        } else if (item.tick) {
          item.tick(self.dt, self);
        }
        ;
      }
      ;
    }
    ;
    this[$9] = this[$10] ? 0 : -1;
    if (self.$promise) {
      self.$resolve(self);
      self.$promise = self.$resolve = null;
    }
    ;
    if (self.listeners.raf && true) {
      self.add("raf");
    }
    ;
    return self;
  }
  [$4]() {
    if (!this[$10]) {
      this[$10] = true;
      if (this[$9] == -1) {
        this[$9] = 0;
      }
      ;
      rAF(this[$13]);
    }
    ;
    return this;
  }
  schedule(item, o) {
    var $175, $185;
    o || (o = item[$175 = this.id] || (item[$175] = {value: true}));
    let state = o[$185 = this.id] || (o[$185] = new Scheduled({owner: this, target: item}));
    return state.update(o, true);
  }
  unschedule(item, o = {}) {
    o || (o = item[this.id]);
    let state = o && o[this.id];
    if (state && state.active) {
      state.deactivate();
    }
    ;
    return this;
  }
};
var scheduler = new Scheduler();
function commit() {
  return scheduler.add("commit").promise;
}
function setTimeout2(fn, ms) {
  return globalThis.setTimeout(function() {
    fn();
    commit();
    return;
  }, ms);
}
function setInterval(fn, ms) {
  return globalThis.setInterval(function() {
    fn();
    commit();
    return;
  }, ms);
}
var clearInterval = globalThis.clearInterval;
var clearTimeout = globalThis.clearTimeout;
var instance = globalThis.imba || (globalThis.imba = {});
instance.commit = commit;
instance.setTimeout = setTimeout2;
instance.setInterval = setInterval;
instance.clearInterval = clearInterval;
instance.clearTimeout = clearTimeout;

// node_modules/imba/src/imba/manifest.web.imba
var $25 = Symbol.for("#__initor__");
var $32 = Symbol.for("#__inited__");
var $14 = Symbol.for("#__hooks__");
var Manifest = class {
  constructor() {
    this.data = {};
  }
};
var manifest = new Manifest();

// node_modules/imba/src/imba/asset.imba
var $132 = Symbol.for("#__initor__");
var $142 = Symbol.for("#__inited__");
var $15 = Symbol.for("#__hooks__");
var $26 = Symbol.for("#__init__");
var $33 = Symbol.for("#__patch__");
var $42 = Symbol.for("#warned");
var $102 = Symbol.for("#asset");
var AssetProxy = class {
  static wrap(meta) {
    let handler = new AssetProxy(meta);
    return new Proxy(handler, handler);
  }
  constructor(meta) {
    this.meta = meta;
  }
  get input() {
    return manifest.inputs[this.meta.input];
  }
  get asset() {
    return globalThis._MF_ ? this.meta : this.input ? this.input.asset : null;
  }
  set(target, key, value) {
    return true;
  }
  get(target, key) {
    if (this.meta.meta && this.meta.meta[key] != void 0) {
      return this.meta.meta[key];
    }
    ;
    if (!this.asset) {
      if (this.meta[$42] != true ? (this.meta[$42] = true, true) : false) {
        console.warn("Asset for '" + this.meta.input + "' not found");
      }
      ;
      if (key == "valueOf") {
        return function() {
          return "";
        };
      }
      ;
      return null;
    }
    ;
    if (key == "absPath" && !this.asset.absPath) {
      return this.asset.url;
    }
    ;
    return this.asset[key];
  }
};
var SVGAsset = class {
  [$33]($$ = {}) {
    var $56;
    ($56 = $$.url) !== void 0 && (this.url = $56);
    ($56 = $$.meta) !== void 0 && (this.meta = $56);
  }
  constructor($$ = null) {
    this[$26]($$);
  }
  [$26]($$ = null) {
    this.url = $$ ? $$.url : void 0;
    this.meta = $$ ? $$.meta : void 0;
  }
  adoptNode(node) {
    var _a;
    if ((_a = this.meta) == null ? void 0 : _a.content) {
      for (let $86 = this.meta.attributes, $68 = 0, $76 = Object.keys($86), $97 = $76.length, k, v; $68 < $97; $68++) {
        k = $76[$68];
        v = $86[k];
        node.setAttribute(k, v);
      }
      ;
      node.innerHTML = this.meta.content;
    }
    ;
    return this;
  }
  toString() {
    return this.url;
  }
  toStyleString() {
    return "url(" + this.url + ")";
  }
};
function asset(data) {
  var $118, $126;
  if (data[$102]) {
    return data[$102];
  }
  ;
  if (data.type == "svg") {
    return data[$102] || (data[$102] = new SVGAsset(data));
  }
  ;
  if (data.input) {
    let extra = globalThis._MF_ && globalThis._MF_[data.input];
    if (extra) {
      Object.assign(data, extra);
      data.toString = function() {
        return this.absPath;
      };
    }
    ;
    return data[$102] || (data[$102] = AssetProxy.wrap(data));
  }
  ;
  return data;
}

// node_modules/imba/src/imba/dom/flags.imba
var $16 = Symbol.for("#toStringDeopt");
var $72 = Symbol.for("#__initor__");
var $82 = Symbol.for("#__inited__");
var $27 = Symbol.for("#__hooks__");
var $34 = Symbol.for("#symbols");
var $43 = Symbol.for("#batches");
var $5 = Symbol.for("#extras");
var $6 = Symbol.for("#stacks");
var Flags = class {
  constructor(dom) {
    this.dom = dom;
    this.string = "";
  }
  contains(ref) {
    return this.dom.classList.contains(ref);
  }
  add(ref) {
    if (this.contains(ref)) {
      return this;
    }
    ;
    this.string += (this.string ? " " : "") + ref;
    this.dom.classList.add(ref);
    return this;
  }
  remove(ref) {
    if (!this.contains(ref)) {
      return this;
    }
    ;
    let regex = new RegExp("(^|\\s)" + ref + "(?=\\s|$)", "g");
    this.string = this.string.replace(regex, "");
    this.dom.classList.remove(ref);
    return this;
  }
  toggle(ref, bool) {
    if (bool === void 0) {
      bool = !this.contains(ref);
    }
    ;
    return bool ? this.add(ref) : this.remove(ref);
  }
  incr(ref, duration = 0) {
    var self = this;
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c < 1) {
      this.add(ref);
    }
    ;
    if (duration > 0) {
      setTimeout(function() {
        return self.decr(ref);
      }, duration);
    }
    ;
    return m[ref] = Math.max(c, 0) + 1;
  }
  decr(ref) {
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c == 1) {
      this.remove(ref);
    }
    ;
    return m[ref] = Math.max(c, 1) - 1;
  }
  reconcile(sym, str) {
    let syms = this[$34];
    let vals = this[$43];
    let dirty = true;
    if (!syms) {
      syms = this[$34] = [sym];
      vals = this[$43] = [str || ""];
      this.toString = this.valueOf = this[$16];
    } else {
      let idx = syms.indexOf(sym);
      let val = str || "";
      if (idx == -1) {
        syms.push(sym);
        vals.push(val);
      } else if (vals[idx] != val) {
        vals[idx] = val;
      } else {
        dirty = false;
      }
      ;
    }
    ;
    if (dirty) {
      this[$5] = " " + vals.join(" ");
      this.sync();
    }
    ;
    return;
  }
  valueOf() {
    return this.string;
  }
  toString() {
    return this.string;
  }
  [$16]() {
    return this.string + (this[$5] || "");
  }
  sync() {
    return this.dom.flagSync$();
  }
  get stacks() {
    return this[$6] || (this[$6] = {});
  }
};

// node_modules/imba/src/imba/dom/context.imba
var $17 = Symbol.for("#__init__");
var $28 = Symbol.for("#__patch__");
var $73 = Symbol.for("#__initor__");
var $83 = Symbol.for("#__inited__");
var $35 = Symbol.for("#__hooks__");
var $44 = Symbol.for("#getRenderContext");
var $52 = Symbol.for("#getDynamicContext");
var $62 = Symbol();
var renderContext = {
  context: null
};
var Renderer = class {
  [$28]($$ = {}) {
    var $97;
    ($97 = $$.stack) !== void 0 && (this.stack = $97);
  }
  constructor($$ = null) {
    this[$17]($$);
  }
  [$17]($$ = null) {
    var $105;
    this.stack = $$ && ($105 = $$.stack) !== void 0 ? $105 : [];
  }
  push(el) {
    return this.stack.push(el);
  }
  pop(el) {
    return this.stack.pop();
  }
};
var renderer = new Renderer();
var RenderContext = class extends Map {
  static [$17]() {
    this.prototype[$73] = $62;
    return this;
  }
  constructor(parent, sym = null) {
    super();
    this._ = parent;
    this.sym = sym;
    this[$73] === $62 && (this[$35] && this[$35].inited(this), this[$83] && this[$83]());
  }
  pop() {
    return renderContext.context = null;
  }
  [$44](sym) {
    let out = this.get(sym);
    out || this.set(sym, out = new RenderContext(this._, sym));
    return renderContext.context = out;
  }
  [$52](sym, key) {
    return this[$44](sym)[$44](key);
  }
  run(value) {
    this.value = value;
    if (renderContext.context == this) {
      renderContext.context = null;
    }
    ;
    return this.get(value);
  }
  cache(val) {
    this.set(this.value, val);
    return val;
  }
};
RenderContext[$17]();
function createRenderContext(cache, key = Symbol(), up = cache) {
  return renderContext.context = cache[key] || (cache[key] = new RenderContext(up, key));
}
function getRenderContext() {
  let ctx = renderContext.context;
  let res = ctx || new RenderContext(null);
  if (true) {
    if (!ctx && renderer.stack.length > 0) {
      console.warn("detected unmemoized nodes in", renderer.stack, "see https://imba.io", res);
    }
    ;
  }
  ;
  if (ctx) {
    renderContext.context = null;
  }
  ;
  return res;
}

// node_modules/imba/src/imba/dom/core.web.imba
function extend$__(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function iter$__2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $18 = Symbol.for("#parent");
var $29 = Symbol.for("#closestNode");
var $36 = Symbol.for("#parentNode");
var $45 = Symbol.for("#context");
var $53 = Symbol.for("#__init__");
var $63 = Symbol.for("##inited");
var $74 = Symbol.for("#getRenderContext");
var $84 = Symbol.for("#getDynamicContext");
var $92 = Symbol.for("#insertChild");
var $103 = Symbol.for("#appendChild");
var $112 = Symbol.for("#replaceChild");
var $123 = Symbol.for("#removeChild");
var $133 = Symbol.for("#insertInto");
var $143 = Symbol.for("#insertIntoDeopt");
var $152 = Symbol.for("#removeFrom");
var $162 = Symbol.for("#removeFromDeopt");
var $172 = Symbol.for("#replaceWith");
var $182 = Symbol.for("#replaceWithDeopt");
var $192 = Symbol.for("#placeholderNode");
var $202 = Symbol.for("#attachToParent");
var $212 = Symbol.for("#detachFromParent");
var $222 = Symbol.for("#placeChild");
var $232 = Symbol.for("#beforeReconcile");
var $242 = Symbol.for("#afterReconcile");
var $252 = Symbol.for("#afterVisit");
var $262 = Symbol.for("##parent");
var $272 = Symbol.for("##up");
var $282 = Symbol.for("##context");
var $292 = Symbol.for("#domNode");
var $30 = Symbol.for("##placeholderNode");
var $31 = Symbol.for("#domDeopt");
var $322 = Symbol.for("#isRichElement");
var $342 = Symbol.for("#src");
var $422 = Symbol.for("#htmlNodeName");
var $432 = Symbol.for("#getSlot");
var $442 = Symbol.for("#ImbaElement");
var $452 = Symbol.for("#cssns");
var $46 = Symbol.for("#cssid");
var {
  Event,
  UIEvent,
  MouseEvent,
  PointerEvent,
  KeyboardEvent,
  CustomEvent,
  Node,
  Comment,
  Text,
  Element,
  HTMLElement,
  HTMLHtmlElement,
  HTMLSelectElement,
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLButtonElement,
  HTMLOptionElement,
  HTMLScriptElement,
  SVGElement,
  DocumentFragment,
  ShadowRoot,
  Document,
  Window,
  customElements
} = globalThis.window;
var descriptorCache = {};
function getDescriptor(item, key, cache) {
  if (!item) {
    return cache[key] = null;
  }
  ;
  if (cache[key] !== void 0) {
    return cache[key];
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc !== void 0 || item == SVGElement) {
    return cache[key] = desc || null;
  }
  ;
  return getDescriptor(Reflect.getPrototypeOf(item), key, cache);
}
var CustomTagConstructors = {};
var CustomTagToElementNames = {};
var TYPES = {};
var CUSTOM_TYPES = {};
var contextHandler = {
  get(target, name) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      if (ctx = ctx[$18]) {
        val = ctx[name];
      }
      ;
    }
    ;
    return val;
  },
  set(target, name, value) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      let desc = getDeepPropertyDescriptor(ctx, name, Element);
      if (desc) {
        ctx[name] = value;
        return true;
      } else {
        ctx = ctx[$18];
      }
      ;
    }
    ;
    return true;
  }
};
var Extend$Document$af = class {
  get flags() {
    return this.documentElement.flags;
  }
};
extend$__(Document.prototype, Extend$Document$af.prototype);
var Extend$Node$ag = class {
  get [$18]() {
    return this[$262] || this.parentNode || this[$272];
  }
  get [$29]() {
    return this;
  }
  get [$36]() {
    return this[$18][$29];
  }
  get [$45]() {
    return this[$282] || (this[$282] = new Proxy(this, contextHandler));
  }
  [$53]() {
    return this;
  }
  [$63]() {
    return this;
  }
  [$74](sym) {
    return createRenderContext(this, sym);
  }
  [$84](sym, key) {
    return this[$74](sym)[$74](key);
  }
  [$92](newnode, refnode) {
    return newnode[$133](this, refnode);
  }
  [$103](newnode) {
    return newnode[$133](this, null);
  }
  [$112](newnode, oldnode) {
    let res = this[$92](newnode, oldnode);
    this[$123](oldnode);
    return res;
  }
  [$123](node) {
    return node[$152](this);
  }
  [$133](parent, before = null) {
    if (before) {
      parent.insertBefore(this, before);
    } else {
      parent.appendChild(this);
    }
    ;
    return this;
  }
  [$143](parent, before) {
    if (before) {
      parent.insertBefore(this[$292] || this, before);
    } else {
      parent.appendChild(this[$292] || this);
    }
    ;
    return this;
  }
  [$152](parent) {
    return parent.removeChild(this);
  }
  [$162](parent) {
    return parent.removeChild(this[$292] || this);
  }
  [$172](other, parent) {
    return parent[$112](other, this);
  }
  [$182](other, parent) {
    return parent[$112](other, this[$292] || this);
  }
  get [$192]() {
    return this[$30] || (this[$30] = globalThis.document.createComment("placeholder"));
  }
  set [$192](value) {
    let prev = this[$30];
    this[$30] = value;
    if (prev && prev != value && prev.parentNode) {
      prev[$172](value);
    }
    ;
  }
  [$202]() {
    let ph = this[$292];
    let par = ph && ph.parentNode;
    if (ph && par && ph != this) {
      this[$292] = null;
      this[$133](par, ph);
      ph[$152](par);
    }
    ;
    return this;
  }
  [$212]() {
    if (this[$31] != true ? (this[$31] = true, true) : false) {
      this[$172] = this[$182];
      this[$152] = this[$162];
      this[$133] = this[$143];
    }
    ;
    let ph = this[$192];
    if (this.parentNode && ph != this) {
      ph[$133](this.parentNode, this);
      this[$152](this.parentNode);
    }
    ;
    this[$292] = ph;
    return this;
  }
  [$222](item, f, prev) {
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = globalThis.document.createComment("");
      return prev ? prev[$172](el, this) : el[$133](this, null);
    }
    ;
    if (item === prev) {
      return item;
    } else if (type !== "object") {
      let res;
      let txt = item;
      if (f & 128 && f & 256 && false) {
        this.textContent = txt;
        return;
      }
      ;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = globalThis.document.createTextNode(txt);
          prev[$172](res, this);
          return res;
        }
        ;
      } else {
        this.appendChild(res = globalThis.document.createTextNode(txt));
        return res;
      }
      ;
    } else {
      if (true) {
        if (!item[$133]) {
          console.warn("Tried to insert", item, "into", this);
          throw new TypeError("Only DOM Nodes can be inserted into DOM");
        }
        ;
      }
      ;
      return prev ? prev[$172](item, this) : item[$133](this, null);
    }
    ;
    return;
  }
};
extend$__(Node.prototype, Extend$Node$ag.prototype);
var Extend$Element$ah = class {
  log(...params) {
    console.log(...params);
    return this;
  }
  emit(name, detail, o = {bubbles: true, cancelable: true}) {
    if (detail != void 0) {
      o.detail = detail;
    }
    ;
    let event = new CustomEvent(name, o);
    let res = this.dispatchEvent(event);
    return event;
  }
  text$(item) {
    this.textContent = item;
    return this;
  }
  [$232]() {
    return this;
  }
  [$242]() {
    return this;
  }
  [$252]() {
    if (this.render) {
      this.render();
    }
    ;
    return;
  }
  get flags() {
    if (!this.$flags) {
      this.$flags = new Flags(this);
      if (this.flag$ == Element.prototype.flag$) {
        this.flags$ext = this.className;
      }
      ;
      this.flagDeopt$();
    }
    ;
    return this.$flags;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.className = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
    return;
  }
  flagDeopt$() {
    var self = this;
    this.flag$ = this.flagExt$;
    self.flagSelf$ = function(str) {
      return self.flagSync$(self.flags$own = str);
    };
    return;
  }
  flagExt$(str) {
    return this.flagSync$(this.flags$ext = str);
  }
  flagSelf$(str) {
    this.flagDeopt$();
    return this.flagSelf$(str);
  }
  flagSync$() {
    return this.className = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
  }
  set$(key, value) {
    let desc = getDeepPropertyDescriptor(this, key, Element);
    if (!desc || !desc.set) {
      this.setAttribute(key, value);
    } else {
      this[key] = value;
    }
    ;
    return;
  }
  get richValue() {
    return this.value;
  }
  set richValue(value) {
    this.value = value;
  }
};
extend$__(Element.prototype, Extend$Element$ah.prototype);
Element.prototype.setns$ = Element.prototype.setAttributeNS;
Element.prototype[$322] = true;
function createElement(name, parent, flags, text) {
  let el = globalThis.document.createElement(name);
  if (flags) {
    el.className = flags;
  }
  ;
  if (text !== null) {
    el.text$(text);
  }
  ;
  if (parent && parent[$103]) {
    parent[$103](el);
  }
  ;
  return el;
}
var Extend$SVGElement$ai = class {
  set$(key, value) {
    var $333;
    let cache = descriptorCache[$333 = this.nodeName] || (descriptorCache[$333] = {});
    let desc = getDescriptor(this, key, cache);
    if (!desc || !desc.set) {
      this.setAttribute(key, value);
    } else {
      this[key] = value;
    }
    ;
    return;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.setAttribute("class", ns ? ns + (this.flags$ext = str) : this.flags$ext = str);
    return;
  }
  flagSelf$(str) {
    var self = this;
    self.flag$ = function(str2) {
      return self.flagSync$(self.flags$ext = str2);
    };
    self.flagSelf$ = function(str2) {
      return self.flagSync$(self.flags$own = str2);
    };
    return self.flagSelf$(str);
  }
  flagSync$() {
    return this.setAttribute("class", (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || ""));
  }
};
extend$__(SVGElement.prototype, Extend$SVGElement$ai.prototype);
var Extend$SVGSVGElement$aj = class {
  set src(value) {
    if (this[$342] != value ? (this[$342] = value, true) : false) {
      if (value) {
        if (value.adoptNode) {
          value.adoptNode(this);
        } else if (value.content) {
          for (let $372 = value.attributes, $352 = 0, $363 = Object.keys($372), $382 = $363.length, k, v; $352 < $382; $352++) {
            k = $363[$352];
            v = $372[k];
            this.setAttribute(k, v);
          }
          ;
          this.innerHTML = value.content;
        }
        ;
      }
      ;
    }
    ;
    return;
  }
};
extend$__(SVGSVGElement.prototype, Extend$SVGSVGElement$aj.prototype);
function createSVGElement(name, parent, flags, text, ctx) {
  let el = globalThis.document.createElementNS("http://www.w3.org/2000/svg", name);
  if (flags) {
    el.className.baseVal = flags;
  }
  ;
  if (parent && parent[$103]) {
    parent[$103](el);
  }
  ;
  if (text) {
    el.textContent = text;
  }
  ;
  return el;
}
function createComment(text) {
  return globalThis.document.createComment(text);
}
function createTextNode(text) {
  return globalThis.document.createTextNode(text);
}
var navigator = globalThis.navigator;
var vendor = navigator && navigator.vendor || "";
var ua = navigator && navigator.userAgent || "";
var isSafari = vendor.indexOf("Apple") > -1 || ua.indexOf("CriOS") >= 0 || ua.indexOf("FxiOS") >= 0;
var supportsCustomizedBuiltInElements = !isSafari;
var CustomDescriptorCache = new Map();
var CustomHook = class extends HTMLElement {
  connectedCallback() {
    if (supportsCustomizedBuiltInElements) {
      return this.parentNode.removeChild(this);
    } else {
      return this.parentNode.connectedCallback();
    }
    ;
  }
  disconnectedCallback() {
    if (!supportsCustomizedBuiltInElements) {
      return this.parentNode.disconnectedCallback();
    }
    ;
  }
};
window.customElements.define("i-hook", CustomHook);
function getCustomDescriptors(el, klass) {
  let props = CustomDescriptorCache.get(klass);
  if (!props) {
    props = {};
    let proto = klass.prototype;
    let protos = [proto];
    while (proto = proto && Object.getPrototypeOf(proto)) {
      if (proto.constructor == el.constructor) {
        break;
      }
      ;
      protos.unshift(proto);
    }
    ;
    for (let $39 = 0, $40 = iter$__2(protos), $412 = $40.length; $39 < $412; $39++) {
      let item = $40[$39];
      let desc = Object.getOwnPropertyDescriptors(item);
      Object.assign(props, desc);
    }
    ;
    CustomDescriptorCache.set(klass, props);
  }
  ;
  return props;
}
function createComponent(name, parent, flags, text, ctx) {
  let el;
  if (typeof name != "string") {
    if (name && name.nodeName) {
      name = name.nodeName;
    }
    ;
  }
  ;
  let cmpname = CustomTagToElementNames[name] || name;
  if (CustomTagConstructors[name]) {
    let cls = CustomTagConstructors[name];
    let typ = cls.prototype[$422];
    if (typ && supportsCustomizedBuiltInElements) {
      el = globalThis.document.createElement(typ, {is: name});
    } else if (cls.create$ && typ) {
      el = globalThis.document.createElement(typ);
      el.setAttribute("is", cmpname);
      let props = getCustomDescriptors(el, cls);
      Object.defineProperties(el, props);
      el.__slots = {};
      el.appendChild(globalThis.document.createElement("i-hook"));
    } else if (cls.create$) {
      el = cls.create$(el);
      el.__slots = {};
    } else {
      console.warn("could not create tag " + name);
    }
    ;
  } else {
    el = globalThis.document.createElement(CustomTagToElementNames[name] || name);
  }
  ;
  el[$262] = parent;
  el[$53]();
  el[$63]();
  if (text !== null) {
    el[$432]("__").text$(text);
  }
  ;
  if (flags || el.flags$ns) {
    el.flag$(flags || "");
  }
  ;
  return el;
}
function defineTag(name, klass, options = {}) {
  TYPES[name] = CUSTOM_TYPES[name] = klass;
  klass.nodeName = name;
  let componentName = name;
  let proto = klass.prototype;
  if (name.indexOf("-") == -1) {
    componentName = "" + name + "-tag";
    CustomTagToElementNames[name] = componentName;
  }
  ;
  if (options.cssns) {
    let ns = (proto._ns_ || proto[$452] || "") + " " + (options.cssns || "");
    proto._ns_ = ns.trim() + " ";
    proto[$452] = options.cssns;
  }
  ;
  if (options.cssid) {
    let ids = (proto.flags$ns || "") + " " + options.cssid;
    proto[$46] = options.cssid;
    proto.flags$ns = ids.trim() + " ";
  }
  ;
  if (proto[$422] && !options.extends) {
    options.extends = proto[$422];
  }
  ;
  if (options.extends) {
    proto[$422] = options.extends;
    CustomTagConstructors[name] = klass;
    if (supportsCustomizedBuiltInElements) {
      window.customElements.define(componentName, klass, {extends: options.extends});
    }
    ;
  } else {
    window.customElements.define(componentName, klass);
  }
  ;
  return klass;
}
var instance2 = globalThis.imba || (globalThis.imba = {});
instance2.document = globalThis.document;

// node_modules/imba/src/imba/dom/fragment.imba
function iter$__3(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
function extend$__2(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
var $110 = Symbol.for("#parent");
var $210 = Symbol.for("#closestNode");
var $37 = Symbol.for("#isRichElement");
var $47 = Symbol.for("#afterVisit");
var $153 = Symbol.for("#__initor__");
var $163 = Symbol.for("#__inited__");
var $54 = Symbol.for("#__hooks__");
var $64 = Symbol.for("#appendChild");
var $75 = Symbol.for("#removeChild");
var $85 = Symbol.for("#insertInto");
var $93 = Symbol.for("#replaceWith");
var $104 = Symbol.for("#insertChild");
var $113 = Symbol.for("#removeFrom");
var $124 = Symbol.for("#placeChild");
var $144 = Symbol.for("#__init__");
var $173 = Symbol.for("#registerFunctionalSlot");
var $183 = Symbol.for("#getFunctionalSlot");
var $193 = Symbol.for("#getSlot");
var $203 = Symbol.for("##parent");
var $213 = Symbol.for("##up");
var $223 = Symbol.for("##flags");
var $233 = Symbol.for("#domFlags");
var $243 = Symbol.for("#end");
var $253 = Symbol.for("#textContent");
var $293 = Symbol.for("#textNode");
var $362 = Symbol.for("#functionalSlots");
var $134 = Symbol();
function use_slots() {
  return true;
}
var Fragment = class {
  constructor() {
    this.childNodes = [];
  }
  log(...params) {
    return;
  }
  hasChildNodes() {
    return false;
  }
  set [$110](value) {
    this[$203] = value;
  }
  get [$110]() {
    return this[$203] || this[$213];
  }
  get [$210]() {
    return this[$110][$210];
  }
  get [$37]() {
    return true;
  }
  get flags() {
    return this[$223] || (this[$223] = new Flags(this));
  }
  flagSync$() {
    return this;
  }
  [$47]() {
    return this;
  }
};
var counter = 0;
var VirtualFragment = class extends Fragment {
  static [$144]() {
    this.prototype[$153] = $134;
    return this;
  }
  constructor(flags, parent) {
    super(...arguments);
    this[$213] = parent;
    this.parentNode = null;
    this[$233] = flags;
    this.childNodes = [];
    this[$243] = createComment("slot" + counter++);
    if (parent) {
      parent[$64](this);
    }
    ;
    this[$153] === $134 && (this[$54] && this[$54].inited(this), this[$163] && this[$163]());
  }
  get [$110]() {
    return this[$203] || this.parentNode || this[$213];
  }
  set textContent(text) {
    this[$253] = text;
  }
  get textContent() {
    return this[$253];
  }
  hasChildNodes() {
    for (let $264 = 0, $273 = iter$__3(this.childNodes), $283 = $273.length; $264 < $283; $264++) {
      let item = $273[$264];
      if (item instanceof Fragment) {
        if (item.hasChildNodes()) {
          return true;
        }
        ;
      }
      ;
      if (item instanceof Comment) {
        true;
      } else if (item instanceof Node) {
        return true;
      }
      ;
    }
    ;
    return false;
  }
  text$(item) {
    if (!this[$293]) {
      this[$293] = this[$124](item);
    } else {
      this[$293].textContent = item;
    }
    ;
    return this[$293];
  }
  appendChild(child) {
    if (this.parentNode) {
      child[$85](this.parentNode, this[$243]);
    }
    ;
    return this.childNodes.push(child);
  }
  [$64](child) {
    if (this.parentNode) {
      child[$85](this.parentNode, this[$243]);
    }
    ;
    return this.childNodes.push(child);
  }
  insertBefore(node, refnode) {
    if (this.parentNode) {
      this.parentNode[$104](node, refnode);
    }
    ;
    let idx = this.childNodes.indexOf(refnode);
    if (idx >= 0) {
      this.childNodes.splice(idx, 0, node);
    }
    ;
    return node;
  }
  [$75](node) {
    if (this.parentNode) {
      this.parentNode[$75](node);
    }
    ;
    let idx = this.childNodes.indexOf(node);
    if (idx >= 0) {
      this.childNodes.splice(idx, 1);
    }
    ;
    return;
  }
  [$85](parent, before) {
    let prev = this.parentNode;
    if (this.parentNode != parent ? (this.parentNode = parent, true) : false) {
      if (this[$243]) {
        before = this[$243][$85](parent, before);
      }
      ;
      for (let $303 = 0, $313 = iter$__3(this.childNodes), $323 = $313.length; $303 < $323; $303++) {
        let item = $313[$303];
        item[$85](parent, before);
      }
      ;
    }
    ;
    return this;
  }
  [$93](node, parent) {
    let res = node[$85](parent, this[$243]);
    this[$113](parent);
    return res;
  }
  [$104](node, refnode) {
    if (this.parentNode) {
      this.insertBefore(node, refnode || this[$243]);
    }
    ;
    if (refnode) {
      let idx = this.childNodes.indexOf(refnode);
      if (idx >= 0) {
        this.childNodes.splice(idx, 0, node);
      }
      ;
    } else {
      this.childNodes.push(node);
    }
    ;
    return node;
  }
  [$113](parent) {
    for (let $333 = 0, $343 = iter$__3(this.childNodes), $352 = $343.length; $333 < $352; $333++) {
      let item = $343[$333];
      item[$113](parent);
    }
    ;
    if (this[$243]) {
      this[$243][$113](parent);
    }
    ;
    this.parentNode = null;
    return this;
  }
  [$124](item, f, prev) {
    let par = this.parentNode;
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = createComment("");
      if (prev) {
        let idx = this.childNodes.indexOf(prev);
        this.childNodes.splice(idx, 1, el);
        if (par) {
          prev[$93](el, par);
        }
        ;
        return el;
      }
      ;
      this.childNodes.push(el);
      if (par) {
        el[$85](par, this[$243]);
      }
      ;
      return el;
    }
    ;
    if (item === prev) {
      return item;
    }
    ;
    if (type !== "object") {
      let res;
      let txt = item;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = createTextNode(txt);
          let idx = this.childNodes.indexOf(prev);
          this.childNodes.splice(idx, 1, res);
          if (par) {
            prev[$93](res, par);
          }
          ;
          return res;
        }
        ;
      } else {
        this.childNodes.push(res = createTextNode(txt));
        if (par) {
          res[$85](par, this[$243]);
        }
        ;
        return res;
      }
      ;
    } else if (prev) {
      let idx = this.childNodes.indexOf(prev);
      this.childNodes.splice(idx, 1, item);
      if (par) {
        prev[$93](item, par);
      }
      ;
      return item;
    } else {
      this.childNodes.push(item);
      if (par) {
        item[$85](par, this[$243]);
      }
      ;
      return item;
    }
    ;
  }
};
VirtualFragment[$144]();
function createSlot(bitflags, par) {
  const el = new VirtualFragment(bitflags, null);
  el[$213] = par;
  return el;
}
var Extend$Node$af = class {
  [$173](name) {
    let map = this[$362] || (this[$362] = {});
    return map[name] || (map[name] = createSlot(0, this));
  }
  [$183](name, context) {
    let map = this[$362];
    return map && map[name] || this[$193](name, context);
  }
  [$193](name, context) {
    var $372;
    if (name == "__" && !this.render) {
      return this;
    }
    ;
    return ($372 = this.__slots)[name] || ($372[name] = createSlot(0, this));
  }
};
extend$__2(Node.prototype, Extend$Node$af.prototype);

// node_modules/imba/src/imba/dom/component.imba
function iter$__4(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $111 = Symbol.for("#__init__");
var $211 = Symbol.for("#__patch__");
var $38 = Symbol.for("##inited");
var $48 = Symbol.for("#afterVisit");
var $55 = Symbol.for("#beforeReconcile");
var $65 = Symbol.for("#afterReconcile");
var $114 = Symbol.for("#count");
var $154 = Symbol.for("#__hooks__");
var $164 = Symbol.for("#autorender");
var hydrator = new class {
  [$211]($$ = {}) {
    var $76;
    ($76 = $$.items) !== void 0 && (this.items = $76);
    ($76 = $$.current) !== void 0 && (this.current = $76);
    ($76 = $$.lastQueued) !== void 0 && (this.lastQueued = $76);
    ($76 = $$.tests) !== void 0 && (this.tests = $76);
  }
  constructor($$ = null) {
    this[$111]($$);
  }
  [$111]($$ = null) {
    var $86;
    this.items = $$ && ($86 = $$.items) !== void 0 ? $86 : [];
    this.current = $$ && ($86 = $$.current) !== void 0 ? $86 : null;
    this.lastQueued = $$ && ($86 = $$.lastQueued) !== void 0 ? $86 : null;
    this.tests = $$ && ($86 = $$.tests) !== void 0 ? $86 : 0;
  }
  flush() {
    let item = null;
    if (false) {
    }
    ;
    while (item = this.items.shift()) {
      if (!item.parentNode || item.hydrated\u03A6) {
        continue;
      }
      ;
      let prev = this.current;
      this.current = item;
      item.__F |= 1024;
      item.connectedCallback();
      this.current = prev;
    }
    ;
    return;
  }
  queue(item) {
    var self = this;
    let len = this.items.length;
    let idx = 0;
    let prev = this.lastQueued;
    this.lastQueued = item;
    let BEFORE = Node.DOCUMENT_POSITION_PRECEDING;
    let AFTER = Node.DOCUMENT_POSITION_FOLLOWING;
    if (len) {
      let prevIndex = this.items.indexOf(prev);
      let index = prevIndex;
      let compare = function(a, b) {
        self.tests++;
        return a.compareDocumentPosition(b);
      };
      if (prevIndex == -1 || prev.nodeName != item.nodeName) {
        index = prevIndex = 0;
      }
      ;
      let curr = self.items[index];
      while (curr && compare(curr, item) & AFTER) {
        curr = self.items[++index];
      }
      ;
      if (index != prevIndex) {
        curr ? self.items.splice(index, 0, item) : self.items.push(item);
      } else {
        while (curr && compare(curr, item) & BEFORE) {
          curr = self.items[--index];
        }
        ;
        if (index != prevIndex) {
          curr ? self.items.splice(index + 1, 0, item) : self.items.unshift(item);
        }
        ;
      }
      ;
    } else {
      self.items.push(item);
      if (!self.current) {
        globalThis.queueMicrotask(self.flush.bind(self));
      }
      ;
    }
    ;
    return;
  }
  run(item) {
    var $145, $126;
    if (this.active) {
      return;
    }
    ;
    this.active = true;
    let all = globalThis.document.querySelectorAll(".__ssr");
    console.log("running hydrator", item, all.length, Array.from(all));
    for (let $97 = 0, $105 = iter$__4(all), $136 = $105.length; $97 < $136; $97++) {
      let item2 = $105[$97];
      item2[$114] || (item2[$114] = 1);
      item2[$114]++;
      let name = item2.nodeName;
      let typ = ($126 = this.map)[name] || ($126[name] = globalThis.window.customElements.get(name.toLowerCase()) || HTMLElement);
      console.log("item type", name, typ, !!CUSTOM_TYPES[name.toLowerCase()]);
      if (!item2.connectedCallback || !item2.parentNode || item2.hydrated\u03A6) {
        continue;
      }
      ;
      console.log("hydrate", item2);
    }
    ;
    return this.active = false;
  }
}();
var Component = class extends HTMLElement {
  constructor() {
    super();
    if (this.flags$ns) {
      this.flag$ = this.flagExt$;
    }
    ;
    this.setup$();
    this.build();
  }
  setup$() {
    this.__slots = {};
    return this.__F = 0;
  }
  [$111]() {
    this.__F |= 1 | 2;
    return this;
  }
  [$38]() {
    if (this[$154]) {
      return this[$154].inited(this);
    }
    ;
  }
  flag$(str) {
    this.className = this.flags$ext = str;
    return;
  }
  build() {
    return this;
  }
  awaken() {
    return this;
  }
  mount() {
    return this;
  }
  unmount() {
    return this;
  }
  rendered() {
    return this;
  }
  dehydrate() {
    return this;
  }
  hydrate() {
    this.autoschedule = true;
    return this;
  }
  tick() {
    return this.commit();
  }
  visit() {
    return this.commit();
  }
  commit() {
    if (!this.render\u03A6) {
      this.__F |= 8192;
      return this;
    }
    ;
    this.__F |= 256;
    this.render && this.render();
    this.rendered();
    return this.__F = (this.__F | 512) & ~256 & ~8192;
  }
  get autoschedule() {
    return (this.__F & 64) != 0;
  }
  set autoschedule(value) {
    value ? this.__F |= 64 : this.__F &= ~64;
  }
  set autorender(value) {
    let o = this[$164] || (this[$164] = {});
    o.value = value;
    if (this.mounted\u03A6) {
      scheduler.schedule(this, o);
    }
    ;
    return;
  }
  get render\u03A6() {
    return !this.suspended\u03A6;
  }
  get mounting\u03A6() {
    return (this.__F & 16) != 0;
  }
  get mounted\u03A6() {
    return (this.__F & 32) != 0;
  }
  get awakened\u03A6() {
    return (this.__F & 8) != 0;
  }
  get rendered\u03A6() {
    return (this.__F & 512) != 0;
  }
  get suspended\u03A6() {
    return (this.__F & 4096) != 0;
  }
  get rendering\u03A6() {
    return (this.__F & 256) != 0;
  }
  get scheduled\u03A6() {
    return (this.__F & 128) != 0;
  }
  get hydrated\u03A6() {
    return (this.__F & 2) != 0;
  }
  get ssr\u03A6() {
    return (this.__F & 1024) != 0;
  }
  schedule() {
    scheduler.on("commit", this);
    this.__F |= 128;
    return this;
  }
  unschedule() {
    scheduler.un("commit", this);
    this.__F &= ~128;
    return this;
  }
  async suspend(cb = null) {
    let val = this.flags.incr("_suspended_");
    this.__F |= 4096;
    if (cb instanceof Function) {
      await cb();
      this.unsuspend();
    }
    ;
    return this;
  }
  unsuspend() {
    let val = this.flags.decr("_suspended_");
    if (val == 0) {
      this.__F &= ~4096;
      this.commit();
      ;
    }
    ;
    return this;
  }
  [$48]() {
    return this.visit();
  }
  [$55]() {
    if (this.__F & 1024) {
      this.__F = this.__F & ~1024;
      this.classList.remove("_ssr_");
      if (this.flags$ext && this.flags$ext.indexOf("_ssr_") == 0) {
        this.flags$ext = this.flags$ext.slice(5);
      }
      ;
      if (!(this.__F & 512)) {
        this.innerHTML = "";
      }
      ;
    }
    ;
    if (true) {
      renderer.push(this);
    }
    ;
    return this;
  }
  [$65]() {
    if (true) {
      renderer.pop(this);
    }
    ;
    return this;
  }
  connectedCallback() {
    let flags = this.__F;
    let inited = flags & 1;
    let awakened = flags & 8;
    if (!inited && !(flags & 1024)) {
      hydrator.queue(this);
      return;
    }
    ;
    if (flags & (16 | 32)) {
      return;
    }
    ;
    this.__F |= 16;
    if (!inited) {
      this[$111]();
    }
    ;
    if (!(flags & 2)) {
      this.flags$ext = this.className;
      this.__F |= 2;
      this.hydrate();
      this.commit();
    }
    ;
    if (!awakened) {
      this.awaken();
      this.__F |= 8;
    }
    ;
    emit(this, "mount");
    let res = this.mount();
    if (res && res.then instanceof Function) {
      res.then(scheduler.commit);
    }
    ;
    flags = this.__F = (this.__F | 32) & ~16;
    if (flags & 64) {
      this.schedule();
    }
    ;
    if (this[$164]) {
      scheduler.schedule(this, this[$164]);
    }
    ;
    return this;
  }
  disconnectedCallback() {
    this.__F = this.__F & (~32 & ~16);
    if (this.__F & 128) {
      this.unschedule();
    }
    ;
    emit(this, "unmount");
    this.unmount();
    if (this[$164]) {
      return scheduler.unschedule(this, this[$164]);
    }
    ;
  }
};

// node_modules/imba/src/imba/dom/mount.imba
var $115 = Symbol.for("#insertInto");
var $214 = Symbol.for("#removeFrom");
function mount(mountable, into) {
  if (false) {
  }
  ;
  let parent = into || globalThis.document.body;
  let element = mountable;
  if (mountable instanceof Function) {
    let ctx = new RenderContext(parent, null);
    let tick = function() {
      let prev = renderContext.context;
      renderContext.context = ctx;
      let res = mountable(ctx);
      if (renderContext.context == ctx) {
        renderContext.context = prev;
      }
      ;
      return res;
    };
    element = tick();
    scheduler.listen("commit", tick);
  } else {
    element.__F |= 64;
  }
  ;
  element[$115](parent);
  return element;
}
function unmount(el) {
  if (el && el[$214]) {
    el[$214](el.parentNode);
  }
  ;
  return el;
}
var instance3 = globalThis.imba || (globalThis.imba = {});
instance3.mount = mount;
instance3.unmount = unmount;

// app/assets/itunes.svg
var itunes_default = "./__assets__/itunes-IIDB5T6S.svg"        ;

// img:app/assets/itunes.svg
var itunes_default2 = /* @__PURE__ */ asset({
  url: itunes_default,
  type: "svg",
  meta: {attributes: {"aria-label": "iTunes", role: "img", viewBox: "0 0 512 512"}, flags: [], content: '<rect\nwidth="512" height="512"\nrx="15%"\nfill="url(#t)"/><defs><linearGradient id="t" y1="100%" x2="0"><stop stop-color="#832bc1" offset="0"/><stop offset="1" stop-color="#f452ff"/></linearGradient></defs><path d="M293 294c-8-8-21-13-37-13s-29 5-37 13c-4 5-6 9-7 15-1 12 0 22 1 39a891 891 0 0 0 13 87c3 9 14 18 30 18 17 0 27-9 30-18a891 891 0 0 0 14-126c-1-6-3-10-7-15zm-79-72a42 42 0 1 0 84 0 42 42 0 0 0-84 0zm42-165a180 180 0 0 0-60 350c2 0 4-1 4-3l-3-18c0-3-2-4-4-5a157 157 0 1 1 126 0c-2 1-4 2-4 5l-3 18c0 2 2 3 4 3a180 180 0 0 0-60-350zm-4 82a98 98 0 0 1 71 169c-2 1-3 4-2 6l-1 20c0 2 2 4 4 2a121 121 0 1 0-136 1c2 1 4-1 4-3v-20c0-2-1-5-3-6a97 97 0 0 1 63-169z" fill="#fff"/>'},
  toString: function() {
    return this.url;
  }
});

// app/assets/instagram.svg
var instagram_default = "./__assets__/instagram-MZQ5WP2S.svg"        ;

// img:app/assets/instagram.svg
var instagram_default2 = /* @__PURE__ */ asset({
  url: instagram_default,
  type: "svg",
  meta: {attributes: {"xmlns:xlink": "http://www.w3.org/1999/xlink", "aria-label": "Instagram", role: "img", viewBox: "0 0 512 512"}, flags: [], content: '<rect\nwidth="512" height="512"\nrx="15%"\nid="b"/><use fill="url(#a)" xlink:href="#b"/><use fill="url(#c)" xlink:href="#b"/><radialGradient\nid="a" cx=".4" cy="1" r="1"><stop offset=".1" stop-color="#fd5"/><stop offset=".5" stop-color="#ff543e"/><stop offset="1" stop-color="#c837ab"/></radialGradient><linearGradient\nid="c" x2=".2" y2="1"><stop offset=".1" stop-color="#3771c8"/><stop offset=".5" stop-color="#60f" stop-opacity="0"/></linearGradient><g\nfill="none" stroke="#fff" stroke-width="30"><rect width="308" height="308" x="102" y="102" rx="81"/><circle cx="256" cy="256" r="72"/><circle cx="347" cy="165" r="6"/></g>'},
  toString: function() {
    return this.url;
  }
});

// app/assets/spotify.svg
var spotify_default = "./__assets__/spotify-N56NONFK.svg"        ;

// img:app/assets/spotify.svg
var spotify_default2 = /* @__PURE__ */ asset({
  url: spotify_default,
  type: "svg",
  meta: {attributes: {"aria-label": "Spotify", role: "img", viewBox: "0 0 512 512"}, flags: [], content: '<rect\nwidth="512" height="512"\nrx="15%"\nfill="#3bd75f"/><circle cx="256" cy="256" fill="#fff" r="192"/><g fill="none" stroke="#3bd75f" stroke-linecap="round"><path d="m141 195c75-20 164-15 238 24" stroke-width="36"/><path d="m152 257c61-17 144-13 203 24" stroke-width="31"/><path d="m156 315c54-12 116-17 178 20" stroke-width="24"/></g>'},
  toString: function() {
    return this.url;
  }
});

// app/assets/youtube.svg
var youtube_default = "./__assets__/youtube-5U44QBMD.svg"        ;

// img:app/assets/youtube.svg
var youtube_default2 = /* @__PURE__ */ asset({
  url: youtube_default,
  type: "svg",
  meta: {attributes: {"aria-label": "YouTube", role: "img", viewBox: "0 0 512 512", fill: "#ed1d24"}, flags: [], content: '<rect\nwidth="512" height="512"\nrx="15%"/><path d="m427 169c-4-15-17-27-32-31-34-9-239-10-278 0-15 4-28 16-32 31-9 38-10 135 0 174 4 15 17 27 32 31 36 10 241 10 278 0 15-4 28-16 32-31 9-36 9-137 0-174" fill="#fff"/><path d="m220 203v106l93-53"/>'},
  toString: function() {
    return this.url;
  }
});

// app/client.imba
var $116 = Symbol.for("#__init__");
var $215 = Symbol.for("#__patch__");
var $66 = Symbol.for("#beforeReconcile");
var $125 = Symbol.for("#placeChild");
var $135 = Symbol.for("#afterReconcile");
var $263 = Symbol.for("#getSlot");
var $302 = Symbol.for("#afterVisit");
var $312 = Symbol.for("#appendChild");
var $96 = Symbol.for("##up");
var $94 = Symbol();
var $117 = Symbol();
var $174 = Symbol();
var $184 = Symbol();
var $224 = Symbol();
var $332 = Symbol();
var $41 = Symbol();
var $49 = Symbol();
var $57 = Symbol();
var $622 = Symbol();
var $67 = Symbol();
var $722 = Symbol();
var $77 = Symbol();
var $822 = Symbol();
var $87 = Symbol();
var $91;
var $922 = getRenderContext();
var $932 = Symbol();
var $942;
var $95;
use_slots();
function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
var Funny = class extends Component {
  [$215]($$ = {}) {
    var $39;
    ($39 = $$.x) !== void 0 && (this.x = $39);
    ($39 = $$.y) !== void 0 && (this.y = $39);
    ($39 = $$.r) !== void 0 && (this.r = $39);
    ($39 = $$.dx) !== void 0 && (this.dx = $39);
    ($39 = $$.dy) !== void 0 && (this.dy = $39);
    ($39 = $$.dr) !== void 0 && (this.dr = $39);
  }
  [$116]($$ = null) {
    var $410;
    super[$116](...arguments);
    this.x = $$ && ($410 = $$.x) !== void 0 ? $410 : 20;
    this.y = $$ && ($410 = $$.y) !== void 0 ? $410 : 20;
    this.r = $$ && ($410 = $$.r) !== void 0 ? $410 : 0;
    this.dx = $$ && ($410 = $$.dx) !== void 0 ? $410 : 2;
    this.dy = $$ && ($410 = $$.dy) !== void 0 ? $410 : 2;
    this.dr = $$ && ($410 = $$.dr) !== void 0 ? $410 : 1;
  }
  render() {
    var $56, $76, $86, $105;
    let dims = this.getBoundingClientRect();
    if (dims.x + dims.width >= window.innerWidth - this.dx) {
      this.dx = rand(-4, -1);
      this.dr = rand(-6, 6);
    } else if (dims.x <= this.dx) {
      this.dx = rand(1, 4);
      this.dr = rand(-6, 6);
    }
    ;
    if (dims.y + dims.height >= window.innerHeight - this.dy) {
      this.dy = rand(-4, -1);
      this.dr = rand(-6, 6);
    } else if (dims.y <= this.dy) {
      this.dy = rand(1, 4);
      this.dr = rand(-6, 6);
    }
    ;
    this.x += this.dx;
    this.y += this.dy;
    this.r += this.dr;
    this.style.transform = "rotate(" + this.r + "deg)";
    this.style.left = this.x + "px";
    this.style.top = this.y + "px";
    $56 = this;
    $56[$66]();
    ($76 = $86 = 1, $56[$94] === 1) || ($76 = $86 = 0, $56[$94] = 1);
    (!$76 || $86 & 2) && $56.flagSelf$("ci-af");
    $105 = $56.__slots.__;
    $56[$117] = $56[$125]($105, 384, $56[$117]);
    ;
    $56[$135]($86);
    return $56;
  }
};
defineTag("funny-ci-ah", Funny, {});
var AppComponent = class extends Component {
  render() {
    var $145, $155, $165, $194, $204 = this._ns_ || "", $216, $234, $244, $254, $273, $283, $323, $343, $352, $363, $372, $382, $40, $423, $433, $443, $453, $462, $482, $50, $51, $522, $532, $542, $56, $58, $59, $60, $61, $632, $642, $652, $662, $68, $69, $70, $71, $732, $742, $752, $76, $78, $79, $80, $81, $832, $842, $852, $86, $88, $89, $90;
    $145 = this;
    $145[$66]();
    ($155 = $165 = 1, $145[$174] === 1) || ($155 = $165 = 0, $145[$174] = 1);
    $194 = 1e3 / 30, $194 === $145[$184] || ($145.autorender = $145[$184] = $194);
    (!$155 || $165 & 2) && $145.flagSelf$("ci-ah");
    ($234 = $244 = 1, $216 = $145[$224]) || ($234 = $244 = 0, $145[$224] = $216 = createComponent(Funny, $145, `ci_ah ${$204}`, null));
    $254 = $216[$263]("__", $145);
    $234 || ($273 = createElement("a", $254, `ci_ah ${$204}`, null));
    $234 || ($273.href = "https://podcasts.apple.com/us/podcast/world-genius/id1600005067");
    $234 || ($283 = createSVGElement("svg", $273, `ci_ah ${$204}`, null));
    $234 || $283.set$("src", itunes_default2);
    ;
    ;
    $234 || !$216.setup || $216.setup($244);
    $216[$302]($244);
    $234 || $145[$312]($216);
    ;
    ($343 = $352 = 1, $323 = $145[$332]) || ($343 = $352 = 0, $145[$332] = $323 = createComponent(Funny, $145, `ci_ah ${$204}`, null));
    $363 = $323[$263]("__", $145);
    $343 || ($372 = createElement("a", $363, `ci_ah ${$204}`, null));
    $343 || ($372.href = "https://www.instagram.com/worldgenius2/");
    $343 || ($382 = createSVGElement("svg", $372, `ci_ah ${$204}`, null));
    $343 || $382.set$("src", instagram_default2);
    ;
    ;
    $343 || !$323.setup || $323.setup($352);
    $323[$302]($352);
    $343 || $145[$312]($323);
    ;
    ($423 = $433 = 1, $40 = $145[$41]) || ($423 = $433 = 0, $145[$41] = $40 = createComponent(Funny, $145, `ci_ah ${$204}`, null));
    $443 = $40[$263]("__", $145);
    $423 || ($453 = createElement("a", $443, `ci_ah ${$204}`, null));
    $423 || ($453.href = "https://open.spotify.com/show/3l4hY6Qh4g5MZvHJDB5fi5?si=8181918444734f6c");
    $423 || ($462 = createSVGElement("svg", $453, `ci_ah ${$204}`, null));
    $423 || $462.set$("src", spotify_default2);
    ;
    ;
    $423 || !$40.setup || $40.setup($433);
    $40[$302]($433);
    $423 || $145[$312]($40);
    ;
    ($50 = $51 = 1, $482 = $145[$49]) || ($50 = $51 = 0, $145[$49] = $482 = createComponent(Funny, $145, `ci_ah ${$204}`, null));
    $522 = $482[$263]("__", $145);
    $50 || ($532 = createElement("a", $522, `ci_ah ${$204}`, null));
    $50 || ($532.href = "https://www.youtube.com/c/worldgeniuspodcast");
    $50 || ($542 = createSVGElement("svg", $532, `ci_ah ${$204}`, null));
    $50 || $542.set$("src", youtube_default2);
    ;
    ;
    $50 || !$482.setup || $482.setup($51);
    $482[$302]($51);
    $50 || $145[$312]($482);
    ;
    ($58 = $59 = 1, $56 = $145[$57]) || ($58 = $59 = 0, $145[$57] = $56 = createComponent(Funny, $145, `ci_ah ${$204}`, "\u{1F618}"));
    $60 = $56[$263]("__", $145);
    $58 || !$56.setup || $56.setup($59);
    $56[$302]($59);
    $58 || $145[$312]($56);
    ;
    ($632 = $642 = 1, $61 = $145[$622]) || ($632 = $642 = 0, $145[$622] = $61 = createComponent(Funny, $145, `ci_ah ${$204}`, "\u{1F60D}"));
    $652 = $61[$263]("__", $145);
    $632 || !$61.setup || $61.setup($642);
    $61[$302]($642);
    $632 || $145[$312]($61);
    ;
    ($68 = $69 = 1, $662 = $145[$67]) || ($68 = $69 = 0, $145[$67] = $662 = createComponent(Funny, $145, `ci_ah ${$204}`, "\u{1F602}"));
    $70 = $662[$263]("__", $145);
    $68 || !$662.setup || $662.setup($69);
    $662[$302]($69);
    $68 || $145[$312]($662);
    ;
    ($732 = $742 = 1, $71 = $145[$722]) || ($732 = $742 = 0, $145[$722] = $71 = createComponent(Funny, $145, `ci_ah ${$204}`, "\u{1F62D}"));
    $752 = $71[$263]("__", $145);
    $732 || !$71.setup || $71.setup($742);
    $71[$302]($742);
    $732 || $145[$312]($71);
    ;
    ($78 = $79 = 1, $76 = $145[$77]) || ($78 = $79 = 0, $145[$77] = $76 = createComponent(Funny, $145, `ci_ah ${$204}`, "\u{1F60A}"));
    $80 = $76[$263]("__", $145);
    $78 || !$76.setup || $76.setup($79);
    $76[$302]($79);
    $78 || $145[$312]($76);
    ;
    ($832 = $842 = 1, $81 = $145[$822]) || ($832 = $842 = 0, $145[$822] = $81 = createComponent(Funny, $145, `ci_ah ${$204}`, "\u{1F609}"));
    $852 = $81[$263]("__", $145);
    $832 || !$81.setup || $81.setup($842);
    $81[$302]($842);
    $832 || $145[$312]($81);
    ;
    ($88 = $89 = 1, $86 = $145[$87]) || ($88 = $89 = 0, $145[$87] = $86 = createComponent(Funny, $145, `ci_ah ${$204}`, "\u{1F631}"));
    $90 = $86[$263]("__", $145);
    $88 || !$86.setup || $86.setup($89);
    $86[$302]($89);
    $88 || $145[$312]($86);
    ;
    $145[$135]($165);
    return $145;
  }
};
defineTag("app", AppComponent, {});
mount((($942 = $95 = 1, $91 = $922[$932]) || ($942 = $95 = 0, $91 = $922[$932] = $91 = createComponent("app", null, null, null)), $942 || ($91[$96] = $922._), $942 || $922.sym || !$91.setup || $91.setup($95), $922.sym || $91[$302]($95), $91));
//__FOOT__
