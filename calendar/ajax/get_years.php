<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

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

#region function

#endregion
echo json_encode($years);
