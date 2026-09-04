<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connnew)) {
    error_log("get_designations missing database connection");
    authJsonFail("Unable to load designations.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 40);

#region initialize variables
$designations = array();
$sectionID = 1;
if (!empty($_POST['sectionID'])) {
    $parsedSection = filter_var($_POST['sectionID'], FILTER_VALIDATE_INT);
    if ($parsedSection !== false && (int)$parsedSection > 0) {
        $sectionID = (int)$parsedSection;
    }
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

echo json_encode($designations);
