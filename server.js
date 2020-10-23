const WebSocket = require('ws');
const port = 8080;
let sockets = []; // 'id': {ws: websocket, requestMst: message, loop: setInterval}


const maschienenZustaende = [
    {
        value: 1,
        title: "Produktion läuft",
        ancestors:  [2,3,5,7,9,12,13,14,15],
        descendant: [2,3,4,6,9,12,13,14,15],
        description: "",
        color: "rgb(0,255,0)"
    },{
        value: 2,
        title: "Warten auf Teil",
        ancestors:  [1],
        descendant: [1,4,6],
        description: "",
        color: "rgb(255,214,113)"
    },{
        value: 3,
        title: "Auslauf belegt",
        ancestors:  [1],
        descendant: [1,4,6],
        description: "",
        color: "rgb(255,255,0)"
    },{
        value: 4,
        title: "Technische Störung",
        ancestors:  [1,2,3],
        descendant: [5],
        description: "",
        color: "rgb(220,0,0)"
    },{
        value: 5,
        title: "Technische Störung wird behoben",
        ancestors:  [4],
        descendant: [1],
        description: "",
        color: "rgb(0,0,255)"
    },{
        value: 6,
        title: "Organisatorische Störung",
        ancestors:  [1,2,3],
        descendant: [7],
        description: "",
        color: "rgb(170,20,45)"
    },{
        value: 7,
        title: "Organisatorische Störung wird behoben",
        ancestors:  [6],
        descendant: [1],
        description: "",
        color: "rgb(102,130,164)"
    },{
        value: 8,
        title: "Werkzeugverlust / manueller Werkzeugwechsel",
        ancestors:  [9],
        descendant: [9],
        description: "",
        color: "rgb(255,255,255)"
    },{
        value: 9,
        title: "Maschine ein",
        ancestors:  [1,8,10,11,14],
        descendant: [1,8,10,11,14],
        description: "",
        color: "rgb(213,217,216)"
    },{
        value: 10,
        title: "Maschine aus",
        ancestors:  [9],
        descendant: [9],
        description: "",
        color: "rgb(176,182,184)"
    },{
        value: 11,
        title: "Umrüsten",
        ancestors:  [9],
        descendant: [9],
        description: "",
        color: "rgb(0,255,0)"
    },{
        value: 12,
        title: "Zyklischer Takzeitverlust",
        ancestors:  [1],
        descendant: [1],
        description: ""
    },{
        value: 13,
        title: "Produktion mit abgewählter Funktion",
        ancestors:  [1],
        descendant: [1],
        description: ""
    },{
        value: 14,
        title: "Standby",
        ancestors:  [9],
        descendant: [9],
        description: ""
    },{
        value: 15,
        title: "Produktin mit 0 Vorschuboverride",
        ancestors:  [1],
        descendant: [1],
        description: ""
    },{
        value: 33,
        title: "Stationsbestrieb ohne Produktionsteuerungssystem (Offline ohne PSS für NIO- bzw. Testbetrieb)",
        ancestors:  [1],
        descendant: [1],
        description: ""
    },{
        value: 34,
        title: "Einalufposition mit Werkstückträger belegt",
        ancestors:  [1],
        descendant: [1],
        description: ""
    },{
        value: 35,
        title: "Auslaufposition mit Werkstückttäger belegt",
        ancestors:  [1],
        descendant: [1],
        description: ""
    }
];

 
const wss = new WebSocket.Server({ port: port, clientTracking: true });
console.log("Server is listening on port " + port);

wss.on('connection', function connection(ws) {
    console.log( getFormatedTime()+" New client connection." );
    //console.log(req.headers['sec-websocket-key']);
    //console.log(ws);
    //sockets[ws.upgradeReq.headers['sec-websocket-key']] = {socket: ws, message: '', loop: ''};
    
    ws.ping(()=>{
        console.log("Ping send");
    });

    ws.on('pong', ()=>{
        console.log("Pong received.")
    });
    
    let flow;
    
    ws.on('message', function incoming(message) { 
          
        const request = JSON.parse(message);
        const updateInterval = request.dataType.interval;
        let lastMachineState = [];
        if( request.dataType.source == "randomMaschZu" ) for(let x=0; x<request.dataType.machines.length;x++) lastMachineState.push(1); 
        
        function getMaschZustand(anlage) {
            // @params analge für die ein zustand generiert werden soll
            // @return gültiger neuer Maschinenzustand für die Anlage
            
            const zustand = lastMachineState[anlage];
            let newZustand;
            maschienenZustaende.forEach((item, i, arr) => {
                if(item.value == zustand) {
                  
                    if(item.descendant.length < 2) newZustand = item.descendant[0];
                    else newZustand =  item.descendant[getRandomIntInclusive(0, item.descendant.length-1)];
                    return true;
                     
                }
            });

            return newZustand;
        }
        
        flow = setInterval(()=>{
            let datum = getFormatedTime();
            let result = {labels:[], data:[]};
            //console.log(request);

            switch ( request.dataType.source ) {
                case "random":
                    //console.log("Switch/Case: RANDOM " + JSON.stringify(request.dataType));
                    result = {labels:[datum], data: [getRandomIntInclusive(7,14)]};
                    break;
           
                case "randomMultiple":
                    //console.log("Switch/Case: RANDOM-MULTI " + JSON.stringify(request.dataType));
                    for(i=0; i<request.dataType.count; i++) {
                        if(request.dataType.labels.length != request.dataType.count) result.labels.push(request.dataType.labelPrefix+"-"+(i+1));
                        result.data.push(getRandomIntInclusive(request.dataType.min,request.dataType.max));
                    }
                    if(request.dataType.labels.length == request.dataType.count) result.labels = request.dataType.labels;
                    break;
                
                case "randomMaschZu": // Maschinenzustände
                   
                        for(i=0; i<request.dataType.machines.length; i++) {
                            if(getRandomIntInclusive(1,3) == 1) { // 33% Chance den wert zu ändern.
                                let zustand = getMaschZustand(i);
                                result.labels.push(request.dataType.machines[i]);
                                result.data.push(zustand);
                                lastMachineState[i] = zustand;  
                                //console.log("Changed");
                            } else {
                                result.data.push(lastMachineState[i]);
                                result.labels.push(request.dataType.machines[i]); 
                                //console.log("NOT Changed");

                            }
                        }
                   
                    break;
            }

            ws.send(JSON.stringify(result), ()=>{
                //callback
                //console.log(getFormatedTime() + " send Data: "+ JSON.stringify(result));
            });

        },updateInterval); // ! interval

    }); // ! on.message

    ws.on('close', function(ws, req) {
        console.log(getFormatedTime()+" Connection closed by client.");
        console.log(req);
        clearInterval(flow);
    });

  

});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min; 
  } 

function getFormatedTime () {
    const myDate = new Date();
    let dtString = myDate.getHours() + ":"+myDate.getMinutes()+":"+(myDate.getSeconds()<10?'0'+myDate.getSeconds():myDate.getSeconds());
    return dtString;
}