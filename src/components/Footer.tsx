'use client';

/**
 * Footer component
 */



export function Footer() {

  return (
    <footer className="mt-6 pt-6 text-center space-y-2 animate-fade-in delay-300 relative">

      <p className="text-xs text-zinc-600">
        Updates every 15s
      </p>
      <p className="text-xs text-zinc-500">
        Made with{' '}
        <span className="text-red-400">♥</span>{' '}
        for{' '}
        <a
          href="https://twitch.tv/quin69"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          Quin69&apos;s
        </a>{' '}
        community • by{' '}
        <a
          href="https://github.com/mihaissh/quin69-playlist-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          mihaissh
        </a>
      </p>
    </footer>
  );
}

