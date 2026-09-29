<?php
#region DB Connect
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
ob_end_clean();
require_once '../../php/require_auth.php';
require_once '../../php/audit_log.php';
require_once '../../php/kdt_position_sync.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connnew, $connDisable)) {
    error_log("add_designation missing database connection");
    authJsonFail("Unable to save designation.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
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
    $connnew->beginTransaction();
    $connDisable->beginTransaction();
    $insertQ = "INSERT INTO `designation_list`(`acronym`,`name`,`section`,`priority`) VALUES (:posAcr,:posName,:sectionID,:prio)";
    $insertStmt = $connnew->prepare($insertQ);
    if ($insertStmt === false || $insertStmt->execute([":posAcr" => $posAcr, ":posName" => $posName, ":sectionID" => $sectionID, ":prio" => $prio]) === false) {
        $errInfo = $insertStmt ? $insertStmt->errorInfo() : [];
        rollbackDesignationWrites();
        if (isset($errInfo[1]) && (int)$errInfo[1] === 1062) {
            authJsonFail("Duplicate designation.");
        }
        error_log("add_designation mutation failed");
        authJsonFail("Unable to save designation.");
    }
    $newPosId = (int)$connnew->lastInsertId();
    if ($newPosId <= 0 || syncKdtPosition($newPosId, $posAcr, $posName, $sectionID, $prio, 1) === false) {
        rollbackDesignationWrites();
        error_log("add_designation mutation failed");
        authJsonFail("Unable to save designation.");
    }
    $connnew->commit();
    $connDisable->commit();
    $created = audit_fetch_designation($newPosId);
    audit_log($actorEmpNum, "CREATE", "designation", $newPosId, null, $created !== null ? $created : [
        "name" => $posName,
        "acronym" => $posAcr,
        "priority" => $prio,
    ]);
    $msg["isSuccess"] = true;
    $msg["message"] = "Adding designation successfull";
} catch (Exception $e) {
    rollbackDesignationWrites();
    error_log("add_designation mutation failed");
    authJsonFail("Unable to save designation.");
}

#endregion
echo json_encode($msg);


#region Functions
function checkDuplicate($posName, $posAcr)
{
    global $connnew, $connkdt;
    $isDuplicate = FALSE;
    $dupQ = "SELECT id FROM `designation_list` WHERE `name`=:posName OR `acronym`=:posAcr LIMIT 1";
    $dupStmt = $connnew->prepare($dupQ);
    $dupStmt->execute([":posName" => $posName, ":posAcr" => $posAcr]);
    if ($dupStmt->fetchColumn() !== false) {
        $isDuplicate = TRUE;
    }
    if (!$isDuplicate) {
        $oldQ = "SELECT id FROM kdtpositions WHERE fldFull=:posName OR fldAcro=:posAcr LIMIT 1";
        $oldStmt = $connkdt->prepare($oldQ);
        $oldStmt->execute([":posName" => $posName, ":posAcr" => $posAcr]);
        if ($oldStmt->fetchColumn() !== false) {
            $isDuplicate = TRUE;
        }
    }
    return $isDuplicate;
}
function rollbackDesignationWrites()
{
    global $connnew, $connDisable;
    if ($connnew->inTransaction()) {
        $connnew->rollBack();
    }
    if ($connDisable->inTransaction()) {
        $connDisable->rollBack();
    }
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
