import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../services/authService";
import { getListings } from "../services/listingService";
import {
  sendRequest,
  getReceivedRequests,
  approveRequest,
  rejectRequest,
  getContact,
  getSentRequests,
} from "../services/requestService";
import { getCoins, tipCoins } from "../services/coinService";

import "./Requests.css";

function Requests() {
  const user = useMemo(() => getCurrentUser(), []);

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [userCoins, setUserCoins] = useState(user?.coins || 0);

  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [section1Message, setSection1Message] = useState("");
  const [section1Error, setSection1Error] = useState("");

  const [section2Error, setSection2Error] = useState("");
  const [contactByRequestId, setContactByRequestId] = useState({});

  // 🔍 FILTER & SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // count how many filters are active (for badge)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== "all") count++;
    if (selectedAvailability !== "all") count++;
    if (sortOrder !== "newest") count++;
    return count;
  }, [searchQuery, selectedCategory, selectedAvailability, sortOrder]);

  // clear every filter back to default
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAvailability("all");
    setSortOrder("newest");
  };

  // 🔍 DERIVED FILTERED + SORTED LISTINGS (never mutate original)
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // search — match title, description, or category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.category?.toLowerCase().includes(q)
      );
    }

    // category
    if (selectedCategory !== "all") {
      result = result.filter((l) => l.category === selectedCategory);
    }

    // availability
    if (selectedAvailability !== "all") {
      const isAvail = selectedAvailability === "available";
      result = result.filter((l) => l.availability === isAvail);
    }

    // sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "az":
          return (a.title || "").localeCompare(b.title || "");
        case "za":
          return (b.title || "").localeCompare(a.title || "");
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [listings, searchQuery, selectedCategory, selectedAvailability, sortOrder]);

  // ✅ RECEIVED
  const refreshMyRequests = async () => {
    try {
      console.log('refreshMyRequests: calling getReceivedRequests()');
      const data = await getReceivedRequests();
      console.log('refreshMyRequests: received data:', data);
      setRequests(data || []);
    } catch (err) {
      console.error('refreshMyRequests: error:', err);
      setRequests([]);
    }
  };

  // ✅ SENT
  const refreshSentRequests = async () => {
    try {
      console.log('refreshSentRequests: calling getSentRequests()');
      const data = await getSentRequests();
      console.log('refreshSentRequests: received data:', data);
      setSentRequests(data || []);
    } catch (err) {
      console.error('refreshSentRequests: error:', err);
      setSentRequests([]);
    }
  };

  // ✅ COINS
  const refreshCoins = async () => {
    try {
      const balance = await getCoins();
      setUserCoins(balance);
    } catch (err) {
      console.error("Failed to fetch coins", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) return;

    const loadAllData = async () => {
      try {
        // 🔹 Listings
        setLoadingListings(true);
        try {
          console.log('useEffect: loading listings');
          const listingsData = await getListings();
          console.log('useEffect: listings data:', listingsData);
          if (isMounted) setListings(listingsData || []);
        } catch (err) {
          console.error('useEffect: failed to load listings:', err);
          if (isMounted) setSection1Error("Failed to load listings");
        } finally {
          if (isMounted) setLoadingListings(false);
        }

        // 🔹 Requests (BOTH)
        setLoadingRequests(true);
        try {
          console.log('useEffect: loading requests');
          await Promise.all([refreshMyRequests(), refreshSentRequests()]);
          console.log('useEffect: requests loaded');
        } catch (err) {
          console.error('useEffect: failed to load requests:', err);
          if (isMounted) setSection2Error("Failed to load your requests");
        } finally {
          if (isMounted) setLoadingRequests(false);
        }

        // 🔹 Coins
        await refreshCoins();
      } catch (err) {
        console.error('useEffect: top-level catch:', err);
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) return <Navigate to="/" />;

  // ✅ SEND REQUEST
  const handleSendRequest = async (listing) => {
    setSection1Message("");
    setSection1Error("");

    const currentUserId = user._id || user.id;
    const ownerId = listing.owner?._id || listing.owner;
    if (currentUserId?.toString() === ownerId?.toString()) {
      setSection1Error("You cannot request your own resource ❌");
      return;
    }

    try {
      await sendRequest(listing._id);
      setSection1Message("Request sent successfully ✅");

      await refreshMyRequests();
      await refreshSentRequests(); // ✅ FIX
    } catch (err) {
      console.log(err);
      setSection1Error("Failed to send request ❌");
    }
  };

  // ✅ APPROVE
  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId);

      await refreshMyRequests();
      await refreshSentRequests(); // ✅ FIX
    } catch {
      setSection2Error("Failed to approve request");
    }
  };

  // ✅ REJECT
  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId);

      await refreshMyRequests();
      await refreshSentRequests(); // ✅ FIX
    } catch {
      setSection2Error("Failed to reject request");
    }
  };

  // ✅ GET CONTACT
  const handleGetContact = async (requestId) => {
    try {
      const data = await getContact(requestId);
      setContactByRequestId((prev) => ({
        ...prev,
        [requestId]: data,
      }));
    } catch {
      setSection2Error("Failed to get contact");
    }
  };

  // ✅ TIP OWNER
  const handleTip = async (requestId, amount) => {
    try {
      const res = await tipCoins(requestId, amount);
      setSection1Message(res.message); // Temporarily using section1 message for feedback
      await refreshCoins();
      
      // Auto clear message after 3s
      setTimeout(() => setSection1Message(""), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send tip";
      setSection1Error(msg);
      setTimeout(() => setSection1Error(""), 3000);
    }
  };

  return (
    <div className="requests-container">

      <h1 className="requests-title">Requests</h1>

      {/* 🔹 SECTION 1 — BROWSE LISTINGS */}
      <div className="section">
        <h2>Browse Listings</h2>

        {section1Message && <p className="success">{section1Message}</p>}
        {section1Error && <p className="error">{section1Error}</p>}

        {/* 🔍 FILTER TOOLBAR */}
        {!loadingListings && listings.length > 0 && (
          <div className="filter-toolbar">

            {/* search bar — always visible */}
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                id="listing-search"
                type="text"
                className="search-input"
                placeholder="Search by title, description, or category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* mobile toggle */}
            <button
              className="filters-toggle"
              onClick={() => setFiltersOpen((prev) => !prev)}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
              <span className="toggle-arrow">{filtersOpen ? "▲" : "▼"}</span>
            </button>

            {/* filter controls — expand/collapse on mobile */}
            <div className={`filter-controls ${filtersOpen ? "open" : ""}`}>

              {/* category chips */}
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <div className="filter-chips">
                  {[
                    { value: "all", label: "All" },
                    { value: "resource", label: "📦 Resources" },
                    { value: "skill", label: "🎯 Skills" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={`filter-chip ${selectedCategory === opt.value ? "active" : ""}`}
                      onClick={() => setSelectedCategory(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* availability */}
              <div className="filter-group">
                <label className="filter-label" htmlFor="availability-filter">Availability</label>
                <select
                  id="availability-filter"
                  className="filter-select"
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              {/* sort */}
              <div className="filter-group">
                <label className="filter-label" htmlFor="sort-filter">Sort By</label>
                <select
                  id="sort-filter"
                  className="filter-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="az">Name (A–Z)</option>
                  <option value="za">Name (Z–A)</option>
                </select>
              </div>

              {/* clear filters */}
              {activeFilterCount > 0 && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  ✕ Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {loadingListings ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <div className="empty-card">No listings found 🚫</div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-card">No listings match your filters 🔍</div>
        ) : (
          <div className="cards">
            {filteredListings.map((l) => (
              <div
                key={l._id}
                className="card"
                style={{ opacity: l.availability === false ? 0.7 : 1 }}
              >
                <div className="listing-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                  <h3>{l.title}</h3>
                  <span className={`status-badge ${l.availability !== false ? 'avail' : 'unavail'}`}>
                    {l.availability !== false ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p>{l.description}</p>

                <span className="tag">{l.category}</span>
                <p className="owner">{l.ownerName}</p>

                <button
                  className={`primary-btn ${l.availability === false ? 'disabled' : ''}`}
                  onClick={() => l.availability !== false && handleSendRequest(l)}
                  disabled={l.availability === false}
                  style={l.availability === false ? { background: '#555', cursor: 'not-allowed' } : {}}
                >
                  {l.availability !== false ? "Send Request" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 SECTION 2 */}
      <div className="section">
        <h2>My Received Requests</h2>

        {section2Error && <p className="error">{section2Error}</p>}

        {loadingRequests ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <div className="empty-card">No requests yet 🤝</div>
        ) : (
          <div className="cards">
            {(requests || []).map((r) => (
              <div key={r._id} className="card">
                <h3>{r.listingTitle}</h3>
                <p>From: {r.requesterName}</p>

                <p>
                  Status:{" "}
                  <span
                    style={{
                      color:
                        r.status === "approved"
                          ? "lightgreen"
                          : r.status === "rejected"
                          ? "red"
                          : "orange",
                      fontWeight: "bold",
                    }}
                  >
                    {r.status}
                  </span>
                </p>

                {r.status === "pending" && (
                  <div className="btn-group">
                    <button
                      className="accept-btn"
                      onClick={() => handleApprove(r._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(r._id)}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {r.status === "approved" && (
                  <>
                    <button
                      className="primary-btn"
                      onClick={() => handleGetContact(r._id)}
                    >
                      Get Contact
                    </button>

                    {contactByRequestId[r._id] && (
                      <div className="contact">
                        <p>📞 Phone: {contactByRequestId[r._id]?.requesterPhone || 'Not provided'}</p>
                        <p>📧 Email: {contactByRequestId[r._id]?.requesterEmail}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 SECTION 3 */}
      <div className="section">
        <h2>My Sent Requests</h2>

        {loadingRequests ? (
          <p>Loading...</p>
        ) : sentRequests.length === 0 ? (
          <div className="empty-card">No sent requests 📭</div>
        ) : (
          <div className="cards">
  {sentRequests.map((r) => (
    <div key={r._id} className="card">
      <h3>{r.listingTitle}</h3>
      <p>To: {r.ownerName}</p>

      <p>
        Status:{" "}
        <span
          style={{
            color:
              r.status === "approved"
                ? "lightgreen"
                : r.status === "rejected"
                ? "red"
                : "orange",
            fontWeight: "bold",
          }}
        >
          {r.status}
        </span>
      </p>

      {/* ✅ ONLY HERE r IS VALID */}
      {r.status === "approved" && (
        <>
          <button
            className="primary-btn"
            onClick={() => handleGetContact(r._id)}
          >
            Get Contact
          </button>

          {contactByRequestId[r._id] && (
            <div className="contact">
              <p>📞 Phone: {contactByRequestId[r._id]?.ownerPhone || 'Not provided'}</p>
              <p>📧 Email: {contactByRequestId[r._id]?.ownerEmail}</p>
            </div>
          )}
        </>
      )}

      {/* ✅ TIP SECTION */}
      {r.status === "approved" && (
        <div className="tip-section">
          <p className="tip-label">Appreciate the owner with a tip: (Balance: 🪙 {userCoins})</p>
          <div className="tip-buttons">
            {[1, 2, 5].map(amt => (
              <button 
                key={amt}
                className="tip-btn"
                onClick={() => handleTip(r._id, amt)}
                disabled={userCoins < amt}
              >
                +{amt} 🪙
              </button>
            ))}
          </div>
          {userCoins === 0 && <p className="tip-error">Not enough coins 🪙</p>}
        </div>
      )}
    </div>
  ))}
 </div>
        )}
      </div>

    </div>
  );
}

export default Requests;