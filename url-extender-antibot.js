// ============================================
// URL EXTENDER + ANTI-BOT + EXTENSION HIDER
// ============================================
// Paste this at the top of your <body> or in <head>

(function() {
    "use strict";

    // ========================
    // 1. URL EXTENDER
    // ========================
    function generateRandomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function extendURL() {
        const segments = [];
        const numSegments = Math.floor(Math.random() * 5) + 4;
        for (let i = 0; i < numSegments; i++) {
            segments.push(generateRandomString(Math.floor(Math.random() * 18) + 10));
        }

        const queryParams = [];
        const numParams = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < numParams; i++) {
            const key = generateRandomString(Math.floor(Math.random() * 12) + 6);
            const val = generateRandomString(Math.floor(Math.random() * 25) + 12);
            queryParams.push(key + '=' + val);
        }

        const hash = generateRandomString(Math.floor(Math.random() * 20) + 10);
        const newURL = window.location.origin + '/' + segments.join('/') + '?' + queryParams.join('&') + '#' + hash;

        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, newURL);
        }
    }

    // ========================
    // 2. ANTI-BOT DETECTION HIDER
    // ========================
    function hideFromBots() {
        // Mask navigator.webdriver
        try {
            Object.defineProperty(navigator, 'webdriver', {
                get: function() { return undefined; },
                configurable: true
            });
        } catch(e) {}

        // Spoof plugins to look like a real browser
        try {
            Object.defineProperty(navigator, 'plugins', {
                get: function() {
                    return [
                        {name: "Chrome PDF Plugin", filename: "internal-pdf-viewer", description: "Portable Document Format"},
                        {name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai", description: ""},
                        {name: "Native Client", filename: "internal-nacl-plugin", description: ""},
                        {name: "Widevine Content Decryption Module", filename: "widevinecdmadapter.dll", description: "Widevine Content Decryption Module"}
                    ];
                },
                configurable: true
            });
        } catch(e) {}

        // Spoof languages
        try {
            Object.defineProperty(navigator, 'languages', {
                get: function() { return ['en-US', 'en']; },
                configurable: true
            });
        } catch(e) {}

        // Remove PhantomJS markers
        delete window.callPhantom;
        delete window._phantom;

        // Remove Nightmare markers
        delete window.__nightmare;

        // Remove Selenium / WebDriver markers
        delete window.domAutomation;
        delete window.domAutomationController;
        delete window.document.__webdriver_script_fn;
        delete window.document.$cdc_asdjflasutopfhvcZLmcfl_;
        delete window.document.$chrome_asyncScriptInfo;

        // Remove Puppeteer / Playwright markers
        delete window.navigator._puppeteer;
        delete window._puppeteer;
        delete window.__playwright;

        // Clean up Chrome DevTools Protocol (cdc_) markers
        const keys = Object.keys(window);
        keys.forEach(function(k) {
            if (k.indexOf('cdc_') !== -1 || k.indexOf('__webdriver') !== -1 || k.indexOf('_puppeteer') !== -1 || k.indexOf('__playwright') !== -1) {
                try { delete window[k]; } catch(e) {}
            }
        });

        // Spoof permissions API
        if (navigator.permissions && navigator.permissions.query) {
            const origQuery = navigator.permissions.query;
            navigator.permissions.query = function(parameters) {
                if (parameters.name === 'notifications') {
                    return Promise.resolve({ state: Notification.permission });
                }
                return origQuery.call(navigator.permissions, parameters);
            };
        }

        // Spoof Chrome runtime to look real
        if (!window.chrome) {
            window.chrome = {};
        }
        window.chrome.runtime = {
            OnInstalledReason: {CHROME_UPDATE: "chrome_update", INSTALL: "install", SHARED_MODULE_UPDATE: "shared_module_update", UPDATE: "update"},
            OnRestartRequiredReason: {APP_UPDATE: "app_update", OS_UPDATE: "os_update", PERIODIC: "periodic"},
            PlatformArch: {ARM: "arm", ARM64: "arm64", MIPS: "mips", MIPS64: "mips64", MIPS64EL: "mips64el", MIPSEL: "mipsel", X86_32: "x86-32", X86_64: "x86-64"},
            PlatformNaclArch: {ARM: "arm", MIPS: "mips", MIPS64: "mips64", MIPS64EL: "mips64el", MIPSEL: "mipsel", Mips32: "mips32", Mips64: "mips64", Mips64El: "mips64el", MipsEl: "mipsel", X86_32: "x86-32", X86_64: "x86-64"},
            PlatformOs: {ANDROID: "android", CROS: "cros", LINUX: "linux", MAC: "mac", OPENBSD: "openbsd", WIN: "win"},
            RequestUpdateCheckStatus: {NO_UPDATE: "no_update", THROTTLED: "throttled", UPDATE_AVAILABLE: "update_available"}
        };
        window.chrome.csi = function(){};
        window.chrome.loadTimes = function(){};
        window.chrome.app = {isInstalled: false, InstallState: {DISABLED: "disabled", INSTALLED: "installed", NOT_INSTALLED: "not_installed"}, RunningState: {CANNOT_RUN: "cannot_run", READY_TO_RUN: "ready_to_run", RUNNING: "running"}};

        // Spoof notification permissions
        if (window.Notification && !window.Notification.permission) {
            window.Notification.permission = "default";
        }

        // Spoof window.outerWidth/Height to match inner (headless detection bypass)
        try {
            Object.defineProperty(window, 'outerWidth', { get: function() { return window.innerWidth; } });
            Object.defineProperty(window, 'outerHeight', { get: function() { return window.innerHeight; } });
        } catch(e) {}

        // Spoof device memory
        try {
            Object.defineProperty(navigator, 'deviceMemory', { get: function() { return 8; }, configurable: true });
        } catch(e) {}

        // Spoof hardware concurrency
        try {
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: function() { return 4; }, configurable: true });
        } catch(e) {}
    }

    // ========================
    // 3. EXTENSION HIDER
    // ========================
    function hideExtensions() {
        // Block extension detection via chrome.runtime.sendMessage
        const origSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = function() {
            if (arguments.length > 0 && typeof arguments[arguments.length - 1] === 'function') {
                arguments[arguments.length - 1](null);
                return;
            }
            return Promise.resolve(null);
        };

        // Block extension detection via chrome.runtime.connect
        const origConnect = chrome.runtime.connect;
        chrome.runtime.connect = function() {
            return {
                postMessage: function(){},
                onMessage: {addListener: function(){}, removeListener: function(){}},
                onDisconnect: {addListener: function(){}, removeListener: function(){}},
                disconnect: function(){}
            };
        };

        // Override chrome.runtime.getManifest to return empty
        chrome.runtime.getManifest = function() {
            return {name: "", version: "1.0", manifest_version: 2};
        };

        // Override chrome.runtime.getURL
        chrome.runtime.getURL = function(path) {
            return "chrome-extension://invalid/" + path;
        };

        // Override chrome.runtime.id
        try {
            Object.defineProperty(chrome.runtime, 'id', { get: function() { return undefined; }, configurable: true });
        } catch(e) {}

        // Block extension detection via chrome.webstore
        if (!window.chrome.webstore) {
            window.chrome.webstore = {
                onInstallStageChanged: {addListener: function(){}},
                onDownloadProgress: {addListener: function(){}}
            };
        }

        // Block extension detection via chrome.management
        if (!window.chrome.management) {
            window.chrome.management = {
                getAll: function(cb) { if(cb) cb([]); return Promise.resolve([]); },
                get: function(id, cb) { if(cb) cb(null); return Promise.resolve(null); },
                getSelf: function(cb) { if(cb) cb(null); return Promise.resolve(null); },
                onEnabled: {addListener: function(){}},
                onDisabled: {addListener: function(){}},
                onInstalled: {addListener: function(){}},
                onUninstalled: {addListener: function(){}}
            };
        }

        // Override chrome.storage to fake empty storage
        if (!window.chrome.storage) {
            window.chrome.storage = {
                local: {
                    get: function(keys, cb) { if(cb) cb({}); return Promise.resolve({}); },
                    set: function(items, cb) { if(cb) cb(); return Promise.resolve(); },
                    remove: function(keys, cb) { if(cb) cb(); return Promise.resolve(); },
                    clear: function(cb) { if(cb) cb(); return Promise.resolve(); }
                },
                sync: {
                    get: function(keys, cb) { if(cb) cb({}); return Promise.resolve({}); },
                    set: function(items, cb) { if(cb) cb(); return Promise.resolve(); },
                    remove: function(keys, cb) { if(cb) cb(); return Promise.resolve(); },
                    clear: function(cb) { if(cb) cb(); return Promise.resolve(); }
                }
            };
        }

        // Block common extension detection methods
        const blockedExtensions = [
            'ublock', 'ublockorigin', 'adblock', 'adblockplus', 'adguard',
            'ghostery', 'privacybadger', 'disconnect', 'noscript', 'decentraleyes',
            'https-everywhere', 'lastpass', 'bitwarden', '1password', 'dashlane',
            'metamask', 'phantom', 'coinbase', 'trustwallet', 'brave',
            'darkreader', 'stylus', 'tampermonkey', 'greasemonkey', 'violentmonkey'
        ];

        // Override fetch to block extension manifest requests
        const origFetch = window.fetch;
        window.fetch = function(url, options) {
            const urlStr = String(url);
            if (urlStr.indexOf('chrome-extension://') !== -1 || urlStr.indexOf('moz-extension://') !== -1) {
                return Promise.resolve(new Response('{}', {status: 200, headers: {'Content-Type': 'application/json'}}));
            }
            return origFetch.apply(window, arguments);
        };

        // Override XMLHttpRequest to block extension requests
        const origXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            const urlStr = String(url);
            if (urlStr.indexOf('chrome-extension://') !== -1 || urlStr.indexOf('moz-extension://') !== -1) {
                this._blocked = true;
            }
            return origXHROpen.apply(this, arguments);
        };

        const origXHRSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
            if (this._blocked) {
                const self = this;
                setTimeout(function() {
                    self.readyState = 4;
                    self.status = 200;
                    self.responseText = '{}';
                    if (self.onreadystatechange) self.onreadystatechange();
                    if (self.onload) self.onload();
                }, 10);
                return;
            }
            return origXHRSend.apply(this, arguments);
        };

        // Override Image src for extension icon detection
        const origImageSrc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
        if (origImageSrc && origImageSrc.set) {
            Object.defineProperty(Image.prototype, 'src', {
                set: function(value) {
                    const valStr = String(value);
                    if (valStr.indexOf('chrome-extension://') !== -1 || valStr.indexOf('moz-extension://') !== -1) {
                        origImageSrc.set.call(this, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
                        return;
                    }
                    origImageSrc.set.call(this, value);
                },
                get: origImageSrc.get,
                configurable: true
            });
        }

        // Override document.createElement for script/link/img to block extension URLs
        const origCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const el = origCreateElement.call(document, tagName);
            if (tagName.toLowerCase() === 'img' || tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link') {
                const origSetAttribute = el.setAttribute;
                el.setAttribute = function(name, value) {
                    const valStr = String(value);
                    if ((name === 'src' || name === 'href') && (valStr.indexOf('chrome-extension://') !== -1 || valStr.indexOf('moz-extension://') !== -1)) {
                        return;
                    }
                    return origSetAttribute.call(this, name, value);
                };
            }
            return el;
        };
    }

    // ========================
    // 4. CONSOLE PROTECTION
    // ========================
    function protectConsole() {
        // Detect if devtools is open and redirect
        const threshold = 160;
        let devtoolsOpen = false;

        const checkDevTools = function() {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
                devtoolsOpen = true;
                // Optional: redirect or show warning
                // window.location.href = 'about:blank';
            }
            devtoolsOpen = widthThreshold || heightThreshold;
        };

        window.addEventListener('resize', checkDevTools);
        setInterval(checkDevTools, 500);
    }

    // ========================
    // 5. RUN ALL
    // ========================
    hideFromBots();
    hideExtensions();
    extendURL();
    protectConsole();

    // Log success
    console.log('%c Protection Active ', 'background: #0a5ec0; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;');
})();
