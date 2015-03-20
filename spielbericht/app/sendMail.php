<?php 

ini_set('display_errors', 1);
error_reporting(E_ALL);

function mail_att($to,$subject,$message,$anhang) 
   { 
   $absender = "BDL Online Spielplan"; 
   $absender_mail = "bdlonlinespielplan@gmail.com"; 
   $reply = "bdlonlinespielplan@gmail.com"; 

   $mime_boundary = "-----=" . md5(uniqid(mt_rand(), 1)); 

   $header  ="From:".$absender."<".$absender_mail.">\n"; 
   $header .= "Reply-To: ".$reply."\n"; 

   $header.= "MIME-Version: 1.0\r\n"; 
   $header.= "Content-Type: multipart/mixed;\r\n"; 
   $header.= " boundary=\"".$mime_boundary."\"\r\n"; 

   $content = "This is a multi-part message in MIME format.\r\n\r\n"; 
   $content.= "--".$mime_boundary."\r\n"; 
   $content.= "Content-Type: text/html charset=\"iso-8859-1\"\r\n"; 
   $content.= "Content-Transfer-Encoding: 8bit\r\n\r\n"; 
   $content.= $message."\r\n"; 

   //$anhang ist ein Mehrdimensionals Array 
   //$anhang enthält mehrere Dateien 
   if(is_array($anhang) AND is_array(current($anhang))) { 
      foreach($anhang AS $dat) { 
         $data = chunk_split(base64_encode($dat['data'])); 
         $content.= "--".$mime_boundary."\r\n"; 
         $content.= "Content-Disposition: attachment;\r\n"; 
         $content.= "\tfilename=\"".$dat['name']."\";\r\n"; 
         $content.= "Content-Length: .".$dat['size'].";\r\n"; 
         $content.= "Content-Type: ".$dat['type']."; name=\"".$dat['name']."\"\r\n"; 
         $content.= "Content-Transfer-Encoding: base64\r\n\r\n"; 
         $content.= $data."\r\n"; 
      } 
      $content .= "--".$mime_boundary."--";  
   } else { //Nur 1 Datei als Anhang 
      $data = chunk_split(base64_encode($anhang['data'])); 
      $content.= "--".$mime_boundary."\r\n"; 
      $content.= "Content-Disposition: attachment;\r\n"; 
      $content.= "\tfilename=\"".$anhang['name']."\";\r\n"; 
      $content.= "Content-Length: .".$anhang['size'].";\r\n"; 
      $content.= "Content-Type: ".$anhang['type']."; name=\"".$anhang['name']."\"\r\n"; 
      $content.= "Content-Transfer-Encoding: base64\r\n\r\n"; 
      $content.= $data."\r\n"; 
   }  
       
   if(@mail($to, $subject, $content, $header)) return true; 
   else return false; 
}


$fileNameBild = 'onlineSpielberichtBild.png';
$fileNameErgebnisJOSON = 'ergebnis.json';

include('SimpleImage.php');
$image = new SimpleImage();
$image->load($_FILES['onlineSpielberichtBild']['tmp_name']);
$image->resizeToWidth(1000);
$image->save($fileName);

$anhang = array(); 
$anhang["name"] = basename($fileName); 
$anhang["size"] = filesize($fileName); 
$anhang["data"] = implode("",file($fileName));

if(function_exists("mime_content_type")) 
   $anhang["type"] = mime_content_type($fileName); 
else 
   $anhang["type"] = "application/octet-stream"; 

$ergebnisJSON = $_POST['ergebnisJSON'];


$mailBody = ""

$mailRcpt = "Marius.Augenstein@gmail.com";
$ret = mail_att($mailRcpt,"Spielbericht",$mailBody,$anhang);
echo $ret ? "An email has been successfully been sent to: ".$mailRcpt : "not ok";


$pfad = array(); 
$pfad[] = "ordner/datei1.exe"; 
$pfad[] = "ordner/datei2.zip"; 
$pfad[] = "ordner/datei3.gif"; 

$anhang = array(); 
foreach($pfad AS $name) 
   { 
  
   $name = basename($name); 
   $size = filesize($name); 
   $data = implode("",file($name)); 

   if(function_exists("mime_content_type")) 
      $type = mime_content_type($name); 
   else 
      $type = "application/octet-stream"; 
    $anhang[] = array("name"=>$name, "size"=>$size, "type"=>$type, "data"=>$data); 
    } 

?>	
	