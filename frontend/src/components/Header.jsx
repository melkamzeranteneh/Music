import React from 'react';
import { Filter } from 'lucide-react';

const Header = ({ policy, changePolicy, selectedGenre, setSelectedGenre, genres }) => {
    return (
        <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-800 pb-8">
            <div className="flex items-center gap-3">
                <img src="/src/images/Logo.png" alt="Logo" className="w-8 h-8" />
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-2">
                        Cache Exploration Demo
                    </h1>
                    <p className="text-neutral-400 text-sm">Interaction with the music library demonstrates cache hits vs misses.</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                    {['FIFO', 'LRU', 'LFU'].map(p => (
                        <button
                            key={p}
                            onClick={() => changePolicy(p)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${policy === p
                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20'
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
    );
};

export default Header;
