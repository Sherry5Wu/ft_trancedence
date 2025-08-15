import { LineGraph } from '../components/LineGraph';
import { BarGraph } from '../components/BarGraph';
import { PieGraph } from '../components/PieGraph';
import { UserStats } from '../pages/UserPage';
import { ScoreHistory } from '../pages/UserPage';

export const Stats = ({ userStats, scoreHistory }: { userStats: UserStats, scoreHistory: ScoreHistory[]}) => {

  console.log('Userstats: ');
  console.log(userStats);
  console.log('Score history: ')
  console.log(scoreHistory);

  if (!userStats || !scoreHistory)
    return <div className='flex justify-center my-5'>No data</div>

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