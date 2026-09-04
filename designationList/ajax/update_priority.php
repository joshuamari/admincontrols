<?php
#region DB Connect
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

if (!isset($connkdt, $conn_new_disable)) {
    error_log("update_priority missing database connection");
    authJsonFail("Unable to update designation.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 40);

#region Initialize Variable
$msg = array();
$sectionID = NULL;
if (isset($_POST['secID']) && $_POST['secID'] !== '') {
    $sectionID = filter_var($_POST['secID'], FILTER_VALIDATE_INT);
}
$posID = NULL;
if (isset($_POST['posID']) && $_POST['posID'] !== '') {
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
if ($oldIndex === false || $oldIndex === NULL || (int)$oldIndex < 0) {
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
    echo json_encode($msg);
    exit;
}
$oldIndex = (int)$oldIndex;
if ($newIndex === false || $newIndex === NULL || (int)$newIndex < 0) {
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
    echo json_encode($msg);
    exit;
}
$newPriority = (int)$newIndex;
#endregion

#region Entries Query
try {
    $conn_new_disable->beginTransaction();

    $oldPriority = getDesignationPriority($posID, $sectionID);
    if ($oldPriority === NULL) {
        $conn_new_disable->rollBack();
        $msg["isSuccess"] = false;
        $msg["message"] = "Unable to update designation.";
        echo json_encode($msg);
        exit;
    }

    $maxPrio = getMax($sectionID);
    if ($newPriority < 1 || $newPriority > $maxPrio) {
        $conn_new_disable->rollBack();
        $msg["isSuccess"] = false;
        $msg["message"] = "Unable to update designation.";
        echo json_encode($msg);
        exit;
    }

    if ($oldPriority === $newPriority) {
        $conn_new_disable->commit();
        $msg["isSuccess"] = true;
        $msg["message"] = "Update Priority successfull";
        echo json_encode($msg);
        exit;
    }

    if ($newPriority < $oldPriority) {
        $updateQ = "UPDATE `designation_list` SET `priority` = `priority` + 1 WHERE `section`=:sectionID AND `show_man_sum`=1 AND `priority`<>0 AND id<>:posID AND `priority` >= :newPriority AND `priority` < :oldPriority";
        $updateStmt = $conn_new_disable->prepare($updateQ);
        if ($updateStmt === false || $updateStmt->execute([":sectionID" => $sectionID, ":posID" => $posID, ":newPriority" => $newPriority, ":oldPriority" => $oldPriority]) === false) {
            $conn_new_disable->rollBack();
            error_log("update_priority mutation failed");
            $msg["isSuccess"] = false;
            $msg["message"] = "Unable to update designation.";
            echo json_encode($msg);
            exit;
        }
    } else if ($oldPriority < $newPriority) {
        $updateQ = "UPDATE `designation_list` SET `priority` = `priority` - 1 WHERE `section`=:sectionID AND `show_man_sum`=1 AND `priority`<>0 AND id<>:posID AND `priority` > :oldPriority AND `priority` <= :newPriority";
        $updateStmt = $conn_new_disable->prepare($updateQ);
        if ($updateStmt === false || $updateStmt->execute([":sectionID" => $sectionID, ":posID" => $posID, ":newPriority" => $newPriority, ":oldPriority" => $oldPriority]) === false) {
            $conn_new_disable->rollBack();
            error_log("update_priority mutation failed");
            $msg["isSuccess"] = false;
            $msg["message"] = "Unable to update designation.";
            echo json_encode($msg);
            exit;
        }
    }

    $updateCurrentQ = "UPDATE `designation_list` SET `priority` = :newPriority WHERE id=:posID AND `section`=:sectionID AND `show_man_sum`=1 AND `priority`<>0";
    $updateStmt = $conn_new_disable->prepare($updateCurrentQ);
    if ($updateStmt === false || $updateStmt->execute([":newPriority" => $newPriority, ":posID" => $posID, ":sectionID" => $sectionID]) === false) {
        $conn_new_disable->rollBack();
        error_log("update_priority mutation failed");
        $msg["isSuccess"] = false;
        $msg["message"] = "Unable to update designation.";
        echo json_encode($msg);
        exit;
    }

    $verifyQ = "SELECT `priority` FROM `designation_list` WHERE id=:posID AND `section`=:sectionID AND `show_man_sum`=1 AND `priority`<>0 LIMIT 1";
    $verifyStmt = $conn_new_disable->prepare($verifyQ);
    if ($verifyStmt === false || $verifyStmt->execute([":posID" => $posID, ":sectionID" => $sectionID]) === false) {
        $conn_new_disable->rollBack();
        error_log("update_priority mutation failed");
        $msg["isSuccess"] = false;
        $msg["message"] = "Unable to update designation.";
        echo json_encode($msg);
        exit;
    }
    $updatedPriority = $verifyStmt->fetchColumn();
    if ($updatedPriority === false || (int)$updatedPriority !== $newPriority) {
        $conn_new_disable->rollBack();
        error_log("update_priority mutation failed");
        $msg["isSuccess"] = false;
        $msg["message"] = "Unable to update designation.";
        echo json_encode($msg);
        exit;
    }

    $conn_new_disable->commit();
    audit_log($actorEmpNum, "UPDATE", "designation", $posID, [
        "priority" => $oldPriority,
    ], [
        "priority" => $newPriority,
    ]);
    $msg["isSuccess"] = true;
    $msg["message"] = "Update Priority successfull";
} catch (Exception $e) {
    if ($conn_new_disable->inTransaction()) {
        $conn_new_disable->rollBack();
    }
    error_log("update_priority mutation failed");
    $msg["isSuccess"] = false;
    $msg["message"] = "Unable to update designation.";
}

#endregion
echo json_encode($msg);

#region Functions
function getDesignationPriority($posid, $secid)
{
    global $conn_new_disable;
    $posQ = "SELECT `priority` FROM `designation_list` WHERE id=:posID AND `section`=:secID AND `show_man_sum`=1 AND `priority`<>0 LIMIT 1 FOR UPDATE";
    $posStmt = $conn_new_disable->prepare($posQ);
    if ($posStmt === false || $posStmt->execute([":posID" => $posid, ":secID" => $secid]) === false) {
        return NULL;
    }
    $fetched = $posStmt->fetchColumn();
    if ($fetched === false || $fetched === NULL) {
        return NULL;
    }
    return (int)$fetched;
}
function getMax($secid)
{
    global $conn_new_disable;
    $max = 0;
    $maxQ = "SELECT MAX(`priority`) FROM `designation_list` WHERE `section`=:secid AND `show_man_sum`=1 AND `priority`<>0 FOR UPDATE";
    $maxStmt = $conn_new_disable->prepare($maxQ);
    $maxStmt->execute([":secid" => $secid]);
    $fetched = $maxStmt->fetchColumn();
    if ($fetched !== false && $fetched !== NULL) {
        $max = (int)$fetched;
    }
    return $max;
}
#endregion
