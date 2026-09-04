<?php
/**
 * Create ac_audit_log on kdtphdb (DB1).
 * CLI: php dbs/migrations/001_ac_audit_log.php
 */

if (PHP_SAPI !== 'cli') {
    header('Content-Type: text/plain; charset=utf-8');
    http_response_code(403);
    echo "Run from CLI: php dbs/migrations/001_ac_audit_log.php\n";
    exit(1);
}

$sqlFile = __DIR__ . DIRECTORY_SEPARATOR . '001_ac_audit_log.sql';
if (!is_readable($sqlFile)) {
    fwrite(STDERR, "Missing SQL file: {$sqlFile}\n");
    exit(1);
}

$sql = file_get_contents($sqlFile);
if ($sql === false || trim($sql) === '') {
    fwrite(STDERR, "Empty SQL file: {$sqlFile}\n");
    exit(1);
}

$projectRoot = dirname(__DIR__, 2);
ob_start();
require_once $projectRoot . '/dbconn/dbconnectkdtph.php';
ob_end_clean();

if (!isset($connkdt)) {
    fwrite(STDERR, "Unable to connect to kdtphdb.\n");
    exit(1);
}

try {
    $connkdt->exec($sql);
    $err = $connkdt->errorInfo();
    if (!empty($err[1])) {
        error_log("001_ac_audit_log migration failed");
        fwrite(STDERR, "Migration failed.\n");
        exit(1);
    }
    $check = $connkdt->query("SHOW TABLES LIKE 'ac_audit_log'");
    if ($check === false || $check->fetchColumn() === false) {
        fwrite(STDERR, "ac_audit_log was not created.\n");
        exit(1);
    }
    echo "ac_audit_log ready on kdtphdb.\n";
    exit(0);
} catch (Exception $e) {
    error_log("001_ac_audit_log migration failed");
    fwrite(STDERR, "Migration failed.\n");
    exit(1);
}
