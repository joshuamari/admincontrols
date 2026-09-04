<?php

/**
 * Synchronizer token for cookie-authenticated AJAX.
 * Login cookie (userID) stays owned by KDTPortalLogin.
 */
function csrf_boot()
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    if (session_status() === PHP_SESSION_DISABLED) {
        return;
    }
    if (!headers_sent()) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
    session_start();
}

function csrf_token()
{
    csrf_boot();
    if (empty($_SESSION['ac_csrf']) || !is_string($_SESSION['ac_csrf'])) {
        $_SESSION['ac_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['ac_csrf'];
}

function csrf_request_token()
{
    if (!empty($_SERVER['HTTP_X_CSRF_TOKEN']) && is_string($_SERVER['HTTP_X_CSRF_TOKEN'])) {
        return $_SERVER['HTTP_X_CSRF_TOKEN'];
    }
    if (!empty($_POST['csrf_token']) && is_string($_POST['csrf_token'])) {
        return $_POST['csrf_token'];
    }
    return '';
}

function csrf_token_ok()
{
    csrf_boot();
    if (empty($_SESSION['ac_csrf']) || !is_string($_SESSION['ac_csrf'])) {
        return false;
    }
    $sent = csrf_request_token();
    if ($sent === '') {
        return false;
    }
    return hash_equals($_SESSION['ac_csrf'], $sent);
}

function csrf_require()
{
    if (!csrf_token_ok()) {
        if (function_exists('authJsonFail')) {
            authJsonFail("Unable to complete request.");
        }
        echo json_encode(["error" => "Unable to complete request."]);
        exit;
    }
}

function csrf_require_boolean()
{
    if (!csrf_token_ok()) {
        echo json_encode(false);
        exit;
    }
}

function csrf_script_tag()
{
    return '<script>window.CSRF_TOKEN = ' . json_encode(csrf_token(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . ';</script>';
}
