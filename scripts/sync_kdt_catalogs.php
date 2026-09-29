<?php
if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line.\n");
    exit(1);
}

require_once dirname(__DIR__) . '/dbconn/dbconnectkdtph.php';
require_once dirname(__DIR__) . '/dbconn/dbconnectnew.php';
require_once dirname(__DIR__) . '/php/kdt_position_sync.php';

if (!isset($connDisable, $conn_new_disable, $connkdt)) {
    fwrite(STDERR, "Missing database connection.\n");
    exit(1);
}

$connDisable->beginTransaction();
$conn_new_disable->beginTransaction();

try {
    $listStmt = $conn_new_disable->query("SELECT id, acronym, name, section, priority, show_man_sum FROM `designation_list` WHERE acronym<>'hh'");
    $rows = $listStmt->fetchAll();
    $synced = 0;
    foreach ($rows as $row) {
        if (syncKdtPosition($row["id"], $row["acronym"], $row["name"], $row["section"], $row["priority"], $row["show_man_sum"]) === false) {
            throw new RuntimeException("Unable to sync designation " . $row["acronym"]);
        }
        $synced++;
    }

    $deptStmt = $conn_new_disable->prepare("SELECT name FROM `department_list` WHERE id=:id LIMIT 1");
    $deptStmt->execute([":id" => 3]);
    $industrialName = $deptStmt->fetchColumn();
    if ($industrialName === false || $industrialName === null || $industrialName === '') {
        throw new RuntimeException("Missing department_list id 3");
    }

    $groupStmt = $conn_new_disable->prepare("SELECT abbreviation FROM `group_list` WHERE dept_id=:deptID");
    $groupStmt->execute([":deptID" => 3]);
    $codes = $groupStmt->fetchAll(PDO::FETCH_COLUMN);
    $kdtbuStmt = $connDisable->prepare("UPDATE kdtbu SET fldDepartment=:deptName WHERE fldBU=:code AND fldDepartment<>:deptName");
    $renamed = 0;
    foreach ($codes as $code) {
        if ($kdtbuStmt->execute([":deptName" => $industrialName, ":code" => $code]) === false) {
            throw new RuntimeException("Unable to update kdtbu department for " . $code);
        }
        $renamed += $kdtbuStmt->rowCount();
    }

    $conn_new_disable->commit();
    $connDisable->commit();

    $maxId = (int)$connkdt->query("SELECT MAX(id) FROM kdtpositions")->fetchColumn();
    if ($maxId > 0) {
        $connkdt->exec("ALTER TABLE kdtpositions AUTO_INCREMENT = " . ($maxId + 1));
    }

    echo "Synced {$synced} designations. Updated {$renamed} kdtbu department names.\n";
} catch (Exception $e) {
    if ($conn_new_disable->inTransaction()) {
        $conn_new_disable->rollBack();
    }
    if ($connDisable->inTransaction()) {
        $connDisable->rollBack();
    }
    fwrite(STDERR, "Sync failed: " . $e->getMessage() . "\n");
    exit(1);
}
