<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
require_once '../../dbconn/dbconnectqms.php';
ob_end_clean();
require_once '../../php/require_auth.php';
require_once '../../php/audit_log.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connnew, $connDisable, $connDisableQMS, $conn_new_disable)) {
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
    $connDisableQMS->beginTransaction();
    $conn_new_disable->beginTransaction();

    $current = lockGroupListRow($groupID);
    if ($current === null) {
        rollbackGroupWrites();
        $result["isSuccess"] = false;
        $result["message"] = "Unable to save group.";
        echo json_encode($result);
        exit;
    }
    $oldCode = $current["abbreviation"];
    $oldGroup = [
        "name" => $current["name"],
        "abbreviation" => $current["abbreviation"],
        "department" => $current["department"],
    ];

    if (groupListHasCode($groupCode, $groupID) || kdtbuHasCode($groupCode, $oldCode)) {
        rollbackGroupWrites();
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Code";
        echo json_encode($result);
        exit;
    }
    if (groupListHasName($groupName, $groupID) || kdtbuHasName($groupName, $oldCode, $groupCode)) {
        rollbackGroupWrites();
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Name";
        echo json_encode($result);
        exit;
    }

    if (syncKdtbu($oldCode, $groupCode, $groupName, $deptName) === false) {
        rollbackGroupWrites();
        error_log("edit_group kdtbu mutation failed");
        $result["isSuccess"] = false;
        $result["message"] = "Unable to save group.";
        echo json_encode($result);
        exit;
    }

    if ($oldCode !== $groupCode && updateEmployeeGroupCode($oldCode, $groupCode) === false) {
        rollbackGroupWrites();
        error_log("edit_group emp_prof mutation failed");
        $result["isSuccess"] = false;
        $result["message"] = "Unable to save group.";
        echo json_encode($result);
        exit;
    }

    $updateGroupQ = "UPDATE `group_list` SET `name`=:groupName, `abbreviation`=:groupCode, dept_id=:deptId WHERE `id`=:groupID";
    $updateGroupStmt = $conn_new_disable->prepare($updateGroupQ);
    if ($updateGroupStmt === false || $updateGroupStmt->execute([":groupCode" => $groupCode, ":groupName" => $groupName, ":deptId" => $deptID, ":groupID" => $groupID]) === false) {
        $errInfo = $updateGroupStmt ? $updateGroupStmt->errorInfo() : [];
        rollbackGroupWrites();
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

    $connDisable->commit();
    $connDisableQMS->commit();
    $conn_new_disable->commit();

    audit_log($actorEmpNum, "UPDATE", "group", $groupID, $oldGroup, [
        "name" => $groupName,
        "abbreviation" => $groupCode,
        "department" => $deptName,
    ]);
    $result["isSuccess"] = true;
} catch (Exception $e) {
    rollbackGroupWrites();
    error_log("edit_group mutation failed");
    $result["isSuccess"] = false;
    $result["message"] = "Unable to save group.";
}
#endregion

