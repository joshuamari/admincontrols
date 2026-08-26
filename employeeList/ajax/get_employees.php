<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region Set Timezone
date_default_timezone_set('Asia/Manila');
#endregion

$result = [];

#region Initialize Variables
$searchWord = '';
if (!empty($_POST['searchWord'])) {
    $searchWord = $_POST['searchWord'];
}

$active = 0;
if (!empty($_POST['active'])) {
    $active = $_POST['active'];
}

$activeStatement = '';
if ($active == 1) {
    $activeStatement = " AND (
        ep.fldResignDate IS NULL
        OR ep.fldResignDate = '0000-00-00'
        OR ep.fldResignDate >= CURDATE()
    )";
}
#endregion

#region Main Query
try {
    $empQ = "SELECT ep.fldEmployeeNum AS emp_num,
                    CONCAT(ep.fldFirstname, ' ', ep.fldSurname) AS emp_name,
                    ep.fldUser AS emp_user,
                    ep.fldGroup AS emp_group,
                    bu.fldDepartment AS emp_dept,
                    ep.fldDesig AS emp_pos,
                    (
                        ep.fldResignDate IS NULL
                        OR ep.fldResignDate = '0000-00-00'
                        OR ep.fldResignDate >= CURDATE()
                    ) AS is_active
             FROM emp_prof AS ep
             JOIN kdtbu AS bu ON ep.fldGroup = bu.fldBU
             WHERE ep.fldNick != '' AND 
                   (ep.fldSurname LIKE :search1 OR 
                    ep.fldFirstname LIKE :search2 OR 
                    ep.fldEmployeeNum LIKE :search3 OR 
                    CONCAT(ep.fldFirstname, ' ', ep.fldSurname) LIKE :search4)
                   $activeStatement
             ORDER BY is_active DESC, ep.fldEmployeeNum";

    $empStmt = $connkdt->prepare($empQ);
    $likeSearch = "%$searchWord%";
    $empStmt->execute([
        ':search1' => $likeSearch,
        ':search2' => $likeSearch,
        ':search3' => $likeSearch,
        ':search4' => $likeSearch
    ]);

    if ($empStmt->rowCount() > 0) {
        $result = $empStmt->fetchAll();
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

#region Output
echo json_encode($result);
#endregion