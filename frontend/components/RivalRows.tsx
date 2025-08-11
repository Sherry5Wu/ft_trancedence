import { useState } from 'react';
import SortIcon from '../assets/noun-sort-7000784.svg?react';
import { Menu } from './Menu.tsx'
import { DropDownButton } from './DropDownButton.tsx';

const fetchRivalData = () => {
  let rivalData = [
    {
      name: 'Alice',
      score: 1920,
      winratio: 66,
      matches: 9,
      wins: 6, 
      losses: 3,
      picture: '../assets/profilepics/B2.png'
    },
    {
      name: 'Charles',
      score: 816,
      winratio: 13,
      matches: 8,
      wins: 1,
      losses: 7,
      picture: '../assets/profilepics/Coco.png'
    },
    {
      name: 'David123',
      score: 640,
      winratio: 50,
      matches: 6,
      wins: 3,
      losses: 3,
      picture: '../assets/profilepics/Snickers.png'
    },
    {
      name: 'Eve',
      score: 2048,
      winratio: 100,
      matches: 4,
      wins: 4,
      losses: 0,
      picture: '../assets/profilepics/Winton.png'
    }
  ]

  return rivalData;
}

const rivalsSortingItems = [
  'Most matches played',
  'Most wins',
  'Most losses',
  'Win ratio',
  'Score',
  'Rank'
];

const handleSortSelection = () => {

}


          
export const RivalRows = () => {
    const rivalData = fetchRivalData();

    if (rivalData.length === 0)
      return (
        <div className='flex justify-center'>No rivals yet</div>
      )

    return (
        <div aria-label='rivals data' className=''>
            <div aria-label='rivals data categories' className='grid grid-cols-9 mb-1 text-center font-semibold'>
                <span className=''></span>
                <span className='col-span-2'>Name</span>
                <span className='col-span-2'>Score</span>
                <span className='col-span-2'>Win ratio</span>
                <span className='col-span-2'>Matches played against</span>
            </div>

            <ul>
            {rivalData.map((rival, index: number) => {
                return <li className='grid grid-cols-9 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center transition ease-in-out duration-300 hover:scale-105'>
                <img src={rival.picture} className='profilePicSmall'/>
                <span className='col-span-2'>{rival.name}</span>
                <span className='col-span-2'>{rival.score}</span>
                <span className={`col-span-2 ${rival.winratio >= 50 ? rival.winratio === 50 ? 'text-black' : 'text-[#2E6F40]' : 'text-[#CD1C18]'}`}>{rival.winratio}%</span>
                <span className='col-span-2'>{rival.matches}</span>
                </li>
                })
            }
            </ul>
            <div className='flex justify-end mt-5'>
              {/* <button className='flex items-center h-8 w-55 bg-[#FFEE8C] rounded-full border-2 border-transparent 
                                hover:border-black transition ease-in-out duration-300  hover:cursor-pointer'> */}
                  {/* <SortIcon className='size-7 ml-2' /> */}
                  <DropDownButton aria-label='sorting options' label='Sort rivals' options={rivalsSortingItems} onSelect={handleSortSelection}
                        className='overflow-hidden gap-3 border-3 border-transparent hover:border-black transition ease-in-out duration-200' />
              {/* </button> */}
          </div>
        </div>
    )
}





          //   <div className='flex justify-end mt-5'>
          //     <button className='flex items-center h-8 w-55 bg-[#FFEE8C] rounded-full border-2 border-transparent 
          //                       hover:border-black transition ease-in-out duration-300  hover:cursor-pointer'>
          //         {/* <SortIcon className='size-7 ml-2' /> */}
          //         <Menu aria-label='sorting options' Icon={<SortIcon />} label={rivalsSortingItems[1].label} elements={rivalsSortingItems} sort={true}
          //               className='flex flex-1 items-center ml-3 overflow-hidden gap-3 hover:cursor-pointer' />
          //     </button>
          // </div>

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