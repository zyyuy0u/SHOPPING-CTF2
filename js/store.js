/**
 * 購物系統 CTF — 共用資料與邏輯層
 * 使用 localStorage 取代資料庫
 */

var Store = (function () {
    // ---------------------------------------------------------------
    // Flag 混淆：以 XOR + Base64 編碼存放，執行時才解碼
    // ---------------------------------------------------------------
    var _k = [0x53, 0x48, 0x4f, 0x50];  // 混淆金鑰
    // 編碼後的 Flag（不會以明文出現在原始碼中）
    var _ef = [0x15,0x04,0x0e,0x17,0x28,0x2f,0x7f,0x3c,0x37,0x7b,0x21,0x0f,0x34,0x79,0x29,0x24,0x0c,0x2a,0x7f,0x28,0x0c,0x38,0x3a,0x22,0x30,0x20,0x7b,0x23,0x60,0x2c,0x32];

    function _d(enc) {
        var r = '';
        for (var i = 0; i < enc.length; i++) {
            r += String.fromCharCode(enc[i] ^ _k[i % _k.length]);
        }
        return r;
    }

    // ---------------------------------------------------------------
    // 商品資料
    // ---------------------------------------------------------------
    var PRODUCTS = [
        { id: 1, name: '鑰匙圈',         price: 50,     description: '可愛小飾品',         isGift: false },
        { id: 2, name: '馬克杯',          price: 100,    description: '質感陶瓷杯',         isGift: false },
        { id: 3, name: '藍牙耳機',        price: 500,    description: '無線藍牙耳機',       isGift: false },
        { id: 4, name: '智慧手錶',        price: 1000,   description: '多功能智慧手錶',     isGift: false },
        { id: 5, name: '筆記型電腦',      price: 30000,  description: '高效能筆電',         isGift: false },
        { id: 6, name: '\u{1F381} 限量黃金禮盒', price: 100000, description: '購買此商品即完成挑戰', isGift: true },
    ];

    // ---------------------------------------------------------------
    // localStorage 操作
    // ---------------------------------------------------------------
    function _get(key, def) {
        try {
            var v = localStorage.getItem('ctf_' + key);
            return v !== null ? JSON.parse(v) : def;
        } catch (e) { return def; }
    }
    function _set(key, val) {
        localStorage.setItem('ctf_' + key, JSON.stringify(val));
    }

    // 初始化（首次訪問）
    function init() {
        if (_get('initialized', false)) return;
        _set('balance', 100);
        _set('cart', {});
        _set('purchases', []);
        _set('flag_submissions', []);
        _set('flag_solved', false);
        _set('initialized', true);
    }

    function getBalance()    { return _get('balance', 100); }
    function setBalance(v)   { _set('balance', v); }
    function getCart()        { return _get('cart', {}); }
    function setCart(c)       { _set('cart', c); }
    function getPurchases()   { return _get('purchases', []); }

    function getProducts()    { return PRODUCTS; }
    function getProduct(id) {
        return PRODUCTS.find(function (p) { return p.id === id; }) || null;
    }

    // 加入購物車
    function addToCart(productId, quantity) {
        var product = getProduct(productId);
        if (!product) return null;
        if (quantity === 0) return null;

        var cart = getCart();
        var key = String(productId);
        if (cart[key]) {
            cart[key].quantity += quantity;
        } else {
            cart[key] = {
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: quantity,
                isGift: product.isGift,
            };
        }
        setCart(cart);
        return product;
    }

    // 結帳 — 含漏洞邏輯（與原版 buy.php 完全一致）
    function checkout() {
        var cart = getCart();
        if (Object.keys(cart).length === 0) {
            return { success: false, message: '購物車是空的' };
        }

        var balance = getBalance();
        var boughtItems = [];
        var failedItems = [];
        var giftPurchased = false;
        var purchases = getPurchases();

        for (var key in cart) {
            var item = cart[key];
            var product = getProduct(item.productId);
            if (!product) continue;

            var quantity = parseInt(item.quantity, 10);  // ⚠️ 未驗證負數
            if (quantity === 0) continue;

            // 計算總金額（漏洞：負數 quantity 導致負數 total）
            var total = product.price * quantity;

            // 餘額檢查（漏洞：負數 total 使條件永遠成立）
            if (balance >= total) {
                balance = balance - total;  // 減去負數 = 加法

                // 記錄購買
                purchases.push({
                    name: product.name,
                    quantity: quantity,
                    totalPrice: total,
                    createdAt: new Date().toLocaleString('zh-TW'),
                });

                // Flag 觸發：成功購買目標禮物
                if (product.isGift && quantity > 0) {
                    giftPurchased = true;
                }

                boughtItems.push(product.name + ' x' + quantity);
            } else {
                failedItems.push(product.name);
            }
        }

        // 更新餘額
        setBalance(balance);
        _set('purchases', purchases);

        // 清空購物車
        setCart({});

        // 結果
        var result = {
            success: boughtItems.length > 0,
            boughtItems: boughtItems,
            failedItems: failedItems,
            balance: balance,
            showFlag: false,
            flag: null,
        };

        if (giftPurchased) {
            result.showFlag = true;
            result.flag = _d(_ef);
        }

        // 建立訊息
        if (boughtItems.length > 0) {
            result.message = '結帳成功：' + boughtItems.join('、') + '。餘額 $' + balance.toLocaleString();
            result.messageType = 'success';
        } else {
            result.message = '餘額不足，無法結帳';
            result.messageType = 'danger';
        }
        if (failedItems.length > 0) {
            result.message += '（餘額不足：' + failedItems.join('、') + '）';
        }

        return result;
    }

    // Flag 提交驗證
    function submitFlag(submittedFlag) {
        var correct = (submittedFlag === _d(_ef));

        var submissions = _get('flag_submissions', []);
        submissions.unshift({
            submittedFlag: submittedFlag,
            isCorrect: correct,
            createdAt: new Date().toLocaleString('zh-TW'),
        });
        _set('flag_submissions', submissions);

        if (correct) {
            _set('flag_solved', true);
        }

        return correct;
    }

    function isFlagSolved()     { return _get('flag_solved', false); }
    function getSubmissions()    { return _get('flag_submissions', []); }

    function getCartCount() {
        var cart = getCart();
        var count = 0;
        for (var k in cart) { count += Math.abs(cart[k].quantity); }
        return count;
    }

    // 重置所有資料
    function reset() {
        var keys = ['balance','cart','purchases','flag_submissions','flag_solved','initialized'];
        keys.forEach(function(k) { localStorage.removeItem('ctf_' + k); });
        init();
    }

    // 公開 API
    return {
        init: init,
        getBalance: getBalance,
        getProducts: getProducts,
        getProduct: getProduct,
        addToCart: addToCart,
        getCart: getCart,
        setCart: setCart,
        getCartCount: getCartCount,
        checkout: checkout,
        getPurchases: getPurchases,
        submitFlag: submitFlag,
        isFlagSolved: isFlagSolved,
        getSubmissions: getSubmissions,
        reset: reset,
    };
})();

// 自動初始化
Store.init();

// 共用工具函式
function copyFlag(el) {
    var text = el.textContent.trim();
    navigator.clipboard.writeText(text).then(function () {
        var orig = el.textContent;
        el.textContent = 'Copied!';
        el.style.color = 'var(--neon-cyan)';
        setTimeout(function () {
            el.textContent = orig;
            el.style.color = '';
        }, 1500);
    });
}

function showMessage(containerId, msg, type) {
    var area = document.getElementById(containerId);
    if (!area) return;
    area.innerHTML =
        '<div class="alert alert-' + type + ' alert-dismissible fade show">' +
        '<span class="terminal-prefix">' + escapeHtml(msg) + '</span>' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
}

function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function formatNumber(n) {
    return n.toLocaleString('en-US');
}

function updateCartBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    var count = Store.getCartCount();
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = '';
    } else {
        badge.style.display = 'none';
    }
}
