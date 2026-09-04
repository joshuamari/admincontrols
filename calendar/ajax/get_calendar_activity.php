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
    error_log("get_calendar_activity missing database connection");
    authJsonFail("Unable to load activity.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 41);

$locID = NULL;
if (!empty($_POST['locID'])) {
    $locID = filter_var($_POST['locID'], FILTER_VALIDATE_INT);
}
if ($locID === false || $locID === NULL || (int)$locID <= 0) {
    echo json_encode([]);
    exit;
}
$locID = (int)$locID;

$fieldLabels = [
    "name" => "Holiday Name",
    "holiday_type" => "Holiday Type",
    "date" => "Date",
    "location" => "Location",
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
             WHERE a.entity = 'holiday' AND a.entity_id = :locID
             ORDER BY a.created_at DESC, a.id DESC";
    $logStmt = $connkdt->prepare($logQ);
    if ($logStmt === false) {
        error_log("get_calendar_activity prepare failed");
        authJsonFail("Unable to load activity.");
    }
    $logStmt->execute([":locID" => $locID]);
    $rows = $logStmt->fetchAll();
    foreach ($rows as $row) {
        $old = calendar_activity_decode($row['old_json']);
        $new = calendar_activity_decode($row['new_json']);
        $source = !empty($new) ? $new : $old;
        $changes = [];
        $keys = array_unique(array_merge(array_keys($old), array_keys($new)));
        foreach ($keys as $key) {
            if ($key === "holiday_id" || $key === "loc_id") {
                continue;
            }
            $label = isset($fieldLabels[$key]) ? $fieldLabels[$key] : $key;
            $oldVal = array_key_exists($key, $old) ? $old[$key] : null;
            $newVal = array_key_exists($key, $new) ? $new[$key] : null;
            if ($key === "date") {
                $oldVal = calendar_activity_format_date($oldVal);
                $newVal = calendar_activity_format_date($newVal);
            }
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
        $actionUpper = strtoupper((string)$action);
        $description = "Holiday information updated";
        if ($actionUpper === "CREATE") {
            $description = "Holiday created";
        } else if ($actionUpper === "DELETE") {
            $description = "Holiday deleted";
        }
        $holidayName = isset($source["name"]) ? $source["name"] : "";
        $result[] = [
            "id" => (int)$row['id'],
            "calendar_id" => $locID,
            "action" => $action,
            "holiday_id" => isset($source["holiday_id"]) ? (int)$source["holiday_id"] : null,
            "description" => $description,
            "actor_name" => $row['actor_name'],
            "created_at" => $row['created_at'],
            "holiday" => [
                "name" => $holidayName,
                "type" => isset($source["holiday_type"]) ? $source["holiday_type"] : "",
                "date" => isset($source["date"]) ? $source["date"] : "",
            ],
            "changes" => $changes,
        ];
    }
} catch (Exception $e) {
    error_log("get_calendar_activity query failed");
    authJsonFail("Unable to load activity.");
}

echo json_encode($result);

function calendar_activity_decode($json)
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

function calendar_activity_format_date($value)
{
    if ($value === null || $value === '') {
        return $value;
    }
    $ts = strtotime((string)$value);
    if ($ts === false) {
        return $value;
    }
    return date("F j, Y", $ts);
}
