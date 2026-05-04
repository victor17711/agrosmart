import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';

/**
 * Editor for home section tabs (BestSellers / FreshFinds).
 * Lets admin pick categories, reorder, set custom RO/RU labels.
 */
const HomeTabsEditor = ({
  title,
  subtitle,
  tabs = [],
  categories = [],
  onAdd,
  onRemove,
  onMove,
  onLabelChange,
  onSaveLabels,
  testIdPrefix
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const usedCategoryIds = new Set(tabs.map((t) => t.categoryId));
  const availableCategories = categories.filter((c) => !usedCategoryIds.has(c.id));

  const getCategory = (id) => categories.find((c) => c.id === id);

  const handleAdd = () => {
    if (selectedCategoryId) {
      onAdd(selectedCategoryId);
      setSelectedCategoryId('');
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>

      {/* Add new tab */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          data-testid={`${testIdPrefix}-add-select`}
        >
          <option value="">-- Selectează o categorie --</option>
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.nameRu ? ` (${c.nameRu})` : ''}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selectedCategoryId}
          className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid={`${testIdPrefix}-add-btn`}
        >
          <Plus className="w-5 h-5" />
          Adaugă Tab
        </button>
      </div>

      {/* List of tabs */}
      {tabs.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">Niciun tab configurat. Adaugă o categorie mai sus.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {tabs.map((tab, idx) => {
              const cat = getCategory(tab.categoryId);
              return (
                <div
                  key={tab.categoryId}
                  className="bg-white rounded-xl border-2 border-gray-200 p-4 flex flex-col lg:flex-row lg:items-center gap-3"
                  data-testid={`${testIdPrefix}-tab-${tab.categoryId}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="bg-teal-100 text-teal-700 font-bold text-sm rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {cat ? cat.name : '(Categorie inexistentă)'}
                      </div>
                      {cat?.nameRu && (
                        <div className="text-xs text-gray-500 truncate">{cat.nameRu}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    <input
                      type="text"
                      value={tab.label || ''}
                      placeholder={`Etichetă RO (implicit: ${cat?.name || ''})`}
                      onChange={(e) => onLabelChange(tab.categoryId, 'label', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    <input
                      type="text"
                      value={tab.labelRu || ''}
                      placeholder={`Etichetă RU (implicit: ${cat?.nameRu || cat?.name || ''})`}
                      onChange={(e) => onLabelChange(tab.categoryId, 'labelRu', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onMove(tab.categoryId, 'up')}
                      disabled={idx === 0}
                      className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mută sus"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onMove(tab.categoryId, 'down')}
                      disabled={idx === tabs.length - 1}
                      className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mută jos"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemove(tab.categoryId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Șterge tab"
                      data-testid={`${testIdPrefix}-remove-${tab.categoryId}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={onSaveLabels}
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition font-semibold text-sm"
              data-testid={`${testIdPrefix}-save-labels-btn`}
            >
              <Save className="w-4 h-4" />
              Salvează etichetele
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeTabsEditor;
