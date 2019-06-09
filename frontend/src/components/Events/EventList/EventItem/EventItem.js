import React from "react";

import "./EventItem.css";

const eventItem = props => {
  return (
    <li key={props._id} className="events__list-item">
      <div>
        <h2>{props.title}</h2>
        <h3>
          Rs. {props.price} - {new Date(props.date).toLocaleDateString()}
        </h3>
      </div>
      <div>
        {props.userId === props.creatorId ? (
          <p>You are the owner of this event</p>
        ) : (
          <button
            className="btn"
            onClick={() => {
              props.onDetail(props.eventId);
            }}
          >
            View Details
          </button>
        )}
      </div>
    </li>
  );
};

export default eventItem;
