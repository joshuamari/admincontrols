<?php
require_once __DIR__ . '/../dbconn/dbconnectkdtph.php';

/**
 * Temporary compatibility: this app's AJAX callers treat HTTP 200 + truthy JSON as
 * failure and `false` as success. Do not send 401/403/422 status codes here yet.
 */
function authJsonFail($message)
{
    echo json_encode(["error" => $message]);
    exit;
}

function requireAuthenticatedUser()
{
    global $connkdt;

    $userHash = '';
    if (isset($_COOKIE['userID'])) {
        $userHash = $_COOKIE['userID'];
    }
    if ($userHash === '') {
        authJsonFail("Not authenticated.");
    }

    try {
        $loginQ = "SELECT fldEmployeeNum FROM kdtlogin WHERE fldUserHash = :hash LIMIT 1";
        $loginStmt = $connkdt->prepare($loginQ);
        if ($loginStmt === false) {
            error_log("requireAuthenticatedUser prepare failed");
            authJsonFail("Unable to complete request.");
        }
        $loginStmt->execute([":hash" => $userHash]);
        $empNum = $loginStmt->fetchColumn();
        if ($empNum === false || $empNum === null || $empNum === '') {
            authJsonFail("Not authenticated.");
        }
        return $empNum;
    } catch (Exception $e) {
        error_log("requireAuthenticatedUser failed");
        authJsonFail("Unable to complete request.");
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
