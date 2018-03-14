<?php 
	
	$to = $_POST["emailAddress"]; 
	$subject = 'Someone sent you a postcard!';
	$card = $_POST["canvasAsPNG"];
	echo 'Thank you for using the Postcard Creator.<br>';
	echo 'Here\'s what you sent:<br>';
	echo '<img src="'. $card . '">';
	$card = str_replace('data:image/png;base64,', '', $card);
	$card = str_replace(' ', '+', $card);
    $data = base64_decode($card);
	unlink('postcard.png');
        sleep(2);
	$imgName = 'postcard.png';
	file_put_contents($imgName, $data);
	sleep(2);
	
	$message = '
	    <html>
	     <body>
	      <img src="https://adewhir1.000webhostapp.com/postcard.png?<?php echo filemtime($imgName)?>">
	     </body>
	    </html>
	';

	$headers[] = 'MIME-Version: 1.0';
	$headers[] = 'Content-type: text/html; charset=iso-8859-1';

mail($to, $subject, $message, implode("\r\n", $headers));
?>

