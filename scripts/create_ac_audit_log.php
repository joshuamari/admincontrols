<?php
if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script from the command line.\n");
    exit(1);
}

require_once dirname(__DIR__) . '/dbconn/dbconnectkdtph.php';

if (!isset($connkdt)) {
    fwrite(STDERR, "Unable to connect to kdtphdb.\n");
    exit(1);
}

$sqlFile = __DIR__ . '/create_ac_audit_log.sql';
$sql = file_get_contents($sqlFile);
if ($sql === false || trim($sql) === '') {
    fwrite(STDERR, "Missing SQL file: {$sqlFile}\n");
    exit(1);
}

try {
    $connkdt->exec($sql);
    $err = $connkdt->errorInfo();
    if (!empty($err[1])) {
        fwrite(STDERR, "Unable to create ac_audit_log.\n");
        exit(1);
    }
    $check = $connkdt->query("SHOW TABLES LIKE 'ac_audit_log'");
    if ($check === false || $check->fetchColumn() === false) {
        fwrite(STDERR, "ac_audit_log was not created.\n");
        exit(1);
    }
    echo "ac_audit_log ready on kdtphdb.\n";
} catch (Exception $e) {
    fwrite(STDERR, "Unable to create ac_audit_log.\n");
    exit(1);
}
