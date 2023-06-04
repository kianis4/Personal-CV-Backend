const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

const my_uuid = 'c1dfd9fe-9e8e-11ed-b362-cbb8685788f1'
const hikaru_uuid = '6f4deb88-7718-11e3-8016-000000000000'


async function get_uuid(username) {
  const insights_url = `https://www.chess.com/insights/${username}#overview`;
  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Cookie': 'PHPSESSID=23b465f18ab60baaa590a5720a2399a1; asset_push=20230525124633%3B0629c; visitorid=%3A5163%3Affff%3A76.70.91.92; me=%7B%22deviceId%22%3A%22b6086cfa-fb53-11ed-8297-91425d4c399c%22%7D; __cf_bm=1hnG9JuL1.RNNJcwADuJN6vQBZ3DhgiQiotg8cPUwTo-1685057247-0-AfMxGJZt1+bNTd9nuVmsfVTt4RyY/QMlNYOvze33dUED7weIdzi/c7aoELUL17H84AkqM2ayWRT4p0zlDc0OFRDrk2uAJ6zex+ILogMrEUP4; _gid=GA1.2.1521766729.1685057248; ATTRIBUTION_V1=%7B%22initialAttribution%22%3A%7B%22source%22%3A%22unknown%22%2C%22medium%22%3A%22unknown%22%2C%22campaign%22%3Anull%2C%22term%22%3Anull%2C%22content%22%3Anull%2C%22route%22%3A%22%5C%2Finsights%5C%2Fhikaru%22%2C%22referer%22%3A%22unknown%22%2C%22version%22%3A%221.0.0%22%2C%22createDateTime%22%3A%221685057247%22%7D%2C%22lastAttribution%22%3A%7B%22source%22%3A%22unknown%22%2C%22medium%22%3A%22unknown%22%2C%22campaign%22%3Anull%2C%22term%22%3Anull%2C%22content%22%3Anull%2C%22route%22%3A%22%5C%2Finsights%5C%2Fhikaru%22%2C%22referer%22%3A%22unknown%22%2C%22version%22%3A%221.0.0%22%2C%22createDateTime%22%3A%221685058342%22%7D%7D; _gat_UA-170510588-1=1; _ga=GA1.1.985542298.1685057248; _ga_Q0CBHRQJH8=GS1.1.1685057247.1.1.1685058342.60.0.0; _ga_NP7V31R49N=GS1.1.1685057247.1.1.1685058342.0.0.0; amp_5cc41a=b6086cfa-fb53-11ed-8297-91425d4c399c...1h1ajq6vd.1h1akrjnl.6.5.b',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
  };

  try {
    const response = await axios.get(insights_url, { headers });
    console.log
    const html = response.data;

    // Use Cheerio to load the HTML
    const $ = cheerio.load(html);

    // Write the HTML response to a file
    // fs.writeFileSync('response.html', html);

    // console.log('HTML response saved to response.html');

    // Find the script tag with the "window.chesscom.insights" JavaScript object
    const scriptContent = $('script').map((i, element) => $(element).html()).get().find(content => content.includes('window.chesscom.insights'));

    // Use a regular expression to extract the UUID
    const uuidRegEx = /uuid:\s*'([^']*)'/;
    const match = uuidRegEx.exec(scriptContent);
    const uuid = match ? match[1] : null;  // If a match is found, match[1] is the captured UUID

    // fs.writeFileSync('uuid.html', uuid || '');

    return uuid;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Username not found in get_uuid');
    }
    throw error;
  }
}

async function get_insights(uuid){
    const insights_url = `https://www.chess.com/service/insights/${uuid}/rapid/all-time?uuid=${uuid}`
    const headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Cookie': 'PHPSESSID=23b465f18ab60baaa590a5720a2399a1; asset_push=20230525124633%3B0629c; visitorid=%3A5163%3Affff%3A76.70.91.92; me=%7B%22deviceId%22%3A%22b6086cfa-fb53-11ed-8297-91425d4c399c%22%7D; __cf_bm=1hnG9JuL1.RNNJcwADuJN6vQBZ3DhgiQiotg8cPUwTo-1685057247-0-AfMxGJZt1+bNTd9nuVmsfVTt4RyY/QMlNYOvze33dUED7weIdzi/c7aoELUL17H84AkqM2ayWRT4p0zlDc0OFRDrk2uAJ6zex+ILogMrEUP4; _gid=GA1.2.1521766729.1685057248; ATTRIBUTION_V1=%7B%22initialAttribution%22%3A%7B%22source%22%3A%22unknown%22%2C%22medium%22%3A%22unknown%22%2C%22campaign%22%3Anull%2C%22term%22%3Anull%2C%22content%22%3Anull%2C%22route%22%3A%22%5C%2Finsights%5C%2Fhikaru%22%2C%22referer%22%3A%22unknown%22%2C%22version%22%3A%221.0.0%22%2C%22createDateTime%22%3A%221685057247%22%7D%2C%22lastAttribution%22%3A%7B%22source%22%3A%22unknown%22%2C%22medium%22%3A%22unknown%22%2C%22campaign%22%3Anull%2C%22term%22%3Anull%2C%22content%22%3Anull%2C%22route%22%3A%22%5C%2Finsights%5C%2Fhikaru%22%2C%22referer%22%3A%22unknown%22%2C%22version%22%3A%221.0.0%22%2C%22createDateTime%22%3A%221685058342%22%7D%7D; _gat_UA-170510588-1=1; _ga=GA1.1.985542298.1685057248; _ga_Q0CBHRQJH8=GS1.1.1685057247.1.1.1685058342.60.0.0; _ga_NP7V31R49N=GS1.1.1685057247.1.1.1685058342.0.0.0; amp_5cc41a=b6086cfa-fb53-11ed-8297-91425d4c399c...1h1ajq6vd.1h1akrjnl.6.5.b',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
      };
      try {
        const response = await axios.get(insights_url, { headers });
        const data = response.data
        // Write the json response to a file    
        // fs.writeFileSync('insights_data.json', JSON.stringify(data));

        // console.log('Insight data saved in insights_data.json');

        let new_data = {
            overallAccuracy: data.gamesOverview.overallAccuracy,
            openingAccuracy: data.gamePhase.openingAccuracy,
            middlegameAccuracy: data.gamePhase.middlegameAccuracy,
            endgameAccuracy: data.gamePhase.endgameAccuracy
        }
        
        return new_data
      } catch (error) {
        console.log(error);
      }


}


async function getInsightData(username) {
  try {
    const res = await get_uuid(username);
    console.log(res);

    const insight_values = await get_insights(res)
    console.log(insight_values)

    return insight_values
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getInsightData };


