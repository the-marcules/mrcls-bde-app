/*
   CLASS mrclsChart 
    @params ctxId  = DOM Element id of canvas element
    @methods:
    - @initChart to initialize the chart.
        @params label newLabels, data newData (single Items each)
    - @addDate to update the chart
    - @removeDate well, guess what...

    Author: mrcls

*/



class mrclsLiveChart {
    constructor(ctxId,wsData) {
        // @Variables CHART
        const canvasElement = document.getElementById(ctxId);
        const ctx = canvasElement.getContext('2d');
        this.dataXAxisLimit = 10;
        let chart = "";
        // @variables Websocket
        let ws;
        this.host = wsData.host;
        this.port = wsData.port;
        self = this;

        this.initChart = function (chartParams) {
            chart = new Chart(ctx, chartParams);
        }


        this.initWebSocketCommunication = function(requestParams) {
            this.dataXAxisLimit = requestParams.dataType.count;
            ws = new WebSocket(this.host+":"+this.port);
            ws.onopen = ()=>{
                ws.send(JSON.stringify(requestParams));
                ws.onmessage = function incoming(event) {
                    self.newDataHandler(JSON.parse(event.data), requestParams.dataType.updateMethod, chart);
                }
              }
        }

        this.closeWebSocket = () => {
            ws.close();
        }


    } // constructor end
    
   

    // decision what should happen with new data 
    // @params label: goes to axis, data contains new data point
    newDataHandler(data, method, chart) { 
        //console.log("Chart to be updated: " + this.canvasElement.id + "  - Data: "+ JSON.stringify(data));
        if(method == 'replace') this.replaceData(data.labels,data.data, chart);
        else if (method == 'add') {
            if(this.dataXAxisLimit > chart.data.datasets[0].data.length)
                this.addData(data.labels,data.data, chart);
            else {
                this.shiftData(data.labels, data.data, chart);
            }  
        }  
    }

    // will be called when dataxAxisLimit has been reached. this will shift data from right to left and add the new data set (@params see newDataHandler)
    shiftData(label, data, chart){
        chart.data.labels.forEach((current, i , set)=>{
            if(i<set.length-1) set[i] = set[i+1];
            else if(i==set.length-1) set[i] = label;
        });
        chart.data.datasets[0].data.forEach((currentValue, i, set) => {
                if(i<set.length-1) set[i] = set[i+1];
                else if(i==set.length-1) set[i] = data;

            });
        chart.update();
    }

    // will be called to initially fill up x-axis until dataXAxisLimit has been reached) (@params see newDataHandler)
    addData(label, data, chart) {
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(data);

        chart.update();
    }
    replaceData(labels, data, chart) {
        chart.data.labels=labels;
        chart.data.datasets[0].data = data;

        chart.update();
    }
    
    removeData() {
        this.chart.data.labels.pop();
        this.chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
        this.chart.update();
    }

} // class end