#region function
function rollbackGroupWrites()
{
    global $connDisable, $connDisableQMS, $conn_new_disable;
    if (isset($connDisable) && $connDisable->inTransaction()) {
        $connDisable->rollBack();
    }
    if (isset($connDisableQMS) && $connDisableQMS->inTransaction()) {
        $connDisableQMS->rollBack();
    }
    if (isset($conn_new_disable) && $conn_new_disable->inTransaction()) {
        $conn_new_disable->rollBack();
    }
}
function lockGroupListRow($groupid)
{
    global $conn_new_disable;
    $grpQ = "SELECT gl.`abbreviation` AS abbreviation,
                    gl.`name` AS name,
                    dl.`name` AS department
             FROM `group_list` AS gl
             LEFT JOIN `department_list` AS dl ON gl.dept_id = dl.id
             WHERE gl.`id` = :groupID
             LIMIT 1 FOR UPDATE";
    $grpStmt = $conn_new_disable->prepare($grpQ);
    if ($grpStmt === false || $grpStmt->execute([":groupID" => $groupid]) === false) {
        return null;
    }
    $row = $grpStmt->fetch();
    if ($row === false) {
        return null;
    }
    return [
        "abbreviation" => $row["abbreviation"],
        "name" => $row["name"],
        "department" => $row["department"],
    ];
}
function groupListHasCode($groupcode, $groupid)
{
    global $conn_new_disable;
    $countQ = "SELECT id FROM `group_list` WHERE `abbreviation`=:groupcode AND `id` <> :groupID LIMIT 1 FOR UPDATE";
    $countStmt = $conn_new_disable->prepare($countQ);
    if ($countStmt === false || $countStmt->execute([":groupcode" => $groupcode, ":groupID" => $groupid]) === false) {
        return true;
    }
    return $countStmt->fetchColumn() !== false;
}
function groupListHasName($groupname, $groupid)
{
    global $conn_new_disable;
    $countQ = "SELECT id FROM `group_list` WHERE `name`=:groupname AND `id` <> :groupID LIMIT 1 FOR UPDATE";
    $countStmt = $conn_new_disable->prepare($countQ);
    if ($countStmt === false || $countStmt->execute([":groupname" => $groupname, ":groupID" => $groupid]) === false) {
        return true;
    }
    return $countStmt->fetchColumn() !== false;
}
function kdtbuHasCode($newCode, $oldCode)
{
    global $connDisable;
    $countQ = "SELECT fldID FROM kdtbu WHERE fldBU=:newCode AND fldBU<>:oldCode LIMIT 1 FOR UPDATE";
    $countStmt = $connDisable->prepare($countQ);
    if ($countStmt === false || $countStmt->execute([":newCode" => $newCode, ":oldCode" => $oldCode]) === false) {
        return true;
    }
    return $countStmt->fetchColumn() !== false;
}
function kdtbuHasName($groupname, $oldCode, $newCode)
{
    global $connDisable;
    $countQ = "SELECT fldID FROM kdtbu WHERE fldBUName=:groupname AND fldBU<>:oldCode AND fldBU<>:newCode LIMIT 1 FOR UPDATE";
    $countStmt = $connDisable->prepare($countQ);
    if ($countStmt === false || $countStmt->execute([":groupname" => $groupname, ":oldCode" => $oldCode, ":newCode" => $newCode]) === false) {
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
function kdtbuIdsByCode($code)
{
    global $connDisable;
    $findQ = "SELECT fldID FROM kdtbu WHERE fldBU=:code FOR UPDATE";
    $findStmt = $connDisable->prepare($findQ);
    if ($findStmt === false || $findStmt->execute([":code" => $code]) === false) {
        return false;
    }
    return $findStmt->fetchAll(PDO::FETCH_COLUMN);
}
function syncKdtbu($oldCode, $newCode, $groupName, $deptName)
{
    global $connDisable;
    $ids = kdtbuIdsByCode($oldCode);
    if ($ids === false) {
        return false;
    }
    if (!$ids && $newCode !== $oldCode) {
        $ids = kdtbuIdsByCode($newCode);
        if ($ids === false) {
            return false;
        }
    }
    if ($ids) {
        $updateQ = "UPDATE kdtbu SET fldBU=:newCode, fldBUName=:groupName, fldDepartment=:deptName WHERE fldID=:id";
        $updateStmt = $connDisable->prepare($updateQ);
        if ($updateStmt === false) {
            return false;
        }
        foreach ($ids as $id) {
            if ($updateStmt->execute([":newCode" => $newCode, ":groupName" => $groupName, ":deptName" => $deptName, ":id" => $id]) === false) {
                return false;
            }
        }
        return true;
    }
    $insertQ = "INSERT INTO kdtbu(`fldBU`,`fldBUName`,`fldDepartment`) VALUES(:groupCode,:groupName,:deptName)";
    $insertStmt = $connDisable->prepare($insertQ);
    if ($insertStmt === false || $insertStmt->execute([":groupCode" => $newCode, ":groupName" => $groupName, ":deptName" => $deptName]) === false) {
        return false;
    }
    return true;
}
function updateEmployeeGroupCode($oldCode, $newCode)
{
    global $connDisable, $connDisableQMS;
    $editQ = "UPDATE emp_prof SET fldGroup=:newCode WHERE fldGroup=:oldCode";
    $kdtStmt = $connDisable->prepare($editQ);
    if ($kdtStmt === false || $kdtStmt->execute([":newCode" => $newCode, ":oldCode" => $oldCode]) === false) {
        return false;
    }
    $qmsStmt = $connDisableQMS->prepare($editQ);
    if ($qmsStmt === false || $qmsStmt->execute([":newCode" => $newCode, ":oldCode" => $oldCode]) === false) {
        return false;
    }
    return true;
}
#endregion
echo json_encode($result);
