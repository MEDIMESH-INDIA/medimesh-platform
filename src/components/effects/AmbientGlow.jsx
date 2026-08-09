import { motion } from "framer-motion";

export default function AmbientGlow({ variant = "default" }) {
  let glows = [];

  if (variant === "hero") {
    glows = [
      { top: "-10%", left: "-10%", color: "bg-primary/10", size: "w-[50%] h-[50%]" },
      { bottom: "-20%", right: "-10%", color: "bg-secondary-accent/5", size: "w-[60%] h-[60%]" },
    ];
  } else if (variant === "cta") {
    glows = [
      { top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "bg-primary/5", size: "w-[80%] h-[80%]" },
    ];
  } else {
    glows = [
      { top: "10%", right: "10%", color: "bg-primary/5", size: "w-96 h-96" },
      { bottom: "10%", left: "10%", color: "bg-secondary-accent/5", size: "w-96 h-96" },
    ];
  }

  return (
    <div className="absolute inset-0 pointer-events-none -z-30 overflow-hidden">
      {glows.map((glow, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl mix-blend-multiply ${glow.color} ${glow.size}`}
          style={{ 
            top: glow.top, 
            left: glow.left, 
            right: glow.right, 
            bottom: glow.bottom,
            transform: glow.transform 
          }}
          animate={{ 
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            duration: 8 + i * 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      ))}
    </div>
  );
}
