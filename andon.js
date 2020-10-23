class Andon {
    constructor(msg, host, svgID) {
        // @Public
        let enableSound = false;
        // @Private
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
                title: "Produktion mit 0 Vorschuboverride",
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
        let ws, svg;
        let maschienen = [];
        let aktuelleZustaende = [];
        let defaults = {
            svg: {
                width: '',
                height:'',
                viewBox: '',
            },
            parent: {
                width:'',
                height: '',
                style:''
            }
        };
        let zoomToggle = false;

        initWebsocket(msg, host);
        initSVG(svgID);


        this.zeitInterval = setInterval(clock,1000);
        

        function initWebsocket(message, host) {
            /*
            * @params   message: {
                            requestType: "dataRequest",
                            dataType: {
                                source: "randomMaschZu",
                                interval: 5000,
                                updateMethod: "replace",
                                count: 16,
                                machines: [] //specify machine ids
                            }
                        }
            *   Will be send to WebSocket server.          
            * @params host: websocket Host to connect to
            *  
            * 
            */
            maschienen = message.dataType.machines;
            ws = new WebSocket(host);
            ws.onopen = ()=>{
              ws.send(JSON.stringify(message)); 
              
              ws.onmessage = (msg) => {
                //console.log(msg.data); 
                setzeZustandimSVG(JSON.parse(msg.data));   
              }
          
            }
            
        }

        this.closeSocket = () => { // close websocket
            ws.close();
        }

        function initSVG(svgId)  {
            svg = document.getElementById(svgId);
            setzeEventListener();
            addNameToMachine();
            storeDefaults();
        }

        function storeDefaults() {
            defaults.svg.height = svg.getAttribute("height");
            defaults.svg.width = svg.getAttribute("width");
            defaults.svg.viewBox = svg.getAttribute("viewBox");

            defaults.parent.height = svg.parentNode.getAttribute("height");
            defaults.parent.width = svg.parentNode.getAttribute("width");
            defaults.parent.style = svg.parentNode.getAttribute("style");
            //console.log(defaults);
        }

        function setzeZustandimSVG(msg) {
            try {
                if(msg.labels.length != msg.data.length) throw("Daten sind inkontinent!");
                maschienen = msg.labels;
                aktuelleZustaende = msg.data;
                let sound = false;

                for (let i=0; i<msg.labels.length; i++) {
                    
                    let element = document.getElementById(msg.labels[i]);
                    
                    const zustand = getMaschienenZustand(msg.data[i]);
                    
                    
                    if (msg.data[i] == 4 || msg.data[i] == 6) {
                       sound = true;
                       //console.log("Störung bei: " + msg.labels[i] + " ("+msg.data[i]+" / "+ zustand.value +")");
                    } 

                    if(zustand.color != undefined ) {
                        animiere(element.id, zustand.color, 1000);
                    }
                    
                    if(document.getElementById("tooltip_"+msg.labels[i]) == undefined) {
                        erstelleTooltip(msg.labels[i]);
                    }

                    document.getElementById(msg.labels[i]+"_name").innerHTML = msg.labels[i];
                    document.getElementById(msg.labels[i]+"_zustand").innerHTML = zustand.title;

                }

                if(sound) playSound();
            } catch(e) {
                console.log("Fehler: " + e);
            }
        }

        function getMaschienenZustand(zustand) {
            
            let retval;
    
            maschienenZustaende.forEach((item, i, arr) => {
                if(item.value == zustand) {
                    retval = item;
                    return true; 
                }
            }); 
    
            return retval;
        }


        function getMachineInfo(machineId) {


        }

        function setzeEventListener() {
            //console.log("liste der Maschienen: " +maschienen);
            maschienen.forEach((item,i,arr) => {
                //console.log("Item to add Listener to: " +item);
                document.getElementById(item).addEventListener("mouseover", showTooltip);
                document.getElementById(item).addEventListener("mousemove", tooltipMove);
                document.getElementById(item).addEventListener("mouseout", hideTooltip);
                
            });
        }

        function addNameToMachine() {
            const elemente = svg.childNodes;

            const regEx = /^(line)_\d_(machine)_\d$/gm; // expression to match svg element representing a machine
            
            for(let i=0; i<elemente.length; i++) {
                //console.log("untersuche element: " + elemente[i].nodeName);
                if( elemente[i].attributes != undefined && elemente[i].id != null && elemente[i].id != undefined) {
                  
                    let erg = elemente[i].id.toString().match(regEx);
                   
                    //console.log("check id: " + elemente[i].getAttribute("id") + " mit dem Ergebnis: " + erg);
                    if( erg != null ) {
                        // object is representing a machine
                       
                        const x = parseFloat(elemente[i].getAttribute("x"));
                        const y = parseFloat(elemente[i].getAttribute("y"));
                        const machine_name = elemente[i].getAttribute("id");
                        const id = machine_name + "_text";
                        const label = document.createElementNS("http://www.w3.org/2000/svg","text");

                        label.setAttribute("id",id);
                        label.setAttribute("x", x+10);
                        label.setAttribute("y", y+20);
                        label.setAttribute("width", "100");
                        label.setAttribute("height", "20");
                        label.setAttribute("fill", "rgba(0,0,0,0.7)");
                        label.textContent = machine_name;

                        svg.appendChild(label);
                        erg = null;
                    } // match
                } // keine attribute "id"
            }
        }

        function erstelleTooltip(anlage) {
            //console.log("Tooltip für Anlage " + anlage + " wird erstellt.");
            const body = document.getElementsByTagName("body")[0];     
            const ttbox = document.createElement("div");
            ttbox.setAttribute("class","tooltip");
            ttbox.setAttribute("style", "display:none; position: absolute; left:0; top: 0");   
            ttbox.setAttribute("id","tooltip_"+anlage);    
            ttbox.innerHTML = "<h3 id='"+anlage+"_name' class='gradient_1'></h3><div id='"+anlage+"_zustand' class='tt_content'></div>";
            body.appendChild(ttbox);
            //console.log(ttbox.id +  " erstellt.");
        }

        

        function showTooltip(event) {
            let toShow = document.getElementById("tooltip_"+event.target.id);
            if(toShow != undefined) toShow.style.display = "block";
        }

        function tooltipMove(event) {
            let toMove = document.getElementById("tooltip_"+event.target.id);
            if( toMove != undefined) {
                let posX = event.pageX +10;
                let posY = event.pageY + 10;
                toMove.setAttribute("style", "display:block; position: absolute; left:"+posX+"; top: "+posY); 
            } 
        }

        function hideTooltip(event) {
            let toHide = document.getElementById("tooltip_"+event.target.id)
            if( toHide != undefined ) toHide.style.display = "none";
          
        }

        function clock() {
            let zeit = new Date();

            document.getElementById("time").textContent = (zeit.getHours()<10?"0"+zeit.getHours():zeit.getHours())+":"+(zeit.getMinutes()<10?"0"+zeit.getMinutes():zeit.getMinutes())+":"+(zeit.getSeconds()<10?"0"+zeit.getSeconds():zeit.getSeconds());
        }

        this.zoom = () => {
            if(!zoomToggle) {
                //console.log("Fesnter :" +window.innerHeight);
                svg.setAttribute("width",window.innerWidth );
                svg.setAttribute("height",window.innerHeight);
                svg.setAttribute("viewBox","0 0 " + window.innerWidth*0.55 + " " +window.innerHeight*0.7)
                svg.parentNode.setAttribute("style", "position: absolute; top:0px; left:0px; display: block; width: 100%; height: 100%; z-index: 9997; background-color:  rgb(18,22,32);");
                let closeBtn = document.createElement("a");
                closeBtn.onclick = this.zoom;
                closeBtn.setAttribute("id","closeBtn");
                closeBtn.setAttribute("href","#");
                closeBtn.setAttribute("style", "padding: 5px; position: absolute; top:0px; left:0px; min-width: 20px; min-height: 15px; display: block; z-index: 9998; background-color: rgba(255,0,0,0.2); border: 1px solid rgba(255,0,0,1); color: rgb(255,255,255); font-size: 1em;");
                closeBtn.innerText = "close";
                svg.parentNode.appendChild(closeBtn);
                //svg.setAttribute("viewBox",)
            } else { // restore Defaults
                svg.setAttribute("width",defaults.svg.width );
                svg.setAttribute("height",defaults.svg.height);
                svg.setAttribute("viewBox",defaults.svg.viewBox);

                svg.parentNode.setAttribute("style", defaults.parent.style);
                svg.parentNode.removeChild(document.getElementById("closeBtn"));
            }
            zoomToggle = !zoomToggle;
        }
        
        function playSound() {
            //console.log("playing warning sound");
            try {
                if(enableSound) {
                    const audio = new Audio('./warning.wav');
                    audio.play();  
                }
            } catch(e) {
                console.log("Fehler: " + e);
            }
            
          }

    } // !Constructor

    // @public stuff goes here... may lead to unwanted results...
    
  
    closeWebSocket() { // handler to enable WS closure from outside of this class.
        this.closeSocket();
    }

    zoom() {
        this.zoom();
    }
    toggleSound() {
        enableSound = !enableSound;
    }


   


} // !Class 


