import React, { useState, useEffect } from 'react';
import { Play, Loader2, Music, Filter, Star, X } from 'lucide-react';

const App = () => {
    const [tracks, setTracks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});
    const [policy, setPolicy] = useState('LRU');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [userId] = useState(() => `user - ${Math.floor(Math.random() * 1000)} `);

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
    }, []);

    const changePolicy = async (newPolicy) => {
        try {
            await fetch(`${API_BASE}/policy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ policy: newPolicy })
            });
            setPolicy(newPolicy);
        } catch (err) {
            console.error('Failed to change policy', err);
        }
    };

    const handlePlay = async (track) => {
        const trackId = track.id || track._id;
        setLoading(prev => ({ ...prev, [trackId]: true }));

        const start = performance.now();
        try {
            const response = await fetch(`${API_BASE}/play`, {
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
        } catch (err) {
            console.error('Playback failed', err);
        } finally {
            setLoading(prev => ({ ...prev, [trackId]: false }));
        }
    };

    const toggleFavorite = (track) => {
        const isFav = favorites.some(f => f.id === track.id);
        if (isFav) {
            setFavorites(favorites.filter(f => f.id !== track.id));
        } else {
            if (favorites.length < 5) {
                setFavorites([...favorites, track]);
            } else {
                alert("Favorites bar is restricted to 5 songs to focus on caching behavior.");
            }
        }
    };

    const genres = ['All', ...new Set(tracks.map(t => t.genre))];
    const filteredTracks = selectedGenre === 'All'
        ? tracks
        : tracks.filter(t => t.genre === selectedGenre);

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
            <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-800 pb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                        Cache Exploration Demo
                    </h1>
                    <p className="text-neutral-400 text-sm">Interaction with Favorites bar demonstrates cache hits vs misses.</p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                        {['FIFO', 'LRU', 'LFU'].map(p => (
                            <button
                                key={p}
                                onClick={() => changePolicy(p)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${policy === p
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800">
                        <Filter className="w-4 h-4 text-neutral-500" />
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="bg-transparent text-sm focus:outline-none"
                        >
                            {genres.map(g => <option key={g} value={g} className="bg-neutral-900">{g}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {/* Favorites Bar */}
            <section className="max-w-6xl mx-auto mb-12 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-xl font-semibold">Testing Deck (Favorites)</h2>
                    <span className="text-xs text-neutral-500 ml-auto">{favorites.length}/5 tracks</span>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                        Add songs from the library below to start testing the cache.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {favorites.map(track => (
                            <div key={track.id} className="relative group bg-neutral-800 border border-neutral-700 p-4 rounded-xl hover:border-purple-500/50 transition-all">
                                <button
                                    onClick={() => toggleFavorite(track)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <div className="text-center">
                                    <h3 className="text-sm font-bold truncate mb-1">{track.track}</h3>
                                    <p className="text-[10px] text-neutral-400 truncate mb-4">{track.artist}</p>

                                    <button
                                        onClick={() => handlePlay(track)}
                                        disabled={loading[track.id]}
                                        className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all"
                                    >
                                        {loading[track.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                                        <span>Test Port</span>
                                    </button>

                                    {results[track.id] && (
                                        <div className={`mt-2 text-[10px] font-bold ${results[track.id].status === 'HIT' ? 'text-green-400' : 'text-neutral-500'}`}>
                                            {results[track.id].status} ({results[track.id].latency}ms)
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <main className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Music className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-semibold">Music Library</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredTracks.map(track => (
                        <div
                            key={track.id}
                            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">{track.genre}</span>
                                <button
                                    onClick={() => toggleFavorite(track)}
                                    className={`p-1.5 rounded-lg transition-colors ${favorites.some(f => f.id === track.id)
                                        ? 'bg-yellow-500/10 text-yellow-500'
                                        : 'bg-neutral-800 text-neutral-600 hover:text-yellow-500'
                                        }`}
                                >
                                    <Star className={`w-4 h-4 ${favorites.some(f => f.id === track.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-1 mb-1">{track.track}</h3>
                            <p className="text-neutral-400 text-xs mb-4">{track.artist}</p>

                            <button
                                onClick={() => handlePlay(track)}
                                disabled={loading[track.id]}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-medium hover:bg-neutral-700 transition-all"
                            >
                                {loading[track.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                                <span>Play Live</span>
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="mt-20 border-t border-neutral-900 py-8 text-center text-neutral-600 text-[10px]">
                <p>Backend: {API_BASE} | JSON Database Enabled | Terminal Logs provide deep cache traces</p>
            </footer>
        </div>
    );
};

export default App;
