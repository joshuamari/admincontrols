<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
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
$desigQ = "SELECT * FROM `kdtpositions` WHERE fldSectionID=:sectionID ORDER BY CASE WHEN fldShowManSum!='0' THEN 1 ELSE 2 END,fldPrio";
$desigStmt = $connkdt->prepare($desigQ);
$desigStmt->execute([":sectionID" => $sectionID]);
if ($desigStmt->rowCount() > 0) {
    $desigArr = $desigStmt->fetchAll();
    foreach ($desigArr as $desig) {
        $output = array();
        $output["id"] = (int)$desig['id'];
        $output["name"] = $desig['fldFull'];
        $output["acro"] = $desig['fldAcro'];
        $output["manSum"] = (int)$desig['fldShowManSum'];
        array_push($designations, $output);
    }
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($designations);
