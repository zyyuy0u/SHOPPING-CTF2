/**
 * Flag 提交頁面邏輯（單一 Flag）
 */
(function () {
    function updateUI() {
        var solved = Store.isFlagSolved();

        document.getElementById('scoreValue').textContent = (solved ? 1 : 0) + ' / 1';

        var card = document.getElementById('flagCard');
        if (solved) {
            card.classList.add('solved');
            document.getElementById('flagForm').innerHTML =
                '<div style="color: var(--neon-green); font-size: 0.85rem;">&#10003; 已通過</div>';
        }

        renderHistory();
    }

    function renderHistory() {
        var submissions = Store.getSubmissions();
        var section = document.getElementById('historySection');

        if (submissions.length === 0) {
            section.innerHTML = '';
            return;
        }

        var rows = submissions.slice(0, 20).map(function (s) {
            var badge = s.isCorrect
                ? '<span class="badge-correct">CORRECT</span>'
                : '<span class="badge-wrong">WRONG</span>';
            return '<tr>' +
                '<td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
                escapeHtml(s.submittedFlag) + '</td>' +
                '<td>' + badge + '</td>' +
                '<td style="color:rgba(0,229,255,0.6);">' + s.createdAt + '</td>' +
                '</tr>';
        }).join('');

        section.innerHTML =
            '<h3 class="section-title mt-5">提交紀錄</h3>' +
            '<div class="history-wrap mb-5">' +
            '<table class="table table-striped table-hover mb-0">' +
            '<thead><tr><th>提交內容</th><th>結果</th><th>時間</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table></div>';
    }

    // 提交 Flag
    document.getElementById('flagSubmit').addEventListener('click', function () {
        var input = document.getElementById('flagInput');
        var flag = input.value.trim();
        if (!flag) return;

        var correct = Store.submitFlag(flag);
        if (correct) {
            showMessage('messageArea', 'Flag 正確！恭喜通關！', 'success');
        } else {
            showMessage('messageArea', 'Flag 錯誤，再試試看。', 'danger');
        }
        input.value = '';
        updateUI();
    });

    // Enter 鍵提交
    document.getElementById('flagInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('flagSubmit').click();
    });

    // 初始化
    updateUI();
})();
