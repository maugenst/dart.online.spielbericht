<?php
# get correct id for plugin
$thisfile=basename(__FILE__, ".php");

# register plugin
register_plugin(
	$thisfile, 													# ID of plugin, should be filename minus php
	'TinyMCE', 									# Title of plugin
	'0.2', 															# Version of plugin
	'iDeFiX',											# Author of plugin
	'', 			# Author URL
	'TinyMCE HTML Editor', 	# Plugin Description
	'plugins', 													# Page type of plugin
	'tinymce_config'  										# Function that displays content
);
add_action('plugins-sidebar', 'createSideMenu', array($thisfile, 'TinyMCE'));

define('TINYMCEPATH', GSPLUGINPATH.$thisfile.'/tiny_mce/');
define('TINYMCEPLUGINCFG', GSDATAOTHERPATH . $thisfile . '.xml');

# activate filter
//if (version_compare(GSVERSION, '3.0', '>=')) {
	add_action('edit-content', 'tinymce_hook');
//}

function tinymce_require_once($f) {
	if( file_exists($f) ) {
		require_once($f);
		return TRUE;
	}
	return FALSE;
}


function tinymce_getXML($f) {
	if( file_exists($f) ) {
		return getXML(TINYMCEPLUGINCFG);
	}
	return null;
}

function tinymce_gsplugin_exists( $name ) {
	global $plugin_info;
	
	if( !is_array($name) ) {
		return array_key_exists( $name, $plugin_info);
	}
	
	foreach( $name as $key) {
		if( !isset($plugin_info[$key])) {
			return FALSE;
		}
	}
	return TRUE;
}

