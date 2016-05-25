<?php
/*
Plugin Name: Edit Syntax Highlight
Description: Adds syntax highlighting when the HTML editor is disabled
Version: 1.0
Author: Vitalii Blagodir
*/

# get correct id for plugin
$thisfile = basename(__FILE__, ".php");

# register plugin
register_plugin(
	$thisfile,
	'Edit Syntax Highlight', 						# Title of plugin
	'1.0', 											# Version of plugin
	'Vitalii Blagodir',								# Author of plugin
	'https://github.com/VitaliiBlagodir', 			# Author URL
	'Adds syntax highlighting when the HTML editor is disabled',
	'', 											# Page type of plugin
	''  											# Function that displays content
);

# activate hooks
$bt = debug_backtrace();
$shift = count($bt) -1;	
if(pathinfo_filename($bt[$shift]['file'])=="edit" && (int)$HTMLEDITOR<1){
	add_action('header', 'addCodeMirrorToEdit', array());
}

function addCodeMirrorToEdit() {
	echo '
    <script type="text/javascript" src="template/js/codemirror/lib/codemirror-compressed.js"></script>
    <link rel="stylesheet" href="template/js/codemirror/lib/codemirror.css">
    <link rel="stylesheet" href="template/js/codemirror/theme/default.css">

    <script type="text/javascript">
    window.onload = function() {
        var editor = CodeMirror.fromTextArea(document.getElementById("post-content"), {
            lineNumbers: true,
            lineWrapping: false,
            matchBrackets: true,
            indentUnit: 4,
            indentWithTabs: true,
            enterMode: "keep",
            mode:"application/x-httpd-php",
            tabMode: "shift"
        });
    }  
    </script>
';
}