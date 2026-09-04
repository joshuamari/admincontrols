<?php
#region DB Connect
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("delete_holiday missing database connection");
    authJsonFail("Unable to delete holiday.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 41);

#region Initialize Variable
$delID = NULL;
if (!empty($_POST['delID'])) {
    $delID = filter_var($_POST['delID'], FILTER_VALIDATE_INT);
}
if ($delID === false || $delID === NULL || (int)$delID <= 0) {
    authJsonFail("Unable to delete holiday.");
}
$delID = (int)$delID;
if (!holidayExists($delID)) {
    authJsonFail("Unable to delete holiday.");
}

$msg = array();
#endregion

#region Entries Query
try {
    $deleteQ = "DELETE FROM `kdtholiday` WHERE fldID=:delID";
    $deleteStmt = $connkdt->prepare($deleteQ);
    if ($deleteStmt === false || $deleteStmt->execute([":delID" => $delID]) === false) {
        error_log("delete_holiday mutation failed");
        authJsonFail("Unable to delete holiday.");
    }
    $msg["isSuccess"] = true;
    $msg["message"] = "Deleting holiday successfull";
} catch (Exception $e) {
    error_log("delete_holiday mutation failed");
    authJsonFail("Unable to delete holiday.");
}

#endregion
echo json_encode($msg);


#region Functions
function holidayExists($holidayid)
{
    global $connkdt;
    $holQ = "SELECT fldID FROM `kdtholiday` WHERE fldID=:holidayid LIMIT 1";
    $holStmt = $connkdt->prepare($holQ);
    $holStmt->execute([":holidayid" => $holidayid]);
    return $holStmt->fetchColumn() !== false;
}
#endregion
