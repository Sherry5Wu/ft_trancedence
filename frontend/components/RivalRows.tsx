import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RivalData } from '../utils/Interfaces';
import { useUserContext } from '../context/UserContext';
import SortIcon from '../assets/noun-sort-7000784.svg?react';
import TrashIcon from '../assets/noun-trash-3552649.svg?react'
import { useTranslation } from 'react-i18next';
import { fetchRivalData } from '../utils/Fetch';

const calculateWinRatio = (wins: number | undefined, losses: number | undefined, games_played_against_rival: number | undefined) => {
	if (wins === undefined || losses === undefined || games_played_against_rival === undefined)
		return 0;
	if (games_played_against_rival === 0)
		return 0;
	return (wins / wins + losses) * 100;
}

export const RivalRows = () => {
	const { t } = useTranslation();
	const { user } = useUserContext();
  	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [rivalData, setRivalData] = useState<RivalData[]>([]);

	if (!user)
		return ;

	useEffect(() => {
		const loadRivals = async () => {
			setLoading(true);
			const data = await fetchRivalData(user?.username);
			setRivalData(data);
			setLoading(false);
		}
		loadRivals();
	}, [user])
    
	if (rivalData.length == 0)
    	return <div className='flex justify-center'>{t('components.rivalRows.noRivals')}</div>;

	if (loading)
		return <div className='flex justify-center'>{t('components.rivalRows.loadingRivals')}</div>;

    return (
        <div aria-label='rivals data' className=''>
            <div aria-label='rivals data categories' className='grid grid-cols-12 mb-1 text-center font-semibold'>
                <span className=''></span>
                <span className='col-span-2'>{t('components.rivalRows.name')}</span>
                <span className='col-span-2'>{t('components.rivalRows.score')}</span>
                <span className='col-span-2'>{t('components.rivalRows.winRatio')}</span>
                <span className='col-span-3'>{t('components.rivalRows.userRivalWinsLosses')}</span>
                <span className='col-span-2'>{t('components.rivalRows.matchesPlayed')}</span>
            </div>

            <ul>
            {rivalData.map((rival, index: number) => {
				const winratio = calculateWinRatio(rival.wins_against_rival, rival.loss_against_rival, rival.games_played_against_rival);
                return (
					<div key={index} className='flex items-center transition ease-in-out duration-300 hover:scale-105 hover:cursor-pointer'>
						<li className='grid grid-cols-12 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center'
								onClick={() => navigate(`/user/${rival.rival_username}`)}>
							<span></span>{/* <img src={rival.picture} className='profilePicSmall'/> */}
							<span className='col-span-2'>{rival.rival_username}</span>
							<span className='col-span-2'>{rival.rival_elo_score}</span>
							<span className={`col-span-2 ${winratio >= 50 ? winratio === 50 ? 'text-black' : 'text-[#2E6F40]' : 'text-[#CD1C18]'}`}>{winratio}%</span>
							<span className='col-span-3'>{rival.wins_against_rival} / {rival.loss_against_rival}</span>
							<span className='col-span-2'>{rival.games_played_against_rival}</span>
						</li>
						{/* <div className='size-8 -translate-y-1 translate-x-2'>
							< TrashIcon />
						</div> */}
					</div>
				)
                })
            }
            </ul>
            <div className='flex justify-end mt-5'>
              {/* <button className='flex items-center h-8 w-55 bg-[#FFEE8C] rounded-full border-2 border-transparent 
                                hover:border-black transition ease-in-out duration-300  hover:cursor-pointer'> */}
                  {/* <SortIcon className='size-7 ml-2' /> */}
                  {/* <DropDownButton aria-label='sorting options' label='Sort rivals' options={rivalsSortingItems} onSelect={handleSortSelection}
                        className='overflow-hidden gap-3 border-(p3 border-transparent hover:border-black transition ease-in-out duration-200' /> */}
              {/* </button> */}
          </div>
        </div>
    )
}