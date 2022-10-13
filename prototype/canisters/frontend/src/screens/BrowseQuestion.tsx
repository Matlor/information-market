import ListWrapper from "../components/core/view/ListWrapper";
import FilterBar from "../components/browseQuestion/view/FilterBar";
import QuestionPreview from "../components/browseQuestion/view/QuestionPreview";
import Pagination from "../components/browseQuestion/view/Pagination";

import { useState, useEffect } from "react";
import getQuestions from "../components/browseQuestion/services/getQuestions";

import sudograph from "../components/core/services/sudograph";
import { blobToBase64Str } from "../components/core/services/utils/conversions";

const BrowseQuestion = ({ userPrincipal, isConnected }: any) => {
	type Status = { value: string; label: string };
	type JSONValue = string | number | boolean | JSONObject | JSONArray;
	interface JSONObject {
		[x: string]: JSONValue;
	}
	interface JSONArray extends Array<JSONValue> {}

	const questionsPerPage: number = 10;
	const [orderField, setOrderField] = useState<string>("reward");
	const [orderIsAscending, setOrderIsAscending] = useState<boolean>(false);
	const [searchedText, setSearchedText] = useState<string>("");
	const [pageIndex, setPageIndex] = useState<number>(0);
	const [myInteractions, setMyInteractions] = useState<boolean>(false);
	const [statusMap, setStatusMap] = useState<Array<Status>>([
		{ value: "OPEN", label: "Open" },
		{ value: "PICKANSWER", label: "Winner Selection" },
		{ value: "DISPUTABLE", label: "Open for disputes" },
		{ value: "DISPUTED", label: "Arbitration" },
		{ value: "CLOSED", label: "Closed" },
	]);

	const [fetchQuestionsDate, setFetchQuestionsDate] = useState<number>(0);
	const [questions, setQuestions] = useState<JSONArray>([]);
	const [totalQuestions, setTotalQuestions] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);

	const [cachedAvatars, setCachedAvatars] = useState<any>(() => new Map());

	const loadAvatars = async (questions: any, cachedAvatars) => {
		try {
			for (var i = 0; i < questions.length; i++) {
				let question: any = questions[i];
				if (!cachedAvatars.has(question.author.id)) {
					const res = await sudograph.query_avatar(question.author.id);
					const loadedAvatar = await blobToBase64Str(
						res.data.readUser[0].avatar
					);
					setCachedAvatars(
						(prev: any) =>
							new Map([...prev, [question.author.id, loadedAvatar]])
					);
				}
			}
		} catch (error) {
			console.error("Failed to load avatars!");
		}
	};

	const fetch_data = async () => {
		setLoading(true);
		const result = await getQuestions(
			orderField,
			orderIsAscending,
			searchedText,
			statusMap,
			myInteractions,
			userPrincipal,
			questionsPerPage,
			pageIndex
		);
		await loadAvatars(result.questions, cachedAvatars);
		setFetchQuestionsDate(result.timestamp);
		setTotalQuestions(result.totalQuestions);
		setQuestions(result.questions);
		setLoading(false);
	};

	// Only needed because interval does not start directly
	useEffect(() => {
		fetch_data();
	}, [
		orderField,
		orderIsAscending,
		searchedText,
		statusMap,
		pageIndex,
		myInteractions,
	]);

	useEffect(() => {
		var interval = setInterval(async () => {
			if (Date.now() - fetchQuestionsDate > 10000) {
				fetch_data();
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [fetchQuestionsDate]);

	return (
		<>
			<ListWrapper>
				{" "}
				<FilterBar
					setSearchedText={setSearchedText}
					statusMap={statusMap}
					setStatusMap={setStatusMap}
					orderIsAscending={orderIsAscending}
					setOrderIsAscending={setOrderIsAscending}
					setOrderField={setOrderField}
					myInteractions={myInteractions}
					setMyInteractions={setMyInteractions}
					isConnected={isConnected}
				/>
				{loading ? (
					<></>
				) : totalQuestions === 0 ? (
					<></>
				) : (
					<>
						{questions.map((question: any, index) => (
							<QuestionPreview
								reward={question.reward}
								status={question.status}
								id={question.id}
								title={question.title}
								authorName={question.author.name}
								numAnswers={question.answers.length}
								date={question.date}
								avatar={cachedAvatars.get(question.author.id)}
								key={index}
							/>
						))}
					</>
				)}
			</ListWrapper>
			<Pagination
				pageIndex={pageIndex}
				setPageIndex={setPageIndex}
				totalQuestions={totalQuestions}
				questionsPerPage={questionsPerPage}
			/>
		</>
	);
};

export default BrowseQuestion;
