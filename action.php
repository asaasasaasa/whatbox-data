<?php

declare(strict_types=1);

require_once('../../php/xmlrpc.php');

if (!isset($_GET['hash']) || !isset($_GET['no'])) {
    http_response_code(400);
    header('Content-Type: text/plain');
    echo 'Expected hash (40 char string) and no (integer) parameters over HTTP GET';
    exit;
}

$req = new rXMLRPCRequest(
    new rXMLRPCCommand("f.frozen_path", [
        $_REQUEST['hash'],
        intval($_REQUEST['no'])
    ])
);
if (!$req->success()) {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo 'Unable to retrieve file path from rtorrent.';
    exit;
}

// Helpers
function pathArray(string $Path): array
{
    $Parts = explode('/', $Path);
    $Return = array();
    foreach ($Parts as $Part) {
        if ($Part == '..') {
            array_pop($Return);
        } else {
            if ($Part == '') {
                continue;
            }
            $Return[] = $Part;
        }
    }
    return $Return;
}

function pathString(string $Path): string
{
    return '/' . implode('/', pathArray($Path));
}


$filename = $req->val[0];

// rtorrent does not populate this value for stopped torernts
// so if this returns an empty string, we'll need to tell rtorrent
// to load the necessary data before after which we can close it
// to ensure we're not wasting resoures
if ($filename == '') {
    $req = new rXMLRPCRequest(
        [
            new rXMLRPCCommand("d.open", $_REQUEST['hash']),
            new rXMLRPCCommand("f.frozen_path", [$_REQUEST['hash'], intval($_REQUEST['no'])]),
            new rXMLRPCCommand("d.close", $_REQUEST['hash']),
        ]
    );
    if ($req->success()) {
        $filename = $req->val[1];
    }
}

// Resolve directory traversal
$filename = pathString($filename);
$username = posix_getpwuid(posix_geteuid())['name'];

if (!str_starts_with($filename, '/home/' . $username . '/')) {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo 'File path ' . $filename . ' did not start with /home/' . $username . '/ as expected';
    exit;
}

$filename = substr($filename, strlen('/home/' . $username . '/'));

http_response_code(303);
header("Location: /download/" . $filename);
