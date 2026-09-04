<?php
#region DB Connect
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
    error_log("add_designation missing database connection");
    authJsonFail("Unable to save designation.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 40);

#region Initialize Variable
$posName = NULL;
if (!empty($_POST['name'])) {
    $posName = trim($_POST['name']);
}
$posAcr = NULL;
if (!empty($_POST['acro'])) {
    $posAcr = trim($_POST['acro']);
}
$sectionID = NULL;
if (!empty($_POST['sectionID'])) {
    $sectionID = filter_var($_POST['sectionID'], FILTER_VALIDATE_INT);
}

if ($posName === NULL || $posName === '') {
    authJsonFail("Position name is required.");
}
if ($posAcr === NULL || $posAcr === '') {
    authJsonFail("Position acronym is required.");
}
if ($sectionID === false || $sectionID === NULL || (int)$sectionID <= 0) {
    authJsonFail("Section is required.");
}
$sectionID = (int)$sectionID;
if (checkDuplicate($posName, $posAcr)) {
    authJsonFail("Duplicate designation.");
}
$prio = getMax($sectionID);

$msg = array();
#endregion

#region Entries Query
try {
    $insertQ = "INSERT INTO `designation_list`(`acronym`,`name`,`section`,`priority`) VALUES (:posAcr,:posName,:sectionID,:prio)";
    $insertStmt = $connnew->prepare($insertQ);
    if ($insertStmt === false || $insertStmt->execute([":posAcr" => $posAcr, ":posName" => $posName, ":sectionID" => $sectionID, ":prio" => $prio]) === false) {
        $errInfo = $insertStmt ? $insertStmt->errorInfo() : [];
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            authJsonFail("Duplicate designation.");
        }
        error_log("add_designation mutation failed");
        authJsonFail("Unable to save designation.");
    }
    $msg["isSuccess"] = true;
    $msg["message"] = "Adding designation successfull";
} catch (Exception $e) {
    error_log("add_designation mutation failed");
    authJsonFail("Unable to save designation.");
}

#endregion
echo json_encode($msg);


#region Functions
function checkDuplicate($posName, $posAcr)
{
    global $connnew;
    $isDuplicate = FALSE;
    $dupQ = "SELECT id FROM `designation_list` WHERE `name`=:posName OR `acronym`=:posAcr LIMIT 1";
    $dupStmt = $connnew->prepare($dupQ);
    $dupStmt->execute([":posName" => $posName, ":posAcr" => $posAcr]);
    if ($dupStmt->fetchColumn() !== false) {
        $isDuplicate = TRUE;
    }
    return $isDuplicate;
}
function getMax($secid)
{
    global $connnew;
    $max = 0;
    $maxQ = "SELECT MAX(`priority`) FROM `designation_list` WHERE `section`=:secid";
    $maxStmt = $connnew->prepare($maxQ);
    $maxStmt->execute([":secid" => $secid]);
    $fetched = $maxStmt->fetchColumn();
    if ($fetched !== false && $fetched !== NULL) {
        $max = (int)$fetched;
    }
    return $max + 1;
}
#endregion
