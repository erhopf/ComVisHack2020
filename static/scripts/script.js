
// Start getting data

var pageData = {
    blobUrl: '',
}

var uuid;

window.onload = getAllergies();


window.SubmitAllergies = async () => {
    uuid = createUser();
}

window.Initialize = async () => {

    function handleSuccess(stream) {
        window.stream = stream;
        document.getElementById('video').srcObject = stream;
    }

    try {
        let stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 400, height: 240 } });
        handleSuccess(stream);
    } catch (e) {
        console.log(e);
    }
}

//DrawImage
window.Snap = async (srcId, destId) => {
    let video = document.getElementById(srcId);
    let ctx = get2DContext(destId);
    ctx.drawImage(video, 0, 0, 400, 240);
}

// Get Object Url
// window.GetObjectUrl = async (srcId,destId) => {
//     let capturedImage  = document.getElementById(srcId);
//     await capturedImage.toBlob(setObjectUrl,'image/jpg');
//     displayObjectURL(destId);
// }

window.GetTextResult = async (srcId, destId) => {
    getTextResult(srcId, destId);
}

window.CompareImageToAllergies = async (srcId, destId, userId) => {
    checkImageAgainstAllergies(srcId, destId, userId)
}

// Helper functions
function get2DContext(el) {
    return document.getElementById(el).getContext('2d');
}

function setObjectUrl(blob) {
    pageData['blobUrl'] = window.URL.createObjectURL(blob);
}

function createCheckboxes(jsonResponse) {
    var myDiv = document.getElementById("allergiesList");
    console.log(myDiv);

    for (var i = 0; i < jsonResponse.length; i++) {
        var checkBox = document.createElement("input");
        var label = document.createElement("label");
        checkBox.type = "checkbox";
        checkBox.value = jsonResponse[i].allergyName;
        myDiv.appendChild(checkBox);
        myDiv.appendChild(label);
        label.appendChild(document.createTextNode(jsonResponse[i].allergyName));
    }
}

// API Calls

function getAllergies() {
    url = "https://allergenspotterapp.azurewebsites.net/api/AllergyMasterData"
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(xhttp.response);
            createCheckboxes(jsonResponse);
            //for (i = 0; i < jsonResponse.length; i++){
               //console.log(jsonResponse[i].allergyName);
            //}
            // Typical action to be performed when the document is ready:
            //document.getElementById("allergiesList").innerHTML = xhttp.responseText;
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

/***
function getTextResult(srcId, destId) {
    var base64 = document.getElementById(srcId).innerText;
    var url = "https://allergenspotterapp.azurewebsites.net/api/AllergyData/cvTest/u1"
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
            document.getElementById("textResult").innerHTML = xhttp.responseText;
        }
    };
    xhttp.send(JSON.stringify({"base64Image": base64}));
}
***/

function checkImageAgainstAllergies(srcId, destId) {
    let canvas = document.getElementById(srcId);
    let dataUrl = canvas.toDataURL('image/jpeg');
    let base64 = dataUrl.split(',')[1];
    let userId = uuid;
    //console.log(base64);
    //console.log(userId);
    var url = "https://allergenspotterapp.azurewebsites.net/api/AllergyData/" + userId;
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
            document.getElementById("detected").innerHTML = xhttp.responseText;
        }
    };
    xhttp.send(JSON.stringify({ "base64Image": base64 }));
}

function createUser() {
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    userData = {};
    userData['userId'] = uuidv4();
    //userData['UserName'] = userName;

    var allergiesList = document.getElementById('allergiesList').children
    var checkedBoxes =
        Array.from(allergiesList)
            .filter(node => node.nodeName == "INPUT")
            .filter(node => node.checked);
    var first4Allergies = checkedBoxes.slice(0, 5);
    first4Allergies.forEach((allergy, idx) => {
        var allergyKey = "Allergy" + (idx + 1)
        userData[allergyKey] = allergy.value
    })
    var reqInfo = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    }
    //console.log(reqInfo)
    url = "https://allergenspotterapp.azurewebsites.net/api/AllergyData/"
    fetch(url, reqInfo).then((res) => { return res.json() }).then((data) => console.log(data));
    return userData['userId'];
}