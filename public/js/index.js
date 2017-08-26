$(function () {
    var $loginBox = $('#loginBox');
    var $register = $('#registerBox');
    var $userInfo = $('#userInfo');

    $loginBox.find('a.colMint').on('click', function () {
        $register.show();
        $loginBox.hide();
    });

    $register.find('a.colMint').on('click', function () {
        $loginBox.show();
        $register.hide();
    });

    $register.find('button').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $register.find('[name="username"]').val(),
                password: $register.find('[name="password"]').val(),
                repassword: $register.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function (result) {
                $register.find('.colWarning').html(result.message);
                if (!result.code) {
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000)
                }
            }
        });
    });

    $loginBox.find('button').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            dataType: 'json',
            success: function (result) {
                $loginBox.find('.colWarning').html(result.message);
                if (!result.code) {
                    window.location.reload();
                }
            }
        });
    });

    $('#logout').on('click', function () {
        $.ajax({
            url: '/api/user/logout',
            success: function (result) {
                window.location.reload();
            }
        });
    });
});