<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
ob_end_clean();
require_once '../../php/require_auth.php';
require_once '../../php/audit_log.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connnew)) {
    error_log("edit_group missing database connection");
    authJsonFail("Unable to save group.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 39);

#region initialize variables
$result = array();
$groupID = NULL;
if (!empty($_POST['groupID'])) {
    $groupID = filter_var($_POST['groupID'], FILTER_VALIDATE_INT);
}
$groupName = NULL;
if (!empty($_POST['groupName'])) {
    $groupName = trim($_POST['groupName']);
}
$groupCode = NULL;
if (!empty($_POST['groupCode'])) {
    $groupCode = trim($_POST['groupCode']);
}
$deptName = NULL;
if (!empty($_POST['deptName'])) {
    $deptName = trim($_POST['deptName']);
}
$deptID = NULL;
if (!empty($_POST['deptID'])) {
    $deptID = filter_var($_POST['deptID'], FILTER_VALIDATE_INT);
}

if ($groupID === false || $groupID === NULL || (int)$groupID <= 0) {
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
    echo json_encode($result);
    exit;
}
$groupID = (int)$groupID;
if ($groupName === NULL || $groupName === '' || $groupCode === NULL || $groupCode === '' || $deptName === NULL || $deptName === '') {
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
    echo json_encode($result);
    exit;
}
if ($deptID === false || $deptID === NULL || (int)$deptID <= 0) {
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
    echo json_encode($result);
    exit;
}
$deptID = (int)$deptID;
$oldGroup = audit_fetch_group($groupID);
if ($oldGroup === null) {
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
    echo json_encode($result);
    exit;
}
#endregion

#region main
try {
    if (checkDuplicateCode($groupCode, $groupID)) {
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Code";
        echo json_encode($result);
        exit;
    }
    if (checkDuplicateName($groupName, $groupID)) {
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Name";
        echo json_encode($result);
        exit;
    }
    $updateGroupQ = "UPDATE `group_list` SET `name`=:groupName, `abbreviation`=:groupCode, dept_id=:deptId WHERE `id`=:groupID";
    $updateGroupStmt = $connnew->prepare($updateGroupQ);
    if ($updateGroupStmt === false || $updateGroupStmt->execute([":groupCode" => $groupCode, ":groupName" => $groupName, ":deptId" => $deptID, ":groupID" => $groupID]) === false) {
        $errInfo = $updateGroupStmt ? $updateGroupStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            $result["isSuccess"] = false;
            $result["message"] = "Duplicate Group Name";
            echo json_encode($result);
            exit;
        }
        error_log("edit_group mutation failed");
        $result["isSuccess"] = false;
        $result["message"] = "Unable to save group.";
        echo json_encode($result);
        exit;
    }
    audit_log($actorEmpNum, "UPDATE", "group", $groupID, $oldGroup, [
        "name" => $groupName,
        "abbreviation" => $groupCode,
        "department" => $deptName,
    ]);
    $result["isSuccess"] = true;
} catch (Exception $e) {
    error_log("edit_group mutation failed");
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
}
#endregion

#region function
function checkDuplicateCode($groupcode, $groupid)
{
    global $connnew;
    $isDuplicate = false;
    $countQ = "SELECT id FROM `group_list` WHERE `abbreviation`=:groupcode AND `id` <> :groupID LIMIT 1";
    $countStmt = $connnew->prepare($countQ);
    $countStmt->execute([":groupcode" => $groupcode, ":groupID" => $groupid]);
    if ($countStmt->fetchColumn() !== false) {
        $isDuplicate = true;
    }
    return $isDuplicate;
}
function checkDuplicateName($groupname, $groupid)
{
    global $connnew;
    $isDuplicate = false;
    $countQ = "SELECT id FROM `group_list` WHERE `name`=:groupname AND `id` <> :groupID LIMIT 1";
    $countStmt = $connnew->prepare($countQ);
    $countStmt->execute([":groupname" => $groupname, ":groupID" => $groupid]);
    if ($countStmt->fetchColumn() !== false) {
        $isDuplicate = true;
    }
    return $isDuplicate;
}
#endregion
echo json_encode($result);
