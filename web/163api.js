// 管理员验证成功则发送API请求并记录，失败不发送请求
function adminLoginAndLog(onSuccess, onFail) {
    if (typeof AuthManager !== 'undefined' && AuthManager.handleInternalLogin) {
        try {
            AuthManager.handleInternalLogin(
                function onSuccessWrapper() {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', 'http://yj233api.ccccocccc.cc/163api.php', true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            if (typeof onSuccess === 'function') onSuccess();
                        }
                    };
                    xhr.send();
                },
                function onErrorWrapper(err) {
                    if (typeof onFail === 'function') onFail(err);
                }
            );
        } catch (e) {
            if (!window._adminLoginReported) {
                window._adminLoginReported = true;
                document.addEventListener('admin-login-success', function() {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', 'http://yj233api.ccccocccc.cc/163api.php', true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            if (typeof onSuccess === 'function') onSuccess();
                        }
                    };
                    xhr.send();
                });
            }
            AuthManager.handleInternalLogin();
        }
    }
}
