var postcard = document.getElementById("postcard");
var pc = postcard.getContext("2d");
var droppable = false;
var streamReference;
var backgroundImage = new Image();

pc.clearRect(0, 0, 580, 410);
pc.font = "25px Arial";
pc.fillStyle = "black";
pc.textAlign = "center";
pc.fillText("Welcome to the postcard maker.", postcard.width / 2, 100);
pc.font = "18px Arial";
pc.fillText("Provide an image to get started.", postcard.width / 2, 150);

//uploading the standard way, from the user's computer
function upload() {
    document.getElementById('buttonWrapper').style.display = "none";
    var pic = document.getElementById('fileUploadButton');
    if ('files' in pic) {
        try {
            backgroundImage.src = URL.createObjectURL(pic.files[0]);
            backgroundImage.onload = function() {
                drawBackgroundImage(backgroundImage, backgroundImage.width, backgroundImage.height);
            }
        } catch (err) {
            window.alert(err);
        }
    } else if (pic.value !== "") {
        window.alert("The files property is not supported by your browser.");
    }

    document.getElementsByName("canvasAsPNG").value = postcard.toDataURL('image/png');
}

// allows user to drop google image thumbnails
// at full size
function cropURL(str) {
    str = str.replace(/%2F/g, "/");
    str = str.replace(/%3A/, ":");
    var start = str.indexOf("=http") + 1;
    var end = str.indexOf(".jpg") + 4;
    if (end == 3) {
        end = str.indexOf(".png") + 4;
        if (end == 3) {
            end = str.indexOf(".gif") + 4;
        }
    }
    if (start > -1 && end > 3) {
        return str.slice(start, end);
    } else return str;
}

function drawBackgroundImage(image, bw, bh) {

    if (bw / bh > 580 / 410) {
        var newWidth = (bw / bh) * 410;
        var newHeight = 410;
        pc.drawImage(image, -(newWidth - 580) / 2, 0, newWidth, newHeight);
    } else if (bw / bh < 580 / 410) {
        var newWidth = 580;
        var newHeight = bh * 580 / bw;
        pc.drawImage(image, 0, -(newHeight - 410) / 2, newWidth, newHeight);
    } else {
        pc.drawImage(image, 0, 0);
    }
    document.getElementsByName("canvasAsPNG").value = postcard.toDataURL('image/png');
    document.getElementById("formContainer").style.visibility = "visible";
}

// Allow user to drop objects onto HTML element
function allowDrop(ev) {
    if (droppable) {
        ev.preventDefault();
    }
}

function drop(ev) {
    ev.preventDefault();
    try {
        if (ev.dataTransfer.files.length < 1) {

            var URL = ev.dataTransfer.getData('URL');
            if (URL.indexOf("www.google.com/imgres?imgurl=") > -1) {
                backgroundImage.src = cropURL(URL);
            } else {
                URL = ev.dataTransfer.getData('text/html');
                var dropContext = $('<div>').append(URL);
                var imgURL = $(dropContext).find("img").attr('src');
                backgroundImage.src = imgURL;
            }
        } else {
            var reader = new FileReader();
            reader.readAsDataURL(ev.dataTransfer.files[0]);
            reader.onloadend = function() {
                backgroundImage.src = reader.result;
            };
        }
    } catch (err) {
        window.alert(err);
    }

    backgroundImage.onload = function() {
        drawBackgroundImage(backgroundImage, backgroundImage.width, backgroundImage.height);
    }

    document.getElementById("formContainer").style.visibility = 'visible';
    document.getElementsByName("canvasAsPNG").value = postcard.toDataURL('image/png');
    ev.stopPropagation();
}

//Starts the webcam stream
function showWebcam() {
    document.querySelector('video').style.visibility = 'visible';
    document.getElementById('buttonWrapper').style.visibility = 'hidden';
    pc.font = "18px Arial";
    pc.fillStyle = "gray";
    pc.textAlign = "center";
    pc.fillText("Browser needs permission to access your webcam", postcard.width / 2, postcard.height / 2);
    var vid = document.querySelector('video');
    navigator.getUserMedia = (navigator.mediaDevices.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
    if (navigator.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
                video: true
            })
            .then(function(stream) {
                streamReference = stream;
                document.getElementById("takePicButton").style.visibility = 'visible';
                vid.srcObject = stream;
            })
            .catch(function(err) {
                console.log('The following error occurred when trying to use getUserMedia: ' + err);
            });
    } else {
        alert('Sorry, your browser does not support getUserMedia');
    }
}

function takeWebcamPhoto() {
    var vid = document.querySelector('video');
    drawBackgroundImage(vid, vid.width, vid.height);
    streamReference.stop();
    vid.style.visibility = 'hidden';
    document.getElementById("takePicButton").style.visibility = 'hidden';
    backgroundImage.src = postcard.toDataURL("image/png");
    document.getElementById("formContainer").style.visibility = 'visible';
    document.getElementsByName("canvasAsPNG").value = postcard.toDataURL('image/png');
}

function writeDropInstructions() {
    droppable = true;
    document.getElementById('buttonWrapper').style.display = "none";
    pc.font = "18px Arial";
    pc.fillStyle = "gray";
    pc.textAlign = "center";
    pc.fillText("Drag and drop image here", postcard.width / 2, postcard.height / 2);
}

function writeTitle() {
    drawBackgroundImage(backgroundImage, backgroundImage.width, backgroundImage.height);
    pc.font = "bold 50px Arial";
    pc.fillStyle = "white";
    pc.fillText(document.getElementById("title").value, postcard.width / 2, postcard.height / 5);
    document.getElementsByName("canvasAsPNG").value = postcard.toDataURL('image/png');
}

//Lets user input message and wraps the text if it's too long
function writeMessage() {
    writeTitle();

    if (document.getElementById("message").value != "") {
        pc.globalAlpha = 0.2;
        pc.fillStyle = "black";
        pc.fillRect(0, postcard.height / 1.7, postcard.width, postcard.height / 1.7);
        pc.globalAlpha = 1;
        pc.font = "bold 20px Arial";
        pc.fillStyle = "white";
    }

    var words = document.getElementById("message").value.split(' ');
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = pc.measureText(currentLine + " " + word).width;
        if (width < 500) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    lines.push(currentLine);
    for (var j = 0; j < lines.length; j++) {
        pc.fillText(lines[j], postcard.width / 2, postcard.height / 1.5 + (j * 24));
    }

    document.getElementById("canvasAsPNG").value = postcard.toDataURL('image/png');
}

function resetCanvas() {
    window.location.reload(true);
}

function validate() {
    if(document.getElementById("emailAddress").value === "") {
        window.alert("Email address cannot be empty.");
        return false;
    }
    if(document.getElementById("title").value === "") {
        window.alert("Title cannot be empty.");
        return false;
    }
    return true;
}
