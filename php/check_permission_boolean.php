<?php
/**
 * Boolean nav-access check used by module ajax/check_*.php wrappers.
 * Missing auth/CSRF must stay JSON false — JS treats a truthy object as granted.
 */
ob_start();
require_once __DIR__ . '/require_auth.php';
ob_end_clean();

date_default_timezone_set('Asia/Manila');

function emitPermissionAccessBoolean($permissionId)
{
    csrf_require_boolean();
    $access = false;
    $actorEmpNum = findAuthenticatedUser();
    if ($actorEmpNum !== null && userHasPermission($actorEmpNum, $permissionId)) {
        $access = true;
    }
    echo json_encode($access);
}
