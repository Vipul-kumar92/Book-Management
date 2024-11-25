import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Registration = () => {
  const [id, setID] = useState("");
  const [rollno, setRoll] = useState("");
  const [name, setName] = useState("");
  const [bookname, setBookName] = useState("");
  const [date, setDate] = useState("");
  const [payment, setPayment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !rollno || !name || !bookname || !date || !payment) {
      toast.error("🦄 Invalid Data!");
      return;
    }
    const userData = {
      id,
      name,
      rollno,
      bookname,
      date,
      payment,
    };

    try {
      const response = await fetch(`http://localhost:8080/books/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        // Registration successful
        toast.success("🦄 Registration Successful!");
        // Save the token if available
        localStorage.setItem("token", result.token);
        // Clear form fields
        setID("");
        setName("");
        setBookName("");
        setDate("");
        setPayment("");
        setRoll("");
      } else {
        // Registration failed
        toast.error(`🦄 ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("🦄 Error submitting form!");
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-7 tracking-tight text-black-600">
            Book Issue Registration Form
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="ID"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Id
              </label>
              <div className="mt-2">
                <input
                  id="ID"
                  name="id"
                  type="number"
                  value={id}
                  onChange={(e) => setID(e.target.value)}
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="Roll"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Rollno
              </label>
              <div className="mt-2">
                <input
                  id="rollno"
                  name="rollno"
                  type="number"
                  value={rollno}
                  onChange={(e) => setRoll(e.target.value)}
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="Bookname"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                BookName
              </label>
              <div className="mt-2">
                <input
                  id="bookname"
                  name="bookname"
                  type="text"
                  value={bookname}
                  onChange={(e) => setBookName(e.target.value)}
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Date
              </label>
              <div className="mt-2">
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="payment"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Payment
              </label>
              <div className="mt-2">
                <input
                  id="payment"
                  name="payment"
                  type="number"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <button
                onClick={handleSubmit}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registration;
