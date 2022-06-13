import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gql, sudograph } from "sudograph";
import StatusSelection from "./StatusSelection";
import { e3sToIcp, jsToGraphQlDate, toHHMM } from "../utils/conversions";
import { Navigate } from "react-router-dom";

type Status = { value: string; label: string };

type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
	[x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

const QuestionsList = ({ title, requireAuthentication, plug }: any) => {
	if (requireAuthentication) {
		if (!plug.isConnected) {
			return <Navigate to="/" replace />;
		}
	}

	const questionsPerPage: number = 10;
	const [questions, setQuestions] = useState<JSONArray>([]);
	const [orderField, setOrderField] = useState<string>("reward");
	const [orderIsAscending, setOrderIsAscending] = useState<boolean>(false);
	const [searchedText, setSearchedText] = useState<string>("");
	const [pageIndex, setPageIndex] = useState<number>(0);
	const [totalQuestions, setTotalQuestions] = useState<number>(0);
	const [statusMap, setStatusMap] = useState<Array<Status>>([
		{ value: "OPEN", label: "Open" },
	]);
	const [fetchQuestionsDate, setFetchQuestionsDate] = useState<number>(0);

	useEffect(() => {
		const interval = setInterval(() => {
			// Update the list of questions every 10 seconds if no interactions has triggered
			// the update in between
			if (Date.now() - fetchQuestionsDate > 10000) {
				fetchQuestions();
			}
		}, 1000);

		fetchQuestions();

		return () => clearInterval(interval);
	}, [orderField, orderIsAscending, searchedText, statusMap, pageIndex]);

	const refreshSearchedText = (event) => {
		setSearchedText(event.target.value);
		setPageIndex(0);
	};

	const refreshStatusMap = (map) => {
		// At least one status has to be selected
		if (map.length != 0) {
			setStatusMap(map);
			setPageIndex(0);
		}
	};

	const fetchQuestions = async () => {
		setFetchQuestionsDate(Date.now());

		let sudographActor = sudograph({
			canisterId: `${process.env.GRAPHQL_CANISTER_ID}`,
		});

		var queryInputs: string = "";
		// Add the ordering on a field (ascendant or descendant)
		queryInputs +=
			"order: {" +
			orderField +
			": " +
			(orderIsAscending ? "ASC" : "DESC") +
			"}";
		// Filter the search on key-words (currently hard-coded on question title and content)
		// and selected status
		queryInputs +=
			'search: {and: [{or: [{title: {contains: "' +
			searchedText +
			'"}}, {content: {contains: "' +
			searchedText +
			'"}}]}, {or: [';
		statusMap.map((status: Status, index: number) => {
			if (index != 0) {
				queryInputs += ", ";
			}
			queryInputs += '{status: {eq: "' + status.value + '"}}';
		});

		queryInputs += "]}";

		if (requireAuthentication) {
			queryInputs += `,{or: [{answers: {author: {eq:"${plug.plug.principalId}"}}}, {author: {eq: "${plug.plug.principalId}"}}]}`;
		}
		queryInputs += "]}";

		const allResults = await sudographActor.query(
			gql`
			query {
				readQuestion(` +
				queryInputs +
				`) {
					id
				}
			}
		`
		);

		setTotalQuestions(allResults.data.readQuestion.length);

		// Limit the number of questions per page
		queryInputs += "limit: " + questionsPerPage;
		// Offset from page index
		queryInputs += "offset: " + pageIndex * questionsPerPage;

		const pageResults = await sudographActor.query(
			gql`
			query {
				readQuestion(` +
				queryInputs +
				`) {
					id
					title
					answers {
						id
					}
					status
					reward
					status_end_date
				}
			}
		`
		);

		setQuestions(pageResults.data.readQuestion);
	};

	const getArrow = (field: string) => {
		return orderField === field ? (orderIsAscending ? "↑" : "↓") : "";
	};

	const getProgressColors = (status) => {
		switch (status) {
			case "OPEN":
				return [
					"bg-blue-800",
					"bg-gray-200",
					"bg-gray-200",
					"bg-gray-200",
					"bg-gray-200",
				];
			case "PICKANSWER":
				return [
					"bg-green-700",
					"bg-green-700",
					"bg-gray-200",
					"bg-gray-200",
					"bg-gray-200",
				];
			case "DISPUTABLE":
				return [
					"bg-yellow-400",
					"bg-yellow-400",
					"bg-yellow-400",
					"bg-gray-200",
					"bg-gray-200",
				];
			case "DISPUTED":
				return [
					"bg-orange-600",
					"bg-orange-600",
					"bg-orange-600",
					"bg-orange-600",
					"bg-gray-200",
				];
			case "CLOSED":
				return [
					"bg-purple-800",
					"bg-purple-800",
					"bg-purple-800",
					"bg-purple-800",
					"bg-purple-800",
				];
		}
	};

	return (
		<>
			<h1 className="page-title"> {title} </h1>

			{/* SEARCH & STATUS */}
			<div className="flex justify-between">
				{/* SEARCH */}
				<div className="relative mb-10 w-full mr-4">
					<svg
						className="w-5 h-5 text-gray-500 absolute inset-y-4 inset-x-2 "
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
					<input
						type="text"
						value={searchedText}
						onChange={refreshSearchedText}
						className="p-4 pl-10 w-full text-sm text-gray-900 bg-primary  focus:ring-blue-500 border-none"
						placeholder="Search questions..."
						required
					/>
				</div>

				{/* STATUS */}
				<div className="w-full ml-4">
					<StatusSelection onChange={refreshStatusMap} statusMap={statusMap} />
				</div>
			</div>

			{/* TABLE */}
			<div className="pl-10 pr-10 pt-10 bg-primary">
				<table className="w-full text-sm text-left text-gray-500 mt-4  bg-primary">
					<thead className=" text-gray-700 ">
						<tr className="h-20">
							<th scope="col" className="px-6 py-3 items-center">
								Question
							</th>
							<th scope="col" className="px-6 py-3 ">
								<div className="flex justify-center"> Answers</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex justify-center"> Status</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex justify-center">
									<button
										onClick={() => {
											setOrderField("reward");
											setOrderIsAscending(!orderIsAscending);
										}}
									>
										Reward {getArrow("reward")}
									</button>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex justify-center">
									<button
										onClick={() => {
											setOrderField("status_end_date");
											setOrderIsAscending(!orderIsAscending);
										}}
									>
										Timeleft {getArrow("status_end_date")}
									</button>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{questions.map((question: any) => {
							return (
								<tr className="hover:bg-secondary" key={question.id}>
									<th
										scope="row"
										className="px-6 py-6 font-medium text-gray-900 w-6/12"
									>
										<Link to={`/question/${question.id}`}>
											{question.title}
										</Link>
									</th>
									<td className="px-6 py-4 w-1/12">
										<div className="flex justify-center">
											{question.answers.length}{" "}
										</div>
									</td>
									<td className="px-6 py-4  w-2/12 ">
										<div className="flex flex-row  gap-0.5 h-4 w-full justify-center">
											<div
												className={`basis-5 h-1.5 ${
													getProgressColors(question.status)[0]
												} dark:${getProgressColors(question.status)[0]}`}
											/>
											<div
												className={`basis-5 h-1.5 ${
													getProgressColors(question.status)[1]
												} dark:${getProgressColors(question.status)[1]}`}
											/>
											<div
												className={`basis-5 h-1.5 ${
													getProgressColors(question.status)[2]
												} dark:${getProgressColors(question.status)[2]}`}
											/>
											<div
												className={`basis-5 h-1.5 ${
													getProgressColors(question.status)[3]
												} dark:${getProgressColors(question.status)[3]}`}
											/>
											<div
												className={`basis-5 h-1.5 ${
													getProgressColors(question.status)[4]
												} dark:${getProgressColors(question.status)[4]}`}
											/>
										</div>
									</td>
									<td className="px-6 py-4  w-1/12">
										<div className="flex justify-center">
											{e3sToIcp(Number(question.reward))}

											<div className="ml-1">ICP</div>
										</div>
									</td>
									<td className="px-6 py-4  w-2/12">
										<div className="flex justify-center">
											{toHHMM(
												question.status_end_date - jsToGraphQlDate(Date.now())
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* PAGINATION */}
			<div className="flex justify-center items-center pb-10 pt-10  bg-primary ">
				<div className="">
					{/* TEXT */}
					<div className="flex justify-center">
						<span>
							Showing{" "}
							<span>
								{totalQuestions == 0 ? 0 : pageIndex * questionsPerPage + 1}
							</span>{" "}
							to{" "}
							<span>
								{Math.min((pageIndex + 1) * questionsPerPage, totalQuestions)}
							</span>{" "}
							of <span className=" text-gray-900 ">{totalQuestions}</span>{" "}
							Entries
						</span>
					</div>
					{/* BUTTONS */}
					<div className="flex justify-between mt-4 xs:mt-0">
						<div>
							<button
								disabled={pageIndex < 1}
								onClick={() => {
									setPageIndex(pageIndex - 1);
								}}
								className="inline-flex my-button items-center bg-secondary hover:bg-primary"
							>
								<svg
									className="mr-2 w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
										clipRule="evenodd"
									></path>
								</svg>
								Prev
							</button>
						</div>
						<div>
							<button
								disabled={(pageIndex + 1) * questionsPerPage >= totalQuestions}
								onClick={() => {
									setPageIndex(pageIndex + 1);
								}}
								className="inline-flex my-button items-center bg-secondary hover:bg-primary"
							>
								Next
								<svg
									className="ml-2 w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fillRule="evenodd"
										d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
										clipRule="evenodd"
									></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default QuestionsList;
