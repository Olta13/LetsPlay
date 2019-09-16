const clientId = '9f88251b18ba4c0fb868291c8a5a7d35';
const redirectUri = 'http://localhost:3000';
let accessToken;

const Spotify = {
    // 78.create a method called getAccessToken. 
    // Check if the user’s access token is already set.
    // If it is, return the value saved to access token.
    getAccessToken(){
        if(accessToken){
            return accessToken;
        }
        // check for access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if(accessTokenMatch && expiresInMatch){
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);

            // This clears the parameters, allowing us to grab a new access token when it expires.
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } // Interpolate your client ID and redirect URI variables In place of CLIENT_ID and REDIRECT_URI.
        else {
            const accessUrl =`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }
    },


    //Implement Spotify Search Request
    search(term){
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            return response.json();
        }).then(jsonResponse => {
            if(!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        });
    },

    //90.Create a method in Spotify.js that accepts two arguments

    savePlaylist(name, trackUris){
        if(!name || !trackUris.length){
            return;
        }

        //91.Create three default variables:
        const accessToken= Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userId;
        
        //92.Make a request that returns the user’s Spotify username.
        return fetch('https://api.spotify.com/v1/me', { headers:headers }
        ).then((response) => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id; 
            //93.Use the returned user ID to make a POST request
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlist`,
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name:name})
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                //94.Use the returned user ID to make a POST request
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
                {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris : trackUris})
                })
            })
        })
    }
}

export default Spotify;
