const axios = require('axios');

async function fetchInstagramAndSaveToGridFS(gfs) {
    const accessToken = process.env.ACCESS_TOKEN;
    const userMedia = await fetchUserRecentMedia(accessToken);
    let postNumber = 0;
    const posts = {};  // Initialize an empty object to store posts data

    for (const item of userMedia.data) {
        postNumber += 1;
        // console.log(item)

        const timestamp = item.timestamp;
        const date = new Date(timestamp);
        const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

    
        // Add location and description to the post data
        const post = {
            description: item.caption || '',
            location: `Location ${postNumber}`,
            date: formattedDate,
            images: [],
        };

        if (item.media_type === 'CAROUSEL_ALBUM') {
            const children = item.children.data;
            let counter = 0;
            for (const obj of children) {
                counter += 1;
                if (obj.media_type === 'IMAGE') {
                    let outputFilenameChild = `${postNumber}_${counter}.jpg`;
                    await saveFileToGridFS(obj.media_url, outputFilenameChild, gfs);
                    if (counter == 1){
                        post.images.push({ name: outputFilenameChild, status: 'current', imageSrc: `https://dwbiekfq3qvye.cloudfront.net/image/${outputFilenameChild}` });
                    }else{
                        post.images.push({ name: outputFilenameChild, status: '', imageSrc: `https://dwbiekfq3qvye.cloudfront.net/image/${outputFilenameChild}` });
                    }
                } else if (obj.media_type === 'VIDEO') {
                    let outputFilenameChild = `${postNumber}_${counter}.mp4`;
                    await saveFileToGridFS(obj.media_url, outputFilenameChild, gfs);
                    if (counter == 1){
                        post.images.push({ name: outputFilenameChild, status: 'current', imageSrc: `https://dwbiekfq3qvye.cloudfront.net/image/${outputFilenameChild}` });
                    }else{
                        post.images.push({ name: outputFilenameChild, status: '', imageSrc: `https://dwbiekfq3qvye.cloudfront.net/image/${outputFilenameChild}` });
                    }
                }
            }
        } else if (item.media_type === 'IMAGE') {
            let outputFilename = `${postNumber}.jpg`;
            await saveFileToGridFS(item.media_url, outputFilename, gfs);
            // post.images.push({ name: outputFilename, status: '', imageSrc: '' });
        } else if (item.media_type === 'VIDEO') {
            let outputFilename = `${postNumber}.mp4`;
            await saveFileToGridFS(item.media_url, outputFilename, gfs);
            // post.images.push({ name: outputFilename, status: '', imageSrc: '' });
        }

        posts[`post${postNumber}`] = post;
    } 
    // console.log(posts)
    return posts;  // Return the posts object

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