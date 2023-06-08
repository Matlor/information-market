import React from "react";

export const Slider = ({ value, onChange, min, max, step, disabled }) => {
	const handleChange = (event) => {
		onChange(parseFloat(event.target.value));
	};

	const leftColor = "#1F3350"; // Change the color of the left side of the thumb here
	const rightColor = "#F9F8F8"; // Change the color of the right side of the thumb here
	const percentage = ((value - min) / (max - min)) * 100;

	const backgroundStyle = {
		background: `linear-gradient(to right, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%)`,
	};

	return (
		<input
			type="range"
			value={value}
			min={min}
			max={max}
			step={step}
			onChange={handleChange}
			className="slider"
			style={backgroundStyle}
			disabled={disabled}
		/>
	);
};