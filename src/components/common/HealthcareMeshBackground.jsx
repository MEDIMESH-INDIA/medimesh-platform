import { motion } from "framer-motion";

export default function HealthcareMeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Animated Vertical Bars */}
      <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/10 to-transparent">
        <motion.div 
          className="absolute top-0 w-full h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 7, ease: "linear", repeat: Infinity }}
        />
      </div>
      <div className="absolute right-[25%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-secondary-accent/10 to-transparent">
        <motion.div 
          className="absolute top-0 w-full h-40 bg-gradient-to-b from-transparent via-secondary-accent/30 to-transparent"
          animate={{ top: ["110%", "-10%"] }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Subtle Floating Nodes */}
      <motion.div 
        className="absolute top-[30%] left-[20%] w-2 h-2 rounded-full bg-primary/20 blur-[1px]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[40%] right-[30%] w-1.5 h-1.5 rounded-full bg-secondary-accent/20 blur-[1px]"
        animate={{ scale: [1, 2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Subtle Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-accent/5 blur-3xl mix-blend-multiply"></div>
    </div>
  );
}
