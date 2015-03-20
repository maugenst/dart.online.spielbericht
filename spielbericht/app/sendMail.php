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


function randString($length) {
    $char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $char = str_shuffle($char);
    for($i = 0, $rand = '', $l = strlen($char) - 1; $i < $length; $i ++) {
        $rand .= $char{mt_rand(0, $l)};
    }
    return $rand;
}

$randomStringPart = randString(5);

$fileNameBild = 'onlineSpielberichtBild_'.$randomStringPart.'.png';
$fileNameErgebnisJSON = 'ergebnis_'.$randomStringPart.'.erg';

include('SimpleImage.php');
$image = new SimpleImage();
$image->load($_FILES['onlineSpielberichtBild']['tmp_name']);
$image->resizeToWidth(1000);
$image->save($fileNameBild);

$json = $_POST['ergebnisJSON'];

file_put_contents($fileNameErgebnisJSON, $json);

$pfad = array(); 
$pfad[] = $fileNameBild; 
$pfad[] = $fileNameErgebnisJSON; 

$anhang = array(); 
foreach($pfad AS $name) { 
  
   $name = basename($name); 
   $size = filesize($name); 
   $data = implode("",file($name)); 

   if(function_exists("mime_content_type")) 
      $type = mime_content_type($name); 
   else 
      $type = "application/octet-stream"; 
    $anhang[] = array("name"=>$name, "size"=>$size, "type"=>$type, "data"=>$data); 
}

$mailBody =  '<h1>Spielberichtsbogen der BDL<h1><br>\n';
$mailBody .= 'Hier das Ergebnis ...';
$mailBody .= '<pre><code>' . $json . '</code></pre>';

$mailRcpt = "Marius.Augenstein@gmail.com";
$ret = mail_att($mailRcpt,"Spielbericht",$mailBody,$anhang);
echo $ret ? "An email has been successfully been sent to: ".$mailRcpt : "not ok";

?>	
	