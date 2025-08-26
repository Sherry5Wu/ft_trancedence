import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RivalData, FetchedUserData } from '../utils/Interfaces';
import { useUserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { fetchUsers } from '../utils/Fetch';
import { useRequestNewToken } from '../utils/Hooks';
import { DEFAULT_AVATAR } from '../utils/constants';

const calculateWinRatio = (wins: number | undefined, losses: number | undefined, games_played_against_rival: number | undefined) => {
	if (wins === undefined || losses === undefined || games_played_against_rival === undefined)
		return 0;
	if (games_played_against_rival === 0)
		return 0;
	return (wins / (wins + losses)) * 100;
}

const useRivalPic = (rivalName: string) => {
	const { user } = useUserContext();
	const [rivalPic, setRivalPic] = useState('');
	const requestNewToken = useRequestNewToken();

	useEffect(() => {
		const loadRivalPic = async () => {
			const token = await requestNewToken();
			if (!user || !token)
				return ;
			const allUsers = await fetchUsers(token);
			if (!allUsers)
				return ;
			const rival = allUsers.find((u: FetchedUserData) => u.username === rivalName);
			if (rival)
				setRivalPic(rival.avatarUrl);
		}
		loadRivalPic();
	}, [user, rivalName])

	console.log('rival url = ', rivalPic);

	if (rivalPic)
		return rivalPic;
	else
		return DEFAULT_AVATAR;
}

export const RivalRow = ({ rivalData }: { rivalData: RivalData }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const winratio = calculateWinRatio(rivalData.wins_against_rival, rivalData.loss_against_rival, rivalData.games_played_against_rival);
	const rivalPic = useRivalPic(rivalData.rival_username);

	return (
		<>
			<div className='grid grid-cols-12 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center 
							transition ease-in-out duration-300 hover:scale-105 hover:cursor-pointer'
					onClick={() => navigate(`/user/${rivalData.rival_username}`)}>
				<img src={rivalPic} className='profilePicSmall'/>
				<span className='col-span-2'>{rivalData.rival_username}</span>
				<span className='col-span-2'>{rivalData.rival_elo_score}</span>
				<span className={`col-span-2 ${winratio >= 50 ? winratio === 50 ? 'text-black' : 'text-[#2E6F40]' : 'text-[#CD1C18]'}`}>{winratio}%</span>
				<span className='col-span-3'>{rivalData.wins_against_rival} / {rivalData.loss_against_rival}</span>
				<span className='col-span-2'>{rivalData.games_played_against_rival}</span>
			</div>
			<div className='flex justify-end mt-2'>
				{/* <button className='flex items-center h-8 w-55 bg-[#FFEE8C] rounded-full border-2 border-transparent 
								hover:border-black transition ease-in-out duration-300  hover:cursor-pointer'> */}
					{/* <SortIcon className='size-7 ml-2' /> */}
					{/* <DropDownButton aria-label='sorting options' label='Sort rivals' options={rivalsSortingItems} onSelect={handleSortSelection}
						className='overflow-hidden gap-3 border-(p3 border-transparent hover:border-black transition ease-in-out duration-200' /> */}
				{/* </button> */}
			</div>
		</>
	)
}
