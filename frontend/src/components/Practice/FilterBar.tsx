export default function FilterBar({ selectedDifficulty, setSelectedDifficulty }: any) {
  const levels = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="relative z-10 flex flex-wrap gap-3 mb-10 p-1.5 bg-[#0f0f11] border border-white/5 rounded-2xl w-fit shadow-2xl">
      {levels.map((level) => (
        <button
          key={level}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDifficulty(level);
          }}
          className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
            selectedDifficulty === level 
            ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]" 
            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}