<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectnew.php';
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectqms.php';
ob_end_clean();
require_once '../../php/require_auth.php';
require_once '../../php/audit_log.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (
    !isset($connkdt, $connqms, $connnew, $connDisable, $connDisableQMS, $conn_new_disable)
) {
    error_log("resign_employee missing database connection");
    authJsonFail("Unable to save employee.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 17);

#region initialize variables
$resdate = date("Y-m-d");
if (!empty($_POST['resdate'])) {
    $resdate = $_POST['resdate'];
}
$empnum = NULL;
if (!empty($_POST['empnum'])) {
    $empnum = filter_var($_POST['empnum'], FILTER_VALIDATE_INT);
}

if ($empnum === false || $empnum === NULL || (int)$empnum <= 0) {
    authJsonFail("Unable to save employee.");
}
$empnum = (int)$empnum;

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $resdate)) {
    authJsonFail("Unable to save employee.");
}

$oldEmployee = audit_fetch_employee($empnum);
if ($oldEmployee === null) {
    authJsonFail("Unable to save employee.");
}

$karendate = date("Y-m-d");
#endregion

#region main
try {
    $connDisable->beginTransaction();
    $connDisableQMS->beginTransaction();
    $conn_new_disable->beginTransaction();
    $insertQMSQuery = "INSERT INTO group_history(fldStartDate,fldEvent,fldLocation,fldEmployeeNumber,fldGroupName,fldPosition)  VALUES(:resdate,'Resign','KDT',:empnum,(SELECT fldGroup FROM emp_prof WHERE fldEmployeeNum=:empnum),(SELECT fldDesig FROM emp_prof WHERE fldEmployeeNum=:empnum))";
    $insertQMSStmt = $connDisableQMS->prepare($insertQMSQuery);
    $insertQMSStmt->execute([":resdate" => $resdate, ":empnum" => $empnum]);

    $editKDTQuery = "UPDATE emp_prof SET fldResignDate=:resdate  WHERE fldEmployeeNum=:empnum";
    $editKDTStmt = $connDisable->prepare($editKDTQuery);
    $editKDTStmt->execute([":resdate" => $resdate, ":empnum" => $empnum]);
    if ($karendate >= $resdate) {
        $editActiveKDTQuery = "UPDATE emp_prof SET fldActive=0  WHERE fldEmployeeNum=:empnum";
        $editActiveKDTStmt = $connDisable->prepare($editActiveKDTQuery);
        $editActiveKDTStmt->execute([":empnum" => $empnum]);
    }

    $editNewQuery = "UPDATE `employee_list` SET `resignation_date`=:resdate WHERE `id`=:empnum";
    $editNewStmt = $conn_new_disable->prepare($editNewQuery);
    $editNewStmt->execute([":resdate" => $resdate, ":empnum" => $empnum]);

    $connDisable->commit();
    $connDisableQMS->commit();
    $conn_new_disable->commit();
} catch (Exception $e) {
    $connDisable->rollBack();
    $connDisableQMS->rollBack();
    $conn_new_disable->rollBack();
    error_log("resign_employee mutation failed");
    authJsonFail("Unable to save employee.");
}

$nowResigned = ($karendate >= $resdate);
audit_log($actorEmpNum, "RESIGNED", "employee", $empnum, [
    "status" => $oldEmployee["status"],
    "resignation_date" => $oldEmployee["resignation_date"],
], [
    "status" => $nowResigned ? "Resigned" : "Active",
    "resignation_date" => $resdate,
]);
#endregion

echo json_encode(false);
