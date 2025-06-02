let playbtn = document.getElementById('playbtn');  // taking access of the play button
let currFolder;  // declaring folder from which we wanna play the songs
let songs;
let audio = new Audio();  // built-in JavaScript way to create and control audio playback directly in your web page — without needing an <audio> element in the HTML.


// function to convert time from seconds gotten from timeupdate to MM:SS format
function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);  // Converts total seconds into full minutes
    let secs = Math.floor(seconds % 60);  // getting the remaining seconds after taking out full minutes
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;  // Converting the number to a string and formatting with padStart() which adds a leading zero if it's only 1 digit
}


async function getSongs(folder) {
    currFolder = folder;  // the value of the currFolder will be the file path we provide as an argument to the function
    let response = await fetch(`${folder}`);  // Makes a GET request to your local server (localhost:3000) at the /songs/ endpoint.
    let data = await response.text();  // Reads the body content of the response as plain text.

    let div = document.createElement('div');
    div.innerHTML = data;  // turning data into DOM elements
    let a = div.getElementsByTagName('a');  // Returns an HTMLCollection collection (an array-like object) of all <a> tags elements found within div.

    songs = [];  // creating an empty array
    for (let index = 0; index < a.length; index++) {  // Loop through all <a> tags
        const element = a[index];

        if (element.href.endsWith('.mp3')) {  //  element.href refers to the full URL of the <a> tag's href attribute.
            songs.push(element.href.split(`${folder}/`)[1].replaceAll('%20', ' '));  // pushing the song name extracted from URL into the songs array if true
        }
    }

    // show all the songs in the library
    let songUL = document.querySelector('.songList ul');  // getting access of the first ul tag inside songList div
    songUL.innerHTML = "";  // clearing the ul first before displaying songs in it
    songs.forEach((song) => {
        let li = document.createElement('li');  // creating li element
        li.dataset.url = `${currFolder}/${song}`;  // storing the actual song name along with .mp3 extension with song path in the li data attribute
        li.innerHTML = `
        <img src="images/music.svg" alt="">
        <div class="songName">
            <div>${song.replace('.mp3', '').trim()}</div>
        </div>
        <img src="images/playbtn2.svg" alt="">`;  // splitting the song href to get just the song name (line no. 31)
        songUL.appendChild(li);
    });

    // Attaching event listener to each li which contains the song
    document.querySelectorAll('.songList li').forEach((li) => {
        li.addEventListener('click', () => {
            audio.src = li.dataset.url;  // get the URL directly from the li
            audio.play();  // starts playing the song

            playbtn.src = 'images/pausebtn.svg'  // changing play button img to pause after playing the song
            document.querySelector('.songInfo').innerText = li.querySelector('.songName div').innerText;  // updating current playing song name from DOM
            // document.querySelector('.songTime').innerHTML = '00:00 / 00:00'  // updating current playing song time
            console.log(`Now Playing ${li.dataset.url}`);
        });
    });
}


// Function to display all the albums on page
async function displayAlbums() {
    let response = await fetch(`songs`);  // Makes a GET request to your local server (localhost:3000) at the /songs/ endpoint.
    let data = await response.text();  // Reads the body content of the response as plain text.
    let div = document.createElement('div');
    div.innerHTML = data;  // turning data into DOM elements

    let anchors = div.getElementsByTagName('a');  // storing all the anchor tags in variable
    Array.from(anchors).forEach(async (a) => {  // converting the anchors variable from html collection to an Array to apply for each
        if (a.href.includes('/songs') && !a.href.includes('.DS_Store')) {  // condition chek to get all the urls that contain the song folders only
            let folder = a.href.split('/').slice(-2)[0]  // extracting the folder names from a.href

            // Gettng the metadata of the folder
            let response = await fetch(`songs/${folder}/info.json`);  // fetching the data from the json file created in each of the folders in songs
            let data = await response.json();

            // Inserting cards in the card container dynamically
            document.querySelector('.cardContainer').insertAdjacentHTML('beforeend',
                `<div data-folder="${folder}" class="card">
                    <img src="songs/${folder}/cover.jpeg" alt="">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#25D366" />
                        <polygon points="9,7 9,17 17,12" fill="#000000" />
                    </svg>
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`)  // Using insertAdjacentHTML('beforeend', ...) to add the card at the end of card container without erasing the old ones
        }
    });
}



