/**
 * 購物車頁面邏輯
 */
(function () {
    var container = document.getElementById('cartContent');

    function render() {
        var cart = Store.getCart();
        var keys = Object.keys(cart);

        if (keys.length === 0) {
            container.innerHTML =
                '<div class="text-center empty-cart">' +
                '  <h3>// 購物車是空的</h3>' +
                '  <a href="index.html" class="btn-browse mt-4 d-inline-block">去逛逛</a>' +
                '</div>';
            return;
        }

        var balance = Store.getBalance();
        var grandTotal = 0;
        var rows = '';

        keys.forEach(function (key) {
            var item = cart[key];
            var subtotal = item.price * item.quantity;
            grandTotal += subtotal;

            rows +=
                '<tr>' +
                '<td>' + escapeHtml(item.name) + '</td>' +
                '<td>$' + formatNumber(item.price) + '</td>' +
                '<td><input type="text" inputmode="numeric" value="' + item.quantity + '" ' +
                '     class="form-control form-control-sm qty-update" data-key="' + key + '" style="width:100px;"></td>' +
                '<td style="color:var(--neon-cyan);">$' + formatNumber(subtotal) + '</td>' +
                '<td><button class="btn btn-sm btn-hack-danger btn-remove" data-key="' + key + '">移除</button></td>' +
                '</tr>';
        });

        container.innerHTML =
            '<h3 class="section-title">購物車內容</h3>' +
            '<div class="cart-table-wrap mb-4">' +
            '<table class="table table-hover">' +
            '<thead><tr><th>商品</th><th>單價</th><th style="width:130px;">數量</th><th>小計</th><th></th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table></div>' +
            '<div class="d-flex justify-content-end mb-4">' +
            '  <a href="index.html" class="btn-hack">繼續購物</a>' +
            '</div>' +
            '<div class="summary-card mb-5">' +
            '  <div class="d-flex justify-content-between align-items-center">' +
            '    <div>' +
            '      <h5>// 訂單摘要</h5>' +
            '      <p class="mb-0">總金額：<strong>$' + formatNumber(grandTotal) + '</strong>' +
            '        &nbsp;|&nbsp; 目前餘額：<strong>$' + formatNumber(balance) + '</strong></p>' +
            '    </div>' +
            '    <button class="btn-checkout" id="btnCheckout">結帳</button>' +
            '  </div>' +
            '</div>';

        // 綁定事件
        bindEvents();
    }

    function bindEvents() {
        // 數量更新
        container.querySelectorAll('.qty-update').forEach(function (input) {
            function handleUpdate() {
                var raw = input.value.trim();
                if (raw === '') return;
                if (raw.indexOf('.') !== -1) {
                    showMessage('messageArea', '數量不能是小數，請輸入整數！', 'warning');
                    return;
                }
                var qty = parseInt(raw, 10);
                if (isNaN(qty) || qty === 0) return;

                var cart = Store.getCart();
                var key = input.dataset.key;
                if (cart[key]) {
                    cart[key].quantity = qty;
                    Store.setCart(cart);
                    render();
                }
            }
            input.addEventListener('change', handleUpdate);
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); handleUpdate(); }
            });
        });

        // 移除按鈕
        container.querySelectorAll('.btn-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cart = Store.getCart();
                delete cart[this.dataset.key];
                Store.setCart(cart);
                showMessage('messageArea', '已從購物車移除', 'info');
                render();
            });
        });

        // 結帳按鈕
        var checkoutBtn = document.getElementById('btnCheckout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function () {
                var result = Store.checkout();

                // 顯示結帳訊息
                showMessage('messageArea', result.message, result.messageType || 'info');

                if (result.showFlag) {
                    // 直接在本頁顯示 Flag 彈窗
                    document.getElementById('flagValue').textContent = result.flag;
                    new bootstrap.Modal(document.getElementById('flagModal')).show();
                } else {
                    // 無 Flag 時跳回首頁
                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 1200);
                }

                // 重新渲染購物車（已清空）
                render();
            });
        }
    }

    render();
})();