function tinymce_config() {
	
	global $thisfile;
	global $HTMLEDITOR;
	
	?>
	<h3>TinyMCE Plugin</h3>
		
	<?php
	if (version_compare(GSVERSION, '3.0', '<')) {
		if (!tinymce_require_once(GSPLUGINPATH.'i18n_common/common.php') || !function_exists('i18n_merge') ) {
			echo '<div class="error">This plugin requires i18n support. Please upgrade to GetSimple version 3 or higher or install the i18n plugin.</div>';
			return; // Nothing to do
		}
	}
	i18n_merge($thisfile);
			
	// Handle submitted configuration
	if(isset($_POST['submitted'])) {
		
		$TINYMCETHEME = isset($_POST['theme']) ? $_POST['theme'] : 'advanced';
		$TINYMCEPLUGINS = isset($_POST['plugins']) ? $_POST['plugins'] : '';
		$TINYMCECOMPATIBILITY = isset($_POST['compatibility']) ? $_POST['compatibility'] : 'auto';
		
		// Auto add toolbar buttons
		$TINYMCEBUTTONS1 = '';
		$TINYMCEBUTTONS2 = '';
		$TINYMCEBUTTONS3 = '';
		$TINYMCEBUTTONS4 = '';
		if (is_array($TINYMCEPLUGINS)) {
			$list = null;
			foreach ($TINYMCEPLUGINS as $item) {
				$pluginsrc = file_get_contents( TINYMCEPATH. 'plugins/'.$item.'/editor_plugin.js');
				if (preg_match_all('/\.addButton\("([a-zA-Z0-9]+)"/', $pluginsrc, $matches, PREG_SET_ORDER)>0 || preg_match_all('/\.addButton\(\'([a-zA-Z0-9]+)\'/', $pluginsrc, $matches, PREG_SET_ORDER)>0) {
					foreach ($matches as $item) {
						$list[] = $item[1];
					}
				}
			}
			$TINYMCEBUTTONS4 = implode(",", $list);
			$TINYMCEPLUGINS = implode(",", $TINYMCEPLUGINS);
		}

		// Save config
		$xmls = new SimpleXMLExtended('<item></item>');
		$note = $xmls->addChild('THEME');
		$note->addCData($TINYMCETHEME);
		$note = $xmls->addChild('PLUGINS');
		$note->addCData( $TINYMCEPLUGINS );
		$note = $xmls->addChild('COMPATIBILITY');
		$note->addCData($TINYMCECOMPATIBILITY);
		$note = $xmls->addChild('BUTTONS1');
		$note->addCData($TINYMCEBUTTONS1);
		$note = $xmls->addChild('BUTTONS2');
		$note->addCData($TINYMCEBUTTONS2);
		$note = $xmls->addChild('BUTTONS3');
		$note->addCData($TINYMCEBUTTONS3);
		$note = $xmls->addChild('BUTTONS4');
		$note->addCData($TINYMCEBUTTONS4);
		if (! XMLsave($xmls, TINYMCEPLUGINCFG) ) {
			$error = i18n_r('CHMOD_ERROR');
		} else {
			$success = i18n_r('ER_SETTINGS_UPD');
		}	
	}
	
	// Load config
	$data 		= tinymce_getXML(TINYMCEPLUGINCFG);
	$TINYMCETHEME = ($data!=null) ? trim($data->THEME) : 'advanced';
	$TINYMCEPLUGINS = ($data!=null) ? split(",", trim($data->PLUGINS)) : array();
	$TINYMCECOMPATIBILITY = ($data!=null) ? trim($data->COMPATIBILITY) : 'auto';
	
	if ($HTMLEDITOR=='') {
		echo '<div class="error">'.i18n($thisfile.'/HLP_HTMLEDITOR').'</div>';
	}
	
	if (isset($error)) {
		echo '<div class="error">'.$error.'</div>';
	}	elseif (isset($success)) {
		echo '<div class="updated">'.$success.'</div>';
	}
	?>

	<form class="largeform" action="<?php echo htmlentities($_SERVER['PHP_SELF'], ENT_QUOTES); ?>?id=<?php echo $thisfile; ?>" method="post" accept-charset="utf-8" >
			
		<div class="leftsec">
			<p><label for="theme" title="<?php i18n($thisfile.'/HLP_THEME'); ?>"><?php i18n($thisfile.'/THEME');?>:</label>
			<?php
			$themepath = TINYMCEPATH. 'themes/';
			$handle = opendir($themepath) or die("Unable to open ". $themepath);
			$items = null; $list = null;
			while ($lfile = readdir($handle)) {
				if( is_dir($themepath.$lfile) && $lfile != "." && $lfile != ".." )	{
					$list[] = $lfile;
				}
			}
			if (count($list) != 0) {
				sort($list);
				$sel = ''; $langs = '';
				foreach ($list as $item) {
					if ($TINYMCETHEME == $item)	{ $sel="selected"; }
					$items .= '<option '.$sel.' value="'.$item.'" >'.$item.'</option>';
					$sel = '';
				}
			} else {
				$items = '<option value="" selected="selected" >-- '.i18n_r('NONE').' --</option>';
			}						
			?>
			<select name="theme" id="theme" class="text">
				<?php echo $items; ?>
			</select>			
			</p>
		</div>
		<div class="clear"></div>
		<div class="leftsec">
			<p><label for="plugins" title="<?php i18n($thisfile.'/HLP_PLUGINS'); ?>"><?php i18n($thisfile.'/PLUGINS');?>:</label>
			<?php
			$pluginpath = TINYMCEPATH. 'plugins/';
			$handle = opendir($pluginpath) or die("Unable to open ". $pluginpath);
			$items = null; $list = null;
			while ($lfile = readdir($handle)) {
				if( is_dir($pluginpath.$lfile) && $lfile != "." && $lfile != ".." )	{
					$list[] = $lfile;
				}
			}
			if (count($list) != 0) {
				sort($list);
				foreach ($list as $item) {
					$sel = in_array($item, $TINYMCEPLUGINS) ? 'selected="selected"' : '';
					$items .= '<option '.$sel.' value="'.$item.'" >'.$item.'</option>';
					$sel = '';
				}
			} else {
				$items = '<option value="" selected="selected" >-- '.i18n_r('NONE').' --</option>';
			}						
			?>
			<select name="plugins[]" multiple="multiple" class="text" size="5">
				<?php echo $items; ?>
			</select>			
			</p>
		</div>		
		<div class="clear"></div>
		<div class="leftsec">
			<p><label for="compatibility" title="<?php i18n($thisfile.'/HLP_COMPATIBILITY'); ?>"><?php i18n($thisfile.'/COMPATIBILITY');?>:</label>			
			<select name="compatibility" class="text">
				<option value="auto" <?php if ($TINYMCECOMPATIBILITY=='auto') { echo "selected"; } ?>><?php i18n($thisfile.'/AUTO');?></option>
				<option value="high" <?php if ($TINYMCECOMPATIBILITY=='high') { echo "selected"; } ?>><?php i18n($thisfile.'/HIGH');?></option>
				<option value="none" <?php if ($TINYMCECOMPATIBILITY=='none') { echo "selected"; } ?>><?php i18n($thisfile.'/NONE');?></option>
			</select>
			</p>
		</div>
		<div class="clear"></div>
		
		<p id="submit_line" >
			<span><input class="submit" type="submit" name="submitted" value="<?php i18n('BTN_SAVESETTINGS');?>" /></span> &nbsp;&nbsp;<?php i18n('OR'); ?>&nbsp;&nbsp; <a class="cancel" href="<?php echo htmlentities($_SERVER['PHP_SELF'], ENT_QUOTES); ?>?id=<?php echo $thisfile; ?>"><?php i18n('CANCEL'); ?></a>
		</p>

	</form>	
	<?php
}

