"use strict";
var _createClass = function() {
    function s(t, e) {
        for (var i = 0; i < e.length; i++) {
            var s = e[i];
            s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(t, s.key, s)
        }
    }
    return function(t, e, i) {
        return e && s(t.prototype, e), i && s(t, i), t
    }
}();

function _classCallCheck(t, e) {
    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
}

function debounce(s, a, r) {
    var n;
    return function() {
        var t = this,
            e = arguments,
            i = r && !n;
        clearTimeout(n), n = setTimeout(function() {
            n = null, r || s.apply(t, e)
        }, a), i && s.apply(t, e)
    }
}

function startVisibleAreaTracking() {
    var lastWidth = 0;
    var lastHeight = 0;
    var scheduled = !1;
    var root = document.documentElement;

    function updateVisibleArea() {
        scheduled = !1;
        var viewport = window.visualViewport || {
            width: window.innerWidth,
            height: window.innerHeight,
            scale: 1
        };
        var innerWidth = window.innerWidth;
        var innerHeight = window.innerHeight;
        var visibleWidth = Math.round(Math.max(innerWidth, viewport.width));
        var visibleHeight = Math.round(Math.max(innerHeight, viewport.height));
        if (visibleWidth !== lastWidth) {
            root.style.setProperty("--visible-width", visibleWidth + "px");
            lastWidth = visibleWidth;
        }
        if (visibleHeight !== lastHeight) {
            root.style.setProperty("--visible-height", visibleHeight + "px");
            lastHeight = visibleHeight;
        }
        var baselineHeight = Math.max(innerHeight, visibleHeight);
        var scale = Math.min(1, viewport.height / baselineHeight);
        root.style.setProperty("--visible-scale", scale.toFixed(3));
        document.body.classList.toggle("visible-area--compact", scale < 0.9);
    }

    function scheduleUpdate() {
        if (scheduled) return;
        scheduled = !0;
        requestAnimationFrame(updateVisibleArea);
    }

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", scheduleUpdate);
        window.visualViewport.addEventListener("scroll", scheduleUpdate);
    }
}

