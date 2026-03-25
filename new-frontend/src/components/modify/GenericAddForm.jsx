import React, { useState, useEffect } from "react";

const GenericAddForm = ({
  // Form configuration
  title,
  buttonText = "Add",

  // Primary input configuration
  primaryInput: {
    placeholder: primaryPlaceholder,
    helperText: primaryHelperText,
    value: primaryValue,
    setValue: setPrimaryValue,
    validation: primaryValidation = (value) => value.trim() !== ""
  },

  // Secondary input configuration (optional)
  secondaryInput = null,

  // Additional inputs (for forms like measure units with name + abbreviation)
  additionalInputs = [],

  // Form submission
  onSubmit,
  isLoading = false,

  // Error handling
  errorMessage = "",

  // Custom styling
  className = "",

  // Disable entire form
  disabled = false
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkSize = () => setIsSmallScreen(window.innerWidth < 640);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Validate primary input
    if (!primaryValidation(primaryValue)) {
      return;
    }

    // Validate secondary input if present
    if (secondaryInput && secondaryInput.required && !secondaryInput.validation(secondaryInput.value)) {
      return;
    }

    // Validate additional inputs
    for (const input of additionalInputs) {
      if (input.required && !input.validation(input.value)) {
        return;
      }
    }

    onSubmit();
  };

  const isPrimaryValid = primaryValidation(primaryValue);
  const isSecondaryValid = !secondaryInput || !secondaryInput.required || secondaryInput.validation(secondaryInput.value);
  const areAdditionalInputsValid = additionalInputs.every(input =>
    !input.required || input.validation(input.value)
  );

  const isFormValid = isPrimaryValid && isSecondaryValid && areAdditionalInputsValid;

  return (
    <div className={`bg-white/90 rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-start">
        {/* PRIMARY INPUT */}
        <div className="flex-1 min-w-[300px]">
          <input
            type="text"
            value={primaryValue}
            onChange={(e) => setPrimaryValue(e.target.value)}
            placeholder={primaryPlaceholder}
            className="w-full px-3 py-2 border-0 rounded-lg bg-yellow-50/100 text-gray-900 placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-teal-500 transition-all duration-200"
            required
            disabled={disabled}
          />
          {primaryHelperText && (
            <p className="text-xs text-gray-500 mt-1 italic">
              {primaryHelperText}
            </p>
          )}
        </div>

        {/* ADDITIONAL INPUTS (for forms like measure units) */}
        {additionalInputs.map((input, index) => (
          <div key={index} className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={input.value}
              onChange={(e) => input.setValue(e.target.value)}
              placeholder={input.placeholder}
              className="w-full px-3 py-2 border-0 rounded-lg bg-yellow-50/100 text-gray-900 placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-teal-500 transition-all duration-200"
              required={input.required}
            />
            {input.helperText && (
              <p className="text-xs text-gray-500 mt-1 italic">
                {input.helperText}
              </p>
            )}
          </div>
        ))}

        {/* SECONDARY INPUT + BUTTON WRAPPER (for forms with selects like crops) */}
        {secondaryInput ? (
          <div className="flex gap-4 items-start flex-1 min-w-[200px]">
            {/* SECONDARY INPUT (SELECT) */}
            <div className="flex-1 min-w-[110px]">
              <select
                value={secondaryInput.value}
                onChange={(e) => secondaryInput.setValue(e.target.value)}
                className="w-full px-3 py-2 border-0 rounded-lg bg-yellow-50/100 text-gray-900 focus:outline-none focus:border-teal-500 transition-all duration-200"
                required={secondaryInput.required}
              >
                <option value="" disabled>
                  {isSmallScreen ? secondaryInput.shortPlaceholder : secondaryInput.placeholder}
                </option>
                {secondaryInput.options.map((option) => (
                  <option key={option.id} value={option.value} className="text-gray-900">
                    {option.label}
                  </option>
                ))}
              </select>
              {secondaryInput.helperText && (
                <div className="flex justify-end mt-1">
                  <p
                    className="text-xs text-blue-600 underline cursor-pointer hover:text-blue-700"
                    onClick={secondaryInput.onHelperTextClick || (() => {})}
                  >
                    {secondaryInput.helperText}
                  </p>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="w-32 flex-shrink-0">
              <button
                type="submit"
                className="w-full px-4 py-2 !bg-teal-700 text-white font-semibold rounded-lg hover:!bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? 'Adding...' : buttonText}
              </button>
            </div>
          </div>
        ) : (
          /* BUTTON ONLY (for simple forms) */
          <div className="w-32 flex-shrink-0">
            <button
              type="submit"
              className="w-full px-4 py-2 !bg-teal-700 text-white font-semibold rounded-lg hover:!bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid}
            >
              {buttonText}
            </button>
          </div>
        )}
      </form>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </div>
  );
};

export default GenericAddForm;