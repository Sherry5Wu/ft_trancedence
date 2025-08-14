import { LineGraph } from '../components/LineGraph';
import { BarGraph } from '../components/BarGraph';
import { PieGraph } from '../components/PieGraph';
import { ReactElement, useEffect, useState } from 'react';

export interface UserStats {
    games_played: number;
    win_streak: number;
    longest_win_streak: number;
    worstRival: string;
    games_draw: number;
    games_lost: number;
    games_won: number;
    // worstRivalPic: string;
}

export interface ScoreHistory {
    id: number,
    elo_score: number,
}

const fetchScoreHistory = async (userID: string): Promise<ScoreHistory[] | null>  => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    // const data = [
    //     {key: 0, value: 100},
    //     {key: 1, value: 85},
    //     {key: 2, value: 60},
    //     {key: 3, value: 45},
    //     {key: 4, value: 55},
    //     {key: 5, value: 70},
    //     {key: 6, value: 30}
    // ];

    try {
        const response = await fetch(`https://localhost:8443/stats/score_history/${userID}`, {
        method: 'GET'
    });
    if (!response.ok)
      throw new Error(`HTTP error! Status: ${response.status}`);
  
    const data: ScoreHistory[] = await response.json();
    
    // Mapataan ja muokataan API-vastauksesta oikea muoto
    const filteredData: ScoreHistory[] = data.map(item => ({
        id: item.id,
        elo_score: item.elo_score,  // Jos API:sta puuttuu tämä kenttä, se voidaan jättää pois
    }));
    console.log('from fetchScoreHistory ');
    console.log(filteredData);
    return filteredData;
  }

  catch (error) {
    console.error('Error: ', error);
    return null;
  }
};

const fetchUserStats = async (userID: string): Promise<UserStats | null> => {

  try {
    const response = await fetch(`https://localhost:8443/stats/user_match_data/${userID}`, {
      method: 'GET'
    });

    console.log(userID);
    if (!response.ok)
      throw new Error(`HTTP error! Status: ${response.status}`);

    const userStats: UserStats = await response.json();
    console.log(userStats);
    return userStats;
  }

  catch (error) {
    console.error('Error: ', error);
    return null;
  }
  
    //mockdata
    // let userStats = 
    // {
    //     playedGames: 77,
    //     winStreak: 1,
    //     longestWinStreak: 3,
    //     worstRival: 'Alice',
    //     worstRivalPic: <img src='../assets/profilepics/B2.png' className='profilePic mt-1'/>
    // }
    // return userStats;
}

interface StatsProps {
  user: string | undefined;
}

export const Stats = ({ user }: StatsProps) => 
{
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchUserStats(user).then((data) => {
      setUserStats(data);
    });
    fetchScoreHistory(user).then((data) => {
      setScoreHistory(data);
      setLoading(false);
    })
  }, [user]);

  if (loading)
    return <div className='flex justify-center my-5'>Loading...</div>

  if (!userStats)
    return <div className='flex justify-center my-5'>No data available</div>

  // const userStats = fetchUserStats(userID);

  // if (Object.keys(userStats).length === 0)
  //   return (
  //     <div className='flex justify-center my-5'>
  //       No data available
  //     </div>)
  return (

      <div className='grid grid-cols-2 w-full scale-90 auto-rows-fr mb-10'>

          <div>
              <h4 className='h4 text-center font-semibold'>SCORE HISTORY</h4>
              <LineGraph data={scoreHistory}/>
          </div>

          <div>
              <h4 className='h4 text-center font-semibold'>SCORE GAINS/LOSSES</h4>
              <BarGraph data={scoreHistory}/>
          </div>

          <div className=''>
              <h4 className='h4 text-center mb-5 font-semibold'>WIN RATE</h4>
              <PieGraph data={userStats}/>
          </div> 

          <div className='grid grid-cols-2 scale-90 translate-y-[20px]'>

            <div className='flex flex-col items-center'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{userStats.games_played}</div>
              </div>
              <h4 className='h4 my-2 font-semibold'>PLAYED GAMES</h4>
            </div>

            <div className='flex flex-col items-center'>
              <button className='group relative flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center}'>
                <div className='absolute text-3xl -top-12 left-1/2 -translate-x-1/2 text-black opacity-0 
                                group-hover:opacity-100 transition-opacity ease-in-out'>{userStats.worstRival}</div>
                <img src={userStats.worstRivalPic} className='profilePic mt-1' />
              </button>
              <h4 className='h4 my-2 font-semibold'>WORST RIVAL</h4>
            </div>

            <div className='flex flex-col items-center translate-y-[30px]'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{userStats.win_streak}</div>
              </div>
              <h4 className='h4 my-2 font-semibold'>WIN STREAK</h4>
            </div>

            <div className='flex flex-col items-center translate-y-[30px]'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{userStats.longest_win_streak}</div>
              </div>
              <h4 className='h4 my-2 font-semibold text-center'>LONGEST WIN STREAK</h4>
            </div>

          </div>
      </div>
  );
}