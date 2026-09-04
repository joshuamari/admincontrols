<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("get_years missing database connection");
    authJsonFail("Unable to load years.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 41);

#region initialize variables
$years = array();
#endregion

#region main
$yearQ = "SELECT DISTINCT YEAR(`fldDate`) as years FROM `kdtholiday` ORDER BY fldDate";
$yearStmt = $connkdt->prepare($yearQ);
$yearStmt->execute();
if ($yearStmt->rowCount() > 0) {
    $yearArr = $yearStmt->fetchAll(PDO::FETCH_COLUMN);
    $years = $yearArr;
}
#endregion

echo json_encode($years);