async function animiere(element, targetColor, speed=2000) { 
    var targetElement = document.getElementById(element);
    aktuelleFarbe = targetElement.getAttribute("fill");
    //console.log("Animate - aktuell: " + aktuelleFarbe + " zu " + targetColor );
    if(targetColor != aktuelleFarbe) {
        targetElement.animate(
        [
            {
            fill: aktuelleFarbe,
            stroke: aktuelleFarbe
            }, 
            { 
            fill: targetColor,
            stroke: targetColor
            }
        ], {
            duration: speed,
            iterations: 1,
            fill: 'forwards'
        });
        targetElement.setAttribute("fill",targetColor);
    }
}

/* ersetzt duch WEB API funktion.... async function colorMorphHandler(targetElementId, targetColor, speed) {
    let targetElement;
    //const regex = /^(rgba|rgb)\((\d{1,3}),(\d{1,3}),(\d{1,3})(,0\.\d)?\)/gm;
    const regex = /(\d{1,3})/gm;
    if( typeof (targetElementId) == "string" ) targetElement = document.getElementById(targetElementId);
    else targetElement = targetElementId;
    
    const tcArr =  [];
    const ccArr = [];
    let tempColor = [];
    let minMax = [];
    let max, step, interval;

    //console.log("zielfarbe: " +targetColor);

    const currentColor = targetElement.getAttribute("fill");
    if(currentColor == targetColor){
        //console.log("Farben sind schon gleich.");
        return false;
    }
    const currentTemp = currentColor.match(regex);
    const targetTemp = targetColor.match(regex);

    ccArr.push(parseInt(currentTemp[0]));
    ccArr.push(parseInt(currentTemp[1]));
    ccArr.push(parseInt(currentTemp[2]));

    tcArr.push(parseInt(targetTemp[0]));
    tcArr.push(parseInt(targetTemp[1]));
    tcArr.push(parseInt(targetTemp[2]));

    ccArr.forEach((val, ind, arr) => {
       
        let tmp = getDiff(val, tcArr[ind]);
       
        minMax.push(tmp);
    });
    
    max = getMax(minMax);
    step = (max/speed);
   
    tempColor = ccArr;
 
    interval = setInterval(morphColor, step);

    function colorMatches(){
        let count = 0;
        tempColor.forEach((val, ind, arr) => {
            if(getDiff(val, tcArr[ind]) == 0) count++;
        });
        if(count == 3 )  {
            clearInterval(interval);
            console.log("Farbe erreicht: " + tempColor + " SOLL: " + tcArr + " // IST: " + targetElement.getAttribute("fill"));
        }
       // else return false;
    }

    function morphColor() {
        let ceiledStep = Math.ceil(step);
        tempColor.forEach((val,i) => {
            if(tcArr[i] > val) {
                tempColor[i] = parseInt(val+ceiledStep);
                
            } else if( tcArr[i] < val) {
                tempColor[i] = parseInt(val-ceiledStep);
            } else {
                //Farbe müsste passen.
            }
        });
        targetElement.setAttribute("fill", "rgb("+tempColor[0]+","+tempColor[1]+","+tempColor[2]+")");
        colorMatches();
    }
}


function getMax(numbers) {
    let runningMaxi;
    for(let i = 0; i<numbers.length-1; i++) {
        //console.log(i+") Nummer: "+ numbers[i]);
        if(numbers[i] < numbers[i+1]) {
            runningMaxi = numbers[i+1];
        } else runningMaxi = numbers[i];
    }
    return runningMaxi;
}

function getDiff(num1,num2) {
    //console.log("num1: "+ num1 + " num2: " + num2);
    if(num1>num2) return num1-num2;
    else return num2-num1;
}
 */
