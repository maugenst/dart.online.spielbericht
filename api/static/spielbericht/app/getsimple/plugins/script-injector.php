<?php
/*
Plugin Name: Script Injector
Description: Place Javascript or any other raw htl code inside the body of the page
Version: 0.2
Author: Dominion IT
Author URI: http://www.dominion-it.co.za/
*/

# get correct id for plugin
$thisfile=basename(__FILE__, ".php");

# register plugin
register_plugin(
	$thisfile, 	# ID of plugin, should be filename minus php
	'Script Injector', 	# Title of plugin
	'0.2', 		# Version of plugin
	'Johannes Pretorius',	# Author of plugin
	'http://www.dominion-it.co.za/', 	# Author URL
	'Place Javascript or any other raw html code inside the body of the page', 	# Plugin Description
	'pages', 	# Page type of plugin
	'dominion_show_injector_config'  	# Function that displays content
);

# activate filter
add_filter('content','dominion_injector_content_show'); 
add_action('pages-sidebar','createSideMenu',array($thisfile,'Script Injector'));

/*
  Filter Content for injector markers (% script:script_id%) the script_id will point to the script you ahve entere
*/
function dominion_injector_content_show($contents){
    
    
   $path = GSDATAOTHERPATH;
    $file ='scriptinjector.xml';    
    $tmpContent = $contents;
	preg_match_all('/\(%(.*)script(.*):(.*)%\)/i',$tmpContent,$tmpArr,PREG_PATTERN_ORDER);
    
    $AlltoReplace = $tmpArr[count($tmpArr)-1];
    $totalToReplace = count($AlltoReplace);
    $xml = getXML($path . $file);
    for ($x = 0;$x < $totalToReplace;$x++) {
       $targetID= str_replace('&nbsp;',' ',$AlltoReplace[$x]);
       $targetID = trim($targetID);  
       $curItem = $xml->xpath("//id[@scriptid=\"$targetID\"]");
       if (count($curItem)>0) {       
          $blok  = stripslashes(@$curItem[0]->data);     
         $tmpContent = preg_replace("/\(%(.*)script(.*):(.*)$targetID(.*)%\)/i",$blok,$tmpContent);
       }
        
      
    }
    
  return $tmpContent;
}

function XMLSaveInternal($xml,$file){
$xml->asXML($file);
}
/*
  * Show the config for the player..
  *
*/
function dominion_show_injector_config(){
   global $SITEURL;
   $path = GSDATAOTHERPATH;
    $file ='scriptinjector.xml';
    $scriptid = 'example';
      //Delete entry
    if (isset($_GET['delscriptid'])) {
        $delID = $_GET['delscriptid'];
            $xml = getXML($path . $file);
            $curItem = $xml->xpath("//id[@scriptid=\"$delID\"]");
            //is there something to delete.. else just do nothing
            if (count($curItem)>0) {
               $dom=dom_import_simplexml($curItem[0]);
               $dom->parentNode->removeChild($dom);
               XMLSaveInternal($xml, $path . $file);
            }                
    }
    //Save entry
    if(isset($_POST['stoor']) && $_POST['stoor'] == 'Save') {
            
            $blok  = $_POST['blok'];
            $nuweID =  $_POST['scriptid'];
            $ouscriptID = $_POST['oldscriptid'];
            $blok  = stripslashes($blok);
        
            $xml = getXML($path . $file);
            $curItem = $xml->xpath("//id[@scriptid=\"$ouscriptID\"]");
            if (count($curItem)>0) {
               $curItem[0]->data = $blok;
               $atr = $curItem[0]->attributes();
               $atr['scriptid'] = $nuweID;
               XMLSaveInternal($xml, $path . $file);
               $scriptid =$nuweID;
            } else {
              $blok  = 'Error finding data.. Please contact support at : support@dominion-it.co.za';
            }            
    } else {
      //Load if there is already config file.
      if (is_file($path.$file)) {
        $seekFor = isset($_GET['scriptid'])?$_GET['scriptid']:"example";
        $scriptid =  $seekFor;
        if ($seekFor == 'NewScript'){
           $blok = "<script type='text/javascript' language='javascript' > alert('Helo World'); </script>";
          $xml = getXML($path . $file);
          $curItem = $xml->xpath("//id[@scriptid=\"example\"]");
          $seekFor  = 'example';    
          if (count($curItem) > 0) {
            $seekFor  = 'example'.rand(1,3009);    
          }
          $script = $xml->addChild('id');
          $script->addAttribute('scriptid', $seekFor);
        
		  $script_info = $script->addChild('data');
		  $script_info->addCData(@$blok);
          XMLSaveInternal($xml, $path . $file);
          
        }
        $xml = getXML($path . $file);
        $curItem = $xml->xpath("//id[@scriptid=\"$seekFor\"]");
        if (count($curItem) <= 0) {
          $curItem = $xml->xpath("//id");
        }
        if (count($curItem)>0) {
          $blok  = stripslashes(@$curItem[0]->data);
          $atr = $curItem[0]->attributes();
          $scriptid = $atr['scriptid'];
        } else {
          $blok  = 'Error finding data.. Please contact support at : support@dominion-it.co.za';
        }        
      } else {
        //create new file for first time load
        $blok = "<script type='text/javascript' language='javascript' > alert('Helo World'); </script>";
        $xml = @new SimpleXMLExtended('<?xml version="1.0" encoding="UTF-8"?><scripts></scripts>');
        $script = $xml->addChild('id');
        $script->addAttribute('scriptid', 'example');
        
		$script_info = $script->addChild('data');
		$script_info->addCData(@$blok);
        XMLSaveInternal($xml, $path . $file);
      }
      
    }
     //get all items for list
    $curItem = $xml->xpath("//id");
    $numScripts =  count($curItem);
?>
<form action="<?php	echo $_SERVER ['REQUEST_URI']?>"  method="post" id="management">
<input type='hidden' name = 'id' value='script-injector'>
<input type='hidden' name = 'oldscriptid' value='<?php echo $scriptid ;?>'>
  <p>How  to use the plugin : Just add anywhere in your page  the following tag <b>(% script:script_id %)</b>
     Note script_id is your own ID that you gave to the script. <br/>
     Version 0.2 - <a href="http://www.dominion-it.co.za/">Dominion IT</a></p>
<?php
    $adminID = $_GET['id'];
    echo "<p>Current scripts : <select onchange='window.location = \"".$SITEURL."admin/load.php?id=$adminID&scriptid=\"+this.value'>";
    for ($x=0;$x<$numScripts;$x++){
      $atr = $curItem[$x]->attributes();
      $sID = $atr['scriptid'];
      if ($sID == $scriptid  ) {
         echo "<option value='$sID' selected='selected'>$sID</option>";
      } else {
        echo "<option value='$sID'>$sID</option>";
      }  
    }
    echo "</select> <a href='".$SITEURL."admin/load.php?id=$adminID&scriptid=NewScript'>Add New Script</a></p>";

?>     
  <p>Script ID : <input name='scriptid' type='text' value='<?php echo $scriptid;?>'> <?php if ($numScripts > 1) { ?> <a href='<?php echo $SITEURL; ?>admin/load.php?id=<?php echo $adminID;?>&delscriptid=<?php echo $scriptid ;?>'>Delete This Script</a> <?php } ?></p>   
  <p><b>(% script:<?php echo $scriptid; ?> %)</b> - Copy and paste this into your page where you want the script to run</p>
 <p>Scriptblock : <textarea name='blok' ><?php echo $blok; ?></textarea>
    <input type='submit' name='stoor' value='Save'></p>
</form>
<?php
}