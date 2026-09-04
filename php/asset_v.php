<?php

/**
 * Cache-bust a public asset with that file's mtime.
 * $relPath is relative to the calling page (module index.php).
 */
function asset_v($relPath)
{
    $relPath = str_replace('\\', '/', (string) $relPath);
    $url = htmlspecialchars($relPath, ENT_QUOTES, 'UTF-8');

    $caller = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1);
    if (!isset($caller[0]['file'])) {
        return $url;
    }

    $baseDir = dirname($caller[0]['file']);
    $repoRoot = realpath(__DIR__ . '/..');
    $candidate = realpath($baseDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relPath));
    if ($repoRoot === false || $candidate === false || !is_file($candidate)) {
        return $url;
    }

    $repoRoot = rtrim(str_replace('\\', '/', $repoRoot), '/');
    $candidateNorm = str_replace('\\', '/', $candidate);
    $repoPrefix = $repoRoot . '/';
    if ($candidateNorm !== $repoRoot && strncmp($candidateNorm, $repoPrefix, strlen($repoPrefix)) !== 0) {
        return $url;
    }

    return $url . '?v=' . filemtime($candidate);
}
