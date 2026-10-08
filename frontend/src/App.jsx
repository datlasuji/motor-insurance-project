import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [step, setStep] = useState(1);

  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);

  const [selectedParts, setSelectedParts] = useState([]);

  const [vehicle, setVehicle] = useState({
    customerName: "",
    vehicleNumber: "",
    vehicleType: "Car",
    brand: "",
    model: "",
    modelId: "",
    vehicleAge: 5,
  });

  const [labour, setLabour] = useState(7000);
  const [deductible, setDeductible] = useState(500);

  // NEW
  const [availableAmount, setAvailableAmount] = useState(100000);
  const [amountClaimed, setAmountClaimed] = useState(50000);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // Load Vehicles
  // =========================

  useEffect(() => {
    fetch(`${API_URL}/api/vehicles`)
      .then((response) => response.json())
      .then((data) => {
        setVehicles(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // =========================
  // Available Brands
  // =========================

  const brands = [
    ...new Set(
      vehicles.map((vehicle) => vehicle.brand)
    ),
  ];

  // =========================
  // Available Models
  // =========================

  const availableModels = vehicles.filter(
    (item) => item.brand === vehicle.brand
  );

  // =========================
  // Brand Change
  // =========================

  const handleBrandChange = (brand) => {
    setVehicle({
      ...vehicle,
      brand: brand,
      model: "",
      modelId: "",
      vehicleType: "Car",
    });

    setParts([]);
    setSelectedParts([]);
  };

  // =========================
  // Model Change
  // =========================

  const handleModelChange = (modelId) => {
    const selectedVehicle = vehicles.find(
      (item) => item.id === Number(modelId)
    );

    if (!selectedVehicle) {
      return;
    }

    setVehicle({
      ...vehicle,
      model: selectedVehicle.model,
      modelId: selectedVehicle.id,
      vehicleType: selectedVehicle.vehicle_type,
    });

    setSelectedParts([]);

    fetch(
      `${API_URL}/api/parts?model_id=${selectedVehicle.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setParts(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // =========================
  // Toggle Part
  // =========================

  const togglePart = (id) => {
    setSelectedParts((current) =>
      current.includes(id)
        ? current.filter((partId) => partId !== id)
        : [...current, id]
    );
  };

  // =========================
  // Calculate Claim
  // =========================

  const calculateClaim = async () => {
    if (!vehicle.modelId) {
      alert("Please select a vehicle model.");
      return;
    }

    if (selectedParts.length === 0) {
      alert("Please select at least one damaged part.");
      return;
    }

    if (Number(amountClaimed) <= 0) {
      alert("Please enter a valid amount claimed.");
      return;
    }

    if (Number(availableAmount) <= 0) {
      alert("Please enter a valid available insurance amount.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/claim/calculate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            vehicle_age: Number(vehicle.vehicleAge),

            model_id: Number(vehicle.modelId),

            part_ids: selectedParts,

            labour: Number(labour),

            deductible: Number(deductible),

            // NEW
            amount_claimed: Number(amountClaimed),

            available_amount: Number(availableAmount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Calculation failed");
      }

      setResult(data);
      setStep(5);

    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Money Format
  // =========================

  const money = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  // =========================
  // Reset
  // =========================

  const resetClaim = () => {
    setStep(1);

    setSelectedParts([]);
    setParts([]);
    setResult(null);

    setVehicle({
      customerName: "",
      vehicleNumber: "",
      vehicleType: "Car",
      brand: "",
      model: "",
      modelId: "",
      vehicleAge: 5,
    });

    setLabour(7000);
    setDeductible(500);

    // NEW
    setAvailableAmount(100000);
    setAmountClaimed(50000);
  };

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <div>
          <h1>
            Motor Insurance
          </h1>

          <p>
            Claim Estimator
          </p>
        </div>

        {step > 1 && step < 5 && (
          <div className="step-count">
            Step {step - 1} of 3
          </div>
        )}

      </header>


      {/* =========================
          PROGRESS
      ========================= */}

      {step > 1 && (

        <div className="progress-container">

          <div
            className={`progress-step ${
              step >= 2 ? "active" : ""
            }`}
          >
            <span>1</span>
            Vehicle
          </div>

          <div
            className={`line ${
              step >= 3 ? "active" : ""
            }`}
          />

          <div
            className={`progress-step ${
              step >= 3 ? "active" : ""
            }`}
          >
            <span>2</span>
            Damage
          </div>

          <div
            className={`line ${
              step >= 4 ? "active" : ""
            }`}
          />

          <div
            className={`progress-step ${
              step >= 4 ? "active" : ""
            }`}
          >
            <span>3</span>
            Claim
          </div>

        </div>

      )}


      <main className="container">


        {/* =========================
            STEP 1
        ========================= */}

        {step === 1 && (

          <section className="welcome-card">

            <div className="car-icon">
              🚗
            </div>

            <h2>
              Motor Insurance
              Claim Estimator
            </h2>

            <p>
              Estimate your motor insurance
              claim quickly and transparently
              based on vehicle damage,
              repair cost, depreciation
              and deductible.
            </p>

            <button
              className="primary-btn"
              onClick={() => setStep(2)}
            >
              Start Claim
            </button>

          </section>

        )}


        {/* =========================
            STEP 2 - VEHICLE
        ========================= */}

        {step === 2 && (

          <section className="card">

            <div className="page-title">

              <span>
                01
              </span>

              <div>

                <h2>
                  Vehicle Details
                </h2>

                <p>
                  Enter the basic vehicle
                  information.
                </p>

              </div>

            </div>


            <div className="form-grid">


              {/* Customer Name */}

              <div className="field">

                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={vehicle.customerName}
                  onChange={(e) =>
                    setVehicle({
                      ...vehicle,
                      customerName: e.target.value,
                    })
                  }
                />

              </div>


              {/* Vehicle Number */}

              <div className="field">

                <label>
                  Vehicle Number
                </label>

                <input
                  type="text"
                  placeholder="e.g. AP01AB1234"
                  value={vehicle.vehicleNumber}
                  onChange={(e) =>
                    setVehicle({
                      ...vehicle,
                      vehicleNumber: e.target.value,
                    })
                  }
                />

              </div>


              {/* Vehicle Brand */}

              <div className="field">

                <label>
                  Vehicle Brand
                </label>

                <select
                  value={vehicle.brand}
                  onChange={(e) =>
                    handleBrandChange(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Brand
                  </option>

                  {brands.map((brand) => (

                    <option
                      key={brand}
                      value={brand}
                    >
                      {brand}
                    </option>

                  ))}

                </select>

              </div>


              {/* Vehicle Model */}

              <div className="field">

                <label>
                  Vehicle Model
                </label>

                <select
                  value={vehicle.modelId}
                  onChange={(e) =>
                    handleModelChange(
                      e.target.value
                    )
                  }
                  disabled={!vehicle.brand}
                >

                  <option value="">
                    {vehicle.brand
                      ? "Select Model"
                      : "Select Brand First"}
                  </option>

                  {availableModels.map(
                    (item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.model}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* Vehicle Type */}

              <div className="field">

                <label>
                  Vehicle Type
                </label>

                <input
                  type="text"
                  value={vehicle.vehicleType}
                  readOnly
                />

              </div>


              {/* Vehicle Age */}

              <div className="field">

                <label>
                  Vehicle Age
                </label>

                <div className="age-input">

                  <input
                    type="number"
                    min="0"
                    value={vehicle.vehicleAge}
                    onChange={(e) =>
                      setVehicle({
                        ...vehicle,
                        vehicleAge:
                          e.target.value,
                      })
                    }
                  />

                  <span>
                    Years
                  </span>

                </div>

              </div>

            </div>


            <div className="button-row">

              <button
                className="primary-btn"
                onClick={() => {

                  if (!vehicle.brand) {
                    alert(
                      "Please select a vehicle brand."
                    );
                    return;
                  }

                  if (!vehicle.modelId) {
                    alert(
                      "Please select a vehicle model."
                    );
                    return;
                  }

                  setStep(3);

                }}
              >
                Continue →
              </button>

            </div>

          </section>

        )}


        {/* =========================
            STEP 3 - DAMAGE
        ========================= */}

        {step === 3 && (

          <section className="card">

            <div className="page-title">

              <span>
                02
              </span>

              <div>

                <h2>
                  Damage Details
                </h2>

                <p>
                  Select all damaged
                  vehicle parts.
                </p>

              </div>

            </div>


            {/* Selected Vehicle */}

            <div className="summary-box">

              <h3>
                Selected Vehicle
              </h3>

              <p>
                Brand:{" "}
                <strong>
                  {vehicle.brand}
                </strong>
              </p>

              <p>
                Model:{" "}
                <strong>
                  {vehicle.model}
                </strong>
              </p>

            </div>


            {/* Parts */}

            <div className="parts-grid">

              {parts.map((part) => (

                <label
                  key={part.id}
                  className={`part ${
                    selectedParts.includes(
                      part.id
                    )
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="checkbox"
                    checked={selectedParts.includes(
                      part.id
                    )}
                    onChange={() =>
                      togglePart(part.id)
                    }
                  />

                  <div>

                    <strong>
                      {part.name}
                    </strong>

                    <small>
                      {part.type} ·{" "}
                      {money(part.price)}
                    </small>

                  </div>

                </label>

              ))}

            </div>


            <div className="selected-count">

              {selectedParts.length}
              {" "}
              damaged part(s)
              selected

            </div>


            <div className="button-row">

              <button
                className="secondary-btn"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>

              <button
                className="primary-btn"
                onClick={() => {

                  if (
                    selectedParts.length === 0
                  ) {
                    alert(
                      "Please select at least one damaged part."
                    );
                    return;
                  }

                  setStep(4);

                }}
              >
                Continue →
              </button>

            </div>

          </section>

        )}


        {/* =========================
            STEP 4 - CLAIM
        ========================= */}

        {step === 4 && (

          <section className="card">

            <div className="page-title">

              <span>
                03
              </span>

              <div>

                <h2>
                  Claim Details
                </h2>

                <p>
                  Enter repair, insurance
                  and deductible information.
                </p>

              </div>

            </div>


            <div className="form-grid">


              {/* Labour */}

              <div className="field">

                <label>
                  Labour Charges
                </label>

                <div className="currency-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={labour}
                    onChange={(e) =>
                      setLabour(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* Available Insurance Amount */}

              <div className="field">

                <label>
                  Available Insurance Amount
                </label>

                <div className="currency-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={availableAmount}
                    onChange={(e) =>
                      setAvailableAmount(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>


              {/* Amount Claimed */}

              <div className="field">

                <label>
                  Amount Claimed
                </label>

                <div className="currency-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={amountClaimed}
                    onChange={(e) =>
                      setAmountClaimed(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>


              {/* Deductible */}

              <div className="field">

                <label>
                  Voluntary Deductible
                </label>

                <div className="currency-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={deductible}
                    onChange={(e) =>
                      setDeductible(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>


            {/* Summary */}

            <div className="summary-box">

              <h3>
                Claim Summary
              </h3>

              <p>
                Vehicle Number:{" "}
                <strong>
                  {vehicle.vehicleNumber ||
                    "Not provided"}
                </strong>
              </p>

              <p>
                Brand:{" "}
                <strong>
                  {vehicle.brand}
                </strong>
              </p>

              <p>
                Model:{" "}
                <strong>
                  {vehicle.model}
                </strong>
              </p>

              <p>
                Vehicle Age:{" "}
                <strong>
                  {vehicle.vehicleAge} years
                </strong>
              </p>

              <p>
                Damaged Parts:{" "}
                <strong>
                  {selectedParts.length}
                </strong>
              </p>

              <p>
                Available Insurance:{" "}
                <strong>
                  {money(availableAmount)}
                </strong>
              </p>

              <p>
                Amount Claimed:{" "}
                <strong>
                  {money(amountClaimed)}
                </strong>
              </p>

            </div>


            <div className="button-row">

              <button
                className="secondary-btn"
                onClick={() => setStep(3)}
              >
                ← Back
              </button>

              <button
                className="primary-btn"
                onClick={calculateClaim}
                disabled={loading}
              >

                {loading
                  ? "Calculating..."
                  : "Calculate Claim"}

              </button>

            </div>

          </section>

        )}


        {/* =========================
            STEP 5 - RESULT
        ========================= */}

        {step === 5 && result && (

          <section className="result-card">

            <div className="success-icon">
              ✓
            </div>


            <p className="result-label">
              ESTIMATED INSURANCE CLAIM
            </p>


            <h2 className="final-amount">
              {money(
                result.final_estimated_claim
              )}
            </h2>


            <p className="result-subtitle">
              Claim estimate calculated
              successfully
            </p>


            {/* Customer Summary */}

            <div className="customer-summary">

              <div>

                <span>
                  Customer
                </span>

                <strong>
                  {vehicle.customerName ||
                    "Not provided"}
                </strong>

              </div>


              <div>

                <span>
                  Vehicle
                </span>

                <strong>
                  {vehicle.brand}{" "}
                  {vehicle.model}
                </strong>

              </div>


              <div>

                <span>
                  Vehicle Age
                </span>

                <strong>
                  {vehicle.vehicleAge} years
                </strong>

              </div>

            </div>


            {/* Breakdown */}

            <div className="breakdown">

              <div>

                <span>
                  Parts Cost
                </span>

                <strong>
                  {money(
                    result.parts_cost
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Labour
                </span>

                <strong>
                  {money(
                    result.labour
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Gross Repair Cost
                </span>

                <strong>
                  {money(
                    result.gross_repair_cost
                  )}
                </strong>

              </div>


              <div className="minus">

                <span>
                  Depreciation
                </span>

                <strong>
                  -{" "}
                  {money(
                    result.total_depreciation
                  )}
                </strong>

              </div>


              <div>

                <span>
                  After Depreciation
                </span>

                <strong>
                  {money(
                    result.amount_after_depreciation
                  )}
                </strong>

              </div>


              {/* NEW */}

              <div>

                <span>
                  Available Insurance Amount
                </span>

                <strong>
                  {money(
                    result.available_amount
                  )}
                </strong>

              </div>


              {/* NEW */}

              <div>

                <span>
                  Amount Claimed
                </span>

                <strong>
                  {money(
                    result.amount_claimed
                  )}
                </strong>

              </div>


              <div className="minus">

                <span>
                  Voluntary Deductible
                </span>

                <strong>
                  -{" "}
                  {money(
                    result.voluntary_deductible
                  )}
                </strong>

              </div>

            </div>


            {/* Final */}

            <div className="final-row">

              <span>
                Final Estimated Claim
              </span>

              <strong>
                {money(
                  result.final_estimated_claim
                )}
              </strong>

            </div>


            {/* Explanation */}

            <div className="summary-box">

              <h3>
                Claim Limit
              </h3>

              <p>
                The final claim is limited by
                the eligible repair amount,
                the amount claimed and the
                available insurance amount.
              </p>

            </div>


            {/* Depreciation Details */}

            <div className="part-details">

              <h3>
                Depreciation Details
              </h3>

              {result.parts.map(
                (part) => (

                  <div
                    className="part-detail"
                    key={part.name}
                  >

                    <span>
                      {part.name}{" "}
                      ({part.type})
                    </span>

                    <span>
                      {part.depreciation_rate}
                      % ={" "}
                      {money(
                        part.depreciation_amount
                      )}
                    </span>

                  </div>

                )
              )}

            </div>


            <button
              className="primary-btn new-claim"
              onClick={resetClaim}
            >
              Start New Claim
            </button>

          </section>

        )}

      </main>


      <footer>
        Motor Insurance Claim Estimator ·
        Demo Application
      </footer>

    </div>
  );
}

export default App;