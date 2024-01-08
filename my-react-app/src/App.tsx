// import React, { useState, useEffect } from 'react';

// import './SpotifyStats.css'; 

// const SpotifyStats = () => {
//   const [userData, setUserData] = useState(null);
//   const [token, setToken] = useState("");
//   const CLIENT_ID = "7e27121372814c369c31900edfa5dc49";
//   const REDIRECT_URI = "http://localhost:3000";
//   const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
//   const RESPONSE_TYPE = "token";
//   const [searchKey, setSearchKey] = useState("");
//   const [artists, setArtists] = useState<any[]>([]);

//   async function searchArtists(e: { preventDefault: () => void; }) {
//     e.preventDefault();

//     const urlParams = new URLSearchParams();
//     urlParams.set("q", searchKey);
//     urlParams.set("type", "artist");

//     const request = new Request(`https://api.spotify.com/v1/search?${urlParams}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const response = await fetch(request);
//     const data = await response.json();

//     setArtists(data.artists.items);
//   }

//   const renderArtists = () => {
//     const top5Artists = artists.slice(0, 5);
//     return top5Artists.map(artist => (
//       <div key={artist.id} className="artist-container">
//         {artist.images.length ? <img className="artist-image" src={artist.images[0].url} alt={artist.name} /> : <div className="no-image">No Image</div>}
//         <p className="artist-name">{artist.name}</p>
//       </div>
//     ));
//   }

//   useEffect(() => {
//     const hash = window.location.hash;
//     let token = window.localStorage.getItem("token");

//     if (!token && hash) {
//       const tokenParam = hash.substring(1).split('&').find((elem) =>
//         elem.startsWith("access_token")
//       );

//       if (tokenParam) {
//         token = tokenParam.split("=")[1] as string;
//         window.location.hash = "";
//         window.localStorage.setItem("token", token);
//       }
//     }

//     setToken(token || "");
//   }, []);

//   const logout = () => {
//     setToken("");
//     window.localStorage.removeItem("token");
//   }

//   return (
//     <div className="spotify-stats-container">
//       <h1 className="header">My Spotify Stats</h1>
//       {!token ?
//         <a className="login-button" href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
//         : <button className="logout-button" onClick={logout}>Logout</button>
//       }
//       {token ? 
//         <form onSubmit={searchArtists} className="search-form">
//           <input type="text" onChange={e => setSearchKey(e.target.value)} placeholder="Search for artists" />
//           <button type={"submit"}>Search</button>
//         </form> 
//         : <h2 className="login-prompt">Please log in</h2>
//       }
//       {token ? renderArtists() : null}
//       {userData ? (
//         <div>
//           {/* Display user data here */}
//         </div>
//       ) : (
//         <>
//           <h2 className="welcome-message">Welcome to Spotify Stats! View your top songs, artists, genres, and more!</h2>
//           <ul className="feature-list">
//             <li>Top Artist :</li>
//             <li>Top Song :</li>
//             <li>Top Genre :</li>
//           </ul>
//         </>
//       )}
//     </div>
//   );
// };

// export default SpotifyStats;

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface UserProfile {
  display_name: string;
  images: { url: string }[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    images: { url: string }[];
    // Add other properties as needed
  };
  artists: {
    name: string;
    // Add other properties as needed
  }[];
  // Add other properties as needed
}

