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
    error_log("toggle_active missing database connection");
    authJsonFail("Unable to update designation.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 40);

#region Initialize Variable
$sectionID = NULL;
if (!empty($_POST['sectionID'])) {
    $sectionID = filter_var($_POST['sectionID'], FILTER_VALIDATE_INT);
}
$posID = NULL;
if (!empty($_POST['posID'])) {
    $posID = filter_var($_POST['posID'], FILTER_VALIDATE_INT);
}
$toggleState = NULL;
if (isset($_POST['toggleState'])) {
    $toggleState = json_decode($_POST['toggleState']);
}

if ($sectionID === false || $sectionID === NULL || (int)$sectionID <= 0) {
    authJsonFail("Unable to update designation.");
}
$sectionID = (int)$sectionID;
if ($posID === false || $posID === NULL || (int)$posID <= 0) {
    authJsonFail("Unable to update designation.");
}
$posID = (int)$posID;
if (!is_bool($toggleState)) {
    authJsonFail("Unable to update designation.");
}
if (!designationExists($posID)) {
    authJsonFail("Unable to update designation.");
}

$prio = getMax($sectionID);
$msg = array();
$offQ = "UPDATE `designation_list` SET `priority` = 0, `show_man_sum` = 0 WHERE id=:posID";
$onQ = "UPDATE `designation_list` SET `priority`=:prio, `show_man_sum` = 1 WHERE id=:posID";
#endregion

#region Entries Query
try {
    if ($toggleState) {
        $updateStmt = $connnew->prepare($onQ);
        $executed = ($updateStmt !== false) && $updateStmt->execute([":prio" => $prio, ":posID" => $posID]);
    } else {
        $updateStmt = $connnew->prepare($offQ);
        $executed = ($updateStmt !== false) && $updateStmt->execute([":posID" => $posID]);
    }
    if (empty($executed)) {
        error_log("toggle_active mutation failed");
        authJsonFail("Unable to update designation.");
    }
    $msg["isSuccess"] = true;
    $msg["message"] = "Update designation successfull";
} catch (Exception $e) {
    error_log("toggle_active mutation failed");
    authJsonFail("Unable to update designation.");
}

#endregion
echo json_encode($msg);


#region Functions
function designationExists($posid)
{
    global $connnew;
    $posQ = "SELECT id FROM `designation_list` WHERE id=:posID LIMIT 1";
    $posStmt = $connnew->prepare($posQ);
    $posStmt->execute([":posID" => $posid]);
    return $posStmt->fetchColumn() !== false;
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
