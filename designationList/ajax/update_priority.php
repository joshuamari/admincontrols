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

if (!isset($connkdt, $conn_new_disable)) {
    error_log("update_priority missing database connection");
    authJsonFail("Unable to update designation.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 40);

#region Initialize Variable
$msg = array();
$sectionID = NULL;
if (!empty($_POST['secID'])) {
    $sectionID = filter_var($_POST['secID'], FILTER_VALIDATE_INT);
}
$posID = NULL;
if (!empty($_POST['posID'])) {
    $posID = filter_var($_POST['posID'], FILTER_VALIDATE_INT);
}
$oldIndex = NULL;
if (isset($_POST['oldIndex']) && $_POST['oldIndex'] !== '') {
    $oldIndex = filter_var($_POST['oldIndex'], FILTER_VALIDATE_INT);
}
$newIndex = NULL;
if (isset($_POST['newIndex']) && $_POST['newIndex'] !== '') {
    $newIndex = filter_var($_POST['newIndex'], FILTER_VALIDATE_INT);
}

if ($sectionID === false || $sectionID === NULL || (int)$sectionID <= 0) {
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
    echo json_encode($msg);
    exit;
}
$sectionID = (int)$sectionID;
if ($posID === false || $posID === NULL || (int)$posID <= 0) {
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
    echo json_encode($msg);
    exit;
}
$posID = (int)$posID;
if ($oldIndex === false || $oldIndex === NULL || (int)$oldIndex <= 0) {
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
    echo json_encode($msg);
    exit;
}
$oldIndex = (int)$oldIndex;
if ($newIndex === false || $newIndex === NULL || (int)$newIndex <= 0) {
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
    echo json_encode($msg);
    exit;
}
$newIndex = (int)$newIndex;
if (!designationExists($posID)) {
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
    echo json_encode($msg);
    exit;
}

$maxPrio = getMax($sectionID);
if ($newIndex > $maxPrio) {
    $msg["isSuccess"] = true;
    $msg['message'] = "new: $newIndex, max: $maxPrio";
    echo json_encode($msg);
    exit;
}
#endregion

#region Entries Query
try {
    $conn_new_disable->beginTransaction();
    $updateCurrentQ = "UPDATE `designation_list` SET `priority` = :newIndex WHERE id=:posID AND `show_man_sum`=1";
    $updateStmt = $conn_new_disable->prepare($updateCurrentQ);
    if ($updateStmt === false || $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID]) === false) {
        $conn_new_disable->rollBack();
        error_log("update_priority mutation failed");
        $msg["isSuccess"] = false;
        $msg["message"] = "Unable to update designation.";
        echo json_encode($msg);
        exit;
    }
    if ($newIndex != $oldIndex) {
        if ($newIndex < $oldIndex) {
            $updateQ = "UPDATE `designation_list` SET `priority` = `priority` + 1 WHERE `priority` >= :newIndex AND id<>:posID AND `priority`<>0 AND `priority` < :oldIndex AND `show_man_sum`=1";
            $updateStmt = $conn_new_disable->prepare($updateQ);
            if ($updateStmt === false || $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID, ":oldIndex" => $oldIndex]) === false) {
                $conn_new_disable->rollBack();
                error_log("update_priority mutation failed");
                $msg["isSuccess"] = false;
                $msg["message"] = "Unable to update designation.";
                echo json_encode($msg);
                exit;
            }
        } else if ($oldIndex < $newIndex) {
            $updateQ = "UPDATE `designation_list` SET `priority` = `priority` - 1 WHERE `priority` <= :newIndex AND id<>:posID AND `priority`<>0 AND `priority` > :oldIndex AND `show_man_sum`=1";
            $updateStmt = $conn_new_disable->prepare($updateQ);
            if ($updateStmt === false || $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID, ":oldIndex" => $oldIndex]) === false) {
                $conn_new_disable->rollBack();
                error_log("update_priority mutation failed");
                $msg["isSuccess"] = false;
                $msg["message"] = "Unable to update designation.";
                echo json_encode($msg);
                exit;
            }
        }
    }

    $conn_new_disable->commit();
    $msg["isSuccess"] = true;
    $msg["message"] = "Update Priority successfull";
} catch (Exception $e) {
    $conn_new_disable->rollBack();
    error_log("update_priority mutation failed");
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
}

#endregion
echo json_encode($msg);

#region Functions
function designationExists($posid)
{
    global $conn_new_disable;
    $posQ = "SELECT id FROM `designation_list` WHERE id=:posID LIMIT 1";
    $posStmt = $conn_new_disable->prepare($posQ);
    $posStmt->execute([":posID" => $posid]);
    return $posStmt->fetchColumn() !== false;
}
function getMax($secid)
{
    global $conn_new_disable;
    $max = 0;
    $maxQ = "SELECT MAX(`priority`) FROM `designation_list` WHERE `section`=:secid";
    $maxStmt = $conn_new_disable->prepare($maxQ);
    $maxStmt->execute([":secid" => $secid]);
    $fetched = $maxStmt->fetchColumn();
    if ($fetched !== false && $fetched !== NULL) {
        $max = (int)$fetched;
    }
    return $max;
}
#endregion
