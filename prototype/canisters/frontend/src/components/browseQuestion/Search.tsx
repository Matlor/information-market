import { useState } from "react";

const Search = ({ setSearchedText }) => {
	const [input, setInput] = useState<string>("");
	const handler = (e) => {
		setInput(e.target.value);
		setSearchedText(e.target.value);
	};

	return (
		<div className="w-[490px] px-[15px] py-[10px] flex items-center gap-[30px] shadow-md rounded-md bg-colorBackgroundComponents">
			<svg
				width="20"
				height="19"
				viewBox="0 0 20 19"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M19.3104 17.8406L13.9163 12.6366C15.2125 11.1353 15.8589 9.20962 15.721 7.26021C15.5831 5.31081 14.6715 3.48775 13.1758 2.17029C11.6802 0.852824 9.71562 0.14239 7.69087 0.186776C5.66612 0.231161 3.73705 1.02695 2.30496 2.40859C0.87288 3.79024 0.048039 5.65136 0.00203289 7.6048C-0.0439733 9.55823 0.692397 11.4536 2.05796 12.8966C3.42352 14.3395 5.31313 15.219 7.3337 15.3521C9.35428 15.4852 11.3502 14.8615 12.9064 13.611L18.3004 18.815L19.3104 17.8406ZM1.45405 7.7895C1.45405 6.56289 1.83106 5.36383 2.53741 4.34394C3.24375 3.32405 4.24771 2.52914 5.42233 2.05974C6.59694 1.59033 7.88945 1.46751 9.13641 1.70681C10.3834 1.94611 11.5288 2.53678 12.4278 3.40413C13.3268 4.27147 13.939 5.37654 14.1871 6.57958C14.4351 7.78262 14.3078 9.02961 13.8213 10.1629C13.3347 11.2961 12.5108 12.2647 11.4537 12.9462C10.3966 13.6276 9.15371 13.9914 7.88232 13.9914C6.17802 13.9895 4.54406 13.3355 3.33893 12.1729C2.13381 11.0102 1.45594 9.43378 1.45405 7.7895V7.7895Z"
					fill="#969696"
				/>
			</svg>

			<input
				className="w-full outline-none placeholder:heading3-18px heading3-18px p-0"
				type="text"
				placeholder="Search..."
				value={input}
				onChange={handler}
			/>
		</div>
	);
};

export default Search;
