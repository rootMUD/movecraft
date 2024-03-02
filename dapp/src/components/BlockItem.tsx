import { useState } from "react";
import { Block } from "../types/Block";

export function BlockItem({
  block,
  selectedId,
  isStackMode,
  handleSelect,
}: {
  block: Block;
  selectedId: number | undefined;
  isStackMode: boolean;
  handleSelect: (_id: number) => void;
}) {
  return (
    <div className={`${selectedId == block.id ? 'bg-blue-300' : 'bg-blue-200'}
    ${selectedId == block.id && isStackMode ? 'opacity-50' : ''}
     w-24 h-24 flex flex-col gap-2 justify-center items-center cursor-pointer hover:bg-blue-300`}
      onClick={() => handleSelect(block.id)}>
      <span className="text-md">
        {block.name}
      </span>
      <p className="text-sm">
        Count:&nbsp;
        <b>{block.count}</b>
      </p>
    </div>
  );
}
