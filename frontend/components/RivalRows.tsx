import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SortIcon from '../assets/noun-sort-7000784.svg?react';
import { Menu } from './Menu.tsx'
import { DropDownButton } from './DropDownButton.tsx';
import { userContext, useUserContext } from '../context/UserContext';

const fetchRivalData = async () => {
	const { user } = useUserContext();
	let rivalDataArray: any[] = [];
 
	try {
		for (let i = 0; user?.rivals.at(i); i++) {
			const response = await fetch(`http://localhost:8443/as/auth/login/${user.rivals.at(i)}`, { //FIX LATER
				method: 'GET',
				headers: {
				'Content-Type': 'application/json',
				},
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			rivalDataArray.push(data);
		}
	}
	catch (error) {
		console.error('Error:', error);
		return null;
    }

	return rivalDataArray.sort(); //alphabetically

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

  	if (!user?.rivals)
      return (
        <div className='flex justify-center'>No rivals yet</div>
    )
	
    const rivalData = fetchRivalData();

    return (
        <div aria-label='rivals data' className='z-10'>
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
                  <li 
                      className='grid grid-cols-12 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center transition ease-in-out duration-300 hover:scale-105 hover:cursor-pointer'
                      onClick={() => navigate(`/user/${rival.name}`)}>
                <img src={rival.picture} className='profilePicSmall'/>
                <span className='col-span-2'>{rival.name}</span>
                <span className='col-span-2'>{rival.score}</span>
                <span className={`col-span-2 ${rival.winratio >= 50 ? rival.winratio === 50 ? 'text-black' : 'text-[#2E6F40]' : 'text-[#CD1C18]'}`}>{rival.winratio}%</span>
                <span className='col-span-3'>{rival.wins} / {rival.losses}</span>
                <span className='col-span-2'>{rival.matches}</span>
                </li>)
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