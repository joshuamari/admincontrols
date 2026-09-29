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

if (!isset($connkdt, $connnew, $connDisable, $conn_new_disable)) {
    error_log("add_group missing database connection");
    authJsonFail("Unable to save group.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
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
$catalogName = departmentListName($deptID);
if ($catalogName === null) {
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
    echo json_encode($result);
    exit;
}
$deptName = $catalogName;
#endregion

#region main
try {
    $connDisable->beginTransaction();
    $conn_new_disable->beginTransaction();

    if (groupListHasCode($groupCode)) {
        rollbackGroupWrites();
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Code";
        echo json_encode($result);
        exit;
    }
    if (groupListHasName($groupName) || kdtbuHasName($groupName, $groupCode)) {
        rollbackGroupWrites();
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Name";
        echo json_encode($result);
        exit;
    }

    if (syncKdtbu($groupCode, $groupName, $deptName) === false) {
        rollbackGroupWrites();
        error_log("add_group kdtbu mutation failed");
        $result["isSuccess"] = false;
        $result["message"] = "Unable to save group.";
        echo json_encode($result);
        exit;
    }

    $insertGroupNewQ = "INSERT INTO group_list(`abbreviation`,`name`,`dept_id`) VALUES(:groupCode,:groupName,:deptId)";
    $insertGroupNewStmt = $conn_new_disable->prepare($insertGroupNewQ);
    if ($insertGroupNewStmt === false || $insertGroupNewStmt->execute([":groupCode" => $groupCode, ":groupName" => $groupName, ":deptId" => $deptID]) === false) {
        $errInfo = $insertGroupNewStmt ? $insertGroupNewStmt->errorInfo() : [];
        rollbackGroupWrites();
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
    $newGroupId = (int)$conn_new_disable->lastInsertId();

    $connDisable->commit();
    $conn_new_disable->commit();

    if ($newGroupId > 0) {
        audit_log($actorEmpNum, "CREATE", "group", $newGroupId, null, [
            "name" => $groupName,
            "abbreviation" => $groupCode,
            "department" => $deptName,
        ]);
    }
    $result["isSuccess"] = true;
} catch (Exception $e) {
    rollbackGroupWrites();
    error_log("add_group mutation failed");
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
}
#endregion

#region function
function rollbackGroupWrites()
{
    global $connDisable, $conn_new_disable;
    if (isset($connDisable) && $connDisable->inTransaction()) {
        $connDisable->rollBack();
    }
    if (isset($conn_new_disable) && $conn_new_disable->inTransaction()) {
        $conn_new_disable->rollBack();
    }
}
function groupListHasCode($groupcode)
{
    global $conn_new_disable;
    $countQ = "SELECT id FROM `group_list` WHERE `abbreviation`=:groupcode LIMIT 1 FOR UPDATE";
    $countStmt = $conn_new_disable->prepare($countQ);
    if ($countStmt === false || $countStmt->execute([":groupcode" => $groupcode]) === false) {
        return true;
    }
    return $countStmt->fetchColumn() !== false;
}
function groupListHasName($groupname)
{
    global $conn_new_disable;
    $countQ = "SELECT id FROM `group_list` WHERE `name`=:groupname LIMIT 1 FOR UPDATE";
    $countStmt = $conn_new_disable->prepare($countQ);
    if ($countStmt === false || $countStmt->execute([":groupname" => $groupname]) === false) {
        return true;
    }
    return $countStmt->fetchColumn() !== false;
}
function kdtbuHasName($groupname, $allowedCode)
{
    global $connDisable;
    $countQ = "SELECT fldID FROM kdtbu WHERE fldBUName=:groupname AND fldBU<>:allowedCode LIMIT 1 FOR UPDATE";
    $countStmt = $connDisable->prepare($countQ);
    if ($countStmt === false || $countStmt->execute([":groupname" => $groupname, ":allowedCode" => $allowedCode]) === false) {
        return true;
    }
    return $countStmt->fetchColumn() !== false;
}
function departmentListName($deptID)
{
    global $connnew;
    $deptQ = "SELECT name FROM `department_list` WHERE id=:deptID LIMIT 1";
    $deptStmt = $connnew->prepare($deptQ);
    if ($deptStmt === false || $deptStmt->execute([":deptID" => $deptID]) === false) {
        return null;
    }
    $name = $deptStmt->fetchColumn();
    if ($name === false || $name === null || trim($name) === '') {
        return null;
    }
    return $name;
}
function syncKdtbu($groupCode, $groupName, $deptName)
{
    global $connDisable;
    $findQ = "SELECT fldID FROM kdtbu WHERE fldBU=:groupCode FOR UPDATE";
    $findStmt = $connDisable->prepare($findQ);
    if ($findStmt === false || $findStmt->execute([":groupCode" => $groupCode]) === false) {
        return false;
    }
    $ids = $findStmt->fetchAll(PDO::FETCH_COLUMN);
    if ($ids) {
        $updateQ = "UPDATE kdtbu SET fldBUName=:groupName, fldDepartment=:deptName WHERE fldID=:id";
        $updateStmt = $connDisable->prepare($updateQ);
        if ($updateStmt === false) {
            return false;
        }
        foreach ($ids as $id) {
            if ($updateStmt->execute([":groupName" => $groupName, ":deptName" => $deptName, ":id" => $id]) === false) {
                return false;
            }
        }
        return true;
    }
    $insertQ = "INSERT INTO kdtbu(`fldBU`,`fldBUName`,`fldDepartment`) VALUES(:groupCode,:groupName,:deptName)";
    $insertStmt = $connDisable->prepare($insertQ);
    if ($insertStmt === false || $insertStmt->execute([":groupCode" => $groupCode, ":groupName" => $groupName, ":deptName" => $deptName]) === false) {
        return false;
    }
    return true;
}
#endregion
echo json_encode($result);
