<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connnew)) {
    error_log("add_group missing database connection");
    authJsonFail("Unable to save group.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 39);

#region initialize variables
$result = array();
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
#endregion

#region main
try {
    if (checkDuplicateCode($groupCode)) {
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Code";
        echo json_encode($result);
        exit;
    }
    if (checkDuplicateName($groupName)) {
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Name";
        echo json_encode($result);
        exit;
    }
    $insertGroupQ = "INSERT INTO kdtbu(`fldBU`,`fldBUName`,`fldDepartment`) VALUES(:groupCode,:groupName,:deptName)";
    $insertGroupStmt = $connkdt->prepare($insertGroupQ);
    if ($insertGroupStmt === false || $insertGroupStmt->execute([":groupCode" => $groupCode, ":groupName" => $groupName, ":deptName" => $deptName]) === false) {
        error_log("add_group kdtbu mutation failed");
        $result["isSuccess"] = false;
        $result["message"] = "Unable to save group.";
        echo json_encode($result);
        exit;
    }
    $insertGroupNewQ = "INSERT INTO group_list(`abbreviation`,`name`,`dept_id`) VALUES(:groupCode,:groupName,:deptId)";
    $insertGroupNewStmt = $connnew->prepare($insertGroupNewQ);
    if ($insertGroupNewStmt === false || $insertGroupNewStmt->execute([":groupCode" => $groupCode, ":groupName" => $groupName, ":deptId" => $deptID]) === false) {
        $errInfo = $insertGroupNewStmt ? $insertGroupNewStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            $result["isSuccess"] = false;
            $result["message"] = "Duplicate Group Name";
            echo json_encode($result);
            exit;
        }
        error_log("add_group group_list mutation failed");
        $result["isSuccess"] = false;
        $result["message"] = "Unable to save group.";
        echo json_encode($result);
        exit;
    }
    $result["isSuccess"] = true;
} catch (Exception $e) {
    error_log("add_group mutation failed");
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
}
#endregion

#region function
function checkDuplicateCode($groupcode)
{
    global $connnew;
    $isDuplicate = false;
    $countQ = "SELECT id FROM `group_list` WHERE `abbreviation`=:groupcode LIMIT 1";
    $countStmt = $connnew->prepare($countQ);
    $countStmt->execute([":groupcode" => $groupcode]);
    if ($countStmt->fetchColumn() !== false) {
        $isDuplicate = true;
    }
    return $isDuplicate;
}
function checkDuplicateName($groupname)
{
    global $connnew;
    $isDuplicate = false;
    $countQ = "SELECT id FROM `group_list` WHERE `name`=:groupname LIMIT 1";
    $countStmt = $connnew->prepare($countQ);
    $countStmt->execute([":groupname" => $groupname]);
    if ($countStmt->fetchColumn() !== false) {
        $isDuplicate = true;
    }
    return $isDuplicate;
}
#endregion
echo json_encode($result);
