import React, { useState, useRef, useContext, useEffect } from "react";

import AuthContext from "../context/auth-context";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import Spinner from "../components/Spinner/Spinner";
import EventList from "../components/Events/EventList/EventList";

import "./Events.css";

function EventsPage() {
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const titleElRef = useRef(null);
  const priceElRef = useRef(null);
  const dateElRef = useRef(null);
  const descriptionElRef = useRef(null);
  let isActive = true;

  const authenticationContext = useContext(AuthContext);

  useEffect(() => {
    fetchEvents();
  }, []);

  const startCreateEventHandler = () => {
    setCreating(true);
  };

  const modalConfirmHandler = () => {
    setCreating(false);
    const title = titleElRef.current.value;
    const price = +priceElRef.current.value;
    const date = dateElRef.current.value;
    const description = descriptionElRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const event = { title, price, date, description };
    console.log(event);

    const requestBody = {
      query: `
          mutation CreateEvent($title: String!, $description: String!, $price : Float!, $date: String!) {
            createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
              _id
              title
              description
              date
              price
            }
          }
        `,
      variables: {
        title: title,
        description: description,
        price: price,
        date: date
      }
    };

    const token = authenticationContext.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        return res.json();
      })
      .then(resData => {
        setEvents(prevState => {
          const updatedEvents = [...prevState];
          console.log(prevState);
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            date: resData.data.createEvent.date,
            price: resData.data.createEvent.price,
            creator: {
              _id: authenticationContext.userId
            }
          });
          return updatedEvents;
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const modalCancelConformHandler = () => {
    setCreating(false);
    setSelectedEvent(null);
  };

  const fetchEvents = () => {
    setIsLoading(true);
    const requestBody = {
      query: `
          query {
            events {
              _id
              title
              description
              date
              price
              creator {
                _id
                email
              }
            }
          }
        `
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        return res.json();
      })
      .then(resData => {
        const eventsData = resData.data.events;
        setEvents(eventsData);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const showDetailHandler = eventId => {
    setSelectedEvent(() => {
      console.log(eventId);
      const selectedEvent = events.find(e => e._id === eventId);
      return selectedEvent;
    });
  };

  const bookEventHandler = () => {
    if (!authenticationContext.token) {
      setSelectedEvent(null);
      return;
    }

    // Can be done in below way or the recommended way
    // const requestBody = {
    //   query: `
    //       mutation {
    //         bookEvent(eventId: "${selectedEvent._id}") {
    //           _id
    //           createdAt
    //           updatedAt
    //         }
    //       }
    //     `
    // };

    const requestBody = {
      query: `
          mutation BookEvent($id: ID!) {
            bookEvent(eventId: $id) {
              _id
              createdAt
              updatedAt
            }
          }
        `,
      variables: {
        id: selectedEvent._id
      }
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authenticationContext.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        setSelectedEvent(null);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <React.Fragment>
      {(creating || selectedEvent) && <Backdrop />}
      {creating && (
        <Modal
          title="Add Event"
          canCancel
          canConfirm
          onCancel={modalCancelConformHandler}
          onConfirm={modalConfirmHandler}
          confirmText="Confirm"
        >
          <form>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" ref={titleElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="price">Price</label>
              <input type="number" id="price" ref={priceElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input type="datetime-local" id="date" ref={dateElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <textarea id="description" rows="4" ref={descriptionElRef} />
            </div>
          </form>
        </Modal>
      )}

      {selectedEvent && (
        <Modal
          title={selectedEvent.title}
          canCancel
          canConfirm
          onCancel={modalCancelConformHandler}
          onConfirm={bookEventHandler}
          confirmText={authenticationContext.token ? "Book" : "Confirm"}
        >
          <h2>{selectedEvent.title}</h2>
          <h3>
            Rs. {selectedEvent.price} -{" "}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h3>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}

      {authenticationContext.token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <EventList
          events={events}
          authUserId={authenticationContext.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </React.Fragment>
  );
}

export default EventsPage;
