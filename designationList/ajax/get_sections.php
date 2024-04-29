<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$sections = array();
#endregion

#region main
$secQ = "SELECT * FROM `kdtpositions_sections` ORDER BY fldSectionID";
$secStmt = $connkdt->prepare($secQ);
$secStmt->execute();
if ($secStmt->rowCount() > 0) {
    $secArr = $secStmt->fetchAll();
    foreach ($secArr as $sec) {
        $output = array();
        $output["id"] = (int)$sec['fldSectionID'];
        $output["secName"] = $sec['fldSection'];
        array_push($sections, $output);
    }
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($sections);
