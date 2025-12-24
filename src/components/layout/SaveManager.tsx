import { useState } from 'react';
import { useGame } from '../../game/state/GameContext';

export function SaveManager() {
  const { state, dispatch } = useGame();
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    try {
      const saveData = JSON.stringify(state, null, 2);
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pandactory-save-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export save:', e);
      alert('Failed to export save file. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const saveData = JSON.stringify(state);
      await navigator.clipboard.writeText(saveData);
      alert('Save data copied to clipboard!');
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      alert('Failed to copy to clipboard. Please try the download option instead.');
    }
  };

  const handleImport = () => {
    try {
      setImportError('');
      const parsedData = JSON.parse(importText);

      // Comprehensive validation
      if (!parsedData.player || !parsedData.biomes || !parsedData.version) {
        setImportError('Invalid save file format. Please check your save data.');
        return;
      }

      // Validate structure to prevent malformed data
      if (typeof parsedData.player.name !== 'string' ||
          typeof parsedData.player.currentBiome !== 'string') {
        setImportError('Invalid player data in save file.');
        return;
      }

      // Validate biomes structure
      const validBiomes = ['lush_forest', 'misty_lake', 'arid_desert', 'frozen_tundra', 'volcanic_isle', 'crystal_caverns'];
      for (const biomeId of Object.keys(parsedData.biomes)) {
        if (!validBiomes.includes(biomeId)) {
          setImportError(`Invalid biome "${biomeId}" in save file.`);
          return;
        }
      }

      // Validate prestige structure
      if (parsedData.prestige) {
        if (typeof parsedData.prestige.cosmicBambooShards !== 'number' ||
            typeof parsedData.prestige.totalPrestiges !== 'number' ||
            !Array.isArray(parsedData.prestige.unlockedSkills)) {
          setImportError('Invalid prestige data in save file.');
          return;
        }
      }

      // Sanitize numeric values to prevent NaN/Infinity
      if (parsedData.food) {
        for (const [key, value] of Object.entries(parsedData.food)) {
          if (typeof value !== 'number' || !isFinite(value as number)) {
            parsedData.food[key] = 0;
          }
        }
      }

      // Confirm before importing
      if (!window.confirm('This will replace your current save. Are you sure?')) {
        return;
      }

      // Load the save
      dispatch({ type: 'LOAD_GAME', payload: { gameState: parsedData } });

      // Save to localStorage
      localStorage.setItem('pandactory-save', JSON.stringify(parsedData));

      alert('Save loaded successfully! Reloading page...');
      window.location.reload();
    } catch (e) {
      console.error('Failed to import save:', e);
      setImportError('Failed to parse save data. Please check the format and try again.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
      setShowImport(true);
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/30 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-400">Save Management</h2>

      {/* Export Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500">Export Save</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-1.5 px-3 rounded text-sm transition-all active:scale-95"
          >
            📥 Download
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-1.5 px-3 rounded text-sm transition-all active:scale-95"
          >
            📋 Copy
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Backup or transfer your save
        </p>
      </div>

      {/* Import Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500">Import Save</h3>
        <div className="flex gap-2">
          <label className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-1.5 px-3 rounded text-sm transition-all cursor-pointer text-center">
            📤 Upload
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowImport(!showImport)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-1.5 px-3 rounded text-sm transition-all active:scale-95"
          >
            ✏️ Paste
          </button>
        </div>

        {showImport && (
          <div className="space-y-2">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your save data here..."
              className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded p-2 text-white text-xs font-mono resize-none"
            />
            {importError && (
              <p className="text-xs text-red-400">{importError}</p>
            )}
            <button
              onClick={handleImport}
              disabled={!importText}
              className={`w-full py-1.5 px-3 rounded text-sm transition-all ${
                importText
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 active:scale-95'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              Import Save
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500">
          ⚠️ Importing replaces current save
        </p>
      </div>
    </div>
  );
}
