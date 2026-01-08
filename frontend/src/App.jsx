import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CacheView from './components/CacheView';
import MusicLibrary from './components/MusicLibrary';

const App = () => {
    const [tracks, setTracks] = useState([]);
    const [cacheState, setCacheState] = useState({ content: [] });
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});
    const [policy, setPolicy] = useState('LRU');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [userId] = useState(() => `user-${Math.floor(Math.random() * 1000)}`);

    const API_BASE = 'http://localhost:3002';

    useEffect(() => {
        // Fetch all music from DB
        fetch(`${API_BASE}/music`)
            .then(res => res.json())
            .then(data => setTracks(data))
            .catch(err => console.error('Failed to fetch music', err));

        // Fetch current policy
        fetch(`${API_BASE}/policy`)
            .then(res => res.json())
            .then(data => setPolicy(data.policy))
            .catch(err => console.error('Failed to fetch policy', err));

        // Fetch initial cache state
        fetch(`${API_BASE}/cache/state`)
            .then(res => res.json())
            .then(data => setCacheState(data))
            .catch(err => console.error('Failed to fetch cache state', err));
    }, []);

    const pollCacheState = () => {
        fetch(`${API_BASE}/cache/state`)
            .then(res => res.json())
            .then(data => setCacheState(data))
            .catch(err => console.error('Failed to fetch cache state', err));
    };

    const changePolicy = async (newPolicy) => {
        try {
            await fetch(`${API_BASE}/policy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ policy: newPolicy })
            });
            setPolicy(newPolicy);
            pollCacheState(); // Refresh cache view on policy change
        } catch (err) {
            console.error('Failed to change policy', err);
        }
    };

    const handlePlay = async (track) => {
        const trackId = track.id || track._id;
        setLoading(prev => ({ ...prev, [trackId]: true }));

        const start = performance.now();
        try {
            const response = await fetch(`${API_BASE}/play/${trackId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({
                    artist: track.artist,
                    track: track.track,
                    genre: track.genre
                })
            });

            const data = await response.json();
            const end = performance.now();
            const duration = Math.round(end - start);

            if (response.status === 429) {
                alert(data.error);
                return;
            }

            setResults(prev => ({
                ...prev,
                [trackId]: {
                    status: data.status,
                    latency: duration
                }
            }));
            pollCacheState(); // Refresh cache view after play
        } catch (err) {
            console.error('Playback failed', err);
        } finally {
            setLoading(prev => ({ ...prev, [trackId]: false }));
        }
    };

    const genres = ['All', ...new Set(tracks.map(t => t.genre))];
    const filteredTracks = selectedGenre === 'All'
        ? tracks
        : tracks.filter(t => t.genre === selectedGenre);

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
            <Header
                policy={policy}
                changePolicy={changePolicy}
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                genres={genres}
            />

            <CacheView cacheState={cacheState} policy={policy} />

            <MusicLibrary
                tracks={filteredTracks}
                onPlay={handlePlay}
                loading={loading}
            />

            <footer className="mt-20 border-t border-neutral-900 py-8 text-center text-neutral-600 text-[10px]">
                <p>Backend: {API_BASE} | JSON Database Enabled | Terminal Logs provide deep cache traces</p>
            </footer>
        </div>
    );
};

export default App;
