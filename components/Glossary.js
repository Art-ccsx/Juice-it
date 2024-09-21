import React, { useState } from 'react';
import { ITEMS, MAP_ITEM } from '../constants';

const GlossaryItem = ({ item, onMouseEnter, onMouseLeave, onMouseMove }) => (
  <div 
    className="glossary-item"
    onMouseEnter={(e) => onMouseEnter(e, item)}
    onMouseLeave={onMouseLeave}
    onMouseMove={(e) => onMouseMove(e, item)}
  >
    <svg width="100%" height="100%" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: item.shape }} />
  </div>
);

const Glossary = ({ onMouseEnter, onMouseLeave, onMouseMove, discoveredItems }) => {
  const [showOnlyDiscovered, setShowOnlyDiscovered] = useState(false);
  const allItems = [...ITEMS, MAP_ITEM];

  const filteredItems = showOnlyDiscovered
    ? allItems.filter(item => discoveredItems.has(item.id))
    : allItems;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">Glossary</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showOnlyDiscovered}
            onChange={() => setShowOnlyDiscovered(!showOnlyDiscovered)}
            className="mr-2"
          />
          Show Only Discovered
        </label>
      </div>
      <div className="glossary-grid">
        {filteredItems.map((item) => (
          <GlossaryItem
            key={item.id}
            item={item}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
          />
        ))}
      </div>
    </div>
  );
};

export default Glossary;