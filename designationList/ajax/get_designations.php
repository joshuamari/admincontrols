<?php
#region Require Database Connections
// require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$designations = array();
$sectionID = 1;
if (!empty($_POST['sectionID'])) {
    $sectionID = $_POST['sectionID'];
}
#endregion

#region main
$desigQ = "SELECT * FROM `designation_list` WHERE `section`=:sectionID ORDER BY CASE WHEN `show_man_sum`!='0' THEN 1 ELSE 2 END,priority";
$desigStmt = $connnew->prepare($desigQ);
$desigStmt->execute([":sectionID" => $sectionID]);
if ($desigStmt->rowCount() > 0) {
    $desigArr = $desigStmt->fetchAll();
    foreach ($desigArr as $desig) {
        $output = array();
        $output["id"] = (int)$desig['id'];
        $output["name"] = $desig['name'];
        $output["acro"] = $desig['acronym'];
        $output["manSum"] = (int)$desig['show_man_sum'];
        array_push($designations, $output);
    }
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($designations);
