import React from 'react';
import { Capy } from "../types/Capy";
import { FaPlay } from 'react-icons/fa';

interface CapyItemProps {
  capy: Capy;
  selectedCapy: Capy | undefined;
  handleSelect: (capy: Capy) => void;
  handlePlay: (capy: Capy) => void;
}

export const CapyItem: React.FC<CapyItemProps> = ({
  capy,
  selectedCapy,
  handleSelect,
  handlePlay,
}) => {
  console.log("capy", capy);
  return (
    <div
      className={`relative border rounded-lg p-4 cursor-pointer border-blue-500`}
      onClick={() => handleSelect(capy)}
    >
      <span className="text-md font-semibold">{capy.name}</span>
      <span className="text-sm text-gray-500 mt-2 overflow-hidden text-ellipsis">
        {capy.description}
      </span>
      <iframe
        src={`${capy.voxel_uri}`}
        title={`Voxel for ${capy.name}`}
        className="w-full h-40 border-0"
        sandbox="allow-scripts"
      />
      
      <button
        className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the parent div's onClick
          handlePlay(capy);
        }}
      >
        <FaPlay className="h-5 w-5" />
      </button>
    </div>
  );
};