startVisibleAreaTracking();
window.location.origin || (window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : ""));
var preloadImage = function(e) {
        var i = !1;
        if (Array.from(document.querySelectorAll(".--preloaded-image")).forEach(function(t) {
                if (t.id == e) return !(i = !0)
            }), i) return !1;
        var t = new Image;
        t.src = e, t.id = e, t.classList.add("--preloaded-image"), document.body.appendChild(t)
    },
    Game = function() {
        function i(t) {
            var e = this;
            _classCallCheck(this, i), console.log(t), this.hideButton = t.hideButton, this.stage = 0, this.stages = [], this.defaultButtonImageUrl = "./images/red-button.png", this.waitingForReload = false;

            // Сохраняем ссылки на Yandex SDK и игрока
            this.ysdk = t.ysdk || null;
            this.player = t.player || null;

            // Используем начальный этап из параметров или localStorage
            this.stage = t.initialStage !== undefined ? t.initialStage : (+window.localStorage.currentGameStage || 0);

            if (t.stagesUrl && "localhost" || "igroutka.ru" || "games.igroutka.ru" === window.location.hostname ? fetch(t.stagesUrl).then(function(t) {
                    return t.json()
                }).then(function(t) {
                    e.stages = t, e.stages.forEach(function(t, e) {
                        t.image && t.image.url && preloadImage(t.image.url)
                    }), e.handleClick()
                }) : t.stages && (this.stages = stages), !document.querySelector(t.wrapperSelector)) throw new Error("Game app wrapper not found by specified selector");
            this.appWrapper = document.querySelector(t.wrapperSelector), this.createMarkup(), this.clickDelay = t.clickDelay || 0, this.cooldownTimer = null, this.button.addEventListener("click", debounce(function() {
                e.startClickCooldown(), e.handleClick()
            }, this.clickDelay, !0));

            // Обработчики изменения размера окна и iframe для адаптивности
            var self = this;
            this.handleFrameResize = debounce(function() {
                self.updateButtonSizes();
            }, 150);
            window.addEventListener("resize", this.handleFrameResize);
            window.ResizeObserver && (this.resizeObserver = new ResizeObserver(this.handleFrameResize), this.resizeObserver.observe(document.documentElement))
        }
        return _createClass(i, [{
            key: "startClickCooldown",
            value: function() {
                if (!this.clickDelay) return;
                document.body.classList.add("game-cooldown"), this.cooldownTimer && clearTimeout(this.cooldownTimer), this.cooldownTimer = setTimeout(function() {
                    document.body.classList.remove("game-cooldown")
                }, this.clickDelay)
            }
        }, {
            key: "createMarkup",
            value: function() {
                var e = this;
                if (this.buttonWrapper = document.createElement("div"), this.buttonWrapper.classList.add("button-wrapper"), this.appWrapper.appendChild(this.buttonWrapper), this.messageBox = document.createElement("div"), this.messageBox.classList.add("message-box"), this.appWrapper.appendChild(this.messageBox), this.button = document.createElement("div"), this.button.classList.add("button", "button--red", "button--true"), this.buttonWrapper.appendChild(this.button), this.buttonSize = parseInt(window.getComputedStyle(this.button).getPropertyValue("width")), this.buttonMargin = parseInt(window.getComputedStyle(this.button).getPropertyValue("margin")), this.hideButton) {
                    var t = document.createElement("div");
                    t.classList.add("hide-button"), this.appWrapper.after(t), "true" == localStorage.gameHiddenByButton ? (this.appWrapper.style.transition = "none", this.appWrapper.classList.add("hidden")) : this.appWrapper.classList.remove("hidden"), t.addEventListener("click", function(t) {
                        e.appWrapper.classList.contains("hidden") ? (e.appWrapper.classList.remove("hidden"), localStorage.gameHiddenByButton = !1) : (e.appWrapper.classList.add("hidden"), localStorage.gameHiddenByButton = !0)
                    })
                }
            }
        }, {
            key: "clearField",
            value: function() {
                var e = this;
                this.appWrapper.setAttribute("style", ""), this.button.setAttribute("style", ""), this.buttonWrapper.setAttribute("style", ""), this.currentPopup && this.currentPopup.classList.remove("visible"), this.currentAnimationClass && this.button.classList.remove(this.currentAnimationClass), this.button.classList.remove("button--green", "button--blue"), this.button.classList.add("button--red"), this.button.querySelector(".button-ref") && this.button.querySelector(".button-ref").remove(), Array.from(this.buttonWrapper.querySelectorAll(".button")).map(function(t) {
                    t != e.button && t.remove()
                })
            }
        }, {
            key: "saveProgress",
            value: function() {
                var e = this;
                // Сохраняем в localStorage
                window.localStorage.currentGameStage = this.stage;

                // Сохраняем в облачные сохранения Яндекса
                if (this.player) {
                    this.player.setData({
                        currentGameStage: this.stage
                    }).then(function() {
                        console.log('Cloud save successful, stage:', e.stage);
                    }).catch(function(err) {
                        console.log('Cloud save failed:', err);
                    });
                }
            }
        }, {
            key: "handleClick",
            value: function() {
                if (this.waitingForReload) return;
                this.saveProgress();
                this.clearField();
                var t = this.stages[this.stage];
                if (t.skip) return this.messageBox.innerHTML = "Кнопка была нажата " + this.stage + " раз", void this.stage++;
                (this.messageBox.innerHTML = t.message, t.image ? (this.button.classList.add("button--custom"), this.button.style.backgroundImage = "url('" + t.image.url + "')") : this.button.classList.remove("button--custom"), t.backgroundImage) && (document.querySelector("body").style.backgroundImage = t.backgroundImage);
                if (t.transform && (this.button.style.transform = t.transform), t.animation && t.animation.class && (this.currentAnimationClass = t.animation.class, this.button.classList.add(t.animation.class)), t.multiply && "grid" == t.multiply.type) {
                    var e = t.multiply.x * t.multiply.y,
                        i = t.multiply.true.x + t.multiply.x * (t.multiply.true.y - 1),
                        s = this.getGridSizing(t.multiply.x, t.multiply.y),
                        a = this.buttonSize + 2 * this.buttonMargin;
                    s.use ? (this.buttonWrapper.style.width = "100%", this.button.style.width = s.size + "px", this.button.style.height = s.size + "px", this.button.style.margin = s.margin + "px") : this.buttonWrapper.style.width = t.multiply.x * a + "px";
                    for (var r = 1; r < e; r++) {
                        var n = document.createElement("div");
                        n.classList.add("button"), s.use && (n.style.width = s.size + "px", n.style.height = s.size + "px", n.style.margin = s.margin + "px"), r < i ? this.buttonWrapper.insertBefore(n, this.button) : this.buttonWrapper.appendChild(n)
                    }
                }
                if (t.multiply && "rgb" == t.multiply.type) {
                    for (var n = 1; n < 3; n++) {
                        var o = document.createElement("div");
                        o.classList.add("button"), n < t.multiply.true ? this.buttonWrapper.insertBefore(o, this.button) : this.buttonWrapper.appendChild(o)
                    }
                    this.buttonWrapper.querySelectorAll(".button")[0].classList.add("button--blue"), this.buttonWrapper.querySelectorAll(".button")[1].classList.add("button--red"), this.buttonWrapper.querySelectorAll(".button")[2].classList.add("button--green")
                }
                if (t.popup && (t.popup.classList.add("visible"), this.currentPopup = t.popup), t.randomize) {
                    var u = Math.floor(Math.random() * t.randomize.amount);
                    this.buttonWrapper.style.width = "100%";
                    for (var l = 0; l < t.randomize.amount; l++) {
                        var p = document.createElement("div");
                        p.classList.add("button");
                        var d = Math.random() + .5,
                            c = d * this.buttonSize,
                            h = d * this.buttonMargin;
                        switch (p.style.width = c + "px", p.style.height = c + "px", p.style.margin = h + "px", Math.floor(3 * d) % 3) {
                            case 0:
                                p.classList.add("button--blue");
                                break;
                            case 1:
                                p.classList.add("button--green")
                        }
                        if (l < u) this.buttonWrapper.insertBefore(p, this.button);
                        else if (l == u) {
                            switch (Math.floor(3 * d) % 3) {
                                case 0:
                                    this.button.classList.add("button--blue");
                                    break;
                                case 1:
                                    this.button.classList.add("button--green")
                            }
                            this.button.style.width = c + "px", this.button.style.height = c + "px", this.button.style.margin = h + "px"
                        } else this.buttonWrapper.appendChild(p)
                    }
                }
                if (t.removeElements && (t.removeElements.forEach(function(t) {
                        var e = document.querySelector(t);
                        e && e.remove()
                    }), document.querySelector("#news").style.background = "transparent"), t.link) {
                    var m = document.createElement("a");
                    m.setAttribute("href", t.link), m.setAttribute("target", "_top"), m.classList.add("button-ref"), this.button.appendChild(m)
                }
                if (t.waitForReload) {
                    // Сохраняем прогресс сразу на шаг из waitForReload
                    window.localStorage.currentGameStage = t.waitForReload;
                    if (this.player) {
                        this.player.setData({
                            currentGameStage: t.waitForReload
                        }).then(function() {
                            console.log('Stage saved for reload:', t.waitForReload);
                        }).catch(function(err) {
                            console.log('Stage save failed:', err);
                        });
                    }
                    this.waitingForReload = true;
                    this.button.classList.add("button--disabled");
                    this.button.style.pointerEvents = "none";
                    this.button.setAttribute("draggable", "false");
                    return;
                }
                t.restart && this.reset(), this.stage++
            }
        }, {
            key: "updateButtonSizes",
            value: function() {
                // Обновляем базовые размеры кнопки из CSS
                this.buttonSize = parseInt(window.getComputedStyle(this.button).getPropertyValue("width"));
                this.buttonMargin = parseInt(window.getComputedStyle(this.button).getPropertyValue("margin"));

                // Пересчитываем размеры сетки кнопок если они есть
                var buttons = this.buttonWrapper.querySelectorAll(".button");
                if (buttons.length > 1) {
                    var t = this.stages[this.stage - 1]; // Текущий этап (stage уже увеличен)
                    if (t && t.multiply && "grid" == t.multiply.type) {
                        var s = this.getGridSizing(t.multiply.x, t.multiply.y),
                            e = this.buttonSize + 2 * this.buttonMargin;
                        s.use ? this.buttonWrapper.style.width = "100%" : this.buttonWrapper.style.width = t.multiply.x * e + "px";
                        if (s.use) {
                            buttons.forEach(function(btn) {
                                btn.style.width = s.size + "px";
                                btn.style.height = s.size + "px";
                                btn.style.margin = s.margin + "px";
                            });
                        } else {
                            buttons.forEach(function(btn) {
                                btn.style.width = "";
                                btn.style.height = "";
                                btn.style.margin = "";
                            });
                        }
                    }
                }
            }
        }, {
            key: "reset",
            value: function() {
                window.localStorage.currentGameStage = 0;
                this.stage = 0;

                // Сбрасываем облачное сохранение
                if (this.player) {
                    this.player.setData({
                        currentGameStage: 0
                    }).catch(function(err) {
                        console.log('Cloud save reset failed:', err);
                    });
                }

                this.clearField();
                this.handleClick();
            }
        }, {
            key: "getGridSizing",
            value: function(t, e) {
                var i = this.appWrapper.parentElement || this.appWrapper,
                    s = window.getComputedStyle(i),
                    a = window.getComputedStyle(this.messageBox),
                    r = window.getComputedStyle(this.buttonWrapper),
                    n = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom),
                    o = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight),
                    u = this.messageBox.offsetHeight + parseFloat(a.marginTop) + parseFloat(a.marginBottom),
                    l = parseFloat(r.marginTop) + parseFloat(r.marginBottom),
                    p = i.clientWidth - o,
                    d = i.clientHeight - n - u - l,
                    c = {
                        size: 80,
                        margin: 10,
                        use: !1
                    };
                if (!(p > 0 && d > 0 && t > 0 && e > 0)) return c;
                var h = Math.min(p / t, d / e),
                    m = this.buttonSize + 2 * this.buttonMargin,
                    f = t * e >= 49;
                return f ? (c.size = .7 * h, c.margin = .05 * h, c.use = !0) : (c.size = .8 * h, c.margin = .1 * h, c.use = h < m), c
            }
        }]), i
    }();
