// pages/Rivals/Rivals.tsx

import RivalIcon from '../../assets/noun-battle-7526810.svg?react';
import { useState, useEffect } from 'react';
import { RivalData, FetchedUserData } from '../../utils/Interfaces';
import { useUserContext } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import { fetchRivalData, fetchUsers, fetchSpecificUser } from '../../utils/Fetch';
import { useRequestNewToken } from '../../utils/Hooks';
import { RivalRow } from '../../components/RivalRow';

const RivalsPage = () => {
    const { t } = useTranslation();
	const { user } = useUserContext();
	const [loading, setLoading] = useState(true);
	const [rivalData, setRivalData] = useState<RivalData[]>([]);
	const requestNewToken = useRequestNewToken();

	useEffect(() => {
		const loadRivals = async () => {
			setLoading(true);
			console.log("FETCHING TOKEN");
			const token = await requestNewToken();
			if (!user || !token)
				return ;
			console.log("FETCHING RIVALS");
			const rivalData = await fetchRivalData(user?.username);
			console.log("DONE");
			setRivalData(rivalData);
			console.log('RIVAL DATA', rivalData);
			setLoading(false);
		}
		loadRivals();
	}, [user])

	if (loading)
		return <div className='flex justify-center'>{t('components.rivalRows.loadingRivals')}</div>;

	if (rivalData.length == 0)
		return <div className='flex justify-center'>{t('components.rivalRows.noRivals')}</div>;

    return (
    	<div className='pageLayout'>
			<div className='flex justify-center items-center gap-3 mb-5'>
				<RivalIcon className='size-20' />
				<h2 className='h1 font-semibold text-center'>{t('pages.rival.title')}</h2>
				<RivalIcon className='size-20' />
			</div>
			<div aria-label='rivals data' className=''>
				<div aria-label='rivals data categories' className='grid grid-cols-12 mb-3 text-center font-semibold'>
					<span className=''></span>
					<span className='col-span-2'>{t('components.rivalRows.name')}</span>
					<span className='col-span-2'>{t('components.rivalRows.score')}</span>
					<span className='col-span-2'>{t('components.rivalRows.winRatio')}</span>
					<span className='col-span-3'>{t('components.rivalRows.userRivalWinsLosses')}</span>
					<span className='col-span-2'>{t('components.rivalRows.matchesPlayed')}</span>
				</div>
				<ul>
					{rivalData.map((rival, index: number) => (
						<li key={index}> 
							<RivalRow rivalData={rival} /> 
						</li>
					))}
				</ul>
			</div>
      </div>
    );
  };
  
  export default RivalsPage;
  