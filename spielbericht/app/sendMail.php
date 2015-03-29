<?php 

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'class.phpmailer.php';

$mail = new PHPMailer(true); //defaults to using php "mail()"; the true param means it will throw exceptions on errors, which we need to catch

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
$fileNameErgebnisJSON = 'ergebnis_'.$randomStringPart.'.json';

include('SimpleImage.php');
$image = new SimpleImage();
$image->load($_FILES['onlineSpielberichtBild']['tmp_name']);
$image->resizeToWidth(2000);
$image->save($fileNameBild);

$json = $_POST['ergebnisJSON'];
$css = $_POST['emailCSSStyles'];
$table = $_POST['emailSummaryTable'];

file_put_contents($fileNameErgebnisJSON, $json);

$anhang = array(); 
$anhang[] = $fileNameBild; 
$anhang[] = $fileNameErgebnisJSON; 

$mailBody =  '<html>';
$mailBody .= '<head>';
$mailBody .= '  <style>';
$mailBody .= $css;
$mailBody .= '  </style>';
$mailBody .= '</head>';
$mailBody .= '<body>';
$mailBody .= '  <h1>Spielberichtsbogen der BDL</h1><br>';
$mailBody .= '  Hier das Ergebnis der Partie:';
$mailBody .= $table;
$mailBody .= '<p>&copy; <b><a href="mailto:marius.augenstein@gmail.com">Marius Augenstein (2015)</a></b> (<a href="http://bdl-online-spielplan.lima-city.de/impressum.html">Impressum</a>) <br>';
$mailBody .= '<a href="http://www.badischedartliga.de">Badische Dart Liga</a> | <a href="http://www.badischedartliga.de">BDL Online Spielbericht</a></p>';
$mailBody .= '</body>';
$mailBody .= '</html>';

$okhtml =  '<html>';
$okhtml .= '<head>';
$okhtml .= '    <meta charset="utf-8">';
$okhtml .= '    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">';
$okhtml .= '    <link rel="stylesheet" href="styles/main.css">';
$okhtml .= '    <meta http-equiv="refresh" content="3;url=http://bdl-online-spielplan.lima-city.de/">';
$okhtml .= '    <title>BDL Online Spielbericht</title>';
$okhtml .= '</head>';
$okhtml .= '<body>';
$okhtml .= '  <h1>Vielen Dank. Der Spielbericht wurde zur BDL zur Bearbeitung gesandt. Du wirst nun zur Startseite umgeleitet.</h1>';
$okhtml .= '<p>&copy; <b><a href="mailto:marius.augenstein@gmail.com">Marius Augenstein (2015)</a></b> (<a href="http://bdl-online-spielplan.lima-city.de/impressum.html">Impressum</a>) <br>';
$okhtml .= '<a href="http://www.badischedartliga.de">Badische Dart Liga</a> | <a href="http://www.badischedartliga.de">BDL Online Spielbericht</a></p>';
$okhtml .= '</body>';
$okhtml .= '</html>';

try {
  $mail->AddAddress('bdlonlinespielplan@gmail.com', 'BDL Online Spielbericht');
  $mail->AddAddress('spielleiter@badischedartliga.de', 'Spielleiter BDL');
  $mail->AddAddress('bdl@bwdv.de','BDL@BWDV');
  $mail->AddCC('odom3003@googlemail.com ','Dominik Boss');
  $mail->AddCC('jb@jankovsky.de', 'Jochen Becker');
  $mail->AddCC('Marius.Augenstein@gmail.com','Marius Augenstein');
  $mail->SetFrom('bdlonlinespielplan@gmail.com', 'BDL Online Spielbericht');
  $mail->AddReplyTo('bdlonlinespielplan@gmail.com', 'BDL Online Spielbericht');
  $mail->Subject = "BDL Online Spielberichtsbogen";
  $mail->AltBody = ""; // optional - MsgHTML will create an alternate automatically
  $mail->MsgHTML($mailBody);

  $mail->AddAttachment($fileNameErgebnisJSON); // attachment
  $mail->AddAttachment($fileNameBild); // attachment
  
  $mail->Send();
  echo $okhtml;
} catch (phpmailerException $e) {
  echo $e->errorMessage(); //Pretty error messages from PHPMailer
} catch (Exception $e) {
  echo $e->getMessage(); //Boring error messages from anything else!
}

unlink($fileNameBild); 
unlink($fileNameErgebnisJSON);


?>