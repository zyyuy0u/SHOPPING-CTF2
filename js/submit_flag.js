/**
 * Flag 提交頁面邏輯
 */
(function () {
    function updateUI() {
        var f1 = Store.isFlagSolved(1);
        var f2 = Store.isFlagSolved(2);
        var solved = (f1 ? 1 : 0) + (f2 ? 1 : 0);

        document.getElementById('scoreValue').textContent = solved + ' / 2';

        // Flag 1
        var card1 = document.getElementById('flag1Card');
        if (f1) {
            card1.classList.add('solved');
            document.getElementById('flag1Form').innerHTML =
                '<div style="color: var(--neon-green); font-size: 0.85rem;">&#10003; 已通過</div>';
        }

        // Flag 2
        var card2 = document.getElementById('flag2Card');
        if (f2) {
            card2.classList.add('solved');
            document.getElementById('flag2Form').innerHTML =
                '<div style="color: var(--neon-green); font-size: 0.85rem;">&#10003; 已通過</div>';
        }

        // 提交紀錄
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
                '<td>Flag ' + s.flagNumber + '</td>' +
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
            '<thead><tr><th>Flag</th><th>提交內容</th><th>結果</th><th>時間</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table></div>';
    }

    // 提交 Flag 1
    document.getElementById('flag1Submit').addEventListener('click', function () {
        var input = document.getElementById('flag1Input');
        var flag = input.value.trim();
        if (!flag) return;

        var correct = Store.submitFlag(1, flag);
        if (correct) {
            showMessage('messageArea', 'Flag 1 正確！恭喜你！', 'success');
        } else {
            showMessage('messageArea', 'Flag 1 錯誤，再試試看。', 'danger');
        }
        input.value = '';
        updateUI();
    });

    // 提交 Flag 2
    document.getElementById('flag2Submit').addEventListener('click', function () {
        var input = document.getElementById('flag2Input');
        var flag = input.value.trim();
        if (!flag) return;

        var correct = Store.submitFlag(2, flag);
        if (correct) {
            showMessage('messageArea', 'Flag 2 正確！恭喜你！', 'success');
        } else {
            showMessage('messageArea', 'Flag 2 錯誤，再試試看。', 'danger');
        }
        input.value = '';
        updateUI();
    });

    // Enter 鍵提交
    document.getElementById('flag1Input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('flag1Submit').click();
    });
    document.getElementById('flag2Input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('flag2Submit').click();
    });

    // 初始化
    updateUI();
})();
