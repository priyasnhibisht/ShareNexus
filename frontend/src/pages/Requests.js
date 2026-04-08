import { useEffect, useState } from "react";
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

import "./Requests.css";

function Requests() {
  const user = getCurrentUser();

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]); // ✅ NEW

  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [section1Message, setSection1Message] = useState("");
  const [section1Error, setSection1Error] = useState("");

  const [section2Error, setSection2Error] = useState("");
  const [contactByRequestId, setContactByRequestId] = useState({});

  // ✅ RECEIVED
  const refreshMyRequests = async () => {
    const data = await getReceivedRequests();
    setRequests(data);
  };

  // ✅ SENT
  const refreshSentRequests = async () => {
    const data = await getSentRequests();
    setSentRequests(data);
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) return;

    // 🔹 Listings
    setLoadingListings(true);
    getListings()
      .then((data) => {
        if (isMounted) setListings(data);
      })
      .catch(() => {
        if (isMounted) setSection1Error("Failed to load listings");
      })
      .finally(() => {
        if (isMounted) setLoadingListings(false);
      });

    // 🔹 Requests (BOTH)
    setLoadingRequests(true);
    Promise.all([refreshMyRequests(), refreshSentRequests()]) // ✅ FIX
      .catch(() => {
        if (isMounted) setSection2Error("Failed to load your requests");
      })
      .finally(() => {
        if (isMounted) setLoadingRequests(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return <Navigate to="/" />;

  // ✅ SEND REQUEST
  const handleSendRequest = async (listing) => {
    setSection1Message("");
    setSection1Error("");

    if (listing.ownerId === user._id) {
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

  return (
    <div className="requests-container">

      <h1 className="requests-title">Requests</h1>

      {/* 🔹 SECTION 1 */}
      <div className="section">
        <h2>Browse Listings</h2>

        {section1Message && <p className="success">{section1Message}</p>}
        {section1Error && <p className="error">{section1Error}</p>}

        {loadingListings ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <div className="empty-card">No listings found 🚫</div>
        ) : (
          <div className="cards">
            {listings.map((l) => (
              <div key={l._id} className="card">
                <h3>{l.title}</h3>
                <p>{l.description}</p>

                <span className="tag">{l.category}</span>
                <p className="owner">{l.ownerName}</p>

                <button
                  className="primary-btn"
                  onClick={() => handleSendRequest(l)}
                >
                  Send Request
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
            {requests.map((r) => (
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
                        <p>📞 Phone: {contactByRequestId[r._id]?.requesterContact}</p>
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
              <p>📞 Phone: {contactByRequestId[r._id]?.ownerContact}</p>
              <p>📧 Email: {contactByRequestId[r._id]?.ownerEmail}</p>
            </div>
          )}
        </>
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