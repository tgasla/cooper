function Header() {
  return (
    <header className="bg-zinc-900/50 border-b border-zinc-800/60 backdrop-blur-sm">
      <div className="px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium text-zinc-300">
            cloudsimplus
            <span className="text-zinc-500 ml-1.5">visualizer</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/doylemark/cooper"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-6 px-2 text-xs font-medium text-zinc-400 rounded-md hover:text-zinc-200 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
