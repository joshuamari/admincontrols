<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectqms.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$resdate = date("Y-m-d");
if (!empty($_POST['resdate'])) {
    $resdate = $_POST['resdate'];
}
$empnum = '';
if (!empty($_POST['empnum'])) {
    $empnum = $_POST['empnum'];
}
$karendate = date("Y-m-d");
$err = FALSE;
$connDisable->beginTransaction();
$connDisableQMS->beginTransaction();
#endregion

#region main
try {
    $insertQMSQuery = "INSERT INTO group_history(fldStartDate,fldEvent,fldLocation,fldEmployeeNumber,fldGroupName,fldPosition)  VALUES(:resdate,'Resign','KDT',:empnum,(SELECT fldGroup FROM emp_prof WHERE fldEmployeeNum=:empnum),(SELECT fldDesig FROM emp_prof WHERE fldEmployeeNum=:empnum))";
    $insertQMSStmt = $connqms->prepare($insertQMSQuery);
    $insertQMSStmt->execute([":resdate" => $resdate, ":empnum" => $empnum]);

    $editKDTQuery = "UPDATE emp_prof SET fldResignDate=:resdate  WHERE fldEmployeeNum=:empnum";
    $editKDTStmt = $connkdt->prepare($editKDTQuery);
    $editKDTStmt->execute([":resdate" => $resdate, ":empnum" => $empnum]);
    if ($karendate >= $resdate) {
        $editActiveKDTQuery = "UPDATE emp_prof SET fldActive=0  WHERE fldEmployeeNum=:empnum";
        $editActiveKDTStmt = $connkdt->prepare($editActiveKDTQuery);
        $editActiveKDTStmt->execute([":empnum" => $empnum]);
    }
    $connDisable->commit();
    $connDisableQMS->commit();
} catch (Exception $e) {
    $err = $e;
    $connDisable->rollBack();
    $connDisableQMS->rollBack();
}


#endregion

#region function

#endregion
echo json_encode($err, JSON_PRETTY_PRINT);
