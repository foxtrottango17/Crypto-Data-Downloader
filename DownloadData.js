const fs = require('fs');
const Binance = require('binance-api-node').default
const client = Binance()

const symbols = 'BTCUSDT';
const timeframe = '1h';
const limits = 500;
// note that format is in YEAR / MONTH / DATE
// note that MONTH starts at index 0. So January start from 0
const endDate =  new Date(2022,1,28).getTime();
let startDate = new Date(2017,0,1).getTime();

let datas = [];

async function historicalData(){
  if (endDate > new Date().getTime()) {
    console.log("End date time is geater than current time. This will cause an inifinate loop. Please change the end date ")
    return;
  }

  const data = (await client.candles({symbol: symbols, // Symbols
    interval: timeframe,                               // 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
    limit: limits,                                     // Max 1000
    startTime: startDate,                              // Start Date
    endTime: endDate                                   // End Date
  }));

  try{
    for (let i = 1; i < data.length; i++){
      datas.push({
        'openTime': data[i].openTime,
        'open': data[i].open,
        'high': data[i].high,
        'low': data[i].low,
        'high': data[i].close,
        'volume': data[i].volume
      });
    }

    startDate = (datas[datas.length - 1].openTime); 

    if(startDate != endDate){
      historicalData();

    }else if(startDate === endDate){
      const tempStartInfo = new Date(datas[1].openTime);
      const tempEndInfo = new Date(datas[datas.length - 1].openTime);
      const startInfo = tempStartInfo.getFullYear() + '/' + (tempStartInfo.getMonth() + 1) + '/' + tempStartInfo.getDate();
      const endInfo = tempEndInfo.getFullYear() + '/' + (tempEndInfo.getMonth() + 1) + '/' + tempEndInfo.getDate();

      fs.writeFile('./backtester/BTCUSDT.json', JSON.stringify(datas), err =>{
        if(err){
          console.log(err);
        }else{
          console.log("Successfully Downloaded Data From " + startInfo + ' To: ' + endInfo);
        }
      }) 
    }

  }catch(error){
    console.log(error);
  }
}
historicalData();
