import React from 'react';
import { Block } from "../types/Block";

interface BlockItemProps {
  block: Block;
  selectedId?: number;
  isStackMode: boolean;
  handleSelect: (block: Block) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({ block, selectedId, isStackMode, handleSelect }) => {
  return (
    <div
      className={`cursor-pointer border-2 p-2 rounded-md ${
        selectedId === block.id ? 'border-blue-500' : 'border-gray-300'
      }`}
      onClick={() => handleSelect(block)}
    >
      <img src={block.token_uri} alt={block.name} className="w-32 h-32 object-cover" />
      {/* <p className="mt-2 text-center">{block.name}</p> */}
      <p className="text-sm text-center text-gray-500">Type: {block.type}</p>
      <p className="text-sm text-center text-gray-500">Count: {block.count}</p>
    </div>
  );
};
