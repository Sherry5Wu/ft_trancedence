import { LineGraph } from '../components/LineGraph';
import { BarGraph } from '../components/BarGraph';
import { PieGraph } from '../components/PieGraph';
import { ReactElement, useEffect, useState } from 'react';

interface UserStats {
    playedGames: number;
    winStreak: number;
    longestWinStreak: number;
    worstRival: string;
    worstRivalPic: string;
}

const fetchUserStats = async (userID: string): Promise<UserStats | null> => {

  try {
    const response = await fetch(`http://localhost:3001/stats/${userID}`);

    if (!response.ok)
      throw new Error(`HTTP error! Status: ${response.status}`);

    const userStats: UserStats = await response.json();
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


export const Stats = (userID: string) => 
{
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUserStats(userID).then((data) => {
      setUserStats(data);
      setLoading(false);
    });
  }, [userID]);

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
              <LineGraph user={user}/>
          </div>

          <div>
              <h4 className='h4 text-center font-semibold'>SCORE GAINS/LOSSES</h4>
              <BarGraph user={user}/>
          </div>

          <div className=''>
              <h4 className='h4 text-center mb-5 font-semibold'>WIN RATE</h4>
              <PieGraph user={user}/>
          </div> 

          <div className='grid grid-cols-2 scale-90 translate-y-[20px]'>

            <div className='flex flex-col items-center'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{userStats.playedGames}</div>
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
                <div className='text-5xl font-bold text-black'>{userStats.winStreak}</div>
              </div>
              <h4 className='h4 my-2 font-semibold'>WIN STREAK</h4>
            </div>

            <div className='flex flex-col items-center translate-y-[30px]'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{userStats.longestWinStreak}</div>
              </div>
              <h4 className='h4 my-2 font-semibold text-center'>LONGEST WIN STREAK</h4>
            </div>

          </div>
      </div>
  );
}