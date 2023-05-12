const axios = require('axios');

async function fetchInstagramAndSaveToGridFS(gfs) {
    const accessToken = process.env.ACCESS_TOKEN;
    const userMedia = await fetchUserRecentMedia(accessToken);
  
    let postNumber = 0;
    for (const item of userMedia.data) {
        postNumber += 1;
    
        if (item.media_type === 'CAROUSEL_ALBUM') {
            const children = item.children.data;
            let counter = 0;
            for (const obj of children) {
                counter += 1;
                if (obj.media_type === 'IMAGE') {
                let outputFilenameChild = `${postNumber}_${counter}.jpg`;
                await saveFileToGridFS(obj.media_url, outputFilenameChild, gfs);
                } else if (obj.media_type === 'VIDEO') {
                let outputFilenameChild = `${postNumber}_${counter}.mp4`;
                await saveFileToGridFS(obj.media_url, outputFilenameChild, gfs);
                }
            }
        } else if (item.media_type === 'IMAGE') {
            let outputFilename = `${postNumber}.jpg`;
            await saveFileToGridFS(item.media_url, outputFilename, gfs);
        } else if (item.media_type === 'VIDEO') {
            let outputFilename = `${postNumber}.mp4`;
            await saveFileToGridFS(item.media_url, outputFilename, gfs);
        }
    } 
}

async function fetchUserRecentMedia(accessToken) {
    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}&access_token=${accessToken}`);
    const data = response.data;
    return data;
}
  
async function saveFileToGridFS(url, outputFilename, gfs) {
  const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
  });

  const writeStream = gfs.openUploadStream(outputFilename);

  response.data.pipe(writeStream);

  return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
  });
}
  
module.exports = { fetchInstagramAndSaveToGridFS };
  


// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');

// async function fetchUserInfo(accessToken) {
//   const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
//   const data = response.data;
//   return data;
// }

// async function fetchUserRecentMedia(accessToken) {
//   const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}&access_token=${accessToken}`);
//   const data = response.data;
//   return data;
// }

// async function downloadFile(url, outputFilename) {
//   const writer = fs.createWriteStream(outputFilename);

//   const response = await axios({
//     url,
//     method: 'GET',
//     responseType: 'stream',
//   });

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });
// }

// (async () => {
//   const userInfo = await fetchUserInfo(accessToken);
//   // console.log('User Info:', userInfo);

//   const userMedia = await fetchUserRecentMedia(accessToken);
//   // console.log('Media Info:', userMedia);
//   var postNumber = 0
//   for (const item of userMedia.data) {
//     postNumber += 1
//     var dir = `./${postNumber}`;
//     if (!fs.existsSync(dir)){
//       fs.mkdirSync(dir);
//     }

//     if (item.media_type === 'CAROUSEL_ALBUM') {
//       console.log('Is a CAROUSEL_ALBUM')

//       const children = item.children.data;
//       let counter = 0

//       for (const obj of children) {
//         counter = counter + 1
//         // console.log(obj.media_type);
//         fs.mkdir
//         if (obj.media_type === 'IMAGE') {
//           console.log('         Is a child Image')
//           let outputFilenameChild = path.join(dir,`${postNumber}_${counter}.jpg`);
//           await downloadFile(obj.media_url, outputFilenameChild);
//           console.log(`         Downloaded ${outputFilenameChild}`);
//         }else if (obj.media_type === 'VIDEO'){
//           let outputFilenameChild = path.join(dir,`${postNumber}_${counter}.mp4`);
//           console.log('         Is a child Video')
//           await downloadFile(obj.media_url, outputFilenameChild);
//           console.log(`         Downloaded ${outputFilenameChild}`);
//         }
//       }
//     }
//   }
// })();