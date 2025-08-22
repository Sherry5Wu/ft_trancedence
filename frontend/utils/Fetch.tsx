import { MatchData, ScoreHistory, UserStats, UserProfileData, LoginData, RivalData, FetchedUserData } from "../utils/Interfaces";

export const createUser = async (player: UserProfileData): Promise<UserProfileData | null> => {
	// console.log('Sending user:', player);
	try {
		const response = await fetch('https://localhost:8443/as/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
		},
			body: JSON.stringify(player)
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		
		return await response.json();
	} 
	
	catch (error) {
		console.error('Error:', error);
		return null;
	}
};

export const signInUser = async (player: LoginData) => {
	try {
		// fetch for user data
		const response = await fetch('https://localhost:8443/as/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(player)
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		// fetch for user stats
		const statResponse = await fetch (`https://localhost:8443/stats/user_match_data/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		
		if (!statResponse.ok) {
		throw new Error(`HTTP error! Status: ${statResponse.status}`);
		}
		
		const stats = await statResponse.json();

		// fetch for user rivals
		const rivalResponse = await fetch (`https://localhost:8443/stats/rivals/${data.user.id}`, {
			method: 'GET',
			headers: {
			'Content-Type': 'application/json',
			},
		});
		
		if (!rivalResponse.ok) {
			throw new Error(`HTTP error! Status: ${rivalResponse.status}`);
		}
		
		const rivals = await rivalResponse.json();

		return {data, stats, rivals};
		}

	catch (error) {
		console.error('Error:', error);
		return null;
	}
};

export const updateProfilePic = async (file: File, accessToken: string) => {
	try {
		const formData = new FormData();
		formData.append('avatar', file);

		const response = await fetch('https://localhost:8443/as/users/me/upload-avatar', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			}, 
			body: formData,
		})

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();
		return data.avatarUrl;
	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const fetchRivalData = async (username: string) => {
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

		const data: RivalData[] = await rivals.json();
		console.log('RIVALSDATA: ')
		console.log(data);

		return data;
	}

	catch (error) {
		console.error('Error:', error);
		return [];
  }
};

export const addRival = async (rivalName: string, accessToken: string) => {
	const data = {
		rival_username: rivalName
	};

	// console.log("IN ADD_RIVAL:");
	// console.log(data);
	// console.log(accessToken);

	try {
		const response = await fetch(`https://localhost:8443/stats/rivals`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify(data),
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const responseData = await response.json();
		console.log(responseData);
		return responseData;

	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const removeRival = async (rivalName: string, accessToken: string) => {
	try {
		const response = await fetch(`https://localhost:8443/stats/rivals/username/${rivalName}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
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
};

export const fetchScoreHistory = async (username: string): Promise<ScoreHistory[] | null>  => {
	try {
		const response = await fetch(`https://localhost:8443/stats/score_history/username/${username}`, {
			method: 'GET'
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();

		const filteredData: ScoreHistory[] = data.map((item: ScoreHistory) => ({
			id: item.id,
			elo_score: item.elo_score,
		}));
		// console.log('from fetchScoreHistory ');
		// console.log(filteredData);
		return filteredData;
	}

	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const fetchUserStats = async (username: string): Promise<UserStats | null> => {
	try {
		const response = await fetch(`https://localhost:8443/stats/user_match_data/username/${username}`, {
		method: 'GET'
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const userStats: UserStats = await response.json();
		console.log('FETCH USER STATS: '); //REMOVE LATER
		console.log(userStats); //REMOVE LATER
		return userStats;
	}

	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const fetchMatchData = async (username: string): Promise<MatchData [] | null> => {
    try {
        const response = await fetch(`https://localhost:8443/stats/match_history/username/${username}`, {
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

export const fetchUsers = async (accessToken: string): Promise<FetchedUserData []> => {
    //   const rivalData = ['B2', 'Coco', 'Winston', 'B3', 'Frank', 'Snickers', 'Rad', 'Bluey', 'Chili', 'Cornelius'];
    //   return rivalData.sort();
	try {
		const response = await fetch(`https://localhost:8443/as/users/all`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": `Bearer ${accessToken}`,
			},
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const userDataArray = await response.json();
		return userDataArray.users.sort((a: any, b: any) => {
			a.username.localeCompare(b.username);
		}) ;
	}

	catch (error) {
		console.error('Error:', error);
		return [];
	}
};


export const disable2FA = async (accessToken?: string): Promise<boolean> => {
  if (!accessToken) return false;

  try {
    const response = await fetch('/api/user/disable-2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to disable 2FA: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
};