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
    error_log("get_designation_activity missing database connection");
    authJsonFail("Unable to load activity.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 40);

$posID = NULL;
if (!empty($_POST['posID'])) {
    $posID = filter_var($_POST['posID'], FILTER_VALIDATE_INT);
}
if ($posID === false || $posID === NULL || (int)$posID <= 0) {
    echo json_encode([]);
    exit;
}
$posID = (int)$posID;

$fieldLabels = [
    "name" => "Name",
    "acronym" => "Acronym",
    "priority" => "Priority",
    "manpower_summary" => "Manpower Summary",
];

$result = [];

try {
    $logQ = "SELECT a.id,
                    a.action,
                    a.old_json,
                    a.new_json,
                    a.created_at,
                    TRIM(CONCAT(IFNULL(ep.fldFirstname, ''), ' ', IFNULL(ep.fldSurname, ''))) AS actor_name
             FROM ac_audit_log AS a
             LEFT JOIN emp_prof AS ep ON ep.fldEmployeeNum = a.actor
             WHERE a.entity = 'designation' AND a.entity_id = :posID
             ORDER BY a.created_at DESC, a.id DESC";
    $logStmt = $connkdt->prepare($logQ);
    if ($logStmt === false) {
        error_log("get_designation_activity prepare failed");
        authJsonFail("Unable to load activity.");
    }
    $logStmt->execute([":posID" => $posID]);
    $rows = $logStmt->fetchAll();
    foreach ($rows as $row) {
        $old = designation_activity_decode($row['old_json']);
        $new = designation_activity_decode($row['new_json']);
        $changes = [];
        $keys = array_unique(array_merge(array_keys($old), array_keys($new)));
        foreach ($keys as $key) {
            $label = isset($fieldLabels[$key]) ? $fieldLabels[$key] : $key;
            $oldVal = array_key_exists($key, $old) ? $old[$key] : null;
            $newVal = array_key_exists($key, $new) ? $new[$key] : null;
            if ((string)$oldVal === (string)$newVal) {
                continue;
            }
            $changes[] = [
                "field" => $key,
                "label" => $label,
                "old_value" => $oldVal,
                "new_value" => $newVal,
            ];
        }
        $action = $row['action'];
        $description = "Designation updated";
        if (strtoupper((string)$action) === "CREATE") {
            $description = "Designation created";
        } else {
            $changedFields = array_column($changes, "field");
            if (in_array("manpower_summary", $changedFields, true)) {
                $description = "Manpower Summary updated";
            } else if (in_array("priority", $changedFields, true)) {
                $description = "Priority updated";
            }
        }
        $result[] = [
            "id" => (int)$row['id'],
            "action" => $action,
            "description" => $description,
            "actor_name" => $row['actor_name'],
            "created_at" => $row['created_at'],
            "changes" => $changes,
        ];
    }
} catch (Exception $e) {
    error_log("get_designation_activity query failed");
    authJsonFail("Unable to load activity.");
}

echo json_encode($result);

function designation_activity_decode($json)
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
