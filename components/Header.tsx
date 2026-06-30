type HeaderProps = {
  youtubeConnected: boolean;
};

export function Header({ youtubeConnected }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Source-based shorts workflow</p>
        <h1>News Shorts Studio</h1>
      </div>
      <a className="googleButton" href="/api/auth/google/start">
        {youtubeConnected ? "Google 연결됨" : "Sign in with Google"}
      </a>
    </header>
  );
}
