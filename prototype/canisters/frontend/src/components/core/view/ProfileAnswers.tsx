import Profile from "./Profile";
import Answer from "./NumberOfAnswers";

const ProfileAnswers = ({ name, answers, avatar }: any) => {
	return (
		<div className="flex items-center gap-5 w-max">
			<Profile name={name} avatar={avatar} />
			<Answer answers={answers} />
		</div>
	);
};

export default ProfileAnswers;
