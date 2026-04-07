import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../services/authService";
import { getAllListings, createListing } from "../services/listingService";

function Listings({ filterCategory }) {
  const user = getCurrentUser();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(filterCategory || "resource");
  const [ownerContact, setOwnerContact] = useState("");

  useEffect(() => {
    if (filterCategory) {
      setCategory(filterCategory);
    }
  }, [filterCategory]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAllListings()
      .then((data) => {
        if (isMounted) setListings(data);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setError("Failed to load listings");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createListing({ title, description, category, ownerContact });
      // Refresh after create.
      const data = await getAllListings();
      setListings(data);

      setTitle("");
      setDescription("");
      setCategory("resource");
      setOwnerContact("");
    } catch (err) {
      console.error(err);
      setError("Failed to create listing");
    }
  };

  const cardStyle = {
    border: "1px solid #666",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    background: "#ffffff",
    color: "#000000",
  };

  const displayedListings = filterCategory
    ? listings.filter((l) => l.category === filterCategory)
    : listings;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Listings of Resources and Skills</h2>

      {/* Create listing form */}
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ marginBottom: 8 }}>Create a new listing</h4>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 4 }}>
              <label style={{ color: "#ffffff" }}>Title</label>
            </div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                color: "#000000",
                background: "#ffffff",
                border: "1px solid #ccc",
                borderRadius: 4
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 4 }}>
              <label style={{ color: "#ffffff" }}>Description</label>
            </div>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: 10,
                color: "#000000",
                background: "#ffffff",
                border: "1px solid #ccc",
                borderRadius: 4
              }}
            />
          </div>

          {!filterCategory && (
            <div style={{ marginBottom: 10 }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  color: "#000000",
                  background: "#ffffff",
                  border: "1px solid #ccc",
                  borderRadius: 4
                }}
              >
                <option value="resource">resource</option>
                <option value="skill">skill</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 4 }}>
              <label style={{ color: "#ffffff" }}>Your Contact Number</label>
            </div>
            <input
              type="text"
              placeholder="Your contact number"
              value={ownerContact}
              onChange={(e) => setOwnerContact(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                color: "#000000",
                background: "#ffffff",
                border: "1px solid #ccc",
                borderRadius: 4
              }}
            />
          </div>

          <button type="submit" style={{ padding: "10px 16px" }}>
            Create Listing
          </button>
        </form>
      </div>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {/* Listings */}
      <div>
        {loading ? (
          <p>Loading listings...</p>
        ) : displayedListings.length === 0 ? (
          <p>No listings yet.</p>
        ) : (
          displayedListings.map((l) => (
            <div key={l._id} style={cardStyle}>
              <h3 style={{ margin: "0 0 8px" }}>{l.title}</h3>
              <p style={{ margin: "0 0 8px" }}>{l.description}</p>
              <p style={{ margin: "0 0 6px" }}>
                <strong>Category:</strong> {l.category}
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong>Owner:</strong> {l.ownerName}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Availability:</strong>{" "}
                {l.availability ? "Available" : "Not available"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Listings;

