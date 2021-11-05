var clientGUID = 0;
var checkoutTotalAmt = -1;
var transactionIdAttr = null;
var registerID = "";
var resume = false;
var appWindow = window;
var paymentTypeName = "Moneris";
let dataReceived = "";
let transactionId;
// This method is used to communicate to the parent window to talk to oliver.
function sendMessage(eventType) {    
    var paymentMsg = {
        oliverpos:{
            event: eventType
        }
    }
    window.parent.postMessage(JSON.stringify(paymentMsg), '*')
};
//This method is used for communication between client side and server side.
//The http request is wrapped up in a promise to account for async requests.
function sendHttpRequest(method, url, data){
    
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.response = 'JSON';
        
        xhr.onload = () => {
            if (xhr.readyState === xhr.DONE) 
        {
            if (xhr.status === 200) 
            {
                var reply = JSON.parse(xhr.response);
                console.log(reply);
                let baseUrl1 = window.location.origin;
                switch (reply.status)
                {
                    default:
                        break;
                    case "registered":
                            window.location.replace(baseUrl1 + '/menu');
                            break;
                    case "new":
                            document.getElementById("paymentMsg").innerHTML = "Oopsie Daisy";
                            document.getElementById("warningMsg").innerHTML = "You might want to register the app first";
                };
            };     
        };     
        };
        
        xhr.send(JSON.stringify(data));
    };
    

appWindow.addEventListener('DOMContentLoaded', (event) => {
    //push notification to oliver pos it is loaded now please send the useful data
    sendMessage("extensionReady");
});

//This is the event listener for the messages sent from Oliver
appWindow.addEventListener('message', (e) => {
    dataReceived = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
    console.log("Data received from Oliver: ", dataReceived);
    let eventType = dataReceived.oliverpos.event;
    switch (eventType){
        //Checkout event extension - Retrieves total transaction amount
        case 'shareCheckoutData':
            sendMessage("clientInfo");
        case 'clientInfo':
            clientGUID = dataReceived.data.clientGUID;
            console.log("Client info: ", clientGUID);
    }

});

sendHttpRequest('POST','/',{});