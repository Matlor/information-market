import React from "react";

const Footer = () => {
	return (
		<div className="flex justify-between items-center p-0 self-stretch">
			<div className="flex gap-[14px] items-start">
				<div className="heading2">Powered by</div>

				<div className="self-center">
					<a href="https://internetcomputer.org/">
						<svg
							width="45"
							height="22"
							viewBox="0 0 45 22"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M17.7959 4.87265C16.5839 3.66033 15.0397 2.83465 13.3584 2.50004C11.6772 2.16542 9.93446 2.33689 8.35068 2.99278C6.7669 3.64866 5.4132 4.75949 4.46078 6.18477C3.50836 7.61005 3 9.28577 3 11C3 12.7142 3.50836 14.3899 4.46078 15.8152C5.4132 17.2405 6.7669 18.3513 8.35068 19.0072C9.93446 19.6631 11.6772 19.8345 13.3584 19.4999C15.0397 19.1653 16.5839 18.3396 17.7959 17.1273C19.7189 15.3833 21.3129 13.3079 22.5019 11C23.6908 8.6921 25.2848 6.61666 27.2079 4.87265C28.4198 3.66033 29.9641 2.83465 31.6453 2.50004C33.3265 2.16542 35.0692 2.33689 36.653 2.99278C38.2368 3.64866 39.5905 4.75949 40.5429 6.18477C41.4953 7.61005 42.0037 9.28577 42.0037 11C42.0037 12.7142 41.4953 14.3899 40.5429 15.8152C39.5905 17.2405 38.2368 18.3513 36.653 19.0072C35.0692 19.6631 33.3265 19.8345 31.6453 19.4999C29.9641 19.1653 28.4198 18.3396 27.2079 17.1273C25.2848 15.3833 23.6908 13.3079 22.5019 11C21.3129 8.6921 19.7189 6.61666 17.7959 4.87265"
								stroke="#969696"
								strokeWidth="4.33333"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	);
};

export default Footer;
