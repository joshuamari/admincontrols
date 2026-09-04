<?php
require_once __DIR__ . '/../dbconn/dbconnectkdtph.php';
require_once __DIR__ . '/csrf.php';

/**
 * Temporary compatibility: this app's AJAX callers treat HTTP 200 + truthy JSON as
 * failure and `false` as success. Do not send 401/403/422 status codes here yet.
 */
function authJsonFail($message)
{
    echo json_encode(["error" => $message]);
    exit;
}

function findAuthenticatedUser()
{
    global $connkdt;

    if (!isset($connkdt)) {
        error_log("findAuthenticatedUser missing database connection");
        return null;
    }

    $userHash = '';
    if (isset($_COOKIE['userID'])) {
        $userHash = $_COOKIE['userID'];
    }
    if ($userHash === '') {
        return null;
    }

    try {
        $loginQ = "SELECT fldEmployeeNum FROM kdtlogin WHERE fldUserHash = :hash LIMIT 1";
        $loginStmt = $connkdt->prepare($loginQ);
        if ($loginStmt === false) {
            error_log("findAuthenticatedUser prepare failed");
            return null;
        }
        $loginStmt->execute([":hash" => $userHash]);
        $empNum = $loginStmt->fetchColumn();
        if ($empNum === false || $empNum === null || $empNum === '') {
            return null;
        }
        return $empNum;
    } catch (Exception $e) {
        error_log("findAuthenticatedUser failed");
        return null;
    }
}

function requireAuthenticatedUser()
{
    $empNum = findAuthenticatedUser();
    if ($empNum === null) {
        authJsonFail("Not authenticated.");
    }
    return $empNum;
}

function requireAuthenticatedCsrfUser()
{
    csrf_require();
    return requireAuthenticatedUser();
}

function userHasPermission($empNum, $permissionId)
{
    global $connkdt;

    $permissionId = filter_var($permissionId, FILTER_VALIDATE_INT);
    if ($permissionId === false || (int)$permissionId <= 0) {
        return false;
    }
    if ($empNum === null || $empNum === false || $empNum === '') {
        return false;
    }
    $permissionId = (int)$permissionId;

    try {
        $accessQ = "SELECT COUNT(*) FROM `user_permissions` WHERE `fldEmployeeNum` = :empNum AND `permission_id` = :pID";
        $accessStmt = $connkdt->prepare($accessQ);
        if ($accessStmt === false) {
            error_log("userHasPermission prepare failed");
            return false;
        }
        $accessStmt->execute([":empNum" => $empNum, ":pID" => $permissionId]);
        return (bool)$accessStmt->fetchColumn();
    } catch (Exception $e) {
        error_log("userHasPermission failed");
        return false;
    }
}

function requirePermission($empNum, $permissionId)
{
    global $connkdt;

    $permissionId = filter_var($permissionId, FILTER_VALIDATE_INT);
    if ($permissionId === false || (int)$permissionId <= 0) {
        authJsonFail("Access denied.");
    }
    $permissionId = (int)$permissionId;

    try {
        $accessQ = "SELECT COUNT(*) FROM `user_permissions` WHERE `fldEmployeeNum` = :empNum AND `permission_id` = :pID";
        $accessStmt = $connkdt->prepare($accessQ);
        if ($accessStmt === false) {
            error_log("requirePermission prepare failed");
            authJsonFail("Unable to complete request.");
        }
        $accessStmt->execute([":empNum" => $empNum, ":pID" => $permissionId]);
        $ac = $accessStmt->fetchColumn();
        if (!$ac) {
            authJsonFail("Access denied.");
        }
    } catch (Exception $e) {
        error_log("requirePermission failed");
        authJsonFail("Unable to complete request.");
    }
}
