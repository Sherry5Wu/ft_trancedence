import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SortIcon from '../assets/noun-sort-7000784.svg?react';
// import { Menu } from './Menu.tsx'
// import { DropDownButton } from './DropDownButton.tsx';
import { useUserContext } from '../context/UserContext';
import TrashIcon from '../assets/noun-trash-3552649.svg?react'

interface RivalData {
	rival_username: string,
	rival_elo_score?: number,
	games_played_against_rival?: number,
	wins_against_rival?: number, 
	losses_against_rival?: number,
	//picture: '../assets/profilepics/B2.png'
}

const fetchRivalData = async (username: string) => {
	try {
    const rivals = await fetch(`https://localhost:8443/stats/rivals/username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        });

    if (!rivals.ok) {
        throw new Error(`HTTP error! Status: ${rivals.status}`);
    }

    const rawData: string[] = await rivals.json();
    const rivalsData: RivalData[] = rawData.map(entry => ({ rival_username: entry }));
    console.log('RIVALSDATA: ')
    console.log(rivalsData);

    return rivalsData;
    
    
		// const promises = user.rivals.map(async () => {
		// 	const response = await fetch(`https://localhost:8443/stats/rivals/${user.id}`, {
		// 		method: 'GET',
		// 		headers: {
		// 		'Content-Type': 'application/json',
		// 		},
		// 	});
			
		// 	if (!response.ok) {
		// 		throw new Error(`HTTP error! Status: ${response.status}`);
		// 	}

		// 	return response.json();
		// })

		// const rivalDataArray = await Promise.all(promises);
		// return rivalDataArray.sort(); //sort alphabetically
	}

	catch (error) {
		console.error('Error:', error);
		return [];
  }
}

export const RivalRows = () => {
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

	if (loading)
		return <div className='flex justify-center'>Loading rivals...</div>;

	if (rivalData.length == 0)
    	return <div className='flex justify-center'>No rivals yet</div>;

    return (
        <div aria-label='rivals data' className=''>
            <div aria-label='rivals data categories' className='grid grid-cols-12 mb-1 text-center font-semibold'>
                <span className=''></span>
                <span className='col-span-2'>Name</span>
                <span className='col-span-2'>Score</span>
                <span className='col-span-2'>Win ratio</span>
                <span className='col-span-3'>Your wins/losses</span>
                <span className='col-span-2'>Matches played</span>
            </div>

            <ul>
            {rivalData.map((rival, index: number) => {
                return (
					<div className='flex items-center transition ease-in-out duration-300 hover:scale-105 hover:cursor-pointer'>
						<li 
							className='grid grid-cols-12 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center'
							onClick={() => navigate(`/user/${rival.name}`)}>
							<img src={rival.picture} className='profilePicSmall'/>
							<span className='col-span-2'>{rival.name}</span>
							<span className='col-span-2'>{rival.score}</span>
							<span className={`col-span-2 ${rival.winratio >= 50 ? rival.winratio === 50 ? 'text-black' : 'text-[#2E6F40]' : 'text-[#CD1C18]'}`}>{rival.winratio}%</span>
							<span className='col-span-3'>{rival.wins} / {rival.losses}</span>
							<span className='col-span-2'>{rival.matches}</span>
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