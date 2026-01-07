import React from 'react';
import { Play, Loader2 } from 'lucide-react';

const TrackCard = ({ track, onPlay, isLoading }) => {
    return (
        <div
            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 transition-all"
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">{track.genre}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
                <img src="/src/images/Album.png" alt="Album" className="w-12 h-12 rounded-md object-cover" />
                <div className="min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1">{track.track}</h3>
                    <p className="text-neutral-400 text-xs">{track.artist}</p>
                </div>
            </div>

            <button
                onClick={() => onPlay(track)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-yellow-500 text-black text-xs font-medium hover:bg-yellow-400 transition-all"
            >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                <span>Play Live</span>
            </button>
        </div>
    );
};

export default TrackCard;
