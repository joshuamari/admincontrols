<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("get_user_permission_activity missing database connection");
    authJsonFail("Unable to load activity.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 18);

$empID = NULL;
if (!empty($_POST['empID'])) {
    $empID = filter_var($_POST['empID'], FILTER_VALIDATE_INT);
}
if ($empID === false || $empID === NULL || (int)$empID <= 0) {
    echo json_encode([]);
    exit;
}
$empID = (int)$empID;

$result = [];

try {
    $logQ = "SELECT a.id,
                    a.action,
                    a.new_json,
                    a.created_at,
                    TRIM(CONCAT(IFNULL(ep.fldFirstname, ''), ' ', IFNULL(ep.fldSurname, ''))) AS actor_name
             FROM ac_audit_log AS a
             LEFT JOIN emp_prof AS ep ON ep.fldEmployeeNum = a.actor
             WHERE a.entity = 'user_permission' AND a.entity_id = :empID
             ORDER BY a.created_at DESC, a.id DESC";
    $logStmt = $connkdt->prepare($logQ);
    if ($logStmt === false) {
        error_log("get_user_permission_activity prepare failed");
        authJsonFail("Unable to load activity.");
    }
    $logStmt->execute([":empID" => $empID]);
    $rows = $logStmt->fetchAll();
    foreach ($rows as $row) {
        $payload = user_permission_activity_decode($row['new_json']);
        $applications = [];
        if (isset($payload['applications']) && is_array($payload['applications'])) {
            $applications = $payload['applications'];
        }
        $result[] = [
            "id" => (int)$row['id'],
            "action" => $row['action'],
            "description" => "User permissions updated",
            "actor_name" => $row['actor_name'],
            "created_at" => $row['created_at'],
            "applications" => $applications,
        ];
    }
} catch (Exception $e) {
    error_log("get_user_permission_activity query failed");
    authJsonFail("Unable to load activity.");
}

echo json_encode($result);

function user_permission_activity_decode($json)
{
    if ($json === null || $json === '') {
        return [];
    }
    $decoded = json_decode($json, true);
    if (!is_array($decoded)) {
        return [];
    }
    return $decoded;
}
