import React from 'react';
import { 
  Database, 
  Cpu, 
  Code, 
  Rocket, 
  Layers 
} from 'lucide-react';

const HeroStrip = () => {
  const techIcons = [
    { Icon: Database, color: "text-blue-600", name: "MySQL" },
    { Icon: Cpu, color: "text-green-600", name: "React" },
    { Icon: Code, color: "text-orange-600", name: "JavaScript" },
    { Icon: Rocket, color: "text-purple-600", name: "Node.js" },
    { Icon: Layers, color: "text-red-600", name: "Docker" }
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-t from-pink-300 to-purple-500">
      <div className="
        flex 
        flex-row 
        items-center 
        justify-center 
        py-4 
        px-4 
        space-x-4 
        max-w-4xl 
        mx-auto
        gap-8
      ">
        {techIcons.map(({ Icon, color, name }, index) => (
          <div 
            key={name}
            className={`
              ${color} 
              animate-spin-slow
              flex flex-col items-center justify-center 
              w-16 h-16 rounded-full 
              bg-white/20 backdrop-blur-sm 
              shadow-md cursor-pointer 
              group relative flex-shrink-0
              transform transition-transform duration-300 
              hover:scale-105
            `}
          >
            <Icon size={32} strokeWidth={1.5} />
            <span 
              className="
                absolute bottom-[-16px] 
                text-[10px] text-white 
                opacity-0 group-hover:opacity-100 
                transition-opacity duration-300
                text-center
                w-full
              "
            >
              {name}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-purple-500/30"></div>
    </div>
  );
};

export default HeroStrip;
