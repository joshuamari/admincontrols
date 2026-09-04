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
    error_log("get_employee_activity missing database connection");
    authJsonFail("Unable to load activity.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 16);

$empNum = NULL;
if (!empty($_POST['empNum'])) {
    $empNum = filter_var($_POST['empNum'], FILTER_VALIDATE_INT);
}
if ($empNum === false || $empNum === NULL || (int)$empNum <= 0) {
    echo json_encode([]);
    exit;
}
$empNum = (int)$empNum;

$fieldLabels = [
    "firstname" => "First name",
    "surname" => "Surname",
    "nickname" => "Nickname",
    "username" => "PC Username",
    "group" => "Group",
    "position" => "Position",
    "birthdate" => "Birthdate",
    "gender" => "Gender",
    "marital_status" => "Marital status",
    "date_hired" => "Date hired",
    "email" => "Email",
    "status" => "Status",
    "resignation_date" => "Resignation date",
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
             WHERE a.entity = 'employee' AND a.entity_id = :empNum
             ORDER BY a.created_at DESC, a.id DESC";
    $logStmt = $connkdt->prepare($logQ);
    if ($logStmt === false) {
        error_log("get_employee_activity prepare failed");
        authJsonFail("Unable to load activity.");
    }
    $logStmt->execute([":empNum" => $empNum]);
    $rows = $logStmt->fetchAll();
    foreach ($rows as $row) {
        $old = employee_activity_decode($row['old_json']);
        $new = employee_activity_decode($row['new_json']);
        $oldValues = [];
        $newValues = [];
        $keys = array_unique(array_merge(array_keys($old), array_keys($new)));
        foreach ($keys as $key) {
            $label = isset($fieldLabels[$key]) ? $fieldLabels[$key] : $key;
            $oldVal = array_key_exists($key, $old) ? $old[$key] : null;
            $newVal = array_key_exists($key, $new) ? $new[$key] : null;
            if ((string)$oldVal === (string)$newVal) {
                continue;
            }
            $oldValues[$label] = $oldVal;
            $newValues[$label] = $newVal;
        }
        $result[] = [
            "id" => (int)$row['id'],
            "action" => $row['action'],
            "actor_name" => $row['actor_name'],
            "created_at" => $row['created_at'],
            "old_values" => $oldValues,
            "new_values" => $newValues,
        ];
    }
} catch (Exception $e) {
    error_log("get_employee_activity query failed");
    authJsonFail("Unable to load activity.");
}

echo json_encode($result);

function employee_activity_decode($json)
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
