export default function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Engineering notebook graph paper - horizontal and vertical lines */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(10, 122, 106, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 122, 106, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Faint subtle secondary grid for more detail (optional) */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(10, 122, 106, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 122, 106, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px'
        }}
      />
      
      {/* Slight edge fade so the grid doesn't cut off abruptly */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_60%,rgba(253,251,247,0.8)_100%)]" />
    </div>
  );
}
