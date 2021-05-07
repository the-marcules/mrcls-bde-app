/*
 *  Websocket client script  
 *  Author: mrcls  
 * 
 */

let message = {
  requestType: "dataRequest",
  dataType: {
    source: "randomMultiple",
    interval: 3000,
    updateMethod: "replace",
    min: 6,
    max: 14,
    count: 5,
    labelPrefix: "",
    labels: ["Energy", "Air", "Gas", "Coolant","Oil"]
  }
};

let message2 = {
  requestType: "dataRequest",
  dataType: {
    source: "randomMultiple",
    count: 7,
    interval: 3000,
    min: 0,
    max: 100,
    updateMethod: "replace", // replace or add
    labelPrefix: "Tool",
    labels: []
  }
};

let message3 = {
  requestType: "dataRequest",
  dataType: {
    source: "random",
    interval: 5000,
    updateMethod: "add",
    count: 10
  }
};

let message_MZ = {
  requestType: "dataRequest",
  dataType: {
    source: "randomMaschZu",
    interval: 4000,
    updateMethod: "replace",
    count: 16,
    machines: ["line_1_machine_8","line_1_machine_1","line_1_machine_2","line_1_machine_3","line_1_machine_4","line_1_machine_5","line_1_machine_6","line_1_machine_7"]
  }
};

window.onload = function app() {
  const chartParams = {
    // The type of chart we want to create
    type: 'bar',
    // The data for our dataset
    data: {
        labels: [],
        datasets: [{
            fill:false,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(255, 159, 64, 0.2)",
              "rgba(255, 205, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(201, 203, 207, 0.2)"],
            borderColor:[
              "rgb(255, 99, 132)",
              "rgb(255, 159, 64)",
              "rgb(255, 205, 86)",
              "rgb(75, 192, 192)",
              "rgb(54, 162, 235)",
              "rgb(153, 102, 255)",
              "rgb(201, 203, 207)"],
            borderWidth:1,
            data: []
        }]
    },
    // Configuration options go here
    options: {
        scales: {
            yAxes: [{
                id: 'first-y-axis',
                type: 'linear',
                ticks: { // fixing the y axis scale from 5 to 15
                    min: 5,
                    max: 15,
                    stepSize: 1
                }
            }]
        },
        legend: {
          display: false
        }
    }
  };
  const chartParams2 = {
    type: 'radar',
    data:  {
      labels: ["eins","zwei","drei","vier","fünf","sechs","sieben"],
      datasets: [{
        label: 'Temperature in °C',
        backgroundColor: 'rgba(54, 162, 235,0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth:1,
        fill: 'origin',
        data: [100,80,50,70,30,10,60]
      },{
        label: 'Warning',
        backgroundColor: 'rgba(255, 217, 0, 0.1)',
        borderColor: 'rgba(255, 217, 0, 0.2)',
        pointBorderColor: 'rgba(0,0,0,0)',
        borderWidth:1,
        pointBackgroundColor: 'rgba(0,0,0,0)',
        fill: '+1', // only works if 'fill' is specified for all datasets.
        data: [70,70,70,70,70,70,70]
      },{
        label: 'Danger Zone',
        backgroundColor: 'rgba(255, 0, 0,0.1)',
        borderColor: 'rgba(255, 0, 0,0.2)',
        pointBorderColor: 'rgba(0,0,0,0)',
        borderWidth:1,
        pointBackgroundColor: 'rgba(0,0,0,0)',
        fill: 'end', // only works if 'fill' is specified for all datasets.
        data: [85,85,85,85,85,85,85]
      }
    ]
    },
    options: {
      scale: {
        ticks: {
          backdropColor: 'rgba(0,0,0,0.1)',
          min: 0,
          max: 100
        }

      },
      legend: {
        display: true
      }
    }
  }
  const chartParams3 = {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
        labels: [],
        datasets: [{
            label: 'Cycle time',
            backgroundColor: 'rgba(13, 175, 24, 0.2)',
            borderColor: 'rgb(13, 175, 24)',
            borderWidth:1,
            fill: 'start',
            data: []
        },
        {
            label: 'Limit',
            backgroundColor: 'rgba(255, 0, 0,0.1)',
            borderColor: 'rgba(255, 0, 0,0.2)',
            borderWidth:1,
            pointBorderColor: 'rgba(0,0,0,0)',
            pointBackgroundColor: 'rgba(0,0,0,0)',
            fill: 'end',
            data: [13,13,13,13,13,13,13,13,13,13]
        }
    ]
    },
    // Configuration options go here
    options: {
        scales: {
            yAxes: [{
                id: 'first-y-axis',
                type: 'linear',
                ticks: { // fixing the y axis scale from 5 to 15
                    min: 5,
                    max: 15,
                    stepSize: 1
                }
            }]
        }
    }
  };

  wsPort = 8087;

   myChart = new mrclsLiveChart("myChartOne",{host: "ws://localhost", port: wsPort});
   myChart.initChart(chartParams);
   myChart.initWebSocketCommunication(message);
 


  // 2nd Chart
  myChartTwo = new mrclsLiveChart("myChartTwo",{host: "ws://localhost", port: wsPort});
  myChartTwo.initChart(chartParams2);
  myChartTwo.initWebSocketCommunication(message2);

  // 3rd Chart
  myChartThree = new mrclsLiveChart("myChartThree",{host: "ws://localhost", port: wsPort});
  myChartThree.initChart(chartParams3);
  myChartThree.initWebSocketCommunication(message3);
  

  // flussdiragramm
  myFlowChartWS = new Andon(message_MZ, "ws://localhost:"+wsPort, "master");  


}

function closeWebSocket() { // stop data stream.
  myChart.closeWebSocket();
  myChartTwo.closeWebSocket();
  myChartThree.closeWebSocket();
  myFlowChartWS.closeWebSocket();
}