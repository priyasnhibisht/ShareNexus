import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../services/authService";
import { getAllListings } from "../services/listingService";
import {
  sendRequest,
  getMyRequests,
  approveRequest,
  rejectRequest,
  getContact,
} from "../services/requestService";

function Requests() {
  const user = getCurrentUser();

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [section1Message, setSection1Message] = useState("");
  const [section1Error, setSection1Error] = useState("");

  const [section2Error, setSection2Error] = useState("");
  const [contactByRequestId, setContactByRequestId] = useState({});

  const cardStyle = {
    border: "1px solid #666",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    background: "#ffffff",
    color: "#000000",
  };

  const refreshMyRequests = async () => {
    const data = await getMyRequests();
    setRequests(data);
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) return;

    setLoadingListings(true);
    getAllListings()
      .then((data) => {
        if (isMounted) setListings(data);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setSection1Error("Failed to load listings");
      })
      .finally(() => {
        if (isMounted) setLoadingListings(false);
      });

    setLoadingRequests(true);
    refreshMyRequests()
      .catch((err) => {
        console.error(err);
        if (isMounted) setSection2Error("Failed to load your requests");
      })
      .finally(() => {
        if (isMounted) setLoadingRequests(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) return <Navigate to="/" />;

  const handleSendRequest = async (listingId) => {
    setSection1Message("");
    setSection1Error("");

    try {
      await sendRequest(listingId);
      setSection1Message("Request sent successfully");
      await refreshMyRequests();
    } catch (err) {
      console.error(err);
      setSection1Error("Failed to send request");
    }
  };

  const handleApprove = async (requestId) => {
    setSection2Error("");
    try {
      await approveRequest(requestId);
      await refreshMyRequests();
    } catch (err) {
      console.error(err);
      setSection2Error("Failed to approve request");
    }
  };

  const handleReject = async (requestId) => {
    setSection2Error("");
    try {
      await rejectRequest(requestId);
      await refreshMyRequests();
    } catch (err) {
      console.error(err);
      setSection2Error("Failed to reject request");
    }
  };

  const handleGetContact = async (requestId) => {
    setSection2Error("");
    try {
      const data = await getContact(requestId);
      setContactByRequestId((prev) => ({
        ...prev,
        [requestId]: data?.ownerContact ?? data,
      }));
    } catch (err) {
      console.error(err);
      setSection2Error("Failed to get contact");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Requests</h2>

      {/* SECTION 1 - Browse listings and send request */}
      <div style={{ marginBottom: 26 }}>
        <h3 style={{ color: "#ffffff" }}>Browse Listings</h3>

        {section1Message ? (
          <p style={{ color: "seagreen" }}>{section1Message}</p>
        ) : null}
        {section1Error ? <p style={{ color: "crimson" }}>{section1Error}</p> : null}

        {loadingListings ? (
          <p>Loading listings...</p>
        ) : listings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          listings.map((l) => (
            <div key={l._id} style={cardStyle}>
              <h3 style={{ margin: "0 0 8px" }}>{l.title}</h3>
              <p style={{ margin: "0 0 6px" }}>
                <strong>Category:</strong> {l.category}
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong>Owner:</strong> {l.ownerName}
              </p>

              <button
                type="button"
                style={{ padding: "10px 16px", cursor: "pointer" }}
                onClick={() => handleSendRequest(l._id)}
              >
                Send Request
              </button>
            </div>
          ))
        )}
      </div>

      {/* SECTION 2 - My received requests (as owner) */}
      <div>
        <h3 style={{ color: "#ffffff" }}>My Received Requests</h3>

        {section2Error ? <p style={{ color: "crimson" }}>{section2Error}</p> : null}

        {loadingRequests ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p style={{ color: "#f8f8f8" }}>No requests yet. Contact details will appear here after you approve a request or receive one.</p>
        ) : (
          requests.map((r) => (
            <div key={r._id} style={cardStyle}>
              <p style={{ margin: "0 0 6px" }}>
                <strong>Requester:</strong> {r.requesterName}
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong>Listing:</strong> {r.listingTitle}
              </p>
              <p style={{ margin: "0 0 10px" }}>
                <strong>Status:</strong> {r.status}
              </p>

              {r.status === "pending" ? (
                <div>
                  <button
                    type="button"
                    style={{ padding: "10px 16px", cursor: "pointer", marginRight: 8 }}
                    onClick={() => handleApprove(r._id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    style={{ padding: "10px 16px", cursor: "pointer" }}
                    onClick={() => handleReject(r._id)}
                  >
                    Reject
                  </button>
                </div>
              ) : r.status === "approved" ? (
                <div>
                  <button
                    type="button"
                    style={{ padding: "10px 16px", cursor: "pointer" }}
                    onClick={() => handleGetContact(r._id)}
                  >
                    Get Contact
                  </button>
                  {contactByRequestId[r._id] ? (
                    <p style={{ marginTop: 10 }}>
                      <strong>Contact:</strong> {contactByRequestId[r._id]}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p style={{ margin: 0 }}>Request {r.status}.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Requests;

