import { Capy } from "../types/Capy";

export function CapyItem({
  capy,
  selectedCapy,
  handleSelect,
}: {
  capy: Capy;
  selectedCapy: Capy | undefined;
  handleSelect: (capy: Capy) => void; // Updated parameter type
}) {
  return (
    <div className={`${selectedCapy ? 'bg-blue-300' : 'bg-blue-200'}
    ${selectedCapy ? 'opacity-50' : ''}
     w-24 h-24 flex flex-col gap-2 justify-center items-center cursor-pointer hover:bg-blue-300`}
      onClick={() => handleSelect(capy)}>
      <span className="text-md">
        {capy.name}
      </span>
      <span className="text-md">
        {capy.color}
      </span>
    </div>
  );
}
