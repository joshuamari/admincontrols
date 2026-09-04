<?php
#region DB Connect
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
require_once '../../php/audit_log.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("add_app missing database connection");
    authJsonFail("Unable to save application.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 20);

#region Initialize Variable
$appName = NULL;
if (!empty($_POST['appName'])) {
    $appName = trim($_POST['appName']);
}
$appColor = NULL;
if (!empty($_POST['appColor'])) {
    $appColor = trim($_POST['appColor']);
}

if ($appName === NULL || $appName === '') {
    authJsonFail("Application name is required.");
}
if ($appColor === NULL || $appColor === '') {
    authJsonFail("Application color is required.");
}

$dupQ = "SELECT project_id FROM kdtwebprojects WHERE project_name = :appName LIMIT 1";
$dupStmt = $connkdt->prepare($dupQ);
$dupStmt->execute([":appName" => $appName]);
if ($dupStmt->fetchColumn() !== false) {
    authJsonFail("Duplicate application name.");
}
#endregion

#region Entries Query
try {
    $appQ = "INSERT INTO kdtwebprojects(project_name,project_css_class) VALUES (:appName,:appColor)";
    $appStmt = $connkdt->prepare($appQ);
    if ($appStmt === false || $appStmt->execute([":appName" => $appName, ":appColor" => $appColor]) === false) {
        $errInfo = $appStmt ? $appStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            authJsonFail("Duplicate application name.");
        }
        error_log("add_app mutation failed");
        authJsonFail("Unable to save application.");
    }
} catch (Exception $e) {
    error_log("add_app mutation failed");
    authJsonFail("Unable to save application.");
}

$newAppId = (int)$connkdt->lastInsertId();
if ($newAppId > 0) {
    audit_log($actorEmpNum, "CREATE", "app_permission", $newAppId, null, [
        "event_type" => "APPLICATION_CREATED",
        "description" => "Application created",
        "details" => [
            "application_name" => $appName,
        ],
    ]);
}

#endregion

echo json_encode(false);
