import { LineGraph } from '../components/LineGraph';
import { BarGraph } from '../components/BarGraph';
import { PieGraph } from '../components/PieGraph';
import { UserStats, ScoreHistory } from '../utils/Interfaces'
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import { DEFAULT_AVATAR } from '../utils/constants';
import { fetchUsers, fetchRivalData } from '../utils/Fetch';
import { useRequestNewToken } from '../utils/Hooks';
import { FetchedUserData } from '../utils/Interfaces';
import { useParams } from 'react-router-dom';

export const Stats = ({ userStats, scoreHistory }: { userStats: UserStats, scoreHistory: ScoreHistory[]}) => {
    const { t } = useTranslation();
    const [worstRivalPic, setWorstRivalPic] = useState(DEFAULT_AVATAR);
    const [worstRivalName, setWorstRivalName] = useState('');
    const param = useParams();
    const { user } = useUserContext();
	const requestNewToken = useRequestNewToken();

    if (!userStats || !scoreHistory || userStats.games_played === 0 || scoreHistory.length == 0)
        return <div className='flex justify-center my-5'>{t('components.stats.noData')}</div>

    useEffect(() => {
        const findWorstRival = async () => {
            let mostMatches = -1;
            let rivalName = '';
            let rivalPicURL = null;
			const token = await requestNewToken();
			if (!user || !token)
				return ;
            const rivalData = await fetchRivalData(param.username!);
            if (user && user.rivals.length > 0)
            {
                for (const rival of rivalData)
                {
                    if (rival.games_played_against_rival! > mostMatches)
                    {
                        mostMatches = rival.games_played_against_rival!;
                        rivalName = rival.rival_username;
                    }
                }
                const users = await fetchUsers(token);
                rivalPicURL = users.find((u: FetchedUserData) => u.username === rivalName)?.avatarUrl;
                
                setWorstRivalName(rivalName);
                if (rivalPicURL)
                    setWorstRivalPic(rivalPicURL);
                else
                    setWorstRivalPic(DEFAULT_AVATAR);
            }

        }
        findWorstRival();
    }, [user!.rivals]);

	return (
      <div className='grid grid-cols-2 w-full scale-90 auto-rows-fr mb-10'>

        <div>
          <h4 className='h4 text-center font-semibold'>{t('components.stats.scoreHistory')}</h4>
          <LineGraph data={scoreHistory}/>
        </div>

        <div>
          <h4 className='h4 text-center font-semibold'>{t('components.stats.scoreGainsVsLosses')}</h4>
          <BarGraph data={scoreHistory}/>
        </div>

        <div className=''>
          <h4 className='h4 text-center mb-5 font-semibold'>{t('components.stats.winRate')}</h4>
          <PieGraph data={userStats}/>
        </div> 

        <div className='grid grid-cols-2 scale-90 translate-y-[20px]'>

          <div className='flex flex-col items-center'>
            <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
              <div className='text-5xl font-bold text-black'>{userStats.games_played}</div>
            </div>
            <h4 className='h4 my-2 font-semibold'>{t('components.stats.playedGames')}</h4>
          </div>

        {user?.username === param.username && user?.rivals.length > 0? 
            <div className='flex flex-col items-center'>
            <button className='group relative flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center}'>
              <div className='absolute text-2xl -top-12 left-1/2 -translate-x-1/2 text-black opacity-0 translate-y-2
                              group-hover:opacity-100 group-hover:translate-y-1 transition ease-in-out duration-300'>{worstRivalName}</div>
              <img src={worstRivalPic} className='profilePic !border-0' />
            </button>
            <h4 className='h4 my-2 font-semibold'>{t('components.stats.worstRival')}</h4>
          </div>
            :
            <div>

            </div> 
        }

          <div className='flex flex-col items-center translate-y-[30px]'>
            <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
              <div className='text-5xl font-bold text-black'>{userStats.win_streak}</div>
            </div>
            <h4 className='h4 my-2 font-semibold'>{t('components.stats.winStreak')}</h4>
          </div>

          <div className='flex flex-col items-center translate-y-[30px]'>
            <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
              <div className='text-5xl font-bold text-black'>{userStats.longest_win_streak}</div>
            </div>
            <h4 className='h4 my-2 font-semibold text-center'>{t('components.stats.longestWinStreak')}</h4>
          </div>

        </div>
      </div>
  );
}