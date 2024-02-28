import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ShippingForm() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const imageSrc = searchParams.get("imageSrc");
  const name = searchParams.get("name");
  const price = searchParams.get("price");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = "http://localhost:5000";

    const response = await fetch(`${apiUrl}/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        address,
        country,
        postalCode,
        price,
        name,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Erreur lors de la génération du PDF");
    }
    setFirstName("");
    setLastName("");
    setEmail("");
    setAddress("");
    setCountry("");
    setPostalCode("");
    navigate("/", { state: { fromCheckout: true } });
  };

  return (
    <div className="bg-[#38383B] text-white flex items-center gap-12 h-screen md:px-12 px-5">
      <form className="w-2/4" onSubmit={handleSubmit}>
        <label className="block mb-4">
          Prénom:
          <input
            required
            type="text"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="block w-full border border-gray-300 p-2 text-black focus:outline-none"
          />
        </label>
        <label className="block mb-4">
          Nom:
          <input
            required
            type="text"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="block w-full border border-gray-300 p-2 text-black focus:outline-none"
          />
        </label>
        <label className="block mb-4">
          Adresse email:
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full border border-gray-300 p-2 text-black focus:outline-none"
          />
        </label>
        <label className="block mb-4">
          Adresse:
          <input
            required
            type="text"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="block w-full border border-gray-300 p-2 text-black focus:outline-none"
          />
        </label>
        <label className="block mb-4">
          Pays:
          <input
            required
            type="text"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="block w-full border border-gray-300 p-2 text-black focus:outline-none"
          />
        </label>
        <label className="block mb-4">
          Code Postal:
          <input
            required
            type="text"
            name="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="block w-full border border-gray-300 p-2 text-black focus:outline-none"
          />
        </label>
        <div className="flex gap-10">
          <button className="bg-white text-black p-2 focus:outline-none">
            Annuler
          </button>
          <button type="submit" className="border p-2 border-blue-500 bg-black">
            Acheter
          </button>
        </div>
      </form>
      <div className="w-2/4 bg-white text-black p-7 flex flex-col gap-3">
        <h1 className="text-2xl">Récapitulatif de la commande</h1>
        <div className="flex justify-between">
          <div className="flex gap-4">
            <img
              className="h-28"
              src={decodeURIComponent(imageSrc)}
              alt={name}
            />
            <p>{decodeURIComponent(name)}</p>
          </div>
          <div>
            <p>{decodeURIComponent(price)}</p>
            <p>Qté 1</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{decodeURIComponent(price)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxe</span>
            <span>0,00€</span>
          </div>
          <div className="flex justify-between">
            <span>Total</span>
            <span>{decodeURIComponent(price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingForm;
