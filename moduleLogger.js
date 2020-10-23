


/*
    Error Object for easy Error handling
    @params msg = Error message as String; meta = further data in form of an object {"additionalData1":"foo", "add..":"bar..."}
*/
class myErr {
    constructor(msg, meta) {
        this.msg = msg;
        this.Metadata = meta;
    }
}



/*
    CLASS journal is aimed to make loogin easier.
    @initiate   const logger = new journal('myTitle');
    @params     title = the log group if you like. the "area" in the app where the logging belongs to.
    @settings   the constructor function keeps two objects for setting preferences. until now only the outputFormat.timeStamp is beeing interpretet.

*/
class journal {
                
    constructor(title) { // 
        this.name = title;
        // TODO: implement severity usage
        this.severity = { // output levels and severity
            "1" : "Error",
            "2" : "Warning",
            "3" : "Info",
            "4" : "Metric Data"
        }; 
        // TODO: implement the outputFormat logic
        this.outputFormat = { // Format of the log output
            "format": "json", // txt, json
            "timeStamp": true, // bool
            "dateFormat": "d-m-Y"

        };
        this.date = new Date();
        
    }

    error(err) {
        console.log("%c"+JSON.stringify({
            type: "Error",
            time: (this.outputFormat.timeStamp?this.mkTime():''),
            namespace: this.name,
            message: (!err.msg?err.message:err.msg),
            metadata: (!err.Metadata?err:'')
        }, null, 4),"color: red");                       
    }

    warning(msg, Metadata) {
        console.log("%c"+JSON.stringify({
            type: "Warning",
            time: (this.outputFormat.timeStamp?this.mkTime():''),
            namespace: this.name,
            message: msg,
            metadata: Metadata
        }, null, 4),"color: orange");
    }

    info(msg, Metadata) {
        console.log("%c"+JSON.stringify({
            "type": "Info",
            time: (this.outputFormat.timeStamp?this.mkTime():''),
            namespace: this.name,
            message: msg,
            metadata: Metadata
        }, null, 4),"color: blue"); 
    }

    metric(msg, Metadata) {
        console.log("%c"+JSON.stringify({
            type: "Metric Data",
            time: (this.outputFormat.timeStamp?this.mkTime():''),
            namespace: this.name,
            message: msg,
            metadata: Metadata
        }, null, 4),"color: green");
    }
    mkTime () {
        return this.date.toLocaleString();
    }



}
