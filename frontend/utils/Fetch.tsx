import { MatchData } from "../components/MatchHistory";
import { ScoreHistory } from "../pages/UserPage";
import { UserStats } from "../pages/UserPage";
import { useUserContext } from '../context/UserContext';

export const addRival = async (accessToken: string, rivalName: string) => {
	const data = {
		rival_username: rivalName
	};

	console.log(accessToken);

	try {
		const response = await fetch(`https://localhost:8443/stats/rivals/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": `Bearer ${accessToken}`,
			},
			body: JSON.stringify(data),
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		return response.json();

	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
}

export const removeRival = async (userID: string) => {
	try {
		const response = await fetch(`https://localhost:8443/stats/rivals/username/${userID}`, { //FIX PATH
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		return response.json();
	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
}

export const fetchScoreHistory = async (userID: string): Promise<ScoreHistory[] | null>  => {
	try {
		const response = await fetch(`https://localhost:8443/stats/score_history/username/${userID}`, {
			method: 'GET'
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();

		const filteredData: ScoreHistory[] = data.map((item: ScoreHistory) => ({
			id: item.id,
			elo_score: item.elo_score,
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

export const fetchUserStats = async (userID: string): Promise<UserStats | null> => {
	try {
		const response = await fetch(`https://localhost:8443/stats/user_match_data/username/${userID}`, {
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
}

export const postMatchData = async (accessToken: string) => {

    console.log(accessToken);
    const matchData: MatchData = 
        {
            player_name: 'User',
            player_username: 'user alias',
            played_at: new Date('2025-07-13 18:08').toLocaleString('en-GB'),
            duration: 300,
            player_score: 2,
            opponent_score: 5,
            opponent_id: '1',
            opponent_name: 'Rival1',
            opponent_username: "opponentusername",
            result: 'loss',
        }

    try {
        const response = await fetch(`https://localhost:8443/stats/match_history/`, {
        method: 'POST',
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        return await response.json();
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};

export const getMatchData = async (userID: string): Promise<MatchData | null> => {
    try {
        const response = await fetch(`https://localhost:8443/stats/match_history/${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        const matchData = await response.json();
        return matchData;
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};

export const fetchUsers = async () => {
      const rivalData = ['B2', 'Coco', 'Winston', 'B3', 'Frank', 'Snickers', 'Rad', 'Bluey', 'Chili', 'Cornelius'];
      return rivalData.sort();
     
      try {
          const response = await fetch(`https://localhost:8443/stats/user_match_data`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
            const userDataArray = await response.json();
            const filteredUserDataArray = userDataArray.map((username: MatchData) => {
              return username.player_name;
            })
            return filteredUserDataArray.sort();
        }
      
      catch (error) {
        console.error('Error:', error);
        return null;
        }
    }