function tinymce_hook() {

	global $HTMLEDITOR;
	global $TEMPLATE;
	global $LANG;
	
	if ($HTMLEDITOR=='') {
		return;
	}
		
	// Load config
	$data 		= tinymce_getXML(TINYMCEPLUGINCFG);
	$TINYMCETHEME = ($data!=null) ? trim($data->THEME) : 'advanced';
	$TINYMCEPLUGINS = ($data!=null) ? trim($data->PLUGINS) : '';
	$TINYMCECOMPATIBILITY = ($data!=null) ? trim($data->COMPATIBILITY) : 'auto';
	$TINYMCEBUTTONS1  = ($data!=null) ? trim($data->BUTTONS1) : '';
	$TINYMCEBUTTONS2  = ($data!=null) ? trim($data->BUTTONS2) : '';
	$TINYMCEBUTTONS3  = ($data!=null) ? trim($data->BUTTONS3) : '';
	$TINYMCEBUTTONS4  = ($data!=null) ? trim($data->BUTTONS4) : '';

	$TINYMCEHEIGHT = defined('GSEDITORHEIGHT') ? GSEDITORHEIGHT .'px' : '500px';
	$TINYMCELANG = is_file(TINYMCEPATH .'langs'. $LANG .'.js') ? $LANG : 'en';
	
	// Load CKEditor library for known plugins depending on it
	$HTMLEDITOR = ''; 	// Workaround to supress FCKEditor
	if (
		($TINYMCECOMPATIBILITY=='auto' && tinymce_gsplugin_exists( array('i18n_customfields') ) )
		|| ($TINYMCECOMPATIBILITY=='high')
		) {
		?><script type="text/javascript" src="template/js/ckeditor/ckeditor.js"></script><?php
		}
	?>
	<script type="text/javascript" src="../plugins/TinyMCEPlugin/tiny_mce/jquery.tinymce.js"></script>

	<script type="text/javascript">
		$().ready(function() {
			$('#post-content').tinymce({
				script_url : '../plugins/TinyMCEPlugin/tiny_mce/tiny_mce.js',
				language : "<?php echo $TINYMCELANG; ?>",
				theme : "<?php echo $TINYMCETHEME; ?>",
				plugins : "<?php echo $TINYMCEPLUGINS; ?>",				
				<?php
				if (strlen($TINYMCEBUTTONS1)>0) {
					?>theme_advanced_buttons1 : "<?php echo $TINYMCEBUTTONS1; ?>",<?php
				}
				if (strlen($TINYMCEBUTTONS2)>0) {
					?>theme_advanced_buttons2 : "<?php echo $TINYMCEBUTTONS2; ?>",<?php
				}
				if (strlen($TINYMCEBUTTONS3)>0) {
					?>theme_advanced_buttons3 : "<?php echo $TINYMCEBUTTONS3; ?>",<?php
				}
				if (strlen($TINYMCEBUTTONS4)>0) {
					?>theme_advanced_buttons4 : "<?php echo $TINYMCEBUTTONS4; ?>",<?php
				}
				?>
				theme_advanced_toolbar_location : "top",
				theme_advanced_toolbar_align : "left",
				theme_advanced_statusbar_location : "bottom",
				theme_advanced_resizing : false,
				height : "<?php echo $TINYMCEHEIGHT; ?>",
	
				<?php if (file_exists(GSTHEMESPATH .$TEMPLATE."/editor.css")) { ?>
					content_css : "<?php echo suggest_site_path(); ?>theme/<?php echo $TEMPLATE; ?>/editor.css",
				<?php } ?>
				 
				// Drop lists for link/image/media/template dialogs
				template_external_list_url : "lists/template_list.js",
				external_link_list_url : "lists/link_list.js",
				external_image_list_url : "lists/image_list.js",
				media_external_list_url : "lists/media_list.js",
				
				imagex_browseurl : 'filebrowser.php?type=images',
			});
		});
	</script>	
<?php } ?>