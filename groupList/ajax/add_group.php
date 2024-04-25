<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$result = array();
$groupName = NULL;
if (!empty($_POST['groupName'])) {
    $groupName = $_POST['groupName'];
}
$groupCode = NULL;
if (!empty($_POST['groupCode'])) {
    $groupCode = $_POST['groupCode'];
}
$deptName = NULL;
if (!empty($_POST['deptName'])) {
    $deptName = $_POST['deptName'];
}

#endregion

#region main
try {
    if (checkDuplicateCode($groupCode)) {
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Code";
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }
    if (checkDuplicateName($groupName)) {
        $result["isSuccess"] = false;
        $result["message"] = "Duplicate Group Name";
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }
    $insertGroupQ = "INSERT INTO kdtbu(`fldBU`,`fldBUName`,`fldDepartment`) VALUES(:groupCode,:groupName,:deptName)";
    $insertGroupStmt = $connkdt->prepare($insertGroupQ);
    $insertGroupStmt->execute([":groupCode" => $groupCode, ":groupName" => $groupName, ":deptName" => $deptName]);
    $result["isSuccess"] = true;
} catch (Exception $e) {
    $result["isSuccess"] = false;
    $result["message"] = $e->getMessage();
}
#endregion

#region function
function checkDuplicateCode($groupcode)
{
    global $connkdt;
    $isDuplicate = false;
    $countQ = "SELECT * FROM `kdtbu` WHERE `fldBU`=:groupcode";
    $countStmt = $connkdt->prepare($countQ);
    $countStmt->execute([":groupcode" => $groupcode]);
    if ($countStmt->rowCount() > 0) {
        $isDuplicate = true;
    }
    return $isDuplicate;
}
function checkDuplicateName($groupname)
{
    global $connkdt;
    $isDuplicate = false;
    $countQ = "SELECT * FROM `kdtbu` WHERE `fldBUName`=:groupname";
    $countStmt = $connkdt->prepare($countQ);
    $countStmt->execute([":groupname" => $groupname]);
    if ($countStmt->rowCount() > 0) {
        $isDuplicate = true;
    }
    return $isDuplicate;
}
#endregion
echo json_encode($result, JSON_PRETTY_PRINT);