async function playSong() {
    // getting the list of all songs
    await getSongs("songs/cs");  // calling the getSongs function (now currFolder = songs/cs )

    // Displaying all the albums on the page
    await displayAlbums();

    // Loading the playlist whenever card is clicked through event delegation
    document.querySelector('.cardContainer').addEventListener('click', async (e) => {
        let card = e.target.closest('.card');  // climbs up the DOM tree from the clicked element until it finds the closest ancestor that matches .card
        if (card) {  // making sure the event listener works even when the user clicks on img, svg or h2 inside the card
            await getSongs(`songs/${card.dataset.folder}`);
            audio.src = `${currFolder}/${songs[0]}`  // playing the first song of the list automatically after clicking a card
            audio.play();

            let firstLi = document.querySelector('.songList li');  // getting access of the first li
            document.querySelector('.songInfo').innerText = firstLi.querySelector('.songName div').innerText  // updating song name in playbar
            document.querySelector('#playbtn').src = 'images/pausebtn.svg'  // changing play button to pause 
        }
    })

    // Load the first song in queue by default after page reload
    audio.src = `${currFolder}/${songs[0]}`;  // Set the source but don't auto-play
    let firstLi = document.querySelector('.songList li');  // getting access of the first li
    let songName = firstLi.querySelector('.songName div').innerText;  // getting access of the first li's song name
    document.querySelector('.songInfo').innerText = songName;  // Updating song name display

    // preload time display as 00:00 / duration
    audio.addEventListener('loadeddata', () => {
        document.querySelector('.songTime').innerText = `00:00 / ${formatTime(audio.duration)}`
    });
    // **loadeddata** is a browser event that fires when the first frame of the audio or video is loaded — basically, when the browser has enough data to start playing the media and give correct metadata like audioElement.duration.



    // Attaching event listener on play button
    playbtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();  // play the song if it is paused
            playbtn.src = 'images/pausebtn.svg'  // changing play button img to pause btn
        }
        else {
            audio.pause();  // pause the song if it's already played
            playbtn.src = 'images/playbtn.svg'  // changing pause button img to play btn
        }
    });

    // Listen for timeupdate event while audio is playing 
    // timeupdate is a built-in media event in JavaScript. It fires repeatedly while an <audio> or <video> is playing specifically when the currentTime of the media updates. it is used to Update the current playback time (e.g., 00:01, 00:02, etc.)
    audio.addEventListener('timeupdate', () => {
        let percent = (audio.currentTime / audio.duration) * 100
        document.querySelector('.songTime').innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;  // updating current playing song time & duration
        document.querySelector('.circle').style.left = `${percent}%`;  // moving the circle in seekbar as the song progresses
        document.querySelector('.seekBar').style.background = `linear-gradient(to right, #25d366 ${percent}%, #4d4d4d ${percent}%)`;  // background color animation of seekbar
    });

    // Adding event listener to seekbar
    document.querySelector('.seekBar').addEventListener('click', (e) => {
        let percent2 = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = `${percent2}%`;  // chaning the position of the circle when clicked
        document.querySelector('.seekBar').style.background = `linear-gradient(to right, #25d366 ${percent2}%, #4d4d4d ${percent2}%)`;  // updating the bg color of seekbar
        audio.currentTime = audio.duration * (percent2 / 100);  // controlling the song throught seek bar (updating song's current time)
    });

    // Adding event listener on hamburger
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.leftDiv').style.left = '0%'  // left div will slide in when clicked on hamburger
    });

    // Adding event listener on close button
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.leftDiv').style.left = '-84%'  // left div will slide back when clicked on close
    });

    // Adding event listner on previous song button
    document.querySelector('#previousbtn').addEventListener('click', () => {
        let currentSongName = decodeURI(audio.src).split(`${currFolder}/`)[1]  // extracting the song name from the current playing song's url
        let currentIndex = songs.indexOf(currentSongName);  // finding the index of current playing song

        if (currentIndex > 0) {  // condition check so that nothing plays before the first song in the list after clicking previous
            audio.pause()  // pausing the current playing song
            audio.src = `${currFolder}/${songs[currentIndex - 1]}`;  // changing the audio source to previous song through previous song's index
            audio.play()

            let currentLi = document.querySelectorAll('.songList li')[currentIndex - 1];  // getting access of the li which contains the song name playing after clicking previous
            document.querySelector('.songInfo').innerText = currentLi.querySelector('.songName div').innerText  // updating song name in playbar
            document.querySelector('#playbtn').src = 'images/pausebtn.svg'  // changing play button to pause            
        }
    });

    // Adding event listener on next song button
    document.querySelector('#nextbtn').addEventListener('click', () => {
        let currentSongName = decodeURI(audio.src).split(`${currFolder}/`)[1]  // extracting the song name from the current playing song's url
        let currentIndex = songs.indexOf(currentSongName);  // finding the index of current playing song

        if (currentIndex < songs.length - 1) {  // condition check so that nothing plays after the last song in the list after clicking next
            audio.pause()  // pausing the current playing song
            audio.src = `${currFolder}/${songs[currentIndex + 1]}`;  // changing the audio source to next song through next song's index
            audio.play();

            let currentLi = document.querySelectorAll('.songList li')[currentIndex + 1];  // getting access of the li which contains the song name playing after clicking next
            document.querySelector('.songInfo').innerText = currentLi.querySelector('.songName div').innerText  // updating song name in playbar
            document.querySelector('#playbtn').src = 'images/pausebtn.svg'  // changing play button to pause
        }
    });

    // Adding event listener on volume bar (input range) to update volume & bg color live
    let volumeBar = document.querySelector('#volume');  // getting access of input range (volume bar)
    volumeBar.addEventListener('input', () => {
        let percent3 = (volumeBar.value / volumeBar.max) * 100;  // finding out the position of the knob on the slider in percentage
        volumeBar.style.setProperty('--percent', `${percent3}%`);  // updating the bg color of the slider track according to the knob
        let inputValue = volumeBar.value;  // accessing the value of the input range which will control the song volume
        audio.volume = inputValue / 100;  // dividing the value by 100 as audio.volume accepts values between 0.0 (silent) and 1.0 (full volume) 

        if (audio.volume === 0) {  // if volume is 0 then change the volume icon to mute
            document.querySelector('.volume img').src = 'images/mute.svg';
        }
        else {  // if voume isn't 0 then change the mute icon to volume
            document.querySelector('.volume img').src = 'images/volume.svg';
        }
    });

    // Adding event listener on volume icon to mute the song
    document.querySelector('.volume>img').addEventListener('click', (event) => {
        if (event.target.src.includes('volume.svg')) {  // condition check weather song is unmuted
            // Mute
            event.target.src = 'images/mute.svg'  // changing volume icon to mute icon
            audio.volume = 0;  // turning volume to 0
            document.querySelector('#volume').value = 0  // making the knob in the volume slider go to 0
            document.querySelector('#volume').style.setProperty('--percent', `0%`)  // updating the bg color of the volume slider track
        }
        else {
            // Unmute
            event.target.src = 'images/volume.svg'
            audio.volume = 0.5
            document.querySelector('#volume').value = 50
            document.querySelector('#volume').style.setProperty('--percent', `50%`)
        }
    })
}

playSong();