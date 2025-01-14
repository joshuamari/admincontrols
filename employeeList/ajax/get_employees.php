<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

$result = array();

#region initialize variables
$searchWord = '';
if (!empty($_POST['searchWord'])) {
    $searchWord = $_POST['searchWord'];
}
$active = 0;
if (!empty($_POST['active'])) {
    $active = $_POST['active'];
}
$activeStatement = "";
if ($active == 1) {
    $activeStatement = " AND ep.fldActive=1";
}
#endregion

#region main
try {
    $empQ = "SELECT `ep`.`fldEmployeeNum` AS  `emp_num`,
        CONCAT(`ep`.`fldFirstname`,' ', `ep`.`fldSurname`) AS `emp_name`,
        `ep`.`fldUser` AS `emp_user`,
        `ep`.`fldGroup` AS `emp_group`,
        `bu`.`fldDepartment` AS `emp_dept`,
        `ep`.`fldDesig` AS `emp_pos` 
        FROM emp_prof AS `ep` 
        JOIN kdtbu AS `bu` ON `ep`.`fldGroup` = `bu`.`fldBU` 
        WHERE `ep`.`fldNick` != '' AND 
        (`ep`.`fldSurname` LIKE :esearch OR 
        `ep`.`fldFirstname` LIKE :esearch OR 
        `ep`.`fldEmployeeNum` LIKE :esearch OR
        CONCAT(`ep`.`fldFirstname`, ' ', `ep`.`fldSurname`) LIKE :esearch) 
        $activeStatement 
        ORDER BY `ep`.`fldActive` DESC, `ep`.`fldEmployeeNum`";
    $empStmt = $connkdt->prepare($empQ);
    $empStmt->execute([":esearch" => "%$searchWord%"]);
    if ($empStmt->rowCount() > 0) {
        $result = $empStmt->fetchAll();
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

#region function

#endregion
echo json_encode($result);
