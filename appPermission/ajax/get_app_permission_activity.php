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
    error_log("get_app_permission_activity missing database connection");
    authJsonFail("Unable to load activity.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 20);

$projID = NULL;
if (!empty($_POST['projID'])) {
    $projID = filter_var($_POST['projID'], FILTER_VALIDATE_INT);
}
if ($projID === false || $projID === NULL || (int)$projID <= 0) {
    echo json_encode([]);
    exit;
}
$projID = (int)$projID;

$result = [];

try {
    $logQ = "SELECT a.id,
                    a.action,
                    a.new_json,
                    a.created_at,
                    TRIM(CONCAT(IFNULL(ep.fldFirstname, ''), ' ', IFNULL(ep.fldSurname, ''))) AS actor_name
             FROM ac_audit_log AS a
             LEFT JOIN emp_prof AS ep ON ep.fldEmployeeNum = a.actor
             WHERE a.entity = 'app_permission' AND a.entity_id = :projID
             ORDER BY a.created_at DESC, a.id DESC";
    $logStmt = $connkdt->prepare($logQ);
    if ($logStmt === false) {
        error_log("get_app_permission_activity prepare failed");
        authJsonFail("Unable to load activity.");
    }
    $logStmt->execute([":projID" => $projID]);
    $rows = $logStmt->fetchAll();
    foreach ($rows as $row) {
        $payload = app_permission_activity_decode($row['new_json']);
        $details = [];
        if (isset($payload['details']) && is_array($payload['details'])) {
            $details = $payload['details'];
        }
        $result[] = [
            "id" => (int)$row['id'],
            "application_id" => $projID,
            "action" => $row['action'],
            "event_type" => isset($payload['event_type']) ? $payload['event_type'] : "",
            "description" => isset($payload['description']) ? $payload['description'] : "",
            "actor_name" => $row['actor_name'],
            "created_at" => $row['created_at'],
            "details" => $details,
        ];
    }
} catch (Exception $e) {
    error_log("get_app_permission_activity query failed");
    authJsonFail("Unable to load activity.");
}

echo json_encode($result);

function app_permission_activity_decode($json)
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
