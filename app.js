function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  }))

function getAverageRGB(imgEl) {
    console.log("**",imgEl)
    var blockSize = 10, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
    if (!context) {
        console.log("!context");
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        console.log('error');
        return defaultRGB;
    }

    length = data.data.length;
    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }
    
    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);
    
    return rgb;
}


const hash = window.location.hash
.substring(1)
.split('&')
.reduce(function (initial, item) {
  if (item) {
    var parts = item.split('=');
    initial[parts[0]] = decodeURIComponent(parts[1]);
  }
  return initial;
}, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '257157cee57849e38629b7b35463f47e';
const redirectUri = 'https://helene-p.fr/bic/';
const scopes = [
  'user-top-read'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}

let list_covers=[]

// Make a call using the token
$.ajax({
   url: "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5",
   type: "GET",
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) { 
     // Do something with the returned data
     var idx = 0
     data.items.map(function(track) {
        console.log(track)
        let item = $('<li>' + track.name + '</br> <div><img id="img_' + idx +'" src="'+ track.album.images[0].url +'" width=200></div>' + '</li>');
        item.appendTo($('#top-albums'));
        list_covers.push(track.album.images[0].url);
        idx=idx+1;
     });
     for (let i = 0; i < list_covers.length;i++){
      toDataURL(list_covers[i])
        .then(dataUrl => {
          const name_source = 'img_'+i
          var img = document.getElementById(name_source);
          img.src=dataUrl;
          sleep(10).then(() => {
              var rgb = getAverageRGB(document.getElementById(name_source));
              console.log(rgb);
              var name = 'container_color'+i;
              const pixel = document.getElementById(name);
              pixel.style.backgroundColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
          });
        })
      }
   }
});





