import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddBookAdmin = () => {
  const [id, setID] = useState("");
  
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !title|| !author || !price) {
      toast.error("🦄 Invalid Data!");
      return;
    }
    const userData = {
      id,title,author,price
    };

    try {
      await fetch("http://localhost:8080/addbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      setTitle("");
      setID("");
      setPrice("");
       setAuthor("");
      
      // const result = await response.json();

      // if (response.ok) {
      //   // Signup successful
      //   toast.success("🦄 Signup Successful!");

      //   // Optionally, you can redirect to the login page here
      //   // history.push("/login");

      //   // You can also save the token to localStorage or sessionStorage
      //   localStorage.setItem("token", result.token);

      //   setName("");
      //  setID("");
      //  setBookName("");
      //  setDate("");
      //  setPayment("")
      //  setRoll("")
      // } else {
      //   // Signup failed
      //   toast.error(`🦄 ${result.error}`);
      // }
    } catch (error) {
      console.error("Error submitting form:", error);
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
           Book Addition 
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="Id"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
               ID
              </label>
              <div className="mt-2">
                <input
                  id="Id"
                  name="id"
                  type="number"
                  value={id}
                  onChange={(e) => setID(e.target.value)}
                  autoComplete="text"
                  required
                  className="block w-full border-2 rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                 Title
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="author"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
            Author
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="Price"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
               Price
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

           
            <div>
              <button
                onClick={handleSubmit}
                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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

export default AddBookAdmin;