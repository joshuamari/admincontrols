<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$positions = array();
#endregion

#region main
// $posQ = "SELECT DISTINCT fldAcro,fldFull FROM `kdtpositions` ORDER BY fldAcro ASC";
// $posStmt = $connkdt->query($posQ);
// $posArr = $posStmt->fetchAll();
// foreach ($posArr as $pos) {
//     $acroPos = $pos['fldAcro'];
//     $fullPos = $pos['fldFull'];
//     $output[$acroPos] = $fullPos;
// }
$posQ = "SELECT * FROM `designation_list` ORDER BY `acronym`";
$posStmt = $connnew->query($posQ);
$positions = $posStmt->fetchAll();

#endregion

#region function

#endregion
echo json_encode($positions);
