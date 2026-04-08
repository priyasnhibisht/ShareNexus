import { useEffect, useState } from "react";
import {
  getListings,
  getMyListings,   // ✅ NEW
  createListing,
  deleteListing,
} from "../services/listingService";
import "./Listings.css";

function Listings({ category }) {
  const [listings, setListings] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ FETCH ONLY USER LISTINGS
  const fetchListings = async () => {
    try {
      console.log('fetchListings: user from localStorage:', user);
      const data = await getMyListings(); // ✅ IMPORTANT FIX
      console.log('fetchListings: received data from getMyListings:', data);

      const filtered = data.filter(
        (item) => item.category === category
      );
      console.log('fetchListings: filtered listings for category', category, ':', filtered);

      setListings(filtered);
    } catch (err) {
      console.error("Error fetching listings", err);
      setError("Error fetching listings: " + (err.message || JSON.stringify(err)));
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchListings();
  }, [category]);

  // ✅ CREATE
  const handleCreate = async () => {
    if (!title || !description ) {
      setError("All fields required");
      return;
    }

    try {
      await createListing({
        title,
        description,
        category,
        ownerName: user.name,
        ownerId: user._id,
      });

      setTitle("");
      setDescription("");
      setError("");

      fetchListings();
    } catch (err) {
      console.log(err);
      setError("Error creating listing");
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      await deleteListing(id); // ✅ userId already handled in service
      fetchListings();
    } catch (err) {
      console.log(err);
      setError("Failed to delete listing");
    }
  };

  return (
    <div className="listings-container">

      {/* ✅ CREATE FORM */}
      <div className="form-card">
        <h2>Create Listing ✨</h2>

        <label>Title</label>
        <input
          placeholder="e.g. Data Structures Notes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Description</label>
        <textarea
          placeholder="Explain what you are offering..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />


        <button onClick={handleCreate}>Create Listing</button>

        {error && <p className="error">{error}</p>}
      </div>

      {/* ✅ USER LISTINGS */}
      <div className="list-card">
        <h2>Your Listings</h2>

        {listings.length === 0 ? (
          <p>No listings yet.</p>
        ) : (
          listings.map((item) => (
            <div key={item._id} className="listing-item">

              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <span className="badge">{item.category}</span>

              <p><b>{item.ownerName}</b></p>

              {/* ✅ DELETE ONLY IF OWNER */}
              {user && (user._id || user.id) === (item.owner?._id || item.owner?.toString()) && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Listings;