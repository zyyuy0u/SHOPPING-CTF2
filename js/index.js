/**
 * 首頁邏輯 — 商品列表、加入購物車、Flag 彈窗
 */
(function () {
    // 更新餘額顯示
    function updateBalance() {
        document.getElementById('balanceDisplay').textContent = '$' + formatNumber(Store.getBalance());
    }

    // 渲染商品列表
    function renderProducts() {
        var grid = document.getElementById('productGrid');
        var products = Store.getProducts();
        grid.innerHTML = '';

        products.forEach(function (p) {
            var isGift = p.isGift;
            var col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML =
                '<div class="card product-card ' + (isGift ? 'gift-card' : '') + '">' +
                '  <div class="card-header">' + escapeHtml(p.name) + '</div>' +
                '  <div class="card-body">' +
                '    <p class="card-text">' + escapeHtml(p.description) + '</p>' +
                '    <p class="price-tag">$' + formatNumber(p.price) + '</p>' +
                '    <div class="d-flex gap-2 mt-3">' +
                '      <input type="text" inputmode="numeric" value="1" class="form-control qty-input" style="width:80px;" data-id="' + p.id + '">' +
                '      <button class="btn ' + (isGift ? 'btn-hack-gold' : 'btn-hack') + ' btn-add" data-id="' + p.id + '">加入購物車</button>' +
                '    </div>' +
                '  </div>' +
                '</div>';
            grid.appendChild(col);
        });

        // 綁定加入購物車事件
        grid.querySelectorAll('.btn-add').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(this.dataset.id, 10);
                var input = grid.querySelector('.qty-input[data-id="' + id + '"]');
                var raw = input.value.trim();

                // 驗證：不可為小數
                if (raw !== '' && !Number.isInteger(Number(raw))) {
                    showMessage('messageArea', '數量不能是小數，請輸入整數！', 'warning');
                    return;
                }
                var qty = parseInt(raw, 10);
                if (isNaN(qty) || qty === 0) {
                    showMessage('messageArea', '數量不可為零', 'warning');
                    return;
                }

                var product = Store.addToCart(id, qty);
                if (product) {
                    showMessage('messageArea', '已將 ' + product.name + ' x' + qty + ' 加入購物車', 'success');
                    updateCartBadge();
                }
            });
        });
    }

    // 渲染購買紀錄（只顯示正數數量）
    function renderPurchases() {
        var container = document.getElementById('purchaseHistory');
        var purchases = Store.getPurchases().filter(function (p) { return p.quantity > 0; });

        if (purchases.length === 0) {
            container.innerHTML = '';
            return;
        }

        var rows = purchases.slice(0, 10).map(function (p) {
            return '<tr>' +
                '<td>' + escapeHtml(p.name) + '</td>' +
                '<td>' + p.quantity + '</td>' +
                '<td>$' + formatNumber(p.totalPrice) + '</td>' +
                '<td style="color:rgba(0,229,255,0.6);">' + p.createdAt + '</td>' +
                '</tr>';
        }).join('');

        container.innerHTML =
            '<h3 class="section-title mt-5">購買紀錄</h3>' +
            '<div class="purchase-table-wrap">' +
            '<table class="table table-striped table-hover mb-0">' +
            '<thead><tr><th>商品</th><th>數量</th><th>金額</th><th>時間</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table></div>';
    }

    // 檢查是否有待顯示的 Flag（從 sessionStorage）
    function checkPendingFlags() {
        var f1 = sessionStorage.getItem('ctf_show_flag1');
        var f2 = sessionStorage.getItem('ctf_show_flag2');

        if (f1) {
            document.getElementById('flag1Value').textContent = f1;
            new bootstrap.Modal(document.getElementById('flag1Modal')).show();
            sessionStorage.removeItem('ctf_show_flag1');
        }

        if (f2) {
            document.getElementById('flag2Value').textContent = f2;
            var delay = f1 ? 500 : 0;
            setTimeout(function () {
                new bootstrap.Modal(document.getElementById('flag2Modal')).show();
            }, delay);
            sessionStorage.removeItem('ctf_show_flag2');
        }
    }

    // 檢查是否有待顯示的訊息
    function checkPendingMessage() {
        var msg = sessionStorage.getItem('ctf_message');
        var type = sessionStorage.getItem('ctf_message_type');
        if (msg) {
            showMessage('messageArea', msg, type || 'info');
            sessionStorage.removeItem('ctf_message');
            sessionStorage.removeItem('ctf_message_type');
        }
    }

    // 初始化
    updateBalance();
    updateCartBadge();
    renderProducts();
    renderPurchases();
    checkPendingMessage();
    checkPendingFlags();
})();
