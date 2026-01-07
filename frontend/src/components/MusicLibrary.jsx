import React from 'react';
import { Music } from 'lucide-react';
import TrackCard from './TrackCard';

const MusicLibrary = ({ tracks, onPlay, loading }) => {
    return (
        <main className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Music className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold">Music Library</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tracks.map(track => (
                    <TrackCard
                        key={track.id}
                        track={track}
                        onPlay={onPlay}
                        isLoading={loading[track.id]}
                    />
                ))}
            </div>
        </main>
    );
};

export default MusicLibrary;
