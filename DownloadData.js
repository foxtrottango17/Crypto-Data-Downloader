const fs = require('fs');
const Binance = require('binance-api-node').default
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const client = Binance()

const saveAs = 'BOTH';                            // JSON, CSV, BOTH
const symbols = 'BTCUSDT';                        // Symbols
const timeframe = '1h';                           // 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
const limits = 500;                               // Max 1000
const endDate =  new Date(2022,1,28).getTime();   // End Date - note that format is in YEAR / MONTH / DATE vice versa startDate
let startDate = new Date(2017,0,1).getTime();     // Start Date - note that MONTH starts at index 0. So January start from 0 vice versa endDate

let datas = [];

async function historicalData(){

  if(endDate > new Date().getTime()){
    console.log("endDate is geater than current time. This will cause an inifinate loop. Please change the endDate.")
    return;
  }

  const data = (await client.candles({symbol: symbols, 
    interval: timeframe,                               
    limit: limits,                                     
    startTime: startDate,                              
    endTime: endDate                                  
  }));

  try{

    for(let i = 1; i < data.length; i++){
      datas.push({
        'openTime': data[i].openTime,
        'open': data[i].open,
        'high': data[i].high,
        'low': data[i].low,
        'close': data[i].close,
        'volume': data[i].volume
      });
    }

    startDate = (datas[datas.length - 1].openTime); 

    if(startDate != endDate){
      historicalData();

    }else if (startDate === endDate){

      const tempStartInfo = new Date(datas[1].openTime);
      const tempEndInfo = new Date(datas[datas.length - 1].openTime);
      const startInfo = tempStartInfo.getFullYear() + '/' + (tempStartInfo.getMonth() + 1) + '/' + tempStartInfo.getDate();
      const endInfo = tempEndInfo.getFullYear() + '/' + (tempEndInfo.getMonth() + 1) + '/' + tempEndInfo.getDate();

      const csvWriter = createCsvWriter({
        path: './backtester/BTCUSDT.csv',
        header: [
          {id: 'openTime', title: 'Open Time'},
          {id: 'open', title: 'Open'},
          {id: 'high', title: 'High'},
          {id: 'low', title: 'Low'},
          {id: 'close', title: 'Close'},
          {id: 'volume', title: 'Volume'}
        ]
      });  

      if(saveAs === 'JSON'){

        fs.writeFile('./backtester/BTCUSDT.json', JSON.stringify(datas), err =>{
          if (err){
            console.log(err);
          } else {
            console.log("Successfully Downloaded Data AS JSON From " + startInfo + ' To: ' + endInfo);
          }
        }); 

      }else if (saveAs === 'CSV'){

        csvWriter.writeRecords(datas)  
        .then(() => {
            console.log("Successfully Downloaded Data As CSV From " + startInfo + ' To: ' + endInfo);
        });

      }else{
        fs.writeFile('./backtester/BTCUSDT.json', JSON.stringify(datas), err =>{
          if(err){
            console.log(err);
          }else{
            console.log("Successfully Downloaded Data AS JSON From " + startInfo + ' To: ' + endInfo);
          }
        });

        csvWriter.writeRecords(datas)  
        .then(() => {
            console.log("Successfully Downloaded Data As CSV From " + startInfo + ' To: ' + endInfo);
        });

      }
    }
  }catch(error){
    console.log(error);
  }
}
historicalData();
