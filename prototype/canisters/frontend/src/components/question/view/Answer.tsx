import parse from "html-react-parser";
import Profile from "../../core/view/Profile";
import { graphQlToStrDate } from "../../core/services/utils/conversions";
import Date from "../../core/view/Date";

const Answer = ({
	content,
	date,
	authorName,
	avatar,
	effect = "normal",
	id,
}: any) => {
	const effectTemplate = {
		normal: "shadow-md",
		winner: "shadow-effect",
		hover: "shadow-md hover:shadow-effect",
	};

	return (
		<div
			className={`${effectTemplate[effect]} flex flex-col gap-[20px] py-[30px] pl-[35px] pr-[48px] shadow-md rounded-lg bg-colorBackgroundComponents  text-justify`}
			data-cy={`Answer-${id}`}
		>
			<div className="text-justify editor-wrapper">{parse(content)}</div>

			<div className="flex items-center self-stretch gap-[30px] px-[0px] py-[10px]">
				<Profile name={authorName} avatar={avatar} />
				<Date date={graphQlToStrDate(date)} />
			</div>
		</div>
	);
};

export default Answer;
