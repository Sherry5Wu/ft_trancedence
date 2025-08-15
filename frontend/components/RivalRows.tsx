import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SortIcon from '../assets/noun-sort-7000784.svg?react';
// import { Menu } from './Menu.tsx'
// import { DropDownButton } from './DropDownButton.tsx';
import { useUserContext } from '../context/UserContext';
import TrashIcon from '../assets/noun-trash-3552649.svg?react'

interface RivalData {
	name: string,
	score: number,
	winratio: number,
	matches: number,
	wins: number, 
	losses: number,
	//picture: '../assets/profilepics/B2.png'
}

const fetchRivalData = async () => {
	const { user } = useUserContext();

	if (!user)
		return [];
 
	try {
		const promises = user.rivals.map(async (rivalName) => {
			const response = await fetch(`https://localhost:8443/as/auth/login/${rivalName}`, { //FIX LATER
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				},
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			return response.json();
		})

		const rivalDataArray = await Promise.all(promises);
		return rivalDataArray.sort(); //sort alphabetically
	}
	catch (error) {
		console.error('Error:', error);
		return null;
    }

  // let rivalData =[
  //   {
  //     name: 'Alice',
  //     score: 1920,
  //     winratio: 66,
  //     matches: 9,
  //     wins: 6, 
  //     losses: 3,
  //     picture: '../assets/profilepics/B2.png'
  //   },
  //   {
  //     name: 'Charles',
  //     score: 816,
  //     winratio: 13,
  //     matches: 8,
  //     wins: 1,
  //     losses: 7,
  //     picture: '../assets/profilepics/image.jpg'
  //   },
  //   {
  //     name: 'David123',
  //     score: 640,
  //     winratio: 50,
  //     matches: 6,
  //     wins: 3,
  //     losses: 3,
  //     picture: '../assets/profilepics/Bandit.png'
  //   },
  //   {
  //     name: 'Eve',
  //     score: 2048,
  //     winratio: 100,
  //     matches: 4,
  //     wins: 4,
  //     losses: 0,
  //     picture: '../assets/profilepics/paddington-poster.jpg'
  //   }
  // ]
  // return rivalData;
}

// const rivalsSortingItems = [
//   'Most matches played',
//   'Most wins',
//   'Most losses',
//   'Win ratio',
//   'Score',
//   'Rank'
// ];

// const handleSortSelection = () => {

// }

export const RivalRows = () => {
	const { user } = useUserContext();
  const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [rivalData, setRivalData] = useState([]);

	useEffect(() => {
		const loadRivals = async () => {
			setLoading(true);
			const data = await fetchRivalData();
			setRivalData(data);
			setLoading(false);
		}
		loadRivals();
	}, [user])

	if (loading)
		return <div className='flex justify-center'>Loading rivals...</div>;

	if (!rivalData)
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

    // return (
    //     <div aria-label='rivals data' className=''>
    //         <div aria-label='rivals data categories' className='grid grid-cols-9 mb-1 text-center font-semibold'>
    //             <span className=''></span>
    //             <span className='col-span-2'>Name</span>
    //             <span className='col-span-2'>Score</span>
    //             <span className='col-span-2'>Win ratio</span>
    //             <span className='col-span-2'>Matches played against</span>
    //         </div>

    //         <ul>
    //         {rivalData.map((rival, index: number) => {
    //             return <li className='grid grid-cols-9 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center transition ease-in-out duration-300 hover:scale-105'>
    //             <img src={rival.picture} className='profilePicSmall'/>
    //             <span className='col-span-2'>{rival.name}</span>
    //             <span className='col-span-2'>{rival.score}</span>
    //             <span className={`col-span-2 ${rival.winratio >= 50 ? rival.winratio === 50 ? 'text-black' : 'text-[#2E6F40]' : 'text-[#CD1C18]'}`}>{rival.winratio}%</span>
    //             <span className='col-span-2'>{rival.matches}</span>
    //             </li>
    //             })
    //         }
    //         </ul>
    //     </div>