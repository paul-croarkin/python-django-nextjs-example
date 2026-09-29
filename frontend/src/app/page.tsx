"use client";

import { FormEvent, useEffect, useState } from "react";

type Brewery = {
  id: string;
  name: string;
  brewery_type: string;
  city: string;
  state: string;
  country: string;
  website_url?: string;
  address_1?: string;
  phone?: string;
};

export default function Page() {
  const [query, setQuery] = useState("chicago");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Brewery[]>([]);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState("");

  const searchBreweries = async (event?: FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/breweries?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Request failed");
      }

      const payload = await response.json();
      setResults(payload.results ?? []);
      setCached(Boolean(payload.cached));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to search breweries");
      setResults([]);
      setCached(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void searchBreweries();
  }, []);

  return (
    <main>
      <header>
        <h1>Brewery Search</h1>
        <p className="subheader">Search the Open Brewery DB through a Django-powered BFF cache.</p>
      </header>

      <section className="search-panel">
        <form onSubmit={searchBreweries}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search breweries by city, name, or beer style"
            aria-label="Search breweries"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="status-row">
          <span className="badge">{cached ? "Cached" : "Fresh"}</span>
          <span>{results.length} results</span>
        </div>
      </section>

      {error ? <div className="empty-state">{error}</div> : null}

      {!loading && results.length === 0 && !error ? (
        <div className="empty-state">Try searching for something like “chicago”, “portland”, or “brewery”.</div>
      ) : null}

      <section className="grid">
        {results.map((brewery) => (
          <article key={brewery.id} className="card">
            <h2>{brewery.name}</h2>
            <p className="meta"><strong>Type:</strong> {brewery.brewery_type}</p>
            <p className="meta"><strong>Location:</strong> {brewery.city}, {brewery.state}</p>
            {brewery.address_1 ? <p className="meta"><strong>Address:</strong> {brewery.address_1}</p> : null}
            {brewery.phone ? <p className="meta"><strong>Phone:</strong> {brewery.phone}</p> : null}
            <p className="meta"><strong>Country:</strong> {brewery.country}</p>
            <div className="links">
              {brewery.website_url ? (
                <a href={brewery.website_url} target="_blank" rel="noreferrer" className="link-button">
                  Website
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
