import React from 'react';
import { Capy } from "../types/Capy";
import { FaPlay } from 'react-icons/fa';

interface CapyItemProps {
  capy: Capy;
  selectedCapy: Capy | undefined;
  handleSelect: (capy: Capy) => void;
  handlePlay: (capy: Capy) => void;
}

export const MusicItem: React.FC<CapyItemProps> = ({
  capy,
  selectedCapy,
  handleSelect,
  handlePlay,
}) => {
  console.log("music", capy);
  return (
    <div
      className={`relative border rounded-lg p-4 cursor-pointer border-blue-500`}
      onClick={() => handleSelect(capy)}
    >
      <span className="text-md font-semibold">{capy.name}</span>
      <br></br>
      <span className="text-sm text-gray-500 mt-2 overflow-hidden text-ellipsis">
        {capy.description}
      </span>
      <br></br>
      <br></br>
      <br></br>
      <a href={`https://roguelike.rootmud.xyz/?music=${encodeURIComponent(capy.properties.audio_uri)}`} target="_blank" rel="noopener noreferrer">
        <button
          className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-600 transition duration-150 ease-in-out flex items-center space-x-1"
        >
          <FaPlay className="w-3 h-3" />
          <span>Play</span>
        </button>
      </a>
    </div>
  );
};