const SpotifyStats = () => {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState("");
  const CLIENT_ID = "7e27121372814c369c31900edfa5dc49"
  const CLIEND_SECRET = "ef83e937f6a448cc94142478de6b2575";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const TRACKS_ENDPOINT = "https://api.spotify.com/v1/me/top/tracks";
  const ARTISTS_ENDPOINT = "https://api.spotify.com/v1/me/top/artists";
  const PLAYLISTS_ENDPOINT = "https://api.spotify.com/v1/me/playlists";
  const PROFILE_ENDPOINT = "https://api.spotify.com/v1/me";
  const RESPONSE_TYPE = "token";
  const [searchKey, setSearchKey] = useState("");
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [artists, setArtists] = useState<{ items: { name: string; images: { url: string }[]; popularity: number }[] }>({ items: [] });
  const [tracks, setTracks] = useState<{ items: SpotifyTrack[] }>({ items: [] });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('search');
  const scopes = ['user-top-read', 'user-read-currently-playing'];

  const getData =  async(endpoint: string, setFunction: (data: any) => void) =>  {
    console.log(localStorage.getItem("token"))
    await axios.get(endpoint, {
      headers:{
        'Authorization':`Bearer ${localStorage.getItem("token")}`
      }
    }).then(
      response => {
        setFunction(response.data)
        console.log(response.data)
      }
    ).catch(
      error => console.log(error)
    )
  }


  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");
  
    if (!token && hash) {
      const tokenParam = hash.substring(1).split('&').find((elem) =>
        elem.startsWith("access_token")
      );
  
      if (tokenParam) {
        token = tokenParam.split("=")[1] as string;
        window.location.hash = "";
        window.localStorage.setItem("token", token);
      }

      
    }
    handleTabChange('Account')
    getData(PROFILE_ENDPOINT,setProfile);
    getData(ARTISTS_ENDPOINT,setArtists);
    getData(TRACKS_ENDPOINT,setTracks);
    getData(PLAYLISTS_ENDPOINT,setPlaylists);
    
  
    setToken(token || "");
  }, []);

  // const searchArtists = async (e: FormEvent) => {
  //   e.preventDefault();
  
  //   const urlParams = new URLSearchParams();
  //   urlParams.set("q", searchKey);
  //   urlParams.set("type", "artist");
  
  //   const request = new Request(`https://api.spotify.com/v1/search?${urlParams}`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     }
  //   });
  
  //   const response = await fetch(request);
  //   const data = await response.json();
  
  //   setArtists(data.artists.items);
  // }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const logout = () => {
    setToken("");
    window.location.hash = "";
    window.localStorage.removeItem("token");
  }

  return (
    <div style={{ backgroundColor: '#000', width: '100%',minHeight: '100vh', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '20px', backgroundColor: '#000', borderRadius: '10px', marginTop: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#1DB954' }}>Statify</h1>
        {/* Login button always visible */}
        {!token ? (
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&client_secret=${CLIEND_SECRET}&redirect_uri=${REDIRECT_URI}&scope=${scopes}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
        ) : (
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-around', backgroundColor: '#333', padding: '10px', borderRadius: '5px' }}>
            <button onClick={() => handleTabChange('Account')} disabled={activeTab === 'Account'} style={{ backgroundColor: activeTab === 'Account' ? '#1DB954' : '#333', color: activeTab === 'Account' ? '#fff' : '#ccc', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Account
            </button>
            <button onClick={() => handleTabChange('TopSongs')} disabled={activeTab === 'TopSongs'} style={{ backgroundColor: activeTab === 'TopSongs' ? '#1DB954' : '#333', color: activeTab === 'TopSongs' ? '#fff' : '#ccc', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Top Songs
            </button>
            <button onClick={() => handleTabChange('TopArtists')} disabled={activeTab === 'TopArtists'} style={{ backgroundColor: activeTab === 'TopArtists' ? '#1DB954' : '#333', color: activeTab === 'TopArtists' ? '#fff' : '#ccc', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Top Artists
            </button>
            {/* <button onClick={() => handleTabChange('genres')} disabled={activeTab === 'genres'} style={{ backgroundColor: activeTab === 'genres' ? '#1DB954' : '#333', color: activeTab === 'genres' ? '#fff' : '#ccc', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Genre Statistics
            </button> */}
            {/* Add more buttons for additional tabs */}
          </div>
        )}
        

        {activeTab === 'Account' && (
  <div>
    {token && profile && profile.images[1] && (
      <div className="profile-name" style={{ textAlign: 'center' }}>
        <img
          src={profile.images[1].url}
          alt="profile img"
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>
    )}
    {token && profile && profile.display_name && (
      <div className="profile-name">
        <h1 style={{ color: '#fff' }}>{'Hey there ' + profile.display_name}</h1>
      </div>
    )}
  </div>
)}

{activeTab === 'TopSongs' && (
  <div>
    {tracks.items && tracks.items.length > 0 ? (
      <div className='tracks'>
        <h2 style={{ color: '#fff' }}>Top Tracks</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', width: '100%' }}>
          {tracks.items.map((track, index) => (
            <div key={index} className='track' style={{ textAlign: 'center', color: '#fff' }}>
              <img src={track.album.images[0].url} alt='album img' style={{ width: '100%', borderRadius: '8px' }} />
              <h2 style={{ marginTop: '8px', marginBottom: '4px', fontSize: '14px', color: '#fff' }}>{track.name}</h2>
              <h3 style={{ fontSize: '12px', color: '#888' }}>{track.artists[0].name}</h3>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <h2 style={{ color: '#fff' }}>You have no top tracks at the moment.</h2>
    )}
  </div>
)}

{activeTab === 'TopArtists' && (
  <div>
    {artists.items && artists.items.length > 0 ? (
      <div className='tracks'>
        <h2 style={{ color: '#fff' }}>Top Artists</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', width: '100%' }}>
          {artists.items.map((artist, index) => (
            <div key={index} className='track' style={{ textAlign: 'center', color: '#fff' }}>
              <img src={artist.images[0].url} alt='artist img' style={{ width: '100%', borderRadius: '8px' }} />
              <h2 style={{ marginTop: '8px', marginBottom: '4px', fontSize: '14px', color: '#fff' }}>{artist.name}</h2>
              <h3 style={{ fontSize: '12px', color: '#888' }}>{artist.popularity}</h3>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <h2 style={{ color: '#fff' }}>You have no top artists at the moment.</h2>
    )}
  </div>
)}

        {/* {activeTab === '' && (
         <div>
         {token &&profile && profile.images[0] &&(
           <div className="profile-name">
             <img src={profile.images[0].url}/>
           </div>
         )}
         {token && profile && profile.display_name  &&(
           <div className="profile-name">
             <h1 style={{ color: '#fff' }}>{'Hey there ' + profile.display_name}</h1>
           </div>
         )}
       </div>
        )} */}

        {/* ... (other tab contents) */}

        {/* Logout button */}
        {token && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={logout} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff', color: '#333' }}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyStats;