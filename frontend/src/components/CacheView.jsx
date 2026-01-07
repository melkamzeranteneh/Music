import React from 'react';
import { Music, ArrowRight } from 'lucide-react';

const CacheView = ({ cacheState, policy }) => {
    return (
        <section className="max-w-6xl mx-auto mb-12 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
                <img src="/src/images/Logo.png" alt="Logo" className="w-6 h-6 rounded" />
                <h2 className="text-xl font-semibold">Live Cache State ({policy})</h2>
                <span className="text-xs text-neutral-500 ml-auto">{cacheState.size || 0}/{cacheState.capacity || 0} items</span>
            </div>
            <div className="flex items-center gap-2 mb-6 text-yellow-400 text-xs">
                <span className="font-medium">Order:</span>
                <span>{cacheState.orderLabel || '—'}</span>
            </div>

            {cacheState.content.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                    Cache is empty. Play songs from the library to populate the cache.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {cacheState.content.map((track, index) => (
                        <div key={index} className="relative group bg-neutral-800 border border-neutral-700 p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                <img src="/src/images/Album.png" alt="Album" className="w-10 h-10 rounded-md object-cover" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold truncate mb-0.5">{track.track}</h3>
                                    <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CacheView;
