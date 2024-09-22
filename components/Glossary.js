import React, { useState } from 'react';
import { ITEMS, MAP_ITEM } from '../constants';
import Image from 'next/image';

const GlossaryItem = ({ item, onMouseEnter, onMouseLeave, onMouseMove }) => (
  <div 
    className="glossary-item relative w-14 h-14 p-0 select-none"
    onMouseEnter={(e) => onMouseEnter(e, item)}
    onMouseLeave={onMouseLeave}
    onMouseMove={(e) => onMouseMove(e, item)}
  >
    <div 
      className="w-full h-full"
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: item.rarity.color
      }}
    >
      <div className="w-full h-full relative">
        <Image
          src={`/assets/${item.id}.png`}
          alt={item.name}
          layout="fill"
          objectFit="contain"
        />
      </div>
    </div>
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