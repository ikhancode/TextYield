// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pagecontainer = $("#page-container")[0];
// The html DOM object has been casted to an input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector = $("#my-file-selector")[0];
// Register button listeners
imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Just a sec while we analyse the image...";
    processImage(function (file) {
        sendOCRRequest(file, function () {  // Extract text from the image
        });
    });
});

function processImage(callback) {
    var file = imgSelector.files[0]; //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    }else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        }else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    }
}

function sendOCRRequest(file, callback) {
    $.ajax({
        url: "https://api.projectoxford.ai/vision/v1.0/ocr?language=unk&detectOrientation =true",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "ba1936349ce24a539278e724d3dcaf35");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
        if (data.regions.length != 0) {
            var arr = [];
            for (i = 0; i < data.regions[0].lines.length; i++) { 
                for (j = 0; j < data.regions[0].lines[i].words.length; j++){
                    arr.push(data.regions[0].lines[i].words[j].text);
                } 
                arr.push("<br>");
            }
            pageheader.innerHTML = "Extracted following text: " + "<br /><br />" + arr.join(" ");
        }
        else {
            pageheader.innerHTML = "Hmm, we can't detect any text in the image. Try another?";
        }
    })
        .fail(function (error) {
        pageheader.innerHTML = "Sorry, something went wrong. :( Try again in a bit?";
        console.log(error.getAllResponseHeaders());
    });
}