<?php
declare(strict_types=1);

require_once('../../php/xmlrpc.php');

// In the future, we should use RFC6266 UTF8 encoding
// but as of Jan 2018, support is still questionable in some areas
// we should definitely revisit this in the future
function file_string(string $EscapeStr): string
{
    return str_replace(['"','*','/',':','<','>','?','\\','|'], '', $EscapeStr);
}

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
    if ($req->success())
        $filename = $req->val[1];
}

header('Content-Type: application/octet-stream');
header('Content-disposition: attachment; filename="'.file_string(basename($filename)).'"');

$internal = preg_replace('/^\/(home|mnt\/sd[a-z0-9]+)\/([a-z0-9]+)\//', '/ifiles/', $filename);
header('X-Accel-Redirect: '.$internal);
