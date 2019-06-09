import React, { useState, useEffect, useContext } from "react";
import Spinner from "../components/Spinner/Spinner";

import BookingList from "../components/Bookings/BookingList/BookingList";
import AuthContext from "../context/auth-context";

function BookingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  const authenticationContext = useContext(AuthContext);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = () => {
    setIsLoading(true);
    const requestBody = {
      query: `
          query {
            bookings {
              _id
              createdAt
              event {
                _id
                title
                date
              }
            }
          }
        `
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
        const bookings = resData.data.bookings;
        setBookings(bookings);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const deleteBookingHandler = bookingId => {
    setIsLoading(true);

    // Can be done like this or like recommended method below
    // const requestBody = {
    //   query: `
    //       mutation {
    //         cancelBooking(bookingId: "${bookingId}") {
    //           _id
    //           title
    //         }
    //       }
    //     `
    // };

    const requestBody = {
      query: `
          mutation CancelBooking($id: ID!) {
            cancelBooking(bookingId: $id) {
              _id
              title
            }
          }
        `,
      variables: {
        id: bookingId
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
        setBookings(bookings => {
          const updatedBookings = bookings.filter(booking => {
            return booking._id != bookingId;
          });
          return updatedBookings;
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <Spinner />
      ) : (
        <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
      )}
    </React.Fragment>
  );
}

export default BookingsPage;
