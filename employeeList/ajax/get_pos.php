<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$output = array();
#endregion

#region main
$posQ = "SELECT DISTINCT fldAcro,fldFull FROM `kdtpositions` ORDER BY fldAcro ASC";
$posStmt = $connkdt->query($posQ);
$posArr = $posStmt->fetchAll();
foreach ($posArr as $pos) {
    $acroPos = $pos['fldAcro'];
    $fullPos = $pos['fldFull'];
    $output[$acroPos] = $fullPos;
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($output);
